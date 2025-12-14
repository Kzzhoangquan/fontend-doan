import { useAuth } from './useAuth';
import { UserRole } from '@/lib/constants/roles';
import { getUserRoles } from '@/lib/helpers/auth';

export const useRole = () => {
  const { user, hasRole, hasAnyRole } = useAuth();
  
  // Get first role or null
  const userRoles = getUserRoles(user);
  const role = userRoles.length > 0 ? userRoles[0] : null;
  
  return {
    role,
    hasRole,
    hasAnyRole,
  };
};