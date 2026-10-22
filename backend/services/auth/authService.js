const crypto = require("crypto");
const Admin = require("../../models/Admin");
const Employee = require("../../models/Employee");
const Session = require("../../models/Session");
const LoginHistory = require("../../models/LoginHistory");
const { Role, DEFAULT_PERMISSIONS } = require("../../models/Role");
const ApiError = require("../../utils/ApiError");
const {
  generateAccessToken,
  generateRefreshToken,
  verifyRefreshToken,
  hashToken,
  generateRandomToken,
} = require("../../utils/token");
const {
  IST_TIMEZONE,
  toISTDateString,
  toISTTimeString,
} = require("../../utils/dateTime");
const { parseUserAgent, extractClientIp } = require("../../utils/deviceInfo");
const { sendEmail } = require("../email/emailService");
const { renderPasswordResetTemplate } = require("../../templates/emailTemplates");
const { recordAuditLog } = require("../../utils/auditLogger");

const MAX_FAILED_ATTEMPTS = 5;
const LOCK_DURATION_MINUTES = 15;

/**
 * Initial Admin Bootstrap Procedure (only allowed if 0 admins exist or valid setup key provided)
 */
const setupInitialAdmin = async ({ fullName, email, password, setupSecretKey }, req) => {
  const existingAdminCount = await Admin.countDocuments();
  const configuredSetupKey = process.env.ADMIN_SETUP_KEY;

  if (existingAdminCount > 0) {
    if (!configuredSetupKey || setupSecretKey !== configuredSetupKey) {
      throw new ApiError(
        403,
        "Initial admin setup is locked because an administrator account already exists."
      );
    }
  }

  const normalizedEmail = String(email).toLowerCase().trim();
  const existingEmail = await Admin.findOne({ email: normalizedEmail });
  if (existingEmail) {
    throw new ApiError(409, "An admin with this email already exists");
  }

  // Ensure default super_admin Role document exists
  let superRole = await Role.findOne({ slug: "super_admin" });
  if (!superRole) {
    superRole = await Role.create({
      name: "Super Administrator",
      slug: "super_admin",
      description: "Full administrative access across all modules",
      permissions: DEFAULT_PERMISSIONS,
      isSystemRole: true,
    });
  }

  const admin = await Admin.create({
    fullName,
    email: normalizedEmail,
    password,
    role: "super_admin",
    roleRef: superRole._id,
    permissions: DEFAULT_PERMISSIONS,
    status: "Active",
  });

  await recordAuditLog({
    req,
    actorType: "Admin",
    actorId: admin._id,
    actorEmail: admin.email,
    action: "INITIAL_ADMIN_SETUP",
    module: "AUTH",
    targetId: admin._id,
    description: `Initial administrator account (${admin.email}) created via secure setup procedure`,
  });

  return admin;
};

/**
 * Shared helper to create Session + LoginHistory + Tokens on login
 */
const createAuthSessionAndHistory = async ({
  userDoc,
  userType,
  rememberMe = false,
  req,
}) => {
  const now = new Date();
  const sessionId = crypto.randomUUID();
  const ipAddress = extractClientIp(req);
  const deviceInfo = parseUserAgent(req.headers["user-agent"]);

  const tokenPayload = {
    sub: String(userDoc._id),
    userType,
    email: userDoc.email,
    role: userDoc.role,
    employeeId: userType === "Employee" ? userDoc.employeeId : undefined,
    sessionId,
  };

  const accessToken = generateAccessToken(tokenPayload);
  const refreshToken = generateRefreshToken(tokenPayload, rememberMe);
  const refreshTokenHash = hashToken(refreshToken);

  const expiresInDays = rememberMe ? 30 : 7;
  const expiresAt = new Date(now.getTime() + expiresInDays * 24 * 60 * 60 * 1000);

  await Session.create({
    sessionId,
    userType,
    userId: userDoc._id,
    employeeIdCode: userType === "Employee" ? userDoc.employeeId : null,
    refreshTokenHash,
    ipAddress,
    deviceInfo,
    status: "Active",
    loginAt: now,
    lastActivityAt: now,
    expiresAt,
  });

  const loginHistoryRecord = await LoginHistory.create({
    userType,
    userId: userDoc._id,
    employeeId: userType === "Employee" ? userDoc.employeeId : null,
    email: userDoc.email,
    sessionId,
    loginDate: toISTDateString(now),
    loginTime: toISTTimeString(now),
    timezone: IST_TIMEZONE,
    loginTimestampUTC: now,
    lastActivityTimestamp: now,
    ipAddress,
    deviceInfo,
    sessionStatus: "Active",
  });

  return {
    accessToken,
    refreshToken,
    sessionId,
    expiresAt,
    loginHistoryRecord,
    ipAddress,
    deviceInfo,
  };
};

