const fs = require("fs");
const Attendance = require("../../models/Attendance");
const Task = require("../../models/Task");
const Leave = require("../../models/Leave");
const Payslip = require("../../models/Payslip");
const Notification = require("../../models/Notification");
const {
  loginEmployee,
  rotateRefreshToken,
  logoutSession,
} = require("../../services/auth/authService");
const {
  employeeCheckIn,
  employeeCheckOut,
  requestAttendanceCorrection,
} = require("../../services/attendance/attendanceService");
const { MONTH_NAMES } = require("../../services/payroll/payrollService");
const { generatePayslipPdfBuffer } = require("../../utils/pdfGenerator");
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

const COOKIE_OPTIONS = {
  httpOnly: true,
  secure: process.env.NODE_ENV === "production",
  sameSite: "lax",
};

/**
 * Employee Authentication (Login, Refresh, Logout)
 */
const login = asyncHandler(async (req, res) => {
  const { email, password, rememberMe } = req.body;
  const result = await loginEmployee({ email, password, rememberMe }, req);

  res.cookie("refreshToken", result.refreshToken, {
    ...COOKIE_OPTIONS,
    maxAge: (rememberMe ? 30 : 7) * 24 * 60 * 60 * 1000,
  });

  return sendSuccess(res, {
    statusCode: 200,
    message: "Employee logged in successfully",
    data: {
      employee: result.employee,
      accessToken: result.accessToken,
      refreshToken: result.refreshToken,
      sessionId: result.sessionId,
      expiresAt: result.expiresAt,
      loginHistory: result.loginHistoryRecord,
    },
  });
});

const refresh = asyncHandler(async (req, res) => {
  const rawRefreshToken =
    req.body?.refreshToken || req.cookies?.refreshToken || null;
  const rotated = await rotateRefreshToken(rawRefreshToken, req);

  res.cookie("refreshToken", rotated.refreshToken, {
    ...COOKIE_OPTIONS,
    maxAge: 7 * 24 * 60 * 60 * 1000,
  });

  return sendSuccess(res, {
    statusCode: 200,
    message: "Employee token refreshed successfully",
    data: rotated,
  });
});

const logout = asyncHandler(async (req, res) => {
  const sessionId = req.session?.sessionId || req.body?.sessionId;
  const result = await logoutSession(
    sessionId,
    "Employee",
    req.employee._id,
    req
  );

  res.clearCookie("refreshToken", COOKIE_OPTIONS);
  res.clearCookie("accessToken", COOKIE_OPTIONS);

  return sendSuccess(res, {
    statusCode: 200,
    message: "Employee logged out successfully",
    data: result,
  });
});

/**
 * Employee Dashboard Overview (matches UserPages/Dashboard.jsx and UserSidebar.jsx)
 */
const getEmployeeDashboard = asyncHandler(async (req, res) => {
  const emp = req.employee;
  const todayStr = toISTDateString(new Date());
  const now = new Date();
  const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);

  const [
    assignedTasksCount,
    completedThisWeekCount,
    inProgressCount,
    priorityTasks,
    todayAttendance,
    weekAttendances,
  ] = await Promise.all([
    Task.countDocuments({
      assignee: emp._id,
      isDeleted: false,
      status: { $nin: ["Completed", "Done"] },
    }),
    Task.countDocuments({
      assignee: emp._id,
      isDeleted: false,
      status: { $in: ["Completed", "Done"] },
      updatedAt: { $gte: sevenDaysAgo },
    }),
    Task.countDocuments({
      assignee: emp._id,
      isDeleted: false,
      status: "In Progress",
    }),
    Task.find({
      assignee: emp._id,
      isDeleted: false,
      status: { $nin: ["Completed", "Done"] },
    })
      .sort({ dueDate: 1 })
      .limit(5),
    Attendance.findOne({
      employee: emp._id,
      attendanceDate: todayStr,
    }),
    Attendance.find({
      employee: emp._id,
      checkInTime: { $gte: sevenDaysAgo },
    }),
  ]);

  let todayMinutes = 0;
  if (todayAttendance) {
    if (todayAttendance.checkOutTime) {
      todayMinutes = todayAttendance.workingDurationMinutes || 0;
    } else if (todayAttendance.checkInTime) {
      todayMinutes = Math.max(
        0,
        Math.round((now - new Date(todayAttendance.checkInTime)) / 60000)
      );
    }
  }

  const weekMinutes = weekAttendances.reduce(
    (sum, a) => sum + Number(a.workingDurationMinutes || 0),
    0
  );

  return sendSuccess(res, {
    statusCode: 200,
    message: "Employee dashboard fetched successfully",
    data: {
      statsCards: {
        assignedTasks: assignedTasksCount,
        completedThisWeek: completedThisWeekCount,
        inProgress: inProgressCount,
        hoursLoggedToday: formatDurationMinutes(todayMinutes),
      },
      sidebarQuickStats: {
        assigned: assignedTasksCount,
        done: completedThisWeekCount,
        workHours: `${Math.round(weekMinutes / 60)}h`,
      },
      priorityTasks,
      todaysAttendance: {
        isClockedIn: Boolean(
          todayAttendance &&
            todayAttendance.checkInTime &&
            !todayAttendance.checkOutTime
        ),
        clockInTime: todayAttendance ? todayAttendance.checkInDisplay : "—",
        clockOutTime: todayAttendance ? todayAttendance.checkOutDisplay : "—",
        workedSoFar: formatDurationMinutes(todayMinutes),
        status: todayAttendance ? todayAttendance.attendanceStatus : "Absent",
        approvalStatus: todayAttendance
          ? todayAttendance.approvalStatus
          : "None",
      },
    },
  });
});

