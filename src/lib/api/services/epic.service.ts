// src/lib/api/services/epic.service.ts
import api from '../axios';

export interface Epic {
  id: number;
  project_id: number;
  epic_name: string;
  goal: string | null;
  status: string | null;
  start_date: string | null;
  due_date: string | null;
  project?: {
    id: number;
    project_name: string;
  };
  issues?: Array<{
    id: number;
    issue_code: string;
    summary: string;
    issue_type?: {
      type_name: string;
    };
    current_status?: {
      status_name: string;
    };
    assignees?: Array<{
      full_name: string;
    }>;
  }>;
  issue_count?: number;
}

export interface CreateEpicDto {
  project_id: number;
  epic_name: string;
  goal?: string;
  status?: string;
  start_date?: string;
  due_date?: string;
}

export interface UpdateEpicDto extends Partial<CreateEpicDto> {}

export interface GetEpicsParams {
  projectId?: number;
}

/**
 * Epic API Service
 * Sử dụng axios instance đã có auto JWT & refresh token
 */
export const epicService = {
  /**
   * Lấy danh sách epics (có thể filter theo project)
   */
  getAll: async (params?: GetEpicsParams): Promise<Epic[]> => {
    const response = await api.get<Epic[]>('/epics', { params });
    return response.data;
  },

  /**
   * Lấy chi tiết 1 epic
   */
  getById: async (id: number): Promise<Epic> => {
    const response = await api.get<Epic>(`/epics/${id}`);
    return response.data;
  },

  /**
   * Lấy danh sách issues của epic
   */
  getEpicIssues: async (id: number): Promise<any[]> => {
    const response = await api.get<any[]>(`/epics/${id}/issues`);
    return response.data;
  },

  /**
   * Tạo epic mới
   */
  create: async (data: CreateEpicDto): Promise<Epic> => {
    const response = await api.post<Epic>('/epics', data);
    return response.data;
  },

  /**
   * Cập nhật epic
   */
  update: async (id: number, data: UpdateEpicDto): Promise<Epic> => {
    const response = await api.patch<Epic>(`/epics/${id}`, data);
    return response.data;
  },

  /**
   * Xóa epic
   */
  delete: async (id: number): Promise<void> => {
    await api.delete(`/epics/${id}`);
  },
};