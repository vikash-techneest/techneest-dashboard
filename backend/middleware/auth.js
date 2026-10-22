const Admin = require("../models/Admin");
const Employee = require("../models/Employee");
const Session = require("../models/Session");
const LoginHistory = require("../models/LoginHistory");
const { verifyAccessToken } = require("../utils/token");
const ApiError = require("../utils/ApiError");
const asyncHandler = require("../utils/asyncHandler");

const extractTokenFromRequest = (req) => {
  const authHeader = req.headers.authorization;
  if (authHeader && authHeader.startsWith("Bearer ")) {
    return authHeader.split(" ")[1].trim();
  }
  if (req.cookies?.accessToken) {
    return req.cookies.accessToken;
  }
  return null;
};

/**
 * Authenticates an Admin JWT access token and attaches req.admin and req.session
 */
const authenticateAdmin = asyncHandler(async (req, res, next) => {
  const token = extractTokenFromRequest(req);
  if (!token) {
    throw new ApiError(401, "Authentication required. Please provide a valid admin token.");
  }

  let decoded;
  try {
    decoded = verifyAccessToken(token);
  } catch (err) {
    throw new ApiError(401, "Invalid or expired authentication token");
  }

  if (decoded.userType !== "Admin") {
    throw new ApiError(403, "Forbidden: Admin privileges required to access this resource");
  }

  const admin = await Admin.findById(decoded.sub);
  if (!admin || admin.status !== "Active") {
    throw new ApiError(401, "Admin account not found or inactive");
  }

  if (decoded.sessionId) {
    const session = await Session.findOne({
      sessionId: decoded.sessionId,
      userType: "Admin",
      status: "Active",
    });
    if (!session || session.expiresAt < new Date()) {
      throw new ApiError(401, "Session has expired or been logged out. Please log in again.");
    }
    session.lastActivityAt = new Date();
    await session.save();
    req.session = session;
  }

  req.admin = admin;
  req.user = {
    id: admin._id,
    userType: "Admin",
    email: admin.email,
    role: admin.role,
    permissions: admin.permissions || [],
  };

  next();
});

/**
 * Authenticates an Employee JWT access token, updates activity tracking, and attaches req.employee
 */
const authenticateEmployee = asyncHandler(async (req, res, next) => {
  const token = extractTokenFromRequest(req);
  if (!token) {
    throw new ApiError(401, "Authentication required. Please sign in as an employee.");
  }

  let decoded;
  try {
    decoded = verifyAccessToken(token);
  } catch (err) {
    throw new ApiError(401, "Invalid or expired authentication token");
  }

  if (decoded.userType !== "Employee") {
    throw new ApiError(403, "Forbidden: Employee account required for this endpoint");
  }

  const employee = await Employee.findOne({
    _id: decoded.sub,
    isDeleted: false,
  });

  if (!employee || employee.status !== "Active") {
    throw new ApiError(401, "Employee account not found or deactivated");
  }

  const now = new Date();
  if (decoded.sessionId) {
    const session = await Session.findOne({
      sessionId: decoded.sessionId,
      userType: "Employee",
      status: "Active",
    });
    if (!session || session.expiresAt < now) {
      throw new ApiError(401, "Session has expired or been logged out. Please sign in again.");
    }
    session.lastActivityAt = now;
    await session.save();
    req.session = session;

    // Update LoginHistory lastActivityTimestamp and duration
    await LoginHistory.findOneAndUpdate(
      { sessionId: decoded.sessionId, sessionStatus: "Active" },
      {
        $set: {
          lastActivityTimestamp: now,
          sessionDurationMinutes: Math.max(
            0,
            Math.round((now - new Date(session.loginAt)) / 60000)
          ),
        },
      }
    );
  }

  employee.lastActivityAt = now;
  await Employee.updateOne({ _id: employee._id }, { $set: { lastActivityAt: now } });

  req.employee = employee;
  req.user = {
    id: employee._id,
    employeeId: employee.employeeId,
    userType: "Employee",
    email: employee.email,
    role: employee.role,
    permissions: employee.permissions || [],
  };

  next();
});

/**
 * Enforces Role-Based Access Control (RBAC) permissions for Admin endpoints
 */
const requirePermission = (...requiredPermissions) => {
  return (req, res, next) => {
    if (!req.admin) {
      return next(new ApiError(401, "Admin authentication required"));
    }

    // super_admin has full access
    if (req.admin.role === "super_admin") {
      return next();
    }

    const adminPerms = Array.isArray(req.admin.permissions) ? req.admin.permissions : [];
    const hasAll = requiredPermissions.every((perm) => adminPerms.includes(perm));

    if (!hasAll) {
      return next(
        new ApiError(
          403,
          `Forbidden: Missing required permission (${requiredPermissions.join(", ")})`
        )
      );
    }

    next();
  };
};

/**
 * Enforces employee-level data isolation: an employee can only access their own resource
 */
const enforceEmployeeSelfAccess = (paramKey = "employeeId") => {
  return (req, res, next) => {
    if (req.admin) return next();
    if (!req.employee) {
      return next(new ApiError(401, "Authentication required"));
    }

    const targetParam = req.params[paramKey];
    if (
      targetParam &&
      String(targetParam) !== String(req.employee._id) &&
      String(targetParam).toUpperCase() !== String(req.employee.employeeId).toUpperCase()
    ) {
      return next(
        new ApiError(403, "Forbidden: You are not authorized to access another employee's private data")
      );
    }

    next();
  };
};

module.exports = {
  authenticateAdmin,
  authenticateEmployee,
  requirePermission,
  enforceEmployeeSelfAccess,
};