/**
 * Employee Self-Attendance APIs (matches UserPages/Attendance.jsx & Section 7)
 */
const checkIn = asyncHandler(async (req, res) => {
  const attendance = await employeeCheckIn(req.employee, req);

  return sendSuccess(res, {
    statusCode: 201,
    message: "Checked in successfully. Attendance record is pending admin approval.",
    data: attendance,
  });
});

const checkOut = asyncHandler(async (req, res) => {
  const attendance = await employeeCheckOut(req.employee, req);

  return sendSuccess(res, {
    statusCode: 200,
    message: "Checked out successfully. Working duration recorded.",
    data: attendance,
  });
});

const requestCorrection = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { requestedCheckInTime, requestedCheckOutTime, reason } = req.body;

  const updated = await requestAttendanceCorrection(
    req.employee,
    id,
    { requestedCheckInTime, requestedCheckOutTime, reason },
    req
  );

  return sendSuccess(res, {
    statusCode: 200,
    message: "Attendance correction request submitted for admin approval",
    data: updated,
  });
});

const getMyAttendanceDashboardAndHistory = asyncHandler(async (req, res) => {
  const emp = req.employee;
  const { page, limit, skip, sort } = parsePagination(req.query);
  const todayStr = toISTDateString(new Date());
  const now = new Date();
  const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);

  const filter = { employee: emp._id };
  if (req.query.month) filter.month = Number(req.query.month);
  if (req.query.year) filter.year = Number(req.query.year);
  if (req.query.approvalStatus) filter.approvalStatus = req.query.approvalStatus;

  const [total, history, todayRecord, weekRecords] = await Promise.all([
    Attendance.countDocuments(filter),
    Attendance.find(filter)
      .sort(req.query.sortBy ? sort : { attendanceDate: -1 })
      .skip(skip)
      .limit(limit),
    Attendance.findOne({ employee: emp._id, attendanceDate: todayStr }),
    Attendance.find({
      employee: emp._id,
      checkInTime: { $gte: sevenDaysAgo },
    }),
  ]);

  let todayMins = 0;
  if (todayRecord) {
    todayMins = todayRecord.checkOutTime
      ? todayRecord.workingDurationMinutes
      : Math.max(0, Math.round((now - new Date(todayRecord.checkInTime)) / 60000));
  }

  const weekMins = weekRecords.reduce(
    (sum, r) => sum + Number(r.workingDurationMinutes || 0),
    0
  );

  return sendSuccess(res, {
    statusCode: 200,
    message: "Employee attendance history and dashboard fetched successfully",
    data: {
      topCards: {
        todaysWorkTime: formatDurationMinutes(todayMins),
        clockedInAt: todayRecord ? todayRecord.checkInDisplay : "—",
        thisWeekWorkTime: formatDurationMinutes(weekMins),
        thisWeekDays: weekRecords.length,
        attendanceTodayStatus: todayRecord
          ? todayRecord.attendanceStatus
          : "Absent",
        todayDate: todayStr,
      },
      currentSession: {
        isClockedIn: Boolean(
          todayRecord && todayRecord.checkInTime && !todayRecord.checkOutTime
        ),
        startTime: todayRecord ? todayRecord.checkInDisplay : "—",
        date: todayStr,
      },
      summary: emp.attendanceSummary,
      history,
    },
    pagination: buildPaginationMeta(total, page, limit),
  });
});

/**
 * Employee Tasks APIs (matches UserPages/MyTasks.jsx & UserPages/CreateTask.jsx)
 */
