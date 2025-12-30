// services/investmentService.js - ES Module version
import Investment from '../models/investmentModel.js';
import User from '../models/User.js';

export const createInvestment = async (data) => {
  if (!data.userId || !data.amount) {
    const error = new Error('userId and amount are required');
    error.status = 400;
    throw error;
  }

  // Get user details automatically
  const user = await User.findById(data.userId);
  if (!user) {
    const error = new Error('User not found');
    error.status = 404;
    throw error;
  }

  // Generate investment ID
  const investmentId = `INV${Date.now()}${Math.random().toString(36).substr(2, 6)}`.toUpperCase();

  // Calculate expected returns based on type
  const expectedReturn = calculateExpectedReturn(data.type, data.amount, data.durationMonths);

  const investment = new Investment({
    // Investment identification
    investmentId,
    
    // Auto-populated user information
    userId: data.userId,
    investorName: user.name,
    investorPhone: user.phone,
    investorEmail: user.email,
    investorDigitalId: user.digitalId,
    
    // Investment details
    amount: data.amount,
    type: data.type || 'general',
    expectedReturn: data.expectedReturn || expectedReturn,
    durationMonths: data.durationMonths || 12,
    
    // Additional investment metadata
    riskLevel: calculateRiskLevel(data.type),
    status: 'pending',
    applicationDate: new Date(),
    
    // Auto-calculated fields
    maturityDate: calculateMaturityDate(data.durationMonths || 12),
    projectedReturns: calculateProjectedReturns(data.amount, expectedReturn, data.durationMonths || 12)
  });

  return await investment.save();
};

export const getInvestmentById = async (id) => {
  return await Investment.findById(id);
};

export const getAllInvestments = async () => {
  return await Investment.find().sort({ createdAt: -1 });
};

// NEW: Get investments for specific user
export const getUserInvestments = async (userId) => {
  return await Investment.find({ userId }).sort({ createdAt: -1 });
};

// NEW: Get investments with user details populated
export const getInvestmentsWithUserDetails = async () => {
  return await Investment.find()
    .populate('userId', 'name phone email digitalId memberNumber')
    .sort({ createdAt: -1 });
};

// Helper function to calculate expected return
const calculateExpectedReturn = (type, amount, durationMonths = 12) => {
  const annualRates = {
    'green_bond': 0.18, // 18%
    'fixed_deposit': 0.12, // 12%
    'treasury_bills': 0.15, // 15%
    'corporate_bonds': 0.16, // 16%
    'unit_trusts': 0.14, // 14%
    'sian_wallet': 0.08, // 8%
    'general': 0.10 // 10%
  };

  const annualRate = annualRates[type] || 0.10;
  const durationInYears = durationMonths / 12;
  return amount * annualRate * durationInYears;
};

// Helper function to calculate risk level
const calculateRiskLevel = (type) => {
  const riskLevels = {
    'green_bond': 'medium',
    'fixed_deposit': 'low',
    'treasury_bills': 'low',
    'corporate_bonds': 'medium',
    'unit_trusts': 'medium',
    'sian_wallet': 'none',
    'general': 'medium'
  };

  return riskLevels[type] || 'medium';
};

// Helper function to calculate maturity date
const calculateMaturityDate = (durationMonths) => {
  const maturityDate = new Date();
  maturityDate.setMonth(maturityDate.getMonth() + durationMonths);
  return maturityDate;
};

// Helper function to calculate projected returns
const calculateProjectedReturns = (amount, expectedReturn, durationMonths) => {
  const monthlyReturn = expectedReturn / durationMonths;
  
  return {
    totalExpected: expectedReturn,
    monthlyExpected: monthlyReturn,
    finalAmount: amount + expectedReturn,
    roiPercentage: (expectedReturn / amount) * 100
  };
};

// NEW: Update investment status
export const updateInvestmentStatus = async (investmentId, status, notes = '') => {
  const investment = await Investment.findById(investmentId);
  if (!investment) {
    const error = new Error('Investment not found');
    error.status = 404;
    throw error;
  }

  investment.status = status;
  if (notes) {
    investment.adminNotes = notes;
  }

  if (status === 'approved') {
    investment.approvalDate = new Date();
  } else if (status === 'disbursed') {
    investment.disbursementDate = new Date();
  }

  return await investment.save();
};

// NEW: Get investment statistics for dashboard
export const getInvestmentStats = async (userId = null) => {
  const matchStage = userId ? { userId } : {};
  
  const stats = await Investment.aggregate([
    { $match: matchStage },
    {
      $group: {
        _id: '$status',
        count: { $sum: 1 },
        totalAmount: { $sum: '$amount' },
        avgAmount: { $avg: '$amount' }
      }
    }
  ]);

  const totalStats = await Investment.aggregate([
    { $match: matchStage },
    {
      $group: {
        _id: null,
        totalInvestments: { $sum: 1 },
        totalAmount: { $sum: '$amount' },
        pendingAmount: {
          $sum: {
            $cond: [{ $eq: ['$status', 'pending'] }, '$amount', 0]
          }
        },
        approvedAmount: {
          $sum: {
            $cond: [{ $eq: ['$status', 'approved'] }, '$amount', 0]
          }
        }
      }
    }
  ]);

  return {
    byStatus: stats,
    totals: totalStats[0] || {
      totalInvestments: 0,
      totalAmount: 0,
      pendingAmount: 0,
      approvedAmount: 0
    }
  };
};