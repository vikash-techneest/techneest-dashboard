const fs = require("fs");
const mongoose = require("mongoose");
const Payroll = require("../../models/Payroll");
const Payslip = require("../../models/Payslip");
const SalaryStructure = require("../../models/SalaryStructure");
const Employee = require("../../models/Employee");
const EmailLog = require("../../models/EmailLog");
const {
  MONTH_NAMES,
  generateOrRecalculatePayroll,
  addPayrollAdjustment,
  approvePayrollRecord,
  finalizePayrollAndGeneratePayslip,
  deliverPayslipEmail,
  updatePayrollPaymentStatus,
  reverseFinalizedPayroll,
} = require("../../services/payroll/payrollService");
const { generatePayslipPdfBuffer } = require("../../utils/pdfGenerator");
const asyncHandler = require("../../utils/asyncHandler");
const { sendSuccess } = require("../../utils/apiResponse");
const {
  parsePagination,
  buildPaginationMeta,
  escapeRegex,
} = require("../../utils/pagination");
const { recordAuditLog } = require("../../utils/auditLogger");
const ApiError = require("../../utils/ApiError");

/**
 * Lists monthly payroll records & summary cards matching SalaryManagement.jsx
 */
const listPayrolls = asyncHandler(async (req, res) => {
  const now = new Date();
  const month = Number(req.query.month) || now.getUTCMonth() + 1;
  const year = Number(req.query.year) || now.getUTCFullYear();

  const filter = { month, year };
  if (req.query.paymentStatus && req.query.paymentStatus !== "All") {
    filter.paymentStatus = req.query.paymentStatus;
  }
  if (req.query.workflowStatus && req.query.workflowStatus !== "All") {
    filter.workflowStatus = req.query.workflowStatus;
  }

  let payrolls = await Payroll.find(filter)
    .populate("employee", "employeeId fullName email department role status")
    .sort({ employeeId: 1 });

  if (req.query.department && req.query.department !== "All") {
    const deptFilter = String(req.query.department).toLowerCase();
    payrolls = payrolls.filter(
      (p) => (p.employee?.department || "").toLowerCase() === deptFilter
    );
  }

  if (req.query.search) {
    const q = String(req.query.search).toLowerCase().trim();
    payrolls = payrolls.filter(
      (p) =>
        (p.employee?.fullName || "").toLowerCase().includes(q) ||
        (p.employeeId || "").toLowerCase().includes(q)
    );
  }

  const totalPayrollAmount = payrolls.reduce(
    (sum, p) => sum + Number(p.netPayable || 0),
    0
  );
  const pendingRecords = payrolls.filter((p) => p.paymentStatus !== "Paid");
  const pendingAmount = pendingRecords.reduce(
    (sum, p) => sum + Number(p.netPayable || 0),
    0
  );
  const paidRecords = payrolls.filter((p) => p.paymentStatus === "Paid");
  const paidAmount = paidRecords.reduce(
    (sum, p) => sum + Number(p.netPayable || 0),
    0
  );

  // Also format rows matching SalaryManagement.jsx table (id, name, base, adjustment, net, status)
  const formattedRows = payrolls.map((p) => ({
    payrollId: p._id,
    id: p.employeeId,
    name: p.employee?.fullName || p.immutableSnapshot?.fullName || p.employeeId,
    department:
      p.employee?.department || p.immutableSnapshot?.department || "",
    base: p.baseSalary,
    adjustment: p.netAdjustment,
    net: p.netPayable,
    status: p.paymentStatus,
    workflowStatus: p.workflowStatus,
    payableDays: p.attendanceBreakdown?.payableDays ?? 0,
    isImmutable: p.isImmutable,
    payPeriodLabel: p.payPeriodLabel,
  }));

  return sendSuccess(res, {
    statusCode: 200,
    message: "Payroll records fetched successfully",
    data: {
      month,
      year,
      payPeriodLabel: `${MONTH_NAMES[month - 1]} ${year}`,
      summaryCards: {
        monthlyPayroll: totalPayrollAmount,
        pendingPaymentsAmount: pendingAmount,
        pendingEmployeesCount: pendingRecords.length,
        paidThisMonthAmount: paidAmount,
        paidEmployeesCount: paidRecords.length,
      },
      rows: formattedRows,
      payrolls,
    },
  });
});

