const mongoose = require("mongoose");
const { getOrCreateActivePolicy } = require("../../services/attendance/attendanceService");
const { Role, DEFAULT_PERMISSIONS } = require("../../models/Role");
const Leave = require("../../models/Leave");
const Holiday = require("../../models/Holiday");
const Notification = require("../../models/Notification");
const AuditLog = require("../../models/AuditLog");
const AttendanceRegister = require("../../models/AttendanceRegister");
const { refreshEmployeeAttendanceSummary } = require("../../services/attendance/attendanceService");
const asyncHandler = require("../../utils/asyncHandler");
const { sendSuccess } = require("../../utils/apiResponse");
const { parsePagination, buildPaginationMeta } = require("../../utils/pagination");
const { parseTimeStringToMinutes } = require("../../utils/dateTime");
const { recordAuditLog } = require("../../utils/auditLogger");
const ApiError = require("../../utils/ApiError");

/**
 * Get Settings & Attendance Policy (matches Settings.jsx)
 */
const getSettings = asyncHandler(async (req, res) => {
  const policy = await getOrCreateActivePolicy();

  return sendSuccess(res, {
    statusCode: 200,
    message: "Settings and attendance policy fetched successfully",
    data: {
      settings: {
        loginTime: policy.standardLoginTime,
        logoutTime: policy.standardLogoutTime,
        lateThreshold: policy.lateThresholdTime,
        gracePeriodMinutes: policy.gracePeriodMinutes,
        fullDayMinHours: policy.fullDayMinHours,
        halfDayMinHours: policy.halfDayMinHours,
        autoAbsent: policy.autoMarkAbsent,
        overtimeApproval: policy.overtimeRequiresApproval,
        emailNotifications: policy.emailNotificationsEnabled,
        pushNotifications: policy.pushNotificationsEnabled,
        ipWhitelisting: policy.ipWhitelistingEnabled,
        allowedIpAddresses: policy.allowedIpAddresses,
        weeklyOffDays: policy.weeklyOffDays,
      },
      policy,
    },
  });
});

/**
 * Update Settings & Attendance Policy (matches Settings.jsx handleSave)
 */
const updateSettings = asyncHandler(async (req, res) => {
  const policy = await getOrCreateActivePolicy();
  const {
    loginTime,
    logoutTime,
    lateThreshold,
    autoAbsent,
    overtimeApproval,
    emailNotifications,
    pushNotifications,
    ipWhitelisting,
    allowedIpAddresses,
    fullDayMinHours,
    halfDayMinHours,
    weeklyOffDays,
  } = req.body;

  if (loginTime) policy.standardLoginTime = String(loginTime).trim();
  if (logoutTime) policy.standardLogoutTime = String(logoutTime).trim();
  if (lateThreshold) policy.lateThresholdTime = String(lateThreshold).trim();

  if (policy.standardLoginTime && policy.lateThresholdTime) {
    const diff =
      parseTimeStringToMinutes(policy.lateThresholdTime) -
      parseTimeStringToMinutes(policy.standardLoginTime);
    policy.gracePeriodMinutes = Math.max(0, diff);
  }

  if (autoAbsent !== undefined) policy.autoMarkAbsent = Boolean(autoAbsent);
  if (overtimeApproval !== undefined)
    policy.overtimeRequiresApproval = Boolean(overtimeApproval);
  if (emailNotifications !== undefined)
    policy.emailNotificationsEnabled = Boolean(emailNotifications);
  if (pushNotifications !== undefined)
    policy.pushNotificationsEnabled = Boolean(pushNotifications);
  if (ipWhitelisting !== undefined)
    policy.ipWhitelistingEnabled = Boolean(ipWhitelisting);
  if (Array.isArray(allowedIpAddresses))
    policy.allowedIpAddresses = allowedIpAddresses;
  if (fullDayMinHours !== undefined)
    policy.fullDayMinHours = Number(fullDayMinHours);
  if (halfDayMinHours !== undefined)
    policy.halfDayMinHours = Number(halfDayMinHours);
  if (Array.isArray(weeklyOffDays)) policy.weeklyOffDays = weeklyOffDays;

  await policy.save();

  await recordAuditLog({
    req,
    actorType: "Admin",
    actorId: req.admin._id,
    actorEmail: req.admin.email,
    action: "SETTINGS_UPDATED",
    module: "SETTINGS",
    targetId: policy._id,
    description: "Updated system settings and attendance policy configuration",
  });

  return sendSuccess(res, {
    statusCode: 200,
    message: "Settings saved successfully",
    data: {
      settings: {
        loginTime: policy.standardLoginTime,
        logoutTime: policy.standardLogoutTime,
        lateThreshold: policy.lateThresholdTime,
        autoAbsent: policy.autoMarkAbsent,
        overtimeApproval: policy.overtimeRequiresApproval,
        emailNotifications: policy.emailNotificationsEnabled,
        pushNotifications: policy.pushNotificationsEnabled,
        ipWhitelisting: policy.ipWhitelistingEnabled,
        allowedIpAddresses: policy.allowedIpAddresses,
      },
      policy,
    },
  });
});

