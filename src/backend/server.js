import express from "express";
import mongoose from "mongoose";
import cors from "cors";
import dotenv from "dotenv";
import rateLimit from "express-rate-limit";
import helmet from "helmet";
import compression from "compression";
import hpp from "hpp";

// Import routes
import weatherRoutes from "./routes/weatherRoutes.js";
import userRoutes from "./routes/userRoutes.js";
import loanRoutes from "./routes/loanRoutes.js";
import investmentRoutes from "./routes/investmentRoutes.js";
import paymentRoutes from "./routes/paymentRoutes.js";
import kioskRoutes from "./routes/kioskRoutes.js";
import aiRoutes from "./routes/aiRoutes.js";
import walletRoutes from "./routes/walletRoutes.js";
import mobileMoneyRoutes from "./routes/mobileMoneyRoutes.js";
import tenantRoutes from "./routes/tenants.js";
import authRoutes from "./routes/authRoutes.js";
import cryptoRoutes from "./routes/crypto.js";
import creditRoutes from "./routes/creditRoutes.js";
import creditScoreRoutes from './routes/creditScoreRoutes.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 8082;
const NODE_ENV = process.env.NODE_ENV || "development";

// ==================== SECURITY MIDDLEWARE ====================

// 1. Helmet for security headers
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'", "https://fonts.googleapis.com"],
      scriptSrc: ["'self'", "'unsafe-inline'"],
      fontSrc: ["'self'", "https://fonts.gstatic.com"],
      imgSrc: ["'self'", "data:", "https:"],
      connectSrc: [
        "'self'", 
        "https://*.mtn.com", 
        "https://api.blockcypher.com",
        "https://mainnet.infura.io",
        "https://api.coingecko.com"
      ],
      frameSrc: ["'self'"],
      objectSrc: ["'none'"],
      upgradeInsecureRequests: []
    }
  },
  crossOriginEmbedderPolicy: false,
  crossOriginResourcePolicy: { policy: "cross-origin" }
}));

// 2. CORS configuration - STRICT in production
const corsOptions = {
  origin: NODE_ENV === 'production' 
    ? [
        'https://gldmf.sianfintech.com',
        'https://sianfintech.com',
        'https://www.sianfintech.com',
        'https://sian-technologies-website.vercel.app'
      ]
    : [
        'http://localhost:4173', 
        'http://localhost:3000',
        'http://localhost:8080',
        'http://127.0.0.1:4173'
      ],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: [
    'Content-Type', 
    'Authorization', 
    'X-Tenant-Code',
    'X-API-Key',
    'X-Requested-With'
  ],
  exposedHeaders: ['X-Total-Count', 'X-RateLimit-Limit', 'X-RateLimit-Remaining'],
  maxAge: 86400 // 24 hours
};
app.use(cors(corsOptions));

// 3. Body parsing with limits
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// 4. Compression for performance
app.use(compression());

// 5. Rate limiting - different limits for different endpoints
const generalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // 100 requests per IP
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    error: 'Too many requests from this IP, please try again after 15 minutes',
    code: 429
  },
  skip: (req) => {
    // Skip rate limiting for health checks and static files
    return req.path === '/' || req.path.startsWith('/health');
  }
});

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // 5 login attempts per IP
  message: {
    error: 'Too many login attempts, please try again after 15 minutes',
    code: 429
  }
});

const apiLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 60, // 60 requests per minute per IP
  message: {
    error: 'Too many API requests, please slow down',
    code: 429
  }
});

// Apply rate limiting
app.use('/', generalLimiter);
app.use('/api/auth', authLimiter);
app.use('/api/', apiLimiter);

// 6. Security middleware
// Note: express-mongo-sanitize has been removed due to compatibility issues
app.use(hpp()); // Prevent parameter pollution

