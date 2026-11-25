import axios from 'axios';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 8000,
});

// Attach JWT token from localStorage if present
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('campusresolve_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor to format errors gracefully
api.interceptors.response.use(
  (response) => response,
  (error) => {
    const requestUrl = error.config?.url || '';
    const isPublicAuthRequest =
      requestUrl.includes('/auth/login') || requestUrl.includes('/auth/register');

    if (
      error.response?.status === 401 &&
      !isPublicAuthRequest &&
      localStorage.getItem('campusresolve_token')
    ) {
      window.dispatchEvent(new Event('campusresolve:auth-expired'));
    }

    // Graceful log without crashing UI when server is offline
    if (error.code === 'ERR_NETWORK' || error.message?.includes('Network Error')) {
      console.warn('Backend server not connected. Running seamlessly in local demo mode.');
    }
    return Promise.reject(error);
  }
);

export default api;
