export const asyncHandler = (fn) => (req, res, next) => {
  Promise.resolve(fn(req, res, next)).catch(next);
};

export const apiResponse = (res, data, message = 'success', status = 200) => {
  return res.status(status).json({ message, data });
};