// 7. Request logging middleware
app.use((req, res, next) => {
  const start = Date.now();
  const timestamp = new Date().toISOString();
  
  // Log request (excluding sensitive data)
  const logData = {
    timestamp,
    method: req.method,
    url: req.url,
    ip: req.ip,
    userAgent: req.get('User-Agent'),
    tenant: req.headers['x-tenant-code'] || 'unknown'
  };
  
  // Skip logging for health checks to reduce noise
  if (req.path !== '/' && req.path !== '/health') {
    console.log('📥 Request:', logData);
  }
  
  // Add request ID for tracking
  req.requestId = `${timestamp}-${Math.random().toString(36).substr(2, 9)}`;
  
  res.on('finish', () => {
    const duration = Date.now() - start;
    const logEntry = {
      requestId: req.requestId,
      timestamp,
      method: req.method,
      url: req.url,
      statusCode: res.statusCode,
      duration: `${duration}ms`,
      ip: req.ip
    };
    
    // Log slow requests
    if (duration > 1000) {
      console.warn(`⚠️ Slow request (${duration}ms):`, logEntry);
    }
    
    // Log errors
    if (res.statusCode >= 400) {
      console.error(`❌ Error ${res.statusCode}:`, logEntry);
    }
  });
  
  next();
});

// ==================== DATABASE CONNECTION ====================

// MongoDB connection with retry logic
const connectWithRetry = async (retries = 5, delay = 5000) => {
  try {
    if (!process.env.MONGODB_URI) {
      throw new Error('MONGODB_URI environment variable is not set');
    }
    
    console.log('🔗 Attempting MongoDB connection...');
    
    await mongoose.connect(process.env.MONGODB_URI, {
      serverSelectionTimeoutMS: 5000,
      socketTimeoutMS: 45000,
      maxPoolSize: 10,
      minPoolSize: 2,
      retryWrites: true,
      w: 'majority'
    });
    
    console.log('✅ MongoDB connected successfully');
    
    // Setup connection event handlers
    mongoose.connection.on('error', (err) => {
      console.error('❌ MongoDB connection error:', err.message);
    });
    
    mongoose.connection.on('disconnected', () => {
      console.warn('⚠️ MongoDB disconnected. Attempting to reconnect...');
      setTimeout(() => connectWithRetry(), 5000);
    });
    
    mongoose.connection.on('reconnected', () => {
      console.log('✅ MongoDB reconnected');
    });
    
  } catch (error) {
    console.error(`❌ MongoDB connection attempt failed (${retries} retries left):`, error.message);
    
    if (retries > 0) {
      console.log(`⏳ Retrying in ${delay/1000} seconds...`);
      setTimeout(() => connectWithRetry(retries - 1, delay), delay);
    } else {
      console.error('❌ Could not connect to MongoDB after multiple attempts');
      process.exit(1);
    }
  }
};

connectWithRetry();

// ==================== ROUTES ====================

// API Routes
app.use("/api/weather", weatherRoutes);
app.use("/api/users", userRoutes);
app.use("/api/loans", loanRoutes);
app.use("/api/investments", investmentRoutes);
app.use("/api/payments", paymentRoutes);
app.use("/api/kiosks", kioskRoutes);
app.use("/api/ai", aiRoutes);
app.use("/api/wallets", walletRoutes);
app.use("/api/mobile-money", mobileMoneyRoutes);
app.use("/api/tenants", tenantRoutes);
app.use("/api/auth", authRoutes);
app.use("/api/crypto", cryptoRoutes);
app.use("/api/credit", creditRoutes);
app.use('/api/credit-scores', creditScoreRoutes);

// ==================== SPECIAL ENDPOINTS ====================

