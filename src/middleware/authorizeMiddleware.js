const baseResponse = require("../utils/baseResponse.util");

const authorizeMiddleware = (roles) => (req, res, next) => {
  if (!roles.includes(req.user.role)) {
    return baseResponse(res, false, 403, "Forbidden", null);
  }
  next();
};

module.exports = authorizeMiddleware;