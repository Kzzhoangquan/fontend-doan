// src/constants/roles.ts
export enum UserRole {
  MANAGER = 'MANAGER',
  CONTENT_ADMIN = 'CONTENT_ADMIN',
  EMPLOYEE = 'EMPLOYEE',
  ACCOUNTANT = 'ACCOUNTANT',
  DEPARTMENT_HEAD = 'DEPARTMENT_HEAD',
}

export const ROLE_LABELS: Record<UserRole, string> = {
  [UserRole.MANAGER]: 'Quản lý nhân sự',
  [UserRole.CONTENT_ADMIN]: 'Quản trị nội dung',
  [UserRole.EMPLOYEE]: 'Nhân viên',
  [UserRole.ACCOUNTANT]: 'Kế toán',
  [UserRole.DEPARTMENT_HEAD]: 'Trưởng phòng',
};

export const ROLE_DESCRIPTIONS: Record<UserRole, string> = {
  [UserRole.MANAGER]: 'Quản lý toàn bộ hệ thống nhân sự, phòng ban và tài sản',
  [UserRole.CONTENT_ADMIN]: 'Quản trị nội dung và phân quyền người dùng',
  [UserRole.EMPLOYEE]: 'Nhân viên thực hiện công việc và quản lý dự án',
  [UserRole.ACCOUNTANT]: 'Quản lý lương và các báo cáo tài chính',
  [UserRole.DEPARTMENT_HEAD]: 'Quản lý phòng ban và dự án',
};