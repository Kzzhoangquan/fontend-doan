// src/components/auth/ProtectedRoute.tsx
'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';
import { UserRole } from '@/lib/constants/roles';

interface ProtectedRouteProps {
  children: React.ReactNode;
  requiredRoles?: UserRole[];
  requireAny?: boolean; // true: cần ít nhất 1 role, false: cần tất cả roles
}

export default function ProtectedRoute({ 
  children, 
  requiredRoles = [],
  requireAny = true 
}: ProtectedRouteProps) {
  const router = useRouter();
  const { isAuthenticated, user, hasAnyRole, hasAllRoles } = useAuth();

  useEffect(() => {
    // Chưa đăng nhập → redirect login
    if (!isAuthenticated) {
      router.push('/auth/login');
      return;
    }

    // Đã đăng nhập nhưng không có quyền → redirect 403
    if (requiredRoles.length > 0) {
      const hasPermission = requireAny 
        ? hasAnyRole(requiredRoles)
        : hasAllRoles(requiredRoles);

      if (!hasPermission) {
        router.push('/403');
        return;
      }
    }
  }, [isAuthenticated, user, requiredRoles, requireAny, router, hasAnyRole, hasAllRoles]);

  // Loading state
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Đang xác thực...</p>
        </div>
      </div>
    );
  }

  // Check permission
  if (requiredRoles.length > 0) {
    const hasPermission = requireAny 
      ? hasAnyRole(requiredRoles)
      : hasAllRoles(requiredRoles);

    if (!hasPermission) {
      return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Đang kiểm tra quyền truy cập...</p>
          </div>
        </div>
      );
    }
  }

  return <>{children}</>;
}