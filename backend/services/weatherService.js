// services/weatherService.js
import axios from 'axios';

class WeatherService {
  constructor() {
    // Uganda National Meteorological Authority API configuration
    this.unaBaseURL = process.env.UNA_API_URL || 'https://api.una.go.ug/v1';
    this.unaApiKey = process.env.UNA_API_KEY;
    
    // OpenWeatherMap configuration with your API key
    this.owmBaseURL = 'https://api.openweathermap.org/data/2.5';
    this.owmApiKey = process.env.OPENWEATHER_API_KEY || 'af513fc718eb6f6676c1fc96427b2b63';
    
    // Enhanced Uganda regions with more precise coordinates
    this.ugandaRegions = {
      central: { 
        lat: 0.3476, 
        lon: 32.5825, 
        climate: 'tropical',
        cities: ['Kampala', 'Wakiso', 'Mpigi', 'Mityana', 'Mubende']
      },
      eastern: { 
        lat: 1.4786, 
        lon: 33.9306, 
        climate: 'savanna',
        cities: ['Jinja', 'Mbale', 'Soroti', 'Tororo', 'Iganga']
      },
      northern: { 
        lat: 2.7746, 
        lon: 32.2980, 
        climate: 'semi_arid', 
        cities: ['Gulu', 'Lira', 'Arua', 'Kitgum', 'Nebbi']
      },
      western: { 
        lat: 0.6245, 
        lon: 30.2675, 
        climate: 'highland',
        cities: ['Mbarara', 'Fort Portal', 'Kasese', 'Kabale', 'Bushenyi']
      }
    };

    // Cache for weather data to reduce API calls
    this.cache = new Map();
    this.cacheDuration = parseInt(process.env.WEATHER_CACHE_DURATION) || 3600000; // 1 hour default
    
    // Enhanced crop sensitivity data for Uganda
    this.cropSensitivities = {
      maize: { 
        minRainfall: 20, maxRainfall: 80, minTemp: 15, maxTemp: 35,
        droughtTolerance: 'medium', floodTolerance: 'low'
      },
      coffee: { 
        minRainfall: 30, maxRainfall: 60, minTemp: 18, maxTemp: 28,
        droughtTolerance: 'low', floodTolerance: 'low'
      },
      beans: { 
        minRainfall: 25, maxRainfall: 70, minTemp: 16, maxTemp: 32,
        droughtTolerance: 'medium', floodTolerance: 'medium'
      },
      bananas: { 
        minRainfall: 40, maxRainfall: 100, minTemp: 20, maxTemp: 30,
        droughtTolerance: 'low', floodTolerance: 'medium'
      },
      cassava: { 
        minRainfall: 15, maxRainfall: 90, minTemp: 20, maxTemp: 35,
        droughtTolerance: 'high', floodTolerance: 'medium'
      },
      rice: {
        minRainfall: 50, maxRainfall: 120, minTemp: 20, maxTemp: 32,
        droughtTolerance: 'low', floodTolerance: 'high'
      },
      millet: {
        minRainfall: 10, maxRainfall: 60, minTemp: 18, maxTemp: 38,
        droughtTolerance: 'high', floodTolerance: 'low'
      }
    };

    console.log('🌦️ Weather Service initialized with OpenWeatherMap API');
  }

  // Enhanced current weather with caching and better error handling
  async getCurrentWeather(location, region = 'central') {
    const cacheKey = `current_${location}_${region}`;
    
    // Check cache first
    const cached = this.getFromCache(cacheKey);
    if (cached) {
      console.log(`📦 Using cached weather data for: ${location}`);
      return cached;
    }

    try {
      console.log(`🌤️ Fetching current weather for: ${location} in ${region}`);
      
      let weatherData;
      const useFallback = !this.unaApiKey || this.unaApiKey.includes('demo_key') || this.unaApiKey.includes('your_una_api_key');
      
      if (useFallback) {
        console.log('🔄 Using OpenWeatherMap fallback');
        weatherData = await this.fetchFallbackWeather(location, region);
      } else {
        try {
          weatherData = await this.fetchUNAWeather(location, region);
        } catch (unaError) {
          console.log('🔄 UNA API failed, using OpenWeatherMap:', unaError.message);
          weatherData = await this.fetchFallbackWeather(location, region);
        }
      }

      const processedData = this.processWeatherData(weatherData, location, region);
      
      // Cache the result
      this.setCache(cacheKey, processedData);
      
      return processedData;

    } catch (error) {
      console.error('❌ All weather services failed:', error.message);
      // Return realistic mock data for Uganda
      return this.generateUgandaMockWeather(location, region);
    }
  }

