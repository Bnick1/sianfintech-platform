// models/kioskModel.js
const mongoose = require('mongoose');

const kioskSchema = new mongoose.Schema({
  kioskId: { type: String, required: true },
  location: { type: String },
  operatorName: { type: String },
  status: { type: String, default: 'active' },
  registeredAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model('Kiosk', kioskSchema);
