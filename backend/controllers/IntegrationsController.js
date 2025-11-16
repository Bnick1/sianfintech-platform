/**
 * The IntegrationsController file is a very simple one, which does not need to be changed manually,
 * unless there's a case where business logic routes the request to an entity which is not
 * the service.
 * The heavy lifting of the Controller item is done in Request.js - that is where request
 * parameters are extracted and sent to the service, and where response is handled.
 */

const Controller = require('./Controller');
const service = require('../services/IntegrationsService');
const integrationsAirtelPaymentPOST = async (request, response) => {
  await Controller.handleRequest(request, response, service.integrationsAirtelPaymentPOST);
};

const integrationsMpesaPaymentPOST = async (request, response) => {
  await Controller.handleRequest(request, response, service.integrationsMpesaPaymentPOST);
};

const integrationsMtnPaymentPOST = async (request, response) => {
  await Controller.handleRequest(request, response, service.integrationsMtnPaymentPOST);
};

const integrationsQbcoreLoansPOST = async (request, response) => {
  await Controller.handleRequest(request, response, service.integrationsQbcoreLoansPOST);
};


module.exports = {
  integrationsAirtelPaymentPOST,
  integrationsMpesaPaymentPOST,
  integrationsMtnPaymentPOST,
  integrationsQbcoreLoansPOST,
};
