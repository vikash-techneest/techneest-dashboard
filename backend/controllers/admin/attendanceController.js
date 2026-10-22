const Attendance = require("../../models/Attendance");
const AttendanceRegister = require("../../models/AttendanceRegister");
const AttendanceAudit = require("../../models/AttendanceAudit");
const Employee = require("../../models/Employee");
const {
  getOrCreateActivePolicy,
  reviewAttendanceByAdmin,
  bulkManualAdjustAttendance,
} = require("../../services/attendance/attendanceService");
const { runAutoMarkAbsentJob } = require("../../jobs/attendanceJobs");
const asyncHandler = require("../../utils/asyncHandler");
const { sendSuccess } = require("../../utils/apiResponse");
const {
  parsePagination,
  buildPaginationMeta,
  escapeRegex,
} = require("../../utils/pagination");
const {
  toISTDateString,
  formatDurationMinutes,
} = require("../../utils/dateTime");
const ApiError = require("../../utils/ApiError");

/**
 * Lists daily attendance records and stats matching AttendanceManagement.jsx
 */
const getAdminAttendanceList = asyncHandler(async (req, res) => {
  const targetDate = req.query.date || toISTDateString(new Date());
  const [yearStr, monthStr] = targetDate.split("-");
  const year = Number(yearStr);
  const month = Number(monthStr);

  const policy = await getOrCreateActivePolicy();
  const monthKey = `${year}-${String(month).padStart(2, "0")}`;
  const totalWorkingDays =
    (policy.monthlyWorkingDaysOverride?.get
      ? policy.monthlyWorkingDaysOverride.get(monthKey)
      : policy.monthlyWorkingDaysOverride?.[monthKey]) || 24;

  const empFilter = { isDeleted: false, status: "Active" };
  if (req.query.department && req.query.department !== "All") {
    empFilter.department = {
      $regex: `^${escapeRegex(req.query.department)}$`,
      $options: "i",
    };
  }
  if (req.query.search) {
    const safe = escapeRegex(req.query.search.trim());
    empFilter.$or = [
      { fullName: { $regex: safe, $options: "i" } },
      { employeeId: { $regex: safe, $options: "i" } },
    ];
  }

  const [employees, dateAttendances] = await Promise.all([
    Employee.find(empFilter).sort({ employeeId: 1 }),
    Attendance.find({ attendanceDate: targetDate }),
  ]);

  const attMap = new Map(
    dateAttendances.map((a) => [String(a.employee), a])
  );

  let presentTodayCount = 0;
  let absentTodayCount = 0;
  let lateArrivalsCount = 0;
  let totalMinutesLoggedToday = 0;

  const rows = [];
  for (const emp of employees) {
    const att = attMap.get(String(emp._id));
    const status = att ? att.attendanceStatus : "Absent";
    const approvalStatus = att ? att.approvalStatus : "None";
    const durationMins = att ? att.workingDurationMinutes || 0 : 0;

    if (["Present", "Late", "Working", "Half Day"].includes(status)) {
      presentTodayCount++;
    } else {
      absentTodayCount++;
    }
    if (att?.isLate || status === "Late") {
      lateArrivalsCount++;
    }
    totalMinutesLoggedToday += durationMins;

    if (
      req.query.status &&
      req.query.status !== "All" &&
      status.toLowerCase() !== String(req.query.status).toLowerCase()
    ) {
      continue;
    }

    if (
      req.query.approvalStatus &&
      req.query.approvalStatus !== "All" &&
      approvalStatus.toLowerCase() !==
        String(req.query.approvalStatus).toLowerCase()
    ) {
      continue;
    }

    rows.push({
      attendanceId: att ? att._id : null,
      employeeObjectId: emp._id,
      id: emp.employeeId,
      name: emp.fullName,
      department: emp.department,
      role: emp.role,
      date: targetDate,
      login: att ? att.checkInDisplay : "—",
      logout: att ? att.checkOutDisplay : "—",
      duration: att ? att.durationDisplay : "0h",
      status,
      approvalStatus,
      lateBy: att ? att.lateByDisplay : null,
      presentDays: emp.attendanceSummary?.currentMonthPresentDays || 0,
      totalWorkingDays,
      correctionRequest: att?.correctionRequest?.isRequested
        ? att.correctionRequest
        : null,
    });
  }

  return sendSuccess(res, {
    statusCode: 200,
    message: "Attendance management records fetched successfully",
    data: {
      date: targetDate,
      totalWorkingDays,
      stats: {
        totalEmployees: employees.length,
        presentToday: presentTodayCount,
        absentToday: absentTodayCount,
        lateArrivals: lateArrivalsCount,
        hoursLoggedToday: Math.round(totalMinutesLoggedToday / 60),
        hoursLoggedFormatted: formatDurationMinutes(totalMinutesLoggedToday),
      },
      records: rows,
    },
  });
});

/**
 * Lists Pending and Correction Requested attendance entries awaiting Admin approval
 */
const getPendingAttendanceApprovals = asyncHandler(async (req, res) => {
  const { page, limit, skip, sort } = parsePagination(req.query);
  const filter = {
    approvalStatus: { $in: ["Pending", "Correction Requested"] },
  };

  if (req.query.date) {
    filter.attendanceDate = req.query.date;
  }

  const [total, records] = await Promise.all([
    Attendance.countDocuments(filter),
    Attendance.find(filter)
      .populate("employee", "employeeId fullName email department role")
      .sort(sort)
      .skip(skip)
      .limit(limit),
  ]);

  return sendSuccess(res, {
    statusCode: 200,
    message: "Pending attendance records fetched successfully",
    data: records,
    pagination: buildPaginationMeta(total, page, limit),
  });
});

