// src/lib/api/axios.ts
import axios, { AxiosInstance } from 'axios';
import { storage } from './storage';

// GỌI QUA /api PROXY (Next.js API Routes)
const API_BASE = '/api';

const api: AxiosInstance = axios.create({
  baseURL: API_BASE,
  timeout: 10000,
  headers: { 'Content-Type': 'application/json' },
});

// === REQUEST INTERCEPTOR: TỰ ĐỘNG THÊM JWT ===
api.interceptors.request.use((config) => {
  const tokens = storage.getTokens();
  if (tokens?.accessToken) {
    config.headers.Authorization = `Bearer ${tokens.accessToken}`;
  }
  return config;
});

// === RESPONSE INTERCEPTOR: AUTO REFRESH TOKEN ===
let isRefreshing = false;
let failedQueue: Array<{
  resolve: (value?: any) => void;
  reject: (reason?: any) => void;
}> = [];

const processQueue = (error: any, token: string | null = null) => {
  failedQueue.forEach((prom) => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve(token);
    }
  });
  failedQueue = [];
};

api.interceptors.response.use(
  (res) => res,
  async (error) => {
    const originalRequest = error.config;

    // NẾU LÀ REQUEST REFRESH THÌ KHÔNG RETRY
    if (originalRequest.url?.includes('/auth/refresh')) {
      console.error('❌ Refresh token failed');
      storage.removeTokens();
      window.location.href = '/auth/login';
      return Promise.reject(error);
    }

    // 401 VÀ CHƯA RETRY
    if (error.response?.status === 401 && !originalRequest._retry) {
      console.log('🔄 Token expired, refreshing...');
      
      // NẾU ĐANG REFRESH → ĐỢI TRONG QUEUE
      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        })
          .then((token) => {
            originalRequest.headers.Authorization = `Bearer ${token}`;
            return api(originalRequest);
          })
          .catch((err) => Promise.reject(err));
      }

      originalRequest._retry = true;
      isRefreshing = true;

      try {
        const tokens = storage.getTokens();
        if (!tokens?.refreshToken) {
          throw new Error('No refresh token');
        }

        console.log('📡 Calling refresh token API...');
        
        // GỌI API REFRESH
        const res = await axios.post(`${API_BASE}/auth/refresh`, {
          refresh_token: tokens.refreshToken,
        });

        const { access_token, refresh_token } = res.data;
        const newTokens = {
          accessToken: access_token,
          refreshToken: refresh_token,
        };
        
        console.log('✅ Token refreshed successfully');
        storage.setTokens(newTokens);

        // RETRY REQUEST GỐC
        originalRequest.headers.Authorization = `Bearer ${access_token}`;
        processQueue(null, access_token);

        return api(originalRequest);
      } catch (refreshError: any) {
        console.error('❌ Refresh token error:', refreshError);
        processQueue(refreshError, null);
        storage.removeTokens();
        window.location.href = '/auth/login';
        return Promise.reject(refreshError);
      } finally {
        isRefreshing = false;
      }
    }

    // 403 - FORBIDDEN (Không có quyền)
    if (error.response?.status === 403) {
      console.warn('⛔ 403 Forbidden: Bạn không có quyền truy cập');
      // Có thể show toast notification ở đây
    }

    return Promise.reject(error);
  }
);

export default api;