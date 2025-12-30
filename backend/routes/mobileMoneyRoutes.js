// routes/mobileMoneyRoutes.js - Enhanced with all MTN APIs
import express from 'express';
import {
  initiatePayment,
  initiateCollection,
  initiateDisbursement,
  initiateRemittance,
  requestPayment,
  initiateMTNPayment,
  initiateAirtelPayment,
  checkTransactionStatus,
  handleWebhook,
  getSupportedProviders
} from '../controllers/mobileMoneyController.js';

const router = express.Router();

// Unified payment endpoints (backward compatibility)
router.post('/payments/initiate', initiatePayment);
router.post('/payments/request', requestPayment);

// MTN API Specific Endpoints
router.post('/collections', initiateCollection);
router.post('/disbursements', initiateDisbursement);
router.post('/remittances', initiateRemittance);

// Provider-specific endpoints
router.post('/payments/mtn', initiateMTNPayment);
router.post('/payments/airtel', initiateAirtelPayment);

// Transaction status
router.get('/payments/status/:provider/:transactionId', checkTransactionStatus);

// Webhook endpoints for callbacks
router.post('/webhook/mtn', (req, res) => handleWebhook(req, res, 'mtn'));
router.post('/webhook/airtel', (req, res) => handleWebhook(req, res, 'airtel'));

// Utility endpoints
router.get('/providers', getSupportedProviders);

// Health check for mobile money service
router.get('/health', (req, res) => {
  res.status(200).json({
    status: 'success',
    message: 'Mobile Money API is running',
    timestamp: new Date().toISOString(),
    supportedProviders: ['mtn', 'airtel'],
    availableEndpoints: [
      '/collections',
      '/disbursements', 
      '/remittances',
      '/payments/initiate',
      '/payments/request'
    ]
  });
});

export default router;
