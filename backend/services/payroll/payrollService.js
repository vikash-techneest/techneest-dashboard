const path = require("path");
const fs = require("fs");
const Employee = require("../../models/Employee");
const SalaryStructure = require("../../models/SalaryStructure");
const Payroll = require("../../models/Payroll");
const Payslip = require("../../models/Payslip");
const AttendanceRegister = require("../../models/AttendanceRegister");
const Leave = require("../../models/Leave");
const Holiday = require("../../models/Holiday");
const { getOrCreateActivePolicy } = require("../attendance/attendanceService");
const { getMonthCalendarDetails } = require("../../utils/dateTime");
const { generatePayslipPdfBuffer } = require("../../utils/pdfGenerator");
const { sendEmail } = require("../email/emailService");
const { renderPayslipEmailTemplate } = require("../../templates/emailTemplates");
const { recordAuditLog } = require("../../utils/auditLogger");
const ApiError = require("../../utils/ApiError");

const MONTH_NAMES = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
];

/**
 * Decimal-safe monetary rounding to 2 decimal places (paise precision)
 */
const roundPaise = (amount) => {
  const num = Number(amount) || 0;
  return Math.round((num + Number.EPSILON) * 100) / 100;
};

/**
 * Pure, deterministic salary calculation function based on configurable policy, salary structure,
 * and approved attendance/leave metrics. Exported directly for unit testing.
 */
