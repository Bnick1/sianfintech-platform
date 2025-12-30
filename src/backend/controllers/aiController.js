// controllers/aiController.js
import AIService from '../services/AIService.js';

class AIController {
  async assessCreditRisk(req, res) {
    try {
      const { 
        occupation, 
        customerType, 
        monthlyIncome, 
        businessType, 
        location,
        transactionHistory,
        mobileMoneyUsage 
      } = req.body;

      if (!occupation && !customerType) {
        return res.status(400).json({
          success: false,
          error: 'Occupation or customer type is required'
        });
      }

      console.log(`🤖 AI Assessment requested for: ${customerType || occupation}`);

      // Enhanced AI analysis for all informal sector segments
      const assessment = await AIService.analyzeCreditRisk({
        occupation: occupation?.toLowerCase(),
        customerType,
        monthlyIncome,
        businessType,
        location,
        transactionHistory,
        mobileMoneyUsage
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
  }

  async assessFarmerCreditRisk(req, res) {
    try {
      const farmerData = req.body;
      
      if (!farmerData.cropType) {
        return res.status(400).json({ 
          success: false, 
          error: 'Crop type is required for farmer assessment' 
        });
      }

      console.log(`🌱 Farmer Assessment for: ${farmerData.cropType} in ${farmerData.region}`);
      
      const assessment = await AIService.analyzeFarmerCreditRisk(farmerData);
      
      res.json({
        success: true,
        ...assessment
      });

    } catch (error) {
      console.error('Farmer Assessment Error:', error);
      res.status(500).json({ 
        success: false, 
        error: 'Farmer assessment service unavailable' 
      });
    }
  }

  async assessBusinessCreditRisk(req, res) {
    try {
      const businessData = req.body;
      
      if (!businessData.businessType) {
        return res.status(400).json({ 
          success: false, 
          error: 'Business type is required for business assessment' 
        });
      }

      console.log(`🏪 Business Assessment for: ${businessData.businessType}`);
      
      const assessment = await AIService.analyzeBusinessCreditRisk(businessData);
      
      res.json({
        success: true,
        ...assessment
      });

    } catch (error) {
      console.error('Business Assessment Error:', error);
      res.status(500).json({ 
        success: false, 
        error: 'Business assessment service unavailable' 
      });
    }
  }

  async assessGigWorkerRisk(req, res) {
    try {
      const gigWorkerData = req.body;
      
      if (!gigWorkerData.gigType) {
        return res.status(400).json({ 
          success: false, 
          error: 'Gig type is required for gig worker assessment' 
        });
      }

      console.log(`🚗 Gig Worker Assessment for: ${gigWorkerData.gigType}`);
      
      const assessment = await AIService.analyzeGigWorkerRisk(gigWorkerData);
      
      res.json({
        success: true,
        ...assessment
      });

    } catch (error) {
      console.error('Gig Worker Assessment Error:', error);
      res.status(500).json({ 
        success: false, 
        error: 'Gig worker assessment service unavailable' 
      });
    }
  }

  async comprehensiveRiskAssessment(req, res) {
    try {
      const userData = req.body;
      
      if (!userData.customerType) {
        return res.status(400).json({ 
          success: false, 
          error: 'Customer type is required for comprehensive assessment' 
        });
      }

      console.log(`📊 Comprehensive Assessment for: ${userData.customerType}`);
      
      const assessment = await AIService.comprehensiveRiskAnalysis(userData);
      
      res.json({
        success: true,
        ...assessment
      });

    } catch (error) {
      console.error('Comprehensive Assessment Error:', error);
      res.status(500).json({ 
        success: false, 
        error: 'Comprehensive assessment service unavailable' 
      });
    }
  }

  async assessSocialCapital(req, res) {
    try {
      const { userId, communityData, references, socialConnections } = req.body;
      
      if (!userId) {
        return res.status(400).json({ 
          success: false, 
          error: 'User ID is required for social capital assessment' 
        });
      }

      console.log(`👥 Social Capital Assessment for user: ${userId}`);
      
      const socialScore = await AIService.analyzeSocialCapital({
        userId,
        communityData,
        references,
        socialConnections
      });
      
      res.json({
        success: true,
        socialScore,
        recommendation: socialScore > 70 ? 'strong_social_capital' : 
                       socialScore > 50 ? 'moderate_social_capital' : 'needs_improvement',
        factors: [
          'Community involvement',
          'Reference strength', 
          'Social network quality',
          'Historical repayment behavior'
        ]
      });

    } catch (error) {
      console.error('Social Capital Assessment Error:', error);
      res.status(500).json({ 
        success: false, 
        error: 'Social capital assessment service unavailable' 
      });
    }
  }

  async assessWeatherRisk(req, res) {
    try {
      const { location, cropType, season, historicalData } = req.body;
      
      if (!location || !cropType) {
        return res.status(400).json({ 
          success: false, 
          error: 'Location and crop type are required for weather risk assessment' 
        });
      }

      console.log(`🌦️ Weather Risk Assessment for: ${cropType} in ${location}`);
      
      const weatherRisk = await AIService.analyzeWeatherRisk({
        location,
        cropType,
        season,
        historicalData
      });
      
      res.json({
        success: true,
        ...weatherRisk
      });

    } catch (error) {
      console.error('Weather Risk Assessment Error:', error);
      res.status(500).json({ 
        success: false, 
        error: 'Weather risk assessment service unavailable' 
      });
    }
  }

  async calculateDynamicPricing(req, res) {
    try {
      const { customerType, riskScore, loanAmount, term, socialScore, weatherRisk } = req.body;
      
      if (riskScore === undefined || !loanAmount) {
        return res.status(400).json({ 
          success: false, 
          error: 'Risk score and loan amount are required for dynamic pricing' 
        });
      }

      console.log(`💰 Dynamic Pricing Calculation for risk score: ${riskScore}`);
      
      const pricing = await AIService.calculateDynamicPricing({
        customerType,
        riskScore,
        loanAmount,
        term,
        socialScore,
        weatherRisk
      });
      
      res.json({
        success: true,
        ...pricing
      });

    } catch (error) {
      console.error('Dynamic Pricing Error:', error);
      res.status(500).json({ 
        success: false, 
        error: 'Dynamic pricing service unavailable' 
      });
    }
  }

  async analyzePortfolioRisk(req, res) {
    try {
      const portfolioData = req.body;
      
      if (!portfolioData.loans || !portfolioData.customerSegments) {
        return res.status(400).json({ 
          success: false, 
          error: 'Loans and customer segments data are required for portfolio analysis' 
        });
      }

      console.log(`📈 Portfolio Risk Analysis for ${portfolioData.loans.length} loans`);
      
      const analysis = await AIService.analyzePortfolioRisk(portfolioData);
      
      res.json({
        success: true,
        ...analysis
      });

    } catch (error) {
      console.error('Portfolio Risk Analysis Error:', error);
      res.status(500).json({ 
        success: false, 
        error: 'Portfolio risk analysis service unavailable' 
      });
    }
  }

  // Enhanced predict method with customer type support
  async predict(req, res) {
    try {
      const { occupation, businessType, location, monthlyVolume, customerType } = req.body;
      
      // Enhanced prediction with customer type consideration
      let baseRiskScore;
      
      switch(customerType) {
        case 'small_business':
          baseRiskScore = 45 + (Math.random() * 25);
          break;
        case 'gig_worker':
          baseRiskScore = 50 + (Math.random() * 30);
          break;
        case 'farmer':
          baseRiskScore = 40 + (Math.random() * 35);
          break;
        case 'informal_trader':
          baseRiskScore = 55 + (Math.random() * 25);
          break;
        default:
          baseRiskScore = 50 + (Math.random() * 30);
      }
      
      const riskScore = Math.min(Math.max(Math.round(baseRiskScore), 20), 80);

      res.status(200).json({
        status: "success",
        prediction: {
          riskScore,
          recommendation: riskScore > 60 ? "approve" : riskScore > 40 ? "review" : "decline",
          maxLoanAmount: riskScore * 15000, // Increased for informal sector
          repaymentPeriod: riskScore > 70 ? "12 months" : "6 months",
          interestRate: riskScore > 70 ? 12 : riskScore > 50 ? 18 : 24,
          insuranceRequired: riskScore < 60,
          customerType: customerType || 'general'
        },
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        error: 'Prediction failed'
      });
    }
  }

  // Quick assessment for rapid screening
  async quickAssessment(req, res) {
    try {
      const { customerType, monthlyIncome, businessAge, location } = req.body;
      
      if (!customerType) {
        return res.status(400).json({ 
          success: false, 
          error: 'Customer type is required for quick assessment' 
        });
      }

      console.log(`⚡ Quick Assessment for: ${customerType}`);
      
      // Simple scoring based on basic parameters
      let score = 50;
      
      if (monthlyIncome > 1000000) score += 15;
      if (businessAge > 2) score += 10;
      if (location && location.includes('Kampala')) score += 5;
      
      const riskScore = Math.min(Math.max(score, 20), 80);

      res.json({
        success: true,
        riskScore,
        eligibility: riskScore > 40 ? 'eligible' : 'needs_review',
        nextSteps: riskScore > 40 ? 'proceed_with_full_application' : 'provide_additional_documentation',
        estimatedLimit: riskScore * 10000
      });

    } catch (error) {
      console.error('Quick Assessment Error:', error);
      res.status(500).json({ 
        success: false, 
        error: 'Quick assessment service unavailable' 
      });
    }
  }

  // Batch processing for multiple applicants
  async batchAssessment(req, res) {
    try {
      const { applicants } = req.body;
      
      if (!applicants || !Array.isArray(applicants) || applicants.length === 0) {
        return res.status(400).json({ 
          success: false, 
          error: 'Applicants array is required for batch assessment' 
        });
      }

      if (applicants.length > 50) {
        return res.status(400).json({ 
          success: false, 
          error: 'Batch processing limited to 50 applicants at once' 
        });
      }

      console.log(`📦 Batch Assessment for ${applicants.length} applicants`);
      
      const results = [];
      for (const applicant of applicants) {
        try {
          const assessment = await AIService.analyzeCreditRisk(applicant);
          results.push({
            applicantId: applicant.userId || applicant.email,
            ...assessment,
            status: 'processed'
          });
        } catch (error) {
          results.push({
            applicantId: applicant.userId || applicant.email,
            error: 'Processing failed',
            status: 'failed'
          });
        }
      }

      res.json({
        success: true,
        processed: results.filter(r => r.status === 'processed').length,
        failed: results.filter(r => r.status === 'failed').length,
        results
      });

    } catch (error) {
      console.error('Batch Assessment Error:', error);
      res.status(500).json({ 
        success: false, 
        error: 'Batch assessment service unavailable' 
      });
    }
  }

  // NEW: Informal sector comprehensive assessment
  async informalSectorAssessment(req, res) {
    try {
      const {
        occupation,
        transactionHistory,
        mobileMoneyData,
        socialData,
        sectorData,
        locationData,
        clientId
      } = req.body;

      if (!occupation) {
        return res.status(400).json({ 
          success: false, 
          error: 'Occupation is required for informal sector assessment' 
        });
      }

      console.log(`🏪 Informal Sector Assessment for: ${occupation}`);
      
      const assessment = await AIService.analyzeInformalSectorCredit({
        clientId,
        occupation,
        transactionHistory,
        mobileMoneyData,
        socialData,
        sectorData,
        locationData
      });
      
      res.json({
        success: true,
        assessmentType: 'informal_sector_comprehensive',
        ...assessment
      });

    } catch (error) {
      console.error('Informal Sector Assessment Error:', error);
      res.status(500).json({ 
        success: false, 
        error: 'Informal sector assessment service unavailable' 
      });
    }
  }

  // NEW: Sector-specific risk analysis
  async sectorRiskAnalysis(req, res) {
    try {
      const { occupation } = req.params;
      const { season, region } = req.query;

      if (!occupation) {
        return res.status(400).json({ 
          success: false, 
          error: 'Occupation is required for sector risk analysis' 
        });
      }

      console.log(`📊 Sector Risk Analysis for: ${occupation}`);
      
      const sectorRisk = AIService.analyzeSectorRisk({
        season,
        region
      }, occupation);
      
      res.json({
        success: true,
        occupation,
        ...sectorRisk
      });

    } catch (error) {
      console.error('Sector Risk Analysis Error:', error);
      res.status(500).json({ 
        success: false, 
        error: 'Sector risk analysis service unavailable' 
      });
    }
  }

  // NEW: Batch informal sector assessment
  async batchInformalAssessment(req, res) {
    try {
      const { clients } = req.body;
      
      if (!clients || !Array.isArray(clients)) {
        return res.status(400).json({ 
          success: false, 
          error: 'Clients array is required for batch informal assessment' 
        });
      }

      if (clients.length > 50) {
        return res.status(400).json({ 
          success: false, 
          error: 'Batch processing limited to 50 clients at once' 
        });
      }

      console.log(`📦 Batch Informal Assessment for ${clients.length} clients`);
      
      const results = await Promise.all(
        clients.map(client => 
          AIService.analyzeInformalSectorCredit(client).catch(error => ({
            error: error.message,
            clientId: client.clientId,
            status: 'failed'
          }))
        )
      );

      res.json({
        success: true,
        processed: results.filter(r => !r.error).length,
        failed: results.filter(r => r.error).length,
        results
      });

    } catch (error) {
      console.error('Batch Informal Assessment Error:', error);
      res.status(500).json({ 
        success: false, 
        error: 'Batch informal assessment service unavailable' 
      });
    }
  }
}

export default new AIController();