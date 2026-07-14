// ============================================
// FILE: models/TradingStats.js
// ============================================

import mongoose from 'mongoose';

const tradingStatsSchema = new mongoose.Schema({
  balance: { type: Number, default: 0 },
  initialBalance: { type: Number, default: 0 },
  totalProfit: { type: Number, default: 0 },
  totalReturn: { type: Number, default: 0 },
  winRate: { type: Number, default: 0 },
  winCount: { type: Number, default: 0 },
  lossCount: { type: Number, default: 0 },
  totalTrades: { type: Number, default: 0 },
  activePositions: { type: Number, default: 0 },
  dailyProfit: { type: Number, default: 0 },
  dailyTrades: { type: Number, default: 0 },
  bestTrade: { type: Number, default: 0 },
  worstTrade: { type: Number, default: 0 },
  avgProfit: { type: Number, default: 0 },
  monthlyProjection: { type: Number, default: 0 },
  profitPerHour: { type: Number, default: 0 },
  consecutiveLosses: { type: Number, default: 0 },
  aiIterations: { type: Number, default: 0 },
  memorySize: { type: Number, default: 0 },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

// Prevent model overwrite in serverless environment
const TradingStats = mongoose.models.TradingStats || mongoose.model('TradingStats', tradingStatsSchema);

export default TradingStats;
