class AIService {
  async analyzeCreditRisk(occupation) {
    // Simulate AI processing time
    await new Promise(resolve => setTimeout(resolve, 800));
    
    const riskProfile = this.calculateRiskProfile(occupation);
    const economicFactors = this.getEconomicFactors();
    const historicalData = this.getHistoricalPerformance(occupation);
    
    const finalScore = this.calculateFinalScore(riskProfile, economicFactors, historicalData);
    
    return {
      riskScore: finalScore.riskScore,
      recommendation: finalScore.recommendation,
      confidence: finalScore.confidence,
      suggestedLimit: finalScore.suggestedLimit,
      factors: finalScore.factors,
      breakdown: {
        occupationRisk: riskProfile.score,
        economicFactor: economicFactors.impact,
        historicalPerformance: historicalData.score
      },
      timestamp: new Date().toISOString(),
      assessmentId: 'ai_' + Date.now(),
      occupation: occupation,
      isMock: false
    };
  }

  // NEW: Farmer-specific credit assessment
  async analyzeFarmerCreditRisk(farmerData) {
    // Simulate AI processing time
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    const {
      occupation = 'farmer',
      cropType,
      landSize,
      region,
      season,
      previousYield,
      marketAccess
    } = farmerData;

    // Farmer-specific risk assessment
    const cropRisk = this.calculateCropRisk(cropType);
    const climateRisk = await this.getClimateRisk(region, season);
    const marketRisk = this.calculateMarketRisk(marketAccess);
    const experienceScore = this.calculateExperienceScore(previousYield);
    
    const finalScore = this.calculateFarmerScore({
      cropRisk,
      climateRisk,
      marketRisk,
      experienceScore,
      landSize
    });

    return {
      riskScore: finalScore.riskScore,
      recommendation: finalScore.recommendation,
      confidence: finalScore.confidence,
      suggestedLimit: finalScore.suggestedLimit,
      factors: finalScore.factors,
      cropAdvisory: finalScore.cropAdvisory,
      insuranceRecommendation: finalScore.insurance,
      seasonality: finalScore.seasonality,
      isFarmer: true,
      breakdown: {
        cropRisk: cropRisk.risk,
        climateRisk: climateRisk.overall,
        marketRisk: marketRisk,
        experienceScore: experienceScore
      },
      timestamp: new Date().toISOString(),
      assessmentId: 'farmer_' + Date.now()
    };
  }

  calculateRiskProfile(occupation) {
    const riskMatrix = {
      // Low Risk Occupations (Score 10-30)
      'teacher': { score: 22, stability: 'high', income: 'stable', category: 'professional' },
      'nurse': { score: 25, stability: 'high', income: 'stable', category: 'professional' },
      'accountant': { score: 20, stability: 'high', income: 'high', category: 'professional' },
      'software': { score: 18, stability: 'high', income: 'high', category: 'tech' },
      'developer': { score: 18, stability: 'high', income: 'high', category: 'tech' },
      'engineer': { score: 22, stability: 'high', income: 'high', category: 'professional' },
      'doctor': { score: 15, stability: 'very_high', income: 'high', category: 'professional' },
      'government': { score: 24, stability: 'very_high', income: 'stable', category: 'public' },
      
      // Medium Risk Occupations (Score 31-50)
      'market_vendor': { score: 35, stability: 'medium', income: 'variable', category: 'retail' },
      'vendor': { score: 38, stability: 'medium', income: 'variable', category: 'retail' },
      'shop_keeper': { score: 38, stability: 'medium', income: 'moderate', category: 'retail' },
      'tailor': { score: 42, stability: 'medium', income: 'moderate', category: 'craft' },
      'electrician': { score: 33, stability: 'medium', income: 'stable', category: 'skill' },
      'carpenter': { score: 40, stability: 'medium', income: 'variable', category: 'craft' },
      'plumber': { score: 37, stability: 'medium', income: 'stable', category: 'skill' },
      'mechanic': { score: 39, stability: 'medium', income: 'moderate', category: 'skill' },
      
      // High Risk Occupations (Score 51-70)
      'farmer': { score: 55, stability: 'low', income: 'seasonal', category: 'agriculture' },
      'fisherman': { score: 60, stability: 'low', income: 'variable', category: 'agriculture' },
      'driver': { score: 58, stability: 'medium', income: 'variable', category: 'transport' },
      'construction': { score: 52, stability: 'low', income: 'variable', category: 'labor' },
      'security_guard': { score: 48, stability: 'medium', income: 'low', category: 'service' },
      'laborer': { score: 56, stability: 'low', income: 'variable', category: 'labor' }
    };

    let bestMatch = { score: 50, stability: 'medium', income: 'variable', category: 'general' };
    
    for (const [key, value] of Object.entries(riskMatrix)) {
      if (occupation.includes(key)) {
        bestMatch = value;
        break;
      }
    }

    return bestMatch;
  }

