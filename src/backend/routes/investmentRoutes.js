// routes/investmentRoutes.js - ES Module version
import express from 'express';

const router = express.Router();

// POST /investments - Create new investment
router.post('/', async (req, res) => {
  try {
    const { userId, amount, productType = 'SianVendorGrowth', duration = 6 } = req.body;

    // Input validation
    if (!userId || !amount) {
      return res.status(400).json({
        status: 'error',
        message: 'userId and amount are required'
      });
    }

    // Create investment object
    const investment = {
      _id: 'INV' + Date.now(),
      userId: userId,
      amount: amount,
      productType: productType,
      duration: duration,
      currency: 'UGX',
      status: 'active',
      projectedReturn: Math.floor(amount * 0.12 * (duration / 12)), // 12% annual
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

// GET /investments/:id
router.get('/:id', (req, res) => {
  res.json({
    status: 'success',
    investment: { 
      id: req.params.id, 
      status: 'active',
      amount: 75000,
      productType: 'SianVendorGrowth'
    }
  });
});

// DELETE /investments/:id
router.delete('/:id', (req, res) => {
  res.json({
    status: 'success',
    message: `Investment ${req.params.id} deleted successfully`
  });
});

export default router;