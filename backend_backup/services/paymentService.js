// services/paymentService.js
const Payment = require('../models/paymentModel');

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

module.exports = { createPayment };
