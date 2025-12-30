// models/User.js
import mongoose from 'mongoose';

const UserSchema = new mongoose.Schema({
  // Basic Identification
  name: { 
    type: String, 
    required: true, 
    trim: true 
  },
  email: { 
    type: String, 
    trim: true, 
    lowercase: true,
    sparse: true
  },
  phone: { 
    type: String, 
    required: true, 
    trim: true,
    index: true  // KEEP ONLY ONE INDEX METHOD
  },
  
  // TENANT CODE FIELD - ADDED THIS
  tenantCode: {
    type: String,
    default: 'gldmf',
    enum: ['gldmf', 'sianfintech', 'other'],
    index: true
  },
  
  // ROLE FIELD - ADDED THIS
  role: {
    type: String,
    required: true,
    enum: ['member', 'staff', 'gldmf_staff', 'sian_staff', 'admin'],
    default: 'member',
    index: true
  },
  
  // Digital Identity & Authentication
  digitalId: { 
    type: String, 
    unique: true,
    trim: true 
  },
  walletId: { 
    type: String, 
    required: true,
    unique: true,
    trim: true 
  },
  password: { 
    type: String, 
    required: [true, 'Password is required'],
    minlength: 6
  },
  
  isVerified: { 
    type: Boolean, 
    default: false 
  },
  
  // National ID & KYC
  idType: { 
    type: String, 
    enum: ['national_id', 'passport', 'voter_id', 'driving_permit', 'other_id'],
    default: 'national_id'
  },
  idNumber: { 
    type: String, 
    trim: true 
  },
  idVerified: { 
    type: Boolean, 
    default: false 
  },
  idVerificationDate: { type: Date },
  
  // Customer Segmentation
  customerType: {
    type: String,
    required: true,
    enum: [
      'small_business',
      'gig_worker',
      'farmer',
      'informal_trader',
      'salaried_worker',
      'student',
      'other'
    ],
    default: 'informal_trader'
  },
  
  // ENHANCED: Occupation & Income Details
  occupation: {
    type: String,
    trim: true
  },
  businessType: {
    type: String,
    trim: true
  },
  monthlyIncome: {
    type: Number,
    min: 0
  },
  incomeSource: {
    type: String,
    enum: ['regular_employment', 'business', 'farming', 'gig_work', 'remittances', 'other'],
    default: 'business'
  },

  // NEW: Enhanced Occupation Profile for Informal Sector
  occupationProfile: {
    primaryOccupation: String,
    secondaryOccupation: String,
    yearsInOccupation: Number,
    
    // Sector-specific details
    sectorSpecific: {
      // Farmer-specific
      cropType: String,
      farmSize: Number,
      farmingExperience: Number,
      landOwnership: { type: String, enum: ['owned', 'rented', 'family', 'communal'] },
      
      // Business-specific
      businessAge: Number,
      monthlyRevenue: Number,
      employeesCount: Number,
      businessLocation: String,
      
      // Vendor-specific
      marketLocation: String,
      productsSold: [String],
      dailySales: Number,
      
      // Gig worker-specific
      gigPlatform: String,
      averageTripsPerDay: Number,
      platformRating: Number
    }
  },

  // NEW: Enhanced Financial Profile
  financialProfile: {
    averageMonthlyIncome: Number,
    incomeSources: [String],
    incomeConsistency: { type: String, enum: ['stable', 'seasonal', 'irregular'] },
    
    // Mobile Money Usage
    mobileMoneyUsage: {
      primaryProvider: { type: String, enum: ['mtn', 'airtel', 'africell', 'other'] },
      averageMonthlyTransactions: Number,
      averageBalance: Number,
      transactionFrequency: { type: String, enum: ['daily', 'weekly', 'monthly'] },
      commonTransactionTypes: [String]
    },
    
    // Existing Loan History
    existingLoans: {
      hasActiveLoans: Boolean,
      totalLoanBalance: Number,
      monthlyRepayments: Number,
      repaymentHistory: { type: String, enum: ['excellent', 'good', 'fair', 'poor'] }
    }
  },

  // NEW: Social Capital & Community
  socialCapital: {
    communityInvolvement: {
      isCommunityMember: Boolean,
      communityGroups: [String],
      leadershipRoles: [String],
    },
    
    references: [{
      name: String,
      phone: String,
      relationship: String,
      yearsKnown: Number
    }],
    
    socialConnections: {
      familyInArea: Boolean,
      localBusinessRelations: Boolean,
      knownByLocalLeader: Boolean
    },
    communityScore: { type: Number, default: 0, min: 0, max: 100 }
  },

  // NEW: Location & Market Context
  locationContext: {
    region: String,
    district: String,
    subcounty: String,
    parish: String,
    village: String,
    
    // Market access
    distanceToMarket: Number,
    transportAvailable: Boolean,
    marketDays: [String]
  },
  
  // Location & Contact (Existing - keep for backward compatibility)
  location: {
    address: { type: String, trim: true },
    city: { type: String, trim: true },
    district: { type: String, trim: true },
    subcounty: { type: String, trim: true },
    village: { type: String, trim: true },
    coordinates: {
      latitude: { type: Number },
      longitude: { type: Number }
    }
  },
  
  // Financial Profile (Existing)
  creditScore: { 
    type: Number, 
    default: 500,
    min: 300,
    max: 850 
  },
  riskCategory: {
    type: String,
    enum: ['low', 'medium', 'high', 'very_high'],
    default: 'medium'
  },
  socialCapitalScore: {
    type: Number,
    default: 0,
    min: 0,
    max: 100
  },
  
  // NEW: Comprehensive Scoring
  comprehensiveScore: {
    type: Number,
    default: 0,
    min: 0,
    max: 100
  },
  behavioralScore: {
    type: Number,
    default: 0,
    min: 0,
    max: 100
  },
  sectorRiskScore: {
    type: Number,
    default: 0,
    min: 0,
    max: 100
  },
  
  // Mobile Money & Banking (Existing)
  mobileMoneyProvider: {
    type: String,
    enum: ['MTN', 'Airtel', 'Africell', 'Other', null],
    default: null
  },
  mobileMoneyNumber: {
    type: String,
    trim: true
  },
  bankAccounts: [{
    bankName: String,
    accountNumber: String,
    accountType: String,
    isPrimary: { type: Boolean, default: false }
  }],
  
  // AI & Data Analytics (Enhanced)
  aiRiskFactors: [{
    factor: String,
    score: Number,
    impact: { type: String, enum: ['positive', 'negative', 'neutral'] }
  }],
  behavioralData: {
    transactionFrequency: { type: Number, default: 0 },
    averageTransactionAmount: { type: Number, default: 0 },
    repaymentConsistency: { type: Number, default: 0 },
    savingsHabit: { type: Number, default: 0 },
    
    // NEW: Enhanced behavioral metrics
    transactionConsistency: { type: Number, default: 0 },
    incomeStability: { type: Number, default: 0 }
  },

  // NEW: Sector Risk Profile
  sectorRiskProfile: {
    occupation: String,
    riskLevel: { type: String, enum: ['low', 'medium', 'high'] },
    riskFactors: [String],
    mitigationStrategies: [String],
    seasonalAdjustment: Number
  },
  
  // Platform Relationships (Existing)
  kioskId: {
    type: String,
    ref: 'Kiosk'
  },
  registeredBy: {
    type: String,
    trim: true
  },
  referralCode: {
    type: String,
    sparse: true
  },
  referredBy: {
    type: String,
    trim: true
  },
  
  // Status & Preferences (Existing)
  status: {
    type: String,
    enum: ['active', 'inactive', 'suspended', 'pending_verification'],
    default: 'pending_verification'
  },
  communicationPreferences: {
    sms: { type: Boolean, default: true },
    email: { type: Boolean, default: false },
    push: { type: Boolean, default: true }
  },
  language: {
    type: String,
    default: 'en',
    enum: ['en', 'sw', 'lg', 'other']
  },
  
  // Financial Portfolio Summary (Existing)
  portfolioSummary: {
    totalLoansTaken: { type: Number, default: 0 },
    totalAmountBorrowed: { type: Number, default: 0 },
    totalAmountRepaid: { type: Number, default: 0 },
    activeLoans: { type: Number, default: 0 },
    totalInvestments: { type: Number, default: 0 },
    insurancePolicies: { type: Number, default: 0 }
  },
  
  // Security & Compliance (Existing)
  lastLogin: { type: Date },
  loginAttempts: { type: Number, default: 0 },
  lockUntil: { type: Date },
  mfaEnabled: { type: Boolean, default: false },
  
  // Metadata for flexible extensions (Existing)
  metadata: { type: Object, default: {} }

}, { 
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Virtual for repayment rate (Existing)
UserSchema.virtual('repaymentRate').get(function() {
  if (this.portfolioSummary.totalAmountBorrowed > 0) {
    return (this.portfolioSummary.totalAmountRepaid / this.portfolioSummary.totalAmountBorrowed) * 100;
  }
  return 100;
});

// NEW: Virtual for comprehensive eligibility
UserSchema.virtual('eligibilityStatus').get(function() {
  const score = this.comprehensiveScore || this.creditScore;
  if (score >= 70) return 'high_eligibility';
  if (score >= 50) return 'medium_eligibility';
  return 'low_eligibility';
});

// NEW: Virtual for informal sector strength
UserSchema.virtual('informalSectorStrength').get(function() {
  let strength = 0;
  
  if (this.behavioralData.transactionConsistency > 70) strength += 25;
  if (this.socialCapital.communityScore > 70) strength += 25;
  if (this.financialProfile?.incomeConsistency === 'stable') strength += 25;
  if (this.sectorRiskProfile?.riskLevel === 'low') strength += 25;
  
  return strength;
});

// Virtual for customer lifetime value estimate (Existing)
UserSchema.virtual('estimatedLTV').get(function() {
  const baseValue = this.portfolioSummary.totalAmountBorrowed * 0.1;
  const consistencyBonus = this.behavioralData.repaymentConsistency * 10;
  return baseValue + consistencyBonus;
});

// Virtual for full address (Existing)
UserSchema.virtual('fullAddress').get(function() {
  const parts = [
    this.location.village,
    this.location.subcounty,
    this.location.district,
    this.location.city
  ].filter(part => part && part.trim() !== '');
  
  return parts.join(', ');
});

// REMOVE DUPLICATE INDEXES - Keep only schema-level indexes or field-level indexes, not both
// Remove all schema.index() calls since we're using field-level index: true

// Indexes for performance (Enhanced)
// UserSchema.index({ phone: 1 }); // REMOVE - using field-level index
// UserSchema.index({ email: 1 }, { sparse: true }); // KEEP - email needs sparse index
UserSchema.index({ email: 1 }, { sparse: true });
// UserSchema.index({ digitalId: 1 }); // REMOVE - not needed as it's unique
// UserSchema.index({ walletId: 1 }); // REMOVE - not needed as it's unique
// UserSchema.index({ customerType: 1 }); // REMOVE - not frequently queried
// UserSchema.index({ creditScore: 1 }); // REMOVE - not frequently queried
// UserSchema.index({ comprehensiveScore: 1 }); // REMOVE - not frequently queried
// UserSchema.index({ 'location.coordinates': '2dsphere' }); // KEEP - special index type
UserSchema.index({ 'location.coordinates': '2dsphere' });
// UserSchema.index({ referralCode: 1 }, { sparse: true }); // REMOVE - using field-level sparse
// UserSchema.index({ status: 1, isVerified: 1 }); // REMOVE - not frequently queried
// UserSchema.index({ 'occupationProfile.primaryOccupation': 1 }); // REMOVE - not frequently queried
// UserSchema.index({ 'socialCapital.communityScore': 1 }); // REMOVE - not frequently queried
// UserSchema.index({ role: 1 }); // REMOVE - using field-level index
UserSchema.index({ tenantCode: 1, role: 1 }); // ADDED: Composite index for tenant+role queries
UserSchema.index({ tenantCode: 1, status: 1 }); // ADDED: Composite index for tenant+status queries

// Pre-save middleware (Enhanced)
UserSchema.pre('save', function(next) {
  // Generate digital ID if not exists
  if (!this.digitalId) {
    this.digitalId = `UID${Date.now()}${Math.random().toString(36).substr(2, 6)}`.toUpperCase();
  }
  
  // Generate referral code if not exists and user is verified
  if (!this.referralCode && this.isVerified) {
    this.referralCode = `REF${this.phone.slice(-6)}${Math.random().toString(36).substr(2, 3)}`.toUpperCase();
  }
  
  // Set default tenantCode if not set
  if (!this.tenantCode) {
    this.tenantCode = 'gldmf';
  }
  
  // Update risk category based on credit score
  if (this.isModified('creditScore')) {
    if (this.creditScore >= 750) this.riskCategory = 'low';
    else if (this.creditScore >= 650) this.riskCategory = 'medium';
    else if (this.creditScore >= 550) this.riskCategory = 'high';
    else this.riskCategory = 'very_high';
  }

  // NEW: Sync occupation data for backward compatibility
  if (this.occupationProfile?.primaryOccupation && !this.occupation) {
    this.occupation = this.occupationProfile.primaryOccupation;
  }

  // NEW: Sync location data for backward compatibility
  if (this.locationContext?.district && !this.location?.district) {
    if (!this.location) this.location = {};
    this.location.district = this.locationContext.district;
    this.location.subcounty = this.locationContext.subcounty;
    this.location.village = this.locationContext.village;
  }
  
  next();
});

// Method to check if account is locked (Existing)
UserSchema.methods.isLocked = function() {
  return !!(this.lockUntil && this.lockUntil > Date.now());
};

// Method to increment login attempts (Existing)
UserSchema.methods.incrementLoginAttempts = function() {
  if (this.lockUntil && this.lockUntil < Date.now()) {
    return this.updateOne({
      $set: { loginAttempts: 1 },
      $unset: { lockUntil: 1 }
    });
  }
  
  const updates = { $inc: { loginAttempts: 1 } };
  if (this.loginAttempts + 1 >= 5) {
    updates.$set = { lockUntil: Date.now() + (2 * 60 * 60 * 1000) };
  }
  
  return this.updateOne(updates);
};

// Static method to find by phone with fuzzy matching (Existing)
UserSchema.statics.findByPhone = function(phone) {
  const cleanPhone = phone.replace(/\D/g, '');
  return this.findOne({ 
    $or: [
      { phone: cleanPhone },
      { phone: { $regex: cleanPhone.slice(-9) } }
    ]
  });
};

// NEW: Static method for informal sector analytics
UserSchema.statics.getInformalSectorAnalytics = async function() {
  return await this.aggregate([
    {
      $match: {
        customerType: { $in: ['farmer', 'informal_trader', 'gig_worker', 'small_business'] }
      }
    },
    {
      $group: {
        _id: '$customerType',
        count: { $sum: 1 },
        avgComprehensiveScore: { $avg: '$comprehensiveScore' },
        avgBehavioralScore: { $avg: '$behavioralScore' },
        avgSocialCapital: { $avg: '$socialCapitalScore' },
        totalActive: {
          $sum: { $cond: [{ $eq: ['$status', 'active'] }, 1, 0] }
        }
      }
    },
    {
      $sort: { count: -1 }
    }
  ]);
};

// Static method for customer segmentation analytics (Existing)
UserSchema.statics.getCustomerAnalytics = async function() {
  return await this.aggregate([
    {
      $group: {
        _id: '$customerType',
        count: { $sum: 1 },
        avgCreditScore: { $avg: '$creditScore' },
        avgMonthlyIncome: { $avg: '$monthlyIncome' },
        totalBorrowed: { $sum: '$portfolioSummary.totalAmountBorrowed' },
        avgComprehensiveScore: { $avg: '$comprehensiveScore' }
      }
    },
    {
      $sort: { count: -1 }
    }
  ]);
};

// NEW: Static method to get user counts by role
UserSchema.statics.getUserCountsByRole = async function() {
  const counts = await this.aggregate([
    {
      $group: {
        _id: '$role',
        count: { $sum: 1 }
      }
    }
  ]);
  
  return counts.reduce((acc, item) => {
    acc[item._id || 'unknown'] = item.count;
    return acc;
  }, {});
};

// NEW: Static method to get members by tenant
UserSchema.statics.getMembersByTenant = async function(tenantCode) {
  return await this.find({
    tenantCode: tenantCode,
    role: 'member'
  }).select('-password').sort({ createdAt: -1 });
};

export default mongoose.model('User', UserSchema);