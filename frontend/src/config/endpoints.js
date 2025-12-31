// src/config/endpoints.js

// Browser-compatible environment configuration
const getApiBaseUrl = () => {
  // For development - use localhost
  if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
    return 'http://localhost:8082';
  }
  // For production - use your Render backend
  return 'https://sianfintech-platform.onrender.com';
};

export const API_CONFIG = {
  BASE_URL: getApiBaseUrl(),
  TIMEOUT: 30000,
  RETRY_ATTEMPTS: 3
};

export const STATUS_CODES = {
  SUCCESS: 200,
  CREATED: 201,
  BAD_REQUEST: 400,
  UNAUTHORIZED: 401,
  FORBIDDEN: 403,
  NOT_FOUND: 404,
  TOO_MANY_REQUESTS: 429,
  SERVER_ERROR: 500
};

export const ERROR_MESSAGES = {
  NETWORK_ERROR: 'Network connection failed. Please check your internet connection.',
  TIMEOUT_ERROR: 'Request timeout. Please try again.',
  UNAUTHORIZED: 'Authentication required. Please log in again.',
  FORBIDDEN: 'You do not have permission to access this resource.',
  NOT_FOUND: 'The requested resource was not found.',
  SERVER_ERROR: 'Server error. Please try again later.'
};

export const CACHE_CONFIG = {
  DASHBOARD_STATS: 5 * 60 * 1000, // 5 minutes
  LIST_DATA: 2 * 60 * 1000, // 2 minutes
  USER_DATA: 10 * 60 * 1000 // 10 minutes
};

export const DEFAULT_HEADERS = {
  'Content-Type': 'application/json',
  'Accept': 'application/json'
};

