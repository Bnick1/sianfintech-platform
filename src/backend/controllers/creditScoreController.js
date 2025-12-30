import CreditScoreService from '../services/CreditScoreService.js';
import CreditScore from '../models/CreditScore.js';

class CreditScoreController {
  
  // Get credit score for a user
  async getCreditScore(req, res) {
    try {
      const { userId } = req.params;
      
      let creditScore = await CreditScore.findOne({ userId })
        .populate('userId', 'name email phone customerType');
      
      if (!creditScore) {
        // Initialize if doesn't exist
        creditScore = await CreditScoreService.initializeCreditScore(userId);
      }
      
      res.json({
        success: true,
        creditScore: {
          score: creditScore.score,
          riskLevel: creditScore.riskLevel,
          lastUpdated: creditScore.lastUpdated,
          factors: creditScore.factors,
          loanPerformance: creditScore.loanPerformance
        },
        user: creditScore.userId
      });
      
    } catch (error) {
      console.error('❌ Error getting credit score:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to retrieve credit score'
      });
    }
  }
  
  // Get detailed score breakdown
  async getScoreBreakdown(req, res) {
    try {
      const { userId } = req.params;
      
      const breakdown = await CreditScoreService.getScoreBreakdown(userId);
      
      if (breakdown.error) {
        return res.status(404).json({
          success: false,
          error: breakdown.error
        });
      }
      
      res.json({
        success: true,
        ...breakdown
      });
      
    } catch (error) {
      console.error('❌ Error getting score breakdown:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to get score breakdown'
      });
    }
  }
  
  // Trigger score recalculation
  async recalculateScore(req, res) {
    try {
      const { userId } = req.params;
      const { reason } = req.body;
      
      const updatedScore = await CreditScoreService.recalculateCreditScore(userId, reason);
      
      res.json({
        success: true,
        message: 'Credit score recalculated',
        newScore: updatedScore.score,
        previousScore: updatedScore.previousScores.length > 1 ? 
          updatedScore.previousScores[updatedScore.previousScores.length - 2].score : null,
        change: updatedScore.previousScores.length > 1 ? 
          updatedScore.score - updatedScore.previousScores[updatedScore.previousScores.length - 2].score : 0,
        riskLevel: updatedScore.riskLevel,
        lastUpdated: updatedScore.lastUpdated
      });
      
    } catch (error) {
      console.error('❌ Error recalculating credit score:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to recalculate credit score'
      });
    }
  }
  
  // Batch recalculation (admin only)
  async batchRecalculate(req, res) {
    try {
      const { userIds, reason } = req.body;
      
      if (!userIds || !Array.isArray(userIds)) {
        return res.status(400).json({
          success: false,
          error: 'userIds array is required'
        });
      }
      
      if (userIds.length > 100) {
        return res.status(400).json({
          success: false,
          error: 'Batch limited to 100 users at once'
        });
      }
      
      const results = await CreditScoreService.batchRecalculateCreditScores(userIds, reason);
      
      res.json({
        success: true,
        message: 'Batch recalculation completed',
        ...results
      });
      
    } catch (error) {
      console.error('❌ Error in batch recalculation:', error);
      res.status(500).json({
        success: false,
        error: 'Batch recalculation failed'
      });
    }
  }
  
  // Update score from loan event (webhook)
  async updateFromLoanEvent(req, res) {
    try {
      const { userId, loanEvent, loanData } = req.body;
      
      if (!userId || !loanEvent) {
        return res.status(400).json({
          success: false,
          error: 'userId and loanEvent are required'
        });
      }
      
      const updatedScore = await CreditScoreService.updateScoreFromLoanEvent(userId, loanEvent);
      
      res.json({
        success: true,
        message: `Score updated for loan event: ${loanEvent}`,
        newScore: updatedScore.score,
        riskLevel: updatedScore.riskLevel
      });
      
    } catch (error) {
      console.error('❌ Error updating score from loan event:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to update score from loan event'
      });
    }
  }
  
  // Get credit score trends for analytics
  async getScoreTrends(req, res) {
    try {
      const { days = 30, minScore, maxScore, riskLevel } = req.query;
      
      const cutoffDate = new Date();
      cutoffDate.setDate(cutoffDate.getDate() - parseInt(days));
      
      const query = {
        lastUpdated: { $gte: cutoffDate }
      };
      
      if (minScore) query.score = { ...query.score, $gte: parseInt(minScore) };
      if (maxScore) query.score = { ...query.score, $lte: parseInt(maxScore) };
      if (riskLevel) query.riskLevel = riskLevel;
      
      const scores = await CreditScore.find(query)
        .populate('userId', 'customerType occupation tenantCode')
        .sort({ lastUpdated: -1 })
        .limit(1000);
      
      // Aggregate trends
      const trends = {
        total: scores.length,
        averageScore: scores.reduce((sum, s) => sum + s.score, 0) / scores.length,
        distribution: {
          excellent: scores.filter(s => s.riskLevel === 'excellent').length,
          good: scores.filter(s => s.riskLevel === 'good').length,
          fair: scores.filter(s => s.riskLevel === 'fair').length,
          poor: scores.filter(s => s.riskLevel === 'poor').length
        },
        byCustomerType: {},
        byTenant: {},
        recentUpdates: scores.slice(0, 50).map(score => ({
          userId: score.userId?._id,
          name: score.userId?.name,
          score: score.score,
          riskLevel: score.riskLevel,
          lastUpdated: score.lastUpdated,
          customerType: score.userId?.customerType
        }))
      };
      
      // Aggregate by customer type
      scores.forEach(score => {
        const customerType = score.userId?.customerType || 'unknown';
        trends.byCustomerType[customerType] = (trends.byCustomerType[customerType] || 0) + 1;
        
        const tenant = score.userId?.tenantCode || 'unknown';
        trends.byTenant[tenant] = (trends.byTenant[tenant] || 0) + 1;
      });
      
      res.json({
        success: true,
        trends,
        period: days,
        sampleSize: scores.length
      });
      
    } catch (error) {
      console.error('❌ Error getting score trends:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to get score trends'
      });
    }
  }
  
  // Initialize credit score for new member
  async initializeForNewMember(req, res) {
    try {
      const { userId } = req.body;
      
      if (!userId) {
        return res.status(400).json({
          success: false,
          error: 'userId is required'
        });
      }
      
      const creditScore = await CreditScoreService.initializeCreditScore(userId);
      
      res.json({
        success: true,
        message: 'Credit score initialized',
        score: creditScore.score,
        riskLevel: creditScore.riskLevel,
        memberId: creditScore.memberId
      });
      
    } catch (error) {
      console.error('❌ Error initializing credit score:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to initialize credit score'
      });
    }
  }
}

export default new CreditScoreController();