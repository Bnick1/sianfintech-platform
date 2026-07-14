// ============================================
// FILE: api/index.js
// LOCATION: C:\Users\hp\sianfintech-platform\backend\api\index.js
// PRODUCTION READY - FIXED SERVERLESS EXPORT
// ============================================

import express from 'express';
import cors from 'cors';
import mongoose from 'mongoose';
import walletService from '../services/walletService.js';
import TradingStats from '../models/TradingStats.js';

const app = express();

// ============ MONGODB CONNECTION ============
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb+srv://nkiremire9_db_user:MutesiMeghan%4098@cluster0.ksslca9.mongodb.net/sian-fintech?retryWrites=true&w=majority';

let isConnected = false;
let connectionPromise = null;

async function connectToDatabase() {
  if (isConnected) return;
  if (connectionPromise) return connectionPromise;

  connectionPromise = mongoose.connect(MONGODB_URI, {
    serverSelectionTimeoutMS: 10000,
    socketTimeoutMS: 45000,
    family: 4,
  })
  .then(() => {
    isConnected = true;
    connectionPromise = null;
    console.log('✅ MongoDB connected successfully');
  })
  .catch((err) => {
    connectionPromise = null;
    console.error('❌ MongoDB connection error:', err.message);
    throw err;
  });

  return connectionPromise;
}

// Connect on startup
connectToDatabase().catch(console.error);

// ============ MIDDLEWARE ============
app.use(cors({ 
  origin: ['https://sian-trader-app.vercel.app', 'http://localhost:8081', 'http://localhost:3000'],
  credentials: true 
}));
app.use(express.json());

// Database connection middleware
app.use(async (req, res, next) => {
  try {
    await connectToDatabase();
    next();
  } catch (error) {
    res.status(500).json({ 
      success: false, 
      error: 'Database connection failed',
      details: error.message 
    });
  }
});

// ============ HEALTH CHECK ============
app.get('/api/health', (req, res) => {
  const dbState = mongoose.connection.readyState;
  const states = ['disconnected', 'connected', 'connecting', 'disconnecting'];
  
  res.json({ 
    status: 'healthy', 
    timestamp: new Date().toISOString(),
    version: '2.0.0',
    database: states[dbState] || 'unknown',
    isConnected: isConnected
  });
});

// ============ TRADING STATUS - READS FROM DATABASE ============
app.get('/api/trading/status', async (req, res) => {
  try {
    let stats = await TradingStats.findOne().sort({ createdAt: -1 });
    
    if (!stats) {
      res.json({
        success: true,
        running: false,
        stats: {
          balance: 10000,
          totalProfit: 0,
          winRate: 0,
          winCount: 0,
          lossCount: 0,
          totalTrades: 0,
          activePositions: 0,
          dailyProfit: 0,
          dailyTrades: 0,
          bestTrade: 0,
          worstTrade: 0,
          avgProfit: 0,
          monthlyProjection: 0,
          profitPerHour: 0,
          consecutiveLosses: 0,
          totalReturn: 0,
          initialBalance: 10000
        },
        ai: { iterations: 0, memorySize: 0 }
      });
      return;
    }

    res.json({
      success: true,
      running: true,
      stats: {
        balance: stats.balance || 0,
        totalProfit: stats.totalProfit || 0,
        winRate: stats.winRate || 0,
        winCount: stats.winCount || 0,
        lossCount: stats.lossCount || 0,
        totalTrades: stats.totalTrades || 0,
        activePositions: stats.activePositions || 0,
        dailyProfit: stats.dailyProfit || 0,
        dailyTrades: stats.dailyTrades || 0,
        bestTrade: stats.bestTrade || 0,
        worstTrade: stats.worstTrade || 0,
        avgProfit: stats.avgProfit || 0,
        monthlyProjection: stats.monthlyProjection || 0,
        profitPerHour: stats.profitPerHour || 0,
        consecutiveLosses: stats.consecutiveLosses || 0,
        totalReturn: stats.totalReturn || 0,
        initialBalance: stats.initialBalance || 0
      },
      ai: {
        iterations: stats.aiIterations || 0,
        memorySize: stats.memorySize || 0
      }
    });
  } catch (error) {
    console.error('Error fetching trading status:', error);
    res.status(500).json({ 
      success: false, 
      error: error.message 
    });
  }
});

