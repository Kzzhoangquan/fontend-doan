// src/lib/api/services/project.service.ts
import api from '../../axios';

export interface Project {
  id: number;
  project_key: string;
  project_name: string;
  project_description?: string;
  lead_employee_id: number;
  permission_scheme_id: number;
  notification_scheme_id: number;
  workflow_scheme_id: number;
  created_at?: string;
  updated_at?: string;
  lead_employee?: {
    id: number;
    full_name: string;
    email: string;
  };
}

export interface CreateProjectDto {
  project_key: string;
  project_name: string;
  project_description?: string | null;
  lead_employee_id: number;
  permission_scheme_id: number;
  notification_scheme_id: number;
  workflow_scheme_id: number;
}

export interface SchemeOption {
  id: number;
  scheme_name: string;
  scheme_description?: string;
  is_default?: boolean;
}

export interface AllSchemes {
  permissionSchemes: SchemeOption[];
  notificationSchemes: SchemeOption[];
  workflowSchemes: SchemeOption[];
}

export interface DefaultSchemes {
  permissionScheme: SchemeOption | null;
  notificationScheme: SchemeOption | null;
  workflowScheme: SchemeOption | null;
}

export const projectService = {
  // Existing methods
  getAll: async (): Promise<Project[]> => {
    const response = await api.get<Project[]>('/projects');
    return response.data;
  },

  getById: async (id: number): Promise<Project> => {
    const response = await api.get<Project>(`/projects/${id}`);
    return response.data;
  },

  create: async (data: CreateProjectDto): Promise<any> => {
    const response = await api.post('/projects', data);
    return response.data;
  },

  update: async (id: number, data: Partial<CreateProjectDto>): Promise<Project> => {
    const response = await api.patch<Project>(`/projects/${id}`, data);
    return response.data;
  },

  delete: async (id: number): Promise<void> => {
    await api.delete(`/projects/${id}`);
  },

  // New methods for schemes
  getPermissionSchemes: async (): Promise<SchemeOption[]> => {
    const response = await api.get<SchemeOption[]>('/projects/schemes/permission');
    return response.data;
  },

  getNotificationSchemes: async (): Promise<SchemeOption[]> => {
    const response = await api.get<SchemeOption[]>('/projects/schemes/notification');
    return response.data;
  },

  getWorkflowSchemes: async (): Promise<SchemeOption[]> => {
    const response = await api.get<SchemeOption[]>('/projects/schemes/workflow');
    return response.data;
  },

  getAllSchemes: async (): Promise<AllSchemes> => {
    const response = await api.get<AllSchemes>('/projects/schemes/all');
    return response.data;
  },

  getDefaultSchemes: async (): Promise<DefaultSchemes> => {
    const response = await api.get<DefaultSchemes>('/projects/schemes/default');
    return response.data;
  },

  getForSidebar: async (): Promise<Pick<Project, 'id' | 'project_key' | 'project_name'>[]> => {
    const response = await api.get<Project[]>('/projects');
    return response.data.map(p => ({
      id: p.id,
      project_key: p.project_key,
      project_name: p.project_name,
    }));
  },
};