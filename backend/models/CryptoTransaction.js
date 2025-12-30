import mongoose from 'mongoose';

const cryptoSchema = new mongoose.Schema({
  fromWallet: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'CryptoWallet',
    required: true
  },
  toAddress: {
    type: String,
    required: true
  },
  amount: {
    type: String,
    required: true
  },
  coin: {
    type: String,
    required: true,
    enum: ['BTC', 'ETH', 'USDT', 'BNB', 'ADA', 'XRP']
  },
  txHash: {
    type: String
  },
  fees: {
    type: String
  },
  description: {
    type: String
  },
  status: {
    type: String,
    enum: ['pending', 'confirmed', 'failed'],
    default: 'pending'
  },
  confirmations: {
    type: Number,
    default: 0
  },
  blockNumber: {
    type: Number
  },
  error: {
    type: String
  }
}, {
  timestamps: true
});

export default mongoose.model('CryptoTransaction', cryptoSchema);