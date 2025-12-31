// src/services/apiService.js
const API_BASE_URL = 'https://sianfintech-platform.onrender.com/api';

// Generic API call function with better error handling
export async function apiCall(endpoint, options = {}) {
  const url = `${API_BASE_URL}${endpoint}`;
  
  // Get auth token from localStorage or context
  const authToken = localStorage.getItem('authToken') || localStorage.getItem('token');
  
  const config = {
    headers: {
      'Content-Type': 'application/json',
      ...(authToken && { 'Authorization': `Bearer ${authToken}` }),
      ...options.headers,
    },
    ...options,
  };

  // Add body for non-GET requests
  if (options.body && config.method !== 'GET') {
    config.body = JSON.stringify(options.body);
  }

  try {
    console.log(`🔄 API Call: ${url}`, { method: config.method, headers: config.headers });
    
    const response = await fetch(url, config);
    const responseText = await response.text();
    
    let data;
    try {
      data = responseText ? JSON.parse(responseText) : {};
    } catch (parseError) {
      console.error('❌ JSON parse error:', parseError);
      throw new Error(`Invalid JSON response: ${responseText}`);
    }
    
    if (!response.ok) {
      console.error(`❌ API Error ${response.status}:`, data);
      throw new Error(data.error || data.message || `HTTP ${response.status}: ${response.statusText}`);
    }
    
    console.log(`✅ API Success: ${endpoint}`, data);
    return data;
    
  } catch (error) {
    console.error(`❌ API Call failed for ${url}:`, error);
    
    // Enhanced error handling for common cases
    if (error.name === 'TypeError' && error.message.includes('Failed to fetch')) {
      throw new Error('Network error: Cannot connect to server. Please check if the backend is running.');
    }
    
    throw error;
  }
}

// Users API
export const usersAPI = {
  getUsers: (params = {}) => {
    const queryParams = new URLSearchParams();
    
    if (params.tenant) queryParams.append('tenant', params.tenant);
    if (params.role) queryParams.append('role', params.role);
    if (params.status) queryParams.append('status', params.status);
    if (params.limit) queryParams.append('limit', params.limit);
    
    const queryString = queryParams.toString();
    return apiCall(`/users${queryString ? `?${queryString}` : ''}`);
  },
  
  getMembers: (params = {}) => {
    const queryParams = new URLSearchParams();
    
    if (params.tenant) queryParams.append('tenant', params.tenant);
    if (params.status) queryParams.append('status', params.status);
    
    const queryString = queryParams.toString();
    return apiCall(`/members${queryString ? `?${queryString}` : ''}`);
  },
  
  updateUser: (userId, data) => {
    return apiCall(`/users/${userId}`, {
      method: 'PUT',
      body: data,
    });
  },
  
  createUser: (userData) => {
    return apiCall('/users', {
      method: 'POST',
      body: userData,
    });
  }
};

// Loans API
export const loansAPI = {
  getLoans: (params = {}) => {
    const queryParams = new URLSearchParams();
    
    if (params.tenant) queryParams.append('tenant', params.tenant);
    if (params.status) queryParams.append('status', params.status);
    if (params.memberId) queryParams.append('memberId', params.memberId);
    if (params.userId) queryParams.append('userId', params.userId);
    if (params.borrower) queryParams.append('borrower', params.borrower);
    
    const queryString = queryParams.toString();
    return apiCall(`/loans${queryString ? `?${queryString}` : ''}`);
  },
  
  getLoan: (loanId) => {
    return apiCall(`/loans/${loanId}`);
  },
  
  getUserLoans: (userId) => {
    return apiCall(`/loans/user/${userId}`);
  },
  
  approveLoan: (loanId) => {
    return apiCall(`/loans/${loanId}/approve`, {
      method: 'PUT',
    });
  },
  
  rejectLoan: (loanId, reason = '') => {
    return apiCall(`/loans/${loanId}/reject`, {
      method: 'PUT',
      body: { reason },
    });
  },
  
  createLoan: (loanData) => {
    return apiCall('/loans', {
      method: 'POST',
      body: loanData,
    });
  }
};

// Investments API
export const investmentsAPI = {
  getInvestments: (params = {}) => {
    const queryParams = new URLSearchParams();
    
    if (params.tenant) queryParams.append('tenant', params.tenant);
    if (params.status) queryParams.append('status', params.status);
    if (params.type) queryParams.append('type', params.type);
    if (params.userId) queryParams.append('userId', params.userId);
    if (params.investor) queryParams.append('investor', params.investor);
    
    const queryString = queryParams.toString();
    return apiCall(`/investments${queryString ? `?${queryString}` : ''}`);
  },
  
  getUserInvestments: (userId) => {
    return apiCall(`/investments/user/${userId}`);
  },
  
  updateInvestment: (investmentId, data) => {
    return apiCall(`/investments/${investmentId}`, {
      method: 'PUT',
      body: data,
    });
  },
  
  createInvestment: (investmentData) => {
    return apiCall('/investments', {
      method: 'POST',
      body: investmentData,
    });
  }
};

