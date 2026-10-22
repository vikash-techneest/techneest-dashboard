const mongoose = require("mongoose");
const Attendance = require("../../models/Attendance");
const AttendanceRegister = require("../../models/AttendanceRegister");
const AttendanceAudit = require("../../models/AttendanceAudit");
const AttendancePolicy = require("../../models/AttendancePolicy");
const Employee = require("../../models/Employee");
const Leave = require("../../models/Leave");
const Holiday = require("../../models/Holiday");
const ApiError = require("../../utils/ApiError");
const {
  toISTDateString,
  toISTTimeString,
  getISTHoursAndMinutes,
  parseTimeStringToMinutes,
  formatDurationMinutes,
  getMonthCalendarDetails,
} = require("../../utils/dateTime");
const { extractClientIp } = require("../../utils/deviceInfo");

/**
 * Pure calculation helper for attendance metrics based on policy.
 * Exported directly so unit tests can also test edge cases without DB state.
 */
const evaluateAttendanceMetrics = ({
  checkInTime,
  checkOutTime = null,
  policy = {},
}) => {
  const standardLoginTime = policy.standardLoginTime || "09:00";
  const lateThresholdTime = policy.lateThresholdTime || "09:30";
  const standardLogoutTime = policy.standardLogoutTime || "18:00";
  const earlyCheckoutThresholdMinutes =
    policy.earlyCheckoutThresholdMinutes ?? 15;
  const fullDayMinHours = policy.fullDayMinHours ?? 8;
  const halfDayMinHours = policy.halfDayMinHours ?? 4;
  const overtimeMinMinutesAfterShift =
    policy.overtimeMinMinutesAfterShift ?? 30;

  const checkInIST = getISTHoursAndMinutes(checkInTime);
  const lateThresholdMins = parseTimeStringToMinutes(lateThresholdTime);
  const standardLoginMins = parseTimeStringToMinutes(standardLoginTime);
  const standardLogoutMins = parseTimeStringToMinutes(standardLogoutTime);

  const isLate = checkInIST.totalMinutes > lateThresholdMins;
  const lateByMinutes = isLate
    ? Math.max(0, checkInIST.totalMinutes - standardLoginMins)
    : 0;
  const lateByDisplay = isLate ? `${lateByMinutes}m` : null;

  let workingDurationMinutes = 0;
  let workingHoursDecimal = 0;
  let durationDisplay = "0h 0m";
  let isEarlyCheckout = false;
  let earlyCheckoutByMinutes = 0;
  let isHalfDay = false;
  let overtimeMinutes = 0;
  let attendanceStatus = isLate ? "Late" : "Working";

  if (checkOutTime) {
    const diffMs = new Date(checkOutTime) - new Date(checkInTime);
    workingDurationMinutes = Math.max(0, Math.round(diffMs / 60000));
    workingHoursDecimal = Number((workingDurationMinutes / 60).toFixed(2));
    durationDisplay = formatDurationMinutes(workingDurationMinutes);

    const checkOutIST = getISTHoursAndMinutes(checkOutTime);
    if (
      checkOutIST.totalMinutes <
      standardLogoutMins - earlyCheckoutThresholdMinutes
    ) {
      isEarlyCheckout = true;
      earlyCheckoutByMinutes = Math.max(
        0,
        standardLogoutMins - checkOutIST.totalMinutes
      );
    }

    const fullDayMins = fullDayMinHours * 60;
    const halfDayMins = halfDayMinHours * 60;

    if (workingDurationMinutes < halfDayMins) {
      attendanceStatus = "Absent";
      isHalfDay = false;
    } else if (workingDurationMinutes < fullDayMins) {
      attendanceStatus = "Half Day";
      isHalfDay = true;
    } else {
      attendanceStatus = isLate ? "Late" : "Present";
      isHalfDay = false;
    }

    if (workingDurationMinutes > fullDayMins + overtimeMinMinutesAfterShift) {
      overtimeMinutes = workingDurationMinutes - fullDayMins;
    }
  }

  return {
    checkInDisplay: toISTTimeString(checkInTime),
    checkOutDisplay: checkOutTime ? toISTTimeString(checkOutTime) : "—",
    workingDurationMinutes,
    workingHoursDecimal,
    durationDisplay,
    isLate,
    lateByMinutes,
    lateByDisplay,
    isEarlyCheckout,
    earlyCheckoutByMinutes,
    isHalfDay,
    overtimeMinutes,
    attendanceStatus,
  };
};

