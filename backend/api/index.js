// ============================================
// FILE: api/index.js
// LOCATION: C:\Users\hp\sianfintech-platform\backend\api\index.js
// ENHANCED WITH WALLET, DEPOSIT, WITHDRAWAL, AND TRADING ENDPOINTS
// ============================================

import express from 'express';
import cors from 'cors';
import mongoose from 'mongoose';
import walletService from '../services/walletService.js';

const app = express();

// ============ MONGODB CONNECTION ============
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb+srv://nkiremire9_db_user:MutesiMeghan%4098@cluster0.ksslca9.mongodb.net/sian-fintech?retryWrites=true&w=majority';

// Connection state
let isConnected = false;
let connectionPromise = null;

async function connectToDatabase() {
  if (isConnected) {
    return;
  }

  // If connection is already in progress, wait for it
  if (connectionPromise) {
    return connectionPromise;
  }

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

// Start connection immediately
connectToDatabase().catch(console.error);

// ============ MIDDLEWARE ============
app.use(cors({ 
  origin: ['https://sian-trader-app.vercel.app', 'http://localhost:8081', 'http://localhost:3000'],
  credentials: true 
}));
app.use(express.json());

// Database connection middleware - ensures DB is connected before handling requests
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

// ============ AUTHENTICATION ============

// Mock login (for demo)
app.post('/api/auth/mock-login', (req, res) => {
  const { email, password } = req.body;
  if (email && password) {
    res.json({
      success: true,
      data: {
        token: 'mock-token-' + Date.now(),
        user: { 
          id: '1', 
          email, 
          name: 'Demo User', 
          balance: 10000 
        }
      }
    });
  } else {
    res.status(400).json({ success: false, error: 'Invalid credentials' });
  }
});

// User Registration
app.post('/api/auth/register', async (req, res) => {
  try {
    const { name, email, phone, password } = req.body;
    
    if (!name || !email || !phone || !password) {
      return res.status(400).json({ 
        success: false, 
        error: 'All fields are required' 
      });
    }
    
    const userId = 'user-' + Date.now();
    const wallet = await walletService.getOrCreateFiatWallet(userId);
    
    res.json({
      success: true,
      message: 'User registered successfully',
      data: {
        userId,
        name,
        email,
        walletId: wallet.walletId
      }
    });
  } catch (error) {
    res.status(400).json({ success: false, error: error.message });
  }
});

// ============ WALLET ENDPOINTS ============

// Get wallet balance
app.get('/api/wallet/balance', async (req, res) => {
  try {
    const userId = req.query.userId || 'default';
    const balance = await walletService.getFiatBalance(userId);
    res.json({ success: true, data: balance });
  } catch (error) {
    res.status(400).json({ success: false, error: error.message });
  }
});

// Get wallet stats (complete metrics)
app.get('/api/wallet/stats', async (req, res) => {
  try {
    const userId = req.query.userId || 'default';
    const stats = await walletService.getFiatStats(userId);
    res.json(stats);
  } catch (error) {
    res.status(400).json({ success: false, error: error.message });
  }
});

// Get transaction history
app.get('/api/wallet/transactions', async (req, res) => {
  try {
    const userId = req.query.userId || 'default';
    const { limit = 20, page = 1 } = req.query;
    const result = await walletService.getTransactionHistory(
      userId, 
      parseInt(limit), 
      (parseInt(page) - 1) * parseInt(limit)
    );
    res.json(result);
  } catch (error) {
    res.status(400).json({ success: false, error: error.message });
  }
});

// Deposit to wallet
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

// Withdraw from wallet (profits only)
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

// ============ TRADING ENDPOINTS ============

// Trading status
app.get('/api/trading/status', (req, res) => {
  res.json({
    success: true,
    running: false,
    stats: {
      balance: 10000,
      totalProfit: 0,
      winRate: 0,
      totalTrades: 0,
      activePositions: 0
    },
    ai: { 
      iterations: 0, 
      memorySize: 0 
    }
  });
});

// Portfolio
app.get('/api/portfolio', (req, res) => {
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
});

// AI Insights
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

// Execute trade (manual)
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

// Train AI
app.post('/api/ai/train', (req, res) => {
  res.json({
    success: true,
    message: 'AI training triggered',
    iterations: 1,
    memorySize: 0
  });
});

// ============ CRYPTO ENDPOINTS ============

// Get crypto balance
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

// Get all crypto wallets
app.get('/api/wallet/crypto/all', async (req, res) => {
  try {
    const userId = req.query.userId || 'default';
    const wallets = await walletService.getAllCryptoWallets(userId);
    res.json(wallets);
  } catch (error) {
    res.status(400).json({ success: false, error: error.message });
  }
});

// Get total balance (crypto + fiat)
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
      '/api/auth/register',
      '/api/wallet/balance',
      '/api/wallet/stats',
      '/api/wallet/transactions',
      '/api/wallet/deposit',
      '/api/wallet/withdraw',
      '/api/trading/status',
      '/api/portfolio',
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
export default async function handler(req, res) {
  return app(req, res);
}