// API Endpoints
export const API_ENDPOINTS = {
  // Dashboard
  DASHBOARD_STATS: '/api/dashboard/stats',
  DASHBOARD_ACTIVITY: '/api/dashboard/activity',
  DASHBOARD_PERFORMANCE: '/api/dashboard/performance',
  DASHBOARD_ALERTS: '/api/dashboard/alerts',
  DASHBOARD_METRICS: '/api/dashboard/metrics',
  
  // Users
  USERS_REGISTER: '/api/users/register',
  USERS_LIST: '/api/users',
  USER_DETAIL: '/api/users/:id',
  USER_UPDATE: '/api/users/:id',
  USER_VERIFY: '/api/users/:id/verify',
  USER_PROFILE: '/api/users/:id/profile',
  USER_STATEMENT: '/api/users/:id/statement',
  
  // Loans
  LOANS_APPLY: '/api/loans/apply',
  LOANS_LIST: '/api/loans',
  LOAN_DETAIL: '/api/loans/:id',
  LOAN_UPDATE: '/api/loans/:id',
  LOAN_APPROVE: '/api/loans/:id/approve',
  LOAN_REJECT: '/api/loans/:id/reject',
  LOAN_REPAY: '/api/loans/:id/repay',
  LOAN_SCHEDULE: '/api/loans/:id/schedule',
  LOANS_STATS: '/api/loans/stats',
  
  // Investments
  INVESTMENTS_CREATE: '/api/investments/create',
  INVESTMENTS_LIST: '/api/investments',
  INVESTMENT_DETAIL: '/api/investments/:id',
  INVESTMENT_UPDATE: '/api/investments/:id',
  INVESTMENT_PORTFOLIO: '/api/investments/user/:userId',
  INVESTMENT_WITHDRAW: '/api/investments/:id/withdraw',
  INVESTMENT_PERFORMANCE: '/api/investments/:id/performance',
  
  // Kiosks
  KIOSKS_LIST: '/api/kiosks',
  KIOSK_DETAIL: '/api/kiosks/:id',
  KIOSK_UPDATE: '/api/kiosks/:id',
  KIOSK_STATUS: '/api/kiosks/status',
  KIOSK_TRANSACTIONS: '/api/kiosks/:id/transactions',
  KIOSK_MAINTENANCE: '/api/kiosks/:id/maintenance',
  KIOSK_CASH: '/api/kiosks/:id/cash',
  KIOSK_REPORT: '/api/kiosks/:id/report',
  
  // AI Services
  AI_PREDICT: '/api/ai/predict',
  AI_ASSESS_CREDIT: '/api/ai/credit-assessment',
  AI_RECOMMEND: '/api/ai/recommend',
  AI_ANALYZE: '/api/ai/analyze',
  AI_SCORING: '/api/ai/scoring',
  
  // Reports
  REPORTS_GENERATE: '/api/reports/generate',
  REPORTS_LIST: '/api/reports',
  REPORT_DETAIL: '/api/reports/:id',
  REPORT_DOWNLOAD: '/api/reports/:id/download',
  REPORTS_ANALYTICS: '/api/reports/analytics',
  REPORTS_FINANCIAL: '/api/reports/financial',
  REPORTS_CLIENTS: '/api/reports/clients',
  REPORTS_LOANS: '/api/reports/loans',
  REPORTS_INVESTMENTS: '/api/reports/investments',
  REPORTS_KIOSKS: '/api/reports/kiosks',
  REPORTS_RISK: '/api/reports/risk',
  
  // Payments
  PAYMENTS_INITIATE: '/api/payments/initiate',
  PAYMENTS_STATUS: '/api/payments/:id/status',
  PAYMENTS_VERIFY: '/api/payments/:id/verify',
  MOBILE_MONEY_MTN: '/api/payments/mobile-money/mtn',
  MOBILE_MONEY_AIRTEL: '/api/payments/mobile-money/airtel',
  
  // Transactions
  TRANSACTIONS_LIST: '/api/transactions',
  TRANSACTION_DETAIL: '/api/transactions/:id',
  TRANSACTIONS_USER: '/api/transactions/user/:userId',
  TRANSACTIONS_EXPORT: '/api/transactions/export',
  
  // Notifications
  NOTIFICATIONS_LIST: '/api/notifications',
  NOTIFICATION_READ: '/api/notifications/:id/read',
  NOTIFICATIONS_SEND: '/api/notifications/send',
  NOTIFICATIONS_SETTINGS: '/api/notifications/settings',
  
  // System
  SYSTEM_STATUS: '/api/system/status',
  SYSTEM_LOGS: '/api/system/logs',
  SYSTEM_BACKUP: '/api/system/backup',
  SYSTEM_METRICS: '/api/system/metrics',
  SYSTEM_HEALTH: '/api/system/health',
  
  // Authentication
  AUTH_LOGIN: '/api/auth/login',
  AUTH_LOGOUT: '/api/auth/logout',
  AUTH_REFRESH: '/api/auth/refresh',
  AUTH_PROFILE: '/api/auth/profile',
  AUTH_CHANGE_PASSWORD: '/api/auth/change-password',
  
  // Settings
  SETTINGS_GENERAL: '/api/settings/general',
  SETTINGS_LOANS: '/api/settings/loans',
  SETTINGS_INVESTMENTS: '/api/settings/investments',
  SETTINGS_KIOSKS: '/api/settings/kiosks',
  SETTINGS_UPDATE: '/api/settings/update'
};

// Utility functions
export const getEndpoint = (endpoint, params = {}) => {
  let url = endpoint;
  Object.keys(params).forEach(key => {
    url = url.replace(`:${key}`, params[key]);
  });
  return url;
};

export const buildUrl = (endpoint, baseParams = {}, queryParams = {}) => {
  let url = getEndpoint(endpoint, baseParams);
  const queryString = new URLSearchParams(queryParams).toString();
  return queryString ? `${url}?${queryString}` : url;
};

export const getAuthHeaders = () => {
  const token = localStorage.getItem('authToken');
  return token ? { 'Authorization': `Bearer ${token}` } : {};
};

export const isSuccessStatus = (status) => {
  return status >= 200 && status < 300;
};

export const shouldRetry = (errorOrStatus) => {
  if (typeof errorOrStatus === 'number') {
    return errorOrStatus >= 500 || errorOrStatus === 429;
  }
  
  if (errorOrStatus instanceof Error) {
    return errorOrStatus.name !== 'AbortError' && 
           !errorOrStatus.message.includes('Network Error');
  }
  
  return false;
};