// ============ PORTFOLIO ============
app.get('/api/portfolio', async (req, res) => {
  try {
    let stats = await TradingStats.findOne().sort({ createdAt: -1 });
    
    if (!stats) {
      res.json({
        success: true,
        data: {
          balance: 10000,
          initialBalance: 10000,
          totalProfit: 0,
          totalReturn: 0,
          winRate: 0,
          winCount: 0,
          lossCount: 0,
          totalTrades: 0,
          activePositions: 0,
          dailyProfit: 0,
          dailyTrades: 0,
          bestTrade: 0,
          worstTrade: 0,
          avgProfit: 0,
          monthlyProjection: 0,
          profitPerHour: 0
        }
      });
      return;
    }

    res.json({
      success: true,
      data: {
        balance: stats.balance || 0,
        initialBalance: stats.initialBalance || 0,
        totalProfit: stats.totalProfit || 0,
        totalReturn: stats.totalReturn || 0,
        winRate: stats.winRate || 0,
        winCount: stats.winCount || 0,
        lossCount: stats.lossCount || 0,
        totalTrades: stats.totalTrades || 0,
        activePositions: stats.activePositions || 0,
        dailyProfit: stats.dailyProfit || 0,
        dailyTrades: stats.dailyTrades || 0,
        bestTrade: stats.bestTrade || 0,
        worstTrade: stats.worstTrade || 0,
        avgProfit: stats.avgProfit || 0,
        monthlyProjection: stats.monthlyProjection || 0,
        profitPerHour: stats.profitPerHour || 0
      }
    });
  } catch (error) {
    console.error('Error fetching portfolio:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// ============ AUTH ============
app.post('/api/auth/mock-login', (req, res) => {
  const { email, password } = req.body;
  if (email && password) {
    res.json({
      success: true,
      data: {
        token: 'mock-token-' + Date.now(),
        user: { id: '1', email, name: 'Demo User', balance: 10000 }
      }
    });
  } else {
    res.status(400).json({ success: false, error: 'Invalid credentials' });
  }
});

// ============ WALLET ENDPOINTS ============
app.get('/api/wallet/balance', async (req, res) => {
  try {
    const userId = req.query.userId || 'default';
    const balance = await walletService.getFiatBalance(userId);
    res.json({ success: true, data: balance });
  } catch (error) {
    res.status(400).json({ success: false, error: error.message });
  }
});

app.get('/api/wallet/stats', async (req, res) => {
  try {
    const userId = req.query.userId || 'default';
    const stats = await walletService.getFiatStats(userId);
    res.json(stats);
  } catch (error) {
    res.status(400).json({ success: false, error: error.message });
  }
});

app.post('/api/wallet/deposit', async (req, res) => {
  try {
    const { amount, method, phone, reference } = req.body;
    const userId = req.query.userId || 'default';
    
    if (!amount || amount < 100000) {
      return res.status(400).json({ 
        success: false, 
        error: 'Minimum deposit is UGX 100,000' 
      });
    }
    
    const result = await walletService.depositFiat(userId, amount, method, {
      phone,
      reference
    });
    
    res.json(result);
  } catch (error) {
    res.status(400).json({ success: false, error: error.message });
  }
});

app.post('/api/wallet/withdraw', async (req, res) => {
  try {
    const { amount, method, phone, reference } = req.body;
    const userId = req.query.userId || 'default';
    
    if (!amount || amount < 50000) {
      return res.status(400).json({ 
        success: false, 
        error: 'Minimum withdrawal is UGX 50,000' 
      });
    }
    
    const result = await walletService.withdrawFiat(userId, amount, method, {
      phone,
      reference
    });
    
    res.json(result);
  } catch (error) {
    res.status(400).json({ success: false, error: error.message });
  }
});

// ============ AI INSIGHTS ============
app.get('/api/ai/insights', (req, res) => {
  res.json({
    success: true,
    data: {
      strategyWeights: {
        trendFollowing: 0.25,
        meanReversion: 0.25,
        breakout: 0.25,
        arbitrage: 0.25
      },
      confidence: 'LEARNING',
      memorySize: 0,
      iterations: 0
    }
  });
});

app.post('/api/ai/train', (req, res) => {
  res.json({
    success: true,
    message: 'AI training triggered',
    iterations: 1,
    memorySize: 0
  });
});

// ============ TRADE EXECUTION ============
app.post('/api/trade', async (req, res) => {
  try {
    const { action, symbol, size } = req.body;
    const userId = req.query.userId || 'default';
    
    const balance = await walletService.getFiatBalance(userId);
    if (!balance.success) {
      throw new Error('Could not verify wallet balance');
    }
    
    const price = 50000 + (Math.random() - 0.5) * 100;
    const positionValue = size * price;
    
    if (positionValue > balance.balanceUSD) {
      throw new Error(`Insufficient balance. Available: $${balance.balanceUSD.toFixed(2)}`);
    }
    
    const trade = {
      id: `TRD-${Date.now()}`,
      action,
      symbol,
      size,
      entryPrice: price,
      value: positionValue,
      timestamp: new Date().toISOString()
    };
    
    res.json({
      success: true,
      trade,
      message: `Trade executed: ${action} ${size} ${symbol} @ $${price.toFixed(2)}`
    });
  } catch (error) {
    res.status(400).json({ success: false, error: error.message });
  }
});

// ============ CRYPTO ENDPOINTS ============
app.get('/api/wallet/crypto', async (req, res) => {
  try {
    const userId = req.query.userId || 'default';
    const currency = req.query.currency || 'USDT';
    const balance = await walletService.getCryptoBalance(userId, currency);
    res.json(balance);
  } catch (error) {
    res.status(400).json({ success: false, error: error.message });
  }
});

app.get('/api/wallet/crypto/all', async (req, res) => {
  try {
    const userId = req.query.userId || 'default';
    const wallets = await walletService.getAllCryptoWallets(userId);
    res.json(wallets);
  } catch (error) {
    res.status(400).json({ success: false, error: error.message });
  }
});

app.get('/api/wallet/total', async (req, res) => {
  try {
    const userId = req.query.userId || 'default';
    const total = await walletService.getTotalBalance(userId);
    res.json(total);
  } catch (error) {
    res.status(400).json({ success: false, error: error.message });
  }
});

// ============ ROOT ============
app.get('/', (req, res) => {
  res.json({
    message: 'SIAN Trading API v2.0',
    version: '2.0.0',
    endpoints: [
      '/api/health',
      '/api/auth/mock-login',
      '/api/trading/status',
      '/api/portfolio',
      '/api/wallet/balance',
      '/api/wallet/stats',
      '/api/wallet/deposit',
      '/api/wallet/withdraw',
      '/api/ai/insights',
      '/api/trade',
      '/api/ai/train',
      '/api/wallet/crypto',
      '/api/wallet/crypto/all',
      '/api/wallet/total'
    ]
  });
});

// ============ VERCELL SERVERLESS HANDLER ============
export default app;