// src/store/middleware/persistAuth.tsx
'use client';

import { useEffect } from 'react';
import { useAppDispatch } from '../hooks';
import { restoreAuth } from '../slices/authSlice';

export function PersistAuth() {
  const dispatch = useAppDispatch();

  useEffect(() => {
    // restoreAuth sẽ tự động load user và tokens từ storage
    dispatch(restoreAuth());
  }, [dispatch]);

  return null;
}