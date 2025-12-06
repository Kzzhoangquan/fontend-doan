import { apiClient } from '../client';

export interface WorkScheduleSettings {
  id: number;
  standard_check_in_time: string;
  standard_check_out_time: string;
  monday: boolean;
  tuesday: boolean;
  wednesday: boolean;
  thursday: boolean;
  friday: boolean;
  saturday: boolean;
  sunday: boolean;
  standard_work_hours_per_day: number;
  late_tolerance_minutes: number;
  early_leave_tolerance_minutes: number;
  created_at: string;
  updated_at: string;
}

export const workScheduleService = {
  async getSettings(): Promise<WorkScheduleSettings> {
    const response = await apiClient.get('/work-schedule/settings');
    return response.data;
  },

  async updateSettings(settings: Partial<WorkScheduleSettings>): Promise<WorkScheduleSettings> {
    const response = await apiClient.put('/work-schedule/settings', settings);
    return response.data;
  },
};

