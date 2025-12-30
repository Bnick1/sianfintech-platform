import jwt from 'jsonwebtoken';

// Main authentication middleware
const auth = async (req, res, next) => {
  try {
    const token = req.header('Authorization')?.replace('Bearer ', '');
    
    if (!token) {
      return res.status(401).json({ 
        success: false, 
        error: 'No token provided, authorization denied' 
      });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'fallback-secret-key');
    
    // Attach the decoded user info to the request
    req.user = { 
      _id: decoded.userId || decoded._id || 'dev-user-id',
      id: decoded.userId || decoded._id || 'dev-user-id',
      email: decoded.email || 'dev@example.com',
      role: decoded.role || 'member',
      tenantCode: decoded.tenantCode || 'gldmf'
    };
    
    // Also set userId in body for convenience
    if (req.body && typeof req.body === 'object') {
      req.body.userId = decoded.userId || decoded._id || 'dev-user-id';
    }
    
    console.log(`🔐 Authenticated user: ${req.user.email} (${req.user.role})`);
    next();
  } catch (error) {
    console.error('Auth middleware error:', error.message);
    res.status(401).json({ 
      success: false, 
      error: 'Token is not valid' 
    });
  }
};

// Role-based authorization middleware
const authorize = (allowedRoles) => {
  return (req, res, next) => {
    try {
      if (!req.user) {
        return res.status(401).json({
          success: false,
          error: 'Authentication required before authorization'
        });
      }
      
      const userRole = req.user.role;
      
      if (!userRole) {
        return res.status(403).json({
          success: false,
          error: 'User role not found'
        });
      }
      
      // If allowedRoles is a string, convert to array
      const rolesArray = Array.isArray(allowedRoles) ? allowedRoles : [allowedRoles];
      
      if (!rolesArray.includes(userRole)) {
        return res.status(403).json({
          success: false,
          error: `Access denied. Required roles: ${rolesArray.join(', ')}. Your role: ${userRole}`
        });
      }
      
      console.log(`✅ Authorized user role: ${userRole}`);
      next();
    } catch (error) {
      console.error('Authorization error:', error);
      res.status(500).json({
        success: false,
        error: 'Authorization failed'
      });
    }
  };
};

// Development/testing middleware (bypasses auth)
const devAuth = (req, res, next) => {
  // Skip authentication in development
  console.log('🔐 Development authentication - skipping validation');
  
  req.user = {
    _id: 'dev-user-id',
    id: 'dev-user-id',
    email: 'dev@example.com',
    role: req.headers['x-user-role'] || 'admin',
    tenantCode: req.headers['x-tenant-code'] || 'gldmf'
  };
  
  // Set userId in body
  if (req.body && typeof req.body === 'object') {
    req.body.userId = 'dev-user-id';
  }
  
  next();
};

// Optional: Tenant-specific middleware
const requireTenant = (requiredTenantCode) => {
  return (req, res, next) => {
    try {
      if (!req.user) {
        return res.status(401).json({
          success: false,
          error: 'Authentication required'
        });
      }
      
      const userTenant = req.user.tenantCode;
      
      if (requiredTenantCode && userTenant !== requiredTenantCode) {
        return res.status(403).json({
          success: false,
          error: `Access denied. This resource belongs to tenant: ${requiredTenantCode}`
        });
      }
      
      next();
    } catch (error) {
      console.error('Tenant check error:', error);
      res.status(500).json({
        success: false,
        error: 'Tenant validation failed'
      });
    }
  };
};

// Export all middlewares
export { auth, authorize, devAuth, requireTenant };

// Also keep default export for backward compatibility
export default auth;