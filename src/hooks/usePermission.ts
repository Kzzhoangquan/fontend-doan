import { UserRole } from '@/lib/constants/roles';
import { useAuth } from './useAuth';

export const usePermission = () => {
  const { user } = useAuth(); // Destructure user, not role

  const hasRole = (allowedRoles: UserRole[]) => {
    return user?.role ? allowedRoles.includes(user.role) : false;
  };

  return { hasRole };
};