// Dashboard API
export const dashboardAPI = {
  getGLDMFDashboard: (tenantCode = 'GLDMF') => {
    return apiCall(`/dashboard/gldmf/${tenantCode.toLowerCase()}`);
  },
  
  getSianDashboard: () => {
    return apiCall('/dashboard/sian');
  },
  
  getStats: (tenant) => {
    const queryParams = new URLSearchParams();
    if (tenant) queryParams.append('tenant', tenant);
    
    const queryString = queryParams.toString();
    return apiCall(`/dashboard/stats${queryString ? `?${queryString}` : ''}`);
  }
};

// Tenants API
export const tenantsAPI = {
  getTenants: () => {
    return apiCall('/tenants');
  },
  
  getTenant: (tenantId) => {
    return apiCall(`/tenants/${tenantId}`);
  },
  
  updateTenant: (tenantId, data) => {
    return apiCall(`/tenants/${tenantId}`, {
      method: 'PUT',
      body: data,
    });
  },
  
  createTenant: (tenantData) => {
    return apiCall('/tenants', {
      method: 'POST',
      body: tenantData,
    });
  }
};

// System API
export const systemAPI = {
  getHealth: () => {
    return apiCall('/health');
  },
  
  getMetrics: () => {
    return apiCall('/system/metrics');
  }
};

// Auth API
export const authAPI = {
  login: (credentials) => {
    return apiCall('/auth/login', {
      method: 'POST',
      body: credentials,
    });
  },
  
  register: (userData) => {
    return apiCall('/auth/register', {
      method: 'POST',
      body: userData,
    });
  },
  
  logout: () => {
    return apiCall('/auth/logout', {
      method: 'POST',
    });
  },
  
  verifyToken: () => {
    return apiCall('/auth/verify');
  }
};

// Payments API
export const paymentsAPI = {
  processPayment: (paymentData) => {
    return apiCall('/payments/process', {
      method: 'POST',
      body: paymentData,
    });
  },
  
  getTransactions: (params = {}) => {
    const queryParams = new URLSearchParams();
    
    if (params.tenant) queryParams.append('tenant', params.tenant);
    if (params.status) queryParams.append('status', params.status);
    if (params.type) queryParams.append('type', params.type);
    if (params.userId) queryParams.append('userId', params.userId);
    
    const queryString = queryParams.toString();
    return apiCall(`/payments/transactions${queryString ? `?${queryString}` : ''}`);
  },
  
  getUserTransactions: (userId) => {
    return apiCall(`/payments/transactions/user/${userId}`);
  },
  
  // Mobile Money specific endpoints
  initiateMobileMoney: (paymentData) => {
    return apiCall('/payments/mobile-money/initiate', {
      method: 'POST',
      body: paymentData,
    });
  },
  
  checkMobileMoneyStatus: (transactionId) => {
    return apiCall(`/payments/mobile-money/status/${transactionId}`);
  },
  
  // Wallet funding
  fundWallet: (fundingData) => {
    return apiCall('/payments/wallet/fund', {
      method: 'POST',
      body: fundingData,
    });
  },
  
  getWalletBalance: (userId) => {
    return apiCall(`/payments/wallet/balance/${userId}`);
  }
};

// Mobile Money API
export const mobileMoneyAPI = {
  initiatePayment: (paymentData) => {
    return apiCall('/mobile-money/initiate', {
      method: 'POST',
      body: paymentData,
    });
  },
  
  checkPayment: (transactionId) => {
    return apiCall(`/mobile-money/check/${transactionId}`);
  },
  
  processCallback: (callbackData) => {
    return apiCall('/mobile-money/callback', {
      method: 'POST',
      body: callbackData,
    });
  }
};

// Credit API - ADDED MISSING EXPORT
export const creditAPI = {
  getScore: (userId) => {
    return apiCall(`/credit/score/${userId}`);
  },
  
  getReport: (userId) => {
    return apiCall(`/credit/report/${userId}`);
  },
  
  getHistory: (userId) => {
    return apiCall(`/credit/history/${userId}`);
  },
  
  calculateScore: (creditData) => {
    return apiCall('/credit/calculate', {
      method: 'POST',
      body: creditData,
    });
  }
};

// Wallets API - ADDED MISSING EXPORT
export const walletsAPI = {
  getBalance: (userId) => {
    return apiCall(`/wallets/balance/${userId}`);
  },
  
  getWallet: (userId) => {
    return apiCall(`/wallets/user/${userId}`);
  },
  
  getTransactions: (userId, params = {}) => {
    const queryParams = new URLSearchParams();
    
    if (params.limit) queryParams.append('limit', params.limit);
    if (params.type) queryParams.append('type', params.type);
    if (params.startDate) queryParams.append('startDate', params.startDate);
    if (params.endDate) queryParams.append('endDate', params.endDate);
    
    const queryString = queryParams.toString();
    return apiCall(`/wallets/${userId}/transactions${queryString ? `?${queryString}` : ''}`);
  },
  
  transfer: (transferData) => {
    return apiCall('/wallets/transfer', {
      method: 'POST',
      body: transferData,
    });
  },
  
  deposit: (depositData) => {
    return apiCall('/wallets/deposit', {
      method: 'POST',
      body: depositData,
    });
  },
  
  withdraw: (withdrawData) => {
    return apiCall('/wallets/withdraw', {
      method: 'POST',
      body: withdrawData,
    });
  }
};

// Default export
export default apiCall;