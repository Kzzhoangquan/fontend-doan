// src/hooks/useAuth.ts
import { useAppSelector } from '@/store/hooks';
import { logout as logoutAction } from '@/store/slices/authSlice';
import { useAppDispatch } from '@/store/hooks';
import { logout as logoutApi } from '@/lib/api/auth';
import { UserRole } from '@/lib/constants/roles';
import { hasRole, hasAnyRole, hasAllRoles } from '@/lib/helpers/auth';

export function useAuth() {
  const dispatch = useAppDispatch();
  const { isAuthenticated, user, userRoles } = useAppSelector((state) => state.auth);

  const logout = () => {
    dispatch(logoutAction());
    logoutApi();
  };

  return {
    isAuthenticated,
    user,
    userRoles,
    logout,
    // Helper functions
    hasRole: (role: UserRole) => hasRole(user, role),
    hasAnyRole: (roles: UserRole[]) => hasAnyRole(user, roles),
    hasAllRoles: (roles: UserRole[]) => hasAllRoles(user, roles),
  };
}