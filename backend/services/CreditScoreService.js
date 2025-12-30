import CreditScore from '../models/CreditScore.js';
import AIService from './AIService.js';
import User from '../models/User.js';
import Loan from '../models/Loan.js';

class CreditScoreService {
  
  // Initialize credit score for a new user
  async initializeCreditScore(userId) {
    try {
      const user = await User.findById(userId);
      if (!user) throw new Error('User not found');
      
      // Check if score already exists
      const existingScore = await CreditScore.findOne({ userId });
      if (existingScore) {
        return existingScore;
      }
      
      // Calculate initial score
      const initialScore = await CreditScore.calculateScore(userId);
      
      // Create credit score record
      const creditScore = new CreditScore({
        userId,
        memberId: user.digitalId || `MEM${Date.now()}`,
        score: initialScore,
        // Factors will be auto-calculated in pre-save
      });
      
      await creditScore.save();
      
      // Update user's credit score field
      user.creditScore = initialScore;
      await user.save();
      
      console.log(`✅ Credit score initialized for user ${userId}: ${initialScore}`);
      return creditScore;
      
    } catch (error) {
      console.error('❌ Error initializing credit score:', error);
      throw error;
    }
  }
  
  // Recalculate score for existing user
  async recalculateCreditScore(userId, reason = 'periodic_update') {
    try {
      const newScore = await CreditScore.calculateScore(userId);
      const creditScore = await CreditScore.findOne({ userId });
      
      if (!creditScore) {
        return await this.initializeCreditScore(userId);
      }
      
      // Update with reason
      creditScore.score = newScore;
      creditScore.previousScores.push({
        score: newScore,
        date: new Date(),
        reason
      });
      
      // Keep only last 10 scores
      if (creditScore.previousScores.length > 10) {
        creditScore.previousScores = creditScore.previousScores.slice(-10);
      }
      
      await creditScore.save();
      
      // Update user record
      await User.findByIdAndUpdate(userId, {
        creditScore: newScore
      });
      
      console.log(`🔄 Credit score recalculated for user ${userId}: ${newScore} (Reason: ${reason})`);
      return creditScore;
      
    } catch (error) {
      console.error('❌ Error recalculating credit score:', error);
      throw error;
    }
  }
  
  // Batch recalculation for multiple users
  async batchRecalculateCreditScores(userIds, reason = 'batch_update') {
    const results = {
      successful: 0,
      failed: 0,
      details: []
    };
    
    for (const userId of userIds) {
      try {
        await this.recalculateCreditScore(userId, reason);
        results.successful++;
        results.details.push({
          userId,
          status: 'success',
          message: 'Score updated'
        });
      } catch (error) {
        results.failed++;
        results.details.push({
          userId,
          status: 'failed',
          error: error.message
        });
      }
    }
    
    console.log(`📦 Batch recalculation completed: ${results.successful} successful, ${results.failed} failed`);
    return results;
  }
  
  // Trigger score update based on loan event
  async updateScoreFromLoanEvent(userId, loanEvent) {
    const reasons = {
      'loan_disbursed': 'new_loan_disbursed',
      'repayment_made': 'repayment_received',
      'repayment_missed': 'repayment_missed',
      'loan_completed': 'loan_successfully_completed',
      'loan_defaulted': 'loan_defaulted'
    };
    
    const reason = reasons[loanEvent] || 'loan_activity';
    return await this.recalculateCreditScore(userId, reason);
  }
  
