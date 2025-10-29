import { useAuth } from './useAuth';
import { UserRole } from '@/lib/constants/roles';

export const useRole = () => {
  const { user } = useAuth();
  
  const hasRole = (role: UserRole): boolean => {
    return user?.role === role;
  };
  
  const hasAnyRole = (roles: UserRole[]): boolean => {
    return roles.includes(user?.role as UserRole);
  };
  
  return {
    role: user?.role,
    hasRole,
    hasAnyRole,
  };
};