import mongoose from 'mongoose';
import AIService from '../services/AIService.js';
import User from './User.js';
import Loan from './loanModel.js'; // CORRECTED: Using loanModel.js

const creditScoreSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    unique: true
  },
  memberId: {
    type: String,
    required: true
  },
  
  // Core Credit Score
  score: {
    type: Number,
    required: true,
    min: 300,
    max: 850,
    default: 500
  },
  
  // Multi-dimensional Risk Levels
  riskLevel: {
    type: String,
    enum: ['excellent', 'good', 'fair', 'poor', 'very_poor'],
    default: 'fair'
  },
  
  // Comprehensive Scoring Factors
  factors: {
    // Traditional credit factors
    paymentHistory: { type: Number, min: 0, max: 100, default: 0 },
    creditUtilization: { type: Number, min: 0, max: 100, default: 0 },
    creditHistory: { type: Number, min: 0, max: 100, default: 0 },
    newCredit: { type: Number, min: 0, max: 100, default: 0 },
    creditMix: { type: Number, min: 0, max: 100, default: 0 },
    
    // Informal sector specific
    transactionConsistency: { type: Number, min: 0, max: 100, default: 0 },
    incomeStability: { type: Number, min: 0, max: 100, default: 0 },
    businessLongevity: { type: Number, min: 0, max: 100, default: 0 },
    socialCapital: { type: Number, min: 0, max: 100, default: 0 },
    
    // Financial behavior
    savingsRate: { type: Number, min: 0, max: 100, default: 0 },
    investmentParticipation: { type: Number, min: 0, max: 100, default: 0 },
    insuranceCoverage: { type: Number, min: 0, max: 100, default: 0 },
    
    // Sector-specific
    sectorRisk: { type: Number, min: 0, max: 100, default: 0 },
    weatherResilience: { type: Number, min: 0, max: 100, default: 0 }, // For farmers
    marketVolatility: { type: Number, min: 0, max: 100, default: 0 }
  },
  
  // Comprehensive Loan Performance
  loanPerformance: {
    totalLoans: { type: Number, default: 0 },
    activeLoans: { type: Number, default: 0 },
    completedLoans: { type: Number, default: 0 },
    defaultedLoans: { type: Number, default: 0 },
    
    // Detailed performance metrics
    onTimePayments: { type: Number, default: 0 },
    latePayments: { type: Number, default: 0 },
    earlyRepayments: { type: Number, default: 0 },
    
    totalAmountBorrowed: { type: Number, default: 0 },
    totalAmountRepaid: { type: Number, default: 0 },
    totalInterestPaid: { type: Number, default: 0 },
    
    // Sector performance
    agricultureLoans: { type: Number, default: 0 },
    transportLoans: { type: Number, default: 0 },
    tradeLoans: { type: Number, default: 0 },
    
    // Portfolio metrics
    avgLoanSize: { type: Number, default: 0 },
    maxLoanSize: { type: Number, default: 0 },
    minLoanSize: { type: Number, default: 0 }
  },
  
  // Transaction History Analysis
  transactionAnalysis: {
    mobileMoney: {
      monthlyTransactions: { type: Number, default: 0 },
      avgTransactionAmount: { type: Number, default: 0 },
      transactionConsistency: { type: Number, min: 0, max: 100, default: 0 },
      savingsPattern: { type: Number, min: 0, max: 100, default: 0 },
      providers: [{ type: String }] // MTN, Airtel, etc.
    },
    
    bankTransactions: {
      hasBankAccount: { type: Boolean, default: false },
      monthlyDeposits: { type: Number, default: 0 },
      avgBalance: { type: Number, default: 0 },
      banks: [{ type: String }]
    },
    
    cryptoTransactions: {
      hasCryptoWallet: { type: Boolean, default: false },
      cryptoActivity: { type: String, enum: ['none', 'low', 'medium', 'high'], default: 'none' },
      wallets: [{ type: String }] // Binance, Paxful, etc.
    },
    
    overallTransactionVolume: { type: Number, default: 0 },
    cashFlowConsistency: { type: Number, min: 0, max: 100, default: 0 }
  },
  
  // Investment Profile
  investmentProfile: {
    totalInvestments: { type: Number, default: 0 },
    investmentTypes: [{
      type: { type: String, enum: ['unit_trusts', 'green_bonds', 'treasury_bills', 'stocks', 'savings_account', 'other'] },
      amount: { type: Number, default: 0 },
      provider: { type: String },
      startDate: { type: Date },
      maturityDate: { type: Date }
    }],
    
    // Green investments tracking
    greenInvestments: {
      totalAmount: { type: Number, default: 0 },
      projectsSupported: [{ type: String }], // solar, afforestation, clean water, etc.
      carbonCredits: { type: Number, default: 0 },
      impactScore: { type: Number, min: 0, max: 100, default: 0 }
    },
    
    // Investment behavior
    investmentFrequency: { type: String, enum: ['none', 'occasional', 'regular', 'frequent'], default: 'none' },
    riskAppetite: { type: String, enum: ['conservative', 'moderate', 'aggressive'], default: 'conservative' }
  },
  
  // Insurance Profile
  insuranceProfile: {
    totalCoverage: { type: Number, default: 0 },
    insurancePolicies: [{
      type: { type: String, enum: ['life', 'health', 'crop', 'livestock', 'asset', 'liability', 'credit', 'weather'] },
      provider: { type: String },
      coverageAmount: { type: Number },
      premiumAmount: { type: Number },
      claimsHistory: { type: Number, default: 0 }, // Number of claims
      claimsPaid: { type: Number, default: 0 } // Amount paid in claims
    }],
    
    // Microinsurance specific
    microinsurance: {
      hasCoverage: { type: Boolean, default: false },
      products: [{ type: String }], // pay-as-you-go, index-based, etc.
      claimsRate: { type: Number, default: 0 },
      renewalRate: { type: Number, default: 0 }
    }
  },
  
  // Business/Income Analysis
  businessAnalysis: {
    businessType: { type: String },
    businessAge: { type: Number, default: 0 }, // in months
    monthlyRevenue: { type: Number, default: 0 },
    revenueStability: { type: Number, min: 0, max: 100, default: 0 },
    
    // Sector-specific metrics
    agriculture: {
      cropTypes: [{ type: String }],
      farmSize: { type: Number, default: 0 },
      yieldHistory: [{ 
        year: { type: Number },
        yield: { type: Number },
        weatherImpact: { type: String }
      }]
    },
    
    transport: {
      vehicleType: { type: String },
      dailyRevenue: { type: Number, default: 0 },
      maintenanceHistory: { type: String, enum: ['poor', 'fair', 'good', 'excellent'], default: 'fair' }
    },
    
    trade: {
      inventoryTurnover: { type: Number, default: 0 },
      customerBase: { type: Number, default: 0 },
      marketPosition: { type: String, enum: ['weak', 'average', 'strong'], default: 'average' }
    }
  },
  
  // Environmental & Climate Factors (for farmers)
  environmentalFactors: {
    weatherPatterns: {
      rainfallReliability: { type: Number, min: 0, max: 100, default: 0 },
      droughtRisk: { type: Number, min: 0, max: 100, default: 0 },
      floodRisk: { type: Number, min: 0, max: 100, default: 0 },
      historicalData: [{
        year: { type: Number },
        rainfall: { type: Number },
        cropYield: { type: Number }
      }]
    },
    
    climateAdaptation: {
      irrigationUse: { type: Boolean, default: false },
      droughtResistantCrops: { type: Boolean, default: false },
      soilConservation: { type: Boolean, default: false },
      adaptationScore: { type: Number, min: 0, max: 100, default: 0 }
    },
    
    carbonFootprint: {
      emissionsScore: { type: Number, min: 0, max: 100, default: 0 },
      carbonSequestration: { type: Number, default: 0 }, // For farmers with trees
      sustainabilityPractices: [{ type: String }]
    }
  },
  
  // Social Capital & Community
  socialCapital: {
    communityInvolvement: {
      groups: [{ type: String }],
      leadershipRoles: [{ type: String }],
      meetingAttendance: { type: Number, min: 0, max: 100, default: 0 }
    },
    
    references: [{
      name: String,
      relationship: String,
      reliabilityScore: { type: Number, min: 0, max: 100 }
    }],
    
    guarantorHistory: {
      timesGuaranteed: { type: Number, default: 0 },
      successfulGuarantees: { type: Number, default: 0 },
      defaultedGuarantees: { type: Number, default: 0 }
    },
    
    socialScore: { type: Number, min: 0, max: 100, default: 0 }
  },
  
  // Historical Tracking
  lastUpdated: {
    type: Date,
    default: Date.now
  },
  previousScores: [{
    score: Number,
    date: Date,
    reason: String,
    factors: {
      paymentHistory: Number,
      creditUtilization: Number,
      transactionConsistency: Number,
      socialCapital: Number
    }
  }],
  
  // AI & Analytics Metadata
  aiMetadata: {
    lastAIAnalysis: { type: Date },
    aiModelVersion: { type: String, default: '2.0' },
    confidenceScore: { type: Number, min: 0, max: 100, default: 0 },
    featureImportance: { type: Object, default: {} },
    recommendations: [{
      category: String,
      action: String,
      impact: String,
      priority: { type: String, enum: ['low', 'medium', 'high'] }
    }]
  },
  
  // Tenancy
  tenantCode: {
    type: String,
    default: 'gldmf',
    index: true
  },
  
  metadata: {
    type: Object,
    default: {}
  }
}, {
  timestamps: true
});