/**
 * Leave Management (Admin)
 */
const listLeaves = asyncHandler(async (req, res) => {
  const { page, limit, skip, sort } = parsePagination(req.query);
  const filter = {};
  if (req.query.status && req.query.status !== "All") {
    filter.status = req.query.status;
  }
  if (req.query.employeeId) {
    filter.employeeId = String(req.query.employeeId).toUpperCase().trim();
  }

  const [total, leaves] = await Promise.all([
    Leave.countDocuments(filter),
    Leave.find(filter)
      .populate("employee", "employeeId fullName email department role")
      .sort(sort)
      .skip(skip)
      .limit(limit),
  ]);

  return sendSuccess(res, {
    statusCode: 200,
    message: "Leave requests fetched successfully",
    data: leaves,
    pagination: buildPaginationMeta(total, page, limit),
  });
});

const reviewLeaveRequest = asyncHandler(async (req, res) => {
  const leave = await Leave.findById(req.params.id);
  if (!leave) {
    throw new ApiError(404, "Leave request not found");
  }

  const { status, reviewComment = "" } = req.body;
  if (!["Approved", "Rejected"].includes(status)) {
    throw new ApiError(400, "Leave review status must be 'Approved' or 'Rejected'");
  }

  leave.status = status;
  leave.reviewedBy = req.admin._id;
  leave.reviewedAt = new Date();
  leave.reviewComment = reviewComment;
  await leave.save();

  // If approved, record in AttendanceRegister for the leave start date and refresh summary
  const [yStr, mStr] = leave.startDate.split("-");
  const year = Number(yStr);
  const month = Number(mStr);

  if (status === "Approved") {
    await AttendanceRegister.findOneAndUpdate(
      { employee: leave.employee, attendanceDate: leave.startDate },
      {
        $set: {
          employee: leave.employee,
          employeeId: leave.employeeId,
          attendanceDate: leave.startDate,
          month,
          year,
          officialStatus: leave.isPaid ? "Paid Leave" : "Unpaid Leave",
          payableDayValue: leave.isPaid ? (leave.isHalfDay ? 0.5 : 1.0) : 0.0,
          approvedBy: req.admin._id,
          approvedAt: new Date(),
          remarks: `Approved ${leave.leaveType}: ${leave.reason}`,
        },
      },
      { upsert: true, returnDocument: "after" }
    );
    await refreshEmployeeAttendanceSummary(leave.employee, month, year);
  }

  await recordAuditLog({
    req,
    actorType: "Admin",
    actorId: req.admin._id,
    actorEmail: req.admin.email,
    action: `LEAVE_${status.toUpperCase()}`,
    module: "LEAVE",
    targetId: leave._id,
    description: `${status} leave request for ${leave.employeeId} (${leave.startDate} to ${leave.endDate})`,
  });

  return sendSuccess(res, {
    statusCode: 200,
    message: `Leave request ${status.toLowerCase()} successfully`,
    data: leave,
  });
});

/**
 * Holiday Management (Admin)
 */
const listHolidays = asyncHandler(async (req, res) => {
  const filter = {};
  if (req.query.year) filter.year = Number(req.query.year);
  if (req.query.month) filter.month = Number(req.query.month);

  const holidays = await Holiday.find(filter).sort({ date: 1 });

  return sendSuccess(res, {
    statusCode: 200,
    message: "Holidays fetched successfully",
    data: holidays,
  });
});