/**
 * Fetches or creates the default AttendancePolicy
 */
const getOrCreateActivePolicy = async () => {
  let policy = await AttendancePolicy.findOne({ isDefault: true });
  if (!policy) {
    policy = await AttendancePolicy.findOne();
  }
  if (!policy) {
    policy = await AttendancePolicy.create({
      name: "Standard Office Hours",
      code: "STANDARD_OFFICE",
      isDefault: true,
      standardLoginTime: "09:00",
      lateThresholdTime: "09:30",
      gracePeriodMinutes: 30,
      standardLogoutTime: "18:00",
      fullDayMinHours: 8,
      halfDayMinHours: 4,
      weeklyOffDays: [0],
    });
  }
  return policy;
};

/**
 * Recomputes an employee's monthly attendance summary from AttendanceRegister (official approved records)
 */
const refreshEmployeeAttendanceSummary = async (employeeObjectId, month, year) => {
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

  const totalWorkingDaysInMonth =
    overrideDays || calendarInfo.standardWorkingDays || 24;

  const officialRecords = await AttendanceRegister.find({
    employee: employeeObjectId,
    month,
    year,
  });

  let presentDays = 0;
  let halfDays = 0;
  let lateDays = 0;
  let leaveDays = 0;
  let totalMinutes = 0;

  for (const rec of officialRecords) {
    totalMinutes += Number(rec.workingDurationMinutes || 0);
    if (rec.officialStatus === "Present") {
      presentDays += 1;
    } else if (rec.officialStatus === "Late") {
      presentDays += 1;
      lateDays += 1;
    } else if (rec.officialStatus === "Half Day") {
      halfDays += 1;
      presentDays += 0.5;
    } else if (
      rec.officialStatus === "Paid Leave" ||
      rec.officialStatus === "Unpaid Leave"
    ) {
      leaveDays += 1;
    }
  }

  await Employee.findByIdAndUpdate(employeeObjectId, {
    $set: {
      "attendanceSummary.currentMonthPresentDays": presentDays,
      "attendanceSummary.currentMonthHalfDays": halfDays,
      "attendanceSummary.currentMonthLateDays": lateDays,
      "attendanceSummary.currentMonthLeaveDays": leaveDays,
      "attendanceSummary.currentMonthHoursMinutes": totalMinutes,
      "attendanceSummary.totalWorkingDaysInMonth": totalWorkingDaysInMonth,
      "attendanceSummary.lastUpdatedAt": new Date(),
    },
  });

  return {
    presentDays,
    halfDays,
    lateDays,
    leaveDays,
    totalMinutes,
    totalWorkingDaysInMonth,
  };
};

/**
 * Employee Self Check-In (creates Pending attendance record with server-generated timestamp)
 */
const employeeCheckIn = async (employeeDoc, req) => {
  const now = new Date(); // Server-generated timestamp
  const attendanceDate = toISTDateString(now);
  const [yearStr, monthStr] = attendanceDate.split("-");
  const year = Number(yearStr);
  const month = Number(monthStr);

  const policy = await getOrCreateActivePolicy();
  const ipAddress = extractClientIp(req);

  if (
    policy.ipWhitelistingEnabled &&
    Array.isArray(policy.allowedIpAddresses) &&
    policy.allowedIpAddresses.length > 0 &&
    !policy.allowedIpAddresses.includes(ipAddress)
  ) {
    throw new ApiError(
      403,
      `Check-in restricted: IP address (${ipAddress}) is not on the office whitelist`
    );
  }

  // Prevent duplicate or overlapping attendance entries for the same date
  const existing = await Attendance.findOne({
    employee: employeeDoc._id,
    attendanceDate,
  });

  if (existing) {
    throw new ApiError(
      409,
      `Attendance already marked for today (${attendanceDate}). Duplicate check-in is not allowed.`
    );
  }

  const metrics = evaluateAttendanceMetrics({
    checkInTime: now,
    checkOutTime: null,
    policy,
  });

  const attendance = await Attendance.create({
    employee: employeeDoc._id,
    employeeId: employeeDoc.employeeId,
    attendanceDate,
    month,
    year,
    checkInTime: now,
    checkOutTime: null,
    ...metrics,
    approvalStatus: "Pending",
    ipAddress,
    notes: req.body?.notes || "",
  });

  await Employee.findByIdAndUpdate(employeeDoc._id, {
    $set: {
      dailyPresenceStatus: metrics.isLate ? "Late" : "Present",
    },
  });

  await AttendanceAudit.create({
    attendanceRecord: attendance._id,
    employee: employeeDoc._id,
    employeeId: employeeDoc.employeeId,
    attendanceDate,
    action: "CHECK_IN",
    performedByType: "Employee",
    performedBy: employeeDoc._id,
    newState: {
      checkInTime: now,
      attendanceStatus: attendance.attendanceStatus,
      approvalStatus: "Pending",
    },
    reason: "Employee self check-in",
    ipAddress,
  });

  return attendance;
};

