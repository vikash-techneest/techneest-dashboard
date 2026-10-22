const express = require("express");
const router = express.Router();

const payrollController = require("../../controllers/admin/payrollController");
const { authenticateAdmin, requirePermission } = require("../../middleware/auth");
const { validateRequest } = require("../../middleware/validate");
const {
  runPayrollValidator,
  addAdjustmentValidator,
  updatePaymentStatusValidator,
  bulkSalaryStructureValidator,
} = require("../../validators/payrollValidators");

router.use(authenticateAdmin);

router.get(
  "/",
  requirePermission("payroll:read"),
  payrollController.listPayrolls
);

router.post(
  "/run",
  requirePermission("payroll:run"),
  runPayrollValidator,
  validateRequest,
  payrollController.runOrCalculatePayroll
);

router.put(
  "/salary-structures/bulk",
  requirePermission("payroll:run"),
  bulkSalaryStructureValidator,
  validateRequest,
  payrollController.bulkUpdateSalaryStructures
);

router.get(
  "/export/csv",
  requirePermission("payroll:read"),
  payrollController.exportPayrollCSV
);

router.get(
  "/payslips",
  requirePermission("payslips:manage"),
  payrollController.listPayslips
);

router.get(
  "/payslips/:id/download",
  requirePermission("payslips:manage"),
  payrollController.downloadPayslipByAdmin
);

router.post(
  "/payslips/:id/resend-email",
  requirePermission("payslips:manage"),
  payrollController.resendPayslipEmail
);

router.get(
  "/email-logs",
  requirePermission("payslips:manage"),
  payrollController.getEmailLogs
);

router.get(
  "/:id",
  requirePermission("payroll:read"),
  payrollController.getPayrollById
);

router.post(
  "/:id/adjustments",
  requirePermission("payroll:run"),
  addAdjustmentValidator,
  validateRequest,
  payrollController.addAdjustment
);

router.patch(
  "/:id/approve",
  requirePermission("payroll:approve"),
  payrollController.approvePayroll
);

router.patch(
  "/:id/finalize",
  requirePermission("payroll:finalize"),
  payrollController.finalizePayroll
);

router.patch(
  "/:id/payment-status",
  requirePermission("payroll:finalize"),
  updatePaymentStatusValidator,
  validateRequest,
  payrollController.updatePaymentStatus
);

router.post(
  "/:id/reverse",
  requirePermission("payroll:finalize"),
  payrollController.reversePayroll
);

module.exports = router;