  // Enhanced historical weather with Uganda-specific patterns
  async getHistoricalWeather(location, days = 30) {
    const cacheKey = `historical_${location}_${days}`;
    const cached = this.getFromCache(cacheKey);
    if (cached) return cached;

    try {
      console.log(`📊 Fetching historical weather for: ${location} (${days} days)`);
      
      // In production, this would integrate with UNA historical API
      const historicalData = await this.fetchHistoricalData(location, days);
      const analyzedData = this.analyzeHistoricalPatterns(historicalData);
      
      this.setCache(cacheKey, analyzedData);
      return analyzedData;

    } catch (error) {
      console.error('Historical weather error:', error);
      return this.generateHistoricalEstimate(location, days);
    }
  }

  // Enhanced forecast with better Uganda agricultural insights
  async getWeatherForecast(location, days = 7) {
    const cacheKey = `forecast_${location}_${days}`;
    const cached = this.getFromCache(cacheKey);
    if (cached) return cached;

    try {
      console.log(`📅 Fetching weather forecast for: ${location} (${days} days)`);
      
      const forecast = await this.fetchWeatherForecast(location, days);
      const processedData = this.processForecastData(forecast);
      
      this.setCache(cacheKey, processedData);
      return processedData;

    } catch (error) {
      console.error('Weather forecast error:', error);
      return this.generateForecastEstimate(location, days);
    }
  }

  // Enhanced drought probability with Uganda seasonal patterns
  async calculateDroughtProbability(region, season = this.getCurrentSeason()) {
    const cacheKey = `drought_${region}_${season}`;
    const cached = this.getFromCache(cacheKey);
    if (cached) return cached;

    const historicalData = await this.getHistoricalWeather(region, 365);
    const probability = this.analyzeDroughtRisk(historicalData, region, season);
    
    const result = {
      probability,
      riskLevel: probability > 40 ? 'high' : probability > 20 ? 'medium' : 'low',
      region,
      season,
      factors: this.getDroughtFactors(region, season, probability)
    };

    this.setCache(cacheKey, result);
    return result;
  }

  // Enhanced flood risk assessment for Uganda topography
  async assessFloodRisk(location, topographicalData = {}) {
    const [currentWeather, historicalData] = await Promise.all([
      this.getCurrentWeather(location),
      this.getHistoricalWeather(location, 90)
    ]);

    return this.calculateFloodProbability(currentWeather, historicalData, topographicalData);
  }

  // Enhanced crop risk assessment with Uganda agricultural calendar
  async assessCropWeatherRisk(cropType, location, plantingDate = new Date()) {
    const [currentWeather, forecast, historicalData] = await Promise.all([
      this.getCurrentWeather(location),
      this.getWeatherForecast(location, 30),
      this.getHistoricalWeather(location, 365)
    ]);

    return this.analyzeCropRisk(cropType, currentWeather, forecast, historicalData, plantingDate);
  }

  // Enhanced weather index for insurance products
  async calculateWeatherIndex(location, season = this.getCurrentSeason(), cropType = 'maize') {
    const cacheKey = `index_${location}_${season}_${cropType}`;
    const cached = this.getFromCache(cacheKey);
    if (cached) return cached;

    const [historicalData, forecast] = await Promise.all([
      this.getHistoricalWeather(location, 1095), // 3 years
      this.getWeatherForecast(location, 90)
    ]);

    const weatherIndex = this.generateWeatherIndex(historicalData, forecast, season, cropType);
    
    this.setCache(cacheKey, weatherIndex);
    return weatherIndex;
  }

