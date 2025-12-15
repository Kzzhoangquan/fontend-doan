// src/lib/api/axios.ts
import axios, { AxiosInstance } from 'axios';
import { storage } from './storage';
import { message } from 'antd';

const API_BASE = '/api';

const api: AxiosInstance = axios.create({
  baseURL: API_BASE,
  timeout: 10000,
  headers: { 'Content-Type': 'application/json' },
});

// === HELPER: EXTRACT ERROR MESSAGE ===
const getErrorMessage = (error: any): string => {
  // Nếu có response từ server
  if (error.response?.data) {
    const data = error.response.data;
    
    // NestJS error format
    if (data.message) {
      if (Array.isArray(data.message)) {
        return data.message.join(', ');
      }
      return data.message;
    }
    
    // Custom error format
    if (data.error) {
      return data.error;
    }
  }
  
  // Network errors
  if (error.message === 'Network Error') {
    return 'Không thể kết nối đến server. Vui lòng kiểm tra kết nối mạng.';
  }
  
  // Timeout
  if (error.code === 'ECONNABORTED') {
    return 'Yêu cầu quá thời gian chờ. Vui lòng thử lại.';
  }
  
  // Default message
  return error.message || 'Đã xảy ra lỗi. Vui lòng thử lại.';
};

// === HELPER: SHOW ERROR NOTIFICATION ===
const showErrorNotification = (error: any, skipNotification?: boolean) => {
  // Skip notification nếu được yêu cầu (ví dụ: silent refresh)
  if (skipNotification) return;
  
  const statusCode = error.response?.status;
  const errorMessage = getErrorMessage(error);
  
  // Customize message based on status code
  switch (statusCode) {
    case 400:
      message.error(`Dữ liệu không hợp lệ: ${errorMessage}`);
      break;
    case 401:
      // Don't show error for 401 - auto refresh will handle it
      break;
    case 403:
      message.error('Bạn không có quyền thực hiện thao tác này');
      break;
    case 404:
      message.error('Không tìm thấy tài nguyên yêu cầu');
      break;
    case 409:
      message.error(`Xung đột dữ liệu: ${errorMessage}`);
      break;
    case 422:
      message.error(`Dữ liệu không hợp lệ: ${errorMessage}`);
      break;
    case 429:
      message.warning('Bạn đang thực hiện quá nhiều yêu cầu. Vui lòng thử lại sau.');
      break;
    case 500:
    case 502:
    case 503:
    case 504:
      message.error('Lỗi server. Vui lòng thử lại sau.');
      break;
    default:
      message.error(errorMessage);
  }
};

// === REQUEST INTERCEPTOR: TỰ ĐỘNG THÊM JWT ===
api.interceptors.request.use(
  (config) => {
    const tokens = storage.getTokens();
    if (tokens?.accessToken) {
      config.headers.Authorization = `Bearer ${tokens.accessToken}`;
    }
    return config;
  },
  (error) => {
    showErrorNotification(error);
    return Promise.reject(error);
  }
);

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
      message.error('Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại.');
      setTimeout(() => {
        window.location.href = '/auth/login';
      }, 1000);
      return Promise.reject(error);
    }

    // 401 VÀ CHƯA RETRY
    // Skip refresh logic for login endpoint - login errors should be handled by login page
    if (error.response?.status === 401 && !originalRequest._retry && !originalRequest.url?.includes('/auth/login')) {
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
          .catch((err) => {
            showErrorNotification(err);
            return Promise.reject(err);
          });
      }

      originalRequest._retry = true;
      isRefreshing = true;

      try {
        const tokens = storage.getTokens();
        if (!tokens?.refreshToken) {
          // Don't show error for missing refresh token - just reject the request
          // This happens when user is not logged in yet
          return Promise.reject(error);
        }

        console.log('📡 Calling refresh token API...');
        
        // ✅ GỌI API REFRESH VỚI BEARER TOKEN TRONG HEADER
        const res = await axios.post(
          `${API_BASE}/auth/refresh`,
          {}, // Body rỗng
          {
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${tokens.refreshToken}`, // ✅ Gửi refresh_token qua header
            },
          }
        );

        const { access_token, refresh_token } = res.data;
        const newTokens = {
          accessToken: access_token,
          refreshToken: refresh_token,
        };
        
        console.log('✅ Token refreshed successfully');
        storage.setTokens(newTokens);

        // RETRY REQUEST GỐC VỚI TOKEN MỚI
        originalRequest.headers.Authorization = `Bearer ${access_token}`;
        processQueue(null, access_token);

        return api(originalRequest);
      } catch (refreshError: any) {
        console.error('❌ Refresh token error:', refreshError);
        processQueue(refreshError, null);
        storage.removeTokens();
        // Only show error and redirect if not already on login page
        if (!window.location.pathname.includes('/auth/login')) {
        message.error('Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại.');
        setTimeout(() => {
          window.location.href = '/auth/login';
        }, 1000);
        }
        return Promise.reject(refreshError);
      } finally {
        isRefreshing = false;
      }
    }

    // HIỂN thị error notification cho tất cả các lỗi khác
    // Skip notification for login endpoint - let login page handle it
    if (!error.config?.url?.includes('/auth/login')) {
    showErrorNotification(error);
    }

    return Promise.reject(error);
  }
);

export default api;