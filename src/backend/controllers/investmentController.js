// controllers/investmentController.js
const service = require('../services/investmentService');

exports.createInvestment = async (req, res) => {
  try {
    const result = await service.createInvestment(req.body);
    res.status(201).json({ status: 'success', data: result });
  } catch (err) {
    res.status(err.status || 500).json({ status: 'error', message: err.message });
  }
};

exports.getInvestment = async (req, res) => {
  try {
    const result = await service.getInvestmentById(req.params.id);
    if (!result) return res.status(404).json({ status: 'error', message: 'Investment not found' });
    res.status(200).json({ status: 'success', data: result });
  } catch (err) {
    res.status(err.status || 500).json({ status: 'error', message: err.message });
  }
};

exports.getAllInvestments = async (req, res) => {
  try {
    const result = await service.getAllInvestments();
    res.status(200).json({ status: 'success', data: result });
  } catch (err) {
    res.status(err.status || 500).json({ status: 'error', message: err.message });
  }
};
