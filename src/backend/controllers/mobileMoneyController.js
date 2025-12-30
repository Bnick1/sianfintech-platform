// controllers/mobileMoneyController.js - Enhanced with all MTN APIs
import { MobileMoneyService } from '../services/mobileMoneyService.js';
import Loan from '../models/loanModel.js';

const mobileMoneyService = new MobileMoneyService();

// Initiate payment (disbursement) - backward compatibility
async function initiatePayment(req, res) {
  try {
    const { phoneNumber, amount, reference, description, loanId } = req.body;

    if (!phoneNumber || !amount || !reference) {
      return res.status(400).json({
        status: 'error',
        message: 'Missing required fields: phoneNumber, amount, reference'
      });
    }

    const result = await mobileMoneyService.initiatePayment(
      phoneNumber,
      amount,
      reference,
      description
    );

    if (result.success && loanId) {
      await Loan.findByIdAndUpdate(loanId, {
        $push: {
          'walletIntegration.walletTransactions': {
            transactionId: reference,
            type: 'disbursement',
            amount: amount,
            status: 'pending',
            mobileMoneyRef: reference,
            timestamp: new Date()
          }
        }
      });
    }

    res.status(200).json({
      status: result.success ? 'success' : 'error',
      message: result.success ? 'Payment initiated successfully' : result.error,
      data: result
    });

  } catch (error) {
    console.error('Payment initiation error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Failed to initiate payment',
      error: error.message
    });
  }
}

// ===== COLLECTIONS ENDPOINT - Receive payments FROM customers =====
async function initiateCollection(req, res) {
  try {
    const { phoneNumber, amount, reference, description } = req.body;

    if (!phoneNumber || !amount || !reference) {
      return res.status(400).json({
        status: 'error',
        message: 'Missing required fields: phoneNumber, amount, reference'
      });
    }

    const result = await mobileMoneyService.initiateCollection(
      phoneNumber,
      amount,
      reference,
      description
    );

    res.status(200).json({
      status: result.success ? 'success' : 'error',
      message: result.success ? 'Collection initiated successfully' : result.error,
      data: result
    });

  } catch (error) {
    console.error('Collection initiation error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Failed to initiate collection',
      error: error.message
    });
  }
}

// ===== DISBURSEMENTS ENDPOINT - Send payments TO customers =====
async function initiateDisbursement(req, res) {
  try {
    const { phoneNumber, amount, reference, description } = req.body;

    if (!phoneNumber || !amount || !reference) {
      return res.status(400).json({
        status: 'error',
        message: 'Missing required fields: phoneNumber, amount, reference'
      });
    }

    const result = await mobileMoneyService.initiateDisbursement(
      phoneNumber,
      amount,
      reference,
      description
    );

    res.status(200).json({
      status: result.success ? 'success' : 'error',
      message: result.success ? 'Disbursement initiated successfully' : result.error,
      data: result
    });

  } catch (error) {
    console.error('Disbursement initiation error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Failed to initiate disbursement',
      error: error.message
    });
  }
}

// ===== REMITTANCES ENDPOINT - Cross-border payments =====
async function initiateRemittance(req, res) {
  try {
    const { phoneNumber, amount, reference, currency, description } = req.body;

    if (!phoneNumber || !amount || !reference) {
      return res.status(400).json({
        status: 'error',
        message: 'Missing required fields: phoneNumber, amount, reference'
      });
    }

    const result = await mobileMoneyService.initiateRemittance(
      phoneNumber,
      amount,
      reference,
      currency,
      description
    );

    res.status(200).json({
      status: result.success ? 'success' : 'error',
      message: result.success ? 'Remittance initiated successfully' : result.error,
      data: result
    });

  } catch (error) {
    console.error('Remittance initiation error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Failed to initiate remittance',
      error: error.message
    });
  }
}

// Request payment (collections) - backward compatibility
async function requestPayment(req, res) {
  try {
    const { phoneNumber, amount, reference, description } = req.body;

    if (!phoneNumber || !amount || !reference) {
      return res.status(400).json({
        status: 'error',
        message: 'Missing required fields: phoneNumber, amount, reference'
      });
    }

    const result = await mobileMoneyService.requestPayment(
      phoneNumber,
      amount,
      reference,
      description
    );

    res.status(200).json({
      status: result.success ? 'success' : 'error',
      message: result.success ? 'Payment request sent successfully' : result.error,
      data: result
    });

  } catch (error) {
    console.error('Payment request error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Failed to request payment',
      error: error.message
    });
  }
}

// Provider-specific endpoints
async function initiateMTNPayment(req, res) {
  try {
    const { phone, amount, reference, description } = req.body;

    if (!phone || !amount || !reference) {
      return res.status(400).json({
        status: 'error',
        message: 'Missing required fields: phone, amount, reference'
      });
    }

    const result = await mobileMoneyService.initiateMTNPayment(
      phone,
      amount,
      reference,
      description
    );

    res.status(200).json({
      status: result.success ? 'success' : 'error',
      message: result.success ? 'MTN payment initiated successfully' : result.error,
      data: result
    });

  } catch (error) {
    console.error('MTN payment error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Failed to initiate MTN payment',
      error: error.message
    });
  }
}

async function initiateAirtelPayment(req, res) {
  try {
    const { phone, amount, reference, description } = req.body;

    if (!phone || !amount || !reference) {
      return res.status(400).json({
        status: 'error',
        message: 'Missing required fields: phone, amount, reference'
      });
    }

    const result = await mobileMoneyService.simulateAirtelPayment(
      phone,
      amount,
      reference,
      description
    );

    res.status(200).json({
      status: result.success ? 'success' : 'error',
      message: result.success ? 'Airtel payment initiated successfully' : result.error,
      data: result
    });

  } catch (error) {
    console.error('Airtel payment error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Failed to initiate Airtel payment',
      error: error.message
    });
  }
}

// Check transaction status
async function checkTransactionStatus(req, res) {
  try {
    const { provider, transactionId } = req.params;

    if (!provider || !transactionId) {
      return res.status(400).json({
        status: 'error',
        message: 'Missing required parameters: provider, transactionId'
      });
    }

    const result = await mobileMoneyService.checkTransactionStatus(transactionId, provider);

    res.status(200).json({
      status: result.success ? 'success' : 'error',
      message: result.success ? 'Transaction status retrieved' : result.error,
      data: result
    });

  } catch (error) {
    console.error('Status check error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Failed to check transaction status',
      error: error.message
    });
  }
}

// Handle webhook
async function handleWebhook(req, res, provider) {
  try {
    console.log(`${provider.toUpperCase()} webhook received:`, req.body);
    
    // Process webhook based on provider
    res.status(200).json({
      status: 'success',
      message: 'Webhook processed successfully',
      provider: provider
    });
  } catch (error) {
    console.error('Webhook processing error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Failed to process webhook',
      error: error.message
    });
  }
}

// Get supported providers
async function getSupportedProviders(req, res) {
  try {
    res.status(200).json({
      status: 'success',
      providers: ['mtn', 'airtel']
    });
  } catch (error) {
    console.error('Providers fetch error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Failed to fetch supported providers',
      error: error.message
    });
  }
}

export {
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
};
