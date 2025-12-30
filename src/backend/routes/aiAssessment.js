// UPDATED backend/routes/aiAssessment.js
const express = require('express');
const AIService = require('../services/AIService.js'); // Import your enhanced AIService

const router = express.Router();

// POST /api/ai-credit-assessment - UPDATED to use AIService
router.post('/ai-credit-assessment', async (req, res) => {
  try {
    const { occupation, customerType, monthlyIncome, location } = req.body;

    if (!occupation && !customerType) {
      return res.status(400).json({ 
        success: false,
        error: 'Occupation or customer type is required' 
      });
    }

    console.log(`🤖 AI Assessment requested for: ${occupation || customerType}`);

    // Use your enhanced AIService instead of local functions
    const assessment = await AIService.analyzeCreditRisk({
      occupation: occupation?.toLowerCase(),
      customerType: customerType || 'other',
      monthlyIncome,
      location
    });
    
    res.json({
      success: true,
      ...assessment
    });

  } catch (error) {
    console.error('AI Assessment Error:', error);
    res.status(500).json({ 
      success: false,
      error: 'AI service temporarily unavailable',
      fallback: true
    });
  }
});

// Keep the legacy functions for backward compatibility if needed
// but they'll now be unused since we're using AIService

function calculateRiskProfile(occupation) {
  // This is now handled by AIService - keeping for compatibility
  return { score: 50, stability: 'medium', income: 'variable', category: 'general' };
}

function getEconomicFactors() {
  // This is now handled by AIService - keeping for compatibility
  return { impact: 0, details: {} };
}

function getHistoricalPerformance(occupation) {
  // This is now handled by AIService - keeping for compatibility
  return { score: 70, defaultRate: 10, repaymentRate: 90 };
}

module.exports = router;