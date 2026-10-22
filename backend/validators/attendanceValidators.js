const { body } = require("express-validator");

const reviewAttendanceValidator = [
  body("decision")
    .notEmpty()
    .withMessage("Approval decision is required")
    .isIn(["Approved", "Rejected"])
    .withMessage("Decision must be 'Approved' or 'Rejected'"),
  body("reason")
    .optional()
    .trim()
    .isLength({ max: 500 })
    .withMessage("Reason cannot exceed 500 characters"),
  body("overrideStatus")
    .optional()
    .isIn(["Present", "Late", "Half Day", "Absent"])
    .withMessage("Invalid overrideStatus"),
];

const correctionRequestValidator = [
  body("reason")
    .trim()
    .notEmpty()
    .withMessage("Reason for attendance correction is required"),
  body("requestedCheckInTime")
    .optional({ checkFalsy: true })
    .isISO8601()
    .withMessage("requestedCheckInTime must be a valid ISO timestamp"),
  body("requestedCheckOutTime")
    .optional({ checkFalsy: true })
    .isISO8601()
    .withMessage("requestedCheckOutTime must be a valid ISO timestamp"),
];

const manualAdjustmentValidator = [
  body("month")
    .optional()
    .isInt({ min: 1, max: 12 })
    .withMessage("Month must be between 1 and 12"),
  body("year")
    .optional()
    .isInt({ min: 2000, max: 2100 })
    .withMessage("Year must be a valid 4-digit year"),
  body("totalWorkingDays")
    .notEmpty()
    .withMessage("totalWorkingDays is required")
    .isInt({ min: 1, max: 31 })
    .withMessage("totalWorkingDays must be between 1 and 31"),
  body("adjustments")
    .isArray()
    .withMessage("adjustments must be an array of employee presentDays updates"),
];

module.exports = {
  reviewAttendanceValidator,
  correctionRequestValidator,
  manualAdjustmentValidator,
};
