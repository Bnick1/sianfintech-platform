// services/AIService.js
class AIService {
  // Enhanced credit risk analysis for all informal sector segments
  async analyzeCreditRisk(userData) {
    const {
      occupation,
      customerType,
      monthlyIncome,
      businessType,
      location,
      transactionHistory = {},
      mobileMoneyUsage = {}
    } = userData;

    // Base risk scoring with customer type consideration
    const baseScore = this.calculateBaseRiskScore(customerType, occupation);
    
    // Income stability assessment
    const incomeStability = this.assessIncomeStability(monthlyIncome, customerType);
    
    // Location-based risk
    const locationRisk = this.assessLocationRisk(location);
    
    // Transaction behavior analysis
    const transactionRisk = this.analyzeTransactionBehavior(transactionHistory);
    
    // Mobile money usage patterns
    const mobileMoneyRisk = this.analyzeMobileMoneyUsage(mobileMoneyUsage);
    
    // Final risk score calculation
    const finalRiskScore = this.calculateFinalRiskScore({
      baseScore,
      incomeStability,
      locationRisk,
      transactionRisk,
      mobileMoneyRisk
    });

    // Generate recommendations
    const recommendation = this.generateRecommendation(finalRiskScore, customerType);
    
    return {
      riskScore: Math.round(finalRiskScore),
      recommendation,
      confidence: this.calculateConfidence(userData),
      maxLoanAmount: this.calculateMaxLoanAmount(finalRiskScore, monthlyIncome),
      repaymentPeriod: this.suggestRepaymentPeriod(customerType, finalRiskScore),
      interestRate: this.calculateDynamicInterestRate(finalRiskScore),
      factors: this.generateRiskFactors(userData, finalRiskScore),
      insuranceRequired: finalRiskScore < 60,
      customerType
    };
  }

  // NEW: Informal Sector Comprehensive Scoring
  async analyzeInformalSectorCredit(comprehensiveData) {
    const {
      clientId,
      occupation,
      transactionHistory,
      mobileMoneyData,
      socialData,
      sectorData,
      locationData
    } = comprehensiveData;

    // Use existing base analysis
    const baseAnalysis = await this.analyzeCreditRisk({
      occupation,
      customerType: this.mapToCustomerType(occupation),
      monthlyIncome: transactionHistory?.averageMonthlyIncome,
      location: locationData?.region,
      transactionHistory,
      mobileMoneyUsage: mobileMoneyData
    });

    // Add informal sector specific analyses
    const behavioralScore = this.calculateBehavioralScore(transactionHistory, mobileMoneyData);
    const socialCapitalScore = await this.analyzeSocialCapital(socialData);
    const sectorRiskScore = this.analyzeSectorRisk(sectorData, occupation);
    
    // Combine scores (existing + new dimensions)
    const comprehensiveScore = this.combineInformalSectorScores({
      baseScore: baseAnalysis.riskScore,
      behavioralScore,
      socialCapitalScore,
      sectorRiskScore
    });

    return {
      ...baseAnalysis,
      comprehensiveScore: Math.round(comprehensiveScore),
      behavioralBreakdown: behavioralScore,
      socialCapital: socialCapitalScore,
      sectorRisk: sectorRiskScore,
      informalSectorFactors: this.generateInformalSectorFactors(behavioralScore, socialCapitalScore, sectorRiskScore),
      assessmentType: 'comprehensive_informal_sector'
    };
  }

  // NEW: Behavioral Scoring for Informal Sector
  calculateBehavioralScore(transactionHistory, mobileMoneyData) {
    const factors = {
      transactionConsistency: this.analyzeTransactionConsistency(transactionHistory),
      savingsPattern: this.analyzeSavingsBehavior(mobileMoneyData),
      repaymentHistory: this.analyzeRepaymentPattern(transactionHistory),
      incomeStability: this.calculateIncomeStability(transactionHistory)
    };

    return {
      score: this.calculateWeightedAverage(factors),
      factors,
      confidence: this.calculateBehavioralConfidence(transactionHistory, mobileMoneyData)
    };
  }