/**
 * Employee Self Check-Out (calculates duration, half-day, early checkout, overtime)
 */
const employeeCheckOut = async (employeeDoc, req) => {
  const now = new Date(); // Server-generated timestamp
  const attendanceDate = toISTDateString(now);
  const ipAddress = extractClientIp(req);

  const attendance = await Attendance.findOne({
    employee: employeeDoc._id,
    attendanceDate,
  });

  if (!attendance) {
    throw new ApiError(
      400,
      `No active check-in found for today (${attendanceDate}). Please check in first.`
    );
  }

  if (attendance.checkOutTime) {
    throw new ApiError(
      409,
      `You have already checked out today at ${attendance.checkOutDisplay}.`
    );
  }

  if (attendance.approvalStatus === "Approved") {
    throw new ApiError(
      400,
      "Approved attendance records cannot be modified directly. Submit a correction request instead."
    );
  }

  const policy = await getOrCreateActivePolicy();
  const metrics = evaluateAttendanceMetrics({
    checkInTime: attendance.checkInTime,
    checkOutTime: now,
    policy,
  });

  const previousState = {
    checkOutTime: attendance.checkOutTime,
    workingDurationMinutes: attendance.workingDurationMinutes,
    attendanceStatus: attendance.attendanceStatus,
  };

  attendance.checkOutTime = now;
  attendance.checkOutDisplay = metrics.checkOutDisplay;
  attendance.workingDurationMinutes = metrics.workingDurationMinutes;
  attendance.workingHoursDecimal = metrics.workingHoursDecimal;
  attendance.durationDisplay = metrics.durationDisplay;
  attendance.isEarlyCheckout = metrics.isEarlyCheckout;
  attendance.earlyCheckoutByMinutes = metrics.earlyCheckoutByMinutes;
  attendance.isHalfDay = metrics.isHalfDay;
  attendance.overtimeMinutes = metrics.overtimeMinutes;
  attendance.attendanceStatus = metrics.attendanceStatus;
  attendance.approvalStatus = "Pending";

  await attendance.save();

  await AttendanceAudit.create({
    attendanceRecord: attendance._id,
    employee: employeeDoc._id,
    employeeId: employeeDoc.employeeId,
    attendanceDate,
    action: "CHECK_OUT",
    performedByType: "Employee",
    performedBy: employeeDoc._id,
    previousState,
    newState: {
      checkOutTime: now,
      workingDurationMinutes: metrics.workingDurationMinutes,
      attendanceStatus: metrics.attendanceStatus,
      approvalStatus: "Pending",
    },
    reason: "Employee self check-out",
    ipAddress,
  });

  return attendance;
};

/**
 * Employee Attendance Correction Request (preserves original and requested values)
 */
