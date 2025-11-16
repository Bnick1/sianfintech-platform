import express from 'express';
import aiController from '../controllers/aiController.js';

const router = express.Router();

// POST /api/ai/credit-assessment - New enhanced endpoint
router.post('/credit-assessment', aiController.assessCreditRisk);

// POST /api/ai/predict - Keep existing endpoint for compatibility
router.post('/predict', aiController.predict);
// ADD this line with your other routes
router.post('/farmer-assessment', aiController.assessFarmerCreditRisk);

export default router;