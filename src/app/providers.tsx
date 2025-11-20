'use client';

import { Provider } from 'react-redux';
import { store } from '@/store';
import { restoreAuth } from '@/store/slices/authSlice';
import { useEffect, useState } from 'react';

function AuthRestorer({ children }: { children: React.ReactNode }) {
  const [isRestored, setIsRestored] = useState(false);

  useEffect(() => {
    // Khôi phục auth từ localStorage khi app load
    store.dispatch(restoreAuth());
    setIsRestored(true);
  }, []);

  // Hiển thị loading khi đang restore (tránh flash)
  if (!isRestored) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return <>{children}</>;
}

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <Provider store={store}>
      <AuthRestorer>{children}</AuthRestorer>
    </Provider>
  );
} 