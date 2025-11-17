// src/lib/helpers/auth.ts
import { UserRole } from '@/lib/constants/roles';

export interface User {
  id: number;
  userId: number;
  username: string;
  email: string;
  employee_code?: string;
  full_name: string;
  roles?: Array<{
    id: number;
    code: string;
    name: string;
    description: string;
  }>;
  avatar?: string;
}

/**
 * Lấy danh sách role codes từ user
 */
export function getUserRoles(user: User | null): UserRole[] {
  if (!user || !user.roles || user.roles.length === 0) {
    return [];
  }
  
  return user.roles
    .map(role => role.code as UserRole)
    .filter(code => Object.values(UserRole).includes(code));
}

/**
 * Kiểm tra user có role cụ thể không
 */
export function hasRole(user: User | null, role: UserRole): boolean {
  const userRoles = getUserRoles(user);
  return userRoles.includes(role);
}

/**
 * Kiểm tra user có ít nhất 1 trong các roles
 */
export function hasAnyRole(user: User | null, roles: UserRole[]): boolean {
  const userRoles = getUserRoles(user);
  return roles.some(role => userRoles.includes(role));
}

/**
 * Kiểm tra user có tất cả các roles
 */
export function hasAllRoles(user: User | null, roles: UserRole[]): boolean {
  const userRoles = getUserRoles(user);
  return roles.every(role => userRoles.includes(role));
}