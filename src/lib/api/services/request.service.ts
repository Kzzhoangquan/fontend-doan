// src/lib/api/services/request.service.ts
import api from '../axios';
import { Asset } from './asset.service';
import { Employee } from './assignment.service';
import { Category } from './asset.service';

// ===== TYPES =====
export type RequestType = 'PURCHASE' | 'REPAIR' | 'MAINTENANCE';
export type RequestPriority = 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT';
export type RequestStatus = 'PENDING' | 'APPROVED' | 'REJECTED' | 'IN_PROGRESS' | 'COMPLETED';
export type NotificationType = 'NEW_REQUEST' | 'APPROVED' | 'REJECTED' | 'COMPLETED' | 'REMINDER';

export interface Request {
  id: number;
  requester: Employee;
  request_type: RequestType;
  category?: Category;
  asset_name_suggest?: string;
  quantity: number;
  asset?: Asset;
  image_url?: string;
  reason: string;
  request_date: string;
  needed_date?: string;
  priority: RequestPriority;
  status: RequestStatus;
  approver?: Employee;
  approval_date?: string;
  rejection_reason?: string;
  approval_note?: string;
  estimated_cost?: string;
  actual_cost?: string;
  start_date?: string;
  completion_date?: string;
  result_note?: string;
  created_at?: Date;
  updated_at?: Date;
}

export interface Notification {
  id: number;
  recipient: Employee;
  notification_type: NotificationType;
  title: string;
  content: string;
  link?: string;
  request?: Request;
  is_read: boolean;
  created_at: Date;
}

export interface RequestsResponse {
  data: Request[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

export interface QueryRequestsParams {
  page?: number;
  pageSize?: number;
  search?: string;
  status?: RequestStatus;
  request_type?: RequestType;
  priority?: RequestPriority;
  sortBy?: string;
  sortOrder?: 'ASC' | 'DESC';
}

export interface CreateRequestDto {
  request_type: RequestType;
  category_id?: number;
  asset_name_suggest?: string;
  quantity?: number;
  asset_id?: number;
  image_url?: string;
  reason: string;
  needed_date?: string;
  priority?: RequestPriority;
}

export interface ApproveRequestDto {
  approval_note: string;
  estimated_cost?: number;
  supplier_id?: number;
}

export interface RejectRequestDto {
  rejection_reason: string;
}

export interface RequestStatistics {
  pending: number;
  approved: number;
  rejected: number;
  in_progress: number;
  completed: number;
  high_priority_pending: number;
}

// ===== REQUEST SERVICE =====
export const requestService = {
  // === Employee APIs ===
  getMyRequests: async (params?: QueryRequestsParams): Promise<RequestsResponse> => {
    const response = await api.get<RequestsResponse>('/requests/my-requests', { params });
    return response.data;
  },

  getMyAssets: async (): Promise<any> => {
    const response = await api.get('/requests/my-assets');
    return response.data;
  },

  create: async (data: CreateRequestDto): Promise<Request> => {
    const response = await api.post<Request>('/requests', data);
    return response.data;
  },

  // === Manager APIs ===
  getAll: async (params?: QueryRequestsParams): Promise<RequestsResponse> => {
    const response = await api.get<RequestsResponse>('/requests', { params });
    return response.data;
  },

  getById: async (id: number): Promise<Request> => {
    const response = await api.get<Request>(`/requests/${id}`);
    return response.data;
  },

  approve: async (id: number, data: ApproveRequestDto): Promise<Request> => {
    const response = await api.put<Request>(`/requests/${id}/approve`, data);
    return response.data;
  },

  reject: async (id: number, data: RejectRequestDto): Promise<Request> => {
    const response = await api.put<Request>(`/requests/${id}/reject`, data);
    return response.data;
  },

  start: async (id: number, data: { start_date: string }): Promise<Request> => {
    const response = await api.put<Request>(`/requests/${id}/start`, data);
    return response.data;
  },

  complete: async (id: number, data: { completion_date: string; actual_cost?: number; result_note?: string }): Promise<Request> => {
    const response = await api.put<Request>(`/requests/${id}/complete`, data);
    return response.data;
  },

  delete: async (id: number): Promise<void> => {
    await api.delete(`/requests/${id}`);
  },

  getStatistics: async (): Promise<RequestStatistics> => {
    const response = await api.get<RequestStatistics>('/requests/statistics');
    return response.data;
  },
};

// ===== NOTIFICATION SERVICE =====
export const notificationService = {
  getMyNotifications: async (): Promise<Notification[]> => {
    const response = await api.get<Notification[]>('/notifications/my-notifications');
    return response.data;
  },

  getUnreadCount: async (): Promise<{ count: number }> => {
    const response = await api.get<{ count: number }>('/notifications/unread-count');
    return response.data;
  },

  markAsRead: async (id: number): Promise<void> => {
    await api.put(`/notifications/${id}/mark-read`);
  },

  markAllAsRead: async (): Promise<void> => {
    await api.put('/notifications/mark-all-read');
  },

  delete: async (id: number): Promise<void> => {
    await api.delete(`/notifications/${id}`);
  },
};