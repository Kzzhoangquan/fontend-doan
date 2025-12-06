import api from '../../axios';

export interface Employee {
  id: number;
  full_name: string;
  email: string;
  phone?: string;
  department?: string;
  position?: string;
}

interface EmployeeListResponse {
  data: Employee[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

export const employeeService = {
  getAllEmployees: async (): Promise<Employee[]> => {
    const response = await api.get<EmployeeListResponse>('/employees');
    return response.data.data; // Return the data array from response.data.data
  },

  getById: async (id: number): Promise<Employee> => {
    const response = await api.get<Employee>(`/employees/${id}`);
    return response.data;
  },
};