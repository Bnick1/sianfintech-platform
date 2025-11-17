import axios from 'axios';

const API_BASE_URL = 'https://sianfintech-backend.vercel.app';

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
  try {
    const response = await api.get('/health');
    return response.status === 200;
  } catch (error) {
    console.error('Backend health check failed:', error);
    return false;
  }
};

export default api;