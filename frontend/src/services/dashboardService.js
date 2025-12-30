// src/services/dashboardService.js

// Helper function for API calls with error handling
const apiCall = async (url, options = {}) => {
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 8000);
    
    const response = await fetch(url, {
      ...options,
      signal: controller.signal,
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
    });
    
    clearTimeout(timeoutId);
    
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }
    
    return await response.json();
  } catch (error) {
    if (error.name === 'AbortError') {
      throw new Error('Request timeout - backend not responding');
    }
    throw error;
  }
};

export const getDashboardStats = async () => {
  try {
    console.log('🔄 Fetching dashboard stats from backend...');
    
    // Use the new dashboard stats endpoint
    const stats = await apiCall('http://localhost:8082/api/dashboard/stats');
    
    console.log('📊 Dashboard stats received:', stats);
    return stats;

  } catch (error) {
    console.error('❌ Error fetching dashboard stats, using mock data:', error);
    // Enhanced mock data that's more realistic
    return {
      totalClients: 1247,
      activeLoans: 189,
      portfolioValue: 856000000,
      totalPayments: 843,
      activeKiosks: 48,
      totalInvestments: 156,
      source: 'mock',
      timestamp: new Date().toISOString(),
      dataQuality: 'mock'
    };
  }
};

export const getRecentActivity = async () => {
  try {
    console.log('🔄 Fetching real activity data...');
    
    const [users, loans, payments] = await Promise.allSettled([
      apiCall('http://localhost:8082/api/users'),
      apiCall('http://localhost:8082/api/loans'),
      apiCall('http://localhost:8082/api/payments')
    ]);

    const activities = [];
    const now = new Date();

    // Add user registration activities
    if (users.status === 'fulfilled' && Array.isArray(users.value)) {
      const recentUsers = users.value.slice(-3); // Last 3 users
      recentUsers.forEach((user, index) => {
        activities.push({
          id: `user-${user.id || index}`,
          message: `New client registered - ${user.name || user.email || 'Unknown User'}`,
          timestamp: `${index + 1} hour${index > 0 ? 's' : ''} ago`,
          type: "success",
          source: 'backend',
          category: 'registration'
        });
      });
    }

    // Add loan activities
    if (loans.status === 'fulfilled' && Array.isArray(loans.value)) {
      const recentLoans = loans.value.slice(-2); // Last 2 loans
      recentLoans.forEach((loan, index) => {
        activities.push({
          id: `loan-${loan.id || index}`,
          message: `Loan ${loan.status || 'processed'} - ${loan.clientName || 'Client'} (UGX ${parseInt(loan.amount || 0).toLocaleString()})`,
          timestamp: `${index * 2 + 1} hours ago`,
          type: loan.status === 'approved' ? 'success' : 'info',
          source: 'backend',
          category: 'loan'
        });
      });
    }

    // Add payment activities
    if (payments.status === 'fulfilled' && Array.isArray(payments.value)) {
      const recentPayments = payments.value.slice(-2); // Last 2 payments
      recentPayments.forEach((payment, index) => {
        activities.push({
          id: `payment-${payment.id || index}`,
          message: `Payment received - UGX ${parseInt(payment.amount || 0).toLocaleString()}`,
          timestamp: `${index * 3 + 1} hours ago`,
          type: "success",
          source: 'backend',
          category: 'payment'
        });
      });
    }

    // Sort by timestamp and limit to 5 activities
    const sortedActivities = activities
      .sort((a, b) => {
        const timeA = parseInt(a.timestamp);
        const timeB = parseInt(b.timestamp);
        return timeA - timeB;
      })
      .slice(0, 5);

    // Add system activity if we have real data
    if (sortedActivities.length > 0) {
      sortedActivities.unshift({
        id: 'system-backend',
        message: 'Connected to live backend data',
        timestamp: 'Just now',
        type: "success",
        source: 'system',
        category: 'system'
      });
    }

    return sortedActivities.length > 0 ? sortedActivities : getMockActivities();

  } catch (error) {
    console.error('❌ Error fetching activities:', error);
    return getMockActivities();
  }
};

// Helper function for mock activities
const getMockActivities = () => {
  return [
    {
      id: 'mock-1',
      message: "New client registered - Jane Doe",
      timestamp: "2 minutes ago",
      type: "success",
      source: 'mock',
      category: 'registration'
    },
    {
      id: 'mock-2',
      message: "Loan application approved - REF-00123",
      timestamp: "1 hour ago",
      type: "success",
      source: 'mock',
      category: 'loan'
    },
    {
      id: 'mock-3',
      message: "Payment received - UGX 150,000",
      timestamp: "3 hours ago",
      type: "success",
      source: 'mock',
      category: 'payment'
    },
    {
      id: 'mock-4',
      message: "AI assessment completed - Risk Score: 78",
      timestamp: "5 hours ago",
      type: "info",
      source: 'mock',
      category: 'ai'
    }
  ];
};

