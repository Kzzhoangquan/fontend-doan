import { apiClient } from '../client';

export interface SalarySettings {
  id: number;
  role_id: number | null;
  employee_id: number | null;
  base_salary: number;
  allowance: number;
  insurance_rate: number;
  salary_coefficient: number;
  hourly_rate: number | null;
  overtime_rate: number;
  holiday_rate: number;
  created_at: string;
  updated_at: string;
  role?: { id: number; name: string; code: string } | null;
  employee?: { id: number; full_name: string; employee_code: string } | null;
}

export const salarySettingsService = {
  async getAll(): Promise<SalarySettings[]> {
    const response = await apiClient.get('/salary-settings');
    return response.data;
  },

  async getByRole(roleId: number): Promise<SalarySettings | null> {
    const response = await apiClient.get(`/salary-settings/role/${roleId}`);
    return response.data;
  },

  async getByEmployee(employeeId: number): Promise<SalarySettings | null> {
    const response = await apiClient.get(`/salary-settings/employee/${employeeId}`);
    return response.data;
  },

  async getEffective(employeeId: number): Promise<SalarySettings | null> {
    const response = await apiClient.get(`/salary-settings/employee/${employeeId}/effective`);
    return response.data;
  },

  async setForRole(roleId: number, settings: Partial<SalarySettings>): Promise<SalarySettings> {
    const response = await apiClient.post(`/salary-settings/role/${roleId}`, settings);
    return response.data;
  },

  async setForEmployee(employeeId: number, settings: Partial<SalarySettings>): Promise<SalarySettings> {
    const response = await apiClient.post(`/salary-settings/employee/${employeeId}`, settings);
    return response.data;
  },

  async delete(id: number): Promise<void> {
    await apiClient.delete(`/salary-settings/${id}`);
  },
};

