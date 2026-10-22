const { body } = require("express-validator");

const createDepartmentValidator = [
  body("name")
    .trim()
    .notEmpty()
    .withMessage("Department name is required"),
  body("code")
    .optional()
    .trim(),
];

const createTaskValidator = [
  body("title")
    .trim()
    .notEmpty()
    .withMessage("Task title is required"),
  body("project")
    .trim()
    .notEmpty()
    .withMessage("Project / Category is required"),
  body("dueDate")
    .notEmpty()
    .withMessage("Due date is required")
    .isISO8601()
    .withMessage("Due date must be a valid date"),
  body("priority")
    .optional()
    .isIn(["Low", "Normal", "Medium", "High", "Urgent"])
    .withMessage("Priority must be Low, Normal, Medium, High, or Urgent"),
];

const createLeaveValidator = [
  body("leaveType")
    .notEmpty()
    .withMessage("Leave type is required")
    .isIn(["Casual Leave", "Sick Leave", "Earned Leave", "Unpaid Leave", "Maternity/Paternity"])
    .withMessage("Invalid leave type"),
  body("startDate")
    .notEmpty()
    .withMessage("Start date is required")
    .matches(/^\d{4}-\d{2}-\d{2}$/)
    .withMessage("Start date must be in YYYY-MM-DD format"),
  body("endDate")
    .notEmpty()
    .withMessage("End date is required")
    .matches(/^\d{4}-\d{2}-\d{2}$/)
    .withMessage("End date must be in YYYY-MM-DD format"),
  body("reason")
    .trim()
    .notEmpty()
    .withMessage("Reason is required"),
];

const createHolidayValidator = [
  body("name")
    .trim()
    .notEmpty()
    .withMessage("Holiday name is required"),
  body("date")
    .notEmpty()
    .withMessage("Holiday date is required")
    .matches(/^\d{4}-\d{2}-\d{2}$/)
    .withMessage("Holiday date must be in YYYY-MM-DD format"),
];

module.exports = {
  createDepartmentValidator,
  createTaskValidator,
  createLeaveValidator,
  createHolidayValidator,
};
