// models/paymentModel.js
import mongoose from 'mongoose';

const paymentSchema = new mongoose.Schema({
  // Core Payment Identification
  paymentId: { 
    type: String, 
    unique: true,
    trim: true 
  },
  transactionReference: { 
    type: String, 
    required: true,
    unique: true,
    trim: true 
  },
  
  // Payment Parties
  payerId: { 
    type: String, 
    required: true,
    ref: 'User'
  },
  payerType: { 
    type: String,
    enum: ['individual', 'small_business', 'farmer', 'gig_worker', 'merchant'],
    required: true
  },
  receiverId: { 
    type: String, 
    required: true,
    ref: 'Platform' // Platform wallet or specific receiver
  },
  walletId: { 
    type: String, 
    required: true 
  },
  
  // Payment Context
  loanId: { 
    type: String, 
    ref: 'Loan' 
  },
  investmentId: { 
    type: String, 
    ref: 'Investment' 
  },
  insurancePolicyId: { 
    type: String, 
    ref: 'Insurance' 
  },
  serviceType: {
    type: String,
    enum: [
      'loan_repayment',
      'investment_contribution',
      'insurance_premium',
      'savings_deposit',
      'bill_payment',
      'peer_transfer',
      'merchant_payment',
      'service_fee',
      'withdrawal',
      'deposit'
    ],
    required: true
  },
  
  // Amount & Currency
  amount: { 
    type: Number, 
    required: true,
    min: 500 // Minimum 500 UGX
  },
  currency: { 
    type: String, 
    default: 'UGX', 
    enum: ['UGX', 'USD'] 
  },
  fees: {
    processingFee: { type: Number, default: 0 },
    platformFee: { type: Number, default: 0 },
    transactionFee: { type: Number, default: 0 }
  },
  netAmount: { type: Number }, // Amount after fees
  
  // Payment Method & Channel
  method: { 
    type: String, 
    required: true,
    enum: [
      'mobile_money',
      'bank_transfer',
      'kiosk_cash',
      'card_payment',
      'wallet_balance',
      'voucher',
      'airtime_convert'
    ],
    default: 'mobile_money' 
  },
  provider: {
    type: String,
    enum: ['MTN', 'Airtel', 'Africell', 'Stanbic', 'Centenary', 'Kiosk', 'Platform'],
    required: true
  },
  channel: {
    type: String,
    enum: ['mobile_app', 'ussd', 'kiosk', 'agent', 'web', 'api'],
    default: 'mobile_app'
  },
  kioskId: { 
    type: String, 
    ref: 'Kiosk' 
  },
  
  // Payment Status & Lifecycle
  status: { 
    type: String, 
    enum: [
      'initiated',
      'pending',
      'processing',
      'completed',
      'failed',
      'cancelled',
      'reversed',
      'refunded'
    ], 
    default: 'initiated' 
  },
  statusHistory: [{
    status: String,
    timestamp: { type: Date, default: Date.now },
    reason: String,
    performedBy: String
  }],
  
  // Financial Reconciliation
  providerReference: { type: String, trim: true }, // Reference from mobile money/bank
  settlementStatus: {
    type: String,
    enum: ['pending', 'settled', 'reconciled', 'disputed'],
    default: 'pending'
  },
  settlementDate: { type: Date },
  
  // Risk & Compliance
  riskScore: { type: Number, min: 0, max: 100 },
  flagged: { type: Boolean, default: false },
  flagReason: { type: String, trim: true },
  complianceCheck: {
    amlChecked: { type: Boolean, default: false },
    kycVerified: { type: Boolean, default: false },
    fraudScore: { type: Number, default: 0 }
  },
  
  // Geographic & Device Data
  location: {
    ipAddress: { type: String, trim: true },
    coordinates: {
      latitude: { type: Number },
      longitude: { type: Number }
    },
    city: { type: String, trim: true },
    country: { type: String, default: 'UG' }
  },
  deviceFingerprint: { type: String, trim: true },
  
  // Installment & Schedule Context (for loan repayments)
  installmentNumber: { type: Number },
  dueDate: { type: Date },
  earlyRepayment: { type: Boolean, default: false },
  latePayment: { type: Boolean, default: false },
  gracePeriodUsed: { type: Boolean, default: false },
  
  // Metadata & Additional Data
  metadata: { type: Object, default: {} },
  notes: { type: String, trim: true },

  // Timestamps
  initiatedAt: { type: Date, default: Date.now },
  processedAt: { type: Date },
  completedAt: { type: Date }

}, { 
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Virtual for payment age in minutes
paymentSchema.virtual('ageInMinutes').get(function() {
  return Math.floor((Date.now() - this.initiatedAt) / (1000 * 60));
});

// Virtual for total fees
paymentSchema.virtual('totalFees').get(function() {
  return (this.fees.processingFee || 0) + 
         (this.fees.platformFee || 0) + 
         (this.fees.transactionFee || 0);
});

// Indexes for performance
paymentSchema.index({ transactionReference: 1 });
paymentSchema.index({ payerId: 1, status: 1 });
paymentSchema.index({ walletId: 1 });
paymentSchema.index({ loanId: 1 });
paymentSchema.index({ initiatedAt: 1 });
paymentSchema.index({ method: 1, provider: 1 });
paymentSchema.index({ 'location.coordinates': '2dsphere' });
paymentSchema.index({ status: 1, settlementStatus: 1 });

// Pre-save middleware
paymentSchema.pre('save', function(next) {
  // Generate payment ID if not exists
  if (!this.paymentId) {
    this.paymentId = `PAY${Date.now()}${Math.random().toString(36).substr(2, 4)}`.toUpperCase();
  }
  
  // Calculate net amount
  if (this.amount && this.isModified('amount')) {
    this.netAmount = this.amount - this.totalFees;
  }
  
  // Update status history
  if (this.isModified('status')) {
    this.statusHistory.push({
      status: this.status,
      timestamp: new Date(),
      reason: this.status === 'failed' ? this.flagReason : undefined
    });
  }
  
  next();
});

// Method to check if payment can be processed
paymentSchema.methods.canProcess = function() {
  const allowedStatuses = ['initiated', 'pending'];
  return allowedStatuses.includes(this.status) && !this.flagged;
};

// Method to mark as completed
paymentSchema.methods.markCompleted = function(providerRef = null) {
  this.status = 'completed';
  this.completedAt = new Date();
  if (providerRef) this.providerReference = providerRef;
};

// Static method for daily transaction volume
paymentSchema.statics.getDailyVolume = async function(date = new Date()) {
  const startOfDay = new Date(date.setHours(0, 0, 0, 0));
  const endOfDay = new Date(date.setHours(23, 59, 59, 999));
  
  const result = await this.aggregate([
    {
      $match: {
        status: 'completed',
        initiatedAt: { $gte: startOfDay, $lte: endOfDay }
      }
    },
    {
      $group: {
        _id: null,
        totalVolume: { $sum: '$amount' },
        transactionCount: { $sum: 1 },
        averageAmount: { $avg: '$amount' }
      }
    }
  ]);
  
  return result[0] || { totalVolume: 0, transactionCount: 0, averageAmount: 0 };
};

// Static method for payment method analytics
paymentSchema.statics.getMethodAnalytics = async function() {
  return await this.aggregate([
    {
      $match: {
        status: 'completed',
        initiatedAt: { $gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) } // Last 30 days
      }
    },
    {
      $group: {
        _id: { method: '$method', provider: '$provider' },
        totalAmount: { $sum: '$amount' },
        transactionCount: { $sum: 1 },
        successRate: { 
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
};

export default mongoose.model('Payment', paymentSchema);