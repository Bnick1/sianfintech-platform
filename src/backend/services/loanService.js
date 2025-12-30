// services/loanService.js - ES Module version
import Loan from '../models/loanModel.js';
import Farmer from '../models/farmerModel.js';
import User from '../models/User.js';
import { MobileMoneyService } from './mobileMoneyService.js';
const mobileMoneyService = new MobileMoneyService();

async function applyLoan({ body }) {
  const { 
    userId, 
    farmerId, 
    amount, 
    termMonths, 
    purpose, 
    interestRate,
    cropType,
    purposeDescription,
    season,
    expectedHarvestDate,
    disbursementMethod,
    disbursementAccount,
    mobileMoneyNumber
  } = body;
  
  if (!userId || !amount || !farmerId) { 
    throw { status: 400, message: 'Missing userId, amount, or farmerId' };
  }

  // Calculate default interest rate if not provided
  const calculatedInterestRate = interestRate || 15; // Default 15%

  // Calculate AI Risk Score before creating loan
  const riskAssessment = await calculateRiskScore(farmerId, body);
  
  // Generate repayment schedule based on harvest date
  const repaymentSchedule = await generateRepaymentSchedule({
    amount,
    termMonths,
    interestRate: calculatedInterestRate,
    expectedHarvestDate,
    purpose
  });

  const loan = new Loan({
    userId,
    farmerId,
    amount,
    termMonths,
    purpose,
    interestRate: calculatedInterestRate,
    cropType,
    purposeDescription,
    season,
    expectedHarvestDate,
    disbursementMethod: disbursementMethod || 'sian_wallet',
    disbursementAccount,
    walletIntegration: {
      mobileMoneyNumber: mobileMoneyNumber || disbursementAccount
    },
    riskAssessment,
    repaymentSchedule,
    status: riskAssessment.approvalProbability >= 70 ? 'under_review' : 'submitted',
    aiRecommendation: getAIRecommendation(riskAssessment.creditScore)
  });

  const saved = await loan.save();
  
  // If high probability, auto-approve for small amounts
  if (riskAssessment.approvalProbability >= 85 && amount <= 1000000) {
    await autoApproveLoan(saved._id);
    const updatedLoan = await Loan.findById(saved._id);
    return {
      status: 'success',
      message: 'Loan application approved automatically',
      loan: updatedLoan,
      autoApproved: true
    };
  }

  return {
    status: 'success',
    message: 'Loan application submitted successfully',
    loan: saved,
    riskLevel: riskAssessment.riskLevel,
    approvalProbability: riskAssessment.approvalProbability
  };
}

async function getLoanById({ params }) {
  const { id } = params;
  const loan = await Loan.findById(id)
    .populate('farmerId', 'name location soilQuality farmSize')
    .populate('userId', 'firstName lastName email');
  
  if (!loan) throw { status: 404, message: 'Loan not found' };
  
  return { 
    status: 'success', 
    loan,
    walletBalance: loan.walletBalance,
    performanceStatus: loan.performanceStatus
  };
}

// Process loan repayment via mobile money
async function processLoanRepayment(loanId, repaymentData) {
  try {
    const loan = await Loan.findById(loanId);
    if (!loan) {
      throw { status: 404, message: 'Loan not found' };
    }

    const { phoneNumber, amount, reference } = repaymentData;

    // Process repayment via MTN
    const paymentResult = await mobileMoneyService.initiateMTNCollection(
      phoneNumber,
      amount,
      reference,
      `Loan Repayment - ${loan.loanId}`
    );

    if (paymentResult.success) {
      // Update loan with repayment
      await loan.addWalletTransaction({
        type: 'repayment',
        amount: amount,
        status: paymentResult.status,
        mobileMoneyRef: reference,
        metadata: paymentResult
      });

      // Update repayment schedule
      const nextInstallment = loan.repaymentSchedule.find(
        installment => installment.status === 'pending'
      );
      
      if (nextInstallment) {
        nextInstallment.amountPaid = amount;
        nextInstallment.paymentDate = new Date();
        nextInstallment.paymentMethod = 'mobile_money';
        nextInstallment.paymentReference = reference;
        nextInstallment.status = 'paid';
        
        loan.totalRepaid += amount;
        await loan.save();
      }

      return {
        status: 'success',
        message: 'Repayment processed successfully',
        loan,
        payment: paymentResult
      };
    } else {
      throw { status: 400, message: paymentResult.error };
    }

  } catch (error) {
    console.error('Repayment processing error:', error);
    throw { status: error.status || 500, message: error.message };
  }
}

