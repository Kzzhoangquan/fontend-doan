'use client';

import { useState, useEffect } from 'react';
import { notification } from 'antd';
import { Settings, Clock, DollarSign, Save, Loader2 } from 'lucide-react';
import { workScheduleService, WorkScheduleSettings } from '@/lib/api/services/work-schedule.service';
import { salarySettingsService, SalarySettings } from '@/lib/api/services/salary-settings.service';
import { roleService, Role } from '@/lib/api/services/role.service';
import { employeeService, Employee } from '@/lib/api/services/employee.service';

export default function SalarySettingsPage() {
  const [notificationApi, contextHolder] = notification.useNotification();
  const [activeTab, setActiveTab] = useState<'work-schedule' | 'salary'>('work-schedule');
  
  // Work Schedule States
  const [workSchedule, setWorkSchedule] = useState<WorkScheduleSettings | null>(null);
  const [workScheduleLoading, setWorkScheduleLoading] = useState(true);
  const [workScheduleSaving, setWorkScheduleSaving] = useState(false);
  
  // Salary Settings States
  const [salarySettings, setSalarySettings] = useState<SalarySettings[]>([]);
  const [roles, setRoles] = useState<Role[]>([]);
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [salaryLoading, setSalaryLoading] = useState(true);
  const [selectedTarget, setSelectedTarget] = useState<{ type: 'role' | 'employee'; id: number } | null>(null);
  const [salaryForm, setSalaryForm] = useState<Partial<SalarySettings>>({});
  const [salarySaving, setSalarySaving] = useState(false);

  useEffect(() => {
    loadWorkSchedule();
    loadSalarySettings();
    loadRoles();
    loadEmployees();
  }, []);

  const loadWorkSchedule = async () => {
    try {
      setWorkScheduleLoading(true);
      const data = await workScheduleService.getSettings();
      setWorkSchedule(data);
    } catch (err: unknown) {
      const errorMessage = (err as { message?: string })?.message || 'Không thể tải cài đặt lịch làm việc';
      notificationApi.error({
        message: 'Lỗi',
        description: errorMessage,
      });
    } finally {
      setWorkScheduleLoading(false);
    }
  };

  const loadSalarySettings = async () => {
    try {
      setSalaryLoading(true);
      const data = await salarySettingsService.getAll();
      setSalarySettings(data);
    } catch (err: unknown) {
      const errorMessage = (err as { message?: string })?.message || 'Không thể tải cài đặt lương';
      notificationApi.error({
        message: 'Lỗi',
        description: errorMessage,
      });
    } finally {
      setSalaryLoading(false);
    }
  };

  const loadRoles = async () => {
    try {
      const data = await roleService.getAll();
      setRoles(data.data);
    } catch (err: unknown) {
      // Failed to load roles
    }
  };

  const loadEmployees = async () => {
    try {
      const data = await employeeService.getAll();
      setEmployees(data.data);
    } catch (err: unknown) {
      // Failed to load employees
    }
  };

  const saveWorkSchedule = async () => {
    if (!workSchedule) return;
    
    try {
      setWorkScheduleSaving(true);
      await workScheduleService.updateSettings(workSchedule);
      notificationApi.success({
        message: 'Thành công',
        description: 'Đã cập nhật cài đặt lịch làm việc',
      });
    } catch (err: unknown) {
      const errorMessage = (err as { message?: string })?.message || 'Không thể cập nhật cài đặt lịch làm việc';
      notificationApi.error({
        message: 'Lỗi',
        description: errorMessage,
      });
    } finally {
      setWorkScheduleSaving(false);
    }
  };

  const saveSalarySettings = async () => {
    if (!selectedTarget || !salaryForm.base_salary) return;
    
    try {
      setSalarySaving(true);
      if (selectedTarget.type === 'role') {
        await salarySettingsService.setForRole(selectedTarget.id, salaryForm);
      } else {
        await salarySettingsService.setForEmployee(selectedTarget.id, salaryForm);
      }
      notificationApi.success({
        message: 'Thành công',
        description: 'Đã cập nhật cài đặt lương',
      });
      setSelectedTarget(null);
      setSalaryForm({});
      loadSalarySettings();
    } catch (err: unknown) {
      const errorMessage = (err as { message?: string })?.message || 'Không thể cập nhật cài đặt lương';
      notificationApi.error({
        message: 'Lỗi',
        description: errorMessage,
      });
    } finally {
      setSalarySaving(false);
    }
  };

  const formatTime = (time: string) => {
    return time.substring(0, 5); // HH:mm
  };

  const parseTime = (timeString: string) => {
    return timeString.length === 5 ? `${timeString}:00` : timeString;
  };

  if (workScheduleLoading || salaryLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      {contextHolder}
      
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
            <Settings className="w-8 h-8" />
            Cài đặt Lương & Lịch làm việc
          </h1>
          <p className="text-gray-600 mt-2">Quản lý cài đặt lịch làm việc và lương cho nhân viên</p>
        </div>
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200">
        <nav className="flex gap-4">
          <button
            onClick={() => setActiveTab('work-schedule')}
            className={`px-4 py-2 font-medium border-b-2 transition-colors ${
              activeTab === 'work-schedule'
                ? 'border-blue-600 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}
          >
            <Clock className="w-4 h-4 inline mr-2" />
            Lịch làm việc
          </button>
          <button
            onClick={() => setActiveTab('salary')}
            className={`px-4 py-2 font-medium border-b-2 transition-colors ${
              activeTab === 'salary'
                ? 'border-blue-600 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}
          >
            <DollarSign className="w-4 h-4 inline mr-2" />
            Cài đặt Lương
          </button>
        </nav>
      </div>

      {/* Work Schedule Tab */}
      {activeTab === 'work-schedule' && workSchedule && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 space-y-6">
          <h2 className="text-xl font-semibold text-gray-900">Cài đặt Lịch làm việc</h2>
          
          {/* Standard Times */}
          <div className="grid grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Giờ check-in chuẩn
              </label>
              <input
                type="time"
                value={formatTime(workSchedule.standard_check_in_time)}
                onChange={(e) =>
                  setWorkSchedule({
                    ...workSchedule,
                    standard_check_in_time: parseTime(e.target.value),
                  })
                }
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Giờ check-out chuẩn
              </label>
              <input
                type="time"
                value={formatTime(workSchedule.standard_check_out_time)}
                onChange={(e) =>
                  setWorkSchedule({
                    ...workSchedule,
                    standard_check_out_time: parseTime(e.target.value),
                  })
                }
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>

          {/* Working Days */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-3">
              Ngày làm việc trong tuần
            </label>
            <div className="grid grid-cols-7 gap-3">
              {[
                { key: 'monday', label: 'Thứ 2' },
                { key: 'tuesday', label: 'Thứ 3' },
                { key: 'wednesday', label: 'Thứ 4' },
                { key: 'thursday', label: 'Thứ 5' },
                { key: 'friday', label: 'Thứ 6' },
                { key: 'saturday', label: 'Thứ 7' },
                { key: 'sunday', label: 'CN' },
              ].map((day) => (
                <label key={day.key} className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={workSchedule[day.key as keyof WorkScheduleSettings] as boolean}
                    onChange={(e) =>
                      setWorkSchedule({
                        ...workSchedule,
                        [day.key]: e.target.checked,
                      })
                    }
                    className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
                  />
                  <span className="text-sm text-gray-700">{day.label}</span>
                </label>
              ))}
            </div>
          </div>

          {/* Other Settings */}
          <div className="grid grid-cols-3 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Số giờ làm việc/ngày
              </label>
              <input
                type="number"
                step="0.5"
                value={workSchedule.standard_work_hours_per_day}
                onChange={(e) =>
                  setWorkSchedule({
                    ...workSchedule,
                    standard_work_hours_per_day: parseFloat(e.target.value) || 8,
                  })
                }
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Thời gian cho phép đi muộn (phút)
              </label>
              <input
                type="number"
                value={workSchedule.late_tolerance_minutes}
                onChange={(e) =>
                  setWorkSchedule({
                    ...workSchedule,
                    late_tolerance_minutes: parseInt(e.target.value) || 15,
                  })
                }
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Thời gian cho phép về sớm (phút)
              </label>
              <input
                type="number"
                value={workSchedule.early_leave_tolerance_minutes}
                onChange={(e) =>
                  setWorkSchedule({
                    ...workSchedule,
                    early_leave_tolerance_minutes: parseInt(e.target.value) || 15,
                  })
                }
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>

          <button
            onClick={saveWorkSchedule}
            disabled={workScheduleSaving}
            className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2 disabled:opacity-50"
          >
            {workScheduleSaving ? (
              <Loader2 className="w-5 h-5 animate-spin" />
            ) : (
              <Save className="w-5 h-5" />
            )}
            Lưu cài đặt
          </button>
        </div>
      )}

      {/* Salary Settings Tab */}
      {activeTab === 'salary' && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold text-gray-900">Cài đặt Lương</h2>
            <button
              onClick={() => setSelectedTarget(null)}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              Thêm mới
            </button>
          </div>

          {/* Existing Settings List */}
          <div className="space-y-3">
            {salarySettings.map((setting) => (
              <div
                key={setting.id}
                className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer"
                onClick={() => {
                  setSelectedTarget({
                    type: setting.role_id ? 'role' : 'employee',
                    id: setting.role_id || setting.employee_id || 0,
                  });
                  setSalaryForm(setting);
                }}
              >
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium text-gray-900">
                      {setting.role ? `Vai trò: ${setting.role.name}` : `NV: ${setting.employee?.full_name}`}
                    </p>
                    <p className="text-sm text-gray-600">
                      Lương cơ bản: {setting.base_salary?.toLocaleString('vi-VN')} VNĐ
                    </p>
                  </div>
                  <span className="text-sm text-gray-500">
                    Phụ cấp: {setting.allowance?.toLocaleString('vi-VN')} VNĐ
                  </span>
                </div>
              </div>
            ))}
          </div>

          {/* Salary Form */}
          {selectedTarget && (
            <div className="border-t border-gray-200 pt-6 mt-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                {selectedTarget.type === 'role' ? 'Cài đặt lương theo Vai trò' : 'Cài đặt lương theo Nhân viên'}
              </h3>
              
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  {selectedTarget.type === 'role' ? 'Chọn Vai trò' : 'Chọn Nhân viên'}
                </label>
                <select
                  value={selectedTarget.id}
                  onChange={(e) => {
                    setSelectedTarget({ ...selectedTarget, id: parseInt(e.target.value) });
                    setSalaryForm({});
                  }}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="">-- Chọn --</option>
                  {selectedTarget.type === 'role'
                    ? roles.map((role) => (
                        <option key={role.id} value={role.id}>
                          {role.name}
                        </option>
                      ))
                    : employees.map((emp) => (
                        <option key={emp.id} value={emp.id}>
                          {emp.full_name} ({emp.employee_code})
                        </option>
                      ))}
                </select>
              </div>

              {selectedTarget.id && (
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Lương cơ bản (VNĐ)
                    </label>
                    <input
                      type="number"
                      value={salaryForm.base_salary || ''}
                      onChange={(e) =>
                        setSalaryForm({ ...salaryForm, base_salary: parseFloat(e.target.value) || 0 })
                      }
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Phụ cấp (VNĐ)
                    </label>
                    <input
                      type="number"
                      value={salaryForm.allowance || ''}
                      onChange={(e) =>
                        setSalaryForm({ ...salaryForm, allowance: parseFloat(e.target.value) || 0 })
                      }
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Tỷ lệ Bảo hiểm (%)
                    </label>
                    <input
                      type="number"
                      step="0.1"
                      value={salaryForm.insurance_rate || ''}
                      onChange={(e) =>
                        setSalaryForm({ ...salaryForm, insurance_rate: parseFloat(e.target.value) || 10.5 })
                      }
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Hệ số OT
                    </label>
                    <input
                      type="number"
                      step="0.1"
                      value={salaryForm.overtime_rate || ''}
                      onChange={(e) =>
                        setSalaryForm({ ...salaryForm, overtime_rate: parseFloat(e.target.value) || 1.5 })
                      }
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                </div>
              )}

              {selectedTarget.id && (
                <button
                  onClick={saveSalarySettings}
                  disabled={salarySaving || !salaryForm.base_salary}
                  className="mt-4 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2 disabled:opacity-50"
                >
                  {salarySaving ? (
                    <Loader2 className="w-5 h-5 animate-spin" />
                  ) : (
                    <Save className="w-5 h-5" />
                  )}
                  Lưu cài đặt
                </button>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}