  // NEW: Sector Risk Analysis
  analyzeSectorRisk(sectorData, occupation) {
    const sectorProfiles = {
      'farmer': {
        baseRisk: 60,
        factors: ['seasonal_income', 'weather_dependency', 'market_price_volatility'],
        mitigation: ['crop_insurance', 'diversified_crops']
      },
      'market_vendor': {
        baseRisk: 55,
        factors: ['daily_cash_flow', 'competition', 'location_dependency'],
        mitigation: ['multiple_products', 'customer_loyalty']
      },
      'taxi_driver': {
        baseRisk: 58,
        factors: ['fuel_price_volatility', 'vehicle_maintenance', 'seasonal_demand'],
        mitigation: ['regular_maintenance', 'multiple_routes']
      },
      'artisan': {
        baseRisk: 52,
        factors: ['skill_dependency', 'project_based_income', 'material_costs'],
        mitigation: ['diverse_skills', 'contract_consistency']
      }
    };

    const profile = sectorProfiles[occupation] || sectorProfiles['market_vendor'];
    
    return {
      score: profile.baseRisk,
      riskFactors: profile.factors,
      mitigationStrategies: profile.mitigation,
      seasonalAdjustment: this.calculateSeasonalAdjustment(occupation, sectorData?.season)
    };
  }

  // NEW: Combine Informal Sector Scores
  combineInformalSectorScores(scores) {
    const weights = {
      baseScore: 0.4,      // Your existing analysis
      behavioralScore: 0.3, // Transaction patterns
      socialCapitalScore: 0.2, // Community factors
      sectorRiskScore: 0.1   // Occupation-specific risks
    };

    return (
      (scores.baseScore * weights.baseScore) +
      (scores.behavioralScore.score * weights.behavioralScore) +
      (scores.socialCapitalScore * weights.socialCapitalScore) +
      (scores.sectorRiskScore.score * weights.sectorRiskScore)
    );
  }

  // NEW: Map occupation to customer type
  mapToCustomerType(occupation) {
    const typeMapping = {
      'farmer': 'farmer',
      'market_vendor': 'informal_trader', 
      'taxi_driver': 'gig_worker',
      'shop_owner': 'small_business',
      'artisan': 'small_business',
      'teacher': 'salaried_worker',
      'nurse': 'salaried_worker'
    };
    
    return typeMapping[occupation] || 'other';
  }

  // NEW: Helper methods for informal sector
  analyzeTransactionConsistency(transactionHistory) {
    if (!transactionHistory || !transactionHistory.consistency) return 50;
    return Math.min(100, transactionHistory.consistency * 100);
  }

  analyzeSavingsBehavior(mobileMoneyData) {
    if (!mobileMoneyData || !mobileMoneyData.averageBalance) return 50;
    const balance = mobileMoneyData.averageBalance;
    if (balance > 500000) return 80;
    if (balance > 200000) return 65;
    if (balance > 50000) return 50;
    return 35;
  }

  analyzeRepaymentPattern(transactionHistory) {
    if (!transactionHistory || !transactionHistory.repaymentRate) return 60;
    return Math.min(100, transactionHistory.repaymentRate);
  }

  calculateIncomeStability(transactionHistory) {
    if (!transactionHistory || !transactionHistory.incomeStability) return 55;
    return Math.min(100, transactionHistory.incomeStability * 100);
  }

  calculateWeightedAverage(factors) {
    const values = Object.values(factors);
    return Math.round(values.reduce((sum, score) => sum + score, 0) / values.length);
  }

  calculateBehavioralConfidence(transactionHistory, mobileMoneyData) {
    let confidence = 70; // Base confidence
    if (transactionHistory && Object.keys(transactionHistory).length > 2) confidence += 15;
    if (mobileMoneyData && Object.keys(mobileMoneyData).length > 1) confidence += 15;
    return Math.min(95, confidence);
  }

  calculateSeasonalAdjustment(occupation, season) {
    if (occupation === 'farmer') {
      return season === 'harvest' ? 10 : -5;
    }
    return 0;
  }