const getMyTasks = asyncHandler(async (req, res) => {
  const emp = req.employee;
  const { page, limit, skip, sort } = parsePagination(req.query);

  const filter = { assignee: emp._id, isDeleted: false };

  // Tab filter: "All Tasks", "Assigned by Admin", "My Tasks"
  if (
    req.query.tab === "Assigned by Admin" ||
    req.query.taskType === "AdminAssigned"
  ) {
    filter.taskType = "AdminAssigned";
  } else if (
    req.query.tab === "My Tasks" ||
    req.query.taskType === "Personal"
  ) {
    filter.taskType = "Personal";
  }

  if (req.query.status && req.query.status !== "All Status") {
    filter.status = req.query.status;
  }
  if (req.query.priority && req.query.priority !== "Priority") {
    filter.priority = req.query.priority;
  }
  if (req.query.search) {
    const safe = escapeRegex(req.query.search.trim());
    filter.$or = [
      { title: { $regex: safe, $options: "i" } },
      { project: { $regex: safe, $options: "i" } },
    ];
  }

  const [total, tasks, allCount, adminAssignedCount, personalCount] =
    await Promise.all([
      Task.countDocuments(filter),
      Task.find(filter).sort(sort).skip(skip).limit(limit),
      Task.countDocuments({ assignee: emp._id, isDeleted: false }),
      Task.countDocuments({
        assignee: emp._id,
        taskType: "AdminAssigned",
        isDeleted: false,
      }),
      Task.countDocuments({
        assignee: emp._id,
        taskType: "Personal",
        isDeleted: false,
      }),
    ]);

  return sendSuccess(res, {
    statusCode: 200,
    message: "Employee tasks fetched successfully",
    data: {
      tabs: {
        allTasks: allCount,
        assignedByAdmin: adminAssignedCount,
        myTasks: personalCount,
      },
      tasks,
    },
    pagination: buildPaginationMeta(total, page, limit),
  });
});

const createPersonalTask = asyncHandler(async (req, res) => {
  const emp = req.employee;
  const {
    title,
    dueDate,
    priority = "Medium",
    project = "Personal development",
    description = "",
  } = req.body;

  const task = await Task.create({
    title: String(title).trim(),
    description: String(description).trim(),
    project: String(project).trim(),
    taskType: "Personal",
    assignee: emp._id,
    assigneeName: emp.fullName,
    assigneeEmployeeId: emp.employeeId,
    priority,
    status: "To Do",
    startDate: new Date(),
    dueDate: new Date(dueDate),
    notifyEmployee: false,
  });

  return sendSuccess(res, {
    statusCode: 201,
    message: "Personal task created successfully",
    data: task,
  });
});

const updateMyTaskStatus = asyncHandler(async (req, res) => {
  const emp = req.employee;
  const task = await Task.findOne({
    _id: req.params.id,
    assignee: emp._id,
    isDeleted: false,
  });

  if (!task) {
    throw new ApiError(404, "Task not found or does not belong to you");
  }

  const { status, title, description, priority, dueDate } = req.body;
  if (status) {
    task.status = status;
    if (["Completed", "Done"].includes(status)) {
      task.completedAt = new Date();
    }
  }

  // Personal tasks can also have their title/description edited by the employee
  if (task.taskType === "Personal") {
    if (title) task.title = String(title).trim();
    if (description !== undefined) task.description = String(description).trim();
    if (priority) task.priority = priority;
    if (dueDate) task.dueDate = new Date(dueDate);
  }

  await task.save();

  return sendSuccess(res, {
    statusCode: 200,
    message: "Task updated successfully",
    data: task,
  });
});

/**
 * Employee Work Reports & My Profile (matches UserPages/WorkReports.jsx)
 */
const getWorkReportsAndProfile = asyncHandler(async (req, res) => {
  const emp = req.employee;
  const now = new Date();
  const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);

  const [completedWeekTasks, recentCompletedTasks] = await Promise.all([
    Task.find({
      assignee: emp._id,
      isDeleted: false,
      status: { $in: ["Completed", "Done"] },
      updatedAt: { $gte: sevenDaysAgo },
    }),
    Task.find({
      assignee: emp._id,
      isDeleted: false,
      status: { $in: ["Completed", "Done"] },
    })
      .sort({ completedAt: -1, updatedAt: -1 })
      .limit(6),
  ]);

  const dayNames = ["SUN", "MON", "TUE", "WED", "THU", "FRI", "SAT"];
  const counts = { MON: 0, TUE: 0, WED: 0, THU: 0, FRI: 0 };
  for (const t of completedWeekTasks) {
    const d = dayNames[new Date(t.updatedAt).getUTCDay()];
    if (counts[d] !== undefined) counts[d]++;
  }

  const weeklyProductivity = ["MON", "TUE", "WED", "THU", "FRI"].map(
    (day) => ({
      day,
      value: counts[day],
    })
  );

  return sendSuccess(res, {
    statusCode: 200,
    message: "Employee work reports and profile fetched successfully",
    data: {
      profile: {
        _id: emp._id,
        employeeId: emp.employeeId,
        fullName: emp.fullName,
        email: emp.email,
        phone: emp.phone,
        department: emp.department,
        role: emp.role,
        designation: emp.designation,
        joiningDate: emp.joiningDate,
        status: emp.status,
      },
      weeklyProductivity,
      recentlyCompleted: recentCompletedTasks.map((t) => ({
        id: t._id,
        title: t.title,
        project: t.project,
        completedAt: t.completedAt || t.updatedAt,
      })),
    },
  });
});

