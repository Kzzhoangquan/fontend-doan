// src/lib/api/services/position.service.ts
import api from '../axios';

export interface Position {
  id: number;
  title: string;
  description: string | null;
  level: number | null;
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

export const positionService = {
  getAll: async (params?: GetPositionsParams): Promise<PositionsResponse> => {
    const response = await api.get<PositionsResponse>('/positions', { params });
    return response.data;
  },
};

