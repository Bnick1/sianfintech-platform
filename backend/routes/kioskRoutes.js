// routes/kioskRoutes.js - ES Module version
import express from 'express';
import { registerKiosk, getKioskStatus } from '../controllers/kioskController.js';

const router = express.Router();

router.post('/register', registerKiosk);
router.get('/status/:kioskId', getKioskStatus);

export default router;