const calculateEmployeePayrollNumbers = ({
  salaryStructure,
  totalCalendarDays = 30,
  totalWorkingDays = 26,
  approvedPresentDays = 0,
  approvedHalfDays = 0,
  paidLeaveDays = 0,
  unpaidLeaveDays = 0,
  paidHolidays = 0,
  overtimeMinutes = 0,
  adjustmentsList = [],
}) => {
  const baseSalary = roundPaise(salaryStructure.baseSalary || 0);
  const salaryBasis = salaryStructure.salaryBasis || "WORKING_DAYS";

  const denominatorDays =
    salaryBasis === "CALENDAR_DAYS"
      ? Math.max(1, totalCalendarDays)
      : salaryBasis === "FIXED_30_DAYS"
        ? 30
        : Math.max(1, totalWorkingDays);

  // Calculate payable days from approved present days + (halfDays * 0.5) + paidLeaves + paidHolidays
  const rawPayableDays =
    Number(approvedPresentDays || 0) +
    Number(approvedHalfDays || 0) * 0.5 +
    Number(paidLeaveDays || 0) +
    Number(paidHolidays || 0);

  const payableDays = Math.min(
    denominatorDays,
    Math.max(0, roundPaise(rawPayableDays))
  );

  const unpaidAbsences = Math.max(
    0,
    roundPaise(denominatorDays - payableDays)
  );

  const prorationRatio = denominatorDays > 0 ? payableDays / denominatorDays : 0;

  // Component percentages
  const basicPercent = salaryStructure.basicPercent ?? 50;
  const hraPercent = salaryStructure.hraPercent ?? 25;
  const daPercent = salaryStructure.daPercent ?? 10;
  const specialAllowancePercent =
    salaryStructure.specialAllowancePercent ??
    Math.max(0, 100 - (basicPercent + hraPercent + daPercent));

  const fullBasic = roundPaise((baseSalary * basicPercent) / 100);
  const fullHra = roundPaise((baseSalary * hraPercent) / 100);
  const fullDa = roundPaise((baseSalary * daPercent) / 100);
  const fullSpecial = roundPaise(
    baseSalary - (fullBasic + fullHra + fullDa)
  );

  // Earned components prorated by approved payable days
  const basicEarned = roundPaise(fullBasic * prorationRatio);
  const hraEarned = roundPaise(fullHra * prorationRatio);
  const daEarned = roundPaise(fullDa * prorationRatio);
  const specialAllowanceEarned = roundPaise(fullSpecial * prorationRatio);

  const unpaidLeaveDeduction = roundPaise(
    Math.max(
      0,
      baseSalary -
        (basicEarned + hraEarned + daEarned + specialAllowanceEarned)
    )
  );

  // Overtime calculation
  const overtimeHours = roundPaise((Number(overtimeMinutes) || 0) / 60);
  let overtimePay = 0;
  if (salaryStructure.overtimeEligible !== false && overtimeHours > 0) {
    const hourlyRate = baseSalary / denominatorDays / 8;
    const multiplier = salaryStructure.overtimeHourlyMultiplier ?? 1.5;
    overtimePay = roundPaise(overtimeHours * hourlyRate * multiplier);
  }

  // Evaluate manual adjustments, bonuses, incentives, deductions
  let bonus = 0;
  let incentives = 0;
  let positiveAdjustments = 0;
  let otherDeductions = 0;

  const defaultAdj = roundPaise(salaryStructure.defaultMonthlyAdjustment || 0);
  if (defaultAdj > 0 && adjustmentsList.length === 0) {
    positiveAdjustments += defaultAdj;
  } else if (defaultAdj < 0 && adjustmentsList.length === 0) {
    otherDeductions += Math.abs(defaultAdj);
  }

  for (const adj of adjustmentsList) {
    const amt = roundPaise(adj.amount || 0);
    if (adj.type === "Bonus") {
      bonus = roundPaise(bonus + Math.abs(amt));
    } else if (adj.type === "Incentive") {
      incentives = roundPaise(incentives + Math.abs(amt));
    } else if (adj.type === "Deduction") {
      otherDeductions = roundPaise(otherDeductions + Math.abs(amt));
    } else {
      if (amt >= 0) {
        positiveAdjustments = roundPaise(positiveAdjustments + amt);
      } else {
        otherDeductions = roundPaise(otherDeductions + Math.abs(amt));
      }
    }
  }

  const grossEarned = roundPaise(
    basicEarned +
      hraEarned +
      daEarned +
      specialAllowanceEarned +
      overtimePay +
      bonus +
      incentives +
      positiveAdjustments
  );

  // Statutory Deductions configured by organization
  const pf = salaryStructure.pfEnabled
    ? roundPaise((basicEarned * (salaryStructure.pfRatePercent ?? 12)) / 100)
    : 0;

  const esi = salaryStructure.esiEnabled
    ? roundPaise((grossEarned * (salaryStructure.esiRatePercent ?? 0.75)) / 100)
    : 0;

  const professionalTax =
    payableDays > 0
      ? roundPaise(salaryStructure.professionalTaxAmount || 0)
      : 0;

  const tds =
    (salaryStructure.tdsRatePercent || 0) > 0
      ? roundPaise((grossEarned * salaryStructure.tdsRatePercent) / 100)
      : 0;

  const totalDeductions = roundPaise(
    pf + esi + professionalTax + tds + otherDeductions
  );

  const netAdjustment = roundPaise(
    overtimePay + bonus + incentives + positiveAdjustments - totalDeductions
  );

  // Net Payable rounded to nearest rupee (consistent INR rounding rule) with exact paise preserved in components
  const rawNetPayable = Math.max(0, roundPaise(grossEarned - totalDeductions));
  const netPayable = Math.round(rawNetPayable);

  return {
    attendanceBreakdown: {
      totalCalendarDays,
      totalWorkingDays: denominatorDays,
      approvedPresentDays,
      approvedHalfDays,
      paidLeaveDays,
      unpaidLeaveDays,
      paidHolidays,
      unpaidAbsences,
      payableDays,
      overtimeHours,
    },
    baseSalary,
    earnings: {
      basicEarned,
      hraEarned,
      daEarned,
      specialAllowanceEarned,
      overtimePay,
      bonus,
      incentives,
      positiveAdjustments,
      grossEarned,
    },
    deductions: {
      unpaidLeaveDeduction,
      pf,
      esi,
      professionalTax,
      tds,
      otherDeductions,
      totalDeductions,
    },
    netAdjustment,
    netPayable,
  };
};

/**
 * Ensures an employee has a SalaryStructure document
 */
