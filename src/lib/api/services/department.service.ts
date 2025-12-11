// src/lib/api/services/department.service.ts
import api from '../axios';

export interface Department {
  id: number;
  name: string;
  description: string | null;
  parent_id: number | null;
  parent?: Department | null;
  children?: Department[];
  created_at?: string;
  updated_at?: string;
}

export interface DepartmentsResponse {
  data: Department[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

export interface GetDepartmentsParams {
  page?: number;
  pageSize?: number;
  search?: string;
  includeChildren?: boolean;
}

export interface CreateDepartmentDto {
  name: string;
  parent_id?: number;
  description?: string;
}

export interface UpdateDepartmentDto {
  name?: string;
  parent_id?: number;
  description?: string;
}

export const departmentService = {
  getAll: async (params?: GetDepartmentsParams): Promise<DepartmentsResponse> => {
    const response = await api.get<DepartmentsResponse>('/departments', { params });
    return response.data;
  },

  getById: async (id: number, includeChildren?: boolean): Promise<Department> => {
    const response = await api.get<Department>(`/departments/${id}`, {
      params: { includeChildren },
    });
    return response.data;
  },

  create: async (data: CreateDepartmentDto): Promise<Department> => {
    const response = await api.post<Department>('/departments', data);
    return response.data;
  },

  update: async (id: number, data: UpdateDepartmentDto): Promise<Department> => {
    const response = await api.patch<Department>(`/departments/${id}`, data);
    return response.data;
  },

  delete: async (id: number): Promise<void> => {
    await api.delete(`/departments/${id}`);
  },

  getTree: async (): Promise<Department[]> => {
    const response = await api.get<Department[]>('/departments/tree');
    return response.data;
  },

  getEmployees: async (id: number): Promise<{
    department: { id: number; name: string; description: string | null };
    employees: Record<number, Array<{
      id: number;
      employee_code: string;
      full_name: string;
      email: string;
      phone: string | null;
      position: { id: number; title: string; level: number | null } | null;
      department_id: number | null;
      department_name: string | null;
    }>>;
    totalEmployees: number;
    totalPositions: number;
    departmentIds: number[];
  }> => {
    const response = await api.get(`/departments/${id}/employees`);
    return response.data;
  },

  getStatistics: async (id: number): Promise<{
    department: { id: number; name: string };
    totalEmployees: number;
    childDepartments: number;
    totalDepartments: number;
  }> => {
    const response = await api.get(`/departments/${id}/statistics`);
    return response.data;
  },
};

