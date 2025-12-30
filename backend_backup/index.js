import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

const app = express();
const PORT = process.env.PORT || 8082;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

console.log('🚀 Starting SianFinTech backend...');

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.status(200).json({
    status: 'healthy',
    service: 'sianfintech-api',
    timestamp: new Date().toISOString(),
    version: '1.0.0',
    environment: process.env.NODE_ENV || 'development'
  });
});

// DIRECT ROUTES - No imports needed for now
app.post('/api/investments', (req, res) => {
  console.log('📥 Investment POST received:', req.body);
  
  try {
    const { userId, amount, productType = 'SianVendorGrowth', duration = 6 } = req.body;

    if (!userId || !amount) {
      return res.status(400).json({
        status: 'error',
        message: 'userId and amount are required'
      });
    }

    const investment = {
      _id: 'INV' + Date.now(),
      userId: userId,
      amount: amount,
      productType: productType,
      duration: duration,
      currency: 'UGX',
      status: 'active',
      projectedReturn: Math.floor(amount * 0.12 * (duration / 12)),
      createdAt: new Date().toISOString(),
      expectedMaturity: new Date(Date.now() + duration * 30 * 24 * 60 * 60 * 1000)
    };

    res.status(201).json({
      status: 'success',
      message: 'Investment created successfully',
      investment: investment
    });

  } catch (error) {
    res.status(500).json({
      status: 'error',
      message: 'Investment creation failed: ' + error.message
    });
  }
});

app.post('/api/ai/predict', (req, res) => {
  console.log('📥 AI POST received:', req.body);
  
  try {
    const { occupation, businessType, location, monthlyVolume } = req.body;
    
    // Simple AI logic
    const riskScore = Math.min(Math.max(Math.round(50 + (Math.random() * 30)), 20), 80);
    
    res.status(200).json({
      status: 'success',
      prediction: {
        riskScore: riskScore,
        recommendation: riskScore > 60 ? 'approve' : 'review',
        maxLoanAmount: riskScore * 10000,
        repaymentPeriod: '6 months'
      }
    });
  } catch (error) {
    res.status(500).json({
      status: 'error',
      message: 'AI assessment failed: ' + error.message
    });
  }
});

// 404 handler
app.use((req, res) => {
  console.log(`❌ 404 - ${req.method} ${req.url}`);
  res.status(404).json({
    status: 'error',
    message: 'Endpoint not found'
  });
});

// Start server
app.listen(PORT, '0.0.0.0', () => {
  console.log(`🚀 SianFinTech server running on port ${PORT}`);
  console.log(`✅ POST http://localhost:${PORT}/api/investments`);
  console.log(`✅ POST http://localhost:${PORT}/api/ai/predict`);
});