  getEconomicFactors() {
    const factors = {
      inflationRate: 3.5 + (Math.random() * 4),
      marketStability: 70 + (Math.random() * 25),
      seasonality: Math.random() > 0.5 ? 'peak' : 'normal',
      economicGrowth: 4.5 + (Math.random() * 3)
    };
    
    const impact = Math.max(-10, Math.min(15, 
      (factors.inflationRate - 5) * 2 +
      (factors.marketStability - 80) / 5 +
      (factors.economicGrowth - 5) * 1.5
    ));
    
    return {
      impact: Math.round(impact),
      details: factors
    };
  }

  getHistoricalPerformance(occupation) {
    const performanceData = {
      defaultRates: {
        'teacher': 2.1, 'nurse': 2.8, 'accountant': 1.7, 'software': 1.9, 'developer': 1.9,
        'engineer': 2.3, 'doctor': 1.2, 'government': 2.5, 'market_vendor': 8.7, 'vendor': 9.2,
        'shop_keeper': 7.8, 'tailor': 11.3, 'electrician': 6.5, 'carpenter': 10.8, 'plumber': 7.1,
        'mechanic': 8.9, 'farmer': 12.3, 'fisherman': 15.7, 'driver': 15.2, 'construction': 13.8,
        'security_guard': 9.5, 'laborer': 14.2
      },
      
      repaymentRates: {
        'teacher': 98.5, 'nurse': 97.8, 'accountant': 98.9, 'software': 98.7, 'developer': 98.7,
        'engineer': 98.2, 'doctor': 99.1, 'government': 97.9, 'market_vendor': 91.2, 'vendor': 90.5,
        'shop_keeper': 92.1, 'tailor': 88.6, 'electrician': 93.4, 'carpenter': 89.1, 'plumber': 92.8,
        'mechanic': 91.0, 'farmer': 87.6, 'fisherman': 84.2, 'driver': 84.3, 'construction': 86.1,
        'security_guard': 90.4, 'laborer': 85.7
      }
    };

    let defaultRate = 10.0;
    let repaymentRate = 90.0;

    for (const [key, value] of Object.entries(performanceData.defaultRates)) {
      if (occupation.includes(key)) {
        defaultRate = value;
        repaymentRate = performanceData.repaymentRates[key];
        break;
      }
    }

    return {
      score: Math.max(10, Math.min(90, 100 - defaultRate * 3)),
      defaultRate,
      repaymentRate
    };
  }

