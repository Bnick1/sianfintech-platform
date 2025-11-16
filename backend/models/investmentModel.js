// models/investmentModel.js
const mongoose = require('mongoose');

const investmentSchema = new mongoose.Schema({
  userId: { type: String, required: true },
  amount: { type: Number, required: true },
  type: { type: String, default: 'general' },
  expectedReturn: { type: Number },
  durationMonths: { type: Number, default: 12 },
}, { timestamps: true });

module.exports = mongoose.model('Investment', investmentSchema);
