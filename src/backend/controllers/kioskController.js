// controllers/kioskController.js - ES Module version
import * as service from '../services/kioskService.js';

async function registerKiosk(req, res) {
  try {
    const result = await service.registerKiosk({ body: req.body });
    res.status(201).json(result);
  } catch (e) {
    res.status(e.status || 500).json({ status: 'error', message: e.message });
  }
}

async function getKioskStatus(req, res) {
  try {
    const result = await service.getKioskStatus({ params: req.params });
    res.status(200).json(result);
  } catch (e) {
    res.status(e.status || 500).json({ status: 'error', message: e.message });
  }
}

export { registerKiosk, getKioskStatus };
