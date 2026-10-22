const { validationResult } = require("express-validator");
const { sendError } = require("../utils/apiResponse");

/**
 * Middleware to evaluate express-validator chains and return consistent error response
 */
const validateRequest = (req, res, next) => {
  const result = validationResult(req);
  if (result.isEmpty()) {
    return next();
  }

  const formattedErrors = result.array({ onlyFirstError: true }).map((err) => ({
    field: err.path || err.param || "request",
    message: err.msg,
  }));

  return sendError(res, {
    statusCode: 400,
    message: "Validation failed",
    errors: formattedErrors,
  });
};

/**
 * Recursively strips keys starting with '$' or containing '.' to prevent NoSQL operator injection
 */
const sanitizeObject = (obj) => {
  if (!obj || typeof obj !== "object") return obj;
  if (Array.isArray(obj)) {
    for (let i = 0; i < obj.length; i++) {
      obj[i] = sanitizeObject(obj[i]);
    }
    return obj;
  }

  for (const key of Object.keys(obj)) {
    if (key.startsWith("$") || key.includes(".")) {
      delete obj[key];
    } else if (typeof obj[key] === "object" && obj[key] !== null) {
      sanitizeObject(obj[key]);
    }
  }
  return obj;
};

const mongoSanitizeMiddleware = (req, res, next) => {
  if (req.body && typeof req.body === "object") {
    sanitizeObject(req.body);
  }
  if (req.params && typeof req.params === "object") {
    sanitizeObject(req.params);
  }
  if (req.query && typeof req.query === "object") {
    sanitizeObject(req.query);
  }
  next();
};

module.exports = {
  validateRequest,
  mongoSanitizeMiddleware,
};
