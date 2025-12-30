// routes/aiRoutes.js - ES Module version
import express from 'express';
import { aiPredictDefaultPOST } from '../controllers/aiController.js';

const router = express.Router();

// Route: POST /api/predict
router.post("/predict", aiPredictDefaultPOST);

export default router;