// routes/aiRoutes.js
import express from 'express';
import aiController from '../controllers/aiController.js';

const router = express.Router();

// Core credit assessment endpoints
router.post('/credit-assessment', aiController.assessCreditRisk);
router.post('/predict', aiController.predict); // Legacy compatibility
router.post('/quick-assessment', aiController.quickAssessment);

// Segment-specific assessment endpoints
router.post('/farmer-assessment', aiController.assessFarmerCreditRisk);
router.post('/business-assessment', aiController.assessBusinessCreditRisk);
router.post('/gig-worker-assessment', aiController.assessGigWorkerRisk);
router.post('/comprehensive-assessment', aiController.comprehensiveRiskAssessment);

// Specialized analysis endpoints
router.post('/social-capital', aiController.assessSocialCapital);
router.post('/weather-risk', aiController.assessWeatherRisk);
router.post('/dynamic-pricing', aiController.calculateDynamicPricing);
router.post('/portfolio-risk', aiController.analyzePortfolioRisk);

// Batch processing endpoint
router.post('/batch-assessment', aiController.batchAssessment);

// NEW: Informal sector assessment endpoints
router.post('/informal-sector-assessment', aiController.informalSectorAssessment);
router.post('/batch-informal-assessment', aiController.batchInformalAssessment);
router.get('/sector-risk/:occupation', aiController.sectorRiskAnalysis);

export default router;