// src/store/slices/authSlice.ts
import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { UserRole } from '@/lib/constants/roles';
import { saveState, removeState } from '@/lib/utils/storage';

interface AuthState {
  isAuthenticated: boolean;
  token: string | null;
  user: {
    id: string;
    email: string;
    name: string;
    role: UserRole;
    avatar?: string;
  } | null;
}

const initialState: AuthState = {
  isAuthenticated: false,
  token: null,
  user: null,
};

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    setCredentials: (
      state,
      action: PayloadAction<{ token: string; user: AuthState['user'] }>
    ) => {
      state.isAuthenticated = true;
      state.token = action.payload.token;
      state.user = action.payload.user;

      // Lưu vào localStorage
      saveState('auth', state);
    },
    logout: (state) => {
      state.isAuthenticated = false;
      state.token = null;
      state.user = null;

      // Xóa khỏi localStorage
      removeState('auth');
    },
  },
});

export const { setCredentials, logout } = authSlice.actions;
export default authSlice.reducer;