const getOrCreateSalaryStructure = async (employeeDoc) => {
  let structure = await SalaryStructure.findOne({ employee: employeeDoc._id });
  if (!structure) {
    structure = await SalaryStructure.create({
      employee: employeeDoc._id,
      employeeId: employeeDoc.employeeId,
      baseSalary: employeeDoc.baseSalary || 0,
    });
  }
  return structure;
};

/**
 * Gathers approved attendance, approved leaves, and paid holidays for an employee in a given month/year
 */
const gatherApprovedAttendanceForMonth = async (employeeDoc, month, year) => {
  const policy = await getOrCreateActivePolicy();
  const monthKey = `${year}-${String(month).padStart(2, "0")}`;
  const calendarInfo = getMonthCalendarDetails(
    month,
    year,
    policy.weeklyOffDays || [0]
  );

  const overrideDays = policy.monthlyWorkingDaysOverride?.get
    ? policy.monthlyWorkingDaysOverride.get(monthKey)
    : policy.monthlyWorkingDaysOverride?.[monthKey];

  const totalWorkingDays =
    Number(overrideDays) || calendarInfo.standardWorkingDays || 26;

  // Query ONLY official AttendanceRegister (approved attendance)
  const registerEntries = await AttendanceRegister.find({
    employee: employeeDoc._id,
    month,
    year,
  });

  let approvedPresentDays = 0;
  let approvedHalfDays = 0;
  let overtimeMinutes = 0;

  for (const entry of registerEntries) {
    overtimeMinutes += Number(entry.overtimeMinutes || 0);
    if (entry.officialStatus === "Present" || entry.officialStatus === "Late") {
      approvedPresentDays += 1;
    } else if (entry.officialStatus === "Half Day") {
      approvedHalfDays += 1;
    }
  }

  // Query Approved Leaves falling within this month
  const monthStartStr = `${monthKey}-01`;
  const monthEndStr = `${monthKey}-${String(calendarInfo.totalCalendarDays).padStart(2, "0")}`;

  const approvedLeaves = await Leave.find({
    employee: employeeDoc._id,
    status: "Approved",
    startDate: { $lte: monthEndStr },
    endDate: { $gte: monthStartStr },
  });

  let paidLeaveDays = 0;
  let unpaidLeaveDays = 0;
  for (const lv of approvedLeaves) {
    if (lv.isPaid) {
      paidLeaveDays += Number(lv.totalDays || 0);
    } else {
      unpaidLeaveDays += Number(lv.totalDays || 0);
    }
  }

  // Query Paid Holidays in this month
  const holidays = await Holiday.find({
    month,
    year,
    isPaid: true,
  });
  const paidHolidays = holidays.length;

  return {
    totalCalendarDays: calendarInfo.totalCalendarDays,
    totalWorkingDays,
    approvedPresentDays,
    approvedHalfDays,
    paidLeaveDays,
    unpaidLeaveDays,
    paidHolidays,
    overtimeMinutes,
  };
};

/**
 * Generates or recalculates Draft Payroll for one or all active employees for a given month and year.
 * Prevents duplicate payroll records and forbids silent recalculation of Finalized payrolls.
 */
