// routes/weatherRoutes.js
import express from 'express';
import weatherController from '../controllers/weatherController.js';

const router = express.Router();

// Core weather endpoints
router.post('/current', weatherController.getCurrentWeather);
router.post('/forecast', weatherController.getWeatherForecast);
router.post('/historical', weatherController.getHistoricalWeather);

// Risk assessment endpoints
router.post('/crop-risk', weatherController.assessCropWeatherRisk);
router.post('/drought-probability', weatherController.calculateDroughtProbability);
router.post('/flood-risk', weatherController.assessFloodRisk);

// Insurance and financial endpoints
router.post('/weather-index', weatherController.getWeatherIndex);

export default router;