// Indexes
creditScoreSchema.index({ userId: 1 });
creditScoreSchema.index({ score: 1 });
creditScoreSchema.index({ riskLevel: 1 });
creditScoreSchema.index({ lastUpdated: 1 });
creditScoreSchema.index({ tenantCode: 1 });
creditScoreSchema.index({ 'businessAnalysis.businessType': 1 });
creditScoreSchema.index({ 'transactionAnalysis.overallTransactionVolume': 1 });

// Pre-save middleware to update risk level
creditScoreSchema.pre('save', function(next) {
  if (this.isModified('score')) {
    // Update risk level based on comprehensive score
    if (this.score >= 800) this.riskLevel = 'excellent';
    else if (this.score >= 740) this.riskLevel = 'very_good';
    else if (this.score >= 670) this.riskLevel = 'good';
    else if (this.score >= 580) this.riskLevel = 'fair';
    else this.riskLevel = 'poor';
    
    // Store previous score with detailed factors
    if (this.previousScores.length === 0 || 
        this.previousScores[this.previousScores.length - 1].score !== this.score) {
      
      this.previousScores.push({
        score: this.score,
        date: new Date(),
        reason: 'auto_update',
        factors: {
          paymentHistory: this.factors.paymentHistory,
          creditUtilization: this.factors.creditUtilization,
          transactionConsistency: this.factors.transactionConsistency,
          socialCapital: this.factors.socialCapital
        }
      });
      
      // Keep only last 20 scores for detailed history
      if (this.previousScores.length > 20) {
        this.previousScores = this.previousScores.slice(-20);
      }
    }
    
    this.lastUpdated = new Date();
  }
  next();
});

