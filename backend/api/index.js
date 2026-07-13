import express from 'express';
import cors from 'cors';

const app = express();

// Middleware
app.use(cors({ origin: '*' }));
app.use(express.json());

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'healthy', timestamp: new Date().toISOString() });
});

// Mock login
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
    ai: { iterations: 0, memorySize: 0 }
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

// Root
app.get('/', (req, res) => {
  res.json({
    message: 'SIAN Trading API',
    version: '1.0.0',
    endpoints: [
      '/api/health',
      '/api/auth/mock-login',
      '/api/trading/status',
      '/api/portfolio',
      '/api/ai/insights'
    ]
  });
});

export default app;