  generateInformalSectorFactors(behavioralScore, socialCapitalScore, sectorRiskScore) {
    const factors = [];
    
    if (behavioralScore.score > 70) factors.push('Strong transaction patterns');
    if (socialCapitalScore > 75) factors.push('Good social capital');
    if (sectorRiskScore.score < 50) factors.push('Favorable sector conditions');
    
    return factors.length > 0 ? factors : ['Standard informal sector profile'];
  }

  // KEEP ALL YOUR EXISTING METHODS BELOW - THEY REMAIN UNCHANGED
  // Farmer-specific risk analysis
  async analyzeFarmerCreditRisk(farmerData) {
    const {
      cropType,
      region,
      farmSize,
      farmingExperience,
      seasonalIncome,
      weatherData = {}
    } = farmerData;

    // Crop risk assessment
    const cropRisk = this.assessCropRisk(cropType, region);
    
    // Weather risk analysis
    const weatherRisk = this.analyzeWeatherRisk(weatherData, region);
    
    // Experience and capacity assessment
    const experienceScore = this.assessFarmerExperience(farmingExperience, farmSize);
    
    // Seasonal income pattern analysis
    const incomePatternRisk = this.analyzeSeasonalIncome(seasonalIncome);

    const finalRiskScore = this.calculateFarmerRiskScore({
      cropRisk,
      weatherRisk,
      experienceScore,
      incomePatternRisk
    });

    return {
      riskScore: Math.round(finalRiskScore),
      recommendation: finalRiskScore > 65 ? 'approve' : finalRiskScore > 45 ? 'review' : 'decline',
      maxLoanAmount: this.calculateFarmLoanAmount(finalRiskScore, farmSize, cropType),
      repaymentPeriod: 'harvest_linked',
      cropRiskLevel: cropRisk.level,
      weatherRisk: weatherRisk.level,
      insuranceRecommendation: this.suggestFarmInsurance(cropType, weatherRisk),
      factors: [
        `Crop type: ${cropType}`,
        `Farm size: ${farmSize} acres`,
        `Region: ${region}`,
        `Experience: ${farmingExperience} years`
      ]
    };
  }

  // Small business risk analysis
  async analyzeBusinessCreditRisk(businessData) {
    const {
      businessType,
      monthlyRevenue,
      businessAge,
      location,
      industryRisk,
      cashFlowPatterns = {}
    } = businessData;

    const industryRiskScore = this.assessIndustryRisk(businessType, industryRisk);
    const revenueStability = this.analyzeRevenueStability(monthlyRevenue, businessAge);
    const locationBusinessRisk = this.assessBusinessLocationRisk(location, businessType);
    const cashFlowAnalysis = this.analyzeCashFlowPatterns(cashFlowPatterns);

    const finalRiskScore = this.calculateBusinessRiskScore({
      industryRiskScore,
      revenueStability,
      locationBusinessRisk,
      cashFlowAnalysis
    });

    return {
      riskScore: Math.round(finalRiskScore),
      recommendation: finalRiskScore > 70 ? 'approve' : finalRiskScore > 50 ? 'review' : 'decline',
      maxLoanAmount: this.calculateBusinessLoanAmount(finalRiskScore, monthlyRevenue),
      repaymentPeriod: '6 months',
      businessHealth: this.assessBusinessHealth(businessAge, monthlyRevenue),
      factors: [
        `Business type: ${businessType}`,
        `Monthly revenue: UGX ${monthlyRevenue?.toLocaleString()}`,
        `Business age: ${businessAge} years`,
        `Industry risk: ${industryRiskScore.level}`
      ]
    };
  }

