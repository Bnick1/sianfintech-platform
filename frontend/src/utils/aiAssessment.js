// src/utils/aiAssessment.js

// Enhanced with farmer-specific and informal sector scoring
export const enhancedCreditScoring = (clientData) => {
  const {
    monthlyIncome,
    employmentHistory,
    creditHistory,
    existingDebts,
    businessType,
    location,
    // New fields for enhanced assessment
    clientType = 'general', // 'farmer', 'informal_business', 'general'
    farmerData = {},
    informalSectorData = {},
    mobileMoneyData = {},
    socialData = {}
  } = clientData;

  let score = 500; // Base score

  // Route to specialized scoring based on client type
  if (clientType === 'farmer') {
    return farmerCreditScoring(farmerData, clientData);
  } else if (clientType === 'informal_business') {
    return informalSectorScoring(informalSectorData, clientData);
  }

  // Enhanced general scoring with informal sector considerations
  score += calculateIncomeStability(monthlyIncome, mobileMoneyData);
  score += calculateEmploymentStability(employmentHistory, businessType);
  score += calculateCreditHistory(creditHistory, mobileMoneyData);
  score += calculateDebtImpact(existingDebts, monthlyIncome);
  score += calculateBusinessStability(businessType, location);
  score += calculateSocialCapital(socialData);
  score += calculateMobileMoneyBehavior(mobileMoneyData);

  return Math.max(300, Math.min(850, score));
};

// FARMER-SPECIFIC SCORING
export const farmerCreditScoring = (farmerData, baseData) => {
  const {
    farmSize, // in acres
    cropType,
    season,
    historicalYield,
    inputCosts,
    farmingExperience,
    landOwnership,
    irrigationAccess,
    marketAccess
  } = farmerData;

  let score = 500;

  // Crop-specific potential (0-150 points)
  const cropPotential = calculateCropPotential(cropType, farmSize, season);
  score += cropPotential;

  // Farming experience (0-100 points)
  if (farmingExperience > 10) score += 100;
  else if (farmingExperience > 5) score += 75;
  else if (farmingExperience > 2) score += 50;
  else if (farmingExperience > 1) score += 25;

  // Land security (0-80 points)
  if (landOwnership === 'owned') score += 80;
  else if (landOwnership === 'long_lease') score += 60;
  else if (landOwnership === 'family_land') score += 40;

  // Infrastructure access (0-70 points)
  let infrastructureScore = 0;
  if (irrigationAccess) infrastructureScore += 30;
  if (marketAccess === 'good') infrastructureScore += 40;
  else if (marketAccess === 'moderate') infrastructureScore += 20;
  score += infrastructureScore;

  // Historical performance (0-100 points)
  if (historicalYield && historicalYield > getRegionalAverage(cropType)) {
    const yieldBonus = Math.min(100, (historicalYield / getRegionalAverage(cropType) - 1) * 200);
    score += yieldBonus;
  }

  // Season timing bonus (0-50 points)
  const seasonBonus = calculateSeasonBonus(season, cropType);
  score += seasonBonus;

  return Math.max(300, Math.min(850, score));
};

// INFORMAL SECTOR SCORING
export const informalSectorScoring = (informalData, baseData) => {
  const {
    businessType,
    dailyTransactions = [],
    businessLocation,
    customerTraffic,
    seasonality,
    mobileMoneyUsage,
    businessAssets,
    groupMemberships = []
  } = informalData;

  let score = 500;

  // Cash flow analysis from mobile money (0-200 points)
  const cashFlowScore = analyzeCashFlowPattern(dailyTransactions);
  score += cashFlowScore;

  // Business location stability (0-100 points)
  const locationScore = assessLocationStability(businessLocation, businessType);
  score += locationScore;

  // Asset ownership (0-80 points)
  const assetScore = calculateAssetValue(businessAssets);
  score += assetScore;

  // Social capital (0-70 points)
  const socialScore = evaluateSocialCapital(groupMemberships);
  score += socialScore;

  // Seasonality adjustment (0 to -50 points)
  const seasonalityImpact = assessSeasonalityRisk(seasonality, businessType);
  score += seasonalityImpact;

  return Math.max(300, Math.min(850, score));
};

