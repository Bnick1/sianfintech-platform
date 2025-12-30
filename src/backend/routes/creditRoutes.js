import express from 'express';
import CreditScore from '../models/CreditScore.js';
import User from '../models/User.js';
import { auth, authorize } from '../middleware/auth.js'; // Import 'auth', not 'authenticate'

const router = express.Router();

// Get credit score for user (AI-powered)
router.get('/score/:userId', auth, async (req, res) => { // Changed 'authenticate' to 'auth'
  try {
    const { userId } = req.params;
    
    let creditScore = await CreditScore.findOne({ userId })
      .populate('userId', 'name email phone customerType occupation tenantCode');
    
    if (!creditScore) {
      // Create a credit score using AI calculation
      const user = await User.findById(userId);
      if (!user) {
        return res.status(404).json({ 
          success: false, 
          error: 'User not found' 
        });
      }
      
      // Calculate initial score using AI
      const aiResult = await CreditScore.calculateScore(userId);
      
      creditScore = new CreditScore({ 
        userId,
        memberId: user.digitalId || `MEM${Date.now().toString().substr(-6)}`,
        score: aiResult.score,
        factors: aiResult.factors,
        loanPerformance: aiResult.loanPerformance,
        metadata: {
          calculatedWithAI: true,
          isFallback: aiResult.isFallback || false
        }
      });
      
      await creditScore.save();
      
      // Update user's credit score field
      user.creditScore = aiResult.score;
      await user.save();
    }
    
    res.json({
      success: true,
      score: creditScore.score,
      riskLevel: creditScore.riskLevel,
      lastUpdated: creditScore.lastUpdated,
      factors: creditScore.factors,
      loanPerformance: creditScore.loanPerformance,
      user: {
        name: creditScore.userId?.name,
        customerType: creditScore.userId?.customerType,
        occupation: creditScore.userId?.occupation,
        tenantCode: creditScore.userId?.tenantCode
      },
      metadata: creditScore.metadata
    });
  } catch (error) {
    console.error('Credit score error:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Failed to get credit score' 
    });
  }
});

// Get full credit report with AI insights
router.get('/report/:userId', auth, async (req, res) => { // Changed 'authenticate' to 'auth'
  try {
    const { userId } = req.params;
    
    const creditScore = await CreditScore.findOne({ userId })
      .populate('userId', 'name email phone customerType occupation monthlyIncome location behavioralData');
    
    if (!creditScore) {
      return res.status(404).json({ 
        success: false, 
        error: 'Credit score not found. Initialize with /score/:userId first.' 
      });
    }
    
    // Get AI analysis for current state
    const aiResult = await CreditScore.calculateScore(userId);
    
    res.json({
      success: true,
      creditScore,
      aiAnalysis: {
        currentScore: aiResult.score,
        factors: aiResult.factors,
        loanPerformance: aiResult.loanPerformance,
        assessment: aiResult.aiAssessment
      },
      recommendations: generateRecommendations(creditScore, aiResult)
    });
  } catch (error) {
    console.error('Credit report error:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Failed to get credit report' 
    });
  }
});

// Trigger AI credit score calculation
router.post('/calculate/:userId', auth, async (req, res) => { // Changed 'authenticate' to 'auth'
  try {
    const { userId } = req.params;
    const { reason = 'manual_calculation' } = req.body;
    
    // Get or create credit score
    let creditScore = await CreditScore.findOne({ userId });
    
    if (!creditScore) {
      const user = await User.findById(userId);
      if (!user) {
        return res.status(404).json({ 
          success: false, 
          error: 'User not found' 
        });
      }
      
      creditScore = new CreditScore({ 
        userId,
        memberId: user.digitalId || `MEM${Date.now().toString().substr(-6)}`
      });
    }
    
    // Recalculate with AI
    const previousScore = creditScore.score;
    await creditScore.recalculateWithAI(reason);
    
    // Update user's credit score field
    await User.findByIdAndUpdate(userId, {
      creditScore: creditScore.score,
      riskCategory: creditScore.riskLevel === 'excellent' || creditScore.riskLevel === 'good' ? 'low' :
                    creditScore.riskLevel === 'fair' ? 'medium' : 'high'
    });
    
    res.json({
      success: true,
      score: creditScore.score,
      previousScore: previousScore,
      change: creditScore.score - previousScore,
      riskLevel: creditScore.riskLevel,
      lastUpdated: creditScore.lastUpdated,
      factors: creditScore.factors,
      loanPerformance: creditScore.loanPerformance,
      message: 'AI credit score calculation completed'
    });
  } catch (error) {
    console.error('Credit calculation error:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Failed to calculate credit score' 
    });
  }
});