// Helper function to calculate comprehensive credit score
async function calculateComprehensiveScore(userId) {
  try {
    // Get user with all related data
    const user = await User.findById(userId).lean();
    if (!user) throw new Error('User not found');
    
    // Get all user loans
    const loans = await Loan.find({ userId: userId.toString() }).lean();
    
    // Calculate base score from AI service
    const aiAssessment = await AIService.analyzeInformalSectorCredit({
      clientId: userId,
      occupation: user.occupation,
      customerType: user.customerType,
      transactionHistory: {},
      mobileMoneyData: user.financialProfile?.mobileMoneyUsage,
      socialData: user.socialCapital,
      sectorData: user.sectorRiskProfile,
      locationData: user.locationContext
    });
    
    // Calculate loan performance metrics
    const loanMetrics = calculateLoanMetrics(loans);
    
    // Calculate transaction metrics
    const transactionMetrics = calculateTransactionMetrics(user);
    
    // Calculate business metrics
    const businessMetrics = calculateBusinessMetrics(user);
    
    // Calculate investment score
    const investmentScore = calculateInvestmentScore(user);
    
    // Calculate insurance score
    const insuranceScore = calculateInsuranceScore(user);
    
    // Calculate social capital score
    const socialScore = calculateSocialCapitalScore(user);
    
    // Combine all scores with weights
    const comprehensiveScore = combineScoresWithWeights({
      aiScore: aiAssessment.comprehensiveScore || aiAssessment.riskScore || 50,
      loanScore: calculateLoanScore(loanMetrics),
      transactionScore: transactionMetrics.overallScore || 50,
      businessScore: businessMetrics.overallScore || 50,
      investmentScore: investmentScore || 50,
      insuranceScore: insuranceScore || 50,
      socialScore: socialScore || 50
    });
    
    // Convert to 300-850 range
    const creditScore = convertToCreditScore(comprehensiveScore, loanMetrics);
    
    // Calculate detailed factors
    const factors = calculateDetailedFactors({
      aiAssessment,
      loanMetrics,
      transactionMetrics,
      businessMetrics,
      investmentScore,
      insuranceScore,
      socialScore
    });
    
    // Prepare loan performance data
    const loanPerformance = {
      totalLoans: loans.length,
      activeLoans: loans.filter(l => ['active', 'repayment_active', 'disbursed'].includes(l.status)).length,
      completedLoans: loans.filter(l => l.status === 'completed').length,
      defaultedLoans: loans.filter(l => l.status === 'defaulted').length,
      onTimePayments: loanMetrics.onTimePaymentRate || 0,
      latePayments: loanMetrics.latePaymentRate || 0,
      earlyRepayments: loanMetrics.earlyRepaymentRate || 0,
      totalAmountBorrowed: loans.reduce((sum, loan) => sum + (loan.amount || 0), 0),
      totalAmountRepaid: loans.reduce((sum, loan) => sum + (loan.totalRepaid || 0), 0),
      totalInterestPaid: loans.reduce((sum, loan) => sum + (loan.totalInterestPaid || 0), 0)
    };
    
    // Prepare transaction analysis
    const transactionAnalysis = {
      mobileMoney: {
        monthlyTransactions: user.financialProfile?.mobileMoneyUsage?.averageMonthlyTransactions || 0,
        avgTransactionAmount: user.financialProfile?.mobileMoneyUsage?.averageBalance || 0,
        transactionConsistency: user.behavioralData?.transactionConsistency || 0,
        savingsPattern: user.behavioralData?.savingsHabit || 0,
        providers: user.financialProfile?.mobileMoneyUsage?.primaryProvider ? 
          [user.financialProfile.mobileMoneyUsage.primaryProvider] : []
      },
      overallTransactionVolume: transactionMetrics.totalVolume || 0,
      cashFlowConsistency: transactionMetrics.consistencyScore || 0
    };
    
    // Generate AI recommendations
    const recommendations = generateRecommendations(creditScore, factors, loanMetrics);
    
    return {
      score: Math.min(Math.max(creditScore, 300), 850),
      factors,
      loanPerformance,
      transactionAnalysis,
      investmentProfile: {
        totalInvestments: user.portfolioSummary?.totalInvestments || 0,
        investmentTypes: user.portfolioSummary?.investmentTypes || []
      },
      businessAnalysis: businessMetrics,
      socialCapital: {
        socialScore: socialScore,
        communityInvolvement: user.socialCapital?.communityInvolvement
      },
      aiMetadata: {
        lastAIAnalysis: new Date(),
        confidenceScore: aiAssessment.confidence || 70,
        recommendations: recommendations
      }
    };
    
  } catch (error) {
    console.error('Comprehensive score calculation error:', error);
    throw error;
  }
}