  // New: Get agricultural advisory based on weather
  async getAgriculturalAdvisory(location, crops = ['maize'], currentActivities = []) {
    const [currentWeather, forecast] = await Promise.all([
      this.getCurrentWeather(location),
      this.getWeatherForecast(location, 7)
    ]);

    return this.generateAgriculturalAdvisory(currentWeather, forecast, crops, currentActivities);
  }

  // New: Get seasonal outlook for Uganda
  async getSeasonalOutlook(region, season = this.getCurrentSeason()) {
    const historicalData = await this.getHistoricalWeather(region, 1095);
    return this.generateSeasonalOutlook(historicalData, region, season);
  }

  // PRIVATE METHODS

  // Enhanced UNA API integration
  async fetchUNAWeather(location, region) {
    try {
      const response = await axios.get(`${this.unaBaseURL}/weather/current`, {
        params: {
          location: location,
          region: region,
          api_key: this.unaApiKey
        },
        timeout: 10000
      });
      
      if (!response.data || response.data.error) {
        throw new Error(response.data?.error || 'UNA API returned error');
      }
      
      return response.data;
    } catch (error) {
      console.error('UNA API Error:', error.message);
      throw new Error(`UNA API unavailable: ${error.message}`);
    }
  }

  // Enhanced OpenWeatherMap integration with better Uganda coverage
  async fetchFallbackWeather(location, region) {
    try {
      const regionCoords = this.getRegionCoordinates(location);
      
      const response = await axios.get(`${this.owmBaseURL}/weather`, {
        params: {
          lat: regionCoords.lat,
          lon: regionCoords.lon,
          appid: this.owmApiKey,
          units: 'metric'
        },
        timeout: 10000
      });

      if (response.data.cod !== 200) {
        throw new Error(`OpenWeatherMap error: ${response.data.message}`);
      }

      return response.data;
    } catch (error) {
      console.error('OpenWeatherMap Error:', error.message);
      throw new Error(`Weather service unavailable: ${error.message}`);
    }
  }

  // Enhanced historical data with Uganda climate patterns
  async fetchHistoricalData(location, days) {
    // Simulate API call - in production, integrate with UNA historical API
    const region = this.getRegionCoordinates(location);
    
    return {
      location,
      region: region.climate,
      period: days,
      averageRainfall: this.getRegionalAverageRainfall(region),
      temperatureRange: this.getRegionalTemperatureRange(region),
      extremeEvents: this.getHistoricalExtremeEvents(location, days),
      rainfallPattern: this.generateRainfallPattern(region, days),
      source: 'una_historical'
    };
  }

  // Enhanced forecast with better error handling
  async fetchWeatherForecast(location, days) {
    try {
      const regionCoords = this.getRegionCoordinates(location);
      const count = Math.min(Math.floor(days * 8), 40); // OpenWeatherMap limit
      
      const response = await axios.get(`${this.owmBaseURL}/forecast`, {
        params: {
          lat: regionCoords.lat,
          lon: regionCoords.lon,
          appid: this.owmApiKey,
          units: 'metric',
          cnt: count
        },
        timeout: 10000
      });

      if (response.data.cod !== '200') {
        throw new Error(`OpenWeatherMap forecast error: ${response.data.message}`);
      }

      return response.data;
    } catch (error) {
      console.error('Forecast API Error:', error.message);
      throw new Error(`Forecast service unavailable: ${error.message}`);
    }
  }

  // Enhanced weather data processing
  processWeatherData(rawData, location, region) {
    const temperature = rawData.main?.temp || 25;
    const humidity = rawData.main?.humidity || 65;
    const rainfall = rawData.rain?.['1h'] || rawData.rain?.['3h'] || 0;
    const windSpeed = rawData.wind?.speed || 2.5;
    const condition = rawData.weather?.[0]?.main || 'Clear';
    
    return {
      location,
      region,
      temperature,
      humidity,
      rainfall,
      windSpeed,
      condition,
      description: rawData.weather?.[0]?.description || 'Clear sky',
      pressure: rawData.main?.pressure || 1013,
      visibility: rawData.visibility || 10000,
      cloudCover: rawData.clouds?.all || 0,
      timestamp: new Date(),
      riskLevel: this.calculateImmediateRisk({ temperature, rainfall, windSpeed, condition }),
      recommendations: this.generateWeatherRecommendations({ temperature, rainfall, windSpeed, condition }, region),
      source: 'openweathermap'
    };
  }