/**
 * Admin Login Service
 */
const loginAdmin = async ({ email, password, rememberMe = false }, req) => {
  const normalizedEmail = String(email).toLowerCase().trim();
  const ipAddress = extractClientIp(req);
  const deviceInfo = parseUserAgent(req.headers["user-agent"]);
  const now = new Date();

  const admin = await Admin.findOne({ email: normalizedEmail }).select("+password");

  if (!admin) {
    await LoginHistory.create({
      userType: "Admin",
      email: normalizedEmail,
      loginDate: toISTDateString(now),
      loginTime: toISTTimeString(now),
      timezone: IST_TIMEZONE,
      loginTimestampUTC: now,
      ipAddress,
      deviceInfo,
      sessionStatus: "Failed",
      failureReason: "Account not found",
    });
    throw new ApiError(401, "Invalid Credentials. Please check your email and password.");
  }

  if (admin.status !== "Active") {
    throw new ApiError(403, `Admin account is ${admin.status}. Contact system administrator.`);
  }

  if (admin.isLocked()) {
    const remainingMinutes = Math.ceil((admin.lockUntil - now) / 60000);
    await LoginHistory.create({
      userType: "Admin",
      userId: admin._id,
      email: admin.email,
      loginDate: toISTDateString(now),
      loginTime: toISTTimeString(now),
      timezone: IST_TIMEZONE,
      loginTimestampUTC: now,
      ipAddress,
      deviceInfo,
      sessionStatus: "Locked",
      failureReason: "Account locked due to repeated failed attempts",
    });
    throw new ApiError(
      423,
      `Account temporarily locked due to multiple failed login attempts. Try again in ${remainingMinutes} minute(s).`
    );
  }

  const isPasswordMatch = await admin.comparePassword(password);
  if (!isPasswordMatch) {
    admin.failedLoginAttempts = (admin.failedLoginAttempts || 0) + 1;
    if (admin.failedLoginAttempts >= MAX_FAILED_ATTEMPTS) {
      admin.lockUntil = new Date(now.getTime() + LOCK_DURATION_MINUTES * 60 * 1000);
    }
    await admin.save();

    await LoginHistory.create({
      userType: "Admin",
      userId: admin._id,
      email: admin.email,
      loginDate: toISTDateString(now),
      loginTime: toISTTimeString(now),
      timezone: IST_TIMEZONE,
      loginTimestampUTC: now,
      ipAddress,
      deviceInfo,
      sessionStatus: "Failed",
      failureReason: "Invalid password",
    });

    throw new ApiError(401, "Invalid Credentials. Please check your email and password.");
  }

  // Reset lockout counters and update last login info
  const previousLoginAt = admin.lastLoginAt;
  admin.failedLoginAttempts = 0;
  admin.lockUntil = null;
  admin.lastLoginAt = now;
  admin.lastLoginIp = ipAddress;
  admin.lastLoginDevice = `${deviceInfo.browser} on ${deviceInfo.os}`;
  await admin.save();

  const sessionData = await createAuthSessionAndHistory({
    userDoc: admin,
    userType: "Admin",
    rememberMe,
    req,
  });

  await recordAuditLog({
    req,
    actorType: "Admin",
    actorId: admin._id,
    actorEmail: admin.email,
    action: "ADMIN_LOGIN_SUCCESS",
    module: "AUTH",
    targetId: admin._id,
    description: `Admin ${admin.email} logged in successfully`,
  });

  return {
    admin: admin.toJSON(),
    previousLoginAt,
    ...sessionData,
  };
};