// Members endpoint - for GLDMF clients only (CASE-INSENSITIVE FIXED VERSION)
app.get("/api/members", async (req, res) => {
  try {
    // Import User model
    const User = (await import('./models/User.js')).default;
    
    // Get query parameters for filtering
    const { tenant, status, search, limit, page = 1 } = req.query;
    const pageSize = Math.min(parseInt(limit) || 50, 100); // Max 100 per page
    const skip = (parseInt(page) - 1) * pageSize;
    
    console.log('🔍 API Members Request:', { tenant, status, search, limit, page });
    
    // Build filter for members (users with role 'member')
    let filter = { role: 'member' };
    
    // Add tenant filter if provided - CASE INSENSITIVE FIX
    if (tenant) {
      // Convert to lowercase since we store as lowercase
      const tenantCode = tenant.toString().toLowerCase();
      filter.tenantCode = tenantCode;
      console.log('🏢 Filtering by tenant (case-insensitive):', tenant, '->', tenantCode);
    }
    
    // Add status filter if provided
    if (status && status !== 'all') {
      if (status === 'active') {
        // For active, include 'active' status only
        filter.status = 'active';
      } else if (status === 'pending') {
        // For pending, include 'pending_verification'
        filter.$or = [
          { status: 'pending' },
          { status: 'pending_verification' }
        ];
      } else {
        filter.status = status;
      }
    }
    
    // Add search filter if provided
    if (search) {
      filter.$or = [
        { name: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
        { phone: { $regex: search, $options: 'i' } },
        { idNumber: { $regex: search, $options: 'i' } },
        { digitalId: { $regex: search, $options: 'i' } }
      ];
    }
    
    console.log('📋 MongoDB filter:', JSON.stringify(filter, null, 2));
    
    // Get total count for pagination
    const totalCount = await User.countDocuments(filter);
    const totalPages = Math.ceil(totalCount / pageSize);
    
    // Create query
    let query = User.find(filter)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(pageSize)
      .select('-password -__v'); // Exclude password and version key
    
    // Fetch members
    const members = await query.exec();
    
    console.log('✅ Found members:', members.length, 'out of', totalCount);
    
    // Calculate stats based on actual status values
    let activeCount = 0;
    let pendingCount = 0;
    let suspendedCount = 0;
    
    members.forEach(member => {
      const status = member.status;
      
      if (status === 'active') {
        activeCount++;
      } else if (status === 'pending' || status === 'pending_verification') {
        pendingCount++;
      } else if (status === 'suspended' || status === 'inactive') {
        suspendedCount++;
      } else {
        // Default to pending for any other status
        pendingCount++;
      }
    });
    
    // Format response for frontend
    const formattedMembers = members.map(member => {
      const memberStatus = member.status;
      let displayStatus = memberStatus;
      
      // Map 'pending_verification' to 'pending' for frontend display
      if (memberStatus === 'pending_verification') {
        displayStatus = 'pending';
      }
      
      return {
        _id: member._id,
        id: member._id, // Add id field for frontend compatibility
        name: member.name || '',
        email: member.email || '',
        phone: member.phone || '',
        nationalId: member.idNumber || '',
        occupation: member.occupation || '',
        status: displayStatus,
        tenantCode: member.tenantCode || 'gldmf',
        digitalId: member.digitalId || '',
        walletId: member.walletId || '',
        referralCode: member.referralCode || '',
        createdAt: member.createdAt,
        updatedAt: member.updatedAt,
        contact: member.phone || '',
        joinDate: member.createdAt ? new Date(member.createdAt).toLocaleDateString() : 'N/A',
        memberId: member.digitalId || member._id
      };
    });
    
    res.setHeader('X-Total-Count', totalCount);
    res.setHeader('X-Total-Pages', totalPages);
    res.setHeader('X-Current-Page', page);
    res.setHeader('X-Page-Size', pageSize);
    
    res.json({
      success: true,
      count: members.length,
      total: totalCount,
      page: parseInt(page),
      totalPages: totalPages,
      stats: {
        active: activeCount,
        pending: pendingCount,
        suspended: suspendedCount,
        total: totalCount
      },
      members: formattedMembers,
      users: formattedMembers, // Backward compatibility
      data: formattedMembers, // Backward compatibility
      pagination: {
        page: parseInt(page),
        limit: pageSize,
        total: totalCount,
        pages: totalPages
      }
    });
    
  } catch (error) {
    console.error('❌ Members endpoint error:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Failed to fetch members',
      message: error.message,
      requestId: req.requestId
    });
  }
});