const generateOrRecalculatePayroll = async (
  adminDoc,
  { month, year, employeeIds = null },
  req
) => {
  const empFilter = { isDeleted: false, status: "Active" };
  if (Array.isArray(employeeIds) && employeeIds.length > 0) {
    empFilter.$or = [
      { _id: { $in: employeeIds.filter((id) => /^[0-9a-fA-F]{24}$/.test(id)) } },
      { employeeId: { $in: employeeIds.map((id) => String(id).toUpperCase().trim()) } },
    ];
  }

  const employees = await Employee.find(empFilter);
  const payPeriodLabel = `${MONTH_NAMES[month - 1]} ${year}`;
  const results = [];
  const skippedFinalized = [];

  for (const emp of employees) {
    const existingPayroll = await Payroll.findOne({
      employee: emp._id,
      month,
      year,
    });

    if (existingPayroll && existingPayroll.isImmutable) {
      skippedFinalized.push({
        employeeId: emp.employeeId,
        reason: "Payroll is already Finalized and immutable",
      });
      continue;
    }

    const salaryStructure = await getOrCreateSalaryStructure(emp);
    const attendanceMetrics = await gatherApprovedAttendanceForMonth(
      emp,
      month,
      year
    );

    const existingAdjustments = existingPayroll?.adjustmentsList || [];
    const calc = calculateEmployeePayrollNumbers({
      salaryStructure,
      ...attendanceMetrics,
      adjustmentsList: existingAdjustments,
    });

    const payrollDoc = await Payroll.findOneAndUpdate(
      { employee: emp._id, month, year },
      {
        $set: {
          employee: emp._id,
          employeeId: emp.employeeId,
          month,
          year,
          payPeriodLabel,
          attendanceBreakdown: calc.attendanceBreakdown,
          baseSalary: calc.baseSalary,
          earnings: calc.earnings,
          deductions: calc.deductions,
          netAdjustment: calc.netAdjustment,
          adjustmentsList: existingAdjustments,
          netPayable: calc.netPayable,
          workflowStatus:
            existingPayroll?.workflowStatus === "Approved"
              ? "Approved"
              : "Draft",
        },
      },
      { returnDocument: "after", upsert: true, runValidators: true }
    );

    results.push(payrollDoc);
  }

  await recordAuditLog({
    req,
    actorType: "Admin",
    actorId: adminDoc._id,
    actorEmail: adminDoc.email,
    action: "PAYROLL_CALCULATED",
    module: "PAYROLL",
    targetId: `${year}-${String(month).padStart(2, "0")}`,
    description: `Generated/recalculated payroll for ${results.length} employee(s) for ${payPeriodLabel}`,
  });

  return {
    payPeriodLabel,
    month,
    year,
    processedCount: results.length,
    skippedFinalized,
    payrolls: results,
  };
};

/**
 * Adds a salary adjustment (Bonus, Incentive, Deduction, etc.) and recalculates before finalization
 */
const addPayrollAdjustment = async (
  adminDoc,
  payrollId,
  { type, label, amount, reason = "" },
  req
) => {
  const payroll = await Payroll.findById(payrollId);
  if (!payroll) {
    throw new ApiError(404, "Payroll record not found");
  }

  if (payroll.isImmutable || payroll.workflowStatus === "Finalized") {
    throw new ApiError(
      400,
      "Cannot modify a Finalized payroll directly. Use the reversal workflow to make post-finalization adjustments."
    );
  }

  const emp = await Employee.findById(payroll.employee);
  const salaryStructure = await getOrCreateSalaryStructure(emp);
  const attendanceMetrics = await gatherApprovedAttendanceForMonth(
    emp,
    payroll.month,
    payroll.year
  );

  payroll.adjustmentsList.push({
    type,
    label,
    amount: Number(amount),
    reason,
    addedBy: adminDoc._id,
    addedAt: new Date(),
  });

  const calc = calculateEmployeePayrollNumbers({
    salaryStructure,
    ...attendanceMetrics,
    adjustmentsList: payroll.adjustmentsList,
  });

  payroll.attendanceBreakdown = calc.attendanceBreakdown;
  payroll.baseSalary = calc.baseSalary;
  payroll.earnings = calc.earnings;
  payroll.deductions = calc.deductions;
  payroll.netAdjustment = calc.netAdjustment;
  payroll.netPayable = calc.netPayable;
  await payroll.save();

  await recordAuditLog({
    req,
    actorType: "Admin",
    actorId: adminDoc._id,
    actorEmail: adminDoc.email,
    action: "PAYROLL_ADJUSTMENT_ADDED",
    module: "PAYROLL",
    targetId: payroll._id,
    description: `Added ${type} (${label}: INR ${amount}) to payroll ${payroll.employeeId} (${payroll.payPeriodLabel})`,
  });

  return payroll;
};

/**
 * Approves a Payroll Record (Section 9 rule: Approval NEVER automatically claims payment is Paid)
 */
