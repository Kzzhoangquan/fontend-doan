// src/lib/api/services/leave-request.service.ts
import api from '../axios';

export enum LeaveType {
  ANNUAL = 'ANNUAL',
  SICK = 'SICK',
  PERSONAL = 'PERSONAL',
  MATERNITY = 'MATERNITY',
  PATERNITY = 'PATERNITY',
  UNPAID = 'UNPAID',
  OTHER = 'OTHER',
}

export enum LeaveStatus {
  PENDING = 'PENDING',
  APPROVED = 'APPROVED',
  REJECTED = 'REJECTED',
  CANCELLED = 'CANCELLED',
}

export interface LeaveRequest {
  id: number;
  employee_id: number;
  type: LeaveType;
  start_date: string;
  end_date: string;
  total_days: number | null;
  reason: string | null;
  status: LeaveStatus;
  approved_by: number | null;
  approved_at: string | null;
  created_at?: string;
  updated_at?: string;
  employee?: {
    id: number;
    full_name: string;
    employee_code: string;
    email: string;
  };
  approver?: {
    id: number;
    full_name: string;
    employee_code: string;
  } | null;
}

export interface LeaveRequestsResponse {
  data: LeaveRequest[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

export interface GetLeaveRequestsParams {
  page?: number;
  pageSize?: number;
  employeeId?: number;
  status?: LeaveStatus;
  startDate?: string;
  endDate?: string;
}

export interface CreateLeaveRequestDto {
  employee_id?: number;
  type: LeaveType;
  start_date: string;
  end_date: string;
  total_days?: number;
  reason?: string;
}

export interface UpdateLeaveRequestDto {
  type?: LeaveType;
  start_date?: string;
  end_date?: string;
  total_days?: number;
  reason?: string;
}

export const leaveRequestService = {
  getAll: async (params?: GetLeaveRequestsParams): Promise<LeaveRequestsResponse> => {
    const response = await api.get<LeaveRequestsResponse>('/leave-requests', { params });
    return response.data;
  },

  getById: async (id: number): Promise<LeaveRequest> => {
    const response = await api.get<LeaveRequest>(`/leave-requests/${id}`);
    return response.data;
  },

  create: async (data: CreateLeaveRequestDto): Promise<LeaveRequest> => {
    const response = await api.post<LeaveRequest>('/leave-requests', data);
    return response.data;
  },

  update: async (id: number, data: UpdateLeaveRequestDto): Promise<LeaveRequest> => {
    const response = await api.patch<LeaveRequest>(`/leave-requests/${id}`, data);
    return response.data;
  },

  delete: async (id: number): Promise<void> => {
    await api.delete(`/leave-requests/${id}`);
  },

  approve: async (id: number): Promise<LeaveRequest> => {
    const response = await api.post<LeaveRequest>(`/leave-requests/${id}/approve`);
    return response.data;
  },

  reject: async (id: number): Promise<LeaveRequest> => {
    const response = await api.post<LeaveRequest>(`/leave-requests/${id}/reject`);
    return response.data;
  },

  cancel: async (id: number): Promise<LeaveRequest> => {
    const response = await api.post<LeaveRequest>(`/leave-requests/${id}/cancel`);
    return response.data;
  },

  getLeaveBalance: async (employeeId?: number, year?: number): Promise<{
    limit: number;
    used: number;
    remaining: number;
    year: number;
  }> => {
    const params: any = {};
    if (year) params.year = year;
    
    if (employeeId) {
      const response = await api.get(`/leave-requests/balance/${employeeId}`, { params });
      return response.data;
    } else {
      const response = await api.get('/leave-requests/balance', { params });
      return response.data;
    }
  },
};