const requestAttendanceCorrection = async (
  employeeDoc,
  attendanceId,
  { requestedCheckInTime, requestedCheckOutTime, reason },
  req
) => {
  const attendance = await Attendance.findOne({
    _id: attendanceId,
    employee: employeeDoc._id,
  });

  if (!attendance) {
    throw new ApiError(404, "Attendance record not found");
  }

  const previousState = {
    approvalStatus: attendance.approvalStatus,
    checkInTime: attendance.checkInTime,
    checkOutTime: attendance.checkOutTime,
  };

  attendance.correctionRequest = {
    isRequested: true,
    requestedAt: new Date(),
    originalCheckInTime:
      attendance.correctionRequest?.originalCheckInTime || attendance.checkInTime,
    originalCheckOutTime:
      attendance.correctionRequest?.originalCheckOutTime || attendance.checkOutTime,
    requestedCheckInTime: requestedCheckInTime
      ? new Date(requestedCheckInTime)
      : attendance.checkInTime,
    requestedCheckOutTime: requestedCheckOutTime
      ? new Date(requestedCheckOutTime)
      : attendance.checkOutTime,
    reason,
    resolutionStatus: "Pending",
  };
  attendance.approvalStatus = "Correction Requested";
  await attendance.save();

  await AttendanceAudit.create({
    attendanceRecord: attendance._id,
    employee: employeeDoc._id,
    employeeId: employeeDoc.employeeId,
    attendanceDate: attendance.attendanceDate,
    action: "CORRECTION_REQUESTED",
    performedByType: "Employee",
    performedBy: employeeDoc._id,
    previousState,
    newState: attendance.correctionRequest,
    reason,
    ipAddress: extractClientIp(req),
  });

  return attendance;
};

/**
 * Admin Review & Approve / Reject Attendance Record (Workflow Steps 5-10 in Section 8)
 * Uses atomic upsert on AttendanceRegister with unique index { employee, attendanceDate }
 * to guarantee zero duplicate official entries.
 */
