'use client';

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { verifyEmail, resendVerificationEmail } from '@/lib/api/auth';
import { Building2, CheckCircle2, XCircle, Mail, Loader2 } from 'lucide-react';
import Link from 'next/link';

export default function VerifyEmailPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get('token');
  const email = searchParams.get('email');

  const [status, setStatus] = useState<'loading' | 'success' | 'error' | 'idle'>('idle');
  const [message, setMessage] = useState('');
  const [resendLoading, setResendLoading] = useState(false);
  const [resendEmail, setResendEmail] = useState('');

  useEffect(() => {
    if (token) {
      handleVerify(token);
    }
  }, [token]);

  const handleVerify = async (verifyToken: string) => {
    setStatus('loading');
    setMessage('Đang xác thực email...');

    try {
      // Gọi POST API để verify
      const result = await verifyEmail(verifyToken);
      setStatus('success');
      setMessage(result.message || 'Email đã được xác thực thành công!');
      
      // Redirect to login after 2 seconds
      setTimeout(() => {
        router.push('/auth/login');
      }, 2000);
    } catch (err: any) {
      setStatus('error');
      const errorMessage = err.message || 'Link xác thực không hợp lệ hoặc đã hết hạn.';
      setMessage(errorMessage);
    }
  };

  const handleResend = async () => {
    if (!resendEmail) {
      setMessage('Vui lòng nhập email');
      return;
    }

    setResendLoading(true);
    setMessage('');

    try {
      await resendVerificationEmail(resendEmail);
      setStatus('success');
      setMessage('Email xác thực đã được gửi lại. Vui lòng kiểm tra hộp thư của bạn.');
    } catch (err: any) {
      setStatus('error');
      setMessage(err.message || 'Không thể gửi email xác thực');
    } finally {
      setResendLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-600 rounded-2xl mb-4">
            <Building2 className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900">Xác thực Email</h1>
        </div>

        {/* Card */}
        <div className="bg-white rounded-2xl shadow-xl p-8">
          {status === 'loading' && (
            <div className="text-center py-8">
              <Loader2 className="w-12 h-12 text-blue-600 animate-spin mx-auto mb-4" />
              <p className="text-gray-600">{message}</p>
            </div>
          )}

          {status === 'success' && (
            <div className="text-center py-8">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-green-100 rounded-full mb-4">
                <CheckCircle2 className="w-8 h-8 text-green-600" />
              </div>
              <h2 className="text-xl font-bold text-gray-900 mb-2">Xác thực thành công!</h2>
              <p className="text-gray-600 mb-6">{message}</p>
              <p className="text-sm text-gray-500 mb-4">Đang chuyển hướng đến trang đăng nhập...</p>
              <Link
                href="/auth/login"
                className="inline-block px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                Đăng nhập ngay
              </Link>
            </div>
          )}

          {status === 'error' && (
            <div className="text-center py-8">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-red-100 rounded-full mb-4">
                <XCircle className="w-8 h-8 text-red-600" />
              </div>
              <h2 className="text-xl font-bold text-gray-900 mb-2">Xác thực thất bại</h2>
              <p className="text-gray-600 mb-6">{message}</p>

              {/* Resend verification */}
              <div className="mt-6 space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Gửi lại email xác thực
                  </label>
                  <div className="flex gap-2">
                    <input
                      type="email"
                      value={resendEmail || email || ''}
                      onChange={(e) => setResendEmail(e.target.value)}
                      placeholder="Nhập email của bạn"
                      className="flex-1 px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                    />
                    <button
                      onClick={handleResend}
                      disabled={resendLoading}
                      className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 flex items-center gap-2"
                    >
                      {resendLoading ? (
                        <Loader2 className="w-4 h-4 animate-spin" />
                      ) : (
                        <Mail className="w-4 h-4" />
                      )}
                      Gửi lại
                    </button>
                  </div>
                </div>
                <Link
                  href="/auth/login"
                  className="block text-center text-blue-600 hover:text-blue-700 text-sm"
                >
                  Quay lại đăng nhập
                </Link>
              </div>
            </div>
          )}

          {status === 'idle' && !token && (
            <div className="text-center py-8">
              <Mail className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <h2 className="text-xl font-bold text-gray-900 mb-2">Chưa có token xác thực</h2>
              <p className="text-gray-600 mb-6">
                Vui lòng kiểm tra email và click vào link xác thực.
              </p>
              <Link
                href="/auth/login"
                className="inline-block px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                Quay lại đăng nhập
              </Link>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