  // Get credit score breakdown
  async getScoreBreakdown(userId) {
    try {
      const creditScore = await CreditScore.findOne({ userId })
        .populate('userId', 'name email phone customerType occupation');
      
      if (!creditScore) {
        return { error: 'Credit score not found' };
      }
      
      // Fetch recent loans for context
      const recentLoans = await Loan.find({ userId: userId.toString() })
        .sort({ createdAt: -1 })
        .limit(5);
      
      // Get AI analysis for current state
      const user = await User.findById(userId).lean();
      const aiAssessment = await AIService.analyzeInformalSectorCredit({
        clientId: userId,
        occupation: user.occupation,
        customerType: user.customerType,
        monthlyIncome: user.monthlyIncome
      });
      
      return {
        userId,
        currentScore: creditScore.score,
        riskLevel: creditScore.riskLevel,
        lastUpdated: creditScore.lastUpdated,
        
        // Score components
        components: {
          aiAssessment: aiAssessment.comprehensiveScore || aiAssessment.riskScore,
          paymentHistory: creditScore.factors.paymentHistory,
          creditUtilization: creditScore.factors.creditUtilization,
          loanPerformance: {
            activeLoans: creditScore.loanPerformance.activeLoans,
            completedLoans: creditScore.loanPerformance.completedLoans,
            defaultedLoans: creditScore.loanPerformance.defaultedLoans,
            onTimePayments: creditScore.loanPerformance.onTimePayments
          }
        },
        
        // Trends
        historicalScores: creditScore.previousScores,
        scoreChange: creditScore.previousScores.length > 1 ? 
          creditScore.score - creditScore.previousScores[creditScore.previousScores.length - 2].score : 0,
        
        // Context
        userProfile: {
          name: user.name,
          customerType: user.customerType,
          occupation: user.occupation,
          monthlyIncome: user.monthlyIncome
        },
        
        recentLoanActivity: recentLoans.map(loan => ({
          loanId: loan.loanId,
          amount: loan.amount,
          status: loan.status,
          disbursementDate: loan.disbursementDate
        })),
        
        recommendations: this.generateRecommendations(creditScore, aiAssessment)
      };
      
    } catch (error) {
      console.error('❌ Error getting score breakdown:', error);
      throw error;
    }
  }
  
  // Generate personalized recommendations
  generateRecommendations(creditScore, aiAssessment) {
    const recommendations = [];
    
    if (creditScore.score < 600) {
      recommendations.push({
        priority: 'high',
        action: 'improve_payment_history',
        message: 'Focus on making timely payments on existing obligations'
      });
    }
    
    if (creditScore.loanPerformance.defaultedLoans > 0) {
      recommendations.push({
        priority: 'high',
        action: 'resolve_defaults',
        message: 'Clear any outstanding defaults to improve score significantly'
      });
    }
    
    if (creditScore.factors.creditUtilization > 80) {
      recommendations.push({
        priority: 'medium',
        action: 'reduce_credit_utilization',
        message: 'Try to keep credit utilization below 80%'
      });
    }
    
    if (aiAssessment?.informalSectorFactors) {
      aiAssessment.informalSectorFactors.forEach(factor => {
        recommendations.push({
          priority: 'low',
          action: 'sector_improvement',
          message: factor
        });
      });
    }
    
    return recommendations;
  }
  
  // Scheduled job for periodic score updates
  async scheduledScoreUpdates(days = 30) {
    try {
      console.log(`⏰ Starting scheduled credit score updates (older than ${days} days)`);
      
      const cutoffDate = new Date();
      cutoffDate.setDate(cutoffDate.getDate() - days);
      
      const usersNeedingUpdate = await CreditScore.find({
        lastUpdated: { $lt: cutoffDate },
        $or: [
          { 'loanPerformance.activeLoans': { $gt: 0 } },
          { 'loanPerformance.completedLoans': { $gt: 0 } }
        ]
      }).limit(100); // Limit batch size for safety
      
      const userIds = usersNeedingUpdate.map(score => score.userId);
      
      if (userIds.length > 0) {
        return await this.batchRecalculateCreditScores(userIds, 'scheduled_update');
      }
      
      return {
        successful: 0,
        failed: 0,
        message: 'No users needed updates'
      };
      
    } catch (error) {
      console.error('❌ Error in scheduled score updates:', error);
      throw error;
    }
  }
}

export default new CreditScoreService();