/* eslint-disable no-unused-vars */
const Service = require('./Service');

/**
* Initiate Airtel mobile money payment
*
* payment Payment 
* no response value expected for this operation
* */
const integrationsAirtelPaymentPOST = ({ payment }) => new Promise(
  async (resolve, reject) => {
    try {
      resolve(Service.successResponse({
        payment,
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
* Initiate M-Pesa payment
*
* payment Payment 
* no response value expected for this operation
* */
const integrationsMpesaPaymentPOST = ({ payment }) => new Promise(
  async (resolve, reject) => {
    try {
      resolve(Service.successResponse({
        payment,
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
* Initiate MTN mobile money payment
*
* payment Payment 
* no response value expected for this operation
* */
const integrationsMtnPaymentPOST = ({ payment }) => new Promise(
  async (resolve, reject) => {
    try {
      resolve(Service.successResponse({
        payment,
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
* Push loan data to QBCore
*
* loan Loan 
* no response value expected for this operation
* */
const integrationsQbcoreLoansPOST = ({ loan }) => new Promise(
  async (resolve, reject) => {
    try {
      resolve(Service.successResponse({
        loan,
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
  integrationsAirtelPaymentPOST,
  integrationsMpesaPaymentPOST,
  integrationsMtnPaymentPOST,
  integrationsQbcoreLoansPOST,
};