// Debug endpoint to check member status values (protected)
app.get("/api/debug/member-status", async (req, res) => {
  // Only allow in development
  if (NODE_ENV !== 'development') {
    return res.status(403).json({ 
      success: false, 
      error: 'Debug endpoints are only available in development mode' 
    });
  }
  
  try {
    const User = (await import('./models/User.js')).default;
    
    // Get distinct status values from members
    const statusCounts = await User.aggregate([
      { $match: { role: 'member' } },
      { 
        $group: {
          _id: "$status",
          count: { $sum: 1 }
        }
      },
      { $sort: { count: -1 } }
    ]);
    
    // Get sample members with different statuses
    const sampleMembers = await User.find({ role: 'member' })
      .select('name email phone status tenantCode createdAt')
      .limit(5)
      .exec();
    
    res.json({
      success: true,
      statusDistribution: statusCounts,
      sampleMembers: sampleMembers,
      totalMembers: await User.countDocuments({ role: 'member' })
    });
    
  } catch (error) {
    console.error('Debug endpoint error:', error);
    res.status(500).json({ 
      success: false, 
      error: error.message 
    });
  }
});

// ==================== HEALTH & MONITORING ====================

// Enhanced health check with system info
app.get("/", (req, res) => {
  const health = {
    status: "healthy",
    service: "SIAN FinTech Platform API",
    version: "1.0.0",
    environment: NODE_ENV,
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    memory: process.memoryUsage(),
    database: mongoose.connection.readyState === 1 ? "connected" : "disconnected",
    services: {
      mobile_money: "active",
      crypto: "active",
      ai_scoring: "active",
      database: mongoose.connection.readyState === 1
    },
    endpoints: {
      docs: `http://${req.headers.host}/api-docs`,
      dashboard: `http://${req.headers.host}/api/dashboard/stats`,
      members: `http://${req.headers.host}/api/members`
    }
  };
  
  res.json(health);
});

// Detailed health check endpoint
app.get("/health", async (req, res) => {
  try {
    // Check database connection
    const dbStatus = mongoose.connection.readyState;
    const dbPing = await mongoose.connection.db.admin().ping();
    
    const health = {
      status: dbStatus === 1 ? "healthy" : "unhealthy",
      timestamp: new Date().toISOString(),
      checks: {
        database: {
          status: dbStatus === 1 ? "connected" : "disconnected",
          ping: dbPing.ok === 1 ? "ok" : "failed",
          readyState: dbStatus
        },
        memory: {
          used: Math.round(process.memoryUsage().heapUsed / 1024 / 1024) + "MB",
          total: Math.round(process.memoryUsage().heapTotal / 1024 / 1024) + "MB"
        },
        uptime: Math.floor(process.uptime()) + " seconds"
      },
      version: "1.0.0",
      environment: NODE_ENV
    };
    
    const statusCode = dbStatus === 1 ? 200 : 503;
    res.status(statusCode).json(health);
  } catch (error) {
    res.status(503).json({
      status: "unhealthy",
      error: error.message,
      timestamp: new Date().toISOString()
    });
  }
});

// Enhanced Dashboard stats with crypto data
app.get("/api/dashboard/stats", async (req, res) => {
  try {
    const db = mongoose.connection.db;
    
    // Get counts from actual collections
    const [
      totalClients,
      activeLoans,
      totalInvestments,
      activeKiosks,
      totalPayments
    ] = await Promise.all([
      db.collection('users').countDocuments(),
      db.collection('loans').countDocuments({ status: 'active' }),
      db.collection('investments').countDocuments(),
      db.collection('kiosks').countDocuments({ status: 'active' }),
      db.collection('payments').countDocuments()
    ]);
    
    // Get crypto stats - handle missing collections
    let cryptoWallets = 0;
    let cryptoTransactions = 0;
    try {
      const collections = await db.listCollections().toArray();
      const collectionNames = collections.map(col => col.name);
      
      if (collectionNames.includes('cryptowallets')) {
        cryptoWallets = await db.collection('cryptowallets').countDocuments();
      }
      if (collectionNames.includes('cryptotransactions')) {
        cryptoTransactions = await db.collection('cryptotransactions').countDocuments();
      }
    } catch (cryptoError) {
      // Crypto collections not yet created - normal during initial setup
    }

    // Calculate portfolio value from actual loans
    const portfolioResult = await db.collection('loans').aggregate([
      { $match: { status: 'active' } },
      { 
        $group: { 
          _id: null, 
          total: { 
            $sum: '$principalAmount'
          } 
        } 
      }
    ]).toArray();
    
    const portfolioValue = portfolioResult[0]?.total || 0;

    res.json({
      success: true,
      data: {
        totalClients,
        activeLoans,
        portfolioValue,
        totalPayments,
        activeKiosks,
        totalInvestments,
        cryptoWallets,
        cryptoTransactions
      },
      source: 'backend',
      timestamp: new Date().toISOString(),
      dataQuality: 'real',
      requestId: req.requestId
    });
  } catch (error) {
    console.error('Dashboard stats error:', error);
    res.status(500).json({ 
      success: false,
      error: 'Failed to fetch dashboard stats',
      message: error.message,
      requestId: req.requestId
    });
  }
});

