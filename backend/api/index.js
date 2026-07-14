import express from 'express';
import cors from 'cors';

const app = express();

// ============ MIDDLEWARE ============
app.use(cors({ origin: '*' }));
app.use(express.json());

// ============ HEALTH ============
app.get('/api/health', (req, res) => {
  res.json({ status: 'healthy', timestamp: new Date().toISOString() });
});

// ============ TRADING STATUS ============
app.get('/api/trading/status', (req, res) => {
  res.json({
    success: true,
    running: false,
    stats: {
      balance: 10000,
      totalProfit: 0,
      winRate: 0,
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
});

// ============ PORTFOLIO ============
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

// ============ MOCK LOGIN ============
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

// ============ ROOT ============
app.get('/', (req, res) => {
  res.json({
    message: 'SIAN Trading API',
    version: '2.0.0',
    endpoints: ['/api/health', '/api/trading/status', '/api/portfolio', '/api/auth/mock-login']
  });
});

// ============ VERCELL HANDLER - ES Module Export ============
// This is the correct export for ES modules
export default app;
