// models/paymentModel.js
const mongoose = require('mongoose');

const paymentSchema = new mongoose.Schema({
  loanId: { type: String },
  walletId: { type: String, required: true },
  amount: { type: Number, required: true },
  method: { type: String, default: 'mobile_money' },
  reference: { type: String },
  status: { type: String, default: 'completed' },
  timestamp: { type: Date, default: Date.now },
});

module.exports = mongoose.model('Payment', paymentSchema);
