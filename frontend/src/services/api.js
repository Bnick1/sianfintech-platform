const API_BASE_URL = 'https://sianfintech-backend.vercel.app'; // Your actual backend URL

const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
});

// ... rest of your code ...

export const checkBackendHealth = async () => {
  try {
    const response = await api.get('/health'); // Or whatever your health endpoint is
    return response.status === 200;
  } catch (error) {
    console.error('Backend health check failed:', error);
    return false;
  }
};