/**
 * Employee Login Service (Records LoginHistory & Session; NEVER auto-creates approved attendance)
 */
const loginEmployee = async ({ email, password, rememberMe = false }, req) => {
  const normalizedEmail = String(email).toLowerCase().trim();
  const ipAddress = extractClientIp(req);
  const deviceInfo = parseUserAgent(req.headers["user-agent"]);
  const now = new Date();

  const employee = await Employee.findOne({
    email: normalizedEmail,
    isDeleted: false,
  }).select("+password");

  if (!employee) {
    await LoginHistory.create({
      userType: "Employee",
      email: normalizedEmail,
      loginDate: toISTDateString(now),
      loginTime: toISTTimeString(now),
      timezone: IST_TIMEZONE,
      loginTimestampUTC: now,
      ipAddress,
      deviceInfo,
      sessionStatus: "Failed",
      failureReason: "Employee account not found",
    });
    throw new ApiError(401, "Invalid Credentials. Please check your email and password.");
  }

  if (employee.status !== "Active") {
    throw new ApiError(
      403,
      `Your employee account is currently ${employee.status}. Please contact HR.`
    );
  }

  if (employee.isLocked()) {
    const remainingMinutes = Math.ceil((employee.lockUntil - now) / 60000);
    await LoginHistory.create({
      userType: "Employee",
      userId: employee._id,
      employeeId: employee.employeeId,
      email: employee.email,
      loginDate: toISTDateString(now),
      loginTime: toISTTimeString(now),
      timezone: IST_TIMEZONE,
      loginTimestampUTC: now,
      ipAddress,
      deviceInfo,
      sessionStatus: "Locked",
      failureReason: "Account locked due to repeated failed attempts",
    });
    throw new ApiError(
      423,
      `Account temporarily locked due to multiple failed login attempts. Try again in ${remainingMinutes} minute(s).`
    );
  }

  const isPasswordMatch = await employee.comparePassword(password);
  if (!isPasswordMatch) {
    employee.failedLoginAttempts = (employee.failedLoginAttempts || 0) + 1;
    if (employee.failedLoginAttempts >= MAX_FAILED_ATTEMPTS) {
      employee.lockUntil = new Date(now.getTime() + LOCK_DURATION_MINUTES * 60 * 1000);
    }
    await employee.save();

    await LoginHistory.create({
      userType: "Employee",
      userId: employee._id,
      employeeId: employee.employeeId,
      email: employee.email,
      loginDate: toISTDateString(now),
      loginTime: toISTTimeString(now),
      timezone: IST_TIMEZONE,
      loginTimestampUTC: now,
      ipAddress,
      deviceInfo,
      sessionStatus: "Failed",
      failureReason: "Invalid password",
    });

    throw new ApiError(401, "Invalid Credentials. Please check your email and password.");
  }

  employee.failedLoginAttempts = 0;
  employee.lockUntil = null;
  employee.lastLoginAt = now;
  employee.lastLoginIp = ipAddress;
  employee.lastActivityAt = now;
  await employee.save();

  const sessionData = await createAuthSessionAndHistory({
    userDoc: employee,
    userType: "Employee",
    rememberMe,
    req,
  });

  await recordAuditLog({
    req,
    actorType: "Employee",
    actorId: employee._id,
    actorEmail: employee.email,
    action: "EMPLOYEE_LOGIN_SUCCESS",
    module: "AUTH",
    targetId: employee.employeeId,
    description: `Employee ${employee.fullName} (${employee.employeeId}) logged in`,
  });

  return {
    employee: employee.toJSON(),
    ...sessionData,
  };
};