const approvePayrollRecord = async (adminDoc, payrollId, req) => {
  const payroll = await Payroll.findById(payrollId);
  if (!payroll) {
    throw new ApiError(404, "Payroll record not found");
  }

  if (payroll.workflowStatus === "Finalized") {
    throw new ApiError(400, "Payroll is already Finalized");
  }

  payroll.workflowStatus = "Approved";
  payroll.approvedBy = adminDoc._id;
  payroll.approvedAt = new Date();
  // Payment status remains Pending until payment is actually recorded
  await payroll.save();

  await recordAuditLog({
    req,
    actorType: "Admin",
    actorId: adminDoc._id,
    actorEmail: adminDoc.email,
    action: "PAYROLL_APPROVED",
    module: "PAYROLL",
    targetId: payroll._id,
    description: `Approved payroll for ${payroll.employeeId} (${payroll.payPeriodLabel}). Payment status remains ${payroll.paymentStatus}.`,
  });

  return payroll;
};

/**
 * Finalizes Payroll, locks immutable snapshot, generates PDF Payslip, and sends via SMTP (Sections 9 & 10)
 */
const finalizePayrollAndGeneratePayslip = async (
  adminDoc,
  payrollId,
  { sendEmailToEmployee = true } = {},
  req
) => {
  const payroll = await Payroll.findById(payrollId);
  if (!payroll) {
    throw new ApiError(404, "Payroll record not found");
  }

  const employee = await Employee.findById(payroll.employee);
  if (!employee) {
    throw new ApiError(404, "Associated employee not found");
  }

  const now = new Date();
  if (!payroll.approvedAt) {
    payroll.approvedBy = adminDoc._id;
    payroll.approvedAt = now;
  }

  payroll.workflowStatus = "Finalized";
  payroll.finalizedBy = adminDoc._id;
  payroll.finalizedAt = now;
  payroll.isImmutable = true;
  payroll.immutableSnapshot = {
    employeeId: employee.employeeId,
    fullName: employee.fullName,
    department: employee.department,
    role: employee.role,
    payPeriodLabel: payroll.payPeriodLabel,
    attendanceBreakdown: payroll.attendanceBreakdown.toObject
      ? payroll.attendanceBreakdown.toObject()
      : payroll.attendanceBreakdown,
    baseSalary: payroll.baseSalary,
    earnings: payroll.earnings.toObject
      ? payroll.earnings.toObject()
      : payroll.earnings,
    deductions: payroll.deductions.toObject
      ? payroll.deductions.toObject()
      : payroll.deductions,
    netAdjustment: payroll.netAdjustment,
    netPayable: payroll.netPayable,
    finalizedAt: now.toISOString(),
  };

  await payroll.save();

  // Generate PDF Salary Slip
  const monthName = MONTH_NAMES[payroll.month - 1];
  const payslipNumber = `PS-${payroll.year}${String(payroll.month).padStart(2, "0")}-${employee.employeeId}`;

  const pdfBuffer = generatePayslipPdfBuffer({
    payslipNumber,
    companyName: "TechNeest",
    monthName,
    year: payroll.year,
    generatedAt: now.toISOString().slice(0, 10),
    employee: {
      employeeId: employee.employeeId,
      fullName: employee.fullName,
      email: employee.email,
      department: employee.department,
      designation: employee.designation || employee.role,
      joiningDate: employee.joiningDate
        ? new Date(employee.joiningDate).toISOString().slice(0, 10)
        : "",
    },
    attendanceSummary: {
      totalWorkingDays: payroll.attendanceBreakdown.totalWorkingDays,
      presentDays: payroll.attendanceBreakdown.approvedPresentDays,
      halfDays: payroll.attendanceBreakdown.approvedHalfDays,
      paidLeaveDays: payroll.attendanceBreakdown.paidLeaveDays,
      unpaidAbsences: payroll.attendanceBreakdown.unpaidAbsences,
      payableDays: payroll.attendanceBreakdown.payableDays,
    },
    earnings: payroll.earnings,
    deductions: payroll.deductions,
    netPayable: payroll.netPayable,
    currency: payroll.currency || "INR",
  });

  const payslipsDir = path.join(__dirname, "..", "..", "uploads", "payslips");
  if (!fs.existsSync(payslipsDir)) {
    fs.mkdirSync(payslipsDir, { recursive: true });
  }

  const fileName = `${payslipNumber}.pdf`;
  const filePath = path.join(payslipsDir, fileName);
  fs.writeFileSync(filePath, pdfBuffer);

  const payslip = await Payslip.findOneAndUpdate(
    { payroll: payroll._id },
    {
      $set: {
        payslipNumber,
        payroll: payroll._id,
        employee: employee._id,
        employeeId: employee.employeeId,
        month: payroll.month,
        year: payroll.year,
        companyName: "TechNeest",
        employeeSnapshot: {
          fullName: employee.fullName,
          employeeId: employee.employeeId,
          email: employee.email,
          department: employee.department,
          designation: employee.designation || employee.role,
          joiningDate: employee.joiningDate
            ? new Date(employee.joiningDate).toISOString().slice(0, 10)
            : "",
        },
        salarySnapshot: {
          attendanceSummary: payroll.attendanceBreakdown,
          earnings: payroll.earnings,
          deductions: payroll.deductions,
          netPayable: payroll.netPayable,
          currency: payroll.currency || "INR",
        },
        filePath,
        fileName,
        generatedAt: now,
        generatedBy: adminDoc._id,
      },
    },
    { returnDocument: "after", upsert: true, runValidators: true }
  );

  let emailResult = null;
  if (sendEmailToEmployee) {
    emailResult = await deliverPayslipEmail(payslip._id, pdfBuffer);
  }

  await recordAuditLog({
    req,
    actorType: "Admin",
    actorId: adminDoc._id,
    actorEmail: adminDoc.email,
    action: "PAYROLL_FINALIZED_AND_PAYSLIP_GENERATED",
    module: "PAYROLL",
    targetId: payroll._id,
    description: `Finalized payroll and generated payslip ${payslipNumber} for ${employee.employeeId}`,
  });

  const sanitizedPayslip = await Payslip.findById(payslip._id);

  return {
    payroll,
    payslip: sanitizedPayslip,
    emailDelivery: emailResult,
  };
};