const reviewAttendanceByAdmin = async (
  adminDoc,
  attendanceId,
  { decision, reason = "", overrideStatus = null },
  req
) => {
  if (!["Approved", "Rejected"].includes(decision)) {
    throw new ApiError(400, "Decision must be either 'Approved' or 'Rejected'");
  }

  const attendance = await Attendance.findById(attendanceId);
  if (!attendance) {
    throw new ApiError(404, "Attendance record not found");
  }

  const policy = await getOrCreateActivePolicy();
  const now = new Date();
  const ipAddress = extractClientIp(req);

  const previousState = {
    approvalStatus: attendance.approvalStatus,
    attendanceStatus: attendance.attendanceStatus,
    checkInTime: attendance.checkInTime,
    checkOutTime: attendance.checkOutTime,
  };

  const wasCorrectionRequest =
    attendance.approvalStatus === "Correction Requested" ||
    attendance.correctionRequest?.resolutionStatus === "Pending";

  if (decision === "Approved") {
    // If approving a correction request, apply the requested check-in/out times and recalculate
    if (wasCorrectionRequest && attendance.correctionRequest?.isRequested) {
      if (attendance.correctionRequest.requestedCheckInTime) {
        attendance.checkInTime = attendance.correctionRequest.requestedCheckInTime;
      }
      if (attendance.correctionRequest.requestedCheckOutTime) {
        attendance.checkOutTime = attendance.correctionRequest.requestedCheckOutTime;
      }
      const recalculated = evaluateAttendanceMetrics({
        checkInTime: attendance.checkInTime,
        checkOutTime: attendance.checkOutTime,
        policy,
      });
      Object.assign(attendance, recalculated);
      attendance.correctionRequest.resolutionStatus = "Approved";
      attendance.correctionRequest.resolvedBy = adminDoc._id;
      attendance.correctionRequest.resolvedAt = now;
      attendance.correctionRequest.resolutionComment = reason;
    }

    if (overrideStatus) {
      attendance.attendanceStatus = overrideStatus;
      attendance.isHalfDay = overrideStatus === "Half Day";
    } else if (attendance.attendanceStatus === "Working") {
      attendance.attendanceStatus = attendance.isLate ? "Late" : "Present";
    }

    attendance.approvalStatus = "Approved";
    attendance.reviewedBy = adminDoc._id;
    attendance.reviewedAt = now;
    attendance.reviewReason = reason || "Approved by administrator";
    await attendance.save();

    // Determine official status and payableDayValue for AttendanceRegister (main sheet)
    let officialStatus = attendance.attendanceStatus;
    if (!["Present", "Late", "Half Day", "Absent"].includes(officialStatus)) {
      officialStatus = "Present";
    }

    let payableDayValue = 1.0;
    if (officialStatus === "Half Day") payableDayValue = 0.5;
    if (officialStatus === "Absent") payableDayValue = 0.0;

    // Transfer into official AttendanceRegister (main sheet) via atomic upsert
    const registerRecord = await AttendanceRegister.findOneAndUpdate(
      {
        employee: attendance.employee,
        attendanceDate: attendance.attendanceDate,
      },
      {
        $set: {
          attendanceRecord: attendance._id,
          employee: attendance.employee,
          employeeId: attendance.employeeId,
          attendanceDate: attendance.attendanceDate,
          month: attendance.month,
          year: attendance.year,
          officialStatus,
          payableDayValue,
          checkInTime: attendance.checkInTime,
          checkOutTime: attendance.checkOutTime,
          workingDurationMinutes: attendance.workingDurationMinutes,
          overtimeMinutes: attendance.overtimeMinutes,
          lateByMinutes: attendance.lateByMinutes,
          approvedBy: adminDoc._id,
          approvedAt: now,
          remarks: reason || "Approved from employee attendance",
          isManualAdjustment: false,
        },
      },
      { returnDocument: "after", upsert: true, runValidators: true }
    );

    // Permanent Approval Audit Trail
    await AttendanceAudit.create({
      attendanceRecord: attendance._id,
      registerRecord: registerRecord._id,
      employee: attendance.employee,
      employeeId: attendance.employeeId,
      attendanceDate: attendance.attendanceDate,
      action: wasCorrectionRequest ? "CORRECTION_APPROVED" : "APPROVED",
      performedByType: "Admin",
      performedBy: adminDoc._id,
      previousState,
      newState: {
        approvalStatus: "Approved",
        officialStatus,
        payableDayValue,
        workingDurationMinutes: attendance.workingDurationMinutes,
      },
      reason: reason || "Approved by admin",
      ipAddress,
    });

    // Update employee's attendance summary
    const updatedSummary = await refreshEmployeeAttendanceSummary(
      attendance.employee,
      attendance.month,
      attendance.year
    );

    return {
      attendance,
      registerRecord,
      updatedSummary,
    };
  } else {
    // Rejected
    if (wasCorrectionRequest && attendance.correctionRequest?.isRequested) {
      attendance.correctionRequest.resolutionStatus = "Rejected";
      attendance.correctionRequest.resolvedBy = adminDoc._id;
      attendance.correctionRequest.resolvedAt = now;
      attendance.correctionRequest.resolutionComment = reason;
    }

    attendance.approvalStatus = "Rejected";
    attendance.reviewedBy = adminDoc._id;
    attendance.reviewedAt = now;
    attendance.reviewReason = reason || "Rejected by administrator";
    await attendance.save();

    // Remove from official AttendanceRegister if it previously existed
    await AttendanceRegister.deleteOne({
      employee: attendance.employee,
      attendanceDate: attendance.attendanceDate,
    });

    await AttendanceAudit.create({
      attendanceRecord: attendance._id,
      employee: attendance.employee,
      employeeId: attendance.employeeId,
      attendanceDate: attendance.attendanceDate,
      action: wasCorrectionRequest ? "CORRECTION_REJECTED" : "REJECTED",
      performedByType: "Admin",
      performedBy: adminDoc._id,
      previousState,
      newState: {
        approvalStatus: "Rejected",
        reviewReason: attendance.reviewReason,
      },
      reason: reason || "Rejected by admin",
      ipAddress,
    });

    const updatedSummary = await refreshEmployeeAttendanceSummary(
      attendance.employee,
      attendance.month,
      attendance.year
    );

    return {
      attendance,
      registerRecord: null,
      updatedSummary,
    };
  }
};

/**
 * Admin Manual Adjustment (matches AttendanceManagement.jsx Manual Adjustment modal)
 * Allows setting totalWorkingDays in month and audited adjustment of employee presentDays
 */
