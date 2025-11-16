/* eslint-disable no-unused-vars */
const Service = require('./Service');

/**
* List clients for a tenant
*
* tenantId String 
* returns List
* */
const tenantIdClientsGET = ({ tenantId }) => new Promise(
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
/**
* Create a new client
*
* tenantId String 
* client Client 
* no response value expected for this operation
* */
const tenantIdClientsPOST = ({ tenantId, client }) => new Promise(
  async (resolve, reject) => {
    try {
      resolve(Service.successResponse({
        tenantId,
        client,
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
  tenantIdClientsGET,
  tenantIdClientsPOST,
};