/**
 * Sends or resends a generated Payslip PDF to the employee's registered email via SMTP
 */
const deliverPayslipEmail = async (payslipId, existingPdfBuffer = null) => {
  const payslip = await Payslip.findById(payslipId).select("+filePath");
  if (!payslip) {
    throw new ApiError(404, "Payslip not found");
  }

  let pdfBuffer = existingPdfBuffer;
  if (!pdfBuffer) {
    if (payslip.filePath && fs.existsSync(payslip.filePath)) {
      pdfBuffer = fs.readFileSync(payslip.filePath);
    } else {
      const monthName = MONTH_NAMES[payslip.month - 1];
      pdfBuffer = generatePayslipPdfBuffer({
        payslipNumber: payslip.payslipNumber,
        companyName: payslip.companyName,
        monthName,
        year: payslip.year,
        generatedAt: new Date(payslip.generatedAt).toISOString().slice(0, 10),
        employee: payslip.employeeSnapshot,
        attendanceSummary: payslip.salarySnapshot.attendanceSummary,
        earnings: payslip.salarySnapshot.earnings,
        deductions: payslip.salarySnapshot.deductions,
        netPayable: payslip.salarySnapshot.netPayable,
        currency: payslip.salarySnapshot.currency,
      });
    }
  }

  const monthName = MONTH_NAMES[payslip.month - 1];
  const emailResult = await sendEmail({
    to: payslip.employeeSnapshot.email,
    recipientName: payslip.employeeSnapshot.fullName,
    subject: `Salary Slip for ${monthName} ${payslip.year} — ${payslip.companyName}`,
    html: renderPayslipEmailTemplate({
      employeeName: payslip.employeeSnapshot.fullName,
      employeeId: payslip.employeeId,
      monthName,
      year: payslip.year,
      netPayable: payslip.salarySnapshot.netPayable,
      payableDays:
        payslip.salarySnapshot.attendanceSummary?.payableDays ?? 0,
      payslipNumber: payslip.payslipNumber,
    }),
    attachments: [
      {
        filename: payslip.fileName,
        content: pdfBuffer,
        contentType: "application/pdf",
      },
    ],
    templateName: "PAYSLIP_DELIVERY",
    relatedEntityType: "Payslip",
    relatedEntityId: payslip._id,
  });

  payslip.lastEmailAttemptAt = new Date();
  payslip.emailRetryCount = (payslip.emailRetryCount || 0) + 1;
  payslip.emailDeliveryStatus = emailResult.sent
    ? "Sent"
    : emailResult.warning
      ? "Pending"
      : "Failed";
  await payslip.save();

  return emailResult;
};

