import { UserRole } from '@/lib/constants/roles';

export interface Employee {
  id: string;
  code: string;
  name: string;
  email: string;
  phone: string;
  dateOfBirth: string;
  departmentId: string;
  departmentName: string;
  position: string;
  role: UserRole;
  status: 'active' | 'inactive' | 'on_leave';
  avatar?: string;
  joinDate: string;
  address?: string;
}

export interface Department {
  id: string;
  code: string;
  name: string;
  managerId: string;
  managerName: string;
  employeeCount: number;
  description?: string;
}