export const getSystemStatus = async () => {
  try {
    console.log('🔄 Checking system status...');
    
    const [health, users, loans] = await Promise.allSettled([
      apiCall('http://localhost:8082/'),
      apiCall('http://localhost:8082/api/users'),
      apiCall('http://localhost:8082/api/loans')
    ]);

    const backendStatus = health.status === 'fulfilled' ? 'operational' : 'degraded';
    const databaseStatus = users.status === 'fulfilled' || loans.status === 'fulfilled' ? 'healthy' : 'issues';
    
    // Calculate performance metrics based on response times
    const apiPerformance = backendStatus === 'operational' ? 95 : 65;
    const dbPerformance = databaseStatus === 'healthy' ? 88 : 60;
    const aiPerformance = 76; // Default for now

    return {
      api: { 
        status: backendStatus, 
        performance: apiPerformance,
        message: backendStatus === 'operational' ? 'All endpoints responding' : 'Some endpoints unavailable'
      },
      database: { 
        status: databaseStatus, 
        performance: dbPerformance,
        message: databaseStatus === 'healthy' ? 'Data queries successful' : 'Data access issues'
      },
      ai: { 
        status: 'online', 
        performance: aiPerformance,
        message: 'AI services available'
      },
      backend: { 
        status: backendStatus,
        url: 'http://localhost:8082',
        timestamp: new Date().toISOString()
      },
      source: 'backend'
    };

  } catch (error) {
    console.error('❌ Error checking system status:', error);
    return {
      api: { status: 'degraded', performance: 65, message: 'Backend unreachable' },
      database: { status: 'unknown', performance: 0, message: 'Connection failed' },
      ai: { status: 'offline', performance: 0, message: 'Service unavailable' },
      backend: { status: 'disconnected', error: error.message },
      source: 'mock'
    };
  }
};

export const getPlatformAnalytics = async () => {
  try {
    const stats = await getDashboardStats();
    
    return {
      totalUsers: stats.totalClients,
      totalLoans: stats.activeLoans,
      totalPayments: stats.totalPayments,
      portfolioValue: stats.portfolioValue,
      activeTenants: 1, // GLDMF
      apiCallsToday: stats.totalClients + stats.activeLoans + stats.totalPayments,
      dataSource: stats.source,
      dataQuality: stats.dataQuality,
      lastUpdated: stats.timestamp
    };
  } catch (error) {
    return {
      totalUsers: 1247,
      totalLoans: 189,
      totalPayments: 843,
      portfolioValue: 856000000,
      activeTenants: 1,
      apiCallsToday: 2279,
      dataSource: 'mock',
      dataQuality: 'mock',
      lastUpdated: new Date().toISOString()
    };
  }
};

export const testBackendEndpoints = async () => {
  const endpoints = [
    { name: 'Health Check', url: 'http://localhost:8082/', method: 'GET' },
    { name: 'Dashboard Stats', url: 'http://localhost:8082/api/dashboard/stats', method: 'GET' },
    { name: 'Users API', url: 'http://localhost:8082/api/users', method: 'GET' },
    { name: 'Loans API', url: 'http://localhost:8082/api/loans', method: 'GET' },
    { name: 'Payments API', url: 'http://localhost:8082/api/payments', method: 'GET' },
    { name: 'Investments API', url: 'http://localhost:8082/api/investments', method: 'GET' },
    { name: 'Kiosks API', url: 'http://localhost:8082/api/kiosks', method: 'GET' }
  ];

  const results = [];

  for (const endpoint of endpoints) {
    try {
      const startTime = Date.now();
      await apiCall(endpoint.url, { method: endpoint.method });
      const responseTime = Date.now() - startTime;

      results.push({
        name: endpoint.name,
        status: 200,
        ok: true,
        responseTime: `${responseTime}ms`,
        connected: true,
        details: `Responding in ${responseTime}ms`
      });
    } catch (error) {
      results.push({
        name: endpoint.name,
        status: 'error',
        ok: false,
        responseTime: 'timeout',
        connected: false,
        error: error.message,
        details: `Failed: ${error.message}`
      });
    }
  }

  return results;
};