// AI Risk Scoring Algorithm
async function calculateRiskScore(farmerId, loanData) {
  try {
    const farmer = await Farmer.findById(farmerId);
    const user = await User.findOne({ userId: loanData.userId });
    const previousLoans = await Loan.find({ farmerId, status: { $in: ['completed', 'active', 'defaulted'] } });
    
    let creditScore = 500; // Base score
    
    // 1. Farmer Data Factors (30%)
    if (farmer) {
      // Soil quality impact
      if (farmer.soilQuality === 'high') creditScore += 50;
      else if (farmer.soilQuality === 'medium') creditScore += 25;
      
      // Farm size consideration
      if (farmer.farmSize > 5) creditScore += 20; // Larger farms = more stable
      
      // Historical yield data
      if (farmer.averageYield && farmer.averageYield > farmer.expectedYield * 0.8) {
        creditScore += 30;
      }
    }
    
    // 2. Loan Amount Factors (20%)
    const amountToIncomeRatio = loanData.amount / (farmer?.expectedRevenue || loanData.amount * 2);
    if (amountToIncomeRatio < 0.3) creditScore += 40;
    else if (amountToIncomeRatio < 0.6) creditScore += 20;
    else creditScore -= 30;
    
    // 3. Previous Loan Performance (25%)
    if (previousLoans.length > 0) {
      const completedLoans = previousLoans.filter(loan => loan.status === 'completed');
      const defaultedLoans = previousLoans.filter(loan => loan.status === 'defaulted');
      
      const completionRate = completedLoans.length / previousLoans.length;
      const defaultRate = defaultedLoans.length / previousLoans.length;
      
      if (completionRate >= 0.8) creditScore += 60;
      else if (completionRate >= 0.5) creditScore += 30;
      
      if (defaultRate > 0.3) creditScore -= 50;
    } else {
      // First-time borrower - moderate risk
      creditScore += 10;
    }
    
    // 4. Crop Type Risk (15%)
    const cropRisk = getCropRiskFactor(loanData.cropType);
    creditScore += cropRisk;
    
    // 5. Season and Timing (10%)
    const seasonRisk = getSeasonRiskFactor(loanData.season, loanData.expectedHarvestDate);
    creditScore += seasonRisk;
    
    // Cap the score between 300-850
    creditScore = Math.max(300, Math.min(850, creditScore));
    
    // Calculate additional risk metrics
    const riskLevel = creditScore >= 700 ? 'low' : creditScore >= 500 ? 'medium' : 'high';
    const approvalProbability = Math.min(100, Math.max(0, (creditScore - 300) / 5.5));
    const repaymentLikelihood = calculateRepaymentLikelihood(creditScore, loanData, previousLoans);
    
    return {
      creditScore: Math.round(creditScore),
      riskLevel,
      approvalProbability: Math.round(approvalProbability),
      repaymentLikelihood: Math.round(repaymentLikelihood),
      behavioralScore: calculateBehavioralScore(user, farmer),
      transactionConsistency: calculateTransactionConsistency(previousLoans),
      incomeStability: calculateIncomeStability(farmer, previousLoans),
      lastUpdated: new Date()
    };
    
  } catch (error) {
    console.error('Risk scoring error:', error);
    // Return default risk assessment if scoring fails
    return {
      creditScore: 500,
      riskLevel: 'medium',
      approvalProbability: 50,
      repaymentLikelihood: 70,
      behavioralScore: 50,
      transactionConsistency: 50,
      incomeStability: 50,
      lastUpdated: new Date()
    };
  }
}