  // Gig worker risk analysis
  async analyzeGigWorkerRisk(gigData) {
    const {
      gigType,
      averageMonthlyIncome,
      incomeConsistency,
      platformRatings,
      workHistory,
      multiplePlatforms
    } = gigData;

    const gigTypeRisk = this.assessGigTypeRisk(gigType);
    const incomeStability = this.analyzeGigIncomeStability(averageMonthlyIncome, incomeConsistency);
    const platformReputation = this.assessPlatformReputation(platformRatings);
    const workHistoryScore = this.analyzeGigWorkHistory(workHistory);

    const finalRiskScore = this.calculateGigWorkerRiskScore({
      gigTypeRisk,
      incomeStability,
      platformReputation,
      workHistoryScore,
      multiplePlatforms
    });

    return {
      riskScore: Math.round(finalRiskScore),
      recommendation: finalRiskScore > 60 ? 'approve' : finalRiskScore > 40 ? 'review' : 'decline',
      maxLoanAmount: this.calculateGigWorkerLoanAmount(finalRiskScore, averageMonthlyIncome),
      repaymentPeriod: 'flexible_repayment',
      incomeStability: incomeStability.level,
      platformTrustScore: platformReputation.score,
      factors: [
        `Gig type: ${gigType}`,
        `Average income: UGX ${averageMonthlyIncome?.toLocaleString()}`,
        `Platform rating: ${platformRatings?.average || 'N/A'}`,
        `Multiple platforms: ${multiplePlatforms ? 'Yes' : 'No'}`
      ]
    };
  }

  // Social capital analysis for group lending
  async analyzeSocialCapital(socialData) {
    const {
      userId,
      communityData,
      references,
      socialConnections
    } = socialData;

    const communityScore = this.assessCommunityInvolvement(communityData);
    const referenceStrength = this.analyzeReferenceStrength(references);
    const networkStrength = this.assessSocialNetwork(socialConnections);
    const repaymentHistory = await this.getSocialRepaymentHistory(userId);

    const socialScore = this.calculateSocialCapitalScore({
      communityScore,
      referenceStrength,
      networkStrength,
      repaymentHistory
    });

    return Math.max(0, Math.min(100, socialScore));
  }

  // Weather risk assessment
  async analyzeWeatherRisk(weatherData) {
    const {
      location,
      cropType,
      season,
      historicalData = {}
    } = weatherData;

    // This would integrate with Uganda National Meteorological Authority API
    const droughtProbability = this.calculateDroughtProbability(location, season);
    const floodRisk = this.assessFloodRisk(location, historicalData);
    const cropSensitivity = this.assessCropSensitivity(cropType, weatherData);

    return {
      riskLevel: this.calculateWeatherRiskLevel(droughtProbability, floodRisk, cropSensitivity),
      droughtProbability,
      floodRisk: floodRisk.level,
      recommendedInsurance: this.suggestWeatherInsurance(droughtProbability, floodRisk),
      factors: [
        `Location: ${location}`,
        `Season: ${season}`,
        `Crop sensitivity: ${cropSensitivity}`
      ]
    };
  }

  // Dynamic pricing calculation
  async calculateDynamicPricing(pricingData) {
    const {
      customerType,
      riskScore,
      loanAmount,
      term,
      socialScore,
      weatherRisk
    } = pricingData;

    const baseRate = this.getBaseInterestRate(customerType);
    const riskAdjustment = this.calculateRiskAdjustment(riskScore);
    const socialDiscount = this.calculateSocialDiscount(socialScore);
    const weatherAdjustment = this.calculateWeatherAdjustment(weatherRisk);
    const termAdjustment = this.calculateTermAdjustment(term);

    const finalInterestRate = baseRate + riskAdjustment - socialDiscount + weatherAdjustment + termAdjustment;

    return {
      interestRate: Math.max(8, Math.min(30, finalInterestRate)), // Cap between 8% and 30%
      processingFee: this.calculateProcessingFee(loanAmount, riskScore),
      insurancePremium: this.calculateInsurancePremium(loanAmount, riskScore, weatherRisk),
      totalCost: loanAmount * (finalInterestRate / 100) * (term / 12),
      breakdown: {
        baseRate,
        riskAdjustment,
        socialDiscount,
        weatherAdjustment,
        termAdjustment
      }
    };
  }

