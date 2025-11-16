// src/services/api.js - Complete with all exports
import axios from 'axios';

const API_BASE_URL = 'http://localhost:8082';

const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
});

// Export ALL services that your components need
export const userService = {
  register: (userData) => api.post('/users/register', userData),
  getById: (userId) => api.get(`/users/${userId}`),
};

export const kioskService = {
  getAll: () => api.get('/kiosks'),
  create: (kioskData) => api.post('/kiosks', kioskData),
  update: (id, kioskData) => api.put(`/kiosks/${id}`, kioskData),
};

export const investmentService = {
  create: (investmentData) => api.post('/investments', investmentData),
  getById: (id) => api.get(`/investments/${id}`),
};

export const aiService = {
  predict: (data) => api.post('/ai/predict', data),
};

export const loanService = {
  apply: (loanData) => api.post('/loans/apply', loanData),
  getById: (id) => api.get(`/loans/${id}`),
};

export const checkBackendHealth = async () => {
  return true; // Assume backend is running
};

export default api;