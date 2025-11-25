// src/app/dashboard/hr/requests/page.tsx
'use client';

import { useState, useEffect } from 'react';
import { notification } from 'antd';
import { CheckSquare, Search, Plus, Edit, Trash2, Eye, Loader2, X, CheckCircle, XCircle, Clock, BarChart3, PieChart } from 'lucide-react';
import { PieChart as RechartsPieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { 
  leaveRequestService, 
  LeaveRequest, 
  CreateLeaveRequestDto, 
  UpdateLeaveRequestDto,
  LeaveType,
  LeaveStatus 
} from '@/lib/api/services/leave-request.service';
import { useAuth } from '@/hooks/useAuth';
import { UserRole } from '@/lib/constants/roles';

const LEAVE_TYPE_LABELS: Record<LeaveType, string> = {
  [LeaveType.ANNUAL]: 'Nghỉ phép năm',
  [LeaveType.SICK]: 'Nghỉ ốm',
  [LeaveType.PERSONAL]: 'Nghỉ cá nhân',
  [LeaveType.MATERNITY]: 'Nghỉ thai sản',
  [LeaveType.PATERNITY]: 'Nghỉ thai sản (nam)',
  [LeaveType.UNPAID]: 'Nghỉ không lương',
  [LeaveType.OTHER]: 'Khác',
};

export default function RequestsPage() {
  const { hasRole, user } = useAuth();
  const [api, contextHolder] = notification.useNotification();

  // States
  const [requests, setRequests] = useState<LeaveRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [pageSize] = useState(10);
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [modalMode, setModalMode] = useState<'create' | 'edit' | 'view' | null>(null);
  const [selectedRequest, setSelectedRequest] = useState<LeaveRequest | null>(null);
  const [formSubmitting, setFormSubmitting] = useState(false);
  const [formError, setFormError] = useState('');
  const [filterStatus, setFilterStatus] = useState<LeaveStatus | undefined>(undefined);
  const [filterStartDate, setFilterStartDate] = useState<string>('');
  const [filterEndDate, setFilterEndDate] = useState<string>('');
  const [formData, setFormData] = useState<CreateLeaveRequestDto>({
    type: LeaveType.ANNUAL,
    start_date: '',
    end_date: '',
    total_days: undefined,
    reason: '',
  });
  const [allRequests, setAllRequests] = useState<LeaveRequest[]>([]);
  const [statsLoading, setStatsLoading] = useState(false);

  // Check if user is employee (can only see their own requests)
  const isEmployee = hasRole(UserRole.EMPLOYEE) && !hasRole(UserRole.MANAGER) && !hasRole(UserRole.SUPER_ADMIN);
  const canManage = hasRole(UserRole.MANAGER) || hasRole(UserRole.SUPER_ADMIN);

  // Fetch requests với debounce
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      fetchRequests();
    }, 300);

    return () => clearTimeout(timeoutId);
  }, [page, search, filterStatus, filterStartDate, filterEndDate]);

  useEffect(() => {
    // Set default dates only on client side
    if (typeof window !== 'undefined' && !formData.start_date) {
      const today = new Date().toISOString().split('T')[0];
      setFormData(prev => ({
        ...prev,
        start_date: today,
        end_date: today,
      }));
    }
  }, []);

  // Fetch all requests for statistics
  useEffect(() => {
    fetchAllRequestsForStats();
  }, []);

  const fetchAllRequestsForStats = async () => {
    setStatsLoading(true);
    try {
      const params: any = { pageSize: 1000 };
      if (isEmployee && user?.id) {
        params.employeeId = user.id;
      }
      const data = await leaveRequestService.getAll(params);
      setAllRequests(data.data);
    } catch (err: any) {
      console.error('Error fetching all requests for stats:', err);
    } finally {
      setStatsLoading(false);
    }
  };

  const fetchRequests = async () => {
    setLoading(true);
    setError('');

    try {
      const params: any = {
        page,
        pageSize,
      };

      if (isEmployee && user?.id) {
        params.employeeId = user.id;
      }
      if (filterStatus) {
        params.status = filterStatus;
      }
      if (filterStartDate) {
        params.startDate = filterStartDate;
      }
      if (filterEndDate) {
        params.endDate = filterEndDate;
      }

      const data = await leaveRequestService.getAll(params);
      setRequests(data.data);
      setTotal(data.total);
      setTotalPages(data.totalPages);
    } catch (err: any) {
      console.error('Error fetching requests:', err);
      setError(err.response?.data?.message || 'Không thể tải danh sách yêu cầu');
    } finally {
      setLoading(false);
    }
  };

  const showNotification = (
    type: 'success' | 'error' | 'info' | 'warning',
    message: string,
    description?: string,
  ) => {
    api[type]({
      message,
      description,
      placement: 'topRight',
    });
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Bạn có chắc muốn xóa yêu cầu này?')) return;

    try {
      await leaveRequestService.delete(id);
      fetchRequests();
      showNotification('success', 'Xóa yêu cầu thành công!');
    } catch (err: any) {
      console.error('Error deleting request:', err);
      showNotification('error', 'Không thể xóa yêu cầu', err.response?.data?.message);
    }
  };

  const handleApprove = async (id: number) => {
    try {
      setFormSubmitting(true);
      await leaveRequestService.approve(id);
      showNotification('success', 'Phê duyệt yêu cầu thành công!');
      fetchRequests();
    } catch (err: any) {
      showNotification('error', 'Không thể phê duyệt yêu cầu', err.response?.data?.message);
    } finally {
      setFormSubmitting(false);
    }
  };

  const handleReject = async (id: number) => {
    try {
      setFormSubmitting(true);
      await leaveRequestService.reject(id);
      showNotification('success', 'Từ chối yêu cầu thành công!');
      fetchRequests();
    } catch (err: any) {
      showNotification('error', 'Không thể từ chối yêu cầu', err.response?.data?.message);
    } finally {
      setFormSubmitting(false);
    }
  };

  const handleCancel = async (id: number) => {
    if (!confirm('Bạn có chắc muốn hủy yêu cầu này?')) return;

    try {
      setFormSubmitting(true);
      await leaveRequestService.cancel(id);
      showNotification('success', 'Hủy yêu cầu thành công!');
      fetchRequests();
    } catch (err: any) {
      showNotification('error', 'Không thể hủy yêu cầu', err.response?.data?.message);
    } finally {
      setFormSubmitting(false);
    }
  };

  const openCreateModal = () => {
    setModalMode('create');
    const today = typeof window !== 'undefined' ? new Date().toISOString().split('T')[0] : '';
    setFormData({
      type: LeaveType.ANNUAL,
      start_date: today,
      end_date: today,
      total_days: undefined,
      reason: '',
    });
    setFormError('');
  };

  const openEditModal = async (requestId: number) => {
    setFormError('');
    try {
      setFormSubmitting(true);
      const request = await leaveRequestService.getById(requestId);
      setSelectedRequest(request);
      setFormData({
        type: request.type,
        start_date: request.start_date,
        end_date: request.end_date,
        total_days: request.total_days || undefined,
        reason: request.reason || '',
      });
      setModalMode('edit');
    } catch (err: any) {
      showNotification('error', 'Không thể tải chi tiết yêu cầu', err.response?.data?.message);
    } finally {
      setFormSubmitting(false);
    }
  };

  const openViewModal = async (requestId: number) => {
    setFormError('');
    try {
      setFormSubmitting(true);
      const request = await leaveRequestService.getById(requestId);
      setSelectedRequest(request);
      setModalMode('view');
    } catch (err: any) {
      showNotification('error', 'Không thể tải chi tiết yêu cầu', err.response?.data?.message);
    } finally {
      setFormSubmitting(false);
    }
  };

  const closeModal = () => {
    setModalMode(null);
    setSelectedRequest(null);
    setFormError('');
  };

  // Function to calculate days between two dates
  const calculateDays = (startDate: string, endDate: string): number => {
    if (!startDate || !endDate) return 0;
    const start = new Date(startDate);
    const end = new Date(endDate);
    if (end < start) return 0;
    const diffTime = end.getTime() - start.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1; // +1 to include both start and end days
    return diffDays;
  };

  // Auto calculate days when dates change
  useEffect(() => {
    if ((modalMode === 'create' || modalMode === 'edit') && formData.start_date && formData.end_date) {
      const calculatedDays = calculateDays(formData.start_date, formData.end_date);
      if (calculatedDays > 0) {
        setFormData(prev => {
          // Only update if the calculated value is different to avoid infinite loop
          if (prev.total_days !== calculatedDays) {
            return { ...prev, total_days: calculatedDays };
          }
          return prev;
        });
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [formData.start_date, formData.end_date, modalMode]);

  const handleFormChange = (field: keyof CreateLeaveRequestDto, value: string | number | LeaveType) => {
    setFormData(prev => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!modalMode || modalMode === 'view') return;

    setFormSubmitting(true);
    setFormError('');

    const payload: CreateLeaveRequestDto | UpdateLeaveRequestDto = {
      ...formData,
      total_days: formData.total_days || undefined,
    };

    try {
      if (modalMode === 'create') {
        await leaveRequestService.create(payload as CreateLeaveRequestDto);
        showNotification('success', 'Tạo yêu cầu thành công');
      } else if (modalMode === 'edit' && selectedRequest) {
        await leaveRequestService.update(selectedRequest.id, payload as UpdateLeaveRequestDto);
        showNotification('success', 'Cập nhật yêu cầu thành công');
      }
      closeModal();
      fetchRequests();
    } catch (err: any) {
      const message = err.response?.data?.message || 'Có lỗi xảy ra, vui lòng thử lại';
      setFormError(Array.isArray(message) ? message.join(', ') : message);
    } finally {
      setFormSubmitting(false);
    }
  };

  const getStatusBadge = (status: LeaveStatus) => {
    const statusMap: Record<LeaveStatus, { bg: string; text: string; label: string; icon: any }> = {
      [LeaveStatus.PENDING]: { 
        bg: 'bg-yellow-100', 
        text: 'text-yellow-700', 
        label: 'Chờ duyệt',
        icon: Clock,
      },
      [LeaveStatus.APPROVED]: { 
        bg: 'bg-green-100', 
        text: 'text-green-700', 
        label: 'Đã duyệt',
        icon: CheckCircle,
      },
      [LeaveStatus.REJECTED]: { 
        bg: 'bg-red-100', 
        text: 'text-red-700', 
        label: 'Từ chối',
        icon: XCircle,
      },
      [LeaveStatus.CANCELLED]: { 
        bg: 'bg-gray-100', 
        text: 'text-gray-700', 
        label: 'Đã hủy',
        icon: X,
      },
    };
    const style = statusMap[status] || statusMap[LeaveStatus.PENDING];
    const Icon = style.icon;
    return (
      <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${style.bg} ${style.text}`}>
        <Icon className="w-3 h-3" />
        {style.label}
      </span>
    );
  };

  const formatDate = (dateString: string) => {
    if (typeof window === 'undefined') return dateString;
    try {
      return new Date(dateString).toLocaleDateString('vi-VN');
    } catch {
      return dateString;
    }
  };

  // Calculate request statistics
  const calculateRequestStats = () => {
    const statusCount: Record<LeaveStatus, number> = {
      [LeaveStatus.PENDING]: 0,
      [LeaveStatus.APPROVED]: 0,
      [LeaveStatus.REJECTED]: 0,
      [LeaveStatus.CANCELLED]: 0,
    };
    const typeCount: Record<LeaveType, number> = {
      [LeaveType.ANNUAL]: 0,
      [LeaveType.SICK]: 0,
      [LeaveType.PERSONAL]: 0,
      [LeaveType.MATERNITY]: 0,
      [LeaveType.PATERNITY]: 0,
      [LeaveType.UNPAID]: 0,
      [LeaveType.OTHER]: 0,
    };
    let totalDays = 0;

    allRequests.forEach(req => {
      statusCount[req.status]++;
      typeCount[req.type]++;
      if (req.total_days) {
        totalDays += req.total_days;
      }
    });

    const statusData = Object.entries(statusCount)
      .filter(([_, value]) => value > 0)
      .map(([status, value]) => ({
        name: status === LeaveStatus.PENDING ? 'Chờ duyệt' :
              status === LeaveStatus.APPROVED ? 'Đã duyệt' :
              status === LeaveStatus.REJECTED ? 'Từ chối' : 'Đã hủy',
        value,
      }));

    const typeData = Object.entries(typeCount)
      .filter(([_, value]) => value > 0)
      .map(([type, value]) => ({
        name: LEAVE_TYPE_LABELS[type as LeaveType],
        value,
      }))
      .sort((a, b) => b.value - a.value);

    return {
      statusData,
      typeData,
      totalDays: Number(Number(totalDays ?? 0).toFixed(1)),
      totalRequests: allRequests.length,
      approvedRate: allRequests.length > 0 
        ? Number(((statusCount[LeaveStatus.APPROVED] / allRequests.length) * 100).toFixed(1))
        : 0,
    };
  };

  const requestStats = calculateRequestStats();
  const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899', '#06b6d4'];

  return (
    <div className="space-y-6">
      {contextHolder}
        {/* Header */}
      <div className="bg-white rounded-xl shadow-sm p-6">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-blue-100 rounded-lg">
              <CheckSquare className="w-6 h-6 text-blue-600" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Quản lý yêu cầu nghỉ phép</h1>
              <p className="text-sm text-gray-500">Tổng số: {total} yêu cầu</p>
            </div>
          </div>
          <button
            onClick={openCreateModal}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            <Plus className="w-5 h-5" />
            Tạo yêu cầu
          </button>
        </div>

        {/* Filters */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Trạng thái</label>
            <select
              value={filterStatus || ''}
              onChange={(e) => setFilterStatus(e.target.value ? (e.target.value as LeaveStatus) : undefined)}
              className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
            >
              <option value="">Tất cả</option>
              <option value={LeaveStatus.PENDING}>Chờ duyệt</option>
              <option value={LeaveStatus.APPROVED}>Đã duyệt</option>
              <option value={LeaveStatus.REJECTED}>Từ chối</option>
              <option value={LeaveStatus.CANCELLED}>Đã hủy</option>
            </select>
          </div>
              <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Từ ngày</label>
            <input
              type="date"
              value={filterStartDate}
              onChange={(e) => setFilterStartDate(e.target.value)}
              className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
            />
          </div>
              <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Đến ngày</label>
            <input
              type="date"
              value={filterEndDate}
              onChange={(e) => setFilterEndDate(e.target.value)}
              className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
            />
          </div>
              <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Tìm kiếm</label>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                placeholder="Tìm kiếm..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-10 pr-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Error Message */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-xl p-4">
          <p className="text-red-600 text-sm">{error}</p>
        </div>
      )}

      {/* Loading */}
      {loading ? (
        <div className="bg-white rounded-xl shadow-sm p-12">
          <div className="flex flex-col items-center justify-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mb-4"></div>
            <p className="text-gray-600">Đang tải dữ liệu...</p>
          </div>
        </div>
      ) : (
        <>
        {/* Table */}
          <div className="bg-white rounded-xl shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    {canManage && (
                      <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase">
                        Nhân viên
                      </th>
                    )}
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase">
                      Loại
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase">
                      Từ ngày
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase">
                      Đến ngày
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase">
                      Số ngày
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase">
                      Trạng thái
                    </th>
                    <th className="px-6 py-4 text-right text-xs font-semibold text-gray-600 uppercase">
                      Thao tác
                    </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                  {requests.map((req) => (
                    <tr key={req.id} className="hover:bg-gray-50 transition-colors">
                      {canManage && (
                        <td className="px-6 py-4">
                          <p className="font-medium text-gray-900">
                            {req.employee?.full_name || 'N/A'}
                          </p>
                          <p className="text-sm text-gray-500">
                            {req.employee?.employee_code || ''}
                          </p>
                        </td>
                      )}
                      <td className="px-6 py-4">
                        <p className="text-sm text-gray-900">{LEAVE_TYPE_LABELS[req.type] || req.type}</p>
                      </td>
                      <td className="px-6 py-4">
                        <p className="text-sm text-gray-900">{formatDate(req.start_date)}</p>
                    </td>
                      <td className="px-6 py-4">
                        <p className="text-sm text-gray-900">{formatDate(req.end_date)}</p>
                    </td>
                      <td className="px-6 py-4">
                        <p className="text-sm text-gray-900">
                          {req.total_days ? `${req.total_days} ngày` : 'N/A'}
                        </p>
                    </td>
                      <td className="px-6 py-4">
                        {getStatusBadge(req.status)}
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => openViewModal(req.id)}
                            className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                            title="Xem chi tiết"
                          >
                            <Eye className="w-4 h-4" />
                          </button>
                          {req.status === LeaveStatus.PENDING && (
                            <>
                              {canManage && (
                                <>
                                  <button
                                    onClick={() => handleApprove(req.id)}
                                    disabled={formSubmitting}
                                    className="p-2 text-green-600 hover:bg-green-50 rounded-lg transition-colors disabled:opacity-50"
                                    title="Phê duyệt"
                                  >
                                    <CheckCircle className="w-4 h-4" />
                                  </button>
                                  <button
                                    onClick={() => handleReject(req.id)}
                                    disabled={formSubmitting}
                                    className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors disabled:opacity-50"
                                    title="Từ chối"
                                  >
                                    <XCircle className="w-4 h-4" />
                                  </button>
                                </>
                              )}
                              {!canManage && (
                        <button
                                  onClick={() => handleCancel(req.id)}
                                  disabled={formSubmitting}
                                  className="p-2 text-orange-600 hover:bg-orange-50 rounded-lg transition-colors disabled:opacity-50"
                                  title="Hủy yêu cầu"
                                >
                                  <X className="w-4 h-4" />
                        </button>
                              )}
                            </>
                          )}
                          {canManage && (
                            <button
                              onClick={() => openEditModal(req.id)}
                              className="p-2 text-green-600 hover:bg-green-50 rounded-lg transition-colors"
                              title="Chỉnh sửa"
                            >
                              <Edit className="w-4 h-4" />
                            </button>
                          )}
                          {canManage && (
                            <button
                              onClick={() => handleDelete(req.id)}
                              className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                              title="Xóa"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            </div>

            {/* Empty State */}
            {requests.length === 0 && !loading && (
              <div className="text-center py-12">
                <CheckSquare className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                <p className="text-gray-500 text-lg font-medium">Không tìm thấy yêu cầu</p>
              </div>
            )}
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="bg-white rounded-xl shadow-sm p-4">
              <div className="flex items-center justify-between">
                <p className="text-sm text-gray-600">
                  Hiển thị <span className="font-semibold">{requests.length}</span> / {total} yêu cầu
                </p>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setPage(page - 1)}
                    disabled={page === 1}
                    className="px-3 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    Trước
                  </button>
                  <div className="flex items-center gap-1">
                    {Array.from({ length: Math.min(totalPages, 5) }, (_, i) => {
                      let pageNum;
                      if (totalPages <= 5) {
                        pageNum = i + 1;
                      } else if (page <= 3) {
                        pageNum = i + 1;
                      } else if (page >= totalPages - 2) {
                        pageNum = totalPages - 4 + i;
                      } else {
                        pageNum = page - 2 + i;
                      }

                      return (
                        <button
                          key={pageNum}
                          onClick={() => setPage(pageNum)}
                          className={`w-10 h-10 rounded-lg font-medium transition-colors ${
                            pageNum === page
                              ? 'bg-blue-600 text-white'
                              : 'hover:bg-gray-100 text-gray-700'
                          }`}
                        >
                          {pageNum}
                </button>
                      );
                    })}
                  </div>
                  <button
                    onClick={() => setPage(page + 1)}
                    disabled={page === totalPages}
                    className="px-3 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    Sau
                  </button>
                </div>
                </div>
                </div>
          )}
        </>
      )}

      {/* Modal */}
      {modalMode && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-200 flex items-center justify-between">
              <h2 className="text-xl font-bold text-gray-900">
                {modalMode === 'create' && 'Tạo yêu cầu nghỉ phép'}
                {modalMode === 'edit' && 'Chỉnh sửa yêu cầu'}
                {modalMode === 'view' && 'Chi tiết yêu cầu'}
              </h2>
              <button
                onClick={closeModal}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <X className="w-5 h-5 text-gray-500" />
              </button>
                </div>

            {formError && (
              <div className="mx-6 mt-4 p-3 bg-red-50 border border-red-200 rounded-lg">
                <p className="text-red-600 text-sm">{formError}</p>
                  </div>
                )}

            {modalMode === 'view' && selectedRequest ? (
              <div className="p-6 space-y-4">
                <DetailField label="Nhân viên" value={selectedRequest.employee?.full_name || 'N/A'} />
                <DetailField label="Loại nghỉ phép" value={LEAVE_TYPE_LABELS[selectedRequest.type] || selectedRequest.type} />
                <DetailField label="Từ ngày" value={formatDate(selectedRequest.start_date)} />
                <DetailField label="Đến ngày" value={formatDate(selectedRequest.end_date)} />
                <DetailField label="Số ngày" value={selectedRequest.total_days ? `${selectedRequest.total_days} ngày` : 'N/A'} />
                <DetailField label="Lý do" value={selectedRequest.reason || 'N/A'} />
                      <div>
                  <p className="text-xs font-semibold text-gray-500 uppercase">Trạng thái</p>
                  <div className="mt-1">{getStatusBadge(selectedRequest.status)}</div>
                      </div>
                {selectedRequest.approver && (
                  <DetailField label="Người duyệt" value={selectedRequest.approver.full_name} />
                )}
                {selectedRequest.approved_at && (
                  <DetailField 
                    label="Thời gian duyệt" 
                    value={typeof window !== 'undefined' ? new Date(selectedRequest.approved_at).toLocaleString('vi-VN') : selectedRequest.approved_at} 
                  />
                )}
                <div className="flex items-center justify-end pt-4 border-t">
                <button
                    onClick={closeModal}
                    className="px-4 py-2 rounded-lg bg-blue-600 text-white font-medium hover:bg-blue-700 transition-colors"
                >
                  Đóng
                </button>
              </div>
            </div>
            ) : (
              <form onSubmit={handleSubmit} className="p-6 space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Loại nghỉ phép <span className="text-red-500">*</span>
                  </label>
                  <select
                    value={formData.type}
                    onChange={(e) => handleFormChange('type', e.target.value as LeaveType)}
                    required
                    disabled={formSubmitting}
                    className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none disabled:bg-gray-100"
                  >
                    {Object.entries(LEAVE_TYPE_LABELS).map(([value, label]) => (
                      <option key={value} value={value}>
                        {label}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="grid grid-cols-2 gap-4">
                    <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Từ ngày <span className="text-red-500">*</span>
                    </label>
                      <input
                      type="date"
                      value={formData.start_date}
                      onChange={(e) => handleFormChange('start_date', e.target.value)}
                      required
                      disabled={formSubmitting}
                      className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none disabled:bg-gray-100"
                      />
                    </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Đến ngày <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="date"
                      value={formData.end_date}
                      onChange={(e) => handleFormChange('end_date', e.target.value)}
                      required
                      disabled={formSubmitting}
                      min={formData.start_date}
                      className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none disabled:bg-gray-100"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Số ngày
                    {formData.start_date && formData.end_date && (
                      <span className="ml-2 text-xs text-gray-500 font-normal">
                        (Tự động tính: {calculateDays(formData.start_date, formData.end_date)} ngày)
                      </span>
                    )}
                  </label>
                  <input
                    type="number"
                    min="0"
                    step="0.5"
                    value={formData.total_days || ''}
                    onChange={(e) => handleFormChange('total_days', e.target.value ? Number(e.target.value) : undefined)}
                    disabled={formSubmitting}
                    className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none disabled:bg-gray-100 bg-gray-50"
                    placeholder="Tự động tính từ ngày bắt đầu và kết thúc"
                    readOnly={!!(formData.start_date && formData.end_date)}
                  />
                  {formData.start_date && formData.end_date && (
                    <p className="mt-1 text-xs text-gray-500">
                      Số ngày sẽ tự động tính khi bạn chọn từ ngày và đến ngày
                    </p>
                )}
              </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Lý do</label>
                  <textarea
                    value={formData.reason}
                    onChange={(e) => handleFormChange('reason', e.target.value)}
                    disabled={formSubmitting}
                    rows={4}
                    className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none disabled:bg-gray-100"
                    placeholder="Nhập lý do nghỉ phép..."
                  />
                </div>

                <div className="flex items-center justify-end gap-3 pt-4 border-t">
                <button
                    type="button"
                    onClick={closeModal}
                    className="px-4 py-2 rounded-lg border border-gray-300 text-gray-700 hover:bg-gray-50 transition-colors"
                >
                  Hủy
                </button>
                <button
                    type="submit"
                    disabled={formSubmitting}
                    className="px-6 py-2 rounded-lg bg-blue-600 text-white font-medium hover:bg-blue-700 transition-colors disabled:opacity-60 flex items-center gap-2"
                  >
                    {formSubmitting && <Loader2 className="w-4 h-4 animate-spin" />}
                    {modalMode === 'create' ? 'Tạo yêu cầu' : 'Lưu thay đổi'}
                </button>
              </div>
              </form>
            )}
            </div>
          </div>
        )}
      </div>
  );
}

function DetailField({ label, value }: { label: string; value: string | React.ReactNode }) {
  return (
    <div>
      <p className="text-xs font-semibold text-gray-500 uppercase">{label}</p>
      <p className="mt-1 text-gray-900">{value}</p>
    </div>
  );
}