// Helper functions
function calculateLoanMetrics(loans) {
  const metrics = {
    totalLoans: loans.length,
    completedLoans: loans.filter(l => l.status === 'completed').length,
    defaultedLoans: loans.filter(l => l.status === 'defaulted').length,
    totalBorrowed: loans.reduce((sum, loan) => sum + (loan.amount || 0), 0),
    totalRepaid: loans.reduce((sum, loan) => sum + (loan.totalRepaid || 0), 0)
  };
  
  metrics.repaymentRate = metrics.totalBorrowed > 0 ? 
    (metrics.totalRepaid / metrics.totalBorrowed) * 100 : 100;
    
  return metrics;
}

function calculateTransactionMetrics(user) {
  return {
    overallScore: user.behavioralData?.transactionConsistency || 50,
    consistencyScore: user.behavioralData?.transactionConsistency || 50,
    totalVolume: user.financialProfile?.averageMonthlyIncome || 0
  };
}

function calculateBusinessMetrics(user) {
  const businessAge = user.occupationProfile?.yearsInOccupation || 0;
  const revenueStability = user.financialProfile?.incomeConsistency === 'stable' ? 80 :
                          user.financialProfile?.incomeConsistency === 'seasonal' ? 60 : 40;
  
  return {
    overallScore: Math.min(100, 50 + (businessAge * 5) + (revenueStability * 0.5)),
    businessType: user.occupation,
    businessAge,
    monthlyRevenue: user.monthlyIncome || 0,
    revenueStability
  };
}

