'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAppDispatch } from '@/store/hooks';
import { setCredentials } from '@/store/slices/authSlice';
import { login, getTokens, refreshToken } from '@/lib/api/auth';
import { storage } from '@/lib/api/storage';
import { isTokenValid, isTokenExpired } from '@/lib/utils/jwt';
import { Building2 } from 'lucide-react';

export default function LoginPage() {
  const router = useRouter();
  const dispatch = useAppDispatch();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [checkingAuth, setCheckingAuth] = useState(true);

  // Check authentication status on mount
  useEffect(() => {
    const checkAuthAndRedirect = async () => {
      try {
        const tokens = getTokens();
        
        if (!tokens) {
          setCheckingAuth(false);
          return;
        }

        const { accessToken, refreshToken: refresh } = tokens;

        // Check if access token is still valid
        if (isTokenValid(accessToken)) {
          // Access token is valid, redirect to dashboard
          const user = storage.getUser();
          if (user) {
            dispatch(setCredentials({ user }));
          }
          router.push('/dashboard');
          return;
        }

        // Access token expired, check refresh token
        if (refresh && isTokenValid(refresh)) {
          // Refresh token is valid, try to refresh access token
          try {
            await refreshToken();
            const updatedUser = storage.getUser();
            if (updatedUser) {
              dispatch(setCredentials({ user: updatedUser }));
            }
            router.push('/dashboard');
            return;
          } catch (refreshError) {
            console.error('Failed to refresh token:', refreshError);
            // Refresh failed, clear tokens and show login form
            storage.removeTokens();
          }
        } else {
          // Both tokens expired, clear and show login form
          storage.removeTokens();
        }
      } catch (error) {
        console.error('Error checking auth:', error);
        storage.removeTokens();
      } finally {
        setCheckingAuth(false);
      }
    };

    checkAuthAndRedirect();
  }, [router, dispatch]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const { user } = await login(username, password);
      dispatch(setCredentials({ user }));
      
      // REDIRECT VỀ DASHBOARD
      window.location.href = '/dashboard';
    } catch (err: any) {
      const errorMessage = err.message || 'Đăng nhập thất bại';
      setError(errorMessage);
      
      // Nếu lỗi là chưa verify, hiển thị link resend
      if (errorMessage.includes('chưa được xác thực') || errorMessage.includes('verify')) {
        // Có thể thêm UI để resend verification email
      }
      
      console.error('Login error:', err);
    } finally {
      setLoading(false);
    }
  };

  // Show loading while checking auth
  if (checkingAuth) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex items-center justify-center p-4">
        <div className="w-full max-w-md">
          <div className="bg-white rounded-2xl shadow-2xl p-8 text-center">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-blue-600 to-purple-600 rounded-2xl mb-4">
              <Building2 className="w-8 h-8 text-white" />
            </div>
            <p className="text-gray-600">Đang kiểm tra phiên đăng nhập...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="bg-white rounded-2xl shadow-2xl p-8">
          {/* Logo & Title */}
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-blue-600 to-purple-600 rounded-2xl mb-4">
              <Building2 className="w-8 h-8 text-white" />
            </div>
            <h1 className="text-2xl font-bold text-gray-900">Đăng nhập</h1>
            <p className="text-gray-500 mt-2">Hệ thống Quản lý Nhân sự & Dự án</p>
          </div>

          {/* Error Message */}
          {error && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg animate-shake">
              <p className="text-sm text-red-600 text-center">{error}</p>
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleLogin} className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Tên đăng nhập
              </label>
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="w-full px-4 py-3 text-gray-900 bg-gray-50 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
                placeholder="Nhập tên đăng nhập"
                required
                disabled={loading}
                autoComplete="username"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Mật khẩu
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-4 py-3 text-gray-900 bg-gray-50 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
                placeholder="Nhập mật khẩu"
                required
                disabled={loading}
                autoComplete="current-password"
              />
            </div>

            <div className="flex items-center justify-between">
              <label className="flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  className="w-4 h-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  disabled={loading}
                />
                <span className="ml-2 text-sm text-gray-600">Ghi nhớ đăng nhập</span>
              </label>
              <a
                href="#"
                className="text-sm text-blue-600 hover:text-blue-700 hover:underline transition-colors"
              >
                Quên mật khẩu?
              </a>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-gradient-to-r from-blue-600 to-purple-600 text-white py-3 rounded-lg font-medium hover:shadow-lg hover:from-blue-700 hover:to-purple-700 transform hover:-translate-y-0.5 transition-all disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
            >
              {loading ? (
                <span className="flex items-center justify-center">
                  <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Đang đăng nhập...
                </span>
              ) : (
                'Đăng nhập'
              )}
            </button>
          </form>

          {/* Footer */}
          <div className="mt-6 text-center text-sm text-gray-500">
            <p>Chưa có tài khoản? <a href="#" className="text-blue-600 hover:underline">Đăng ký ngay</a></p>
          </div>
        </div>
      </div>
    </div>
  );
}