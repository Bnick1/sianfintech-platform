// controllers/loanController.js - ES Module version
import * as service from '../services/loanService.js';

async function applyLoan(req, res) {
  try {
    const result = await service.applyLoan({ body: req.body });
    res.status(201).json(result);
  } catch (e) {
    res.status(e.status || 500).json({ status: 'error', message: e.message });
  }
}

async function getLoan(req, res) {
  try {
    const result = await service.getLoanById({ params: req.params });
    res.status(200).json(result);
  } catch (e) {
    res.status(e.status || 500).json({ status: 'error', message: e.message });
  }
}

export { applyLoan, getLoan };