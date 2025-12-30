const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema({
  name: { 
    type: String, 
    required: true, 
    trim: true 
  },
  email: { 
    type: String, 
    trim: true, 
    lowercase: true,
    // Removed required: true to make email optional
  },
  phone: { 
    type: String, 
    required: true, 
    trim: true 
  },
  // National ID fields
  idType: { 
    type: String, 
    enum: ['national_id', 'passport', 'other_id'],
    default: 'national_id'
  },
  idNumber: { 
    type: String, 
    trim: true 
  },
  occupation: {
    type: String,
    trim: true
  }
}, { 
  timestamps: true 
});

module.exports = mongoose.model('User', UserSchema);