  calculateFinalScore(riskProfile, economicFactors, historicalData) {
    const weights = {
      occupation: 0.5,
      historical: 0.3,
      economic: 0.2
    };

    const baseScore = riskProfile.score;
    const historicalScore = historicalData.score;
    const economicImpact = economicFactors.impact;

    const finalRiskScore = Math.round(
      (baseScore * weights.occupation) +
      (historicalScore * weights.historical) +
      (economicImpact * weights.economic)
    );

    let recommendation;
    if (finalRiskScore < 30) {
      recommendation = 'APPROVE';
    } else if (finalRiskScore < 60) {
      recommendation = 'REVIEW';
    } else {
      recommendation = 'DECLINE';
    }

    const confidence = Math.min(95, Math.max(75, 100 - Math.abs(baseScore - historicalScore) / 2));

    const baseLimits = {
      'very_high': 8000000,
      'high': 5000000,
      'medium': 3000000,
      'low': 1500000,
      'variable': 2000000
    };

    const limitBase = baseLimits[riskProfile.stability] || baseLimits.medium;
    const limitMultiplier = 1 - (finalRiskScore / 200);
    const suggestedLimit = Math.round(limitBase * limitMultiplier / 100000) * 100000;

    const factors = this.generateFactors(riskProfile, historicalData, economicFactors);

    return {
      riskScore: Math.max(5, Math.min(95, finalRiskScore)),
      recommendation,
      confidence: Math.round(confidence),
      suggestedLimit,
      factors
    };
  }

  generateFactors(riskProfile, historicalData, economicFactors) {
    const factors = [];

    if (riskProfile.stability === 'very_high' || riskProfile.stability === 'high') {
      factors.push('Stable employment history');
    }
    if (riskProfile.income === 'high') {
      factors.push('Strong income potential');
    }
    if (riskProfile.income === 'variable') {
      factors.push('Income variability considered');
    }

    if (historicalData.defaultRate < 5) {
      factors.push('Excellent repayment history');
    } else if (historicalData.defaultRate < 10) {
      factors.push('Good repayment track record');
    }

    if (economicFactors.details.marketStability > 85) {
      factors.push('Favorable economic conditions');
    }
    if (economicFactors.details.economicGrowth > 6) {
      factors.push('Strong economic growth');
    }

    if (riskProfile.category === 'professional') {
      factors.push('Professional occupation benefits');
    } else if (riskProfile.category === 'agriculture') {
      factors.push('Agricultural risk factors considered');
    }

    return factors.slice(0, 3);
  }

  // NEW FARMER-SPECIFIC METHODS

  calculateCropRisk(cropType) {
    const cropRisks = {
      'maize': { risk: 45, season: 'biannual', maturity: 4 },
      'coffee': { risk: 35, season: 'perennial', maturity: 12 },
      'banana': { risk: 30, season: 'perennial', maturity: 9 },
      'beans': { risk: 40, season: 'quarterly', maturity: 3 },
      'cassava': { risk: 25, season: 'annual', maturity: 12 },
      'rice': { risk: 50, season: 'biannual', maturity: 5 },
      'default': { risk: 50, season: 'unknown', maturity: 6 }
    };
    return cropRisks[cropType] || cropRisks.default;
  }

  async getClimateRisk(region, season) {
    // Simulate climate data integration
    const regionalRisks = {
      'central': { drought: 0.3, flood: 0.4, temp: 0.2 },
      'eastern': { drought: 0.5, flood: 0.2, temp: 0.3 },
      'western': { drought: 0.2, flood: 0.6, temp: 0.1 },
      'northern': { drought: 0.7, flood: 0.1, temp: 0.5 },
      'default': { drought: 0.4, flood: 0.3, temp: 0.3 }
    };
    
    const baseRisk = regionalRisks[region] || regionalRisks.default;
    
    // Season adjustment
    const seasonMultipliers = {
      'dry': { drought: 1.5, flood: 0.5, temp: 1.2 },
      'rainy': { drought: 0.5, flood: 1.5, temp: 0.8 },
      'default': { drought: 1.0, flood: 1.0, temp: 1.0 }
    };
    
    const multiplier = seasonMultipliers[season] || seasonMultipliers.default;
    
    const overallRisk = (baseRisk.drought * multiplier.drought + 
                        baseRisk.flood * multiplier.flood + 
                        baseRisk.temp * multiplier.temp) / 3 * 100;
    
    return {
      overall: Math.round(overallRisk),
      details: { ...baseRisk, season }
    };
  }