// Generate AI-driven repayment schedule
async function generateRepaymentSchedule({ amount, termMonths, interestRate, expectedHarvestDate, purpose }) {
  const schedule = [];
  const monthlyInterestRate = interestRate / 100 / 12;
  
  // For agricultural loans, align with harvest cycles
  if (purpose.includes('crop') && expectedHarvestDate) {
    const harvestDate = new Date(expectedHarvestDate);
    const principal = amount;
    const totalInterest = principal * monthlyInterestRate * termMonths;
    const totalAmount = principal + totalInterest;
    
    // Single bullet payment after harvest for crop production
    schedule.push({
      installmentNumber: 1,
      dueDate: harvestDate,
      amountDue: totalAmount,
      principalAmount: principal,
      interestAmount: totalInterest,
      harvestLinked: true,
      status: 'pending'
    });
  } else {
    // Standard monthly amortization for non-crop loans
    const monthlyPayment = amount * monthlyInterestRate * Math.pow(1 + monthlyInterestRate, termMonths) / 
                          (Math.pow(1 + monthlyInterestRate, termMonths) - 1);
    
    let remainingPrincipal = amount;
    const startDate = new Date();
    
    for (let i = 1; i <= termMonths; i++) {
      const interestAmount = remainingPrincipal * monthlyInterestRate;
      const principalAmount = monthlyPayment - interestAmount;
      
      const dueDate = new Date(startDate);
      dueDate.setMonth(dueDate.getMonth() + i);
      
      schedule.push({
        installmentNumber: i,
        dueDate,
        amountDue: monthlyPayment,
        principalAmount,
        interestAmount,
        harvestLinked: false,
        status: 'pending'
      });
      
      remainingPrincipal -= principalAmount;
    }
  }
  
  return schedule;
}

// Helper functions for risk scoring
function getCropRiskFactor(cropType) {
  const cropRiskMap = {
    'coffee': 30,    // Stable, high value
    'tea': 25,       // Stable
    'maize': 10,     // Moderate
    'beans': 15,     // Moderate
    'banana': 20,    // Stable
    'cassava': 5,    // Volatile pricing
    'rice': 15,      // Moderate
    'sorghum': 0     // Higher risk
  };
  
  return cropRiskMap[cropType?.toLowerCase()] || 0;
}

function getSeasonRiskFactor(season, expectedHarvestDate) {
  if (!expectedHarvestDate) return 0;
  
  const harvestDate = new Date(expectedHarvestDate);
  const now = new Date();
  const monthsToHarvest = (harvestDate - now) / (1000 * 60 * 60 * 24 * 30);
  
  if (monthsToHarvest > 12) return -20; // Too long-term
  if (monthsToHarvest < 3) return -10;  // Too short-term
  if (monthsToHarvest >= 6 && monthsToHarvest <= 9) return 20; // Ideal 6-9 months
  
  return 0;
}

function calculateRepaymentLikelihood(creditScore, loanData, previousLoans) {
  let likelihood = 70; // Base likelihood
  
  // Adjust based on credit score
  likelihood += (creditScore - 500) / 10;
  
  // Adjust based on loan amount (smaller loans = higher repayment)
  if (loanData.amount <= 500000) likelihood += 15;
  else if (loanData.amount >= 2000000) likelihood -= 10;
  
  // Adjust based on previous performance
  if (previousLoans.length > 0) {
    const goodLoans = previousLoans.filter(loan => 
      loan.performanceStatus === 'excellent' || loan.performanceStatus === 'good'
    ).length;
    const performanceRate = goodLoans / previousLoans.length;
    likelihood += performanceRate * 30;
  }
  
  return Math.max(0, Math.min(100, likelihood));
}

function calculateBehavioralScore(user, farmer) {
  let score = 50;
  
  if (user?.createdAt) {
    const accountAge = (new Date() - new Date(user.createdAt)) / (1000 * 60 * 60 * 24 * 30); // months
    score += Math.min(30, accountAge * 2); // Older accounts = more reliable
  }
  
  if (farmer?.soilQuality === 'high') score += 20;
  
  return Math.max(0, Math.min(100, score));
}

function calculateTransactionConsistency(previousLoans) {
  if (previousLoans.length === 0) return 50;
  
  const onTimePayments = previousLoans.flatMap(loan => 
    loan.repaymentSchedule?.filter(payment => 
      payment.status === 'paid' && payment.paymentDate <= payment.dueDate
    ) || []
  ).length;
  
  const totalPayments = previousLoans.flatMap(loan => 
    loan.repaymentSchedule?.filter(payment => payment.status === 'paid') || []
  ).length;
  
  if (totalPayments === 0) return 50;
  
  return Math.round((onTimePayments / totalPayments) * 100);
}

