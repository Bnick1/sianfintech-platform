// routes/paymentRoutes.js
import express from 'express';
import { 
  createPayment,
  getPaymentById,
  getPaymentsByLoanId,
  getPaymentsByWalletId,
  processMobileMoneyPayment,
  processRefund,
  getPaymentStats
} from '../controllers/paymentController.js';

const router = express.Router();

// Process a new payment
router.post('/', createPayment);

// Get payment status by ID
router.get('/:id', getPaymentById);

// Get payments by loan ID
router.get('/loan/:loanId', getPaymentsByLoanId);

// Get payments by wallet ID
router.get('/wallet/:walletId', getPaymentsByWalletId);

// Process mobile money payment (Uganda-specific)
router.post('/mobile-money', processMobileMoneyPayment);

// Process payment reversal/refund
router.post('/:id/refund', processRefund);

// Get payment statistics
router.get('/stats/overview', getPaymentStats);

export default router;