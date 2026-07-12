import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';

dotenv.config();

const app = express();

// Middleware
app.use(cors({
  origin: ['https://sian-trader-app.vercel.app', 'http://localhost:8081', 'http://localhost:3000'],
  credentials: true
}));
app.use(express.json());

// Health check
app.get('/api/health', (req, res) => {
  res.json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    version: '1.0.0',
    env: process.env.NODE_ENV || 'development'
  });
});

// Mock login endpoint
app.post('/api/auth/mock-login', (req, res) => {
  const { email, password } = req.body;
  
  if (email && password) {
    res.json({
      success: true,
      data: {
        token: 'mock-token-' + Date.now(),
        user: {
          id: '1',
          email: email,
          name: 'Demo User',
          balance: 10000
        }
      }
    });
  } else {
    res.status(400).json({ success: false, error: 'Invalid credentials' });
  }
});

// Trading status endpoint (mock)
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

// Portfolio endpoint (mock)
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

// Export for Vercel
export default app;
