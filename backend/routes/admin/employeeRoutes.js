const express = require("express");
const router = express.Router();

const employeeController = require("../../controllers/admin/employeeController");
const { authenticateAdmin, requirePermission } = require("../../middleware/auth");
const { validateRequest } = require("../../middleware/validate");
const { uploadDocument } = require("../../middleware/upload");
const {
  createEmployeeValidator,
  updateEmployeeValidator,
  updateEmployeeStatusValidator,
} = require("../../validators/employeeValidators");

router.use(authenticateAdmin);

router.get(
  "/export/csv",
  requirePermission("employees:read"),
  employeeController.exportEmployeesCSV
);

router.get(
  "/",
  requirePermission("employees:read"),
  employeeController.listEmployees
);

router.post(
  "/",
  requirePermission("employees:write"),
  createEmployeeValidator,
  validateRequest,
  employeeController.createEmployee
);

router.get(
  "/:id",
  requirePermission("employees:read"),
  employeeController.getEmployeeDetails
);

router.put(
  "/:id",
  requirePermission("employees:write"),
  updateEmployeeValidator,
  validateRequest,
  employeeController.updateEmployee
);

router.patch(
  "/:id/status",
  requirePermission("employees:write"),
  updateEmployeeStatusValidator,
  validateRequest,
  employeeController.updateEmployeeStatus
);

router.patch(
  "/:id/permissions",
  requirePermission("roles:manage"),
  employeeController.updateEmployeePermissions
);

router.delete(
  "/:id",
  requirePermission("employees:delete"),
  employeeController.deleteEmployee
);

// Employee Documents
router.get(
  "/:id/documents",
  requirePermission("employees:read"),
  employeeController.listEmployeeDocuments
);

router.post(
  "/:id/documents",
  requirePermission("employees:write"),
  uploadDocument.single("document"),
  employeeController.uploadEmployeeDocument
);

router.delete(
  "/:id/documents/:docId",
  requirePermission("employees:write"),
  employeeController.deleteEmployeeDocument
);

// Employee-specific Login History, Attendance Summary, Payroll History
router.get(
  "/:id/login-history",
  requirePermission("employees:read"),
  employeeController.getEmployeeLoginHistory
);

router.get(
  "/:id/attendance-summary",
  requirePermission("attendance:read"),
  employeeController.getEmployeeAttendanceSummary
);

router.get(
  "/:id/payroll-history",
  requirePermission("payroll:read"),
  employeeController.getEmployeePayrollHistory
);

module.exports = router;
