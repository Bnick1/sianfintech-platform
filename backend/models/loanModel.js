// models/loanModel.js
const mongoose = require('mongoose');

const loanSchema = new mongoose.Schema({
  userId: { type: String, required: true },
  amount: { type: Number, required: true },
  termMonths: { type: Number, required: true },
  purpose: { type: String, default: 'General' },
  status: { type: String, default: 'pending' },
  createdAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model('Loan', loanSchema);
