/**
 * Generic service response helpers
 */
const successResponse = (data) => ({
  status: 'success',
  ...data,
});

const rejectResponse = (message, status = 400) => ({
  status: 'error',
  message,
  code: status,
});

module.exports = {
  successResponse,
  rejectResponse,
};
