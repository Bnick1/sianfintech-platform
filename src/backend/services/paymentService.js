// services/paymentService.js
import Payment from '../models/paymentModel.js';

async function createPayment({ body }) {
  const { loanId, walletId, amount, method } = body;
  if (!walletId || !amount) throw { status: 400, message: 'Missing walletId or amount' };

  const payment = new Payment({
    loanId,
    walletId,
    amount,
    method,
    reference: `TXN-${Math.floor(Math.random() * 9000 + 1000)}`,
  });

  const saved = await payment.save();
  return { status: 'success', payment: saved };
}

async function getPaymentById({ params }) {
  const { id } = params;
  const payment = await Payment.findById(id);
  if (!payment) throw { status: 404, message: 'Payment not found' };
  return { status: 'success', payment };
}

async function getPaymentsByLoanId({ params }) {
  const { loanId } = params;
  const payments = await Payment.find({ loanId }).sort({ timestamp: -1 });
  return { 
    status: 'success', 
    payments,
    total: payments.length,
    totalAmount: payments.reduce((sum, payment) => sum + payment.amount, 0)
  };
}

async function getPaymentsByWalletId({ params }) {
  const { walletId } = params;
  const payments = await Payment.find({ walletId }).sort({ timestamp: -1 });
  return { 
    status: 'success', 
    payments,
    total: payments.length,
    totalAmount: payments.reduce((sum, payment) => sum + payment.amount, 0)
  };
}

async function processMobileMoneyPayment({ body }) {
  const { phone, amount, provider = 'MTN', loanId, walletId } = body;
  
  if (!phone || !amount) {
    throw { status: 400, message: 'Phone number and amount are required for mobile money payment' };
  }

  // Simulate mobile money processing
  const payment = new Payment({
    loanId,
    walletId,
    amount,
    method: 'mobile_money',
    provider,
    phone,
    reference: `MM-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
    status: 'completed'
  });

  const saved = await payment.save();
  
  return { 
    status: 'success', 
    message: 'Mobile money payment processed successfully',
    payment: saved,
    provider,
    confirmation: `Payment of UGX ${amount} received from ${phone}`
  };
}

async function processRefund({ params, body }) {
  const { id } = params;
  const { reason } = body;
  
  const payment = await Payment.findById(id);
  if (!payment) throw { status: 404, message: 'Payment not found' };
  
  // Create refund payment (negative amount)
  const refund = new Payment({
    loanId: payment.loanId,
    walletId: payment.walletId,
    amount: -payment.amount,
    method: `${payment.method}_refund`,
    reference: `REF-${payment.reference}`,
    status: 'completed',
    refundReason: reason,
    originalPaymentId: payment._id
  });

  const savedRefund = await refund.save();
  
  return { 
    status: 'success', 
    message: 'Refund processed successfully',
    refund: savedRefund,
    originalPayment: payment._id
  };
}

async function getPaymentStats() {
  const stats = await Payment.aggregate([
    {
      $group: {
        _id: null,
        totalPayments: { $sum: 1 },
        totalVolume: { $sum: '$amount' },
        averagePayment: { $avg: '$amount' }
      }
    }
  ]);

  const methodStats = await Payment.aggregate([
    {
      $group: {
        _id: '$method',
        count: { $sum: 1 },
        totalAmount: { $sum: '$amount' }
      }
    }
  ]);

  const recentPayments = await Payment.find()
    .sort({ timestamp: -1 })
    .limit(5);

  return {
    status: 'success',
    overview: stats[0] || { totalPayments: 0, totalVolume: 0, averagePayment: 0 },
    byMethod: methodStats,
    recentPayments
  };
}

export { 
  createPayment,
  getPaymentById,
  getPaymentsByLoanId,
  getPaymentsByWalletId,
  processMobileMoneyPayment,
  processRefund,
  getPaymentStats
};