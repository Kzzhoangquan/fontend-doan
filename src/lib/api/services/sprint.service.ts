// src/lib/api/services/sprint.service.ts
import api from '../axios';

export interface Sprint {
  id: number;
  project_id: number;
  sprint_name: string;
  goal: string | null;
  start_date: string | null;
  end_date: string | null;
  duration_days: number | null;
  status: string;
  issue_count?: number;
}

export interface CreateSprintDto {
  project_id: number;
  sprint_name: string;
  goal?: string;
  start_date?: string;
  end_date?: string;
  duration_days?: number;
  status?: string;
}

export interface UpdateSprintDto extends Partial<CreateSprintDto> {}

export interface GetSprintsParams {
  projectId?: number;
}

export interface MoveIssueDto {
  issue_id: number;
  target_sprint_id: number;
  rank_order?: number;
}

/**
 * Sprint API Service
 * Sử dụng axios instance đã có auto JWT & refresh token
 */
export const sprintService = {
  /**
   * Lấy danh sách sprints (có thể filter theo project)
   */
  getAll: async (params?: GetSprintsParams): Promise<Sprint[]> => {
    const response = await api.get<Sprint[]>('/sprints', { params });
    return response.data;
  },

  /**
   * Lấy chi tiết 1 sprint
   */
  getById: async (id: number): Promise<Sprint> => {
    const response = await api.get<Sprint>(`/sprints/${id}`);
    return response.data;
  },

  /**
   * Lấy backlog issues (issues chưa có sprint)
   */
  getBacklog: async (projectId: number): Promise<any[]> => {
    const response = await api.get<any[]>(`/sprints/backlog/${projectId}`);
    return response.data;
  },

  /**
   * Lấy issues trong sprint
   */
  getSprintIssues: async (sprintId: number): Promise<any[]> => {
    const response = await api.get<any[]>(`/sprints/${sprintId}/issues`);
    return response.data;
  },

  /**
   * Tạo sprint mới
   */
  create: async (data: CreateSprintDto): Promise<Sprint> => {
    const response = await api.post<Sprint>('/sprints', data);
    return response.data;
  },

  /**
   * Cập nhật sprint
   */
  update: async (id: number, data: UpdateSprintDto): Promise<Sprint> => {
    const response = await api.patch<Sprint>(`/sprints/${id}`, data);
    return response.data;
  },

  /**
   * Xóa sprint
   */
  delete: async (id: number): Promise<void> => {
    await api.delete(`/sprints/${id}`);
  },

  /**
   * Bắt đầu sprint
   */
  start: async (id: number): Promise<Sprint> => {
    const response = await api.post<Sprint>(`/sprints/${id}/start`);
    return response.data;
  },

  /**
   * Hoàn thành sprint
   */
  complete: async (id: number): Promise<Sprint> => {
    const response = await api.post<Sprint>(`/sprints/${id}/complete`);
    return response.data;
  },

  /**
   * Di chuyển issue giữa sprints/backlog
   */
  moveIssue: async (data: MoveIssueDto): Promise<any> => {
    const response = await api.post('/sprints/issues/move', data);
    return response.data;
  },

  /**
   * Thay đổi status sprint
   */
  changeStatus: async (id: number, status: string): Promise<Sprint> => {
    const response = await api.patch<Sprint>(`/sprints/${id}/status`, { status });
    return response.data;
  },
};