function calculateIncomeStability(farmer, previousLoans) {
  let stability = 50;
  
  if (farmer?.expectedRevenue && farmer?.farmSize) {
    const revenuePerAcre = farmer.expectedRevenue / farmer.farmSize;
    if (revenuePerAcre > 500000) stability += 30; // High-value crops
    else if (revenuePerAcre > 200000) stability += 15;
  }
  
  // Multiple successful harvests indicate stability
  const successfulLoans = previousLoans.filter(loan => loan.status === 'completed').length;
  stability += Math.min(20, successfulLoans * 5);
  
  return Math.max(0, Math.min(100, stability));
}

function getAIRecommendation(creditScore) {
  if (creditScore >= 700) return 'approve';
  if (creditScore >= 600) return 'approve_with_conditions';
  if (creditScore >= 450) return 'review';
  return 'reject';
}

async function autoApproveLoan(loanId) {
  const loan = await Loan.findById(loanId);
  if (!loan) throw { status: 404, message: 'Loan not found' };
  
  loan.status = 'approved';
  loan.approvalDate = new Date();
  loan.aiRecommendation = 'approve';
  
  await loan.save();
  return loan;
}

// Process loan disbursement to wallet
async function disburseToWallet(loanId, walletTransaction) {
  const loan = await Loan.findById(loanId);
  if (!loan) throw { status: 404, message: 'Loan not found' };
  
  if (loan.status !== 'approved') {
    throw { status: 400, message: 'Loan must be approved before disbursement' };
  }
  
  // Add wallet transaction
  await loan.addWalletTransaction({
    type: 'disbursement',
    amount: loan.amount,
    status: 'completed',
    mobileMoneyRef: walletTransaction.reference,
    metadata: walletTransaction
  });
  
  // Update loan status
  loan.status = 'disbursed';
  loan.disbursementDate = new Date();
  loan.walletIntegration.disbursementWalletId = walletTransaction.walletId;
  
  await loan.save();
  
  return {
    status: 'success',
    message: 'Loan disbursed to wallet successfully',
    loan,
    transaction: walletTransaction
  };
}

// Process wallet repayment
async function processWalletRepayment(loanId, repaymentData) {
  const loan = await Loan.findById(loanId);
  if (!loan) throw { status: 404, message: 'Loan not found' };
  
  // Find the next due installment
  const nextInstallment = loan.repaymentSchedule.find(payment => 
    payment.status === 'pending' || payment.status === 'overdue'
  );
  
  if (!nextInstallment) {
    throw { status: 400, message: 'No pending installments found' };
  }
  
  // Add wallet transaction
  await loan.addWalletTransaction({
    type: 'repayment',
    amount: repaymentData.amount,
    status: 'completed',
    mobileMoneyRef: repaymentData.reference,
    metadata: repaymentData
  });
  
  // Update installment status
  nextInstallment.amountPaid = repaymentData.amount;
  nextInstallment.paymentDate = new Date();
  nextInstallment.paymentMethod = 'wallet';
  nextInstallment.paymentReference = repaymentData.reference;
  nextInstallment.walletTransactionId = repaymentData.transactionId;
  nextInstallment.status = repaymentData.amount >= nextInstallment.amountDue ? 'paid' : 'partial';
  
  // Update total repaid
  loan.totalRepaid += repaymentData.amount;
  
  // Update loan status if all installments are paid
  const pendingInstallments = loan.repaymentSchedule.filter(p => p.status === 'pending');
  if (pendingInstallments.length === 0) {
    loan.status = 'completed';
  }
  
  await loan.save();
  
  return {
    status: 'success',
    message: 'Repayment processed successfully',
    loan,
    installment: nextInstallment
  };
}

export { 
  applyLoan, 
  getLoanById, 
  calculateRiskScore,
  disburseToWallet,
  processWalletRepayment,
  processLoanRepayment,
  autoApproveLoan
};
