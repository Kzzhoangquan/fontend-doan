import { apiClient } from '../client';

export enum LateEarlyType {
  LATE = 'LATE',
  EARLY = 'EARLY',
}

export enum LateEarlyStatus {
  PENDING = 'PENDING',
  APPROVED = 'APPROVED',
  REJECTED = 'REJECTED',
  CANCELLED = 'CANCELLED',
}

export interface LateEarlyRequest {
  id: number;
  employee_id: number;
  date: string;
  type: LateEarlyType;
  actual_time: string | null;
  minutes: number | null;
  reason: string | null;
  status: LateEarlyStatus;
  approved_by: number | null;
  approved_at: string | null;
  approval_note: string | null;
  created_at: string;
  updated_at: string;
  employee?: { id: number; full_name: string; employee_code: string };
  approver?: { id: number; full_name: string } | null;
}

export interface CreateLateEarlyRequestDto {
  date: string;
  type: LateEarlyType;
  actual_time?: string;
  minutes?: number;
  reason?: string;
}

export const lateEarlyRequestService = {
  async create(data: CreateLateEarlyRequestDto): Promise<LateEarlyRequest> {
    const response = await apiClient.post('/late-early-request', data);
    return response.data;
  },

  async getAll(employeeId?: number, status?: LateEarlyStatus, type?: LateEarlyType): Promise<LateEarlyRequest[]> {
    const params = new URLSearchParams();
    if (employeeId) params.append('employeeId', employeeId.toString());
    if (status) params.append('status', status);
    if (type) params.append('type', type);
    const response = await apiClient.get(`/late-early-request?${params.toString()}`);
    return response.data;
  },

  async getById(id: number): Promise<LateEarlyRequest> {
    const response = await apiClient.get(`/late-early-request/${id}`);
    return response.data;
  },

  async approve(id: number, note?: string): Promise<LateEarlyRequest> {
    const response = await apiClient.put(`/late-early-request/${id}/approve`, { note });
    return response.data;
  },

  async reject(id: number, note?: string): Promise<LateEarlyRequest> {
    const response = await apiClient.put(`/late-early-request/${id}/reject`, { note });
    return response.data;
  },
};

