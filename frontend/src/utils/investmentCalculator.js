// src/utils/investmentCalculator.js
export const calculateInvestmentReturns = (principal, duration, riskLevel, currency = 'UGX') => {
  // Base returns for Uganda/East Africa market (automatically trending)
  const baseRates = {
    conservative: 0.10, // 10% annual
    moderate: 0.15,     // 15% annual  
    aggressive: 0.20    // 20% annual
  };

  const annualRate = baseRates[riskLevel] || baseRates.moderate;
  const monthlyRate = annualRate / 12;
  const totalMonths = parseInt(duration);
  
  // Compound interest calculation
  const totalReturn = principal * Math.pow(1 + monthlyRate, totalMonths);
  const profit = totalReturn - principal;
  const monthlyReturn = profit / totalMonths;

  return {
    principal,
    totalReturn: Math.round(totalReturn),
    profit: Math.round(profit),
    monthlyReturn: Math.round(monthlyReturn),
    annualRate: (annualRate * 100).toFixed(1),
    duration: totalMonths
  };
};

export const generatePortfolioRecommendation = (riskLevel, amount, currency = 'UGX') => {
  const portfolios = {
    conservative: {
      description: "Low Risk Portfolio",
      allocation: {
        'green_bonds': 60,
        'fixed_deposits': 30,
        'money_market': 10
      },
      expectedReturn: "10-12%",
      risk: "Low",
      suitableFor: "First-time investors seeking capital preservation"
    },
    moderate: {
      description: "Balanced Growth Portfolio", 
      allocation: {
        'green_bonds': 40,
        'agriculture_loans': 35,
        'fixed_deposits': 15,
        'money_market': 10
      },
      expectedReturn: "14-18%",
      risk: "Medium", 
      suitableFor: "Investors seeking balanced growth and moderate risk"
    },
    aggressive: {
      description: "High Growth Portfolio",
      allocation: {
        'agriculture_loans': 50,
        'green_bonds': 30, 
        'sme_financing': 20
      },
      expectedReturn: "18-25%",
      risk: "High",
      suitableFor: "Experienced investors comfortable with higher risk"
    }
  };

  const portfolio = portfolios[riskLevel] || portfolios.moderate;
  
  // Calculate allocation amounts
  const allocationAmounts = {};
  Object.entries(portfolio.allocation).forEach(([asset, percentage]) => {
    allocationAmounts[asset] = Math.round(amount * (percentage / 100));
  });

  return {
    ...portfolio,
    allocationAmounts
  };
};