/**
 * Refresh Token Rotation with Reuse Detection
 */
const rotateRefreshToken = async (rawRefreshToken, req) => {
  if (!rawRefreshToken) {
    throw new ApiError(401, "Refresh token is required");
  }

  let decoded;
  try {
    decoded = verifyRefreshToken(rawRefreshToken);
  } catch (err) {
    throw new ApiError(401, "Invalid or expired refresh token");
  }

  const incomingHash = hashToken(rawRefreshToken);
  const session = await Session.findOne({ sessionId: decoded.sessionId });

  if (!session) {
    throw new ApiError(401, "Session not found");
  }

  // If session is not Active or hash does not match, revoke session to prevent token replay
  if (session.status !== "Active" || session.refreshTokenHash !== incomingHash) {
    session.status = "Revoked";
    await session.save();
    throw new ApiError(401, "Refresh token has been revoked or already rotated");
  }

  if (session.expiresAt < new Date()) {
    session.status = "Expired";
    await session.save();
    throw new ApiError(401, "Session has expired. Please log in again.");
  }

  const userDoc =
    session.userType === "Admin"
      ? await Admin.findById(session.userId)
      : await Employee.findOne({ _id: session.userId, isDeleted: false });

  if (!userDoc || userDoc.status !== "Active") {
    throw new ApiError(401, "User account is no longer active");
  }

  const tokenPayload = {
    sub: String(userDoc._id),
    userType: session.userType,
    email: userDoc.email,
    role: userDoc.role,
    employeeId: session.userType === "Employee" ? userDoc.employeeId : undefined,
    sessionId: session.sessionId,
  };

  const newAccessToken = generateAccessToken(tokenPayload);
  const newRefreshToken = generateRefreshToken(tokenPayload, false);

  session.refreshTokenHash = hashToken(newRefreshToken);
  session.lastActivityAt = new Date();
  session.ipAddress = extractClientIp(req);
  await session.save();

  return {
    accessToken: newAccessToken,
    refreshToken: newRefreshToken,
    sessionId: session.sessionId,
  };
};

/**
 * Logout Session and update LoginHistory logout timestamp and duration
 */
const logoutSession = async (sessionId, userType, userId, req) => {
  const now = new Date();
  const query = sessionId
    ? { sessionId, userType }
    : { userId, userType, status: "Active" };

  const session = await Session.findOne(query).sort({ createdAt: -1 });
  if (session) {
    session.status = "LoggedOut";
    session.logoutAt = now;
    session.lastActivityAt = now;
    await session.save();

    const durationMinutes = Math.max(
      0,
      Math.round((now - new Date(session.loginAt)) / 60000)
    );

    await LoginHistory.findOneAndUpdate(
      { sessionId: session.sessionId },
      {
        $set: {
          logoutTimestampUTC: now,
          logoutTime: toISTTimeString(now),
          lastActivityTimestamp: now,
          sessionDurationMinutes: durationMinutes,
          sessionStatus: "Completed",
        },
      }
    );
  }

  await recordAuditLog({
    req,
    actorType: userType,
    actorId: userId,
    action: `${userType.toUpperCase()}_LOGOUT`,
    module: "AUTH",
    targetId: sessionId || userId,
    description: `${userType} logged out cleanly`,
  });

  return { loggedOutAt: now, logoutTimeIST: toISTTimeString(now) };
};

/**
 * Admin Change Password
 */
