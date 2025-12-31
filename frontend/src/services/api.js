// src/services/api.js
import axios from 'axios';

const API_BASE_URL = 'https://sianfintech-platform.onrender.com';

const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
});

// Export ALL services that your components need
export const userService = {
  register: (userData) => api.post('/api/users/register', userData),
  getById: (userId) => api.get(`/api/users/${userId}`),
};

export const kioskService = {
  getAll: () => api.get('/api/kiosks'),
  create: (kioskData) => api.post('/api/kiosks', kioskData),
  update: (id, kioskData) => api.put(`/api/kiosks/${id}`, kioskData),
};

export const investmentService = {
  create: (investmentData) => api.post('/api/investments', investmentData),
  getById: (id) => api.get(`/api/investments/${id}`),
};

export const aiService = {
  predict: (data) => api.post('/api/ai/predict', data),
};

export const loanService = {
  apply: (loanData) => api.post('/api/loans/apply', loanData),
  getById: (id) => api.get(`/api/loans/${id}`),
};

export const checkBackendHealth = async () => {
  try {
    const response = await api.get('/health');
    return response.status === 200;
  } catch (error) {
    console.error('Backend health check failed:', error);
    return false;
  }
};

export default api;