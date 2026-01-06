// src/app/dashboard/hr/requests/page.tsx
'use client';

import { useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import { notification } from 'antd';
import { CheckSquare, Search, Plus, Edit, Trash2, Eye, Loader2, X, CheckCircle, XCircle, Clock, BarChart3, PieChart, LucideIcon } from 'lucide-react';
import { PieChart as RechartsPieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { 
  hrRequestService,
  HrRequest,
  HrRequestType,
  HrRequestStatus,
  LeaveType,
  LateEarlyType,
  CreateLeaveRequestDto,
  CreateOvertimeRequestDto,
  CreateLateEarlyRequestDto,
  UpdateHrRequestDto,
} from '@/lib/api/services/hr-request.service';
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

const HR_REQUEST_TYPE_LABELS: Record<HrRequestType, string> = {
  [HrRequestType.LEAVE]: 'Nghỉ phép',
  [HrRequestType.OVERTIME]: 'Làm thêm giờ',
  [HrRequestType.LATE_EARLY]: 'Đi muộn/Về sớm',
};

const LATE_EARLY_TYPE_LABELS: Record<LateEarlyType, string> = {
  [LateEarlyType.LATE]: 'Đi muộn',
  [LateEarlyType.EARLY]: 'Về sớm',
};

export default function RequestsPage() {
  const searchParams = useSearchParams();
  const { hasRole, user } = useAuth();
  const [api, contextHolder] = notification.useNotification();

  // States
  const [requests, setRequests] = useState<HrRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [pageSize] = useState(10);
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [modalMode, setModalMode] = useState<'create' | 'edit' | 'view' | null>(null);
  const [selectedRequest, setSelectedRequest] = useState<HrRequest | null>(null);
  const [formSubmitting, setFormSubmitting] = useState(false);
  const [formError, setFormError] = useState('');
  const [filterStatus, setFilterStatus] = useState<HrRequestStatus | undefined>(undefined);
  const [filterRequestType, setFilterRequestType] = useState<HrRequestType | undefined>(undefined);
  const [filterStartDate, setFilterStartDate] = useState<string>('');
  const [filterEndDate, setFilterEndDate] = useState<string>('');
  const [selectedRequestType, setSelectedRequestType] = useState<HrRequestType>(HrRequestType.LEAVE);
  const [leaveFormData, setLeaveFormData] = useState<CreateLeaveRequestDto>({
    leave_type: LeaveType.ANNUAL,
    start_date: '',
    end_date: '',
    reason: '',
  });
  const [overtimeFormData, setOvertimeFormData] = useState<CreateOvertimeRequestDto>({
    date: '',
    start_time: '',
    end_time: '',
    reason: '',
  });
  const [lateEarlyFormData, setLateEarlyFormData] = useState<CreateLateEarlyRequestDto>({
    date: '',
    type: LateEarlyType.LATE,
    actual_time: '',
    minutes: undefined,
    reason: '',
  });
  const [allRequests, setAllRequests] = useState<HrRequest[]>([]);
  const [statsLoading, setStatsLoading] = useState(false);
  const [leaveBalance, setLeaveBalance] = useState<{
    limit: number;
    used: number;
    remaining: number;
    year: number;
  } | null>(null);
  const [balanceLoading, setBalanceLoading] = useState(false);

  // Check if user is employee (can only see their own requests)
  const isEmployee = hasRole(UserRole.EMPLOYEE) && !hasRole(UserRole.MANAGER) && !hasRole(UserRole.SUPER_ADMIN);
  const canManage = hasRole(UserRole.MANAGER) || hasRole(UserRole.SUPER_ADMIN);
  
  // Determine view mode from query param: 'all' (from HR menu) or 'my' (from Employee menu)
  const viewModeParam = searchParams.get('view');
  // If view param is explicitly set, use it; otherwise default based on query param presence
  const isViewAll = viewModeParam === 'all';
  const isViewMy = viewModeParam === 'my';

  // Fetch requests với debounce
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      fetchRequests();
    }, 300);

    return () => clearTimeout(timeoutId);
  }, [page, search, filterStatus, filterRequestType, filterStartDate, filterEndDate, isViewMy]);

  useEffect(() => {
    // Set default dates only on client side
    if (typeof window !== 'undefined') {
      const today = new Date().toISOString().split('T')[0];
      if (!leaveFormData.start_date) {
        setLeaveFormData(prev => ({
          ...prev,
          start_date: today,
          end_date: today,
        }));
      }
      if (!overtimeFormData.date) {
        setOvertimeFormData(prev => ({
          ...prev,
          date: today,
          start_time: '18:00',
          end_time: '20:00',
        }));
      }
      if (!lateEarlyFormData.date) {
        setLateEarlyFormData(prev => ({
          ...prev,
          date: today,
        }));
      }
    }
  }, []);

  // Fetch all requests for statistics
  useEffect(() => {
    fetchAllRequestsForStats();
  }, [isViewMy, user?.id]);

  const fetchAllRequestsForStats = async () => {
    setStatsLoading(true);
    try {
      const params: { pageSize: number; employeeId?: number } = { pageSize: 1000 };
      // Only filter by employeeId if viewing "my" requests
      if (isViewMy && user?.id) {
        params.employeeId = user.id;
      }
      // If viewAll, don't set employeeId (show all employees' requests)
      const data = await hrRequestService.getAll(params);
      setAllRequests(data);
    } catch (err) {
      // Error fetching all requests for stats
    } finally {
      setStatsLoading(false);
    }
  };

  const fetchRequests = async () => {
    setLoading(true);
    setError('');

    try {
      const params: { page?: number; pageSize?: number; search?: string; status?: HrRequestStatus; request_type?: HrRequestType; startDate?: string; endDate?: string; employeeId?: number } = {
        page,
        pageSize,
      };

      // Only filter by employeeId if viewing "my" requests
      if (isViewMy && user?.id) {
        params.employeeId = user.id;
      }
      // If viewAll, don't set employeeId (show all employees' requests)
      if (filterStatus) {
        params.status = filterStatus;
      }
      if (filterStartDate) {
        params.startDate = filterStartDate;
      }
      if (filterEndDate) {
        params.endDate = filterEndDate;
      }

      const allData = await hrRequestService.getAll({ ...params, requestType: filterRequestType });
      // Implement pagination manually
      const filteredData = filterRequestType ? allData.filter(r => r.request_type === filterRequestType) : allData;
      const startIndex = (page - 1) * pageSize;
      const endIndex = startIndex + pageSize;
      setRequests(filteredData.slice(startIndex, endIndex));
      setTotal(filteredData.length);
      setTotalPages(Math.ceil(filteredData.length / pageSize));
    } catch (err: unknown) {
      const errorMessage = (err as { response?: { data?: { message?: string } } })?.response?.data?.message || 'Không thể tải danh sách yêu cầu';
      setError(errorMessage);
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
      await hrRequestService.delete(id);
      fetchRequests();
      showNotification('success', 'Xóa yêu cầu thành công!');
    } catch (err: unknown) {
      const errorMessage = (err as { response?: { data?: { message?: string } } })?.response?.data?.message || 'Không thể xóa yêu cầu';
      showNotification('error', 'Không thể xóa yêu cầu', errorMessage);
    }
  };

  const handleApprove = async (id: number) => {
    try {
      setFormSubmitting(true);
      await hrRequestService.approve(id);
      showNotification('success', 'Phê duyệt yêu cầu thành công!');
      fetchRequests();
    } catch (err: unknown) {
      const errorMessage = (err as { response?: { data?: { message?: string } } })?.response?.data?.message || 'Không thể phê duyệt yêu cầu';
      showNotification('error', 'Không thể phê duyệt yêu cầu', errorMessage);
    } finally {
      setFormSubmitting(false);
    }
  };

  const handleReject = async (id: number) => {
    try {
      setFormSubmitting(true);
      await hrRequestService.reject(id);
      showNotification('success', 'Từ chối yêu cầu thành công!');
      fetchRequests();
    } catch (err: unknown) {
      const errorMessage = (err as { response?: { data?: { message?: string } } })?.response?.data?.message || 'Không thể từ chối yêu cầu';
      showNotification('error', 'Không thể từ chối yêu cầu', errorMessage);
    } finally {
      setFormSubmitting(false);
    }
  };

  const handleCancel = async (id: number) => {
    if (!confirm('Bạn có chắc muốn hủy yêu cầu này?')) return;

    try {
      setFormSubmitting(true);
      await hrRequestService.cancel(id);
      showNotification('success', 'Hủy yêu cầu thành công!');
      fetchRequests();
    } catch (err: unknown) {
      const errorMessage = (err as { response?: { data?: { message?: string } } })?.response?.data?.message || 'Không thể hủy yêu cầu';
      showNotification('error', 'Không thể hủy yêu cầu', errorMessage);
    } finally {
      setFormSubmitting(false);
    }
  };

  const openCreateModal = () => {
    setModalMode('create');
    setSelectedRequestType(HrRequestType.LEAVE);
    const today = typeof window !== 'undefined' ? new Date().toISOString().split('T')[0] : '';
    setLeaveFormData({
      leave_type: LeaveType.ANNUAL,
      start_date: today,
      end_date: today,
      reason: '',
    });
    setOvertimeFormData({
      date: today,
      start_time: '18:00',
      end_time: '20:00',
      reason: '',
    });
    setLateEarlyFormData({
      date: today,
      type: LateEarlyType.LATE,
      actual_time: '',
      minutes: undefined,
      reason: '',
    });
    setFormError('');
  };

  const openEditModal = async (requestId: number) => {
    setFormError('');
    try {
      setFormSubmitting(true);
      const request = await hrRequestService.getById(requestId);
      setSelectedRequest(request);
      if (request.request_type === HrRequestType.LEAVE) {
        setLeaveFormData({
          leave_type: request.leave_type || LeaveType.ANNUAL,
          start_date: request.start_date || '',
          end_date: request.end_date || '',
          reason: request.reason || '',
        });
      } else if (request.request_type === HrRequestType.OVERTIME) {
        setOvertimeFormData({
          date: request.overtime_date || '',
          start_time: request.start_time || '',
          end_time: request.end_time || '',
          reason: request.reason || '',
        });
      } else if (request.request_type === HrRequestType.LATE_EARLY) {
        setLateEarlyFormData({
          date: request.late_early_date || '',
          type: request.late_early_type || LateEarlyType.LATE,
          actual_time: request.actual_time || '',
          minutes: request.minutes || undefined,
          reason: request.reason || '',
        });
      }
      setModalMode('edit');
    } catch (err: unknown) {
      const errorMessage = (err as { response?: { data?: { message?: string } } })?.response?.data?.message || 'Không thể tải chi tiết yêu cầu';
      showNotification('error', 'Không thể tải chi tiết yêu cầu', errorMessage);
    } finally {
      setFormSubmitting(false);
    }
  };

  const openViewModal = async (requestId: number) => {
    setFormError('');
    try {
      setFormSubmitting(true);
      const request = await hrRequestService.getById(requestId);
      setSelectedRequest(request);
      setModalMode('view');
    } catch (err: unknown) {
      const errorMessage = (err as { response?: { data?: { message?: string } } })?.response?.data?.message || 'Không thể tải chi tiết yêu cầu';
      showNotification('error', 'Không thể tải chi tiết yêu cầu', errorMessage);
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

  // Auto calculate days when dates change (for leave requests)
  useEffect(() => {
    if (
      (modalMode === 'create' || modalMode === 'edit') &&
      selectedRequestType === HrRequestType.LEAVE &&
      leaveFormData.start_date &&
      leaveFormData.end_date
    ) {
      const calculatedDays = calculateDays(leaveFormData.start_date, leaveFormData.end_date);
      // Days are calculated automatically, no need to store
    }
  }, [leaveFormData.start_date, leaveFormData.end_date, modalMode, selectedRequestType]);

  // Fetch leave balance when modal opens and type is ANNUAL
  useEffect(() => {
    const fetchLeaveBalance = async () => {
      if (
        (modalMode === 'create' || modalMode === 'edit') &&
        selectedRequestType === HrRequestType.LEAVE &&
        leaveFormData.leave_type === LeaveType.ANNUAL &&
        isEmployee &&
        user?.id
      ) {
        setBalanceLoading(true);
        try {
          const balance = await hrRequestService.getLeaveBalance(user.id);
          setLeaveBalance(balance);
        } catch (err) {
          // Error fetching leave balance
          setLeaveBalance(null);
        } finally {
          setBalanceLoading(false);
        }
      } else {
        // Reset balance when type changes or modal closes
        setLeaveBalance(null);
      }
    };

    fetchLeaveBalance();
  }, [modalMode, selectedRequestType, leaveFormData.leave_type, isEmployee, user?.id]);

  const handleLeaveFormChange = (field: keyof CreateLeaveRequestDto, value: string | number | LeaveType) => {
    setLeaveFormData(prev => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleOvertimeFormChange = (field: keyof CreateOvertimeRequestDto, value: string) => {
    setOvertimeFormData(prev => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleLateEarlyFormChange = (field: keyof CreateLateEarlyRequestDto, value: string | number | LateEarlyType | undefined) => {
    setLateEarlyFormData(prev => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!modalMode || modalMode === 'view') return;

    setFormSubmitting(true);
    setFormError('');

    try {
      if (modalMode === 'create') {
        // Validate leave balance for ANNUAL type
        if (selectedRequestType === HrRequestType.LEAVE) {
          const totalDays = leaveFormData.start_date && leaveFormData.end_date 
            ? calculateDays(leaveFormData.start_date, leaveFormData.end_date) 
            : 0;
          
          if (leaveFormData.leave_type === LeaveType.ANNUAL && totalDays) {
            // If balance not loaded yet, try to load it first
            if (!leaveBalance && isEmployee && user?.id) {
              try {
                setBalanceLoading(true);
                const balance = await hrRequestService.getLeaveBalance(user.id);
                setLeaveBalance(balance);
                if (totalDays > balance.remaining) {
                  setFormError(
                    `Vượt quá số ngày phép còn lại! Bạn còn ${balance.remaining} ngày phép trong năm ${balance.year}. Yêu cầu: ${totalDays} ngày.`
                  );
                  setFormSubmitting(false);
                  setBalanceLoading(false);
                  return;
                }
              } catch (err) {
                // Error fetching leave balance
                setFormError('Không thể tải thông tin số ngày phép còn lại. Vui lòng thử lại.');
                setFormSubmitting(false);
                setBalanceLoading(false);
                return;
              } finally {
                setBalanceLoading(false);
              }
            } else if (leaveBalance && totalDays > leaveBalance.remaining) {
              setFormError(
                `Vượt quá số ngày phép còn lại! Bạn còn ${leaveBalance.remaining} ngày phép trong năm ${leaveBalance.year}. Yêu cầu: ${totalDays} ngày.`
              );
              setFormSubmitting(false);
              return;
            }
          }

          await hrRequestService.createLeaveRequest(leaveFormData);
          showNotification('success', 'Tạo yêu cầu nghỉ phép thành công');
        } else if (selectedRequestType === HrRequestType.OVERTIME) {
          await hrRequestService.createOvertimeRequest(overtimeFormData);
          showNotification('success', 'Tạo yêu cầu làm thêm giờ thành công');
        } else if (selectedRequestType === HrRequestType.LATE_EARLY) {
          await hrRequestService.createLateEarlyRequest(lateEarlyFormData);
          showNotification('success', 'Tạo yêu cầu đi muộn/về sớm thành công');
        }
      } else if (modalMode === 'edit' && selectedRequest) {
        let updateData: UpdateHrRequestDto = {};
        
        if (selectedRequest.request_type === HrRequestType.LEAVE) {
          updateData = {
            leave_type: leaveFormData.leave_type,
            start_date: leaveFormData.start_date,
            end_date: leaveFormData.end_date,
            reason: leaveFormData.reason,
          };
        } else if (selectedRequest.request_type === HrRequestType.OVERTIME) {
          updateData = {
            overtime_date: overtimeFormData.date,
            start_time: overtimeFormData.start_time,
            end_time: overtimeFormData.end_time,
            reason: overtimeFormData.reason,
          };
        } else if (selectedRequest.request_type === HrRequestType.LATE_EARLY) {
          updateData = {
            late_early_date: lateEarlyFormData.date,
            late_early_type: lateEarlyFormData.type,
            actual_time: lateEarlyFormData.actual_time,
            minutes: lateEarlyFormData.minutes,
            reason: lateEarlyFormData.reason,
          };
        }

        await hrRequestService.update(selectedRequest.id, updateData);
        showNotification('success', 'Cập nhật yêu cầu thành công');
      }
      
      closeModal();
      fetchRequests();
    } catch (err: unknown) {
      const errorData = (err as { response?: { data?: { message?: string | string[] } } })?.response?.data;
      const message = errorData?.message || 'Có lỗi xảy ra, vui lòng thử lại';
      setFormError(Array.isArray(message) ? message.join(', ') : String(message));
    } finally {
      setFormSubmitting(false);
    }
  };

  const getStatusBadge = (status: HrRequestStatus) => {
    const statusMap: Record<HrRequestStatus, { bg: string; text: string; label: string; icon: LucideIcon }> = {
      [HrRequestStatus.PENDING]: { 
        bg: 'bg-yellow-100', 
        text: 'text-yellow-700', 
        label: 'Chờ duyệt',
        icon: Clock,
      },
      [HrRequestStatus.APPROVED]: { 
        bg: 'bg-green-100', 
        text: 'text-green-700', 
        label: 'Đã duyệt',
        icon: CheckCircle,
      },
      [HrRequestStatus.REJECTED]: { 
        bg: 'bg-red-100', 
        text: 'text-red-700', 
        label: 'Từ chối',
        icon: XCircle,
      },
      [HrRequestStatus.CANCELLED]: { 
        bg: 'bg-gray-100', 
        text: 'text-gray-700', 
        label: 'Đã hủy',
        icon: X,
      },
    };
    const style = statusMap[status] || statusMap[HrRequestStatus.PENDING];
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
    const statusCount: Record<HrRequestStatus, number> = {
      [HrRequestStatus.PENDING]: 0,
      [HrRequestStatus.APPROVED]: 0,
      [HrRequestStatus.REJECTED]: 0,
      [HrRequestStatus.CANCELLED]: 0,
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
      if (req.request_type === HrRequestType.LEAVE) {
        statusCount[req.status]++;
        if (req.leave_type) {
          typeCount[req.leave_type]++;
        }
        if (req.total_days) {
          totalDays += req.total_days;
        }
      }
    });

    const statusData = Object.entries(statusCount)
      .filter(([_, value]) => value > 0)
      .map(([status, value]) => ({
        name: status === HrRequestStatus.PENDING ? 'Chờ duyệt' :
              status === HrRequestStatus.APPROVED ? 'Đã duyệt' :
              status === HrRequestStatus.REJECTED ? 'Từ chối' : 'Đã hủy',
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
        ? Number(((statusCount[HrRequestStatus.APPROVED] / allRequests.length) * 100).toFixed(1))
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
            <label className="block text-sm font-medium text-gray-700 mb-2">Loại yêu cầu</label>
            <select
              value={filterRequestType || ''}
              onChange={(e) => setFilterRequestType(e.target.value ? (e.target.value as HrRequestType) : undefined)}
              className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
            >
              <option value="">Tất cả</option>
              {Object.entries(HR_REQUEST_TYPE_LABELS).map(([value, label]) => (
                <option key={value} value={value}>{label}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Trạng thái</label>
            <select
              value={filterStatus || ''}
              onChange={(e) => setFilterStatus(e.target.value ? (e.target.value as HrRequestStatus) : undefined)}
              className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
            >
              <option value="">Tất cả</option>
              <option value={HrRequestStatus.PENDING}>Chờ duyệt</option>
              <option value={HrRequestStatus.APPROVED}>Đã duyệt</option>
              <option value={HrRequestStatus.REJECTED}>Từ chối</option>
              <option value={HrRequestStatus.CANCELLED}>Đã hủy</option>
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
                      Loại yêu cầu
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase">
                      Chi tiết
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
                        <p className="text-sm font-medium text-gray-900">
                          {HR_REQUEST_TYPE_LABELS[req.request_type]}
                        </p>
                        {req.request_type === HrRequestType.LEAVE && req.leave_type && (
                          <p className="text-xs text-gray-500 mt-1">
                            {LEAVE_TYPE_LABELS[req.leave_type]}
                          </p>
                        )}
                        {req.request_type === HrRequestType.LATE_EARLY && req.late_early_type && (
                          <p className="text-xs text-gray-500 mt-1">
                            {LATE_EARLY_TYPE_LABELS[req.late_early_type]}
                          </p>
                        )}
                      </td>
                      <td className="px-6 py-4">
                        {req.request_type === HrRequestType.LEAVE && (
                          <div className="text-sm text-gray-900">
                            <p>Từ: {formatDate(req.start_date || '')}</p>
                            <p>Đến: {formatDate(req.end_date || '')}</p>
                            <p className="font-medium mt-1">
                              {req.total_days ? `${req.total_days} ngày` : 'N/A'}
                            </p>
                          </div>
                        )}
                        {req.request_type === HrRequestType.OVERTIME && (
                          <div className="text-sm text-gray-900">
                            <p>Ngày: {formatDate(req.overtime_date || '')}</p>
                            <p>Giờ: {req.start_time} - {req.end_time}</p>
                            <p className="font-medium mt-1">
                              {req.overtime_hours ? `${req.overtime_hours} giờ` : 'N/A'}
                            </p>
                          </div>
                        )}
                        {req.request_type === HrRequestType.LATE_EARLY && (
                          <div className="text-sm text-gray-900">
                            <p>Ngày: {formatDate(req.late_early_date || '')}</p>
                            {req.actual_time && <p>Giờ thực tế: {req.actual_time}</p>}
                            {req.minutes && <p className="font-medium mt-1">{req.minutes} phút</p>}
                          </div>
                        )}
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
                          {req.status === HrRequestStatus.PENDING && (
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
                {modalMode === 'create' && 'Tạo yêu cầu'}
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
                <DetailField label="Loại yêu cầu" value={HR_REQUEST_TYPE_LABELS[selectedRequest.request_type]} />
                
                {selectedRequest.request_type === HrRequestType.LEAVE && (
                  <>
                    <DetailField label="Loại nghỉ phép" value={selectedRequest.leave_type ? LEAVE_TYPE_LABELS[selectedRequest.leave_type] : 'N/A'} />
                    <DetailField label="Từ ngày" value={formatDate(selectedRequest.start_date || '')} />
                    <DetailField label="Đến ngày" value={formatDate(selectedRequest.end_date || '')} />
                    <DetailField label="Số ngày" value={selectedRequest.total_days ? `${selectedRequest.total_days} ngày` : 'N/A'} />
                  </>
                )}
                
                {selectedRequest.request_type === HrRequestType.OVERTIME && (
                  <>
                    <DetailField label="Ngày làm thêm" value={formatDate(selectedRequest.overtime_date || '')} />
                    <DetailField label="Giờ bắt đầu" value={selectedRequest.start_time || 'N/A'} />
                    <DetailField label="Giờ kết thúc" value={selectedRequest.end_time || 'N/A'} />
                    <DetailField label="Số giờ" value={selectedRequest.overtime_hours ? `${selectedRequest.overtime_hours} giờ` : 'N/A'} />
                  </>
                )}
                
                {selectedRequest.request_type === HrRequestType.LATE_EARLY && (
                  <>
                    <DetailField label="Loại" value={selectedRequest.late_early_type ? LATE_EARLY_TYPE_LABELS[selectedRequest.late_early_type] : 'N/A'} />
                    <DetailField label="Ngày" value={formatDate(selectedRequest.late_early_date || '')} />
                    {selectedRequest.actual_time && (
                      <DetailField label="Giờ thực tế" value={selectedRequest.actual_time} />
                    )}
                    {selectedRequest.minutes && (
                      <DetailField label="Số phút" value={`${selectedRequest.minutes} phút`} />
                    )}
                  </>
                )}
                
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
                {/* Request Type Selection - Only when creating */}
                {modalMode === 'create' && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Loại yêu cầu <span className="text-red-500">*</span>
                    </label>
                    <select
                      value={selectedRequestType}
                      onChange={(e) => setSelectedRequestType(e.target.value as HrRequestType)}
                      required
                      disabled={formSubmitting}
                      className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none disabled:bg-gray-100"
                    >
                      {Object.entries(HR_REQUEST_TYPE_LABELS).map(([value, label]) => (
                        <option key={value} value={value}>
                          {label}
                        </option>
                      ))}
                    </select>
                  </div>
                )}

                {/* Leave Request Form */}
                {selectedRequestType === HrRequestType.LEAVE && (
                  <>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Loại nghỉ phép <span className="text-red-500">*</span>
                      </label>
                      <select
                        value={leaveFormData.leave_type}
                        onChange={(e) => handleLeaveFormChange('leave_type', e.target.value as LeaveType)}
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

                    {/* Leave Balance Info - Only for ANNUAL type */}
                    {leaveFormData.leave_type === LeaveType.ANNUAL && isEmployee && (
                      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                        {balanceLoading ? (
                          <div className="flex items-center gap-2 text-blue-700">
                            <Loader2 className="w-4 h-4 animate-spin" />
                            <span className="text-sm">Đang tải thông tin phép...</span>
                          </div>
                        ) : leaveBalance ? (
                          <div className="space-y-2">
                            <div className="flex items-center justify-between">
                              <span className="text-sm font-medium text-blue-900">Số ngày phép năm {leaveBalance.year}:</span>
                              <span className="text-sm font-bold text-blue-700">
                                {leaveBalance.remaining} / {leaveBalance.limit} ngày còn lại
                              </span>
                            </div>
                            <div className="text-xs text-blue-600">
                              Đã dùng: {leaveBalance.used} ngày
                            </div>
                            {(() => {
                              const totalDays = leaveFormData.start_date && leaveFormData.end_date 
                                ? calculateDays(leaveFormData.start_date, leaveFormData.end_date) 
                                : 0;
                              return totalDays > leaveBalance.remaining && (
                                <div className="mt-2 p-2 bg-red-50 border border-red-200 rounded text-sm text-red-700">
                                  ⚠️ Cảnh báo: Yêu cầu {totalDays} ngày vượt quá số ngày phép còn lại ({leaveBalance.remaining} ngày)!
                                </div>
                              );
                            })()}
                          </div>
                        ) : (
                          <div className="text-sm text-blue-700">
                            Không thể tải thông tin phép
                          </div>
                        )}
                      </div>
                    )}

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Từ ngày <span className="text-red-500">*</span>
                        </label>
                        <input
                          type="date"
                          value={leaveFormData.start_date}
                          onChange={(e) => handleLeaveFormChange('start_date', e.target.value)}
                          required
                          disabled={formSubmitting}
                          min={typeof window !== 'undefined' ? new Date(Date.now() + 86400000).toISOString().split('T')[0] : undefined}
                          className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none disabled:bg-gray-100"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Đến ngày <span className="text-red-500">*</span>
                        </label>
                        <input
                          type="date"
                          value={leaveFormData.end_date}
                          onChange={(e) => handleLeaveFormChange('end_date', e.target.value)}
                          required
                          disabled={formSubmitting}
                          min={leaveFormData.start_date || (typeof window !== 'undefined' ? new Date(Date.now() + 86400000).toISOString().split('T')[0] : undefined)}
                          className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none disabled:bg-gray-100"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Số ngày
                        {leaveFormData.start_date && leaveFormData.end_date && (
                          <span className="ml-2 text-xs text-gray-500 font-normal">
                            (Tự động tính: {calculateDays(leaveFormData.start_date, leaveFormData.end_date)} ngày)
                          </span>
                        )}
                      </label>
                      <p className="text-xs text-gray-500 mt-1">
                        Số ngày sẽ tự động tính khi bạn chọn từ ngày và đến ngày
                      </p>
                    </div>
                  </>
                )}

                {/* Overtime Request Form */}
                {selectedRequestType === HrRequestType.OVERTIME && (
                  <>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Ngày làm thêm <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="date"
                        value={overtimeFormData.date}
                        onChange={(e) => handleOvertimeFormChange('date', e.target.value)}
                        required
                        disabled={formSubmitting}
                        className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none disabled:bg-gray-100"
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Giờ bắt đầu <span className="text-red-500">*</span>
                        </label>
                        <input
                          type="time"
                          value={overtimeFormData.start_time}
                          onChange={(e) => handleOvertimeFormChange('start_time', e.target.value)}
                          required
                          disabled={formSubmitting}
                          className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none disabled:bg-gray-100"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Giờ kết thúc <span className="text-red-500">*</span>
                        </label>
                        <input
                          type="time"
                          value={overtimeFormData.end_time}
                          onChange={(e) => handleOvertimeFormChange('end_time', e.target.value)}
                          required
                          disabled={formSubmitting}
                          className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none disabled:bg-gray-100"
                        />
                      </div>
                    </div>
                  </>
                )}

                {/* Late/Early Request Form */}
                {selectedRequestType === HrRequestType.LATE_EARLY && (
                  <>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Loại <span className="text-red-500">*</span>
                      </label>
                      <select
                        value={lateEarlyFormData.type}
                        onChange={(e) => handleLateEarlyFormChange('type', e.target.value as LateEarlyType)}
                        required
                        disabled={formSubmitting}
                        className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none disabled:bg-gray-100"
                      >
                        {Object.entries(LATE_EARLY_TYPE_LABELS).map(([value, label]) => (
                          <option key={value} value={value}>
                            {label}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Ngày <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="date"
                        value={lateEarlyFormData.date}
                        onChange={(e) => handleLateEarlyFormChange('date', e.target.value)}
                        required
                        disabled={formSubmitting}
                        className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none disabled:bg-gray-100"
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Giờ thực tế
                        </label>
                        <input
                          type="time"
                          value={lateEarlyFormData.actual_time}
                          onChange={(e) => handleLateEarlyFormChange('actual_time', e.target.value)}
                          disabled={formSubmitting}
                          className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none disabled:bg-gray-100"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Số phút
                        </label>
                        <input
                          type="number"
                          value={lateEarlyFormData.minutes || ''}
                          onChange={(e) => handleLateEarlyFormChange('minutes', e.target.value ? parseInt(e.target.value) : undefined)}
                          disabled={formSubmitting}
                          min="0"
                          className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none disabled:bg-gray-100"
                        />
                      </div>
                    </div>
                  </>
                )}

                {/* Common Reason Field */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Lý do
                  </label>
                  <textarea
                    value={
                      selectedRequestType === HrRequestType.LEAVE ? leaveFormData.reason || '' :
                      selectedRequestType === HrRequestType.OVERTIME ? overtimeFormData.reason || '' :
                      lateEarlyFormData.reason || ''
                    }
                    onChange={(e) => {
                      if (selectedRequestType === HrRequestType.LEAVE) {
                        handleLeaveFormChange('reason', e.target.value);
                      } else if (selectedRequestType === HrRequestType.OVERTIME) {
                        handleOvertimeFormChange('reason', e.target.value);
                      } else {
                        handleLateEarlyFormChange('reason', e.target.value);
                      }
                    }}
                    placeholder="Nhập lý do..."
                    disabled={formSubmitting}
                    rows={3}
                    className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none disabled:bg-gray-100"
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
