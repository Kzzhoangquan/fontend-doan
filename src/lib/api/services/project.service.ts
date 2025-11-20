// src/lib/api/services/project.service.ts
import api from '../axios';

export interface Project {
  id: number;
  project_name: string;
  project_key: string;
  description?: string;
  start_date?: string;
  end_date?: string;
  status?: string;
}

/**
 * Project API Service
 */
export const projectService = {
  /**
   * Lấy danh sách projects
   */
  getAll: async (): Promise<Project[]> => {
    const response = await api.get<Project[]>('/projects');
    return response.data;
  },

  /**
   * Lấy chi tiết 1 project
   */
  getById: async (id: number): Promise<Project> => {
    const response = await api.get<Project>(`/projects/${id}`);
    return response.data;
  },

  /**
   * Tạo project mới
   */
  create: async (data: Partial<Project>): Promise<Project> => {
    const response = await api.post<Project>('/projects', data);
    return response.data;
  },

  /**
   * Cập nhật project
   */
  update: async (id: number, data: Partial<Project>): Promise<Project> => {
    const response = await api.patch<Project>(`/projects/${id}`, data);
    return response.data;
  },

  /**
   * Xóa project
   */
  delete: async (id: number): Promise<void> => {
    await api.delete(`/projects/${id}`);
  },
};