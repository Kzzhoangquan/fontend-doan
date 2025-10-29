import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface UserState {
  language: 'vi' | 'en';
  notifications: any[]; // Nên định nghĩa rõ kiểu notification nếu có
}

const initialState: UserState = {
  language: 'vi',
  notifications: [],
};

const userSlice = createSlice({
  name: 'user',
  initialState,
  reducers: {
    setLanguage: (state, action: PayloadAction<'vi' | 'en'>) => {
      state.language = action.payload;
    },
    addNotification: (state, action: PayloadAction<any>) => {
      state.notifications.push(action.payload);
    },
    clearNotifications: (state) => {
      state.notifications = [];
    },
  },
});

export const { setLanguage, addNotification, clearNotifications } = userSlice.actions;
export default userSlice.reducer;