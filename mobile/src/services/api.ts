import axios from 'axios';

const API_BASE_URL = 'http://localhost:8083';

const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
});

export const userService = {
  register: (userData: any) => api.post('/users/register', userData),
  getById: (userId: string) => api.get(`/users/${userId}`),
};

export const aiService = {
  predict: (data: any) => api.post('/ai/predict', data),
};

export const loanService = {
  apply: (data: any) => api.post('/loans/apply', data),
};

export const investmentService = {
  create: (data: any) => api.post('/investments', data),
};

export default api;