  // Portfolio risk analysis
  async analyzePortfolioRisk(portfolioData) {
    const {
      loans,
      investments,
      customerSegments,
      regionalExposure
    } = portfolioData;

    const segmentRisk = this.analyzeSegmentRisk(customerSegments);
    const regionalRisk = this.analyzeRegionalRisk(regionalExposure);
    const defaultProbability = this.calculateDefaultProbability(loans);
    const concentrationRisk = this.assessConcentrationRisk(investments);

    return {
      overallRisk: this.calculatePortfolioRiskScore(segmentRisk, regionalRisk, defaultProbability, concentrationRisk),
      segmentAnalysis: segmentRisk,
      regionalAnalysis: regionalRisk,
      defaultProbability: `${defaultProbability}%`,
      concentrationRisk: concentrationRisk.level,
      recommendations: this.generatePortfolioRecommendations(segmentRisk, regionalRisk)
    };
  }

  // Helper methods
  calculateBaseRiskScore(customerType, occupation) {
    const baseScores = {
      small_business: 65,
      gig_worker: 55,
      farmer: 60,
      informal_trader: 58,
      salaried_worker: 70,
      student: 45,
      other: 50
    };

    return baseScores[customerType] || 50;
  }

  assessIncomeStability(monthlyIncome, customerType) {
    if (!monthlyIncome) return { score: 30, level: 'high_risk' };
    
    const incomeRanges = {
      small_business: { high: 5000000, medium: 2000000, low: 1000000 },
      gig_worker: { high: 1500000, medium: 800000, low: 400000 },
      farmer: { high: 3000000, medium: 1500000, low: 700000 },
      informal_trader: { high: 2000000, medium: 1000000, low: 500000 }
    };

    const ranges = incomeRanges[customerType] || incomeRanges.informal_trader;
    
    if (monthlyIncome >= ranges.high) return { score: 85, level: 'low_risk' };
    if (monthlyIncome >= ranges.medium) return { score: 65, level: 'medium_risk' };
    if (monthlyIncome >= ranges.low) return { score: 45, level: 'high_risk' };
    return { score: 25, level: 'very_high_risk' };
  }

  calculateFinalRiskScore(components) {
    const weights = {
      baseScore: 0.3,
      incomeStability: 0.25,
      locationRisk: 0.15,
      transactionRisk: 0.2,
      mobileMoneyRisk: 0.1
    };

    return (
      components.baseScore * weights.baseScore +
      components.incomeStability.score * weights.incomeStability +
      components.locationRisk.score * weights.locationRisk +
      components.transactionRisk.score * weights.transactionRisk +
      components.mobileMoneyRisk.score * weights.mobileMoneyRisk
    );
  }

  generateRecommendation(riskScore, customerType) {
    if (riskScore >= 70) return 'approve';
    if (riskScore >= 50) return 'approve_with_conditions';
    if (riskScore >= 30) return 'review_manual';
    return 'decline';
  }

  calculateMaxLoanAmount(riskScore, monthlyIncome) {
    const multiplier = riskScore / 100 * 6; // Up to 6 months income
    return Math.floor(monthlyIncome * multiplier);
  }

  // Placeholder methods for other analyses
  assessLocationRisk(location) { return { score: 70, level: 'medium' }; }
  analyzeTransactionBehavior(history) { return { score: 75, level: 'low_risk' }; }
  analyzeMobileMoneyUsage(usage) { return { score: 80, level: 'low_risk' }; }
  calculateConfidence(data) { return 85; }
  suggestRepaymentPeriod(customerType, riskScore) { 
    return riskScore > 70 ? '12 months' : '6 months'; 
  }
  calculateDynamicInterestRate(riskScore) {
    return Math.max(12, 30 - (riskScore * 0.2)); // 12% to 30% based on risk
  }
  generateRiskFactors(userData, riskScore) {
    return ['Income verification', 'Transaction history', 'Customer segment analysis'];
  }

  // Additional placeholder methods for specialized analyses
  assessCropRisk(cropType, region) { return { score: 65, level: 'medium' }; }
  assessFarmerExperience(experience, farmSize) { return 70; }
  analyzeSeasonalIncome(income) { return { score: 60, level: 'medium_risk' }; }
  calculateFarmerRiskScore(components) { return 65; }
  calculateFarmLoanAmount(riskScore, farmSize, cropType) { return farmSize * 500000 * (riskScore / 100); }
  suggestFarmInsurance(cropType, weatherRisk) { return weatherRisk.level === 'high' ? 'recommended' : 'optional'; }

