const { body } = require("express-validator");

const createEmployeeValidator = [
  body("fullName")
    .trim()
    .notEmpty()
    .withMessage("Full name is required"),
  body("email")
    .trim()
    .notEmpty()
    .withMessage("Email is required")
    .isEmail()
    .withMessage("Valid email is required"),
  body("password")
    .notEmpty()
    .withMessage("Account password is required")
    .isLength({ min: 6 })
    .withMessage("Password must be at least 6 characters long"),
  body("department")
    .trim()
    .notEmpty()
    .withMessage("Department is required"),
  body("role")
    .trim()
    .notEmpty()
    .withMessage("Job role is required"),
  body("joiningDate")
    .notEmpty()
    .withMessage("Joining date is required")
    .isISO8601()
    .withMessage("Joining date must be a valid date (YYYY-MM-DD)"),
  body("salary")
    .optional()
    .isNumeric()
    .withMessage("Salary must be a valid number"),
  body("baseSalary")
    .optional()
    .isNumeric()
    .withMessage("Base salary must be a valid number"),
];

const updateEmployeeValidator = [
  body("fullName")
    .optional()
    .trim()
    .notEmpty()
    .withMessage("Full name cannot be empty"),
  body("email")
    .optional()
    .trim()
    .isEmail()
    .withMessage("Valid email is required"),
  body("password")
    .optional({ checkFalsy: true })
    .isLength({ min: 6 })
    .withMessage("Password must be at least 6 characters long"),
  body("status")
    .optional()
    .isIn(["Active", "Inactive", "Suspended"])
    .withMessage("Status must be Active, Inactive, or Suspended"),
];

const updateEmployeeStatusValidator = [
  body("status")
    .notEmpty()
    .withMessage("Status is required")
    .isIn(["Active", "Inactive", "Suspended"])
    .withMessage("Status must be Active, Inactive, or Suspended"),
];

module.exports = {
  createEmployeeValidator,
  updateEmployeeValidator,
  updateEmployeeStatusValidator,
};
