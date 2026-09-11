import axios from 'axios';

const rawBase = (import.meta.env.VITE_API_URL || '/api').trim();
const API_BASE_URL = rawBase === '/api'
  ? '/api'
  : rawBase.endsWith('/api')
  ? rawBase
  : `${rawBase.replace(/\/+$/, '')}/api`;

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor: attach token
api.interceptors.request.use(
  (config) => {
    // Admin routes (-/admin/* and the now admin-only leaderboard) must use the admin token;
    // participant routes use the participant token
    const isAdminRoute =
      config.url &&
      (config.url.startsWith('/admin/') || config.url.startsWith('/leaderboard'));
    const token = isAdminRoute
      ? localStorage.getItem('tecxl_admin_token')
      : localStorage.getItem('tecxl_token') || localStorage.getItem('tecxl_admin_token');
    if (token) {
      config.headers['Authorization'] = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor: handle token expiry
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      // If unauthorized and on a protected route, notify or clean up token
      console.warn('Session expired or unauthorized request.');
    }
    return Promise.reject(error);
  }
);

export default api;