function calculateInvestmentScore(user) {
  const investments = user.portfolioSummary?.totalInvestments || 0;
  return Math.min(100, investments > 1000000 ? 80 :
                       investments > 500000 ? 70 :
                       investments > 100000 ? 60 : 40);
}

function calculateInsuranceScore(user) {
  const insurancePolicies = user.portfolioSummary?.insurancePolicies || 0;
  return Math.min(100, insurancePolicies > 3 ? 80 :
                       insurancePolicies > 1 ? 65 :
                       insurancePolicies === 1 ? 50 : 30);
}

function calculateSocialCapitalScore(user) {
  return user.socialCapital?.communityScore || 50;
}

function calculateLoanScore(loanMetrics) {
  if (loanMetrics.totalLoans === 0) return 50;
  
  let score = 50;
  score += loanMetrics.repaymentRate * 0.3;
  score -= loanMetrics.defaultedLoans * 20;
  score += loanMetrics.completedLoans * 5;
  
  return Math.min(Math.max(score, 0), 100);
}

function combineScoresWithWeights(scores) {
  const weights = {
    aiScore: 0.25,
    loanScore: 0.20,
    transactionScore: 0.15,
    businessScore: 0.15,
    investmentScore: 0.05,
    insuranceScore: 0.05,
    socialScore: 0.10
  };
  
  let weightedSum = 0;
  let totalWeight = 0;
  
  for (const [key, weight] of Object.entries(weights)) {
    if (scores[key] !== undefined) {
      weightedSum += scores[key] * weight;
      totalWeight += weight;
    }
  }
  
  return totalWeight > 0 ? weightedSum / totalWeight : 50;
}

function convertToCreditScore(comprehensiveScore, loanMetrics) {
  // Convert 0-100 to 300-850 scale
  let baseScore = 300 + (comprehensiveScore * 5.5);
  
  // Adjust based on loan performance
  if (loanMetrics.totalLoans > 0) {
    if (loanMetrics.repaymentRate > 95) baseScore += 50;
    if (loanMetrics.defaultedLoans > 0) baseScore -= (loanMetrics.defaultedLoans * 40);
    if (loanMetrics.completedLoans > 2) baseScore += 30;
  }
  
  return Math.round(baseScore);
}

function calculateDetailedFactors(allMetrics) {
  return {
    paymentHistory: allMetrics.loanMetrics.repaymentRate || 50,
    creditUtilization: allMetrics.loanMetrics.totalBorrowed > 0 ? 
      Math.min(100, (allMetrics.loanMetrics.totalBorrowed / 10000000) * 100) : 0,
    transactionConsistency: allMetrics.transactionMetrics.consistencyScore || 50,
    incomeStability: allMetrics.businessMetrics.revenueStability || 50,
    socialCapital: allMetrics.socialScore || 50,
    investmentParticipation: allMetrics.investmentScore || 50,
    insuranceCoverage: allMetrics.insuranceScore || 50,
    sectorRisk: 50, // Default sector risk
    weatherResilience: 70 // Default weather resilience
  };
}

function generateRecommendations(creditScore, factors, loanMetrics) {
  const recommendations = [];
  
  if (creditScore < 600) {
    recommendations.push({
      category: 'credit_improvement',
      action: 'improve_payment_history',
      impact: 'Increase score by 30-50 points',
      priority: 'high'
    });
  }
  
  if (factors.creditUtilization > 80) {
    recommendations.push({
      category: 'debt_management',
      action: 'reduce_credit_utilization',
      impact: 'Increase score by 10-30 points',
      priority: 'medium'
    });
  }
  
  if (factors.investmentParticipation < 40) {
    recommendations.push({
      category: 'financial_growth',
      action: 'start_investing',
      impact: 'Increase score by 5-15 points and build wealth',
      priority: 'low'
    });
  }
  
  if (factors.insuranceCoverage < 40) {
    recommendations.push({
      category: 'risk_management',
      action: 'get_insurance_coverage',
      impact: 'Increase score by 5-15 points and reduce risk',
      priority: 'medium'
    });
  }
  
  return recommendations;
}

