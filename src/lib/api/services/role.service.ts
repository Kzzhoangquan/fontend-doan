// src/lib/api/services/role.service.ts
import api from '../axios';

export interface Role {
  id: number;
  code: string;
  name: string;
  description: string | null;
  created_at?: string;
  updated_at?: string;
}

export interface RolesResponse {
  data: Role[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

export interface GetRolesParams {
  page?: number;
  pageSize?: number;
  search?: string;
}

export const roleService = {
  getAll: async (params?: GetRolesParams): Promise<RolesResponse> => {
    const response = await api.get<RolesResponse>('/roles', { params });
    return response.data;
  },

  getById: async (id: number): Promise<Role> => {
    const response = await api.get<Role>(`/roles/${id}`);
    return response.data;
  },
};




