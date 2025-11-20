// src/app/403/page.tsx
'use client';

import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';
import { ShieldAlert, ArrowLeft, Home } from 'lucide-react';

export default function ForbiddenPage() {
  const router = useRouter();
  const { user, logout } = useAuth();

  return (
    <div className="min-h-screen bg-gradient-to-br from-red-50 via-white to-orange-50 flex items-center justify-center p-4">
      <div className="max-w-md w-full">
        <div className="bg-white rounded-2xl shadow-2xl p-8 text-center">
          {/* Icon */}
          <div className="inline-flex items-center justify-center w-20 h-20 bg-red-100 rounded-full mb-6">
            <ShieldAlert className="w-10 h-10 text-red-600" />
          </div>

          {/* Title */}
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Truy cập bị từ chối
          </h1>
          <p className="text-gray-600 mb-6">
            Bạn không có quyền truy cập vào trang này
          </p>

          {/* User Info */}
          {user && (
            <div className="bg-gray-50 rounded-lg p-4 mb-6 text-left">
              <p className="text-sm text-gray-600">Đăng nhập với tài khoản:</p>
              <p className="font-semibold text-gray-900 mt-1">{user.full_name}</p>
              <p className="text-sm text-gray-500">@{user.username}</p>
              {user.roles && user.roles.length > 0 && (
                <div className="mt-2 flex flex-wrap gap-2">
                  {user.roles.map((role) => (
                    <span
                      key={role.id}
                      className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded"
                    >
                      {role.name}
                    </span>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Actions */}
          <div className="space-y-3">
            <button
              onClick={() => router.back()}
              className="w-full flex items-center justify-center gap-2 px-6 py-3 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg font-medium transition-colors"
            >
              <ArrowLeft className="w-5 h-5" />
              Quay lại trang trước
            </button>

            <button
              onClick={() => router.push('/dashboard')}
              className="w-full flex items-center justify-center gap-2 px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors"
            >
              <Home className="w-5 h-5" />
              Về trang chủ
            </button>

            <button
              onClick={logout}
              className="w-full px-6 py-3 text-red-600 hover:text-red-700 font-medium transition-colors"
            >
              Đăng xuất và đăng nhập lại
            </button>
          </div>

          {/* Help Text */}
          <p className="text-xs text-gray-500 mt-6">
            Nếu bạn nghĩ đây là lỗi, vui lòng liên hệ quản trị viên
          </p>
        </div>
      </div>
    </div>
  );
}