/**
 * Generates or recalculates Draft Payroll for a pay period
 */
const runOrCalculatePayroll = asyncHandler(async (req, res) => {
  const { month, year, employeeIds } = req.body;
  const result = await generateOrRecalculatePayroll(
    req.admin,
    { month: Number(month), year: Number(year), employeeIds },
    req
  );

  return sendSuccess(res, {
    statusCode: 200,
    message: `Payroll calculated successfully for ${result.payPeriodLabel}`,
    data: result,
  });
});

/**
 * Gets single Payroll details
 */
const getPayrollById = asyncHandler(async (req, res) => {
  const payroll = await Payroll.findById(req.params.id)
    .populate("employee", "employeeId fullName email department role joiningDate")
    .populate("approvedBy", "fullName email")
    .populate("finalizedBy", "fullName email");

  if (!payroll) {
    throw new ApiError(404, "Payroll record not found");
  }

  const payslip = await Payslip.findOne({ payroll: payroll._id });

  return sendSuccess(res, {
    statusCode: 200,
    message: "Payroll details fetched successfully",
    data: { payroll, payslip },
  });
});

/**
 * Adds a salary adjustment (Bonus, Incentive, Deduction) and recalculates before finalization
 */
const addAdjustment = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { type, label, amount, reason } = req.body;

  const updated = await addPayrollAdjustment(
    req.admin,
    id,
    { type, label, amount, reason },
    req
  );

  return sendSuccess(res, {
    statusCode: 200,
    message: "Payroll adjustment applied and recalculated successfully",
    data: updated,
  });
});

/**
 * Approves Payroll (without claiming payment has been transferred)
 */
const approvePayroll = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const updated = await approvePayrollRecord(req.admin, id, req);

  return sendSuccess(res, {
    statusCode: 200,
    message:
      "Payroll approved successfully. Payment status remains Pending until disbursement is recorded.",
    data: updated,
  });
});

/**
 * Finalizes Payroll, locks immutable snapshot, generates PDF Payslip, and sends via SMTP
 */
const finalizePayroll = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const sendEmailToEmployee = req.body?.sendEmail !== false;

  const result = await finalizePayrollAndGeneratePayslip(
    req.admin,
    id,
    { sendEmailToEmployee },
    req
  );

  return sendSuccess(res, {
    statusCode: 200,
    message: "Payroll finalized and official PDF salary slip generated",
    data: result,
  });
});

/**
 * Updates actual Payment Status and Payment Reference separately from approval
 */
const updatePaymentStatus = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { paymentStatus, paymentReference, paymentMethod } = req.body;

  const updated = await updatePayrollPaymentStatus(
    req.admin,
    id,
    { paymentStatus, paymentReference, paymentMethod },
    req
  );

  return sendSuccess(res, {
    statusCode: 200,
    message: `Payroll payment status updated to ${paymentStatus}`,
    data: updated,
  });
});

/**
 * Reverses a Finalized payroll with an audited reason
 */
const reversePayroll = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { reason } = req.body;
  if (!reason || String(reason).trim().length < 3) {
    throw new ApiError(400, "A valid reversal reason is required");
  }

  const reversed = await reverseFinalizedPayroll(
    req.admin,
    id,
    { reason: String(reason).trim() },
    req
  );

  return sendSuccess(res, {
    statusCode: 200,
    message: "Finalized payroll reversed for adjustment",
    data: reversed,
  });
});

/**
 * Bulk Edit Salary Structures (matches SalaryManagement.jsx Edit Salary Structure modal)
 */