// Batch calculate credit scores (admin only)
router.post('/batch-calculate', auth, authorize(['admin', 'gldmf_staff']), async (req, res) => {
  try {
    const { userIds, reason = 'batch_update' } = req.body;
    
    if (!userIds || !Array.isArray(userIds)) {
      return res.status(400).json({
        success: false,
        error: 'userIds array is required'
      });
    }
    
    if (userIds.length > 50) {
      return res.status(400).json({
        success: false,
        error: 'Batch limited to 50 users at once'
      });
    }
    
    const results = {
      successful: 0,
      failed: 0,
      details: []
    };
    
    for (const userId of userIds) {
      try {
        const creditScore = await CreditScore.findOne({ userId });
        
        if (creditScore) {
          const previousScore = creditScore.score;
          await creditScore.recalculateWithAI(reason);
          
          results.successful++;
          results.details.push({
            userId,
            status: 'success',
            previousScore,
            newScore: creditScore.score,
            change: creditScore.score - previousScore
          });
        } else {
          // Create new credit score
          const user = await User.findById(userId);
          if (user) {
            const aiResult = await CreditScore.calculateScore(userId);
            
            const newCreditScore = new CreditScore({ 
              userId,
              memberId: user.digitalId || `MEM${Date.now().toString().substr(-6)}`,
              score: aiResult.score,
              factors: aiResult.factors,
              loanPerformance: aiResult.loanPerformance
            });
            
            await newCreditScore.save();
            
            // Update user
            user.creditScore = aiResult.score;
            await user.save();
            
            results.successful++;
            results.details.push({
              userId,
              status: 'created',
              newScore: aiResult.score
            });
          } else {
            results.failed++;
            results.details.push({
              userId,
              status: 'failed',
              error: 'User not found'
            });
          }
        }
      } catch (error) {
        results.failed++;
        results.details.push({
          userId,
          status: 'failed',
          error: error.message
        });
      }
    }
    
    res.json({
      success: true,
      message: 'Batch credit score calculation completed',
      ...results
    });
    
  } catch (error) {
    console.error('Batch calculation error:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Failed to batch calculate credit scores' 
    });
  }
});

// Update credit score from loan event (webhook)
router.post('/webhook/loan-event', async (req, res) => {
  try {
    const { userId, event, loanData } = req.body;
    
    if (!userId || !event) {
      return res.status(400).json({
        success: false,
        error: 'userId and event are required'
      });
    }
    
    const events = {
      'loan_disbursed': 'new_loan_disbursed',
      'repayment_made': 'repayment_received',
      'repayment_missed': 'repayment_missed',
      'loan_completed': 'loan_successfully_completed',
      'loan_defaulted': 'loan_defaulted',
      'late_payment': 'late_payment_recorded'
    };
    
    const reason = events[event] || 'loan_activity';
    
    // Find credit score
    const creditScore = await CreditScore.findOne({ userId });
    
    if (creditScore) {
      // Recalculate with AI
      await creditScore.recalculateWithAI(reason);
      
      res.json({
        success: true,
        message: `Credit score updated for ${event}`,
        score: creditScore.score,
        riskLevel: creditScore.riskLevel
      });
    } else {
      // Initialize if doesn't exist
      const aiResult = await CreditScore.calculateScore(userId);
      
      const newCreditScore = new CreditScore({ 
        userId,
        memberId: `MEM${Date.now().toString().substr(-6)}`,
        score: aiResult.score,
        factors: aiResult.factors,
        loanPerformance: aiResult.loanPerformance,
        metadata: {
          initializedFrom: event
        }
      });
      
      await newCreditScore.save();
      
      res.json({
        success: true,
        message: `Credit score initialized from ${event}`,
        score: aiResult.score,
        riskLevel: newCreditScore.riskLevel
      });
    }
    
  } catch (error) {
    console.error('Loan webhook error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to process loan event'
    });
  }
});