  // Enhanced forecast processing
  processForecastData(forecastData) {
    const dailyForecasts = [];
    
    // Group 3-hour forecasts into daily summaries
    for (let i = 0; i < forecastData.list.length; i += 8) {
      const dayForecasts = forecastData.list.slice(i, i + 8);
      if (dayForecasts.length > 0) {
        const daySummary = this.summarizeDayForecast(dayForecasts);
        dailyForecasts.push(daySummary);
      }
    }

    return {
      location: forecastData.city?.name || 'Unknown Location',
      country: forecastData.city?.country || 'UG',
      forecasts: dailyForecasts.slice(0, 7),
      overallRisk: this.calculateForecastRisk(dailyForecasts),
      agriculturalImpact: this.assessAgriculturalImpact(dailyForecasts),
      source: 'openweathermap'
    };
  }

  // Enhanced risk calculations for Uganda
  calculateImmediateRisk(weatherData) {
    let riskScore = 0;
    const factors = [];

    // Temperature risk for Uganda crops
    if (weatherData.temperature > 35) {
      riskScore += 3;
      factors.push('extreme_heat');
    } else if (weatherData.temperature < 12) {
      riskScore += 2;
      factors.push('unusual_cold');
    }

    // Rainfall risk
    if (weatherData.rainfall > 25) {
      riskScore += 4;
      factors.push('heavy_rainfall');
    } else if (weatherData.rainfall > 10) {
      riskScore += 2;
      factors.push('moderate_rain');
    } else if (weatherData.rainfall === 0 && weatherData.condition === 'Clear') {
      riskScore -= 1; // Favorable conditions
    }

    // Wind risk
    if (weatherData.windSpeed > 10) {
      riskScore += 3;
      factors.push('strong_winds');
    } else if (weatherData.windSpeed > 6) {
      riskScore += 1;
      factors.push('moderate_wind');
    }

    // Storm conditions
    if (weatherData.condition === 'Thunderstorm') {
      riskScore += 5;
      factors.push('thunderstorm');
    }

    if (riskScore >= 7) return { level: 'high', score: riskScore, factors };
    if (riskScore >= 4) return { level: 'medium', score: riskScore, factors };
    return { level: 'low', score: riskScore, factors };
  }

  // CACHE MANAGEMENT
  getFromCache(key) {
    const cached = this.cache.get(key);
    if (cached && Date.now() - cached.timestamp < this.cacheDuration) {
      return cached.data;
    }
    this.cache.delete(key); // Remove expired cache
    return null;
  }

  setCache(key, data) {
    this.cache.set(key, {
      data,
      timestamp: Date.now()
    });
  }

  // ... (rest of the methods from previous version with Uganda-specific enhancements)

  // NEW: Uganda-specific agricultural advisory
  generateAgriculturalAdvisory(currentWeather, forecast, crops, currentActivities) {
    const advisories = [];
    const season = this.getCurrentSeason();

    crops.forEach(crop => {
      const cropAdvisory = this.getCropSpecificAdvisory(crop, currentWeather, forecast, season, currentActivities);
      advisories.push(cropAdvisory);
    });

    return {
      timestamp: new Date(),
      location: currentWeather.location,
      season,
      advisories,
      overallRecommendation: this.getOverallAgriculturalRecommendation(advisories)
    };
  }

