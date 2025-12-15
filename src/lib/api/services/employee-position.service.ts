// src/lib/api/services/employee-position.service.ts
import api from '../axios';

export interface EmployeePosition {
  id: number;
  employee_id: number;
  department_id: number | null;
  position_id: number | null;
  start_date: string;
  end_date: string | null;
  contract_file: string | null;
  is_current: boolean;
  created_at: string;
  updated_at: string;
  employee?: {
    id: number;
    full_name: string;
    employee_code: string;
  };
  department?: {
    id: number;
    name: string;
  } | null;
  position?: {
    id: number;
    title: string;
    level: number | null;
  } | null;
}

export interface CreateEmployeePositionDto {
  employee_id: number;
  department_id?: number;
  position_id?: number;
  start_date: string;
  end_date?: string;
  contract_file?: string;
  is_current?: boolean;
}

export interface UpdateEmployeePositionDto {
  department_id?: number;
  position_id?: number;
  start_date?: string;
  end_date?: string;
  contract_file?: string;
  is_current?: boolean;
}

export interface EmployeePositionsResponse {
  data: EmployeePosition[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

export const employeePositionService = {
  getAll: async (params?: {
    page?: number;
    pageSize?: number;
    employeeId?: number;
  }): Promise<EmployeePositionsResponse> => {
    const response = await api.get<EmployeePositionsResponse>('/employee-positions', { params });
    return response.data;
  },

  getByEmployee: async (employeeId: number): Promise<EmployeePosition[]> => {
    const response = await api.get<EmployeePosition[]>(`/employee-positions/employee/${employeeId}`);
    return response.data;
  },

  getCurrent: async (employeeId: number): Promise<EmployeePosition | null> => {
    const response = await api.get<EmployeePosition | null>(`/employee-positions/current/${employeeId}`);
    return response.data;
  },

  getById: async (id: number): Promise<EmployeePosition> => {
    const response = await api.get<EmployeePosition>(`/employee-positions/${id}`);
    return response.data;
  },

  create: async (data: CreateEmployeePositionDto): Promise<EmployeePosition> => {
    const response = await api.post<EmployeePosition>('/employee-positions', data);
    return response.data;
  },

  update: async (id: number, data: UpdateEmployeePositionDto): Promise<EmployeePosition> => {
    const response = await api.patch<EmployeePosition>(`/employee-positions/${id}`, data);
    return response.data;
  },

  delete: async (id: number): Promise<void> => {
    await api.delete(`/employee-positions/${id}`);
  },
};


