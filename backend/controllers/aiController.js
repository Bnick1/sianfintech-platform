import AIService from '../services/AIService.js';

class AIController {
  async assessCreditRisk(req, res) {
    try {
      const { occupation } = req.body;

      if (!occupation) {
        return res.status(400).json({
          success: false,
          error: 'Occupation is required'
        });
      }

      console.log(`🤖 AI Assessment requested for: ${occupation}`);

      // Enhanced AI analysis
      const assessment = await AIService.analyzeCreditRisk(occupation.toLowerCase());
      
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
  // Keep your existing predict method for compatibility
  async predict(req, res) {
    try {
      const { occupation, businessType, location, monthlyVolume } = req.body;
      const riskScore = Math.min(Math.max(Math.round(50 + Math.random() * 30), 20), 80);

      res.status(200).json({
        status: "success",
        prediction: {
          riskScore,
          recommendation: riskScore > 60 ? "approve" : "review",
          maxLoanAmount: riskScore * 10000,
          repaymentPeriod: "6 months",
        },
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        error: 'Prediction failed'
      });
    }
  }
}

export default new AIController();