// Enhanced Static method to calculate credit score
creditScoreSchema.statics.calculateScore = async function(userId) {
  try {
    console.log(`📊 Comprehensive credit score calculation for user: ${userId}`);
    return await calculateComprehensiveScore(userId);
  } catch (error) {
    console.error('Credit score calculation error:', error);
    
    // Fallback to simpler calculation
    const fallback = await this.calculateFallbackScore(userId);
    return fallback;
  }
};

// Fallback score calculation
creditScoreSchema.statics.calculateFallbackScore = async function(userId) {
  const user = await User.findById(userId).lean();
  const loans = await Loan.find({ userId: userId.toString() }).lean();
  
  let score = 500; // Base score
  
  if (user) {
    // Basic factors
    if (user.behavioralData?.transactionConsistency > 70) score += 50;
    if (user.behavioralData?.repaymentConsistency > 70) score += 40;
    if (user.monthlyIncome > 1000000) score += 30;
    if (user.occupationProfile?.yearsInOccupation > 5) score += 25;
  }
  
  // Loan performance
  if (loans.length > 0) {
    const totalBorrowed = loans.reduce((sum, loan) => sum + (loan.amount || 0), 0);
    const totalRepaid = loans.reduce((sum, loan) => sum + (loan.totalRepaid || 0), 0);
    
    if (totalBorrowed > 0) {
      const repaymentRate = (totalRepaid / totalBorrowed) * 100;
      if (repaymentRate > 90) score += 60;
      else if (repaymentRate > 75) score += 30;
      else if (repaymentRate < 50) score -= 50;
    }
    
    // Penalize defaults
    const defaults = loans.filter(l => l.status === 'defaulted').length;
    score -= defaults * 40;
  }
  
  return {
    score: Math.min(Math.max(score, 300), 850),
    factors: {
      paymentHistory: 50,
      creditUtilization: 50,
      transactionConsistency: user?.behavioralData?.transactionConsistency || 50,
      incomeStability: 50,
      socialCapital: 50
    },
    loanPerformance: {
      totalLoans: loans.length,
      activeLoans: loans.filter(l => ['active', 'repayment_active', 'disbursed'].includes(l.status)).length,
      completedLoans: loans.filter(l => l.status === 'completed').length,
      defaultedLoans: loans.filter(l => l.status === 'defaulted').length
    },
    isFallback: true
  };
};

// Method to update score based on loan performance
creditScoreSchema.methods.updateBasedOnLoan = function(loanStatus, paymentHistory) {
  let change = 0;
  
  if (loanStatus === 'completed') change += 25;
  if (loanStatus === 'defaulted') change -= 60;
  
  if (paymentHistory.onTimeRate > 0.9) change += 35;
  else if (paymentHistory.onTimeRate > 0.7) change += 15;
  else if (paymentHistory.onTimeRate < 0.5) change -= 25;
  
  // Also consider early repayments
  if (paymentHistory.earlyRepayments > 0) change += (paymentHistory.earlyRepayments * 5);
  
  this.score = Math.max(300, Math.min(850, this.score + change));
  return this.save();
};

// Method to trigger comprehensive recalculation
creditScoreSchema.methods.recalculateWithAI = async function(reason = 'comprehensive_update') {
  try {
    const result = await this.constructor.calculateScore(this.userId);
    
    this.score = result.score;
    this.factors = result.factors;
    this.loanPerformance = result.loanPerformance;
    this.transactionAnalysis = result.transactionAnalysis;
    this.aiMetadata = result.aiMetadata;
    
    // Store previous score
    this.previousScores.push({
      score: result.score,
      date: new Date(),
      reason: reason,
      factors: result.factors
    });
    
    // Keep only last 20 scores
    if (this.previousScores.length > 20) {
      this.previousScores = this.previousScores.slice(-20);
    }
    
    this.lastUpdated = new Date();
    await this.save();
    
    console.log(`✅ Comprehensive AI recalculation completed for user ${this.userId}: ${result.score}`);
    return this;
    
  } catch (error) {
    console.error(`❌ Comprehensive recalculation failed for user ${this.userId}:`, error);
    throw error;
  }
};

export default mongoose.model('CreditScore', creditScoreSchema);