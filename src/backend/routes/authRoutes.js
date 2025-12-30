// backend/routes/authRoutes.js
import express from 'express';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import User from '../models/User.js';

const router = express.Router();

// JWT Secret - in production, use environment variable
const JWT_SECRET = process.env.JWT_SECRET || 'your-super-secret-jwt-key-change-in-production';

// Helper function to generate JWT token
const generateToken = (user) => {
  return jwt.sign(
    { 
      id: user._id, 
      email: user.email, 
      role: user.role,
      tenant: user.tenantCode
    },
    JWT_SECRET,
    { expiresIn: '24h' }
  );
};

// POST /api/auth/member-login - Member login with member number + phone + OTP
router.post('/member-login', async (req, res) => {
  try {
    const { memberNumber, phoneNumber, otp } = req.body;

    // Validate input
    if (!memberNumber || !phoneNumber || !otp) {
      return res.status(400).json({ 
        success: false,
        error: 'Member number, phone number, and OTP are required' 
      });
    }

    // Verify OTP (demo mode - always accept 123456)
    if (otp !== '123456') {
      return res.status(401).json({ 
        success: false,
        error: 'Invalid verification code' 
      });
    }

    // Find member in database
    const member = await User.findOne({ 
      $or: [
        { 'metadata.gldmfMemNo': memberNumber },
        { memberNumber: memberNumber }
      ],
      phoneNumber: phoneNumber,
      tenantCode: 'gldmf'
    });

    if (!member) {
      return res.status(401).json({ 
        success: false,
        error: 'Member not found. Please check your member number and phone number.' 
      });
    }

    // Generate token for member
    const token = generateToken(member);

    // Return success response
    res.json({
      success: true,
      message: 'Member login successful',
      user: {
        id: member._id,
        name: member.name,
        role: 'member',
        memberNumber: member.metadata?.gldmfMemNo || member.memberNumber,
        phoneNumber: member.phoneNumber,
        tenantCode: member.tenantCode,
        occupation: member.occupation,
        memberSince: member.createdAt
      },
      token,
      expiresIn: '24h'
    });

  } catch (error) {
    console.error('Member login error:', error);
    res.status(500).json({ 
      success: false,
      error: 'Internal server error' 
    });
  }
});

// POST /api/auth/send-otp - Send OTP for member login
router.post('/send-otp', async (req, res) => {
  try {
    const { memberNumber, phoneNumber } = req.body;

    // Validate input
    if (!memberNumber || !phoneNumber) {
      return res.status(400).json({ 
        success: false,
        error: 'Member number and phone number are required' 
      });
    }

    // Check if member exists
    const member = await User.findOne({ 
      $or: [
        { 'metadata.gldmfMemNo': memberNumber },
        { memberNumber: memberNumber }
      ],
      phoneNumber: phoneNumber,
      tenantCode: 'gldmf'
    });

    if (!member) {
      return res.status(404).json({ 
        success: false,
        error: 'Member not found with provided details' 
      });
    }

    // In production, send real SMS OTP here
    // For demo, always return success with fixed OTP
    console.log(`📱 OTP sent to ${phoneNumber} for member ${memberNumber}: 123456`);

    res.json({
      success: true,
      message: 'Verification code sent to your phone',
      otp: '123456', // Remove this in production
      expiresIn: '5 minutes'
    });

  } catch (error) {
    console.error('Send OTP error:', error);
    res.status(500).json({ 
      success: false,
      error: 'Failed to send verification code' 
    });
  }
});

// POST /api/auth/login - User login (existing route)
router.post('/login', async (req, res) => {
  try {
    const { email, password, userType = 'client' } = req.body;

    // Validate input
    if (!email || !password) {
      return res.status(400).json({ 
        success: false,
        error: 'Email and password are required' 
      });
    }

    let user;

    // Check for GLDMF client login (memberNumber@gldmf.com)
    if (userType === 'client' && email.endsWith('@gldmf.com')) {
      const memberNumber = email.replace('@gldmf.com', '');
      
      // Find user by member number in metadata
      user = await User.findOne({ 
        'metadata.gldmfMemNo': memberNumber,
        tenantCode: 'gldmf'
      });
      
      // For migrated GLDMF users, use member number as password
      if (user && password === memberNumber) {
        // Login successful for GLDMF client
      } else {
        user = null;
      }
    }

    // If not GLDMF client or not found, check other users
    if (!user) {
      // Check staff/admin accounts first (hardcoded for now)
      const staffAccounts = [
        { 
          email: 'admin@sianfintech.com', 
          password: 'sian123', 
          role: 'sian_admin', 
          name: 'SianFinTech Super Admin',
          tenantCode: 'sianfintech'
        },
        { 
          email: 'analyst@sianfintech.com', 
          password: 'sian123', 
          role: 'sian_staff', 
          name: 'SianFinTech Analyst',
          tenantCode: 'sianfintech'
        },
        { 
          email: 'admin@gldmf.com', 
          password: 'staff123', 
          role: 'tenant_admin', 
          name: 'GLDMF Admin',
          tenantCode: 'gldmf'
        },
        { 
          email: 'loanofficer@gldmf.com', 
          password: 'staff123', 
          role: 'tenant_staff', 
          name: 'GLDMF Loan Officer',
          tenantCode: 'gldmf'
        },
        { 
          email: 'manager@gldmf.com', 
          password: 'staff123', 
          role: 'tenant_staff', 
          name: 'GLDMF Manager',
          tenantCode: 'gldmf'
        }
      ];

      const staffUser = staffAccounts.find(acc => acc.email === email && acc.password === password);
      if (staffUser) {
        user = {
          _id: `staff-${staffUser.email}`,
          name: staffUser.name,
          email: staffUser.email,
          role: staffUser.role,
          tenantCode: staffUser.tenantCode
        };
      }
    }

    // If still no user found, check database for regular users
    if (!user) {
      const dbUser = await User.findOne({ email });
      if (dbUser) {
        // For database users, check password (using default "password" for migrated users)
        if (password === 'password' || await bcrypt.compare(password, dbUser.password)) {
          user = dbUser;
        }
      }
    }

    if (!user) {
      return res.status(401).json({ 
        success: false,
        error: 'Invalid email or password' 
      });
    }

    // Generate token
    const token = generateToken(user);

    // Return success response
    res.json({
      success: true,
      message: 'Login successful',
      data: {
        user: {
          id: user._id,
          name: user.name,
          email: user.email,
          role: user.role || 'member', // Default to member for GLDMF users
          tenant: user.tenantCode || 'gldmf'
        },
        token,
        expiresIn: '24h'
      }
    });

  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ 
      success: false,
      error: 'Internal server error' 
    });
  }
});

// GET /api/auth/profile - Get user profile
router.get('/profile', async (req, res) => {
  try {
    // This would typically verify JWT token and return user profile
    // For now, return simple response
    res.json({
      success: true,
      message: 'Profile endpoint - implement JWT verification'
    });
  } catch (error) {
    console.error('Profile error:', error);
    res.status(500).json({ 
      success: false,
      error: 'Internal server error' 
    });
  }
});

// POST /api/auth/logout - User logout
router.post('/logout', (req, res) => {
  // In a real app, you might blacklist the token
  res.json({
    success: true,
    message: 'Logout successful'
  });
});

export default router;