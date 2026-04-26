const { sendResponse } = require("../utils/apiResponse");

const errorHandler = (err, req, res, next) => {
  const statusCode = res.statusCode && res.statusCode !== 200 ? res.statusCode : 500;

  console.error(err);

  return sendResponse(res, {
    statusCode,
    success: false,
    message: err.message || "Internal server error",
    data: process.env.NODE_ENV === "production" ? {} : { stack: err.stack },
  });
};

module.exports = errorHandler;