const changeAdminPassword = async (adminId, { currentPassword, newPassword }, req) => {
  const admin = await Admin.findById(adminId).select("+password");
  if (!admin) {
    throw new ApiError(404, "Admin not found");
  }

  const isMatch = await admin.comparePassword(currentPassword);
  if (!isMatch) {
    throw new ApiError(400, "Current password is incorrect");
  }

  admin.password = newPassword;
  await admin.save();

  // Revoke other active sessions for security
  await Session.updateMany(
    {
      userId: admin._id,
      userType: "Admin",
      status: "Active",
      ...(req.session ? { sessionId: { $ne: req.session.sessionId } } : {}),
    },
    { $set: { status: "Revoked", logoutAt: new Date() } }
  );

  await recordAuditLog({
    req,
    actorType: "Admin",
    actorId: admin._id,
    actorEmail: admin.email,
    action: "ADMIN_CHANGE_PASSWORD",
    module: "AUTH",
    targetId: admin._id,
    description: "Admin changed account password",
  });

  return true;
};

/**
 * Admin Forgot Password (generates secure reset token and emails via SMTP)
 */
const forgotAdminPassword = async (email, req) => {
  const normalizedEmail = String(email).toLowerCase().trim();
  const admin = await Admin.findOne({ email: normalizedEmail });

  // Always return a safe response even if email doesn't exist to prevent user enumeration
  if (!admin) {
    return {
      emailSent: false,
      message: "If a matching admin account exists, a password reset token has been sent.",
    };
  }

  const { rawToken, hashedToken } = generateRandomToken(24);
  const expiresAt = new Date(Date.now() + 30 * 60 * 1000); // 30 minutes

  admin.passwordResetTokenHash = hashedToken;
  admin.passwordResetExpiresAt = expiresAt;
  await admin.save({ validateBeforeSave: false });

  const emailResult = await sendEmail({
    to: admin.email,
    recipientName: admin.fullName,
    subject: "TechNeest Admin — Password Reset Request",
    html: renderPasswordResetTemplate({
      name: admin.fullName,
      resetToken: rawToken,
      expiresInMinutes: 30,
    }),
    templateName: "PASSWORD_RESET",
    relatedEntityType: "Admin",
    relatedEntityId: admin._id,
  });

  await recordAuditLog({
    req,
    actorType: "Admin",
    actorId: admin._id,
    actorEmail: admin.email,
    action: "ADMIN_FORGOT_PASSWORD_REQUEST",
    module: "AUTH",
    targetId: admin._id,
    description: `Password reset token requested for ${admin.email}`,
  });

  return {
    emailSent: emailResult.sent,
    emailStatus: emailResult.status,
    warning: emailResult.warning || null,
    expiresInMinutes: 30,
  };
};

/**
 * Admin Reset Password using token
 */
const resetAdminPassword = async ({ token, newPassword }, req) => {
  const hashedToken = hashToken(token);
  const admin = await Admin.findOne({
    passwordResetTokenHash: hashedToken,
    passwordResetExpiresAt: { $gt: new Date() },
  }).select("+passwordResetTokenHash +passwordResetExpiresAt");

  if (!admin) {
    throw new ApiError(400, "Password reset token is invalid or has expired");
  }

  admin.password = newPassword;
  admin.passwordResetTokenHash = null;
  admin.passwordResetExpiresAt = null;
  admin.failedLoginAttempts = 0;
  admin.lockUntil = null;
  await admin.save();

  // Revoke all existing sessions
  await Session.updateMany(
    { userId: admin._id, userType: "Admin", status: "Active" },
    { $set: { status: "Revoked", logoutAt: new Date() } }
  );

  await recordAuditLog({
    req,
    actorType: "Admin",
    actorId: admin._id,
    actorEmail: admin.email,
    action: "ADMIN_RESET_PASSWORD_SUCCESS",
    module: "AUTH",
    targetId: admin._id,
    description: `Admin password reset completed for ${admin.email}`,
  });

  return true;
};

module.exports = {
  setupInitialAdmin,
  loginAdmin,
  loginEmployee,
  rotateRefreshToken,
  logoutSession,
  changeAdminPassword,
  forgotAdminPassword,
  resetAdminPassword,
};
