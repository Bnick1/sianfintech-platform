// models/investmentModel.js
import mongoose from 'mongoose';

const InvestmentSchema = new mongoose.Schema({
  // Investment Identification
  investmentId: { 
    type: String, 
    unique: true, 
    required: true,
    trim: true 
  },
  
  // Auto-populated Investor Information (from logged-in user)
  investorId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'User', 
    required: true 
  },
  investorName: { 
    type: String, 
    required: true,
    trim: true 
  },
  investorPhone: { 
    type: String, 
    required: true,
    trim: true 
  },
  investorEmail: { 
    type: String, 
    trim: true,
    lowercase: true 
  },
  investorDigitalId: { 
    type: String, 
    trim: true 
  },
  
  // Core Investment Details
  productType: { 
    type: String, 
    required: true, 
    enum: [
      'crop_financing',
      'equipment_leasing', 
      'input_credit',
      'market_access',
      'insurance_premium',
      'group_lending',
      'farmer_working_capital',
      // NEW: General investment products
      'green_bond',
      'fixed_deposit', 
      'treasury_bills',
      'corporate_bonds',
      'unit_trusts',
      'sian_wallet'
    ],
    trim: true 
  },
  
  // Investment Amount & Terms
  amount: { type: Number, required: true, min: 0 },
  currency: { type: String, default: 'UGX', enum: ['UGX', 'USD'] },
  interestRate: { type: Number, min: 0, max: 100 }, // For credit products
  duration: { type: Number, min: 1 }, // In months or days
  durationUnit: { type: String, enum: ['days', 'months'], default: 'months' },
  
  // Auto-calculated Returns
  expectedReturn: { type: Number, min: 0 },
  projectedReturns: {
    totalExpected: Number,
    monthlyExpected: Number,
    finalAmount: Number,
    roiPercentage: Number
  },
  
  // Risk Assessment
  riskLevel: { 
    type: String, 
    enum: ['low', 'medium', 'high', 'none'], 
    default: 'medium' 
  },
  
  // Farmer/Client Connection (for agricultural investments)
  farmerId: { type: mongoose.Schema.Types.ObjectId, ref: 'Farmer' },
  walletId: { type: String, trim: true },
  
  // Crop & Agricultural Specifics
  cropType: { type: String, trim: true }, // maize, coffee, beans, etc.
  season: { type: String, trim: true }, // planting season reference
  expectedYield: { type: Number, min: 0 }, // AI-predicted yield in kg
  expectedRevenue: { type: Number, min: 0 }, // AI-predicted revenue
  
  // Weather & Risk Data
  weatherRiskScore: { type: Number, min: 0, max: 10 }, // From weather API
  insuranceCoverage: { type: Number, min: 0, max: 100, default: 0 }, // Percentage covered
  
  // Status & Lifecycle
  status: { 
    type: String, 
    enum: [
      'draft',
      'pending_approval',
      'active',
      'harvest_period', 
      'repayment_active',
      'completed',
      'defaulted',
      'cancelled',
      'insured_claim',
      // NEW: General investment statuses
      'pending',
      'approved',
      'disbursed',
      'matured'
    ], 
    default: 'draft' 
  },
  
  // Application & Processing
  applicationDate: { type: Date, default: Date.now },
  approvalDate: { type: Date },
  disbursementDate: { type: Date },
  maturityDate: { type: Date },
  
  // Repayment & Returns (Harvest-Linked)
  repaymentSchedule: [{
    dueDate: Date,
    amountDue: Number,
    amountPaid: Number,
    paymentDate: Date,
    status: { type: String, enum: ['pending', 'paid', 'overdue'], default: 'pending' }
  }],
  
  // Social Capital & Group Lending
  groupInvestmentId: { type: mongoose.Schema.Types.ObjectId, ref: 'GroupInvestment' },
  socialScore: { type: Number, min: 0, max: 100 },
  
  // AI & Prediction Data
  riskScore: { type: Number, min: 0, max: 100 },
  yieldPrediction: { type: Number, min: 0 }, // AI prediction in kg
  revenuePrediction: { type: Number, min: 0 }, // AI prediction in currency
  
  // Insurance Integration
  insurancePolicyId: { type: String, trim: true },
  insurancePremium: { type: Number, min: 0 },
  insurancePayout: { type: Number, min: 0 },
  
  // Market Linkage
  buyerContractId: { type: String, trim: true },
  minimumPriceGuarantee: { type: Number, min: 0 },
  
  // Input Financing Specific
  inputs: [{
    type: { type: String, enum: ['seeds', 'fertilizer', 'pesticides', 'equipment'] },
    quantity: Number,
    unit: String,
    supplier: String,
    deliveryStatus: { type: String, enum: ['ordered', 'delivered', 'in_use'], default: 'ordered' }
  }],
  
  // Payment Method
  paymentMethod: {
    type: String,
    enum: ['mobile_money', 'bank_transfer', 'wallet_balance', 'cash'],
    default: 'mobile_money'
  },
  
  // Admin Notes
  adminNotes: String,
  
  // Metadata for flexible additional data
  metadata: { type: Object, default: {} },
  
  // Timestamps with additional milestone dates
  harvestDate: Date,
  repaymentStartDate: Date,
  completionDate: Date

}, { 
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Virtual for current ROI
InvestmentSchema.virtual('currentROI').get(function() {
  if (this.status === 'completed' && this.amount > 0) {
    const totalReturn = this.repaymentSchedule.reduce((sum, payment) => sum + (payment.amountPaid || 0), 0);
    return ((totalReturn - this.amount) / this.amount) * 100;
  }
  return this.projectedReturns?.roiPercentage || 0;
});

// Virtual for outstanding balance
InvestmentSchema.virtual('outstandingBalance').get(function() {
  if (this.repaymentSchedule && this.repaymentSchedule.length > 0) {
    return this.repaymentSchedule
      .filter(payment => payment.status !== 'paid')
      .reduce((sum, payment) => sum + payment.amountDue, 0);
  }
  return 0;
});

// NEW: Virtual for days to maturity
InvestmentSchema.virtual('daysToMaturity').get(function() {
  if (this.maturityDate) {
    const today = new Date();
    const maturity = new Date(this.maturityDate);
    const diffTime = maturity - today;
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  }
  return null;
});

// NEW: Virtual for investment progress
InvestmentSchema.virtual('investmentProgress').get(function() {
  if (this.status === 'completed') return 100;
  if (this.status === 'matured') return 100;
  
  if (this.maturityDate && this.applicationDate) {
    const totalDuration = this.maturityDate - this.applicationDate;
    const elapsed = Date.now() - this.applicationDate;
    return Math.min(Math.round((elapsed / totalDuration) * 100), 100);
  }
  return 0;
});

// Index for better query performance
InvestmentSchema.index({ investorId: 1, status: 1 });
InvestmentSchema.index({ productType: 1, status: 1 });
InvestmentSchema.index({ createdAt: 1 });
InvestmentSchema.index({ 'repaymentSchedule.dueDate': 1 });
InvestmentSchema.index({ investmentId: 1 });
InvestmentSchema.index({ investorPhone: 1 });

// Pre-save middleware to update status based on repayment
InvestmentSchema.pre('save', function(next) {
  // Generate investment ID if not exists
  if (!this.investmentId) {
    this.investmentId = `INV${Date.now()}${Math.random().toString(36).substr(2, 6)}`.toUpperCase();
  }
  
  // Auto-calculate maturity date if not set
  if (!this.maturityDate && this.duration && this.durationUnit) {
    const maturity = new Date(this.applicationDate || Date.now());
    if (this.durationUnit === 'months') {
      maturity.setMonth(maturity.getMonth() + this.duration);
    } else {
      maturity.setDate(maturity.getDate() + this.duration);
    }
    this.maturityDate = maturity;
  }
  
  // Update status based on repayment
  if (this.repaymentSchedule && this.repaymentSchedule.length > 0) {
    const allPaid = this.repaymentSchedule.every(p => p.status === 'paid');
    const anyOverdue = this.repaymentSchedule.some(p => p.status === 'overdue');
    
    if (allPaid) {
      this.status = 'completed';
      this.completionDate = new Date();
    } else if (anyOverdue && this.status === 'repayment_active') {
      this.status = 'defaulted';
    }
  }
  
  // Auto-update status based on dates
  if (this.maturityDate && new Date() > this.maturityDate && this.status === 'active') {
    this.status = 'matured';
  }
  
  next();
});

// Static method to get investor's investments
InvestmentSchema.statics.getByInvestorId = function(investorId) {
  return this.find({ investorId }).sort({ createdAt: -1 });
};

// Static method to get investments by status
InvestmentSchema.statics.getByStatus = function(status) {
  return this.find({ status }).sort({ createdAt: -1 });
};

// Static method to get investment statistics
InvestmentSchema.statics.getInvestmentStats = function(investorId = null) {
  const matchStage = investorId ? { investorId } : {};
  
  return this.aggregate([
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
};

export default mongoose.model('Investment', InvestmentSchema);