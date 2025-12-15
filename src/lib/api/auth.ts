// src/lib/api/auth.ts
import api from './axios';
import axios from 'axios';
import { storage } from './storage';

const API_BASE = '/api';

export const login = async (username: string, password: string) => {
  try {
    // BƯỚC 1: GỌI API LOGIN
    const res = await api.post('/auth/login', { username, password });
    
    // Check if 2FA is required
    if (res.data.requires2FA) {
      return {
        requires2FA: true,
        username: res.data.username,
        message: res.data.message || 'Vui lòng nhập mã OTP đã được gửi đến email của bạn.',
      };
    }

    const { access_token, refresh_token } = res.data;

    // BƯỚC 2: LƯU TOKEN
    const tokens = { accessToken: access_token, refreshToken: refresh_token };
    storage.setTokens(tokens);

    // BƯỚC 3: LẤY PROFILE
    const profileRes = await api.get('/auth/profile');
    const user = profileRes.data;
    storage.setUser(user);

    return { user };
  } catch (error: any) {
    // XỬ LÝ LỖI
    // NestJS returns error in error.response.data.message
    const message =
      error.response?.data?.message ||
      error.response?.data?.error ||
      error.message ||
      'Đăng nhập thất bại';
    
    console.log('[Auth API] Login error:', {
      response: error.response?.data,
      message: error.message,
      finalMessage: message,
    });
    
    throw new Error(message);
  }
};

/**
 * Verify login OTP for 2FA
 */
export const verifyLoginOTP = async (username: string, otp: string) => {
  try {
    const res = await api.post('/auth/verify-login-otp', { username, otp });
    const { access_token, refresh_token } = res.data;

    // Save tokens
    const tokens = { accessToken: access_token, refreshToken: refresh_token };
    storage.setTokens(tokens);

    // Get user profile
    const profileRes = await api.get('/auth/profile');
    const user = profileRes.data;
    storage.setUser(user);

    return { user };
  } catch (error: any) {
    const message =
      error.response?.data?.message ||
      error.response?.data?.error ||
      error.message ||
      'Xác thực OTP thất bại';
    throw new Error(message);
  }
};

export const logout = () => {
  storage.removeTokens();
  window.location.href = '/auth/login';
};

export const getCurrentUser = () => {
  return storage.getUser();
};

export const getTokens = () => {
  return storage.getTokens();
};

/**
 * Refresh access token using refresh token
 */
export const refreshToken = async () => {
  try {
    const tokens = storage.getTokens();
    if (!tokens?.refreshToken) {
      throw new Error('No refresh token');
    }

    // Call refresh API with refresh token in Authorization header
    // Use axios directly to avoid interceptor adding old access token
    const res = await axios.post(
      `${API_BASE}/auth/refresh`,
      {},
      {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${tokens.refreshToken}`,
        },
      }
    );

    const { access_token, refresh_token } = res.data;
    const newTokens = {
      accessToken: access_token,
      refreshToken: refresh_token,
    };
    
    storage.setTokens(newTokens);
    
    // Get user profile and update storage
    try {
      const profileRes = await api.get('/auth/profile');
      storage.setUser(profileRes.data);
    } catch (profileError) {
      console.warn('Failed to get profile after refresh:', profileError);
    }

    return newTokens;
  } catch (error: any) {
    storage.removeTokens();
    throw error;
  }
};

export const verifyEmail = async (token: string) => {
  try {
    const res = await api.post('/auth/verify-email', { token });
    return res.data;
  } catch (error: any) {
    const message =
      error.response?.data?.message ||
      error.message ||
      'Xác thực email thất bại';
    throw new Error(message);
  }
};

export const resendVerificationEmail = async (email: string) => {
  try {
    const res = await api.post('/auth/resend-verification', { email });
    return res.data;
  } catch (error: any) {
    const message =
      error.response?.data?.message ||
      error.message ||
      'Gửi email xác thực thất bại';
    throw new Error(message);
  }
};