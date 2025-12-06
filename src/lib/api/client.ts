import axios from 'axios';
import { getToken, removeToken } from '@/lib/utils/auth';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || '/api';

export const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor
apiClient.interceptors.request.use(
  (config) => {
    const token = getToken();
    console.log('[API] Request:', config.url, '| Token:', token ? 'YES' : 'NO');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    // Skip redirect for specific endpoints that might fail without breaking the app
    const skipRedirectUrls = [
      '/attendance/verify/today-status',
      '/attendance/devices',
    ];
    
    const requestUrl = error.config?.url || '';
    const shouldSkipRedirect = skipRedirectUrls.some(url => requestUrl.includes(url));
    
    if (error.response?.status === 401 && !shouldSkipRedirect) {
      removeToken();
      window.location.href = '/auth/login';
    }
    return Promise.reject(error);
  }
);