const baseResponse = (res, success, statusCode, message, payload) => {
  res.status(statusCode).json({
    success,
    message,
    payload,
  });
};

module.exports = baseResponse;