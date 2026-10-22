const sendSuccess = (res, { statusCode = 200, message = "Success", data = null, pagination = null }) => {
  const payload = {
    success: true,
    message,
  };

  if (data !== undefined) {
    payload.data = data;
  }

  if (pagination) {
    payload.pagination = pagination;
  }

  return res.status(statusCode).json(payload);
};

const sendError = (res, { statusCode = 500, message = "Internal server error", errors = [] }) => {
  const payload = {
    success: false,
    message,
  };

  if (errors && errors.length > 0) {
    payload.errors = errors;
  }

  return res.status(statusCode).json(payload);
};

module.exports = {
  sendSuccess,
  sendError,
};
