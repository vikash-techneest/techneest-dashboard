const express = require("express");
const router = express.Router();

const employeePortalController = require("../../controllers/employee/employeePortalController");
const { authenticateEmployee } = require("../../middleware/auth");
const { validateRequest } = require("../../middleware/validate");
const { authRateLimiter } = require("../../middleware/rateLimiter");
const { loginValidator } = require("../../validators/authValidators");
const { correctionRequestValidator } = require("../../validators/attendanceValidators");
const {
  createTaskValidator,
  createLeaveValidator,
} = require("../../validators/commonValidators");

// Public / Rate-limited Employee Auth Routes
router.post(
  "/auth/login",
  authRateLimiter,
  loginValidator,
  validateRequest,
  employeePortalController.login
);

router.post("/auth/refresh", authRateLimiter, employeePortalController.refresh);

// Protected Employee Portal Routes (Enforces Employee-Level Isolation via req.employee)
router.use(authenticateEmployee);

router.post("/auth/logout", employeePortalController.logout);

// Employee Dashboard (UserPages/Dashboard.jsx)
router.get("/dashboard", employeePortalController.getEmployeeDashboard);

// Employee Self-Attendance (UserPages/Attendance.jsx & Section 7)
router.get(
  "/attendance",
  employeePortalController.getMyAttendanceDashboardAndHistory
);
router.post("/attendance/check-in", employeePortalController.checkIn);
router.post("/attendance/check-out", employeePortalController.checkOut);
router.post(
  "/attendance/:id/correction-request",
  correctionRequestValidator,
  validateRequest,
  employeePortalController.requestCorrection
);

// Employee Tasks (UserPages/MyTasks.jsx & UserPages/CreateTask.jsx)
router.get("/tasks", employeePortalController.getMyTasks);
router.post(
  "/tasks",
  createTaskValidator,
  validateRequest,
  employeePortalController.createPersonalTask
);
router.patch("/tasks/:id", employeePortalController.updateMyTaskStatus);

// Employee Work Reports & Profile (UserPages/WorkReports.jsx)
router.get(
  "/reports-profile",
  employeePortalController.getWorkReportsAndProfile
);
router.get("/profile", employeePortalController.getWorkReportsAndProfile);
router.put("/profile", employeePortalController.updateMyProfile);

// Employee Leave Requests
router.get("/leaves", employeePortalController.getMyLeaves);
router.post(
  "/leaves",
  createLeaveValidator,
  validateRequest,
  employeePortalController.applyForLeave
);

// Employee Payslips (Self-Only Access)
router.get("/payslips", employeePortalController.getMyPayslips);
router.get(
  "/payslips/:id/download",
  employeePortalController.downloadMyPayslip
);

// Employee Notifications
router.get("/notifications", employeePortalController.getMyNotifications);

module.exports = router;