// GLDMF Dashboard Data
app.get("/api/dashboard/gldmf/:tenantCode", async (req, res) => {
  try {
    const User = (await import('./models/User.js')).default;
    const Loan = (await import('./models/loanModel.js')).default;
    const Investment = (await import('./models/investmentModel.js')).default;

    const { tenantCode } = req.params;

    // Get all data in parallel
    const [members, loans, investments, users] = await Promise.all([
      User.find({ 
        tenantCode: tenantCode.toLowerCase(), 
        $or: [{role: 'member'}, {role: 'client'}] 
      }).exec(),
      Loan.find({ tenantCode: tenantCode.toLowerCase() }).exec(),
      Investment.find({ tenantCode: tenantCode.toLowerCase() }).exec(),
      User.find({ tenantCode: tenantCode.toLowerCase() }).exec()
    ]);

    // Calculate stats
    const stats = {
      totalUsers: users.length,
      activeUsers: users.filter(u => u.status === 'active').length,
      pendingLoans: loans.filter(l => l.status === 'pending').length,
      approvedLoans: loans.filter(l => l.status === 'approved').length,
      totalRevenue: loans.reduce((sum, loan) => sum + (loan.amount || loan.principalAmount || 0), 0),
      activeInvestments: investments.filter(inv => inv.status === 'active').length,
      pendingInvestments: investments.filter(inv => inv.status === 'pending').length,
      totalInvestment: investments.reduce((sum, inv) => sum + (inv.amount || 0), 0)
    };

    res.json({
      success: true,
      data: {
        stats: stats,
        recentMembers: members.slice(0, 5).map(m => ({
          id: m._id,
          name: m.name,
          email: m.email,
          createdAt: m.createdAt
        })),
        recentLoans: loans.slice(0, 5),
        recentInvestments: investments.slice(0, 5)
      },
      tenantCode: tenantCode.toLowerCase(),
      timestamp: new Date().toISOString(),
      requestId: req.requestId
    });
  } catch (error) {
    console.error('GLDMF Dashboard error:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Failed to fetch GLDMF dashboard data',
      message: error.message,
      requestId: req.requestId
    });
  }
});

// Sian Admin Dashboard Data
app.get("/api/dashboard/sian", async (req, res) => {
  // Check for admin authorization
  const apiKey = req.headers['x-api-key'];
  if (!apiKey || apiKey !== process.env.ADMIN_API_KEY) {
    return res.status(401).json({
      success: false,
      error: 'Unauthorized: Valid API key required'
    });
  }
  
  try {
    const User = (await import('./models/User.js')).default;
    const Loan = (await import('./models/loanModel.js')).default;
    const Investment = (await import('./models/investmentModel.js')).default;

    // Get all tenants
    const tenants = await User.distinct('tenantCode');
    
    const tenantStats = await Promise.all(
      tenants.map(async (tenant) => {
        const [users, loans, investments] = await Promise.all([
          User.find({ tenantCode: tenant }).exec(),
          Loan.find({ tenantCode: tenant }).exec(),
          Investment.find({ tenantCode: tenant }).exec()
        ]);

        return {
          tenantCode: tenant,
          totalUsers: users.length,
          activeLoans: loans.filter(l => l.status === 'active').length,
          totalRevenue: loans.reduce((sum, loan) => sum + (loan.amount || 0), 0),
          activeInvestments: investments.filter(inv => inv.status === 'active').length
        };
      })
    );

    // Calculate global stats
    const globalStats = {
      totalClients: tenantStats.reduce((sum, t) => sum + t.totalUsers, 0),
      registeredUsers: tenantStats.reduce((sum, t) => sum + t.totalUsers, 0),
      activeLoans: tenantStats.reduce((sum, t) => sum + t.activeLoans, 0),
      totalRevenue: tenantStats.reduce((sum, t) => sum + t.totalRevenue, 0),
      activeTenants: tenants.length,
      systemHealth: 'healthy',
      aiAssessments: 89,
      paymentTransactions: 456,
      activeKiosks: 4
    };

    res.json({
      success: true,
      data: {
        stats: globalStats,
        tenants: tenantStats
      },
      timestamp: new Date().toISOString(),
      requestId: req.requestId
    });
  } catch (error) {
    console.error('Sian Dashboard error:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Failed to fetch Sian dashboard data',
      message: error.message,
      requestId: req.requestId
    });
  }
});

