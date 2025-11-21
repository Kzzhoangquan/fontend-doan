// src/lib/api/services/position.service.ts
import api from '../axios';

export interface Position {
  id: number;
  title: string;
  description: string | null;
  level: number | null;
  created_at?: string;
  updated_at?: string;
}

export interface PositionsResponse {
  data: Position[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

export interface GetPositionsParams {
  page?: number;
  pageSize?: number;
  search?: string;
}

export interface CreatePositionDto {
  title: string;
  level?: number;
  description?: string;
}

export interface UpdatePositionDto {
  title?: string;
  level?: number;
  description?: string;
}

export const positionService = {
  getAll: async (params?: GetPositionsParams): Promise<PositionsResponse> => {
    const response = await api.get<PositionsResponse>('/positions', { params });
    return response.data;
  },

  getById: async (id: number): Promise<Position> => {
    const response = await api.get<Position>(`/positions/${id}`);
    return response.data;
  },

  create: async (data: CreatePositionDto): Promise<Position> => {
    const response = await api.post<Position>('/positions', data);
    return response.data;
  },

  update: async (id: number, data: UpdatePositionDto): Promise<Position> => {
    const response = await api.patch<Position>(`/positions/${id}`, data);
    return response.data;
  },

  delete: async (id: number): Promise<void> => {
    await api.delete(`/positions/${id}`);
  },
};

