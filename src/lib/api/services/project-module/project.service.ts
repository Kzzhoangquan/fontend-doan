// src/lib/api/services/project.service.ts
import api from '../../axios';

export interface Project {
  id: number;
  project_key: string;
  project_name: string;
  lead_employee_id: number;
  permission_scheme_id: number;
  notification_scheme_id: number;
  workflow_scheme_id: number;
  lead_employee?: {
    id: number;
    full_name: string;
    email: string;
  };
}

export interface CreateProjectDto {
  project_key: string;
  project_name: string;
  lead_employee_id: number;
  permission_scheme_id: number;
  notification_scheme_id: number;
  workflow_scheme_id: number;
}

export interface UpdateProjectDto extends Partial<CreateProjectDto> {}

/**
 * Project API Service
 */
export const projectService = {
  /**
   * Lấy danh sách tất cả dự án
   */
  getAll: async (): Promise<Project[]> => {
    const response = await api.get<Project[]>('/projects');
    return response.data;
  },

  /**
   * Lấy thông tin chi tiết một dự án
   */
  getById: async (id: number): Promise<Project> => {
    const response = await api.get<Project>(`/projects/${id}`);
    return response.data;
  },

  /**
   * Tạo dự án mới
   */
  create: async (data: CreateProjectDto): Promise<Project> => {
    const response = await api.post<Project>('/projects', data);
    return response.data;
  },

  /**
   * Cập nhật dự án
   */
  update: async (id: number, data: UpdateProjectDto): Promise<Project> => {
    const response = await api.patch<Project>(`/projects/${id}`, data);
    return response.data;
  },

  /**
   * Xóa dự án
   */
  delete: async (id: number): Promise<void> => {
    await api.delete(`/projects/${id}`);
  },

  /**
   * Lấy danh sách dự án cho sidebar (lightweight)
   * Chỉ trả về id, project_key, project_name
   */
  getForSidebar: async (): Promise<Pick<Project, 'id' | 'project_key' | 'project_name'>[]> => {
    const response = await api.get<Project[]>('/projects');
    return response.data.map(p => ({
      id: p.id,
      project_key: p.project_key,
      project_name: p.project_name,
    }));
  },
};