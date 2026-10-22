const express = require("express");
const router = express.Router();

const dashboardController = require("../../controllers/admin/dashboardController");
const activityController = require("../../controllers/admin/activityController");
const taskController = require("../../controllers/admin/taskController");
const departmentController = require("../../controllers/admin/departmentController");
const settingsController = require("../../controllers/admin/settingsController");

const { authenticateAdmin, requirePermission } = require("../../middleware/auth");
const { validateRequest } = require("../../middleware/validate");
const { uploadTaskAttachment } = require("../../middleware/upload");
const {
  createDepartmentValidator,
  createTaskValidator,
  createHolidayValidator,
} = require("../../validators/commonValidators");

const authRoutes = require("./authRoutes");
const employeeRoutes = require("./employeeRoutes");
const attendanceRoutes = require("./attendanceRoutes");
const payrollRoutes = require("./payrollRoutes");

// Mount Core Admin Sub-Routers
router.use("/auth", authRoutes);
router.use("/employees", employeeRoutes);
router.use("/attendance", attendanceRoutes);
router.use("/payroll", payrollRoutes);

// Protect all remaining Admin routes
router.use(authenticateAdmin);

// Dashboard & Global Search
router.get(
  "/dashboard",
  requirePermission("dashboard:view"),
  dashboardController.getDashboardOverview
);
router.get("/search", dashboardController.globalSearch);

// Employee Login & Activity Tracking (Section 6)
router.get(
  "/activity/login-history",
  requirePermission("employees:read"),
  activityController.getLoginHistory
);
router.get(
  "/activity/active-sessions",
  requirePermission("employees:read"),
  activityController.getActiveEmployeeSessions
);
router.get(
  "/activity/summary",
  requirePermission("employees:read"),
  activityController.getEmployeeActivitySummary
);
router.delete(
  "/activity/sessions/:sessionId",
  requirePermission("employees:write"),
  activityController.revokeEmployeeSessionByAdmin
);

// Tasks (AssignTask.jsx & AllTask.jsx)
router.get("/tasks", requirePermission("tasks:read"), taskController.listTasks);
router.post(
  "/tasks",
  requirePermission("tasks:write"),
  uploadTaskAttachment.single("attachments"),
  createTaskValidator,
  validateRequest,
  taskController.createTask
);
router.get(
  "/tasks/:id",
  requirePermission("tasks:read"),
  taskController.getTaskById
);
router.put(
  "/tasks/:id",
  requirePermission("tasks:write"),
  taskController.updateTask
);
router.delete(
  "/tasks/:id",
  requirePermission("tasks:write"),
  taskController.deleteTask
);

// Departments (Departments.jsx)
router.get(
  "/departments",
  requirePermission("departments:read"),
  departmentController.listDepartments
);
router.post(
  "/departments",
  requirePermission("departments:write"),
  createDepartmentValidator,
  validateRequest,
  departmentController.createDepartment
);
router.get(
  "/departments/:id",
  requirePermission("departments:read"),
  departmentController.getDepartmentDetails
);
router.put(
  "/departments/:id",
  requirePermission("departments:write"),
  departmentController.updateDepartment
);
router.put(
  "/departments/:id/employees/:empId",
  requirePermission("departments:write"),
  departmentController.updateEmployeeInDepartment
);
router.delete(
  "/departments/:id/employees/:empId",
  requirePermission("departments:write"),
  departmentController.removeEmployeeFromDepartment
);
router.delete(
  "/departments/:id",
  requirePermission("departments:write"),
  departmentController.deleteDepartment
);

// Reports & Analytics (Reports.jsx)
router.get(
  "/reports",
  requirePermission("reports:view"),
  dashboardController.getAnalyticsReports
);
router.get(
  "/reports/export/csv",
  requirePermission("reports:view"),
  dashboardController.exportReportsCSV
);

// Settings & Attendance Policy (Settings.jsx)
router.get(
  "/settings",
  requirePermission("settings:manage"),
  settingsController.getSettings
);
router.put(
  "/settings",
  requirePermission("settings:manage"),
  settingsController.updateSettings
);

// Leave Management
router.get(
  "/leaves",
  requirePermission("leaves:read"),
  settingsController.listLeaves
);
router.patch(
  "/leaves/:id/review",
  requirePermission("leaves:approve"),
  settingsController.reviewLeaveRequest
);

// Holiday Management
router.get("/holidays", settingsController.listHolidays);
router.post(
  "/holidays",
  requirePermission("holidays:manage"),
  createHolidayValidator,
  validateRequest,
  settingsController.createHoliday
);
router.delete(
  "/holidays/:id",
  requirePermission("holidays:manage"),
  settingsController.deleteHoliday
);

// Roles & Permissions Management
router.get(
  "/roles",
  requirePermission("roles:manage"),
  settingsController.listRoles
);
router.post(
  "/roles",
  requirePermission("roles:manage"),
  settingsController.createRole
);
router.put(
  "/roles/:id",
  requirePermission("roles:manage"),
  settingsController.updateRole
);

// Notifications & Audit Logs
router.get("/notifications", settingsController.listAdminNotifications);
router.patch(
  "/notifications/:id/read",
  settingsController.markNotificationRead
);
router.get(
  "/audit-logs",
  requirePermission("audit:read"),
  settingsController.listAuditLogs
);

module.exports = router;
