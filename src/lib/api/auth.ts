// src/lib/api/auth.ts
import api from './axios';
import { storage } from './storage';

export const login = async (username: string, password: string) => {
  try {
    // BƯỚC 1: GỌI API LOGIN
    const res = await api.post('/auth/login', { username, password });
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
    const message =
      error.response?.data?.message ||
      error.message ||
      'Đăng nhập thất bại';
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