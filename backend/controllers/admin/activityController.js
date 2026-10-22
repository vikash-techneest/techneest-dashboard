const LoginHistory = require("../../models/LoginHistory");
const Session = require("../../models/Session");
const Employee = require("../../models/Employee");
const asyncHandler = require("../../utils/asyncHandler");
const { sendSuccess } = require("../../utils/apiResponse");
const {
  parsePagination,
  buildPaginationMeta,
  escapeRegex,
} = require("../../utils/pagination");
const { toISTDateString, formatDurationMinutes } = require("../../utils/dateTime");
const ApiError = require("../../utils/ApiError");

/**
 * Date-wise & Employee-wise Login History (Section 6)
 */
const getLoginHistory = asyncHandler(async (req, res) => {
  const { page, limit, skip, sort } = parsePagination(req.query);
  const filter = { userType: req.query.userType || "Employee" };

  if (req.query.date) {
    filter.loginDate = req.query.date;
  }

  if (req.query.employeeId) {
    filter.employeeId = String(req.query.employeeId).toUpperCase().trim();
  }

  if (req.query.status && req.query.status !== "All") {
    filter.sessionStatus = req.query.status;
  }

  if (req.query.search) {
    const safe = escapeRegex(req.query.search);
    filter.$or = [
      { email: { $regex: safe, $options: "i" } },
      { employeeId: { $regex: safe, $options: "i" } },
      { ipAddress: { $regex: safe, $options: "i" } },
    ];
  }

  const [total, records] = await Promise.all([
    LoginHistory.countDocuments(filter),
    LoginHistory.find(filter)
      .populate("userId", "fullName employeeId email department role")
      .sort(sort)
      .skip(skip)
      .limit(limit),
  ]);

  return sendSuccess(res, {
    statusCode: 200,
    message: "Login history fetched successfully",
    data: records,
    pagination: buildPaginationMeta(total, page, limit),
  });
});

/**
 * Active Sessions across Employees (Section 6)
 */
const getActiveEmployeeSessions = asyncHandler(async (req, res) => {
  const now = new Date();
  const sessions = await Session.find({
    userType: "Employee",
    status: "Active",
    expiresAt: { $gt: now },
  })
    .select("-refreshTokenHash")
    .populate("userId", "fullName employeeId email department role")
    .sort({ lastActivityAt: -1 });

  const formatted = sessions.map((s) => {
    const durationMinutes = Math.max(
      0,
      Math.round((now - new Date(s.loginAt)) / 60000)
    );
    return {
      sessionId: s.sessionId,
      employee: s.userId,
      employeeIdCode: s.employeeIdCode,
      ipAddress: s.ipAddress,
      deviceInfo: s.deviceInfo,
      loginAt: s.loginAt,
      lastActivityAt: s.lastActivityAt,
      sessionDurationMinutes: durationMinutes,
      sessionDurationFormatted: formatDurationMinutes(durationMinutes),
      status: s.status,
    };
  });

  return sendSuccess(res, {
    statusCode: 200,
    message: "Active employee sessions fetched successfully",
    data: formatted,
  });
});

/**
 * Employee Activity Summary (Section 6)
 */
const getEmployeeActivitySummary = asyncHandler(async (req, res) => {
  const targetDate = req.query.date || toISTDateString(new Date());
  const now = new Date();

  const [
    totalActiveEmployees,
    todayLogins,
    activeSessionsCount,
    employeesWithLastLogin,
  ] = await Promise.all([
    Employee.countDocuments({ isDeleted: false, status: "Active" }),
    LoginHistory.find({
      userType: "Employee",
      loginDate: targetDate,
      sessionStatus: { $in: ["Active", "Completed"] },
    }).sort({ loginTimestampUTC: -1 }),
    Session.countDocuments({
      userType: "Employee",
      status: "Active",
      expiresAt: { $gt: now },
    }),
    Employee.find(
      { isDeleted: false },
      "employeeId fullName email department role lastLoginAt lastLoginIp lastActivityAt"
    )
      .sort({ lastLoginAt: -1 })
      .limit(50),
  ]);

  const totalSessionMinutesToday = todayLogins.reduce(
    (sum, item) => sum + Number(item.sessionDurationMinutes || 0),
    0
  );

  return sendSuccess(res, {
    statusCode: 200,
    message: "Employee activity summary fetched successfully",
    data: {
      date: targetDate,
      timezone: "Asia/Kolkata",
      totalActiveEmployees,
      activeSessionsCount,
      todayLoginCount: todayLogins.length,
      totalSessionDurationToday: formatDurationMinutes(totalSessionMinutesToday),
      employeesActivity: employeesWithLastLogin,
    },
  });
});

/**
 * Force Revoke an Employee Session
 */
const revokeEmployeeSessionByAdmin = asyncHandler(async (req, res) => {
  const { sessionId } = req.params;
  const now = new Date();

  const session = await Session.findOne({ sessionId, userType: "Employee" });
  if (!session) {
    throw new ApiError(404, "Employee session not found");
  }

  session.status = "Revoked";
  session.logoutAt = now;
  await session.save();

  await LoginHistory.findOneAndUpdate(
    { sessionId },
    {
      $set: {
        sessionStatus: "Revoked",
        logoutTimestampUTC: now,
      },
    }
  );

  return sendSuccess(res, {
    statusCode: 200,
    message: "Employee session revoked successfully",
    data: { sessionId, status: "Revoked" },
  });
});

module.exports = {
  getLoginHistory,
  getActiveEmployeeSessions,
  getEmployeeActivitySummary,
  revokeEmployeeSessionByAdmin,
};