const bulkUpdateSalaryStructures = asyncHandler(async (req, res) => {
  const { salaries } = req.body;
  const updatedStructures = [];

  for (const item of salaries) {
    const empQuery = mongoose.Types.ObjectId.isValid(item.employeeId)
      ? { _id: item.employeeId, isDeleted: false }
      : { employeeId: String(item.employeeId).toUpperCase().trim(), isDeleted: false };

    const employee = await Employee.findOne(empQuery);
    if (!employee) continue;

    const newBase = Math.max(0, Number(item.baseSalary || 0));
    employee.baseSalary = newBase;
    await employee.save();

    const structure = await SalaryStructure.findOneAndUpdate(
      { employee: employee._id },
      {
        $set: {
          employee: employee._id,
          employeeId: employee.employeeId,
          baseSalary: newBase,
          ...(item.basicPercent !== undefined ? { basicPercent: Number(item.basicPercent) } : {}),
          ...(item.hraPercent !== undefined ? { hraPercent: Number(item.hraPercent) } : {}),
          ...(item.daPercent !== undefined ? { daPercent: Number(item.daPercent) } : {}),
          ...(item.specialAllowancePercent !== undefined
            ? { specialAllowancePercent: Number(item.specialAllowancePercent) }
            : {}),
          ...(item.pfEnabled !== undefined ? { pfEnabled: Boolean(item.pfEnabled) } : {}),
          ...(item.esiEnabled !== undefined ? { esiEnabled: Boolean(item.esiEnabled) } : {}),
          ...(item.professionalTaxAmount !== undefined
            ? { professionalTaxAmount: Number(item.professionalTaxAmount) }
            : {}),
          ...(item.tdsRatePercent !== undefined ? { tdsRatePercent: Number(item.tdsRatePercent) } : {}),
          updatedBy: req.admin._id,
        },
      },
      { returnDocument: "after", upsert: true, runValidators: true }
    );

    updatedStructures.push(structure);
  }

  await recordAuditLog({
    req,
    actorType: "Admin",
    actorId: req.admin._id,
    actorEmail: req.admin.email,
    action: "SALARY_STRUCTURES_BULK_UPDATED",
    module: "PAYROLL",
    description: `Bulk updated salary structures for ${updatedStructures.length} employee(s)`,
  });

  return sendSuccess(res, {
    statusCode: 200,
    message: "All salary structures updated successfully",
    data: updatedStructures,
  });
});

/**
 * Exports Payroll CSV (matches Export Payroll button in SalaryManagement.jsx)
 */
const exportPayrollCSV = asyncHandler(async (req, res) => {
  const now = new Date();
  const month = Number(req.query.month) || now.getUTCMonth() + 1;
  const year = Number(req.query.year) || now.getUTCFullYear();

  const payrolls = await Payroll.find({ month, year }).populate(
    "employee",
    "employeeId fullName department role"
  );

  const headers = [
    "Employee ID",
    "Name",
    "Department",
    "Pay Period",
    "Payable Days",
    "Base Salary (INR)",
    "Adjustments (INR)",
    "Net Pay (INR)",
    "Workflow Status",
    "Payment Status",
  ];

  const rows = payrolls.map((p) =>
    [
      p.employeeId,
      `"${(p.employee?.fullName || p.immutableSnapshot?.fullName || "").replace(/"/g, '""')}"`,
      `"${p.employee?.department || p.immutableSnapshot?.department || ""}"`,
      `"${p.payPeriodLabel}"`,
      p.attendanceBreakdown?.payableDays ?? 0,
      p.baseSalary,
      p.netAdjustment,
      p.netPayable,
      p.workflowStatus,
      p.paymentStatus,
    ].join(",")
  );

  const csvContent = [headers.join(","), ...rows].join("\n");

  if (req.query.format === "raw") {
    res.setHeader("Content-Type", "text/csv");
    res.setHeader(
      "Content-Disposition",
      `attachment; filename="Payroll_${year}_${String(month).padStart(2, "0")}.csv"`
    );
    return res.status(200).send(csvContent);
  }

  return sendSuccess(res, {
    statusCode: 200,
    message: "Payroll CSV exported successfully",
    data: {
      month,
      year,
      fileName: `Payroll_${year}_${String(month).padStart(2, "0")}.csv`,
      totalRecords: payrolls.length,
      csv: csvContent,
    },
  });
});

