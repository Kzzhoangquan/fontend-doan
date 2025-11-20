// src/lib/api/services/employee.service.ts
import api from '../axios';

export interface Role {
  id: number;
  code: string;
  name: string;
  description: string;
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
  department: string;
  position: string;
  avatar_url: string | null;
  status: string;
  roles: Role[];
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
    const response = await api.post<Employee>('/employees', data);
    return response.data;
  },

  /**
   * Cập nhật nhân viên
   */
  update: async (id: number, data: Partial<Employee>): Promise<Employee> => {
    const response = await api.put<Employee>(`/employees/${id}`, data);
    return response.data;
  },

  /**
   * Xóa nhân viên
   */
  delete: async (id: number): Promise<void> => {
    await api.delete(`/employees/${id}`);
  },
};