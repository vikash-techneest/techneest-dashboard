const Session = require("../../models/Session");
const LoginHistory = require("../../models/LoginHistory");
const {
  setupInitialAdmin,
  loginAdmin,
  rotateRefreshToken,
  logoutSession,
  changeAdminPassword,
  forgotAdminPassword,
  resetAdminPassword,
} = require("../../services/auth/authService");
const asyncHandler = require("../../utils/asyncHandler");
const { sendSuccess } = require("../../utils/apiResponse");
const { parsePagination, buildPaginationMeta } = require("../../utils/pagination");
const ApiError = require("../../utils/ApiError");

const COOKIE_OPTIONS = {
  httpOnly: true,
  secure: process.env.NODE_ENV === "production",
  sameSite: "lax",
};

const setupAdmin = asyncHandler(async (req, res) => {
  const { fullName, email, password, setupSecretKey } = req.body;
  const admin = await setupInitialAdmin(
    { fullName, email, password, setupSecretKey },
    req
  );

  return sendSuccess(res, {
    statusCode: 201,
    message: "Initial administrator account configured successfully",
    data: { admin },
  });
});

const login = asyncHandler(async (req, res) => {
  const { email, password, rememberMe } = req.body;
  const result = await loginAdmin({ email, password, rememberMe }, req);

  res.cookie("refreshToken", result.refreshToken, {
    ...COOKIE_OPTIONS,
    maxAge: (rememberMe ? 30 : 7) * 24 * 60 * 60 * 1000,
  });

  return sendSuccess(res, {
    statusCode: 200,
    message: "Admin logged in successfully",
    data: {
      admin: result.admin,
      accessToken: result.accessToken,
      refreshToken: result.refreshToken,
      sessionId: result.sessionId,
      expiresAt: result.expiresAt,
      lastLoginAt: result.previousLoginAt,
      ipAddress: result.ipAddress,
      deviceInfo: result.deviceInfo,
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
    message: "Token refreshed successfully",
    data: rotated,
  });
});

const logout = asyncHandler(async (req, res) => {
  const sessionId = req.session?.sessionId || req.body?.sessionId;
  const result = await logoutSession(sessionId, "Admin", req.admin._id, req);

  res.clearCookie("refreshToken", COOKIE_OPTIONS);
  res.clearCookie("accessToken", COOKIE_OPTIONS);

  return sendSuccess(res, {
    statusCode: 200,
    message: "Admin logged out successfully",
    data: result,
  });
});

const getProfile = asyncHandler(async (req, res) => {
  return sendSuccess(res, {
    statusCode: 200,
    message: "Admin profile fetched successfully",
    data: {
      admin: req.admin,
      currentSessionId: req.session?.sessionId || null,
    },
  });
});

const updateProfile = asyncHandler(async (req, res) => {
  const { fullName } = req.body;
  if (fullName) {
    req.admin.fullName = String(fullName).trim();
    await req.admin.save();
  }

  return sendSuccess(res, {
    statusCode: 200,
    message: "Admin profile updated successfully",
    data: { admin: req.admin },
  });
});

const changePassword = asyncHandler(async (req, res) => {
  const { currentPassword, newPassword } = req.body;
  await changeAdminPassword(
    req.admin._id,
    { currentPassword, newPassword },
    req
  );

  return sendSuccess(res, {
    statusCode: 200,
    message: "Password changed successfully",
    data: null,
  });
});

const forgotPassword = asyncHandler(async (req, res) => {
  const { email } = req.body;
  const result = await forgotAdminPassword(email, req);

  return sendSuccess(res, {
    statusCode: 200,
    message: "Password reset request processed",
    data: result,
  });
});

const resetPassword = asyncHandler(async (req, res) => {
  const { token, newPassword } = req.body;
  await resetAdminPassword({ token, newPassword }, req);

  return sendSuccess(res, {
    statusCode: 200,
    message: "Password has been reset successfully. Please log in with your new password.",
    data: null,
  });
});

const getAdminSessions = asyncHandler(async (req, res) => {
  const sessions = await Session.find({
    userType: "Admin",
    userId: req.admin._id,
  })
    .select("-refreshTokenHash")
    .sort({ loginAt: -1 })
    .limit(50);

  return sendSuccess(res, {
    statusCode: 200,
    message: "Admin sessions fetched successfully",
    data: sessions,
  });
});

const revokeAdminSession = asyncHandler(async (req, res) => {
  const { sessionId } = req.params;
  const session = await Session.findOne({
    sessionId,
    userType: "Admin",
    userId: req.admin._id,
  });

  if (!session) {
    throw new ApiError(404, "Session not found");
  }

  session.status = "Revoked";
  session.logoutAt = new Date();
  await session.save();

  return sendSuccess(res, {
    statusCode: 200,
    message: "Session revoked successfully",
    data: { sessionId: session.sessionId, status: session.status },
  });
});

const getAdminLoginHistory = asyncHandler(async (req, res) => {
  const { page, limit, skip, sort } = parsePagination(req.query);
  const filter = { userType: "Admin" };

  if (req.query.status) {
    filter.sessionStatus = req.query.status;
  }

  const [total, logs] = await Promise.all([
    LoginHistory.countDocuments(filter),
    LoginHistory.find(filter).sort(sort).skip(skip).limit(limit),
  ]);

  return sendSuccess(res, {
    statusCode: 200,
    message: "Admin login audit history fetched successfully",
    data: logs,
    pagination: buildPaginationMeta(total, page, limit),
  });
});

module.exports = {
  setupAdmin,
  login,
  refresh,
  logout,
  getProfile,
  updateProfile,
  changePassword,
  forgotPassword,
  resetPassword,
  getAdminSessions,
  revokeAdminSession,
  getAdminLoginHistory,
};
