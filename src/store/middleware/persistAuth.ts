// src/store/middleware/persistAuth.tsx
'use client';

import { useEffect } from 'react';
import { useAppDispatch } from '../hooks';
import { setCredentials } from '../slices/authSlice';
import { loadState } from '@/lib/utils/storage';

export function PersistAuth() {
  const dispatch = useAppDispatch();

  useEffect(() => {
    const auth = loadState('auth');
    if (auth?.isAuthenticated && auth.token && auth.user) {
      dispatch(setCredentials({ token: auth.token, user: auth.user }));
    }
  }, [dispatch]);

  return null;
}