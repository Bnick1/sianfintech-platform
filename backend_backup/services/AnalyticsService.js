/* eslint-disable no-unused-vars */
const Service = require('./Service');

/**
* Get analytics report for a tenant
*
* tenantId String 
* returns AnalyticsReport
* */
const tenantIdAnalyticsReportGET = ({ tenantId }) => new Promise(
  async (resolve, reject) => {
    try {
      resolve(Service.successResponse({
        tenantId,
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
  tenantIdAnalyticsReportGET,
};
