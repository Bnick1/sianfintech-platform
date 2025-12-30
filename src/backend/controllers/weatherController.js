// controllers/weatherController.js
import weatherService from '../services/weatherService.js';

class WeatherController {
  async getCurrentWeather(req, res) {
    try {
      const { location, region } = req.body;
      
      if (!location) {
        return res.status(400).json({
          success: false,
          error: 'Location is required'
        });
      }

      console.log(`🌦️ Weather data requested for: ${location}`);
      
      const weatherData = await weatherService.getCurrentWeather(location, region);
      
      res.json({
        success: true,
        ...weatherData
      });

    } catch (error) {
      console.error('Weather API Error:', error);
      res.status(500).json({
        success: false,
        error: 'Weather service temporarily unavailable'
      });
    }
  }

  async getWeatherForecast(req, res) {
    try {
      const { location, days = 7 } = req.body;
      
      if (!location) {
        return res.status(400).json({
          success: false,
          error: 'Location is required'
        });
      }

      console.log(`📅 Weather forecast requested for: ${location}`);
      
      const forecast = await weatherService.getWeatherForecast(location, days);
      
      res.json({
        success: true,
        ...forecast
      });

    } catch (error) {
      console.error('Weather Forecast Error:', error);
      res.status(500).json({
        success: false,
        error: 'Weather forecast service unavailable'
      });
    }
  }

  async assessCropWeatherRisk(req, res) {
    try {
      const { cropType, location, plantingDate } = req.body;
      
      if (!cropType || !location) {
        return res.status(400).json({
          success: false,
          error: 'Crop type and location are required'
        });
      }

      console.log(`🌱 Crop weather risk assessment for: ${cropType} in ${location}`);
      
      const riskAssessment = await weatherService.assessCropWeatherRisk(cropType, location, plantingDate);
      
      res.json({
        success: true,
        ...riskAssessment
      });

    } catch (error) {
      console.error('Crop Weather Risk Error:', error);
      res.status(500).json({
        success: false,
        error: 'Crop risk assessment service unavailable'
      });
    }
  }

  async calculateDroughtProbability(req, res) {
    try {
      const { region, season } = req.body;
      
      if (!region) {
        return res.status(400).json({
          success: false,
          error: 'Region is required'
        });
      }

      console.log(`🏜️ Drought probability assessment for: ${region}`);
      
      const probability = await weatherService.calculateDroughtProbability(region, season);
      
      res.json({
        success: true,
        region,
        season: season || 'current',
        droughtProbability: probability,
        riskLevel: probability > 30 ? 'high' : probability > 15 ? 'medium' : 'low'
      });

    } catch (error) {
      console.error('Drought Probability Error:', error);
      res.status(500).json({
        success: false,
        error: 'Drought assessment service unavailable'
      });
    }
  }

  async assessFloodRisk(req, res) {
    try {
      const { location, elevation, nearRiver } = req.body;
      
      if (!location) {
        return res.status(400).json({
          success: false,
          error: 'Location is required'
        });
      }

      console.log(`🌊 Flood risk assessment for: ${location}`);
      
      const floodRisk = await weatherService.assessFloodRisk(location, {
        elevation,
        nearRiver
      });
      
      res.json({
        success: true,
        ...floodRisk
      });

    } catch (error) {
      console.error('Flood Risk Error:', error);
      res.status(500).json({
        success: false,
        error: 'Flood risk assessment service unavailable'
      });
    }
  }

  async getWeatherIndex(req, res) {
    try {
      const { location, season, cropType } = req.body;
      
      if (!location) {
        return res.status(400).json({
          success: false,
          error: 'Location is required'
        });
      }

      console.log(`📊 Weather index calculation for: ${location}`);
      
      const weatherIndex = await weatherService.calculateWeatherIndex(location, season, cropType);
      
      res.json({
        success: true,
        ...weatherIndex
      });

    } catch (error) {
      console.error('Weather Index Error:', error);
      res.status(500).json({
        success: false,
        error: 'Weather index service unavailable'
      });
    }
  }

  async getHistoricalWeather(req, res) {
    try {
      const { location, days = 30 } = req.body;
      
      if (!location) {
        return res.status(400).json({
          success: false,
          error: 'Location is required'
        });
      }

      console.log(`📈 Historical weather data for: ${location}`);
      
      const historicalData = await weatherService.getHistoricalWeather(location, days);
      
      res.json({
        success: true,
        ...historicalData
      });

    } catch (error) {
      console.error('Historical Weather Error:', error);
      res.status(500).json({
        success: false,
        error: 'Historical weather service unavailable'
      });
    }
  }
}

export default new WeatherController();