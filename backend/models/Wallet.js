// models/Wallet.js
import mongoose from 'mongoose';

const transactionSchema = new mongoose.Schema({
  transactionId: {
    type: String,
    required: true,
    unique: true
  },
  type: {
    type: String,
    enum: ['deposit', 'withdrawal', 'transfer', 'payment', 'loan_disbursement', 'investment', 'refund'],
    required: true
  },
  amount: {
    type: Number,
    required: true
  },
  currency: {
    type: String,
    default: 'UGX'
  },
  balanceBefore: {
    type: Number,
    required: true
  },
  balanceAfter: {
    type: Number,
    required: true
  },
  description: {
    type: String,
    required: true
  },
  reference: {
    type: String
  },
  status: {
    type: String,
    enum: ['pending', 'completed', 'failed', 'cancelled'],
    default: 'pending'
  },
  metadata: {
    type: Object,
    default: {}
  }
}, {
  timestamps: true
});

const walletSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    unique: true
  },
  walletId: {
    type: String,
    required: true,
    unique: true
  },
  balance: {
    type: Number,
    default: 0,
    min: 0
  },
  currency: {
    type: String,
    default: 'UGX'
  },
  status: {
    type: String,
    enum: ['active', 'suspended', 'closed', 'frozen'],
    default: 'active'
  },
  type: {
    type: String,
    enum: ['personal', 'business', 'savings', 'investment'],
    default: 'personal'
  },
  limits: {
    dailyLimit: { type: Number, default: 5000000 }, // 5M UGX
    transactionLimit: { type: Number, default: 2000000 }, // 2M UGX
    monthlyLimit: { type: Number, default: 20000000 } // 20M UGX
  },
  transactions: [transactionSchema],
  linkedAccounts: [{
    type: {
      type: String,
      enum: ['mobile_money', 'bank_account', 'card']
    },
    provider: String,
    accountNumber: String,
    isDefault: { type: Boolean, default: false }
  }],
  security: {
    pinHash: String,
    lastLogin: Date,
    failedAttempts: { type: Number, default: 0 },
    lockedUntil: Date
  }
}, {
  timestamps: true
});

// Indexes
walletSchema.index({ userId: 1 });
walletSchema.index({ walletId: 1 });
walletSchema.index({ status: 1 });
walletSchema.index({ 'transactions.createdAt': -1 });

// Pre-save middleware to generate wallet ID
walletSchema.pre('save', function(next) {
  if (!this.walletId) {
    this.walletId = `WAL${Date.now()}${Math.random().toString(36).substr(2, 4)}`.toUpperCase();
  }
  next();
});

// Method to add transaction
walletSchema.methods.addTransaction = function(transactionData) {
  const balanceBefore = this.balance;
  let balanceAfter = balanceBefore;
  
  if (transactionData.type === 'deposit' || transactionData.type === 'refund') {
    balanceAfter = balanceBefore + transactionData.amount;
  } else if (transactionData.type === 'withdrawal' || transactionData.type === 'payment') {
    balanceAfter = balanceBefore - transactionData.amount;
  }
  
  const transaction = {
    transactionId: `TXN${Date.now()}${Math.random().toString(36).substr(2, 4)}`.toUpperCase(),
    balanceBefore,
    balanceAfter,
    ...transactionData,
    status: 'completed'
  };
  
  this.transactions.push(transaction);
  this.balance = balanceAfter;
  
  return this.save();
};

// Method to check if transaction is within limits
walletSchema.methods.canTransact = function(amount, type = 'withdrawal') {
  if (this.status !== 'active') {
    return { allowed: false, reason: 'Wallet is not active' };
  }
  
  if (type === 'withdrawal' && this.balance < amount) {
    return { allowed: false, reason: 'Insufficient balance' };
  }
  
  if (amount > this.limits.transactionLimit) {
    return { allowed: false, reason: 'Amount exceeds transaction limit' };
  }
  
  // Check daily limit (simplified - in production, you'd check against actual daily transactions)
  const today = new Date();
  const todayTransactions = this.transactions.filter(t => 
    t.createdAt.toDateString() === today.toDateString() && 
    t.status === 'completed'
  );
  
  const dailyTotal = todayTransactions.reduce((sum, t) => sum + t.amount, 0);
  if (dailyTotal + amount > this.limits.dailyLimit) {
    return { allowed: false, reason: 'Amount exceeds daily limit' };
  }
  
  return { allowed: true };
};

// Static method to get wallet by user ID
walletSchema.statics.findByUserId = function(userId) {
  return this.findOne({ userId }).populate('userId');
};

// Static method to get wallet transactions
walletSchema.statics.getTransactions = function(walletId, limit = 10, page = 1) {
  return this.aggregate([
    { $match: { walletId } },
    { $unwind: '$transactions' },
    { $sort: { 'transactions.createdAt': -1 } },
    { $skip: (page - 1) * limit },
    { $limit: limit },
    { $replaceRoot: { newRoot: '$transactions' } }
  ]);
};

export default mongoose.model('Wallet', walletSchema);