// ENHANCED SCORING COMPONENTS
const calculateIncomeStability = (monthlyIncome, mobileMoneyData) => {
  let points = 0;
  
  // Base income points (0-150)
  if (monthlyIncome > 2000000) points += 150;
  else if (monthlyIncome > 1000000) points += 120;
  else if (monthlyIncome > 500000) points += 90;
  else if (monthlyIncome > 200000) points += 60;
  else if (monthlyIncome > 100000) points += 30;

  // Income stability from mobile money patterns (0-50)
  if (mobileMoneyData.consistencyScore > 0.8) points += 50;
  else if (mobileMoneyData.consistencyScore > 0.6) points += 30;
  else if (mobileMoneyData.consistencyScore > 0.4) points += 15;

  return points;
};

const calculateMobileMoneyBehavior = (mobileMoneyData) => {
  const {
    transactionFrequency,
    averageTransactionSize,
    savingsBalance,
    networkSize,
    consistencyScore
  } = mobileMoneyData;

  let points = 0;

  // Transaction frequency (0-40 points)
  if (transactionFrequency > 30) points += 40; // Daily transactions
  else if (transactionFrequency > 15) points += 30;
  else if (transactionFrequency > 8) points += 20;
  else if (transactionFrequency > 4) points += 10;

  // Savings behavior (0-35 points)
  if (savingsBalance > 500000) points += 35;
  else if (savingsBalance > 200000) points += 25;
  else if (savingsBalance > 50000) points += 15;
  else if (savingsBalance > 10000) points += 5;

  // Network size indicates business connections (0-25 points)
  if (networkSize > 50) points += 25;
  else if (networkSize > 20) points += 15;
  else if (networkSize > 10) points += 8;

  return points;
};

const calculateSocialCapital = (socialData) => {
  const {
    groupMemberships = [],
    communityRole,
    referenceChecks = [],
    yearsInCommunity
  } = socialData;

  let points = 0;

  // Group membership (0-40 points)
  const stableGroups = ['VSLA', 'SACCO', 'Farmer_cooperative', 'Business_association'];
  const relevantGroups = groupMemberships.filter(group => stableGroups.includes(group));
  points += relevantGroups.length * 10;

  // Community standing (0-30 points)
  if (communityRole === 'leader') points += 30;
  else if (communityRole === 'active_member') points += 20;
  else if (communityRole === 'member') points += 10;

  // Community tenure (0-20 points)
  if (yearsInCommunity > 10) points += 20;
  else if (yearsInCommunity > 5) points += 15;
  else if (yearsInCommunity > 2) points += 10;

  return points;
};

// AGRICULTURAL CALCULATIONS
const calculateCropPotential = (cropType, farmSize, season) => {
  const cropData = {
    maize: { baseYield: 1200, valuePerAcre: 800000, risk: 'medium' },
    coffee: { baseYield: 500, valuePerAcre: 2500000, risk: 'low' },
    beans: { baseYield: 800, valuePerAcre: 600000, risk: 'low' },
    bananas: { baseYield: 3000, valuePerAcre: 1500000, risk: 'low' },
    cassava: { baseYield: 10000, valuePerAcre: 2000000, risk: 'very_low' }
  };

  const crop = cropData[cropType] || cropData.maize;
  const seasonMultiplier = getSeasonMultiplier(season, cropType);
  const potentialValue = farmSize * crop.valuePerAcre * seasonMultiplier;

  // Convert potential value to credit score points (0-150)
  return Math.min(150, potentialValue / 50000);
};

const getSeasonMultiplier = (season, cropType) => {
  const seasonData = {
    planting: { maize: 0.8, coffee: 1.0, beans: 0.9, bananas: 1.0, cassava: 1.0 },
    growing: { maize: 1.0, coffee: 1.0, beans: 1.0, bananas: 1.0, cassava: 1.0 },
    harvesting: { maize: 1.2, coffee: 1.1, beans: 1.2, bananas: 1.0, cassava: 1.1 }
  };
  return seasonData[season]?.[cropType] || 1.0;
};

// INFORMAL SECTOR ANALYSIS
const analyzeCashFlowPattern = (dailyTransactions) => {
  if (!dailyTransactions.length) return 50; // Default moderate score

  const totalTransactions = dailyTransactions.length;
  const totalAmount = dailyTransactions.reduce((sum, t) => sum + t.amount, 0);
  const averageDaily = totalAmount / totalTransactions;
  
  // Calculate consistency (coefficient of variation)
  const variance = dailyTransactions.reduce((sum, t) => {
    return sum + Math.pow(t.amount - averageDaily, 2);
  }, 0) / totalTransactions;
  const consistency = Math.sqrt(variance) / averageDaily;

  let points = 0;

  // Average daily volume (0-100 points)
  if (averageDaily > 500000) points += 100;
  else if (averageDaily > 200000) points += 80;
  else if (averageDaily > 100000) points += 60;
  else if (averageDaily > 50000) points += 40;
  else if (averageDaily > 20000) points += 20;

  // Consistency bonus (0-50 points)
  if (consistency < 0.3) points += 50; // Highly consistent
  else if (consistency < 0.6) points += 30;
  else if (consistency < 0.9) points += 15;

  return points;
};

