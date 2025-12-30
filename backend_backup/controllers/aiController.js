// controllers/aiController.js - ES Module version
const aiPredictDefaultPOST = async (req, res) => {
  try {
    const { input, occupation, businessType, location, monthlyVolume } = req.body;

    // AI Risk Scoring for Informal Sector Workers
    let riskScore = 50; // Base score for new informal sector entrants
    
    // Occupation-based scoring (East African informal economy)
    const occupationScores = {
      'farmer': { base: 45, volatility: 15 },
      'market_vendor': { base: 55, volatility: 20 },
      'boda_boda': { base: 40, volatility: 25 },
      'taxi_operator': { base: 50, volatility: 20 },
      'tailor': { base: 60, volatility: 10 },
      'welder': { base: 55, volatility: 15 },
      'youth_business': { base: 48, volatility: 22 },
      'sacco_member': { base: 65, volatility: 8 }
    };

    // Apply occupation-based adjustments
    if (occupation && occupationScores[occupation]) {
      const occ = occupationScores[occupation];
      riskScore = occ.base + (Math.random() - 0.5) * occ.volatility;
    }

    // Business type enhancements
    const businessBoost = {
      'agriculture': -5,    // Seasonal volatility
      'retail': +8,         // More stable cash flow
      'transport': +3,      // Regular but risky
      'services': +10,      // Skilled services more stable
      'manufacturing': +7   // Value addition premium
    };

    if (businessType && businessBoost[businessType]) {
      riskScore += businessBoost[businessType];
    }

    // Location-based adjustments for Uganda
    const locationFactors = {
      'kampala': +5, 'mbarara': +8, 'gulu': +6, 'jinja': +7,
      'masaka': +6, 'fortportal': +7, 'lira': +5, 'mbale': +6
    };
    
    if (location && locationFactors[location.toLowerCase()]) {
      riskScore += locationFactors[location.toLowerCase()];
    }

    // Monthly volume scaling (proxy for business size)
    if (monthlyVolume) {
      if (monthlyVolume > 1000000) riskScore += 10;      // > 1M UGX
      else if (monthlyVolume > 500000) riskScore += 5;   // > 500K UGX
      else if (monthlyVolume > 200000) riskScore += 2;   // > 200K UGX
    }

    // Text analysis for additional insights
    if (typeof input === 'string') {
      const text = input.toLowerCase();
      
      // Positive indicators for informal sector
      const positiveMarkers = [
        'regular', 'consistent', 'savings', 'group', 'sacco', 
        'licensed', 'registered', 'location', 'steady'
      ];
      
      // Risk indicators
      const riskMarkers = [
        'seasonal', 'irregular', 'casual', 'unpredictable',
        'weather', 'dependent', 'temporary'
      ];

      positiveMarkers.forEach(marker => {
        if (text.includes(marker)) riskScore += 3;
      });

      riskMarkers.forEach(marker => {
        if (text.includes(marker)) riskScore -= 4;
      });
    }

    // Ensure score stays within bounds
    riskScore = Math.min(Math.max(Math.round(riskScore), 10), 95);

    // AI Recommendations for informal sector
    let recommendation, maxLoanAmount, repaymentPeriod;
    
    if (riskScore >= 70) {
      recommendation = 'approve_priority';
      maxLoanAmount = 5000000; // 5M UGX
      repaymentPeriod = '12 months';
    } else if (riskScore >= 55) {
      recommendation = 'approve_standard';
      maxLoanAmount = 2000000; // 2M UGX
      repaymentPeriod = '6 months';
    } else if (riskScore >= 40) {
      recommendation = 'approve_basic';
      maxLoanAmount = 800000; // 800K UGX
      repaymentPeriod = '3 months';
    } else {
      recommendation = 'review_manual';
      maxLoanAmount = 300000; // 300K UGX
      repaymentPeriod = 'flexible';
    }

    res.status(200).json({
      status: 'success',
      prediction: {
        riskScore: riskScore,
        recommendation: recommendation,
        maxLoanAmount: maxLoanAmount,
        repaymentPeriod: repaymentPeriod,
        confidence: `${Math.min(95, riskScore + 20)}%`,
        factors: [
          'occupation_stability',
          'business_cash_flow', 
          'location_economics',
          'informal_sector_patterns'
        ],
        tailoredAdvice: getSectorSpecificAdvice(occupation)
      },
      metadata: {
        modelVersion: 'sian-ai-informal-v2.0',
        marketFocus: 'east-africa-informal-sector',
        processedAt: new Date().toISOString()
      }
    });
  } catch (error) {
    res.status(500).json({
      status: 'error',
      message: 'AI assessment failed: ' + error.message
    });
  }
};

// Sector-specific advice for different client types
function getSectorSpecificAdvice(occupation) {
  const adviceMap = {
    'farmer': 'Consider crop insurance + seasonal repayment schedule',
    'market_vendor': 'Daily repayment option + inventory financing', 
    'boda_boda': 'Asset financing + safety insurance bundle',
    'tailor': 'Equipment loans + bulk material purchasing',
    'welder': 'Tool financing + workshop expansion',
    'youth_business': 'Mentorship + graduated loan sizes',
    'sacco_member': 'Group guarantees + bulk disbursement'
  };
  
  return adviceMap[occupation] || 'Flexible repayment aligned with cash flow patterns';
}

export { aiPredictDefaultPOST };