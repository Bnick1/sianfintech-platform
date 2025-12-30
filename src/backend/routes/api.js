// routes/api.js
const express = require('express');
const router = express.Router();
const { MongoClient, ObjectId } = require('mongodb');

// MongoDB connection
const uri = process.env.MONGODB_URI || "mongodb://localhost:27017/sianfintech";
const client = new MongoClient(uri);

// Connect to MongoDB
async function connectDB() {
  try {
    await client.connect();
    console.log('✅ Connected to MongoDB');
    return client.db();
  } catch (error) {
    console.error('❌ MongoDB connection error:', error);
    throw error;
  }
}

// GLDMF Users/Members API
router.get('/users', async (req, res) => {
  try {
    const db = await connectDB();
    const { tenant, role, status } = req.query;
    
    let query = {};
    if (tenant) query.tenant = tenant;
    if (role) query.role = role;
    if (status) query.status = status;
    
    const users = await db.collection('users').find(query).toArray();
    
    res.json({
      success: true,
      users: users,
      total: users.length
    });
  } catch (error) {
    console.error('Error fetching users:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Failed to fetch users' 
    });
  }
});

// GLDMF Members Specific Endpoint
router.get('/members', async (req, res) => {
  try {
    const db = await connectDB();
    const { tenant = 'GLDMF', status } = req.query;
    
    let query = { 
      tenant: tenant,
      $or: [
        { role: 'member' },
        { role: 'client' },
        { userType: 'member' }
      ]
    };
    
    if (status) query.status = status;
    
    const members = await db.collection('users').find(query).toArray();
    
    res.json({
      success: true,
      members: members,
      total: members.length
    });
  } catch (error) {
    console.error('Error fetching members:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Failed to fetch members' 
    });
  }
});

// Loans API
router.get('/loans', async (req, res) => {
  try {
    const db = await connectDB();
    const { tenant, status, memberId } = req.query;
    
    let query = {};
    if (tenant) query.tenant = tenant;
    if (status) query.status = status;
    if (memberId) query.memberId = memberId;
    
    const loans = await db.collection('loans').find(query).toArray();
    
    res.json({
      success: true,
      loans: loans,
      total: loans.length,
      totalAmount: loans.reduce((sum, loan) => sum + (loan.amount || 0), 0)
    });
  } catch (error) {
    console.error('Error fetching loans:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Failed to fetch loans' 
    });
  }
});

// Investments API
router.get('/investments', async (req, res) => {
  try {
    const db = await connectDB();
    const { tenant, status, type } = req.query;
    
    let query = {};
    if (tenant) query.tenant = tenant;
    if (status) query.status = status;
    if (type) query.type = type;
    
    const investments = await db.collection('investments').find(query).toArray();
    
    res.json({
      success: true,
      investments: investments,
      total: investments.length,
      totalValue: investments.reduce((sum, inv) => sum + (inv.amount || 0), 0)
    });
  } catch (error) {
    console.error('Error fetching investments:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Failed to fetch investments' 
    });
  }
});

// GLDMF Dashboard Data
router.get('/dashboard/gldmf/:tenantCode', async (req, res) => {
  try {
    const db = await connectDB();
    const { tenantCode } = req.params;
    
    // Get all data in parallel
    const [members, loans, investments, recentActivity] = await Promise.all([
      db.collection('users').find({ tenant: tenantCode }).toArray(),
      db.collection('loans').find({ tenant: tenantCode }).toArray(),
      db.collection('investments').find({ tenant: tenantCode }).toArray(),
      db.collection('activity_logs').find({ tenant: tenantCode })
        .sort({ createdAt: -1 })
        .limit(10)
        .toArray()
    ]);
    
    // Calculate stats
    const stats = {
      totalUsers: members.length,
      activeUsers: members.filter(m => m.status === 'active').length,
      pendingLoans: loans.filter(l => l.status === 'pending').length,
      approvedLoans: loans.filter(l => l.status === 'approved').length,
      totalRevenue: loans.reduce((sum, loan) => sum + (loan.amount || 0), 0),
      activeInvestments: investments.filter(inv => inv.status === 'active').length,
      pendingInvestments: investments.filter(inv => inv.status === 'pending').length,
      totalInvestment: investments.reduce((sum, inv) => sum + (inv.amount || 0), 0)
    };
    
    res.json({
      success: true,
      stats: stats,
      recentMembers: members.slice(0, 5),
      recentLoans: loans.slice(0, 5),
      recentInvestments: investments.slice(0, 5),
      recentActivity: recentActivity
    });
  } catch (error) {
    console.error('Error fetching dashboard data:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Failed to fetch dashboard data' 
    });
  }
});

// Update User Status
router.put('/users/:userId', async (req, res) => {
  try {
    const db = await connectDB();
    const { userId } = req.params;
    const { status } = req.body;
    
    const result = await db.collection('users').updateOne(
      { _id: new ObjectId(userId) },
      { $set: { status: status, updatedAt: new Date() } }
    );
    
    if (result.modifiedCount === 0) {
      return res.status(404).json({
        success: false,
        error: 'User not found'
      });
    }
    
    res.json({
      success: true,
      message: 'User status updated successfully'
    });
  } catch (error) {
    console.error('Error updating user:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Failed to update user' 
    });
  }
});

// Loan Actions
router.put('/loans/:loanId/approve', async (req, res) => {
  try {
    const db = await connectDB();
    const { loanId } = req.params;
    
    const result = await db.collection('loans').updateOne(
      { _id: new ObjectId(loanId) },
      { 
        $set: { 
          status: 'approved',
          approvedAt: new Date(),
          updatedAt: new Date()
        } 
      }
    );
    
    if (result.modifiedCount === 0) {
      return res.status(404).json({
        success: false,
        error: 'Loan not found'
      });
    }
    
    res.json({
      success: true,
      message: 'Loan approved successfully'
    });
  } catch (error) {
    console.error('Error approving loan:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Failed to approve loan' 
    });
  }
});

router.put('/loans/:loanId/reject', async (req, res) => {
  try {
    const db = await connectDB();
    const { loanId } = req.params;
    const { reason } = req.body;
    
    const result = await db.collection('loans').updateOne(
      { _id: new ObjectId(loanId) },
      { 
        $set: { 
          status: 'rejected',
          rejectionReason: reason,
          rejectedAt: new Date(),
          updatedAt: new Date()
        } 
      }
    );
    
    if (result.modifiedCount === 0) {
      return res.status(404).json({
        success: false,
        error: 'Loan not found'
      });
    }
    
    res.json({
      success: true,
      message: 'Loan rejected successfully'
    });
  } catch (error) {
    console.error('Error rejecting loan:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Failed to reject loan' 
    });
  }
});

module.exports = router;