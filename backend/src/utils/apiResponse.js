const sendResponse = (
  res,
  { statusCode = 200, success = true, message = "", data = {}, meta = null }
) => {
  const payload = { success, message, data };

  if (meta && Object.keys(meta).length > 0) {
    payload.meta = meta;
  }

  return res.status(statusCode).json(payload);
};

module.exports = { sendResponse };
