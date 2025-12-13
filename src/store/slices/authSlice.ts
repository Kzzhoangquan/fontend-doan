// src/store/slices/authSlice.ts
import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { storage } from '@/lib/api/storage';
import { User, getUserRoles } from '@/lib/helpers/auth';
import { UserRole } from '@/lib/constants/roles';

interface AuthState {
  isAuthenticated: boolean;
  user: User | null;
  userRoles: UserRole[];
}

const initialState: AuthState = {
  isAuthenticated: false,
  user: null,
  userRoles: [],
};

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    setCredentials: (state, action: PayloadAction<{ user: User }>) => {
      state.isAuthenticated = true;
      state.user = action.payload.user;
      state.userRoles = getUserRoles(action.payload.user);
      // Lưu vào localStorage
      storage.setUser(action.payload.user);
    },
    logout: (state) => {
      state.isAuthenticated = false;
      state.user = null;
      state.userRoles = [];
      // Xóa localStorage
      storage.removeTokens();
    },
    // Khôi phục state từ localStorage (dùng khi app reload)
    restoreAuth: (state) => {
      const user = storage.getUser();
      const tokens = storage.getTokens();
      if (user && tokens) {
        state.isAuthenticated = true;
        state.user = user;
        state.userRoles = getUserRoles(user);
      }
    },
    // Cập nhật thông tin user (dùng khi update profile)
    updateUser: (state, action: PayloadAction<{ user: Partial<User> }>) => {
      if (state.user) {
        state.user = { ...state.user, ...action.payload.user };
        // Cập nhật localStorage
        storage.setUser(state.user);
      }
    },
  },
});

export const { setCredentials, logout, restoreAuth, updateUser } = authSlice.actions;
export default authSlice.reducer;