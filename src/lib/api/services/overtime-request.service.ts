import { apiClient } from '../client';

export enum OvertimeStatus {
  PENDING = 'PENDING',
  APPROVED = 'APPROVED',
  REJECTED = 'REJECTED',
  CANCELLED = 'CANCELLED',
}

export interface OvertimeRequest {
  id: number;
  employee_id: number;
  date: string;
  start_time: string;
  end_time: string;
  hours: number | null;
  reason: string | null;
  status: OvertimeStatus;
  approved_by: number | null;
  approved_at: string | null;
  approval_note: string | null;
  created_at: string;
  updated_at: string;
  employee?: { id: number; full_name: string; employee_code: string };
  approver?: { id: number; full_name: string } | null;
}

export interface CreateOvertimeRequestDto {
  date: string;
  start_time: string;
  end_time: string;
  reason?: string;
}

export const overtimeRequestService = {
  async create(data: CreateOvertimeRequestDto): Promise<OvertimeRequest> {
    const response = await apiClient.post('/overtime-request', data);
    return response.data;
  },

  async getAll(employeeId?: number, status?: OvertimeStatus): Promise<OvertimeRequest[]> {
    const params = new URLSearchParams();
    if (employeeId) params.append('employeeId', employeeId.toString());
    if (status) params.append('status', status);
    const response = await apiClient.get(`/overtime-request?${params.toString()}`);
    return response.data;
  },

  async getById(id: number): Promise<OvertimeRequest> {
    const response = await apiClient.get(`/overtime-request/${id}`);
    return response.data;
  },

  async approve(id: number, note?: string): Promise<OvertimeRequest> {
    const response = await apiClient.put(`/overtime-request/${id}/approve`, { note });
    return response.data;
  },

  async reject(id: number, note?: string): Promise<OvertimeRequest> {
    const response = await apiClient.put(`/overtime-request/${id}/reject`, { note });
    return response.data;
  },
};

