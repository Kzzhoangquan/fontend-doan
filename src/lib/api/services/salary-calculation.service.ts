import { apiClient } from '../client';

export enum SalaryStatus {
  PENDING = 'PENDING',
  APPROVED = 'APPROVED',
  PAID = 'PAID',
  CANCELLED = 'CANCELLED',
}

export interface EmployeeSalary {
  id: number;
  employee_id: number;
  month: string;
  base_salary: number | null;
  work_hours: number | null;
  work_days: number | null;
  approved_leave_days: number | null;
  overtime_hours: number | null;
  overtime_salary: number | null;
  allowance: number | null;
  insurance: number | null;
  deduction: number | null;
  bonus: number | null;
  total_salary: number | null;
  status: SalaryStatus;
  pay_date: string | null;
  payment_method: string | null;
  pay_slip_file: string | null;
  created_at: string;
  updated_at: string;
  employee?: { id: number; full_name: string; employee_code: string };
}

export const salaryCalculationService = {
  async calculate(employeeId: number, year: number, month: number): Promise<EmployeeSalary> {
    const response = await apiClient.post(`/salary-calculation/calculate/${employeeId}`, { year, month });
    return response.data;
  },

  async getEmployeeSalaries(employeeId: number): Promise<EmployeeSalary[]> {
    const response = await apiClient.get(`/salary-calculation/employee/${employeeId}`);
    return response.data;
  },

  async getSalary(employeeId: number, year: number, month: number): Promise<EmployeeSalary | null> {
    const response = await apiClient.get(
      `/salary-calculation/employee/${employeeId}/month?year=${year}&month=${month}`,
    );
    return response.data;
  },

  async approve(id: number): Promise<EmployeeSalary> {
    const response = await apiClient.put(`/salary-calculation/${id}/approve`);
    return response.data;
  },

  async approveAll(year: number, month: number): Promise<{ approved: number; failed: number; errors: Array<{ id: number; error: string }> }> {
    const response = await apiClient.put('/salary-calculation/approve-all', { year, month });
    return response.data;
  },

        async markAsPaid(id: number, payDate: string, paymentMethod: string): Promise<EmployeeSalary> {
          const response = await apiClient.put(`/salary-calculation/${id}/mark-paid`, {
            pay_date: payDate,
            payment_method: paymentMethod,
          });
          return response.data;
        },

        async calculateAll(year: number, month: number): Promise<EmployeeSalary[]> {
          const response = await apiClient.post('/salary-calculation/calculate-all', { year, month });
          return response.data;
        },

        async getSalariesByMonth(year: number, month: number): Promise<EmployeeSalary[]> {
          const response = await apiClient.get(`/salary-calculation/month?year=${year}&month=${month}`);
          return response.data;
        },
      };

