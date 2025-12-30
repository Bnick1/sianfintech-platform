const mongoose = require('mongoose');

const InvestmentSchema = new mongoose.Schema({
  productType: { type: String, required: true, trim: true },
  amount: { type: Number, required: true, min: 0 },
  walletId: { type: String, required: true, trim: true },
  status: { type: String, enum: ['pending','active','completed','failed'], default: 'pending' },
  metadata: { type: Object, default: {} }
}, { timestamps: true });

module.exports = mongoose.model('Investment', InvestmentSchema);
