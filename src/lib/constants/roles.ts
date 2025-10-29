export enum UserRole {
  HR_MANAGER = 'HR_MANAGER',
  CONTENT_ADMIN = 'CONTENT_ADMIN',
  EMPLOYEE = 'EMPLOYEE',
  ACCOUNTANT = 'ACCOUNTANT',
  DEPARTMENT_HEAD = 'DEPARTMENT_HEAD',
}

export const ROLE_LABELS: Record<UserRole, string> = {
  [UserRole.HR_MANAGER]: 'Quản lý nhân sự',
  [UserRole.CONTENT_ADMIN]: 'Quản trị nội dung',
  [UserRole.EMPLOYEE]: 'Nhân viên',
  [UserRole.ACCOUNTANT]: 'Kế toán',
  [UserRole.DEPARTMENT_HEAD]: 'Trưởng phòng',
};