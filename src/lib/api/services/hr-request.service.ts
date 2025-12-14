// src/lib/api/services/hr-request.service.ts
import api from '../axios';

// Enums
export enum HrRequestType {
  LEAVE = 'LEAVE',
  OVERTIME = 'OVERTIME',
  LATE_EARLY = 'LATE_EARLY',
}

export enum HrRequestStatus {
  PENDING = 'PENDING',
  APPROVED = 'APPROVED',
  REJECTED = 'REJECTED',
  CANCELLED = 'CANCELLED',
}

export enum LeaveType {
  ANNUAL = 'ANNUAL',
  SICK = 'SICK',
  PERSONAL = 'PERSONAL',
  MATERNITY = 'MATERNITY',
  PATERNITY = 'PATERNITY',
  UNPAID = 'UNPAID',
  OTHER = 'OTHER',
}

export enum LateEarlyType {
  LATE = 'LATE',
  EARLY = 'EARLY',
}

// Interfaces
export interface HrRequest {
  id: number;
  employee_id: number;
  request_type: HrRequestType;
  status: HrRequestStatus;
  reason: string | null;
  approved_by: number | null;
  approved_at: string | null;
  approval_note: string | null;
  
  // Leave request fields
  leave_type: LeaveType | null;
  start_date: string | null;
  end_date: string | null;
  total_days: number | null;
  
  // Overtime request fields
  overtime_date: string | null;
  start_time: string | null;
  end_time: string | null;
  overtime_hours: number | null;
  
  // Late/Early request fields
  late_early_date: string | null;
  late_early_type: LateEarlyType | null;
  actual_time: string | null;
  minutes: number | null;
  
  created_at: string;
  updated_at: string;
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

export interface HrRequestsResponse {
  data: HrRequest[];
  total: number;
  page?: number;
  pageSize?: number;
  totalPages?: number;
}

export interface GetHrRequestsParams {
  employeeId?: number;
  requestType?: HrRequestType;
  status?: HrRequestStatus;
  page?: number;
  pageSize?: number;
}

// DTOs
export interface CreateLeaveRequestDto {
  employee_id?: number;
  leave_type: LeaveType;
  start_date: string;
  end_date: string;
  reason?: string;
}

export interface CreateOvertimeRequestDto {
  employee_id?: number;
  date: string;
  start_time: string;
  end_time: string;
  reason?: string;
}

export interface CreateLateEarlyRequestDto {
  employee_id?: number;
  date: string;
  type: LateEarlyType;
  actual_time?: string;
  minutes?: number;
  reason?: string;
}

export interface UpdateHrRequestDto {
  reason?: string;
  // Leave specific
  start_date?: string;
  end_date?: string;
  leave_type?: LeaveType;
  // Overtime specific
  overtime_date?: string;
  start_time?: string;
  end_time?: string;
  // Late/Early specific
  late_early_date?: string;
  late_early_type?: LateEarlyType;
  actual_time?: string;
  minutes?: number;
}

export interface LeaveBalance {
  limit: number;
  used: number;
  remaining: number;
  year: number;
}

// Service
export const hrRequestService = {
  // ============ LEAVE REQUEST ============
  createLeaveRequest: async (data: CreateLeaveRequestDto): Promise<HrRequest> => {
    const response = await api.post<HrRequest>('/hr-requests/leave', data);
    return response.data;
  },

  // ============ OVERTIME REQUEST ============
  createOvertimeRequest: async (data: CreateOvertimeRequestDto): Promise<HrRequest> => {
    const response = await api.post<HrRequest>('/hr-requests/overtime', data);
    return response.data;
  },

  // ============ LATE/EARLY REQUEST ============
  createLateEarlyRequest: async (data: CreateLateEarlyRequestDto): Promise<HrRequest> => {
    const response = await api.post<HrRequest>('/hr-requests/late-early', data);
    return response.data;
  },

  // ============ COMMON METHODS ============
  getAll: async (params?: GetHrRequestsParams): Promise<HrRequest[]> => {
    const response = await api.get<HrRequest[]>('/hr-requests', { params });
    return response.data;
  },

  getById: async (id: number): Promise<HrRequest> => {
    const response = await api.get<HrRequest>(`/hr-requests/${id}`);
    return response.data;
  },

  update: async (id: number, data: UpdateHrRequestDto): Promise<HrRequest> => {
    const response = await api.patch<HrRequest>(`/hr-requests/${id}`, data);
    return response.data;
  },

  delete: async (id: number): Promise<void> => {
    await api.delete(`/hr-requests/${id}`);
  },

  approve: async (id: number, note?: string): Promise<HrRequest> => {
    const response = await api.put<HrRequest>(`/hr-requests/${id}/approve`, { note });
    return response.data;
  },

  reject: async (id: number, note?: string): Promise<HrRequest> => {
    const response = await api.put<HrRequest>(`/hr-requests/${id}/reject`, { note });
    return response.data;
  },

  cancel: async (id: number): Promise<HrRequest> => {
    const response = await api.put<HrRequest>(`/hr-requests/${id}/cancel`);
    return response.data;
  },

  // ============ LEAVE BALANCE ============
  getLeaveBalance: async (employeeId?: number, year?: number): Promise<LeaveBalance> => {
    const params: any = {};
    if (year) params.year = year;
    
    if (employeeId) {
      const response = await api.get<LeaveBalance>(`/hr-requests/leave/balance/${employeeId}`, { params });
      return response.data;
    } else {
      const response = await api.get<LeaveBalance>('/hr-requests/leave/balance', { params });
      return response.data;
    }
  },
};


