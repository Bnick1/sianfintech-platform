// routes/userRoutes.js
import express from 'express';
import {
  registerUser,
  getUserById,
  getComprehensiveProfile,
  deleteUser,
  getUserByPhone,
  updateUserProfile,
  verifyUser,
  getUsersBySegment,
  searchUsers,
  getUsersWithScores,
  triggerAssessment,
  updateBehavioralData,
  updateSocialCapital,
  // NEW: Add these imports
  getAllUsers,
  updateUserStatus,
  getUserLoans,
  getUserInvestments,
  getMembers // ADD THIS IMPORT
} from '../controllers/userController.js';

const router = express.Router();

// Existing routes
router.post('/register', registerUser);
router.get('/:id', getUserById);
router.delete('/:id', deleteUser);
router.get('/phone/:phone', getUserByPhone);
router.put('/:id/profile', updateUserProfile);
router.put('/:id/verify', verifyUser);
router.get('/segment/:customerType', getUsersBySegment);

// NEW: Enhanced routes for detailed management
router.get('/', getAllUsers); // Get all users with filtering - /api/users?tenant=GLDMF
router.get('/members', getMembers); // ADD THIS - Get members specifically - /api/users/members?tenant=GLDMF
router.put('/:id/status', updateUserStatus); // Update user status
router.get('/:id/loans', getUserLoans); // Get user's loans
router.get('/:id/investments', getUserInvestments); // Get user's investments

// Enhanced routes for informal sector
router.get('/:id/comprehensive', getComprehensiveProfile);
router.get('/search/users', searchUsers);
router.get('/dashboard/with-scores', getUsersWithScores);
router.post('/:id/assess', triggerAssessment);
router.put('/:id/behavioral', updateBehavioralData);
router.put('/:id/social-capital', updateSocialCapital);

// TEMPORARY DEBUG ROUTE - REMOVE AFTER USE
router.get('/debug/counts', async (req, res) => {
  try {
    // Use dynamic import for ES6 modules
    const User = (await import('../models/User.js')).default;
    
    const totalUsers = await User.countDocuments();
    const members = await User.countDocuments({ role: 'member' });
    const staff = await User.countDocuments({ role: 'staff' });
    const gldmfStaff = await User.countDocuments({ role: 'gldmf_staff' });
    const sianStaff = await User.countDocuments({ role: 'sian_staff' });
    
    res.json({
      success: true,
      counts: {
        totalUsers,
        members,
        staff,
        gldmfStaff,
        sianStaff
      },
      message: `Total users: ${totalUsers}, Members: ${members}`
    });
  } catch (error) {
    res.status(500).json({ 
      success: false,
      error: error.message 
    });
  }
});

export default router;