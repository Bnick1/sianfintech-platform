// models/Investment.js
const mongoose = require('mongoose');

const InvestmentSchema = new mongoose.Schema({
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
      'farmer_working_capital'
    ],
    trim: true 
  },
  
  // Investment Amount & Terms
  amount: { type: Number, required: true, min: 0 },
  currency: { type: String, default: 'UGX', enum: ['UGX', 'USD'] },
  interestRate: { type: Number, min: 0, max: 100 }, // For credit products
  duration: { type: Number, min: 1 }, // In months or days
  durationUnit: { type: String, enum: ['days', 'months'], default: 'months' },
  
  // Farmer/Client Connection
  farmerId: { type: mongoose.Schema.Types.ObjectId, ref: 'Farmer', required: true },
  walletId: { type: String, required: true, trim: true },
  
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
      'insured_claim'
    ], 
    default: 'draft' 
  },
  
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
  return 0;
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

// Index for better query performance
InvestmentSchema.index({ farmerId: 1, status: 1 });
InvestmentSchema.index({ productType: 1, season: 1 });
InvestmentSchema.index({ createdAt: 1 });
InvestmentSchema.index({ 'repaymentSchedule.dueDate': 1 });

// Pre-save middleware to update status based on repayment
InvestmentSchema.pre('save', function(next) {
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
  next();
});

module.exports = mongoose.model('Investment', InvestmentSchema);
