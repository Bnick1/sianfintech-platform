// controllers/paymentController.js
const service = require('../services/paymentService');

async function createPayment(req, res) {
  try {
    const result = await service.createPayment({ body: req.body });
    res.status(201).json(result);
  } catch (e) {
    res.status(e.status || 500).json({ status: 'error', message: e.message });
  }
}

module.exports = { createPayment };
