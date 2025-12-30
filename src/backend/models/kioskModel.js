// models/kioskModel.js
import mongoose from 'mongoose';

const kioskSchema = new mongoose.Schema({
  kioskId: { 
    type: String, 
    required: true, 
    unique: true,
    trim: true 
  },
  
  // Location & Geographic Data
  location: { 
    type: String, 
    required: true 
  },
  coordinates: {
    latitude: { type: Number },
    longitude: { type: Number }
  },
  region: { type: String, trim: true },
  district: { type: String, trim: true },
  
  // Kiosk Operator & Management
  operatorName: { 
    type: String, 
    required: true,
    trim: true 
  },
  operatorPhone: { 
    type: String, 
    required: true,
    trim: true 
  },
  operatorId: { 
    type: String, 
    required: true,
    trim: true 
  },
  
  // Kiosk Status & Capabilities
  status: { 
    type: String, 
    enum: ['active', 'inactive', 'maintenance', 'offline'],
    default: 'active' 
  },
  services: [{
    type: String,
    enum: [
      'farmer_registration',
      'loan_application', 
      'investment_processing',
      'cash_deposit',
      'cash_withdrawal',
      'insurance_enrollment',
      'input_distribution',
      'repayment_collection'
    ]
  }],
  
  // Financial Metrics
  dailyTransactionLimit: { type: Number, default: 5000000 }, // 5M UGX
  currentDailyVolume: { type: Number, default: 0 },
  totalTransactions: { type: Number, default: 0 },
  totalVolume: { type: Number, default: 0 },
  
  // Farmer Registration & Support
  farmersRegistered: { type: Number, default: 0 },
  activeLoansProcessed: { type: Number, default: 0 },
  investmentsFacilitated: { type: Number, default: 0 },
  
  // Technical & Connectivity
  deviceId: { type: String, trim: true },
  lastSync: { type: Date },
  connectivityStatus: { 
    type: String, 
    enum: ['online', 'offline', 'poor'],
    default: 'online' 
  },
  
  // Performance Metrics
  uptimePercentage: { type: Number, default: 100, min: 0, max: 100 },
  customerSatisfaction: { type: Number, default: 0, min: 0, max: 5 },
  
  // Audit & Compliance
  registeredAt: { type: Date, default: Date.now },
  lastMaintenance: { type: Date },
  nextMaintenance: { type: Date },
  
  // Metadata for flexible extensions
  metadata: { type: Object, default: {} }

}, { 
  timestamps: true 
});

// Indexes for better query performance
kioskSchema.index({ kioskId: 1 });
kioskSchema.index({ location: 1 });
kioskSchema.index({ status: 1 });
kioskSchema.index({ coordinates: '2dsphere' });
kioskSchema.index({ registeredAt: 1 });

// Virtual for kiosk performance score
kioskSchema.virtual('performanceScore').get(function() {
  let score = 0;
  score += this.uptimePercentage * 0.4; // 40% weight on uptime
  score += (this.customerSatisfaction / 5) * 100 * 0.3; // 30% on satisfaction
  score += Math.min((this.totalTransactions / 1000) * 100, 100) * 0.3; // 30% on activity
  return Math.round(score);
});

// Method to check if kiosk can process transaction
kioskSchema.methods.canProcessTransaction = function(amount) {
  return this.status === 'active' && 
         this.connectivityStatus === 'online' &&
         (this.currentDailyVolume + amount) <= this.dailyTransactionLimit;
};

// Static method to find kiosks by service type
kioskSchema.statics.findByService = function(serviceType) {
  return this.find({ 
    status: 'active', 
    services: serviceType 
  });
};

export default mongoose.model('Kiosk', kioskSchema);