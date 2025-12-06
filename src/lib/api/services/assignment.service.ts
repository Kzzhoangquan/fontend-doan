// src/lib/api/services/assignment.service.ts
import api from '../axios';
import { Asset } from './asset.service';

// ===== TYPES =====
export interface Employee {
  id: number;
  employee_code: string;
  full_name: string;
  department?: string;
  position?: string;
}

export type AssignmentStatus = 'ASSIGNED' | 'RETURNED';

export interface Assignment {
  id: number;
  asset: Asset;
  employee: Employee;
  assignment_date: string;
  return_date?: string;
  assignment_reason?: string;
  return_reason?: string;
  condition_on_assignment?: string;
  condition_on_return?: string;
  assigned_by?: Employee;
  returned_by?: Employee;
  status: AssignmentStatus;
  note?: string;
  created_at?: Date;
  updated_at?: Date;
}

export interface AssignmentsResponse {
  data: Assignment[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

export interface GetAssignmentsParams {
  page?: number;
  pageSize?: number;
  search?: string;
  employeeId?: number;
  departmentId?: number;
  status?: AssignmentStatus;
  sortBy?: string;
  sortOrder?: 'ASC' | 'DESC';
}

export interface CreateAssignmentDto {
  asset_id: number;
  employee_id: number;
  assignment_date: string;
  assignment_reason?: string;
  condition_on_assignment?: string;
  note?: string;
}

export interface ReturnAssignmentDto {
  return_date: string;
  return_reason?: string;
  condition_on_return?: string;
}

export interface AssignmentStatistics {
  total_assigned: number;
  total_returned: number;
  by_department?: Record<string, number>;
  by_category?: Record<string, number>;
}

// ===== ASSIGNMENT SERVICE =====
export const assignmentService = {
  /**
   * Lấy danh sách phân công (có phân trang, tìm kiếm, lọc)
   */
  getAll: async (params?: GetAssignmentsParams): Promise<AssignmentsResponse> => {
    const response = await api.get<AssignmentsResponse>('/assignments', { params });
    return response.data;
  },

  /**
   * Lấy chi tiết 1 phân công
   */
  getById: async (id: number): Promise<Assignment> => {
    const response = await api.get<Assignment>(`/assignments/${id}`);
    return response.data;
  },

  /**
   * Tạo phân công mới
   */
  create: async (data: CreateAssignmentDto, performedById?: number): Promise<Assignment> => {
    const response = await api.post<Assignment>('/assignments', {
      ...data,
      performedById,
    });
    return response.data;
  },

  /**
   * Thu hồi tài sản
   */
  returnAssignment: async (
    id: number,
    data: ReturnAssignmentDto,
    performedById?: number
  ): Promise<Assignment> => {
    const response = await api.patch<Assignment>(`/assignments/${id}/return`, {
      ...data,
      performedById,
    });
    return response.data;
  },

  /**
   * Xóa phân công
   */
  delete: async (id: number): Promise<void> => {
    await api.delete(`/assignments/${id}`);
  },

  /**
   * Lấy danh sách phân công của 1 nhân viên
   */
  getByEmployee: async (
    employeeId: number,
    page = 1,
    pageSize = 10,
    status?: AssignmentStatus
  ): Promise<AssignmentsResponse> => {
    const response = await api.get<AssignmentsResponse>(
      `/assignments/employee/${employeeId}`,
      { params: { page, pageSize, status } }
    );
    return response.data;
  },

  /**
   * Lấy lịch sử phân công của 1 tài sản
   */
  getByAsset: async (
    assetId: number,
    page = 1,
    pageSize = 10
  ): Promise<AssignmentsResponse> => {
    const response = await api.get<AssignmentsResponse>(
      `/assignments/asset/${assetId}`,
      { params: { page, pageSize } }
    );
    return response.data;
  },

  /**
   * Lấy thống kê phân công
   */
  getStatistics: async (): Promise<AssignmentStatistics> => {
    const response = await api.get<AssignmentStatistics>('/assignments/statistics');
    return response.data;
  },

  /**
   * Lấy danh sách tài sản có sẵn (chưa được phân công)
   */
  getAvailableAssets: async (
    page = 1,
    pageSize = 10,
    search?: string,
    categoryId?: number
  ): Promise<any> => {
    const response = await api.get('/assignments/assets/available', {
      params: { page, pageSize, search, categoryId },
    });
    return response.data;
  },

  /**
   * Lấy thông tin người đang giữ tài sản
   */
  getCurrentHolder: async (assetId: number): Promise<any> => {
    const response = await api.get(`/assignments/assets/${assetId}/current-holder`);
    return response.data;
  },

  /**
   * Cập nhật người giữ tài sản
   */
  updateHolder: async (assetId: number, holderId?: number): Promise<any> => {
    const response = await api.patch(`/assignments/assets/${assetId}/holder`, {
      holderId,
    });
    return response.data;
  },
};