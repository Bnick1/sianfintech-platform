// controllers/paymentController.js
import { 
  createPayment,
  getPaymentById,
  getPaymentsByLoanId,
  getPaymentsByWalletId,
  processMobileMoneyPayment,
  processRefund,
  getPaymentStats
} from '../services/paymentService.js';

async function createPaymentHandler(req, res) {
  try {
    const result = await createPayment({ body: req.body });
    res.status(201).json(result);
  } catch (e) {
    res.status(e.status || 500).json({ status: 'error', message: e.message });
  }
}

async function getPaymentByIdHandler(req, res) {
  try {
    const result = await getPaymentById({ params: req.params });
    res.status(200).json(result);
  } catch (e) {
    res.status(e.status || 500).json({ status: 'error', message: e.message });
  }
}

async function getPaymentsByLoanIdHandler(req, res) {
  try {
    const result = await getPaymentsByLoanId({ params: req.params });
    res.status(200).json(result);
  } catch (e) {
    res.status(e.status || 500).json({ status: 'error', message: e.message });
  }
}

async function getPaymentsByWalletIdHandler(req, res) {
  try {
    const result = await getPaymentsByWalletId({ params: req.params });
    res.status(200).json(result);
  } catch (e) {
    res.status(e.status || 500).json({ status: 'error', message: e.message });
  }
}

async function processMobileMoneyPaymentHandler(req, res) {
  try {
    const result = await processMobileMoneyPayment({ body: req.body });
    res.status(201).json(result);
  } catch (e) {
    res.status(e.status || 500).json({ status: 'error', message: e.message });
  }
}

async function processRefundHandler(req, res) {
  try {
    const result = await processRefund({ params: req.params, body: req.body });
    res.status(200).json(result);
  } catch (e) {
    res.status(e.status || 500).json({ status: 'error', message: e.message });
  }
}

async function getPaymentStatsHandler(req, res) {
  try {
    const result = await getPaymentStats();
    res.status(200).json(result);
  } catch (e) {
    res.status(e.status || 500).json({ status: 'error', message: e.message });
  }
}

export { 
  createPaymentHandler as createPayment,
  getPaymentByIdHandler as getPaymentById,
  getPaymentsByLoanIdHandler as getPaymentsByLoanId,
  getPaymentsByWalletIdHandler as getPaymentsByWalletId,
  processMobileMoneyPaymentHandler as processMobileMoneyPayment,
  processRefundHandler as processRefund,
  getPaymentStatsHandler as getPaymentStats
};