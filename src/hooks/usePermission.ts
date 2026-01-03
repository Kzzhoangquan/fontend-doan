import { UserRole } from '@/lib/constants/roles';
import { useAuth } from './useAuth';

export const usePermission = () => {
  const { hasAnyRole } = useAuth();

  const hasRole = (allowedRoles: UserRole[]) => {
    return hasAnyRole(allowedRoles);
  };

  return { hasRole };
};