// ENHANCED LOAN RECOMMENDATIONS
export const recommendLoanTerms = (creditScore, monthlyIncome, clientType = 'general', specializedData = {}) => {
  let baseAmount, interestRate, term;

  if (clientType === 'farmer') {
    return recommendAgriculturalLoan(creditScore, specializedData);
  } else if (clientType === 'informal_business') {
    return recommendInformalBusinessLoan(creditScore, monthlyIncome, specializedData);
  }

  // General loan recommendations (your existing logic, enhanced)
  if (creditScore >= 750) {
    baseAmount = monthlyIncome * 8;
    interestRate = 0.12;
    term = 24;
  } else if (creditScore >= 650) {
    baseAmount = monthlyIncome * 6;
    interestRate = 0.15;
    term = 18;
  } else if (creditScore >= 550) {
    baseAmount = monthlyIncome * 4;
    interestRate = 0.20;
    term = 12;
  } else {
    return {
      amount: 0,
      interestRate: 0,
      term: 0,
      approved: false,
      reason: 'Credit score too low. Consider starting with a smaller loan or group guarantee.'
    };
  }

  return {
    amount: Math.min(baseAmount, 5000000), // Cap at 5M UGX for safety
    interestRate,
    term,
    approved: true,
    insuranceRecommended: creditScore < 700,
    gracePeriod: clientType === 'farmer' ? 3 : 1 // Months before first payment
  };
};

export const recommendAgriculturalLoan = (creditScore, farmerData) => {
  const { cropType, farmSize, expectedYield } = farmerData;
  
  const cropValue = calculateCropPotential(cropType, farmSize, 'harvesting');
  const loanAmount = Math.min(cropValue * 0.6, 10000000); // 60% of expected value, max 10M

  let terms;
  if (creditScore >= 700) {
    terms = { amount: loanAmount, interestRate: 0.14, term: 12 };
  } else if (creditScore >= 600) {
    terms = { amount: loanAmount * 0.8, interestRate: 0.18, term: 10 };
  } else if (creditScore >= 500) {
    terms = { amount: loanAmount * 0.6, interestRate: 0.22, term: 8 };
  } else {
    return {
      amount: 0,
      approved: false,
      reason: 'Consider joining a farmer group for collective guarantee'
    };
  }

  return {
    ...terms,
    approved: true,
    harvestLinked: true,
    insuranceIncluded: true,
    gracePeriod: 6, // Months until harvest
    recommendedInsurance: 'Yield Protection'
  };
};

// RISK LEVEL WITH ENHANCED CATEGORIES
export const calculateRiskLevel = (creditScore, clientType = 'general') => {
  if (clientType === 'farmer') {
    if (creditScore >= 700) return 'Low Risk - Strong Farming Potential';
    if (creditScore >= 600) return 'Medium Risk - Good Farming Prospects';
    if (creditScore >= 500) return 'Moderate Risk - Requires Monitoring';
    return 'High Risk - Needs Group Guarantee';
  }

  // General risk assessment
  if (creditScore >= 750) return 'Low Risk - Prime Borrower';
  if (creditScore >= 650) return 'Medium Risk - Stable Business';
  if (creditScore >= 550) return 'High Risk - Growing Business';
  return 'Very High Risk - Needs Support';
};

// GROUP LENDING ASSESSMENT
export const assessGroupLending = (groupMembers) => {
  const averageScore = groupMembers.reduce((sum, member) => sum + member.creditScore, 0) / groupMembers.length;
  const lowestScore = Math.min(...groupMembers.map(m => m.creditScore));
  const socialCohesion = calculateGroupCohesion(groupMembers);

  return {
    groupScore: Math.min(850, averageScore * 1.1), // 10% group bonus
    recommendedGroupLoan: averageScore * 1000, // Rough calculation
    riskLevel: lowestScore < 500 ? 'High' : 'Medium',
    conditions: socialCohesion > 0.7 ? 'Favorable' : 'Needs Monitoring'
  };
};