// Get credit score trends (admin/analyst only)
router.get('/analytics/trends', auth, authorize(['admin', 'analyst', 'gldmf_staff']), async (req, res) => {
  try {
    const { days = 30, tenantCode, customerType } = req.query;
    
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - parseInt(days));
    
    // Build query
    const query = {
      lastUpdated: { $gte: cutoffDate }
    };
    
    if (tenantCode) {
      const users = await User.find({ tenantCode }).select('_id');
      const userIds = users.map(user => user._id);
      query.userId = { $in: userIds };
    }
    
    if (customerType) {
      const users = await User.find({ customerType }).select('_id');
      const userIds = users.map(user => user._id);
      query.userId = query.userId ? { ...query.userId, $in: userIds } : { $in: userIds };
    }
    
    const scores = await CreditScore.find(query)
      .populate('userId', 'customerType occupation tenantCode name')
      .sort({ lastUpdated: -1 })
      .limit(500);
    
    // Calculate analytics
    const analytics = {
      total: scores.length,
      averageScore: scores.length > 0 ? 
        scores.reduce((sum, s) => sum + s.score, 0) / scores.length : 0,
      distribution: {
        excellent: scores.filter(s => s.riskLevel === 'excellent').length,
        good: scores.filter(s => s.riskLevel === 'good').length,
        fair: scores.filter(s => s.riskLevel === 'fair').length,
        poor: scores.filter(s => s.riskLevel === 'poor' || s.riskLevel === 'very_poor').length
      }
    };
    
    // Group by customer type
    analytics.byCustomerType = {};
    scores.forEach(score => {
      const type = score.userId?.customerType || 'unknown';
      if (!analytics.byCustomerType[type]) {
        analytics.byCustomerType[type] = {
          count: 0,
          avgScore: 0,
          scores: []
        };
      }
      analytics.byCustomerType[type].count++;
      analytics.byCustomerType[type].scores.push(score.score);
    });
    
    // Calculate averages
    Object.keys(analytics.byCustomerType).forEach(type => {
      const data = analytics.byCustomerType[type];
      data.avgScore = data.scores.length > 0 ? 
        data.scores.reduce((sum, s) => sum + s, 0) / data.scores.length : 0;
      delete data.scores;
    });
    
    // Recent updates
    analytics.recentUpdates = scores.slice(0, 20).map(score => ({
      userId: score.userId?._id,
      name: score.userId?.name,
      score: score.score,
      riskLevel: score.riskLevel,
      lastUpdated: score.lastUpdated,
      customerType: score.userId?.customerType
    }));
    
    res.json({
      success: true,
      analytics,
      period: days,
      tenantCode,
      customerType
    });
    
  } catch (error) {
    console.error('Analytics error:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Failed to get credit score analytics' 
    });
  }
});

// Initialize credit score for new member
router.post('/initialize', auth, async (req, res) => { // Changed 'authenticate' to 'auth'
  try {
    const { userId } = req.body;
    
    if (!userId) {
      return res.status(400).json({
        success: false,
        error: 'userId is required'
      });
    }
    
    // Check if already exists
    const existing = await CreditScore.findOne({ userId });
    if (existing) {
      return res.json({
        success: true,
        message: 'Credit score already exists',
        score: existing.score,
        riskLevel: existing.riskLevel
      });
    }
    
    // Get user
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        error: 'User not found'
      });
    }
    
    // Calculate initial score
    const aiResult = await CreditScore.calculateScore(userId);
    
    // Create credit score
    const creditScore = new CreditScore({
      userId,
      memberId: user.digitalId || `MEM${Date.now().toString().substr(-6)}`,
      score: aiResult.score,
      factors: aiResult.factors,
      loanPerformance: aiResult.loanPerformance,
      metadata: {
        initialized: new Date(),
        method: 'ai_initialization',
        tenantCode: user.tenantCode
      }
    });
    
    await creditScore.save();
    
    // Update user
    user.creditScore = aiResult.score;
    await user.save();
    
    res.json({
      success: true,
      message: 'Credit score initialized successfully',
      score: aiResult.score,
      riskLevel: creditScore.riskLevel,
      memberId: creditScore.memberId,
      customerType: user.customerType
    });
    
  } catch (error) {
    console.error('Initialization error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to initialize credit score'
    });
  }
});

// Helper function to generate recommendations
function generateRecommendations(creditScore, aiResult) {
  const recommendations = [];
  
  if (creditScore.score < 600) {
    recommendations.push({
      priority: 'high',
      action: 'improve_payment_history',
      message: 'Focus on making timely payments on existing obligations',
      impact: '+30-50 points'
    });
  }
  
  if (creditScore.loanPerformance.defaultedLoans > 0) {
    recommendations.push({
      priority: 'high',
      action: 'resolve_defaults',
      message: 'Clear any outstanding defaults to improve score significantly',
      impact: '+50-80 points'
    });
  }
  
  if (creditScore.factors.creditUtilization > 80) {
    recommendations.push({
      priority: 'medium',
      action: 'reduce_credit_utilization',
      message: 'Try to keep credit utilization below 80% of available credit',
      impact: '+10-30 points'
    });
  }
  
  if (creditScore.factors.paymentHistory < 60) {
    recommendations.push({
      priority: 'medium',
      action: 'consistent_payments',
      message: 'Ensure all payments are made on time for the next 3-6 months',
      impact: '+20-40 points'
    });
  }
  
  if (aiResult?.aiAssessment?.informalSectorFactors) {
    aiResult.aiAssessment.informalSectorFactors.forEach(factor => {
      recommendations.push({
        priority: 'low',
        action: 'sector_improvement',
        message: factor,
        impact: '+5-15 points'
      });
    });
  }
  
  return recommendations;
}

export default router;