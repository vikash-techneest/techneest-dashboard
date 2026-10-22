const { sendError } = require("../utils/apiResponse");

const notFoundHandler = (req, res, next) => {
  return sendError(res, {
    statusCode: 404,
    message: `Route not found: ${req.method} ${req.originalUrl}`,
  });
};

const errorHandler = (err, req, res, next) => {
  let statusCode = err.statusCode || 500;
  let message = err.message || "Internal server error";
  let errors = Array.isArray(err.errors) ? err.errors : [];

  // Mongoose Bad ObjectId / CastError
  if (err.name === "CastError") {
    statusCode = 400;
    message = `Invalid ${err.path || "resource"} identifier`;
    errors = [{ field: err.path || "id", message: "Invalid format" }];
  }

  // Mongoose Duplicate Key Error
  if (err.code === 11000) {
    statusCode = 409;
    const fields = Object.keys(err.keyValue || {});
    const fieldName = fields[0] || "field";
    message = `Duplicate value for ${fieldName}`;
    errors = [
      {
        field: fieldName,
        message: `${fieldName} already exists`,
      },
    ];
  }

  // Mongoose Validation Error
  if (err.name === "ValidationError") {
    statusCode = 400;
    message = "Validation failed";
    errors = Object.values(err.errors || {}).map((val) => ({
      field: val.path,
      message: val.message,
    }));
  }

  // JWT Errors
  if (err.name === "JsonWebTokenError") {
    statusCode = 401;
    message = "Invalid authentication token";
  }

  if (err.name === "TokenExpiredError") {
    statusCode = 401;
    message = "Authentication token has expired";
  }

  // Multer Errors
  if (err.name === "MulterError") {
    statusCode = 400;
    message = `File upload error: ${err.message}`;
  }

  // Do not leak internal database or stack errors on 500 in production
  if (statusCode === 500 && process.env.NODE_ENV === "production") {
    message = "An unexpected error occurred";
  }

  return sendError(res, {
    statusCode,
    message,
    errors,
  });
};

module.exports = {
  notFoundHandler,
  errorHandler,
};
