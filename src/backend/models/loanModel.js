import mongoose from 'mongoose';

const loanSchema = new mongoose.Schema({
  // Core Loan Information
  loanId: { 
    type: String, 
    unique: true,
    trim: true 
  },
  userId: { 
    type: mongoose.Schema.Types.ObjectId, 
    required: true,
    ref: 'User'
  },
  
  // Loan Amount & Terms
  amount: { 
    type: Number, 
    required: true,
    min: 50000, // Minimum 50,000 UGX
    max: 50000000 // Maximum 50,000,000 UGX
  },
  currency: { 
    type: String, 
    default: 'UGX', 
    enum: ['UGX', 'USD', 'KES', 'TZS', 'RWF'] 
  },
  termMonths: { 
    type: Number, 
    required: true,
    min: 1,
    max: 36 // Maximum 3 years
  },
  repaymentFrequency: {
    type: String,
    enum: ['daily', 'weekly', 'biweekly', 'monthly', 'quarterly', 'seasonal', 'custom'],
    default: 'monthly'
  },
  
  // Sector-Agnostic Purpose Categories
  sector: {
    type: String,
    required: true,
    enum: [
      'agriculture',
      'transport', // boda-boda, taxi, trucks
      'trade_retail', // market vendors, shops
      'manufacturing', // small workshops, artisans
      'services', // salons, repairs, cafes
      'construction',
      'digital_services', // gig workers, freelancers
      'green_energy', // solar, clean cooking
      'water_sanitation',
      'healthcare',
      'education',
      'other'
    ],
    default: 'trade_retail'
  },
  
  purpose: { 
    type: String, 
    required: true,
    enum: [
      // Agriculture
      'crop_production', 'livestock_farming', 'farm_equipment', 'agri_inputs',
      'irrigation', 'post_harvest', 'agri_storage', 'farm_transport',
      
      // Transport
      'vehicle_purchase', 'vehicle_maintenance', 'fuel_costs', 'insurance_payment',
      'license_renewal', 'spare_parts', 'garage_rent', 'driver_wages',
      
      // Trade & Retail
      'stock_purchase', 'inventory_expansion', 'shop_rent', 'market_fees',
      'business_expansion', 'working_capital', 'equipment_upgrade',
      
      // Manufacturing & Artisans
      'raw_materials', 'tools_equipment', 'workshop_rent', 'product_development',
      
      // Services
      'salon_equipment', 'cafe_furniture', 'repair_tools', 'service_vehicle',
      
      // Green Finance
      'solar_panels', 'clean_cookstoves', 'water_harvesting', 'energy_efficiency',
      'waste_management', 'organic_farming',
      
      // General
      'working_capital', 'business_expansion', 'emergency_funding', 
      'debt_consolidation', 'education_fees', 'medical_expenses',
      'home_improvement', 'asset_purchase'
    ]
  },
  
  purposeDescription: { 
    type: String, 
    trim: true,
    maxlength: 500 
  },
  
  // Sector-Specific Details (Flexible)
  sectorDetails: {
    // Agriculture
    cropType: { type: String, trim: true },
    farmSize: { type: Number, min: 0 }, // in acres
    livestockType: { type: String, trim: true },
    livestockCount: { type: Number, min: 0 },
    
    // Transport
    vehicleType: { type: String, enum: ['boda_boda', 'taxi', 'truck', 'bus', 'other'] },
    vehicleRegistration: { type: String, trim: true },
    route: { type: String, trim: true },
    
    // Trade
    businessLocation: { type: String, trim: true },
    marketName: { type: String, trim: true },
    productsTraded: [{ type: String }],
    
    // General
    expectedRevenue: { type: Number, min: 0 },
    jobCreation: { type: Number, min: 0 } // Number of jobs created
  },
  
  // Interest & Fees
  interestRate: { 
    type: Number, 
    required: true,
    min: 0,
    max: 30 // Maximum 30% annual interest
  },
  interestType: { 
    type: String, 
    enum: ['flat', 'reducing', 'seasonal', 'flexible'],
    default: 'reducing' 
  },
  processingFee: { type: Number, default: 0 },
  insurancePremium: { type: Number, default: 0 },
  
  // Status & Lifecycle
  status: { 
    type: String, 
    enum: [
      'draft',
      'submitted',
      'under_review',
      'approved',
      'rejected',
      'disbursed',
      'active',
      'repayment_active',
      'completed',
      'defaulted',
      'restructured',
      'written_off',
      'in_arrears',
      'rescheduled'
    ], 
    default: 'draft' 
  },
  
  // Comprehensive AI Risk Assessment
  riskAssessment: {
    creditScore: { type: Number, min: 300, max: 850, default: 500 },
    riskLevel: { type: String, enum: ['low', 'medium', 'high', 'very_high'], default: 'medium' },
    approvalProbability: { type: Number, min: 0, max: 100, default: 50 },
    repaymentLikelihood: { type: Number, min: 0, max: 100, default: 70 },
    
    // Multi-dimensional scoring
    behavioralScore: { type: Number, min: 0, max: 100 },
    transactionConsistency: { type: Number, min: 0, max: 100 },
    incomeStability: { type: Number, min: 0, max: 100 },
    socialCapitalScore: { type: Number, min: 0, max: 100 },
    sectorRiskScore: { type: Number, min: 0, max: 100 },
    
    // Environmental factors (for farmers)
    weatherRiskScore: { type: Number, min: 0, max: 100 },
    climateVulnerability: { type: Number, min: 0, max: 100 },
    
    // Market risks
    marketPriceVolatility: { type: Number, min: 0, max: 100 },
    competitionRisk: { type: Number, min: 0, max: 100 },
    
    lastUpdated: { type: Date, default: Date.now },
    aiModelVersion: { type: String, default: '2.0' },
    featureImportance: { type: Object, default: {} }
  },

  // Comprehensive Financial Profile
  financialProfile: {
    // Income assessment
    monthlyIncome: { type: Number, min: 0 },
    incomeSources: [{ type: String }],
    incomeStability: { type: String, enum: ['stable', 'seasonal', 'irregular'], default: 'irregular' },
    
    // Existing obligations
    existingDebts: { type: Number, default: 0 },
    debtToIncomeRatio: { type: Number, min: 0, max: 100 },
    
    // Savings & investments
    savingsBalance: { type: Number, default: 0 },
    investmentsValue: { type: Number, default: 0 },
    investmentTypes: [{ type: String }], // unit_trusts, green_bonds, stocks, etc.
    
    // Insurance coverage
    insuranceCoverage: { type: Number, default: 0 },
    insuranceTypes: [{ type: String }], // life, health, crop, asset, etc.
  },

  // Wallet & Payment Integration
  walletIntegration: {
    disbursementWalletId: { type: String, trim: true },
    repaymentWalletId: { type: String, trim: true },
    mobileMoneyNumber: { type: String, trim: true },
    paymentMethods: [{
      type: { type: String, enum: ['mobile_money', 'bank', 'crypto', 'cash', 'wallet'] },
      provider: { type: String }, // MTN, Airtel, Equity Bank, Binance, etc.
      account: { type: String },
      isDefault: { type: Boolean, default: false }
    }],
    walletTransactions: [{
      transactionId: { type: String, required: true },
      type: { type: String, enum: ['disbursement', 'repayment', 'refund', 'interest_payment', 'fee'], required: true },
      amount: { type: Number, required: true },
      currency: { type: String, default: 'UGX' },
      paymentMethod: { type: String },
      provider: { type: String },
      status: { type: String, enum: ['pending', 'completed', 'failed', 'reversed'], default: 'pending' },
      reference: { type: String, trim: true },
      timestamp: { type: Date, default: Date.now },
      metadata: { type: Object, default: {} }
    }]
  },

  // Flexible Repayment Schedule
  repaymentSchedule: [{
    installmentNumber: { type: Number, required: true },
    dueDate: { type: Date, required: true },
    amountDue: { type: Number, required: true },
    principalAmount: { type: Number, required: true },
    interestAmount: { type: Number, required: true },
    feesAmount: { type: Number, default: 0 },
    
    amountPaid: { type: Number, default: 0 },
    paymentDate: { type: Date },
    paymentMethod: { type: String },
    paymentReference: { type: String },
    walletTransactionId: { type: String },
    
    status: { 
      type: String, 
      enum: ['pending', 'paid', 'overdue', 'partial', 'waived', 'rescheduled'],
      default: 'pending' 
    },
    
    // For flexible repayments
    isFlexible: { type: Boolean, default: false },
    minPayment: { type: Number },
    maxPayment: { type: Number },
    
    // For sector-specific
    isHarvestLinked: { type: Boolean, default: false }, // For farmers
    isDailyCollection: { type: Boolean, default: false }, // For boda-boda, taxi
    isWeeklyMarketLinked: { type: Boolean, default: false } // For market vendors
  }],
  
  // Insurance Integration
  insuranceCoverage: { 
    type: Number, 
    min: 0, 
    max: 100, 
    default: 0 
  },
  insuranceDetails: {
    policyId: { type: String, trim: true },
    provider: { type: String },
    coverageType: { type: String, enum: ['life', 'health', 'crop', 'asset', 'liability', 'credit'] },
    premiumAmount: { type: Number },
    coverageAmount: { type: Number },
    startDate: { type: Date },
    endDate: { type: Date }
  },
  
  // Group Lending & Social Capital
  isGroupLoan: { type: Boolean, default: false },
  groupLoanId: { type: mongoose.Schema.Types.ObjectId, ref: 'GroupLoan' },
  socialGuarantors: [{
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    name: String,
    relationship: String,
    guarantorScore: { type: Number, min: 0, max: 100 },
    guaranteedAmount: { type: Number },
    approved: { type: Boolean, default: false }
  }],
  
  // Collateral (Flexible for informal sector)
  collateral: {
    hasCollateral: { type: Boolean, default: false },
    type: { type: String, enum: ['physical', 'financial', 'social', 'future_income', 'none'] },
    description: { type: String },
    estimatedValue: { type: Number },
    documents: [{ type: String }], // URLs to collateral documents
    // For farmers
    futureHarvestValue: { type: Number },
    // For transport
    vehicleValue: { type: Number },
    // For trade
    inventoryValue: { type: Number }
  },
  
  // Application & Channel Information
  applicationChannel: { 
    type: String, 
    enum: ['mobile_app', 'kiosk', 'agent', 'web_portal', 'ussd', 'api'],
    default: 'mobile_app' 
  },
  kioskId: { 
    type: String, 
    ref: 'Kiosk' 
  },
  agentId: { 
    type: String, 
    ref: 'Agent' 
  },
  
  // Disbursement Information
  disbursementDate: { type: Date },
  disbursementMethod: { 
    type: String, 
    enum: ['mobile_money', 'bank_transfer', 'kiosk_cash', 'wallet', 'goods_voucher', 'asset_finance'],
    default: 'mobile_money' 
  },
  disbursementAccount: { type: String, trim: true },
  
  // Approval & Review Process
  reviewedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  reviewDate: { type: Date },
  approvalDate: { type: Date },
  rejectionReason: { type: String, trim: true },
  
  // Financial Tracking
  totalRepaid: { type: Number, default: 0 },
  totalDue: { type: Number, default: 0 },
  totalInterestPaid: { type: Number, default: 0 },
  daysDelinquent: { type: Number, default: 0 },
  arrearsAmount: { type: Number, default: 0 },
  
  // Tenancy & Multi-tenancy
  tenantCode: {
    type: String,
    default: 'gldmf',
    index: true
  },
  
  // Metadata for flexible extensions
  metadata: { type: Object, default: {} }

}, { 
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Virtual for outstanding balance
loanSchema.virtual('outstandingBalance').get(function() {
  return this.totalDue - this.totalRepaid;
});

// Virtual for next payment due
loanSchema.virtual('nextPayment').get(function() {
  if (this.repaymentSchedule && this.repaymentSchedule.length > 0) {
    const next = this.repaymentSchedule.find(p => p.status === 'pending');
    return next;
  }
  return null;
});

// Virtual for loan performance
loanSchema.virtual('performanceStatus').get(function() {
  if (this.status === 'completed') return 'excellent';
  if (this.status === 'defaulted') return 'poor';
  if (this.status === 'in_arrears') return 'warning';
  
  if (this.repaymentSchedule && this.repaymentSchedule.length > 0) {
    const paidCount = this.repaymentSchedule.filter(p => p.status === 'paid').length;
    const totalCount = this.repaymentSchedule.length;
    const paymentRatio = paidCount / totalCount;
    
    if (paymentRatio >= 0.9) return 'excellent';
    if (paymentRatio >= 0.7) return 'good';
    if (paymentRatio >= 0.5) return 'fair';
    return 'needs_attention';
  }
  
  return 'new';
});

// Virtual for repayment rate
loanSchema.virtual('repaymentRate').get(function() {
  if (this.totalDue > 0) {
    return (this.totalRepaid / this.totalDue) * 100;
  }
  return 100;
});

// Virtual for days since disbursement
loanSchema.virtual('daysSinceDisbursement').get(function() {
  if (this.disbursementDate) {
    const diff = new Date() - new Date(this.disbursementDate);
    return Math.floor(diff / (1000 * 60 * 60 * 24));
  }
  return 0;
});

// Indexes for better query performance
loanSchema.index({ userId: 1 });
loanSchema.index({ status: 1 });
loanSchema.index({ createdAt: 1 });
loanSchema.index({ sector: 1 });
loanSchema.index({ tenantCode: 1 });
loanSchema.index({ 'repaymentSchedule.dueDate': 1 });
loanSchema.index({ 'riskAssessment.creditScore': 1 });
loanSchema.index({ 'riskAssessment.riskLevel': 1 });
loanSchema.index({ disbursementDate: 1 });
loanSchema.index({ 'sectorDetails.cropType': 1 });
loanSchema.index({ 'sectorDetails.vehicleType': 1 });

// Pre-save middleware
loanSchema.pre('save', function(next) {
  // Generate unique loan ID
  if (!this.loanId) {
    const timestamp = Date.now().toString().slice(-6);
    const random = Math.random().toString(36).substr(2, 4).toUpperCase();
    this.loanId = `LN${timestamp}${random}`;
  }
  
  // Calculate total due if repayment schedule exists
  if (this.repaymentSchedule && this.repaymentSchedule.length > 0) {
    this.totalDue = this.repaymentSchedule.reduce((sum, installment) => sum + installment.amountDue, 0);
  }
  
  // Calculate debt-to-income ratio if monthly income exists
  if (this.financialProfile && this.financialProfile.monthlyIncome > 0) {
    const monthlyDebtService = this.repaymentSchedule && this.repaymentSchedule.length > 0 ?
      this.totalDue / this.termMonths : this.amount / this.termMonths;
    
    const existingDebts = this.financialProfile.existingDebts || 0;
    const totalMonthlyDebt = monthlyDebtService + existingDebts;
    
    this.financialProfile.debtToIncomeRatio = Math.min(100, 
      (totalMonthlyDebt / this.financialProfile.monthlyIncome) * 100);
  }
  
  // Update risk assessment timestamp
  if (this.isModified('riskAssessment')) {
    this.riskAssessment.lastUpdated = new Date();
  }
  
  // Set tenant code if not set
  if (!this.tenantCode) {
    this.tenantCode = 'gldmf';
  }
  
  next();
});

// Method to check if loan can be disbursed
loanSchema.methods.canDisburse = function() {
  return this.status === 'approved' && !this.disbursementDate;
};

// Method to add wallet transaction
loanSchema.methods.addWalletTransaction = function(transactionData) {
  if (!this.walletIntegration.walletTransactions) {
    this.walletIntegration.walletTransactions = [];
  }
  
  this.walletIntegration.walletTransactions.push({
    transactionId: `TXN${Date.now()}${Math.random().toString(36).substr(2, 4)}`.toUpperCase(),
    ...transactionData,
    timestamp: new Date()
  });
  
  return this.save();
};

// Method to record repayment
loanSchema.methods.recordRepayment = function(paymentData) {
  const { amount, paymentMethod, reference, installmentNumber } = paymentData;
  
  // Update total repaid
  this.totalRepaid += amount;
  
  // Update specific installment if installmentNumber provided
  if (installmentNumber !== undefined && this.repaymentSchedule) {
    const installment = this.repaymentSchedule.find(i => i.installmentNumber === installmentNumber);
    if (installment) {
      installment.amountPaid += amount;
      installment.paymentDate = new Date();
      installment.paymentMethod = paymentMethod;
      installment.paymentReference = reference;
      
      if (installment.amountPaid >= installment.amountDue) {
        installment.status = 'paid';
      } else if (installment.amountPaid > 0) {
        installment.status = 'partial';
      }
    }
  }
  
  // Update loan status based on repayment
  if (this.totalRepaid >= this.totalDue) {
    this.status = 'completed';
  } else if (this.daysDelinquent > 30) {
    this.status = 'in_arrears';
  } else {
    this.status = 'repayment_active';
  }
  
  return this.save();
};

// Method to update risk score
loanSchema.methods.updateRiskScore = function(newScore, factors = {}) {
  this.riskAssessment.creditScore = newScore;
  this.riskAssessment.riskLevel = newScore >= 700 ? 'low' : 
                                  newScore >= 500 ? 'medium' : 
                                  newScore >= 400 ? 'high' : 'very_high';
  this.riskAssessment.approvalProbability = Math.min(100, Math.max(0, (newScore - 300) / 5.5));
  this.riskAssessment.featureImportance = factors;
  this.riskAssessment.lastUpdated = new Date();
  
  return this.save();
};

// Static method to find loans by sector
loanSchema.statics.findBySector = function(sector, status = null) {
  const query = { sector };
  if (status) query.status = status;
  return this.find(query);
};

// Static method to calculate portfolio risk by sector
loanSchema.statics.getPortfolioRiskBySector = async function() {
  const result = await this.aggregate([
    {
      $group: {
        _id: '$sector',
        totalAmount: { $sum: '$amount' },
        count: { $sum: 1 },
        avgCreditScore: { $avg: '$riskAssessment.creditScore' },
        defaultRate: {
          $avg: {
            $cond: [{ $eq: ['$status', 'defaulted'] }, 1, 0]
          }
        },
        completedRate: {
          $avg: {
            $cond: [{ $eq: ['$status', 'completed'] }, 1, 0]
          }
        }
      }
    },
    {
      $sort: { totalAmount: -1 }
    }
  ]);
  return result;
};

// Static method to find loans needing risk reassessment
loanSchema.statics.findLoansForRiskUpdate = function(days = 30) {
  const cutoffDate = new Date();
  cutoffDate.setDate(cutoffDate.getDate() - days);
  
  return this.find({
    $or: [
      { 'riskAssessment.lastUpdated': { $lt: cutoffDate } },
      { 'riskAssessment.lastUpdated': { $exists: false } }
    ],
    status: { $in: ['active', 'repayment_active', 'disbursed'] }
  });
};

// Static method to get loan performance analytics
loanSchema.statics.getPerformanceAnalytics = async function() {
  const analytics = await this.aggregate([
    {
      $group: {
        _id: null,
        totalLoans: { $sum: 1 },
        totalAmount: { $sum: '$amount' },
        totalRepaid: { $sum: '$totalRepaid' },
        activeLoans: {
          $sum: { $cond: [{ $in: ['$status', ['active', 'repayment_active', 'disbursed']] }, 1, 0] }
        },
        defaultedLoans: {
          $sum: { $cond: [{ $eq: ['$status', 'defaulted'] }, 1, 0] }
        },
        completedLoans: {
          $sum: { $cond: [{ $eq: ['$status', 'completed'] }, 1, 0] }
        },
        avgCreditScore: { $avg: '$riskAssessment.creditScore' }
      }
    }
  ]);
  
  return analytics.length > 0 ? analytics[0] : {
    totalLoans: 0,
    totalAmount: 0,
    totalRepaid: 0,
    activeLoans: 0,
    defaultedLoans: 0,
    completedLoans: 0,
    avgCreditScore: 500
  };
};

export default mongoose.model('Loan', loanSchema);