const updateMyProfile = asyncHandler(async (req, res) => {
  const emp = req.employee;
  const { fullName, phone, currentPassword, newPassword } = req.body;

  if (fullName) emp.fullName = String(fullName).trim();
  if (phone !== undefined) emp.phone = String(phone).trim();

  if (newPassword) {
    if (!currentPassword) {
      throw new ApiError(
        400,
        "Current password is required to set a new password"
      );
    }
    const empWithPass = await emp.constructor
      .findById(emp._id)
      .select("+password");
    const isMatch = await empWithPass.comparePassword(currentPassword);
    if (!isMatch) {
      throw new ApiError(400, "Current password is incorrect");
    }
    emp.password = newPassword;
  }

  await emp.save();

  return sendSuccess(res, {
    statusCode: 200,
    message: "Profile updated successfully",
    data: emp,
  });
});

/**
 * Employee Leave Requests (Self-only)
 */
const applyForLeave = asyncHandler(async (req, res) => {
  const emp = req.employee;
  const {
    leaveType,
    startDate,
    endDate,
    isHalfDay = false,
    reason,
  } = req.body;

  const start = new Date(startDate);
  const end = new Date(endDate);
  if (end < start) {
    throw new ApiError(400, "End date cannot be earlier than start date");
  }

  const diffDays = Math.floor((end - start) / (1000 * 60 * 60 * 24)) + 1;
  const totalDays = isHalfDay ? 0.5 : Math.max(1, diffDays);

  const leave = await Leave.create({
    employee: emp._id,
    employeeId: emp.employeeId,
    leaveType,
    isPaid: leaveType !== "Unpaid Leave",
    startDate,
    endDate,
    totalDays,
    isHalfDay: Boolean(isHalfDay),
    reason: String(reason).trim(),
    status: "Pending",
  });

  return sendSuccess(res, {
    statusCode: 201,
    message: "Leave application submitted successfully",
    data: leave,
  });
});

const getMyLeaves = asyncHandler(async (req, res) => {
  const leaves = await Leave.find({ employee: req.employee._id }).sort({
    createdAt: -1,
  });

  return sendSuccess(res, {
    statusCode: 200,
    message: "My leave requests fetched successfully",
    data: leaves,
  });
});

/**
 * Employee Payslips (Strict employee-level isolation: can only view/download own payslips)
 */
const getMyPayslips = asyncHandler(async (req, res) => {
  const payslips = await Payslip.find({ employee: req.employee._id }).sort({
    year: -1,
    month: -1,
  });

  return sendSuccess(res, {
    statusCode: 200,
    message: "My payslips fetched successfully",
    data: payslips,
  });
});

const downloadMyPayslip = asyncHandler(async (req, res) => {
  const payslip = await Payslip.findById(req.params.id).select("+filePath");
  if (!payslip) {
    throw new ApiError(404, "Payslip not found");
  }

  // Enforce strict employee-level data isolation
  if (String(payslip.employee) !== String(req.employee._id)) {
    throw new ApiError(
      403,
      "Forbidden: You are not authorized to download another employee's salary slip"
    );
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

const getMyNotifications = asyncHandler(async (req, res) => {
  const notifications = await Notification.find({
    $or: [
      { recipientType: "AllEmployees" },
      { recipientType: "Employee", recipientId: req.employee._id },
    ],
  })
    .sort({ createdAt: -1 })
    .limit(30);

  return sendSuccess(res, {
    statusCode: 200,
    message: "Notifications fetched successfully",
    data: notifications,
  });
});

module.exports = {
  login,
  refresh,
  logout,
  getEmployeeDashboard,
  checkIn,
  checkOut,
  requestCorrection,
  getMyAttendanceDashboardAndHistory,
  getMyTasks,
  createPersonalTask,
  updateMyTaskStatus,
  getWorkReportsAndProfile,
  updateMyProfile,
  applyForLeave,
  getMyLeaves,
  getMyPayslips,
  downloadMyPayslip,
  getMyNotifications,
};