/**
 * Admin Approves or Rejects an Attendance Entry (transfers approved entry to AttendanceRegister)
 */
const reviewAttendance = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { decision, reason, overrideStatus } = req.body;

  const result = await reviewAttendanceByAdmin(
    req.admin,
    id,
    { decision, reason, overrideStatus },
    req
  );

  return sendSuccess(res, {
    statusCode: 200,
    message: `Attendance record ${decision.toLowerCase()} successfully`,
    data: result,
  });
});

/**
 * Official Attendance Register (Main Sheet) Query Endpoint
 */
const getOfficialAttendanceRegister = asyncHandler(async (req, res) => {
  const { page, limit, skip, sort } = parsePagination(req.query);
  const filter = {};

  if (req.query.month) filter.month = Number(req.query.month);
  if (req.query.year) filter.year = Number(req.query.year);
  if (req.query.employeeId) {
    filter.employeeId = String(req.query.employeeId).toUpperCase().trim();
  }
  if (req.query.date) {
    filter.attendanceDate = req.query.date;
  }

  const [total, entries] = await Promise.all([
    AttendanceRegister.countDocuments(filter),
    AttendanceRegister.find(filter)
      .populate("employee", "employeeId fullName email department role")
      .populate("approvedBy", "fullName email")
      .sort(sort)
      .skip(skip)
      .limit(limit),
  ]);

  return sendSuccess(res, {
    statusCode: 200,
    message: "Official attendance register fetched successfully",
    data: entries,
    pagination: buildPaginationMeta(total, page, limit),
  });
});

/**
 * Permanent Attendance Audit Trail Endpoint
 */
const getAttendanceAuditTrail = asyncHandler(async (req, res) => {
  const { page, limit, skip, sort } = parsePagination(req.query);
  const filter = {};

  if (req.query.employeeId) {
    filter.employeeId = String(req.query.employeeId).toUpperCase().trim();
  }
  if (req.query.action) {
    filter.action = req.query.action;
  }

  const [total, logs] = await Promise.all([
    AttendanceAudit.countDocuments(filter),
    AttendanceAudit.find(filter)
      .populate("employee", "employeeId fullName email department")
      .sort(sort)
      .skip(skip)
      .limit(limit),
  ]);

  return sendSuccess(res, {
    statusCode: 200,
    message: "Attendance approval audit trail fetched successfully",
    data: logs,
    pagination: buildPaginationMeta(total, page, limit),
  });
});

/**
 * Bulk Manual Adjustment (matches AttendanceManagement.jsx Manual Adjustment modal)
 */
const manualAdjustAttendance = asyncHandler(async (req, res) => {
  const now = new Date();
  const month = Number(req.body.month) || now.getUTCMonth() + 1;
  const year = Number(req.body.year) || now.getUTCFullYear();
  const { totalWorkingDays, adjustments, reason } = req.body;

  const result = await bulkManualAdjustAttendance(
    req.admin,
    { month, year, totalWorkingDays, adjustments, reason },
    req
  );

  return sendSuccess(res, {
    statusCode: 200,
    message: "Attendance manual adjustments saved successfully",
    data: result,
  });
});

/**
 * Export Attendance CSV (matches Export Attendance button in AttendanceManagement.jsx)
 */
const exportAttendanceCSV = asyncHandler(async (req, res) => {
  const targetDate = req.query.date || toISTDateString(new Date());
  const records = await Attendance.find({ attendanceDate: targetDate }).populate(
    "employee",
    "employeeId fullName department role"
  );

  const headers = [
    "Employee ID",
    "Name",
    "Department",
    "Date",
    "Check-In",
    "Check-Out",
    "Duration",
    "Attendance Status",
    "Approval Status",
    "Late By",
  ];

  const rows = records.map((r) =>
    [
      r.employeeId,
      `"${(r.employee?.fullName || "").replace(/"/g, '""')}"`,
      `"${r.employee?.department || ""}"`,
      r.attendanceDate,
      r.checkInDisplay,
      r.checkOutDisplay,
      r.durationDisplay,
      r.attendanceStatus,
      r.approvalStatus,
      r.lateByDisplay || "On Time",
    ].join(",")
  );

  const csvContent = [headers.join(","), ...rows].join("\n");

  if (req.query.format === "raw") {
    res.setHeader("Content-Type", "text/csv");
    res.setHeader(
      "Content-Disposition",
      `attachment; filename="Attendance_${targetDate}.csv"`
    );
    return res.status(200).send(csvContent);
  }

  return sendSuccess(res, {
    statusCode: 200,
    message: "Attendance CSV exported successfully",
    data: {
      date: targetDate,
      fileName: `Attendance_${targetDate}.csv`,
      totalRecords: records.length,
      csv: csvContent,
    },
  });
});

/**
 * Trigger Auto-Mark Absent Job manually or via scheduler
 */
const triggerAutoAbsentJob = asyncHandler(async (req, res) => {
  const date = req.body?.date || toISTDateString(new Date());
  const result = await runAutoMarkAbsentJob(date);

  return sendSuccess(res, {
    statusCode: 200,
    message: "Auto-mark absent job executed",
    data: result,
  });
});

module.exports = {
  getAdminAttendanceList,
  getPendingAttendanceApprovals,
  reviewAttendance,
  getOfficialAttendanceRegister,
  getAttendanceAuditTrail,
  manualAdjustAttendance,
  exportAttendanceCSV,
  triggerAutoAbsentJob,
};
