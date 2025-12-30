import mongoose from 'mongoose';

const cryptoSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  coin: {
    type: String,
    required: true,
    uppercase: true,
    enum: ['BTC', 'ETH', 'USDT', 'BNB', 'ADA', 'XRP']
  },
  address: {
    type: String,
    required: true
  },
  privateKey: {
    type: String,
    required: true
  },
  publicKey: {
    type: String,
    required: true
  },
  balance: {
    type: String,
    default: '0'
  },
  addresses: [{
    address: String,
    created_at: {
      type: Date,
      default: Date.now
    }
  }],
  isActive: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true
});

// Compound index to ensure one wallet per coin per user
cryptoSchema.index({ user: 1, coin: 1 }, { unique: true });

export default mongoose.model('CryptoWallet', cryptoSchema);