/**
 * Updates actual Payment Status separately from payroll approval (Section 9)
 */
const updatePayrollPaymentStatus = async (
  adminDoc,
  payrollId,
  { paymentStatus, paymentReference = null, paymentMethod = "Bank Transfer" },
  req
) => {
  const payroll = await Payroll.findById(payrollId);
  if (!payroll) {
    throw new ApiError(404, "Payroll record not found");
  }

  if (
    paymentStatus === "Paid" &&
    !["Approved", "Finalized"].includes(payroll.workflowStatus)
  ) {
    throw new ApiError(
      400,
      "Payroll must be Approved or Finalized before marking payment status as Paid"
    );
  }

  payroll.paymentStatus = paymentStatus;
  if (paymentReference !== null) {
    payroll.paymentReference = paymentReference;
  }
  if (paymentMethod) {
    payroll.paymentMethod = paymentMethod;
  }
  if (paymentStatus === "Paid") {
    payroll.paidAt = new Date();
  }

  await payroll.save();

  await recordAuditLog({
    req,
    actorType: "Admin",
    actorId: adminDoc._id,
    actorEmail: adminDoc.email,
    action: "PAYROLL_PAYMENT_STATUS_UPDATED",
    module: "PAYROLL",
    targetId: payroll._id,
    description: `Updated payment status for ${payroll.employeeId} (${payroll.payPeriodLabel}) to ${paymentStatus}`,
  });

  return payroll;
};

/**
 * Reverses a Finalized payroll with a mandatory audit reason so adjustments can be re-run
 */
const reverseFinalizedPayroll = async (adminDoc, payrollId, { reason }, req) => {
  const payroll = await Payroll.findById(payrollId);
  if (!payroll) {
    throw new ApiError(404, "Payroll record not found");
  }

  if (payroll.paymentStatus === "Paid") {
    throw new ApiError(
      400,
      "Cannot reverse a payroll whose payment has already been disbursed (Paid)."
    );
  }

  payroll.workflowStatus = "Reversed";
  payroll.isImmutable = false;
  payroll.reversalReason = reason;
  payroll.adjustmentsList.push({
    type: "Reversal",
    label: "Payroll Reversal",
    amount: 0,
    reason,
    addedBy: adminDoc._id,
    addedAt: new Date(),
  });
  await payroll.save();

  await recordAuditLog({
    req,
    actorType: "Admin",
    actorId: adminDoc._id,
    actorEmail: adminDoc.email,
    action: "PAYROLL_REVERSED",
    module: "PAYROLL",
    targetId: payroll._id,
    description: `Reversed finalized payroll ${payroll._id}: ${reason}`,
  });

  return payroll;
};

module.exports = {
  MONTH_NAMES,
  roundPaise,
  calculateEmployeePayrollNumbers,
  getOrCreateSalaryStructure,
  gatherApprovedAttendanceForMonth,
  generateOrRecalculatePayroll,
  addPayrollAdjustment,
  approvePayrollRecord,
  finalizePayrollAndGeneratePayslip,
  deliverPayslipEmail,
  updatePayrollPaymentStatus,
  reverseFinalizedPayroll,
};
