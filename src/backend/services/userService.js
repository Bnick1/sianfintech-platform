// services/userService.js
import mongoose from "mongoose";
import User from "../models/User.js";
import AIService from "./AIService.js";

// FIX: Import userService for self-reference
const userService = {
  createUser: async (data) => {
    const { 
      name, 
      email, 
      phone, 
      customerType, 
      occupation, 
      monthlyIncome, 
      businessType,
      location,
      mobileMoneyProvider,
      nationalId,
      password,
      role, // ADDED: Role from request data
      
      // NEW: Informal sector data
      occupationProfile,
      financialProfile,
      socialCapital,
      locationContext,
      idType = 'national_id'
    } = data;

    // Enhanced validation for Uganda - National ID is primary
    if (!name || !nationalId || !password) {
      throw new Error('Name, National ID and Password are required');
    }

    // Check for duplicate National ID (primary identifier in Uganda)
    const existingUserById = await User.findOne({ 
      nationalId,
      idType 
    });
    if (existingUserById) {
      throw new Error('National ID already registered in our system');
    }

    // Also check for duplicate phone as secondary verification
    if (phone) {
      const existingUserByPhone = await User.findOne({ phone });
      if (existingUserByPhone) {
        throw new Error('Phone number already registered to another user');
      }
    }

    // Generate wallet ID and digital ID
    const walletId = `W${Date.now()}${Math.random().toString(36).substr(2, 6)}`.toUpperCase();
    const digitalId = `UID${Date.now()}${Math.random().toString(36).substr(2, 6)}`.toUpperCase();

    // FIX: Determine user role - default to 'member' if not specified
    const userRole = role || 'member'; // PERMANENT FIX: Default to member

    // Create user with enhanced Uganda-specific data
    const user = new User({
      name,
      email,
      phone,
      customerType: customerType || 'informal_trader',
      occupation,
      monthlyIncome,
      businessType,
      location,
      mobileMoneyProvider,
      nationalId,
      idType,
      walletId,
      digitalId,
      password,
      role: userRole, // PERMANENT FIX: Role is now explicitly set
      isVerified: false,
      status: 'pending_verification',
      
      // NEW: Enhanced informal sector data
      occupationProfile: occupationProfile || {
        primaryOccupation: occupation,
        yearsInOccupation: 0,
        sectorSpecific: {}
      },
      financialProfile: financialProfile || {
        averageMonthlyIncome: monthlyIncome,
        incomeConsistency: 'stable',
        mobileMoneyUsage: {
          primaryProvider: mobileMoneyProvider?.toLowerCase(),
          averageMonthlyTransactions: 0,
          averageBalance: 0
        }
      },
      socialCapital: socialCapital || {
        communityInvolvement: {
          isCommunityMember: false,
          communityGroups: []
        },
        references: [],
        socialConnections: {
          familyInArea: false,
          localBusinessRelations: false
        },
        communityScore: 0
      },
      locationContext: locationContext || {
        region: location?.district,
        district: location?.district,
        subcounty: location?.subcounty,
        village: location?.village
      }
    });

    await user.save();
    
    // NEW: Trigger AI assessment for informal sector
    try {
      await userService.triggerInformalSectorAssessment(user._id);
    } catch (error) {
      console.log('AI assessment deferred:', error.message);
    }
    
    return user;
  },

  getUserById: async (id) => {
    return await User.findById(id);
  },

  deleteUser: async (id) => {
    return await User.findByIdAndDelete(id);
  },

  // Get user by National ID (primary identifier)
  getUserByNationalId: async (nationalId, idType = 'national_id') => {
    return await User.findOne({ 
      nationalId, 
      idType 
    });
  },

  // Get user by phone (secondary identifier)
  getUserByPhone: async (phone) => {
    const cleanPhone = phone.replace(/\D/g, '');
    return await User.findOne({ 
      $or: [
        { phone: cleanPhone },
        { phone: { $regex: cleanPhone.slice(-9) } }
      ]
    });
  },

  // Enhanced: Get user by both National ID and phone for verification
  getUserByIdentifiers: async (nationalId, phone, idType = 'national_id') => {
    return await User.findOne({
      $and: [
        { nationalId, idType },
        { phone: phone.replace(/\D/g, '') }
      ]
    });
  },

  // NEW: Enhanced update with informal sector data
  updateUserProfile: async (userId, profileData) => {
    const user = await User.findById(userId);
    if (!user) {
      throw new Error('User not found');
    }

    // Update allowed fields (excluding immutable National ID and role)
    const allowedUpdates = [
      'occupation', 'monthlyIncome', 'businessType', 'location', 
      'customerType', 'mobileMoneyProvider', 'phone',
      'occupationProfile', 'financialProfile', 'socialCapital', 'locationContext'
    ];
    
    allowedUpdates.forEach(field => {
      if (profileData[field] !== undefined) {
        user[field] = profileData[field];
      }
    });

    await user.save();
    
    // Trigger AI reassessment if significant profile changes
    if (profileData.occupationProfile || profileData.financialProfile) {
      try {
        await userService.triggerInformalSectorAssessment(userId);
      } catch (error) {
        console.log('AI reassessment deferred:', error.message);
      }
    }
    
    return user;
  },

  // Enhanced KYC verification with Uganda focus
  verifyUser: async (userId, verificationData) => {
    const user = await User.findById(userId);
    if (!user) {
      throw new Error('User not found');
    }

    user.verificationStatus = {
      identity: verificationData.identityVerified || false,
      location: verificationData.locationVerified || false,
      biometric: verificationData.biometricVerified || false,
      nationalId: verificationData.nationalIdVerified || false
    };

    // National ID verification is critical in Uganda
    user.idVerified = verificationData.nationalIdVerified || false;
    user.idVerificationDate = user.idVerified ? new Date() : null;

    user.isVerified = Object.values(user.verificationStatus).every(status => status);
    user.status = user.isVerified ? 'active' : 'pending_verification';

    await user.save();
    return user;
  },

  // Get users by customer type for segmentation
  getUsersByCustomerType: async (customerType) => {
    return await User.find({ customerType, status: 'active' });
  },

  // NEW: Enhanced credit score update with comprehensive scoring
  updateCreditScore: async (userId, creditScore, riskFactors = [], comprehensiveData = {}) => {
    const user = await User.findById(userId);
    if (!user) {
      throw new Error('User not found');
    }

    user.creditScore = creditScore;
    user.aiRiskFactors = riskFactors;
    
    // Update comprehensive scores if provided
    if (comprehensiveData.comprehensiveScore) {
      user.comprehensiveScore = comprehensiveData.comprehensiveScore;
    }
    if (comprehensiveData.behavioralScore) {
      user.behavioralScore = comprehensiveData.behavioralScore;
    }
    if (comprehensiveData.sectorRiskScore) {
      user.sectorRiskScore = comprehensiveData.sectorRiskScore;
    }
    if (comprehensiveData.sectorRiskProfile) {
      user.sectorRiskProfile = comprehensiveData.sectorRiskProfile;
    }

    user.riskCategory = 
      creditScore >= 750 ? 'low' :
      creditScore >= 650 ? 'medium' :
      creditScore >= 550 ? 'high' : 'very_high';

    await user.save();
    return user;
  },

  // NEW: Search users by multiple Uganda-specific criteria
  searchUsers: async (criteria) => {
    const { nationalId, phone, name, location, customerType, occupation, role } = criteria; // ADDED: role
    const query = {};
    
    if (nationalId) query.nationalId = nationalId;
    if (phone) query.phone = { $regex: phone.replace(/\D/g, ''), $options: 'i' };
    if (name) query.name = { $regex: name, $options: 'i' };
    if (location) query['location.district'] = { $regex: location, $options: 'i' };
    if (customerType) query.customerType = customerType;
    if (occupation) query['occupationProfile.primaryOccupation'] = { $regex: occupation, $options: 'i' };
    if (role) query.role = role; // ADDED: Role filtering

    return await User.find(query);
  },

  // NEW: Get comprehensive user profile with enhanced data
  getComprehensiveProfile: async (userId) => {
    const user = await User.findById(userId);
    if (!user) {
      throw new Error('User not found');
    }

    // Convert to object to add virtuals
    const userObj = user.toObject();
    
    // Add comprehensive assessment data
    const comprehensiveData = {
      ...userObj,
      eligibilityStatus: user.eligibilityStatus,
      informalSectorStrength: user.informalSectorStrength,
      repaymentRate: user.repaymentRate,
      fullAddress: user.fullAddress
    };

    return comprehensiveData;
  },

  // NEW: Trigger informal sector AI assessment
  triggerInformalSectorAssessment: async (userId) => {
    const user = await User.findById(userId);
    if (!user) {
      throw new Error('User not found');
    }

    const assessmentData = {
      occupation: user.occupationProfile?.primaryOccupation || user.occupation,
      transactionHistory: {
        averageMonthlyIncome: user.financialProfile?.averageMonthlyIncome || user.monthlyIncome,
        consistency: user.behavioralData?.transactionConsistency / 100 || 0.7,
        repaymentRate: user.repaymentRate / 100 || 0.8
      },
      mobileMoneyData: {
        frequency: user.financialProfile?.mobileMoneyUsage?.transactionFrequency || 'weekly',
        averageBalance: user.financialProfile?.mobileMoneyUsage?.averageBalance || 0
      },
      socialData: {
        communityData: user.socialCapital?.communityInvolvement,
        references: user.socialCapital?.references,
        socialConnections: user.socialCapital?.socialConnections
      },
      locationData: {
        region: user.locationContext?.region || user.location?.district
      }
    };

    try {
      const assessment = await AIService.analyzeInformalSectorCredit(assessmentData);
      
      // Update user with comprehensive scores
      await userService.updateCreditScore(
        userId, 
        assessment.riskScore, 
        assessment.aiRiskFactors,
        {
          comprehensiveScore: assessment.comprehensiveScore,
          behavioralScore: assessment.behavioralBreakdown?.score,
          sectorRiskScore: assessment.sectorRisk?.score,
          sectorRiskProfile: assessment.sectorRisk
        }
      );

      return assessment;
    } catch (error) {
      console.error('AI assessment failed:', error);
      throw new Error('Failed to complete AI assessment');
    }
  },

  // NEW: Get users with comprehensive scoring for dashboard
  getUsersWithComprehensiveScores: async (filters = {}) => {
    const { customerType, minScore, maxScore, status, role } = filters; // ADDED: role
    const query = {};
    
    if (customerType) query.customerType = customerType;
    if (status) query.status = status;
    if (role) query.role = role; // ADDED: Role filtering
    if (minScore !== undefined || maxScore !== undefined) {
      query.comprehensiveScore = {};
      if (minScore !== undefined) query.comprehensiveScore.$gte = minScore;
      if (maxScore !== undefined) query.comprehensiveScore.$lte = maxScore;
    }

    return await User.find(query)
      .select('name phone customerType occupationProfile creditScore comprehensiveScore behavioralScore sectorRiskScore status role') // ADDED: role
      .sort({ comprehensiveScore: -1 })
      .limit(100);
  },

  // NEW: Update behavioral data
  updateBehavioralData: async (userId, behavioralData) => {
    const user = await User.findById(userId);
    if (!user) {
      throw new Error('User not found');
    }

    user.behavioralData = {
      ...user.behavioralData,
      ...behavioralData
    };

    await user.save();
    
    // Trigger reassessment
    try {
      await userService.triggerInformalSectorAssessment(userId);
    } catch (error) {
      console.log('Behavioral reassessment deferred:', error.message);
    }
    
    return user;
  },

  // NEW: Update social capital data
  updateSocialCapital: async (userId, socialData) => {
    const user = await User.findById(userId);
    if (!user) {
      throw new Error('User not found');
    }

    user.socialCapital = {
      ...user.socialCapital,
      ...socialData
    };

    await user.save();
    return user;
  },

  // NEW: Get user counts by role for dashboard
  getUserCountsByRole: async () => {
    const counts = await User.aggregate([
      {
        $group: {
          _id: '$role',
          count: { $sum: 1 }
        }
      }
    ]);
    
    return counts.reduce((acc, item) => {
      acc[item._id || 'unknown'] = item.count;
      return acc;
    }, {});
  },

  // NEW: Get all users with filtering and pagination for admin dashboard
  getAllUsers: async (filter = {}, page = 1, limit = 50) => {
    try {
      const skip = (page - 1) * limit;
      
      const users = await User.find(filter)
        .select('-password') // Exclude password
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean();
      
      return users.map(user => ({
        id: user._id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        role: user.role,
        status: user.status,
        tenantCode: user.tenantCode,
        memberId: user.digitalId || user.memberId,
        createdAt: user.createdAt,
        lastLogin: user.lastLogin,
        isVerified: user.isVerified
      }));
    } catch (error) {
      throw new Error(`Failed to fetch users: ${error.message}`);
    }
  },

  // NEW: Update user status
  updateUserStatus: async (userId, status) => {
    try {
      const user = await User.findByIdAndUpdate(
        userId,
        { status },
        { new: true }
      ).select('-password');
      
      if (!user) {
        throw new Error('User not found');
      }
      
      return {
        id: user._id,
        name: user.name,
        email: user.email,
        status: user.status
      };
    } catch (error) {
      throw new Error(`Failed to update user status: ${error.message}`);
    }
  },

  // NEW: Get user's loans
  getUserLoans: async (filter = {}) => {
    try {
      const Loan = (await import('../models/Loan.js')).default;
      const loans = await Loan.find(filter)
        .sort({ createdAt: -1 })
        .lean();
      
      return loans.map(loan => ({
        id: loan._id,
        amount: loan.principalAmount || loan.amount,
        status: loan.status,
        term: loan.term,
        purpose: loan.purpose,
        interestRate: loan.interestRate,
        applicantName: loan.applicantName,
        createdAt: loan.createdAt,
        updatedAt: loan.updatedAt
      }));
    } catch (error) {
      throw new Error(`Failed to fetch user loans: ${error.message}`);
    }
  },

  // NEW: Get user's investments
  getUserInvestments: async (filter = {}) => {
    try {
      const Investment = (await import('../models/Investment.js')).default;
      const investments = await Investment.find(filter)
        .sort({ createdAt: -1 })
        .lean();
      
      return investments.map(investment => ({
        id: investment._id,
        type: investment.type,
        amount: investment.amount,
        status: investment.status,
        duration: investment.duration,
        expectedReturn: investment.expectedReturn,
        clientName: investment.clientName,
        description: investment.description,
        createdAt: investment.createdAt
      }));
    } catch (error) {
      throw new Error(`Failed to fetch user investments: ${error.message}`);
    }
  }
};

export default userService;