// controllers/userController.js
import userService from "../services/userService.js";

export const registerUser = async (req, res) => {
  try {
    const user = await userService.createUser(req.body);
    res.status(201).json({
      status: "success",
      message: "User registered successfully",
      user: {
        id: user._id,
        digitalId: user.digitalId,
        walletId: user.walletId,
        name: user.name,
        phone: user.phone,
        customerType: user.customerType,
        occupation: user.occupationProfile?.primaryOccupation || user.occupation,
        status: user.status
      }
    });
  } catch (err) {
    res.status(500).json({
      status: "error",
      message: err.message
    });
  }
};

export const getUserById = async (req, res) => {
  try {
    const user = await userService.getUserById(req.params.id);
    if (!user) {
      return res.status(404).json({ status: "error", message: "User not found" });
    }
    res.status(200).json({ status: "success", user });
  } catch (err) {
    res.status(500).json({ status: "error", message: err.message });
  }
};

// NEW: Get comprehensive user profile
export const getComprehensiveProfile = async (req, res) => {
  try {
    const profile = await userService.getComprehensiveProfile(req.params.id);
    if (!profile) {
      return res.status(404).json({ status: "error", message: "User not found" });
    }
    res.status(200).json({ 
      status: "success", 
      profile,
      assessmentType: 'comprehensive_informal_sector'
    });
  } catch (err) {
    res.status(500).json({ status: "error", message: err.message });
  }
};

export const deleteUser = async (req, res) => {
  try {
    await userService.deleteUser(req.params.id);
    res.status(200).json({ status: "success", message: "User deleted" });
  } catch (err) {
    res.status(500).json({ status: "error", message: err.message });
  }
};

// Get user by phone
export const getUserByPhone = async (req, res) => {
  try {
    const user = await userService.getUserByPhone(req.params.phone);
    if (!user) {
      return res.status(404).json({ status: "error", message: "User not found" });
    }
    res.status(200).json({ status: "success", user });
  } catch (err) {
    res.status(500).json({ status: "error", message: err.message });
  }
};

// Enhanced: Update user profile with informal sector data
export const updateUserProfile = async (req, res) => {
  try {
    const user = await userService.updateUserProfile(req.params.id, req.body);
    res.status(200).json({ 
      status: "success", 
      message: "Profile updated successfully",
      user 
    });
  } catch (err) {
    res.status(500).json({ status: "error", message: err.message });
  }
};

// Verify user KYC
export const verifyUser = async (req, res) => {
  try {
    const user = await userService.verifyUser(req.params.id, req.body);
    res.status(200).json({ 
      status: "success", 
      message: user.isVerified ? "User verified successfully" : "Partial verification completed",
      user 
    });
  } catch (err) {
    res.status(500).json({ status: "error", message: err.message });
  }
};

// Get users by segment
export const getUsersBySegment = async (req, res) => {
  try {
    const users = await userService.getUsersByCustomerType(req.params.customerType);
    res.status(200).json({ 
      status: "success", 
      count: users.length,
      users 
    });
  } catch (err) {
    res.status(500).json({ status: "error", message: err.message });
  }
};

// NEW: Search users with comprehensive filters
export const searchUsers = async (req, res) => {
  try {
    const users = await userService.searchUsers(req.query);
    res.status(200).json({ 
      status: "success", 
      count: users.length,
      users 
    });
  } catch (err) {
    res.status(500).json({ status: "error", message: err.message });
  }
};

// NEW: Get users with comprehensive scores for dashboard
export const getUsersWithScores = async (req, res) => {
  try {
    const users = await userService.getUsersWithComprehensiveScores(req.query);
    res.status(200).json({ 
      status: "success", 
      count: users.length,
      users 
    });
  } catch (err) {
    res.status(500).json({ status: "error", message: err.message });
  }
};

// NEW: Trigger AI assessment for user
export const triggerAssessment = async (req, res) => {
  try {
    const assessment = await userService.triggerInformalSectorAssessment(req.params.id);
    res.status(200).json({ 
      status: "success", 
      message: "AI assessment completed",
      assessment 
    });
  } catch (err) {
    res.status(500).json({ status: "error", message: err.message });
  }
};

// NEW: Update behavioral data
export const updateBehavioralData = async (req, res) => {
  try {
    const user = await userService.updateBehavioralData(req.params.id, req.body);
    res.status(200).json({ 
      status: "success", 
      message: "Behavioral data updated",
      user 
    });
  } catch (err) {
    res.status(500).json({ status: "error", message: err.message });
  }
};

// NEW: Update social capital
export const updateSocialCapital = async (req, res) => {
  try {
    const user = await userService.updateSocialCapital(req.params.id, req.body);
    res.status(200).json({ 
      status: "success", 
      message: "Social capital updated",
      user 
    });
  } catch (err) {
    res.status(500).json({ status: "error", message: err.message });
  }
};

