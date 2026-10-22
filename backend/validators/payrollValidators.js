const { body } = require("express-validator");

const runPayrollValidator = [
  body("month")
    .notEmpty()
    .withMessage("Payroll month (1-12) is required")
    .isInt({ min: 1, max: 12 })
    .withMessage("Month must be an integer between 1 and 12"),
  body("year")
    .notEmpty()
    .withMessage("Payroll year is required")
    .isInt({ min: 2000, max: 2100 })
    .withMessage("Year must be a valid 4-digit year"),
  body("employeeIds")
    .optional()
    .isArray()
    .withMessage("employeeIds must be an array when provided"),
];

const addAdjustmentValidator = [
  body("type")
    .notEmpty()
    .withMessage("Adjustment type is required")
    .isIn(["Bonus", "Incentive", "Allowance", "Deduction", "Adjustment"])
    .withMessage("Type must be Bonus, Incentive, Allowance, Deduction, or Adjustment"),
  body("label")
    .trim()
    .notEmpty()
    .withMessage("Adjustment label is required"),
  body("amount")
    .notEmpty()
    .withMessage("Adjustment amount is required")
    .isNumeric()
    .withMessage("Amount must be a number"),
];

const updatePaymentStatusValidator = [
  body("paymentStatus")
    .notEmpty()
    .withMessage("paymentStatus is required")
    .isIn(["Pending", "Processing", "Paid", "Failed"])
    .withMessage("paymentStatus must be Pending, Processing, Paid, or Failed"),
  body("paymentReference")
    .optional()
    .trim(),
  body("paymentMethod")
    .optional()
    .isIn(["Bank Transfer", "NEFT/RTGS", "UPI", "Cheque", "Manual"])
    .withMessage("Invalid paymentMethod"),
];

const bulkSalaryStructureValidator = [
  body("salaries")
    .isArray({ min: 1 })
    .withMessage("salaries array with at least 1 entry is required"),
  body("salaries.*.employeeId")
    .notEmpty()
    .withMessage("employeeId is required for each salary item"),
  body("salaries.*.baseSalary")
    .isFloat({ min: 0 })
    .withMessage("baseSalary must be a non-negative number"),
];

module.exports = {
  runPayrollValidator,
  addAdjustmentValidator,
  updatePaymentStatusValidator,
  bulkSalaryStructureValidator,
};