const bulkManualAdjustAttendance = async (
  adminDoc,
  { month, year, totalWorkingDays, adjustments = [], reason = "Admin manual adjustment" },
  req
) => {
  const policy = await getOrCreateActivePolicy();
  const monthKey = `${year}-${String(month).padStart(2, "0")}`;

  if (totalWorkingDays && Number(totalWorkingDays) >= 1 && Number(totalWorkingDays) <= 31) {
    if (!policy.monthlyWorkingDaysOverride) {
      policy.monthlyWorkingDaysOverride = new Map();
    }
    policy.monthlyWorkingDaysOverride.set(monthKey, Number(totalWorkingDays));
    await policy.save();
  }

  const effectiveTotalDays =
    Number(totalWorkingDays) ||
    policy.monthlyWorkingDaysOverride?.get(monthKey) ||
    24;

  const results = [];
  const ipAddress = extractClientIp(req);

  for (const item of adjustments) {
    const empQuery = mongoose.Types.ObjectId.isValid(item.employeeId)
      ? { _id: item.employeeId, isDeleted: false }
      : { employeeId: String(item.employeeId).toUpperCase().trim(), isDeleted: false };

    const employee = await Employee.findOne(empQuery);
    if (!employee) continue;

    const validPresentDays = Math.min(
      effectiveTotalDays,
      Math.max(0, Number(item.presentDays ?? 0))
    );

    const prevPresent = employee.attendanceSummary?.currentMonthPresentDays || 0;

    // Ensure official AttendanceRegister reflects the manual adjustment for the month if needed
    const existingRegisterCount = await AttendanceRegister.countDocuments({
      employee: employee._id,
      month,
      year,
      payableDayValue: { $gt: 0 },
    });

    if (validPresentDays > existingRegisterCount) {
      const diff = Math.floor(validPresentDays - existingRegisterCount);
      let added = 0;
      for (let d = 1; d <= 31 && added < diff; d++) {
        const dateStr = `${year}-${String(month).padStart(2, "0")}-${String(d).padStart(2, "0")}`;
        const exists = await AttendanceRegister.findOne({
          employee: employee._id,
          attendanceDate: dateStr,
        });
        if (!exists) {
          await AttendanceRegister.create({
            employee: employee._id,
            employeeId: employee.employeeId,
            attendanceDate: dateStr,
            month,
            year,
            officialStatus: "Present",
            payableDayValue: 1.0,
            workingDurationMinutes: 480,
            approvedBy: adminDoc._id,
            approvedAt: new Date(),
            remarks: reason,
            isManualAdjustment: true,
          });
          added++;
        }
      }
    } else if (validPresentDays < existingRegisterCount) {
      const toRemove = Math.ceil(existingRegisterCount - validPresentDays);
      const removable = await AttendanceRegister.find({
        employee: employee._id,
        month,
        year,
        payableDayValue: { $gt: 0 },
      })
        .sort({ isManualAdjustment: -1, attendanceDate: -1 })
        .limit(toRemove);

      if (removable.length > 0) {
        await AttendanceRegister.deleteMany({
          _id: { $in: removable.map((r) => r._id) },
        });
      }
    }

    employee.attendanceSummary = {
      ...(employee.attendanceSummary || {}),
      currentMonthPresentDays: validPresentDays,
      totalWorkingDaysInMonth: effectiveTotalDays,
      lastUpdatedAt: new Date(),
    };
    await employee.save();

    await AttendanceAudit.create({
      employee: employee._id,
      employeeId: employee.employeeId,
      attendanceDate: `${monthKey}-01`,
      action: "MANUAL_ADJUSTMENT",
      performedByType: "Admin",
      performedBy: adminDoc._id,
      previousState: { presentDays: prevPresent },
      newState: {
        presentDays: validPresentDays,
        totalWorkingDays: effectiveTotalDays,
      },
      reason,
      ipAddress,
    });

    results.push({
      employeeId: employee.employeeId,
      fullName: employee.fullName,
      presentDays: validPresentDays,
      totalWorkingDays: effectiveTotalDays,
    });
  }

  return {
    month,
    year,
    totalWorkingDays: effectiveTotalDays,
    updatedEmployees: results,
  };
};

module.exports = {
  evaluateAttendanceMetrics,
  getOrCreateActivePolicy,
  refreshEmployeeAttendanceSummary,
  employeeCheckIn,
  employeeCheckOut,
  requestAttendanceCorrection,
  reviewAttendanceByAdmin,
  bulkManualAdjustAttendance,
};
