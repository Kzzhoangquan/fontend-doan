// src/lib/api/services/employee.service.ts
import api from '../axios';

export interface Role {
  id: number;
  code: string;
  name: string;
  description: string;
}

export interface EmployeePosition {
  id: number;
  employee_id: number;
  department_id: number | null;
  position_id: number | null;
  start_date: string;
  end_date: string | null;
  is_current: boolean;
  department?: {
    id: number;
    name: string;
  } | null;
  position?: {
    id: number;
    title: string;
    level: number | null;
  } | null;
}

export interface Employee {
  id: number;
  employee_code: string;
  username: string;
  email: string;
  full_name: string;
  first_name: string;
  last_name: string;
  gender: string;
  dob: string;
  phone: string;
  avatar_url: string | null;
  status: string;
  roles: Role[];
  password?: string;
  is_verified?: boolean;
  two_factor_enabled?: boolean;
  employee_positions?: EmployeePosition[]; // New field for multiple positions
  // Salary settings
  base_salary?: number;
  allowance?: number;
  insurance_rate?: number;
  overtime_rate?: number;
}

export interface EmployeesResponse {
  data: Employee[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

export interface GetEmployeesParams {
  page?: number;
  pageSize?: number;
  search?: string;
}

/**
 * Employee API Service
 * Sử dụng axios instance đã có auto JWT & refresh token
 */
const sanitizePayload = (data: Partial<Employee>) => {
  const payload: Record<string, any> = {};
  Object.entries(data).forEach(([key, value]) => {
    if (value === undefined || value === null) return;
    if (typeof value === 'string' && value.trim() === '') return;
    payload[key] = typeof value === 'string' ? value.trim() : value;
  });
  return payload;
};

export const employeeService = {
  /**
   * Lấy danh sách nhân viên (có phân trang & tìm kiếm)
   */
  getAll: async (params?: GetEmployeesParams): Promise<EmployeesResponse> => {
    const response = await api.get<EmployeesResponse>('/employees', { params });
    return response.data;
  },

  /**
   * Lấy chi tiết 1 nhân viên
   */
  getById: async (id: number): Promise<Employee> => {
    const response = await api.get<Employee>(`/employees/${id}`);
    return response.data;
  },

  /**
   * Tạo nhân viên mới
   */
  create: async (data: Partial<Employee>): Promise<Employee> => {
    const response = await api.post<Employee>('/employees', sanitizePayload(data));
    return response.data;
  },

  /**
   * Cập nhật nhân viên
   */
  update: async (id: number, data: Partial<Employee>): Promise<Employee> => {
    const response = await api.patch<Employee>(`/employees/${id}`, sanitizePayload(data));
    return response.data;
  },

  /**
   * Unlock employee account (reset failed login attempts)
   */
  unlockAccount: async (id: number): Promise<Employee> => {
    const response = await api.post<Employee>(`/employees/${id}/unlock`);
    return response.data;
  },

  /**
   * Xóa nhân viên
   */
  delete: async (id: number): Promise<void> => {
    await api.delete(`/employees/${id}`);
  },

  /**
   * Gán roles cho nhân viên
   */
  assignRoles: async (id: number, roleIds: number[]): Promise<Employee> => {
    const response = await api.post<Employee>(`/employees/${id}/roles`, { role_ids: roleIds });
    return response.data;
  },

  /**
   * Xóa roles khỏi nhân viên
   */
  removeRoles: async (id: number, roleIds: number[]): Promise<Employee> => {
    const response = await api.delete<Employee>(`/employees/${id}/roles`, {
      data: { role_ids: roleIds },
    });
    return response.data;
  },
};