/**
 * Lists generated Payslips
 */
const listPayslips = asyncHandler(async (req, res) => {
  const { page, limit, skip, sort } = parsePagination(req.query);
  const filter = {};

  if (req.query.month) filter.month = Number(req.query.month);
  if (req.query.year) filter.year = Number(req.query.year);
  if (req.query.employeeId) {
    filter.employeeId = String(req.query.employeeId).toUpperCase().trim();
  }

  const [total, payslips] = await Promise.all([
    Payslip.countDocuments(filter),
    Payslip.find(filter).sort(sort).skip(skip).limit(limit),
  ]);

  return sendSuccess(res, {
    statusCode: 200,
    message: "Payslips fetched successfully",
    data: payslips,
    pagination: buildPaginationMeta(total, page, limit),
  });
});

/**
 * Securely downloads a Payslip PDF (Protected Admin endpoint — never publicly exposed)
 */
const downloadPayslipByAdmin = asyncHandler(async (req, res) => {
  const payslip = await Payslip.findById(req.params.id).select("+filePath");
  if (!payslip) {
    throw new ApiError(404, "Payslip not found");
  }

  let pdfBuffer;
  if (payslip.filePath && fs.existsSync(payslip.filePath)) {
    pdfBuffer = fs.readFileSync(payslip.filePath);
  } else {
    pdfBuffer = generatePayslipPdfBuffer({
      payslipNumber: payslip.payslipNumber,
      companyName: payslip.companyName,
      monthName: MONTH_NAMES[payslip.month - 1],
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

  res.setHeader("Content-Type", "application/pdf");
  res.setHeader(
    "Content-Disposition",
    `attachment; filename="${payslip.fileName}"`
  );
  return res.status(200).send(pdfBuffer);
});

/**
 * Resends Payslip Email via SMTP and logs delivery attempt in EmailLog
 */
const resendPayslipEmail = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const emailResult = await deliverPayslipEmail(id);
  const updatedPayslip = await Payslip.findById(id);

  return sendSuccess(res, {
    statusCode: 200,
    message: emailResult.sent
      ? "Payslip email sent successfully"
      : emailResult.warning || "Payslip email attempt recorded",
    data: {
      payslip: updatedPayslip,
      emailDelivery: emailResult,
    },
  });
});

/**
 * Lists SMTP Email Delivery Logs
 */
const getEmailLogs = asyncHandler(async (req, res) => {
  const { page, limit, skip, sort } = parsePagination(req.query);
  const filter = {};
  if (req.query.status) filter.status = req.query.status;
  if (req.query.templateName) filter.templateName = req.query.templateName;

  const [total, logs] = await Promise.all([
    EmailLog.countDocuments(filter),
    EmailLog.find(filter).sort(sort).skip(skip).limit(limit),
  ]);

  return sendSuccess(res, {
    statusCode: 200,
    message: "Email delivery logs fetched successfully",
    data: logs,
    pagination: buildPaginationMeta(total, page, limit),
  });
});

module.exports = {
  listPayrolls,
  runOrCalculatePayroll,
  getPayrollById,
  addAdjustment,
  approvePayroll,
  finalizePayroll,
  updatePaymentStatus,
  reversePayroll,
  bulkUpdateSalaryStructures,
  exportPayrollCSV,
  listPayslips,
  downloadPayslipByAdmin,
  resendPayslipEmail,
  getEmailLogs,
};