  calculateMarketRisk(marketAccess) {
    // Simple market access scoring
    const accessScores = {
      'excellent': 20,  // Near major market
      'good': 40,       // Regular market access
      'fair': 60,       // Limited access
      'poor': 80,       // Remote area
      'default': 50
    };
    return accessScores[marketAccess] || accessScores.default;
  }

  calculateExperienceScore(previousYield) {
    // Convert yield history to experience score
    if (!previousYield || previousYield === 'unknown') return 50;
    
    const yieldScores = {
      'excellent': 20,  // Consistent high yields
      'good': 40,       // Stable yields
      'fair': 60,       // Variable yields
      'poor': 80,       // Low yields
      'default': 50
    };
    return yieldScores[previousYield] || yieldScores.default;
  }

  calculateFarmerScore(factors) {
    const weights = {
      cropRisk: 0.3,
      climateRisk: 0.25,
      marketRisk: 0.2,
      experience: 0.15,
      landSize: 0.1
    };

    const riskScore = Math.round(
      (factors.cropRisk.risk * weights.cropRisk) +
      (factors.climateRisk.overall * weights.climateRisk) +
      (factors.marketRisk * weights.marketRisk) +
      ((100 - factors.experienceScore) * weights.experience) +
      (this.getLandSizeScore(factors.landSize) * weights.landSize)
    );

    const recommendation = riskScore < 40 ? 'APPROVE' : 
                          riskScore < 65 ? 'REVIEW' : 'DECLINE';

    // Farmer-specific factors
    const factorsList = [];
    if (factors.cropRisk.risk < 35) factorsList.push('Low-risk crop selection');
    if (factors.climateRisk.overall < 40) factorsList.push('Favorable climate zone');
    if (factors.experienceScore > 70) factorsList.push('Proven farming experience');
    if (factors.landSize > 5) factorsList.push('Sufficient land size');
    if (factors.marketRisk < 40) factorsList.push('Good market access');

    // Crop advisory
    const advisory = this.generateCropAdvisory(factors.cropRisk, factors.climateRisk);

    return {
      riskScore: Math.max(10, Math.min(90, riskScore)),
      recommendation,
      confidence: 80 + Math.random() * 15,
      suggestedLimit: this.calculateFarmerLimit(riskScore, factors.landSize),
      factors: factorsList.slice(0, 3),
      cropAdvisory: advisory,
      insurance: riskScore > 50 ? 'RECOMMENDED' : 'OPTIONAL',
      seasonality: factors.cropRisk.season
    };
  }

  getLandSizeScore(landSize) {
    if (!landSize || landSize < 1) return 60; // Very small or unknown
    if (landSize < 2) return 40; // Small
    if (landSize < 5) return 30; // Medium
    if (landSize < 10) return 20; // Large
    return 10; // Very large
  }

  generateCropAdvisory(cropRisk, climateRisk) {
    const advisories = [];
    
    if (climateRisk.details.drought > 0.6) {
      advisories.push('Consider drought-resistant crop varieties');
    }
    
    if (climateRisk.details.flood > 0.6) {
      advisories.push('Implement drainage systems for flood prevention');
    }
    
    if (cropRisk.maturity > 6) {
      advisories.push('Long maturity period - consider intercropping');
    }
    
    if (cropRisk.risk > 50) {
      advisories.push('High-risk crop - diversify with lower-risk crops');
    }
    
    return advisories.length > 0 ? advisories : ['Standard farming practices recommended'];
  }

  calculateFarmerLimit(riskScore, landSize) {
    const baseLimit = 1000000; // 1M UGX base
    const landMultiplier = Math.min(3, 1 + (landSize / 5)); // Scale with land size
    const riskMultiplier = 1 - (riskScore / 200); // Higher risk = lower limit
    
    return Math.round(baseLimit * landMultiplier * riskMultiplier / 50000) * 50000;
  }
}

export default new AIService();