  assessIndustryRisk(businessType, industryRisk) { return { score: 70, level: 'medium' }; }
  analyzeRevenueStability(revenue, businessAge) { return { score: 75, level: 'low_risk' }; }
  assessBusinessLocationRisk(location, businessType) { return { score: 65, level: 'medium' }; }
  analyzeCashFlowPatterns(patterns) { return { score: 70, level: 'medium' }; }
  calculateBusinessRiskScore(components) { return 68; }
  calculateBusinessLoanAmount(riskScore, monthlyRevenue) { return monthlyRevenue * 3 * (riskScore / 100); }
  assessBusinessHealth(age, revenue) { return age > 2 && revenue > 1000000 ? 'healthy' : 'developing'; }

  assessGigTypeRisk(gigType) { return { score: 60, level: 'medium' }; }
  analyzeGigIncomeStability(income, consistency) { return { score: 55, level: 'medium_risk' }; }
  assessPlatformReputation(ratings) { return { score: 80, level: 'low_risk' }; }
  analyzeGigWorkHistory(history) { return 70; }
  calculateGigWorkerRiskScore(components) { return 62; }
  calculateGigWorkerLoanAmount(riskScore, monthlyIncome) { return monthlyIncome * 2 * (riskScore / 100); }

  assessCommunityInvolvement(communityData) { return 75; }
  analyzeReferenceStrength(references) { return 80; }
  assessSocialNetwork(connections) { return 70; }
  async getSocialRepaymentHistory(userId) { return 85; }
  calculateSocialCapitalScore(components) { return 78; }

  calculateDroughtProbability(location, season) { return 15; }
  assessFloodRisk(location, historicalData) { return { level: 'low', score: 20 }; }
  assessCropSensitivity(cropType, weatherData) { return 'medium'; }
  calculateWeatherRiskLevel(drought, flood, sensitivity) { return 'medium'; }
  suggestWeatherInsurance(drought, flood) { return drought > 20 || flood.level === 'high' ? 'recommended' : 'optional'; }

  getBaseInterestRate(customerType) {
    const rates = {
      small_business: 15,
      gig_worker: 18,
      farmer: 12,
      informal_trader: 16,
      salaried_worker: 14,
      student: 20,
      other: 18
    };
    return rates[customerType] || 18;
  }

  calculateRiskAdjustment(riskScore) {
    return (100 - riskScore) * 0.15; // Higher risk = higher adjustment
  }

  calculateSocialDiscount(socialScore) {
    return socialScore * 0.1; // Higher social score = lower rate
  }

  calculateWeatherAdjustment(weatherRisk) {
    const adjustments = { low: 0, medium: 2, high: 5 };
    return adjustments[weatherRisk?.level] || 0;
  }

  calculateTermAdjustment(term) {
    return term > 12 ? 2 : 0; // Longer terms get slight premium
  }

  calculateProcessingFee(loanAmount, riskScore) {
    return Math.max(5000, loanAmount * 0.01 * (1 - (riskScore / 100)));
  }

  calculateInsurancePremium(loanAmount, riskScore, weatherRisk) {
    const basePremium = loanAmount * 0.005;
    const riskMultiplier = 1 + ((100 - riskScore) / 100);
    const weatherMultiplier = weatherRisk?.level === 'high' ? 1.5 : 1;
    return basePremium * riskMultiplier * weatherMultiplier;
  }

  analyzeSegmentRisk(segments) { return { overall: 'medium', details: segments }; }
  analyzeRegionalRisk(exposure) { return { overall: 'low', details: exposure }; }
  calculateDefaultProbability(loans) { return 8.5; }
  assessConcentrationRisk(investments) { return { level: 'medium', score: 65 }; }
  calculatePortfolioRiskScore(segmentRisk, regionalRisk, defaultProb, concentrationRisk) { return 72; }
  generatePortfolioRecommendations(segmentRisk, regionalRisk) { 
    return ['Diversify across segments', 'Monitor regional exposure']; 
  }
}

export default new AIService();