// models/Tenant.js
import mongoose from 'mongoose';

const tenantSchema = new mongoose.Schema({
  code: {
    type: String,
    required: true,
    unique: true,
    uppercase: true
  },
  name: {
    type: String,
    required: true
  },
  description: {
    type: String
  },
  type: {
    type: String,
    enum: ['sacco', 'mfis', 'fintech', 'cooperative', 'investment_fund'],
    required: true
  },
  status: {
    type: String,
    enum: ['active', 'inactive', 'suspended'],
    default: 'active'
  },
  config: {
    currency: {
      type: String,
      default: 'UGX'
    },
    language: {
      type: String,
      default: 'en'
    },
    timezone: {
      type: String,
      default: 'Africa/Kampala'
    },
    maxLoanAmount: {
      type: Number,
      default: 50000000
    },
    minLoanAmount: {
      type: Number,
      default: 50000
    },
    interestRates: {
      personal: { type: Number, default: 18 },
      business: { type: Number, default: 15 },
      agricultural: { type: Number, default: 12 }
    }
  },
  contact: {
    email: String,
    phone: String,
    address: {
      street: String,
      city: String,
      country: {
        type: String,
        default: 'Uganda'
      }
    }
  },
  integration: {
    paymentGateway: {
      enabled: { type: Boolean, default: false },
      provider: String,
      config: Object
    },
    mobileMoney: {
      enabled: { type: Boolean, default: false },
      providers: [String]
    },
    smsGateway: {
      enabled: { type: Boolean, default: false },
      provider: String
    }
  },
  metadata: {
    type: Object,
    default: {}
  }
}, {
  timestamps: true
});

// Indexes
tenantSchema.index({ code: 1 });
tenantSchema.index({ type: 1 });
tenantSchema.index({ status: 1 });

// Pre-save middleware
tenantSchema.pre('save', function(next) {
  this.code = this.code.toUpperCase();
  next();
});

// Static method to get active tenants
tenantSchema.statics.getActiveTenants = function() {
  return this.find({ status: 'active' });
};

// Static method to find by code
tenantSchema.statics.findByCode = function(code) {
  return this.findOne({ code: code.toUpperCase() });
};

export default mongoose.model('Tenant', tenantSchema);