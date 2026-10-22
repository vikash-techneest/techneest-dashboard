const express = require("express");
const router = express.Router();

const attendanceController = require("../../controllers/admin/attendanceController");
const { authenticateAdmin, requirePermission } = require("../../middleware/auth");
const { validateRequest } = require("../../middleware/validate");
const {
  reviewAttendanceValidator,
  manualAdjustmentValidator,
} = require("../../validators/attendanceValidators");

router.use(authenticateAdmin);

router.get(
  "/",
  requirePermission("attendance:read"),
  attendanceController.getAdminAttendanceList
);

router.get(
  "/pending",
  requirePermission("attendance:read"),
  attendanceController.getPendingAttendanceApprovals
);

router.get(
  "/register",
  requirePermission("attendance:read"),
  attendanceController.getOfficialAttendanceRegister
);

router.get(
  "/audit-logs",
  requirePermission("attendance:read"),
  attendanceController.getAttendanceAuditTrail
);

router.get(
  "/export/csv",
  requirePermission("attendance:read"),
  attendanceController.exportAttendanceCSV
);

router.patch(
  "/:id/review",
  requirePermission("attendance:approve"),
  reviewAttendanceValidator,
  validateRequest,
  attendanceController.reviewAttendance
);

router.post(
  "/manual-adjustment",
  requirePermission("attendance:adjust"),
  manualAdjustmentValidator,
  validateRequest,
  attendanceController.manualAdjustAttendance
);

router.post(
  "/auto-absent/run",
  requirePermission("attendance:adjust"),
  attendanceController.triggerAutoAbsentJob
);

module.exports = router;