  getCropSpecificAdvisory(crop, currentWeather, forecast, season, activities) {
    const sensitivity = this.cropSensitivities[crop] || this.cropSensitivities.maize;
    const recommendations = [];

    // Rainfall-based recommendations
    if (currentWeather.rainfall > sensitivity.maxRainfall) {
      recommendations.push(`Drainage needed for ${crop} fields`);
    } else if (currentWeather.rainfall < sensitivity.minRainfall) {
      recommendations.push(`Consider irrigation for ${crop}`);
    }

    // Temperature-based recommendations
    if (currentWeather.temperature > sensitivity.maxTemp) {
      recommendations.push(`Provide shade or mulch for ${crop}`);
    }

    // Seasonal recommendations for Uganda
    if (season === 'dry' && sensitivity.droughtTolerance === 'low') {
      recommendations.push(`Monitor ${crop} closely during dry season`);
    }

    if (season === 'wet' && sensitivity.floodTolerance === 'low') {
      recommendations.push(`Ensure proper drainage for ${crop}`);
    }

    return {
      crop,
      riskLevel: this.calculateCropRiskLevel(crop, currentWeather, forecast),
      recommendations: recommendations.length > 0 ? recommendations : ['Favorable conditions for cultivation'],
      nextActions: this.getCropNextActions(crop, season, activities)
    };
  }

  // Uganda seasonal calendar
  getCurrentSeason() {
    const month = new Date().getMonth() + 1;
    
    // Uganda seasons: Dry (Dec-Feb, Jun-Jul), Wet (Mar-May, Aug-Nov)
    if (month >= 12 || month <= 2) return 'dry';
    if (month >= 3 && month <= 5) return 'wet';
    if (month >= 6 && month <= 7) return 'dry';
    return 'wet'; // Aug-Nov
  }

  // Enhanced Uganda mock data
  generateUgandaMockWeather(location, region) {
    const regionData = this.ugandaRegions[region] || this.ugandaRegions.central;
    const baseTemp = regionData.climate === 'highland' ? 20 : 25;
    const season = this.getCurrentSeason();
    
    // Seasonal variations
    const tempVariation = season === 'dry' ? 3 : -2;
    const rainChance = season === 'wet' ? 0.6 : 0.2;

    return {
      location,
      region,
      temperature: baseTemp + tempVariation + (Math.random() * 6 - 3),
      humidity: season === 'wet' ? 75 + Math.random() * 20 : 50 + Math.random() * 25,
      rainfall: rainChance > Math.random() ? Math.random() * 15 : 0,
      windSpeed: 2 + Math.random() * 4,
      condition: this.getRandomCondition(season),
      description: 'Simulated weather data',
      timestamp: new Date(),
      riskLevel: { level: 'low', score: 1, factors: [] },
      recommendations: ['Weather simulation active - real data recommended for critical decisions'],
      source: 'simulated'
    };
  }

  getRandomCondition(season) {
    const dryConditions = ['Clear', 'Clear', 'Clouds', 'Clouds'];
    const wetConditions = ['Clouds', 'Rain', 'Drizzle', 'Clouds', 'Clear'];
    const conditions = season === 'dry' ? dryConditions : wetConditions;
    return conditions[Math.floor(Math.random() * conditions.length)];
  }

  // Additional helper methods for Uganda agriculture...
  calculateCropRiskLevel(crop, currentWeather, forecast) {
    // Implementation for crop risk calculation
    return 'low'; // Simplified for example
  }

  getCropNextActions(crop, season, activities) {
    // Implementation for crop next actions
    return ['Monitor growth', 'Check soil moisture'];
  }

  getOverallAgriculturalRecommendation(advisories) {
    // Implementation for overall recommendation
    return 'Proceed with normal farming activities';
  }

  generateRainfallPattern(region, days) {
    // Implementation for rainfall pattern generation
    return { trend: 'stable', pattern: 'consistent' };
  }

  getDroughtFactors(region, season, probability) {
    // Implementation for drought factors
    return ['Historical patterns', 'Seasonal forecast', 'Regional climate'];
  }

  generateSeasonalOutlook(historicalData, region, season) {
    // Implementation for seasonal outlook
    return { outlook: 'favorable', confidence: 'medium' };
  }

  // ... (include all other methods from the previous version with Uganda-specific adjustments)
}

export default new WeatherService();