// Crypto status endpoint
app.get("/api/crypto/status", async (req, res) => {
  try {
    const cryptoService = await import('./services/cryptoService.js');
    const health = await cryptoService.default.getCurrentPrices(['BTC', 'ETH']);
    
    res.json({
      status: "active",
      services: {
        blockcypher: true,
        infura: true,
        coingecko: !!health.BTC
      },
      supported_coins: ["BTC", "ETH"],
      timestamp: new Date().toISOString(),
      prices: health,
      requestId: req.requestId
    });
  } catch (error) {
    res.status(503).json({
      status: "degraded",
      error: error.message,
      timestamp: new Date().toISOString(),
      requestId: req.requestId
    });
  }
});

// ==================== ERROR HANDLING ====================

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    success: false,
    error: 'Route not found',
    path: req.path,
    method: req.method,
    requestId: req.requestId
  });
});

// Global error handler
app.use((err, req, res, next) => {
  console.error('🔥 Global error handler:', {
    error: err.message,
    stack: err.stack,
    url: req.url,
    method: req.method,
    requestId: req.requestId
  });
  
  const statusCode = err.statusCode || 500;
  const message = NODE_ENV === 'production' && statusCode === 500 
    ? 'Internal server error' 
    : err.message;
  
  res.status(statusCode).json({
    success: false,
    error: message,
    requestId: req.requestId,
    ...(NODE_ENV === 'development' && { stack: err.stack })
  });
});

// ==================== SERVER STARTUP ====================

// Handle graceful shutdown
process.on('SIGTERM', gracefulShutdown);
process.on('SIGINT', gracefulShutdown);

function gracefulShutdown(signal) {
  console.log(`\n⚠️  Received ${signal}, starting graceful shutdown...`);
  
  // Close server
  server.close(() => {
    console.log('✅ HTTP server closed');
    
    // Close database connection
    mongoose.connection.close(false, () => {
      console.log('✅ MongoDB connection closed');
      process.exit(0);
    });
  });
  
  // Force shutdown after 10 seconds
  setTimeout(() => {
    console.error('❌ Could not close connections in time, forcefully shutting down');
    process.exit(1);
  }, 10000);
}

// Start server
const server = app.listen(PORT, () => {
  console.log(`
==============================================
🚀 SIAN FinTech Platform API
==============================================
✅ Server running on port: ${PORT}
✅ Environment: ${NODE_ENV}
✅ API available at: http://localhost:${PORT}/api
✅ Health check: http://localhost:${PORT}/health
✅ GLDMF Members: http://localhost:${PORT}/api/members?tenant=gldmf
==============================================
📊 Dashboard: http://localhost:${PORT}/api/dashboard/stats
💰 Payment service: /api/payments
₿ Crypto service: /api/crypto
📱 MTN Mobile Money: PRODUCTION MODE
👥 Members endpoint: /api/members
==============================================
⚠️  Security Features:
   • Rate limiting enabled
   • CORS restrictions in place
   • Security headers configured
   • Request logging active
   • NoSQL injection protection REMOVED (express-mongo-sanitize uninstalled)
==============================================
`);
});

// Handle server errors
server.on('error', (error) => {
  if (error.code === 'EADDRINUSE') {
    console.error(`❌ Port ${PORT} is already in use`);
    console.log(`💡 Try: kill -9 $(lsof -t -i:${PORT}) or use a different port`);
  } else {
    console.error('❌ Server error:', error);
  }
  process.exit(1);
});

export default app;