const createHoliday = asyncHandler(async (req, res) => {
  const { name, date, type = "Company", isPaid = true, description = "" } = req.body;
  const [yearStr, monthStr] = String(date).split("-");

  const holiday = await Holiday.create({
    name: String(name).trim(),
    date,
    month: Number(monthStr),
    year: Number(yearStr),
    type,
    isPaid: Boolean(isPaid),
    description,
  });

  return sendSuccess(res, {
    statusCode: 201,
    message: "Holiday created successfully",
    data: holiday,
  });
});

const deleteHoliday = asyncHandler(async (req, res) => {
  const holiday = await Holiday.findByIdAndDelete(req.params.id);
  if (!holiday) {
    throw new ApiError(404, "Holiday not found");
  }

  return sendSuccess(res, {
    statusCode: 200,
    message: "Holiday deleted successfully",
    data: { deletedId: holiday._id },
  });
});

/**
 * Role & Permission Management (Admin)
 */
const listRoles = asyncHandler(async (req, res) => {
  const roles = await Role.find().sort({ createdAt: 1 });
  return sendSuccess(res, {
    statusCode: 200,
    message: "Roles and permissions fetched successfully",
    data: {
      availablePermissions: DEFAULT_PERMISSIONS,
      roles,
    },
  });
});

const createRole = asyncHandler(async (req, res) => {
  const { name, description = "", permissions = [] } = req.body;
  if (!name || String(name).trim() === "") {
    throw new ApiError(400, "Role name is required");
  }

  const slug = String(name)
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "_");

  const existing = await Role.findOne({ slug });
  if (existing) {
    throw new ApiError(409, "A role with this name already exists");
  }

  const role = await Role.create({
    name: String(name).trim(),
    slug,
    description,
    permissions: Array.isArray(permissions) ? permissions : [],
    isSystemRole: false,
  });

  return sendSuccess(res, {
    statusCode: 201,
    message: "Role created successfully",
    data: role,
  });
});

const updateRole = asyncHandler(async (req, res) => {
  const role = await Role.findById(req.params.id);
  if (!role) {
    throw new ApiError(404, "Role not found");
  }

  const { name, description, permissions, isActive } = req.body;
  if (name) role.name = String(name).trim();
  if (description !== undefined) role.description = description;
  if (Array.isArray(permissions)) role.permissions = permissions;
  if (isActive !== undefined) role.isActive = Boolean(isActive);

  await role.save();

  return sendSuccess(res, {
    statusCode: 200,
    message: "Role updated successfully",
    data: role,
  });
});

/**
 * Notifications Management (Admin)
 */
const listAdminNotifications = asyncHandler(async (req, res) => {
  const notifications = await Notification.find({
    $or: [
      { recipientType: "AllAdmins" },
      { recipientType: "Admin", recipientId: req.admin._id },
    ],
  })
    .sort({ createdAt: -1 })
    .limit(50);

  return sendSuccess(res, {
    statusCode: 200,
    message: "Notifications fetched successfully",
    data: notifications,
  });
});

const markNotificationRead = asyncHandler(async (req, res) => {
  const notif = await Notification.findById(req.params.id);
  if (!notif) {
    throw new ApiError(404, "Notification not found");
  }

  notif.isRead = true;
  notif.readAt = new Date();
  await notif.save();

  return sendSuccess(res, {
    statusCode: 200,
    message: "Notification marked as read",
    data: notif,
  });
});

/**
 * Security & Action Audit Logs (Admin)
 */
const listAuditLogs = asyncHandler(async (req, res) => {
  const { page, limit, skip, sort } = parsePagination(req.query);
  const filter = {};
  if (req.query.module) filter.module = req.query.module;
  if (req.query.actorType) filter.actorType = req.query.actorType;

  const [total, logs] = await Promise.all([
    AuditLog.countDocuments(filter),
    AuditLog.find(filter).sort(sort).skip(skip).limit(limit),
  ]);

  return sendSuccess(res, {
    statusCode: 200,
    message: "System audit logs fetched successfully",
    data: logs,
    pagination: buildPaginationMeta(total, page, limit),
  });
});

module.exports = {
  getSettings,
  updateSettings,
  listLeaves,
  reviewLeaveRequest,
  listHolidays,
  createHoliday,
  deleteHoliday,
  listRoles,
  createRole,
  updateRole,
  listAdminNotifications,
  markNotificationRead,
  listAuditLogs,
};
