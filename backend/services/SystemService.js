/* eslint-disable no-unused-vars */
const Service = require('./Service');

/**
* System health check
*
* returns _system_health_get_200_response
* */
const systemHealthGET = () => new Promise(
  async (resolve, reject) => {
    try {
      resolve(Service.successResponse({
      }));
    } catch (e) {
      reject(Service.rejectResponse(
        e.message || 'Invalid input',
        e.status || 405,
      ));
    }
  },
);

module.exports = {
  systemHealthGET,
};
