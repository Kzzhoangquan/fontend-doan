'use client';

import { useState, useEffect } from 'react';
import { notification } from 'antd';
import { DollarSign, Calendar, Loader2, Eye } from 'lucide-react';
import { salaryCalculationService, EmployeeSalary, SalaryStatus } from '@/lib/api/services/salary-calculation.service';
import { useAuth } from '@/hooks/useAuth';

export default function EmployeeSalaryPage() {
  const [notificationApi, contextHolder] = notification.useNotification();
  const { user } = useAuth();
  const [salaries, setSalaries] = useState<EmployeeSalary[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedSalary, setSelectedSalary] = useState<EmployeeSalary | null>(null);

  useEffect(() => {
    if (user?.id) {
      loadSalaries();
    }
  }, [user]);

  const loadSalaries = async () => {
    if (!user?.id) return;
    
    try {
      setLoading(true);
      const data = await salaryCalculationService.getEmployeeSalaries(user.id);
      setSalaries(data);
    } catch (err: any) {
      notificationApi.error({
        message: 'Lỗi',
        description: err.message || 'Không thể tải bảng lương',
      });
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (status: SalaryStatus) => {
    switch (status) {
      case SalaryStatus.PENDING:
        return (
          <span className="px-3 py-1 bg-yellow-100 text-yellow-800 rounded-full text-sm font-medium">
            Chờ duyệt
          </span>
        );
      case SalaryStatus.APPROVED:
        return (
          <span className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm font-medium">
            Đã duyệt
          </span>
        );
      case SalaryStatus.PAID:
        return (
          <span className="px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm font-medium">
            Đã thanh toán
          </span>
        );
      case SalaryStatus.CANCELLED:
        return (
          <span className="px-3 py-1 bg-red-100 text-red-800 rounded-full text-sm font-medium">
            Đã hủy
          </span>
        );
    }
  };

  const formatCurrency = (amount: number | null) => {
    if (amount === null || amount === undefined) return '0';
    return new Intl.NumberFormat('vi-VN').format(amount);
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('vi-VN', { year: 'numeric', month: '2-digit' });
  };

  return (
    <div className="p-6 space-y-6">
      {contextHolder}
      
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
          <DollarSign className="w-8 h-8" />
          Bảng Lương của tôi
        </h1>
        <p className="text-gray-600 mt-2">Xem lịch sử lương và chi tiết lương theo tháng</p>
      </div>

      {/* Salary List */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200">
        <div className="p-6 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-900">Lịch sử Lương</h2>
        </div>
        
        {loading ? (
          <div className="flex items-center justify-center h-64">
            <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
          </div>
        ) : salaries.length === 0 ? (
          <div className="p-12 text-center text-gray-500">
            <Calendar className="w-12 h-12 mx-auto mb-4 text-gray-400" />
            <p>Chưa có bảng lương nào</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Tháng
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Lương cơ bản
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Ngày làm việc
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    OT (giờ)
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Phụ cấp
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Tổng lương
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Trạng thái
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Thao tác
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {salaries.map((salary) => (
                  <tr key={salary.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {formatDate(salary.month)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {formatCurrency(salary.base_salary)} VNĐ
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {salary.work_days || 0} ngày
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {salary.overtime_hours || 0} giờ
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {formatCurrency(salary.allowance)} VNĐ
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold text-gray-900">
                      {formatCurrency(salary.total_salary)} VNĐ
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {getStatusBadge(salary.status)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      <button
                        onClick={() => setSelectedSalary(salary)}
                        className="text-blue-600 hover:text-blue-800 flex items-center gap-1"
                      >
                        <Eye className="w-4 h-4" />
                        Chi tiết
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Salary Detail Modal */}
      {selectedSalary && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4">
          <div className="w-full max-w-2xl bg-white rounded-2xl shadow-2xl max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-200 flex items-center justify-between">
              <h3 className="text-xl font-semibold text-gray-900">Chi tiết Lương - {formatDate(selectedSalary.month)}</h3>
              <button
                onClick={() => setSelectedSalary(null)}
                className="text-gray-400 hover:text-gray-600"
              >
                ✕
              </button>
            </div>
            <div className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-600">Lương cơ bản</p>
                  <p className="text-lg font-semibold text-gray-900">
                    {formatCurrency(selectedSalary.base_salary)} VNĐ
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Số giờ làm việc</p>
                  <p className="text-lg font-semibold text-gray-900">{selectedSalary.work_hours || 0} giờ</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Số ngày làm việc</p>
                  <p className="text-lg font-semibold text-gray-900">{selectedSalary.work_days || 0} ngày</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Số ngày nghỉ có phép</p>
                  <p className="text-lg font-semibold text-gray-900">
                    {selectedSalary.approved_leave_days || 0} ngày
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Số giờ OT</p>
                  <p className="text-lg font-semibold text-gray-900">
                    {selectedSalary.overtime_hours || 0} giờ
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Lương OT</p>
                  <p className="text-lg font-semibold text-green-600">
                    +{formatCurrency(selectedSalary.overtime_salary)} VNĐ
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Phụ cấp</p>
                  <p className="text-lg font-semibold text-green-600">
                    +{formatCurrency(selectedSalary.allowance)} VNĐ
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Bảo hiểm</p>
                  <p className="text-lg font-semibold text-red-600">
                    -{formatCurrency(selectedSalary.insurance)} VNĐ
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Khấu trừ</p>
                  <p className="text-lg font-semibold text-red-600">
                    -{formatCurrency(selectedSalary.deduction)} VNĐ
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Thưởng</p>
                  <p className="text-lg font-semibold text-green-600">
                    +{formatCurrency(selectedSalary.bonus)} VNĐ
                  </p>
                </div>
              </div>
              <div className="pt-4 border-t border-gray-200">
                <div className="flex items-center justify-between">
                  <p className="text-lg font-semibold text-gray-900">Tổng lương nhận được</p>
                  <p className="text-2xl font-bold text-blue-600">
                    {formatCurrency(selectedSalary.total_salary)} VNĐ
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}


