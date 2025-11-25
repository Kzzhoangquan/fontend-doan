// src/lib/api/services/attendance.service.ts
import api from '../axios';

export interface Attendance {
  id: number;
  employee_id: number;
  date: string;
  check_in: string | null;
  check_out: string | null;
  work_hours: number | null;
  late_minutes: number | null;
  early_leave_minutes: number | null;
  note: string | null;
  created_at?: string;
  employee?: {
    id: number;
    full_name: string;
    employee_code: string;
    email: string;
  };
}

export interface AttendancesResponse {
  data: Attendance[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

export interface GetAttendancesParams {
  page?: number;
  pageSize?: number;
  employeeId?: number;
  startDate?: string;
  endDate?: string;
}

export interface CreateAttendanceDto {
  employee_id: number;
  date: string;
  check_in?: string;
  check_out?: string;
  late_minutes?: number;
  early_leave_minutes?: number;
  note?: string;
}

export interface UpdateAttendanceDto {
  employee_id?: number;
  date?: string;
  check_in?: string;
  check_out?: string;
  late_minutes?: number;
  early_leave_minutes?: number;
  note?: string;
}

export const attendanceService = {
  getAll: async (params?: GetAttendancesParams): Promise<AttendancesResponse> => {
    const response = await api.get<AttendancesResponse>('/attendance', { params });
    return response.data;
  },

  getById: async (id: number): Promise<Attendance> => {
    const response = await api.get<Attendance>(`/attendance/${id}`);
    return response.data;
  },

  create: async (data: CreateAttendanceDto): Promise<Attendance> => {
    const response = await api.post<Attendance>('/attendance', data);
    return response.data;
  },

  update: async (id: number, data: UpdateAttendanceDto): Promise<Attendance> => {
    const response = await api.patch<Attendance>(`/attendance/${id}`, data);
    return response.data;
  },

  delete: async (id: number): Promise<void> => {
    await api.delete(`/attendance/${id}`);
  },

  checkIn: async (employeeId: number): Promise<Attendance> => {
    const response = await api.post<Attendance>(`/attendance/check-in/${employeeId}`);
    return response.data;
  },

  checkOut: async (employeeId: number): Promise<Attendance> => {
    const response = await api.post<Attendance>(`/attendance/check-out/${employeeId}`);
    return response.data;
  },
};