// NEW: Get all users with filtering for admin dashboard - UPDATED FORMAT
export const getAllUsers = async (req, res) => {
  try {
    const { 
      tenant, 
      status, 
      role, 
      page = 1, 
      limit = 50,
      search 
    } = req.query;

    const filter = {};
    
    // Filter by tenant
    if (tenant) {
      filter.tenantCode = tenant;
    }
    
    // Filter by status
    if (status && status !== 'all') {
      filter.status = status;
    }
    
    // Filter by role
    if (role && role !== 'all') {
      filter.role = role;
    }
    
    // Search by name, email, or phone
    if (search) {
      filter.$or = [
        { name: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
        { phone: { $regex: search, $options: 'i' } }
      ];
    }

    const users = await userService.getAllUsers(filter, parseInt(page), parseInt(limit));
    
    // Transform to match frontend expected format
    const formattedUsers = users.map(user => ({
      id: user._id?.toString(),
      _id: user._id?.toString(),
      name: user.name,
      email: user.email,
      phone: user.phone,
      role: user.role,
      status: user.status || 'active',
      tenantCode: user.tenantCode,
      occupation: user.occupation,
      memberId: user.memberNumber,
      createdAt: user.createdAt,
      lastLogin: user.lastLogin
    }));
    
    res.json({
      success: true,
      users: formattedUsers,
      total: formattedUsers.length,
      page: parseInt(page),
      limit: parseInt(limit)
    });
  } catch (err) {
    console.error('Get all users error:', err);
    res.status(500).json({ 
      success: false, 
      error: err.message 
    });
  }
};

// NEW: Get members specifically for admin dashboard
export const getMembers = async (req, res) => {
  try {
    const { tenant, status, search, page = 1, limit = 50 } = req.query;
    
    let filter = { 
      $or: [
        { role: 'member' },
        { role: 'client' },
        { userType: 'member' },
        { 'metadata.customerType': 'member' }
      ]
    };
    
    // Filter by tenant
    if (tenant) {
      filter.tenantCode = tenant;
    }
    
    // Filter by status
    if (status && status !== 'all') {
      filter.status = status;
    }
    
    // Search by name, email, phone, or member number
    if (search) {
      filter.$or = [
        ...filter.$or,
        { name: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
        { phone: { $regex: search, $options: 'i' } },
        { memberNumber: { $regex: search, $options: 'i' } },
        { 'metadata.gldmfMemNo': { $regex: search, $options: 'i' } }
      ];
    }

    const users = await userService.getAllUsers(filter, parseInt(page), parseInt(limit));
    
    // Transform to match frontend expected format
    const members = users.map(user => ({
      id: user._id?.toString(),
      _id: user._id?.toString(),
      name: user.name,
      email: user.email,
      phone: user.phone,
      role: user.role,
      status: user.status || 'active',
      tenantCode: user.tenantCode,
      occupation: user.occupation || user.occupationProfile?.primaryOccupation,
      memberId: user.memberNumber || user.metadata?.gldmfMemNo,
      createdAt: user.createdAt,
      lastLogin: user.lastLogin,
      totalLoans: user.loanCount || 0,
      activeLoans: user.activeLoanCount || 0,
      totalInvestment: user.totalInvestment || 0
    }));

    res.json({
      success: true,
      members: members,
      total: members.length,
      page: parseInt(page),
      limit: parseInt(limit)
    });
    
  } catch (err) {
    console.error('Get members error:', err);
    res.status(500).json({ 
      success: false, 
      error: err.message 
    });
  }
};

// NEW: Update user status (activate/suspend)
export const updateUserStatus = async (req, res) => {
  try {
    const { status } = req.body;
    const user = await userService.updateUserStatus(req.params.id, status);
    
    res.status(200).json({ 
      status: "success", 
      message: `User ${status} successfully`,
      user 
    });
  } catch (err) {
    res.status(500).json({ status: "error", message: err.message });
  }
};

// NEW: Get user's loans
export const getUserLoans = async (req, res) => {
  try {
    const { status } = req.query;
    const filter = { userId: req.params.id };
    
    if (status && status !== 'all') {
      filter.status = status;
    }
    
    const loans = await userService.getUserLoans(filter);
    
    res.status(200).json({ 
      status: "success", 
      count: loans.length,
      loans 
    });
  } catch (err) {
    res.status(500).json({ status: "error", message: err.message });
  }
};

// NEW: Get user's investments
export const getUserInvestments = async (req, res) => {
  try {
    const { status } = req.query;
    const filter = { userId: req.params.id };
    
    if (status && status !== 'all') {
      filter.status = status;
    }
    
    const investments = await userService.getUserInvestments(filter);
    
    res.status(200).json({ 
      status: "success", 
      count: investments.length,
      investments 
    });
  } catch (err) {
    res.status(500).json({ status: "error", message: err.message });
  }
};