// models/farmerModel.js
import mongoose from 'mongoose';

const farmerSchema = new mongoose.Schema({
  // Basic Identification
  nationalId: { 
    type: String, 
    required: true, 
    unique: true,
    trim: true 
  },
  firstName: { 
    type: String, 
    required: true,
    trim: true 
  },
  lastName: { 
    type: String, 
    required: true,
    trim: true 
  },
  phoneNumber: { 
    type: String, 
    required: true,
    trim: true 
  },
  
  // Digital Identity & Authentication
  digitalId: { type: String, unique: true, trim: true },
  walletId: { type: String, required: true, trim: true },
  biometricData: { type: String }, // Reference to biometric template
  
  // Location & Farm Details
  location: { 
    type: String, 
    required: true 
  },
  coordinates: {
    latitude: { type: Number },
    longitude: { type: Number }
  },
  farmSize: { type: Number, min: 0 }, // in acres
  mainCrop: { type: String, trim: true },
  secondaryCrops: [{ type: String, trim: true }],
  
  // Registration & Kiosk Connection
  registeredThrough: { 
    type: String, 
    ref: 'Kiosk',
    required: true 
  },
  registeredBy: { type: String }, // Operator ID
  registrationDate: { type: Date, default: Date.now },
  
  // Financial Profile
  creditScore: { type: Number, default: 0, min: 0, max: 1000 },
  socialCapitalScore: { type: Number, default: 0, min: 0, max: 100 },
  totalLoanAmount: { type: Number, default: 0 },
  totalRepaid: { type: Number, default: 0 },
  activeInvestments: [{ 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'Investment' 
  }],
  
  // Agricultural Data
  farmingExperience: { type: Number, default: 0 }, // in years
  annualYield: { type: Number, default: 0 }, // in kg
  averageRevenue: { type: Number, default: 0 }, // in UGX
  
  // Weather & Risk Data
  weatherRiskZone: { type: String, trim: true },
  droughtProbability: { type: Number, min: 0, max: 100 },
  
  // Social & Group Connections
  farmerGroup: { type: String, trim: true },
  groupRole: { type: String, trim: true },
  references: [{
    name: String,
    phone: String,
    relationship: String
  }],
  
  // Status & Verification
  status: { 
    type: String, 
    enum: ['pending', 'active', 'suspended', 'inactive'],
    default: 'pending' 
  },
  verificationStatus: {
    identity: { type: Boolean, default: false },
    location: { type: Boolean, default: false },
    farm: { type: Boolean, default: false },
    biometric: { type: Boolean, default: false }
  },
  
  // AI & Analytics Data
  riskCategory: { 
    type: String, 
    enum: ['low', 'medium', 'high', 'very_high'],
    default: 'medium' 
  },
  yieldPredictionAccuracy: { type: Number, default: 0, min: 0, max: 100 },
  
  // Mobile Money Integration
  mobileMoneyProvider: { 
    type: String, 
    enum: ['MTN', 'Airtel', 'Africell', 'Other'],
    default: 'MTN' 
  },
  
  // Metadata for flexible data storage
  metadata: { type: Object, default: {} }

}, { 
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Virtual for complete verification status
farmerSchema.virtual('isFullyVerified').get(function() {
  return this.verificationStatus.identity && 
         this.verificationStatus.location && 
         this.verificationStatus.farm;
});

// Virtual for repayment rate
farmerSchema.virtual('repaymentRate').get(function() {
  if (this.totalLoanAmount > 0) {
    return (this.totalRepaid / this.totalLoanAmount) * 100;
  }
  return 100;
});

// Indexes for performance
farmerSchema.index({ nationalId: 1 });
farmerSchema.index({ phoneNumber: 1 });
farmerSchema.index({ location: 1 });
farmerSchema.index({ coordinates: '2dsphere' });
farmerSchema.index({ creditScore: 1 });
farmerSchema.index({ registeredThrough: 1 });

// Pre-save to generate digital ID
farmerSchema.pre('save', function(next) {
  if (!this.digitalId) {
    this.digitalId = `FARM${Date.now()}${Math.random().toString(36).substr(2, 5)}`.toUpperCase();
  }
  next();
});

const Farmer = mongoose.model('Farmer', farmerSchema);

export default Farmer;
