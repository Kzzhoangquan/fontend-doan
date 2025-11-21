// src/lib/api/services/department.service.ts
import api from '../axios';

export interface Department {
  id: number;
  name: string;
  description: string | null;
  parent_id: number | null;
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

export const departmentService = {
  getAll: async (params?: GetDepartmentsParams): Promise<DepartmentsResponse> => {
    const response = await api.get<DepartmentsResponse>('/departments', { params });
    return response.data;
  },
};

