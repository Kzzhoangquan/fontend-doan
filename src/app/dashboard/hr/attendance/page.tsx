// src/app/dashboard/hr/attendance/page.tsx
'use client';

import { useState, useEffect, useRef } from 'react';
import { useSearchParams } from 'next/navigation';
import { notification } from 'antd';
import { Calendar, Search, Plus, Edit, Trash2, Eye, Loader2, Clock, User, BarChart3, TrendingUp, X, CheckCircle, Camera, MapPin, Smartphone, Shield } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, LineChart, Line, PieChart, Pie, Cell } from 'recharts';
import { attendanceService, Attendance, CreateAttendanceDto, UpdateAttendanceDto } from '@/lib/api/services/attendance.service';
import { employeeService, Employee } from '@/lib/api/services/employee.service';
import { attendanceVerificationService, TodayStatus } from '@/lib/api/services/attendance-verification.service';
import AttendanceCalendar from '@/components/attendance/AttendanceCalendar';
import { useAuth } from '@/hooks/useAuth';
import { UserRole } from '@/lib/constants/roles';

export default function AttendancePage() {
  const searchParams = useSearchParams();
  const { hasRole, user } = useAuth();
  const [api, contextHolder] = notification.useNotification();

  // States
  const [attendances, setAttendances] = useState<Attendance[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [pageSize] = useState(10);
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [modalMode, setModalMode] = useState<'create' | 'edit' | 'view' | null>(null);
  const [selectedAttendance, setSelectedAttendance] = useState<Attendance | null>(null);
  const [formSubmitting, setFormSubmitting] = useState(false);
  const [formError, setFormError] = useState('');
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [optionsLoading, setOptionsLoading] = useState(false);
  const [filterEmployeeId, setFilterEmployeeId] = useState<number | undefined>(undefined);
  const [filterStatus, setFilterStatus] = useState<string>(''); // 'late', 'valid', 'missing', ''
  
  // Helper to get current month date range
  const getCurrentMonthRange = () => {
    if (typeof window === 'undefined') {
      return { start: '', end: '' };
    }
    const now = new Date();
    // Mùng 1 tháng hiện tại
    const firstDay = new Date(now.getFullYear(), now.getMonth(), 1);
    // Cuối tháng hiện tại (ngày cuối cùng)
    const lastDay = new Date(now.getFullYear(), now.getMonth() + 1, 0);
    
    // Format date as YYYY-MM-DD using local timezone (not UTC)
    const formatDateLocal = (date: Date): string => {
      const year = date.getFullYear();
      const month = String(date.getMonth() + 1).padStart(2, '0');
      const day = String(date.getDate()).padStart(2, '0');
      return `${year}-${month}-${day}`;
    };
    
    return {
      start: formatDateLocal(firstDay),
      end: formatDateLocal(lastDay),
    };
  };
  
  // Initialize with current month range (will be set properly in useEffect for SSR safety)
  const [filterStartDate, setFilterStartDate] = useState<string>('');
  const [filterEndDate, setFilterEndDate] = useState<string>('');
  const [formData, setFormData] = useState<CreateAttendanceDto>({
    employee_id: 0,
    date: '',
    check_in: '',
    check_out: '',
    late_minutes: 0,
    early_leave_minutes: 0,
    note: '',
  });
  const [allAttendances, setAllAttendances] = useState<Attendance[]>([]);
  const [statsLoading, setStatsLoading] = useState(false);
  const [currentWeekAttendances, setCurrentWeekAttendances] = useState<Attendance[]>([]);

  // Today status state (removed verification modal state)
  const [todayStatus, setTodayStatus] = useState<TodayStatus | null>(null);
  const [statusLoading, setStatusLoading] = useState(false);
  const [currentDateFormatted, setCurrentDateFormatted] = useState<string>('');
  const [isClient, setIsClient] = useState(false);
  const [viewMode, setViewMode] = useState<'table' | 'calendar'>('calendar');

  // Check if user is employee (can only see their own attendance)
  const isEmployee = hasRole(UserRole.EMPLOYEE) && !hasRole(UserRole.MANAGER) && !hasRole(UserRole.SUPER_ADMIN);
  const canManage = hasRole(UserRole.MANAGER) || hasRole(UserRole.SUPER_ADMIN);
  
  // Determine view mode from query param: 'all' (from HR menu) or 'my' (from Employee menu)
  const viewModeParam = searchParams.get('view');
  // If view param is explicitly set, use it; otherwise default based on query param presence
  const isViewAll = viewModeParam === 'all';
  const isViewMy = viewModeParam === 'my';

  // Set client-side only values after mount to avoid hydration mismatch
  useEffect(() => {
    setIsClient(true);
    setCurrentDateFormatted(
      new Date().toLocaleDateString('vi-VN', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })
    );
  }, []);

  // Fetch today's status for current user
  const fetchTodayStatus = async () => {
    if (!user?.id) return;
    
    setStatusLoading(true);
    try {
      const status = await attendanceVerificationService.getTodayStatus();
      if (status) {
        setTodayStatus(status);
      } else {
        // Set default status so UI doesn't break
        setTodayStatus({
          date: new Date().toISOString(),
          has_checked_in: false,
          has_checked_out: false,
          check_in_time: null,
          check_out_time: null,
          check_in_photo_url: null,
          check_out_photo_url: null,
          work_hours: null,
          late_minutes: null,
          early_leave_minutes: null,
          is_verified: null,
        });
      }
    } catch (err: any) {
      console.error('Error fetching today status:', err);
    } finally {
      setStatusLoading(false);
    }
  };

  // Fetch attendances với debounce
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      fetchAttendances();
    }, 300);

    return () => clearTimeout(timeoutId);
  }, [page, search, filterEmployeeId, filterStartDate, filterEndDate, filterStatus, isViewMy]);

  // Fetch all attendances for statistics - update when filters change
  useEffect(() => {
    fetchAllAttendancesForStats();
  }, [filterStartDate, filterEndDate, filterEmployeeId, isViewMy, user?.id]);

  // Fetch current week attendances for charts - update when employee filter changes
  useEffect(() => {
    fetchCurrentWeekAttendances();
  }, [filterEmployeeId, isViewMy, user?.id]);

  // Fetch today status on mount (only for "my" view)
  useEffect(() => {
    if (isViewMy && user?.id) {
      fetchTodayStatus();
    }
  }, [isViewMy, user?.id]);

  const fetchAllAttendancesForStats = async () => {
    setStatsLoading(true);
    try {
      const params: any = { pageSize: 1000 };
      // Use filterEmployeeId if set, otherwise use user.id for "my" view
      if (filterEmployeeId) {
        params.employeeId = filterEmployeeId;
      } else if (isViewMy && user?.id) {
        params.employeeId = user.id;
      }
      // If viewAll, don't set employeeId (show all employees)
      // Always use filter dates (defaults to current month start/end)
      if (filterStartDate) {
        params.startDate = filterStartDate;
      }
      if (filterEndDate) {
        params.endDate = filterEndDate;
      }
      const data = await attendanceService.getAll(params);
      setAllAttendances(data.data);
    } catch (err: any) {
      console.error('Error fetching all attendances for stats:', err);
    } finally {
      setStatsLoading(false);
    }
  };

  // Fetch current week attendance data for charts
  const fetchCurrentWeekAttendances = async () => {
    try {
      const params: any = { pageSize: 1000 };

      // Get current week date range
      const now = new Date();
      const currentDay = now.getDay(); // 0 = Sunday, 1 = Monday, ..., 6 = Saturday

      // Calculate Monday of current week
      const monday = new Date(now);
      const diffToMonday = currentDay === 0 ? -6 : 1 - currentDay;
      monday.setDate(now.getDate() + diffToMonday);

      // Calculate Sunday of current week
      const sunday = new Date(monday);
      sunday.setDate(monday.getDate() + 6);

      // Format dates as YYYY-MM-DD
      const formatDateLocal = (date: Date): string => {
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const day = String(date.getDate()).padStart(2, '0');
        return `${year}-${month}-${day}`;
      };

      params.startDate = formatDateLocal(monday);
      params.endDate = formatDateLocal(sunday);

      // Use filterEmployeeId if set, otherwise use user.id for "my" view
      if (filterEmployeeId) {
        params.employeeId = filterEmployeeId;
      } else if (isViewMy && user?.id) {
        params.employeeId = user.id;
      }

      const data = await attendanceService.getAll(params);
      setCurrentWeekAttendances(data.data);
    } catch (err: any) {
      console.error('Error fetching current week attendances:', err);
    }
  };

  useEffect(() => {
    // If viewing "my" (employee view), filter by current user
    if (isViewMy && user?.id) {
      setFilterEmployeeId(user.id);
    } else if (isViewAll) {
      // If viewing "all" (HR view), don't set filter by default (show all)
      setFilterEmployeeId(undefined);
    }
    if (canManage) {
      fetchEmployees();
    }
  }, [isViewMy, isViewAll, user?.id, canManage]);

  // Set default date only on client side (separate effect to avoid hydration issues)
  useEffect(() => {
    if (typeof window !== 'undefined' && !formData.date) {
      setFormData(prev => ({
        ...prev,
        date: new Date().toISOString().split('T')[0],
      }));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Track if default dates have been initialized
  const datesInitialized = useRef(false);

  // Set default date range to current month on client-side mount
  // From: mùng 1 tháng hiện tại, To: cuối tháng hiện tại
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const range = getCurrentMonthRange();
      // Set default values on first mount only
      if (!datesInitialized.current && range.start && range.end) {
        setFilterStartDate(range.start);
        setFilterEndDate(range.end);
        datesInitialized.current = true;
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const fetchAttendances = async () => {
    setLoading(true);
    setError('');

    try {
      const params: any = {
        page,
        pageSize,
      };

      if (filterEmployeeId) {
        params.employeeId = filterEmployeeId;
      }
      if (filterStartDate) {
        params.startDate = filterStartDate;
      }
      if (filterEndDate) {
        params.endDate = filterEndDate;
      }
      if (filterStatus) {
        params.status = filterStatus;
      }

      const data = await attendanceService.getAll(params);

      // Use data directly from API (already filtered and paginated)
      setAttendances(data.data);
      setTotal(data.total);
      setTotalPages(data.totalPages);
    } catch (err: any) {
      console.error('Error fetching attendances:', err);
      setError(err.response?.data?.message || 'Không thể tải danh sách chấm công');
    } finally {
      setLoading(false);
    }
  };

  const fetchEmployees = async () => {
    if (!canManage) return;
    setOptionsLoading(true);
    try {
      const data = await employeeService.getAll({ pageSize: 1000 });
      setEmployees(data.data);
    } catch (err: any) {
      console.error('Error loading employees:', err);
    } finally {
      setOptionsLoading(false);
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
    if (!confirm('Bạn có chắc muốn xóa bản ghi chấm công này?')) return;

    try {
      await attendanceService.delete(id);
      fetchAttendances();
      showNotification('success', 'Xóa bản ghi chấm công thành công!');
    } catch (err: any) {
      console.error('Error deleting attendance:', err);
      showNotification('error', 'Không thể xóa bản ghi chấm công', err.response?.data?.message);
    }
  };

  const openCreateModal = () => {
    setModalMode('create');
    setFormData({
      employee_id: isEmployee && user?.id ? user.id : 0,
      date: new Date().toISOString().split('T')[0],
      check_in: '',
      check_out: '',
      late_minutes: 0,
      early_leave_minutes: 0,
      note: '',
    });
    setFormError('');
  };

  const openEditModal = async (attendanceId: number) => {
    setFormError('');
    try {
      setFormSubmitting(true);
      const attendance = await attendanceService.getById(attendanceId);
      setSelectedAttendance(attendance);
      setFormData({
        employee_id: attendance.employee_id,
        date: attendance.date,
        check_in: attendance.check_in ? new Date(attendance.check_in).toISOString().slice(0, 16) : '',
        check_out: attendance.check_out ? new Date(attendance.check_out).toISOString().slice(0, 16) : '',
        late_minutes: attendance.late_minutes || 0,
        early_leave_minutes: attendance.early_leave_minutes || 0,
        note: attendance.note || '',
      });
      setModalMode('edit');
    } catch (err: any) {
      showNotification('error', 'Không thể tải chi tiết chấm công', err.response?.data?.message);
    } finally {
      setFormSubmitting(false);
    }
  };

  const openViewModal = async (attendanceId: number) => {
    setFormError('');
    try {
      setFormSubmitting(true);
      const attendance = await attendanceService.getById(attendanceId);
      setSelectedAttendance(attendance);
      setModalMode('view');
    } catch (err: any) {
      showNotification('error', 'Không thể tải chi tiết chấm công', err.response?.data?.message);
    } finally {
      setFormSubmitting(false);
    }
  };

  const closeModal = () => {
    setModalMode(null);
    setSelectedAttendance(null);
    setFormError('');
  };

  const handleFormChange = (field: keyof CreateAttendanceDto, value: string | number) => {
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

    const payload: CreateAttendanceDto | UpdateAttendanceDto = {
      ...formData,
      check_in: formData.check_in || undefined,
      check_out: formData.check_out || undefined,
      late_minutes: formData.late_minutes || 0,
      early_leave_minutes: formData.early_leave_minutes || 0,
    };

    try {
      if (modalMode === 'create') {
        await attendanceService.create(payload as CreateAttendanceDto);
        showNotification('success', 'Tạo bản ghi chấm công thành công');
      } else if (modalMode === 'edit' && selectedAttendance) {
        await attendanceService.update(selectedAttendance.id, payload as UpdateAttendanceDto);
        showNotification('success', 'Cập nhật bản ghi chấm công thành công');
      }
      closeModal();
      fetchAttendances();
    } catch (err: any) {
      const message = err.response?.data?.message || 'Có lỗi xảy ra, vui lòng thử lại';
      setFormError(Array.isArray(message) ? message.join(', ') : message);
    } finally {
      setFormSubmitting(false);
    }
  };


  const formatTime = (dateString: string | null | undefined) => {
    if (!dateString) return '--:--';

    // If not client-side yet, still try to format (will work on client after hydration)
    try {
      // Handle both ISO string and other date formats
      const date = new Date(dateString);
      if (isNaN(date.getTime())) {
        return '--:--';
      }
      
      // Use toLocaleTimeString if available (client-side), otherwise format manually
      if (typeof window !== 'undefined' && isClient) {
        return date.toLocaleTimeString('vi-VN', { 
          hour: '2-digit', 
          minute: '2-digit',
          hour12: false 
        });
      } else {
        // Fallback formatting for SSR or before client hydration
        const hours = date.getHours().toString().padStart(2, '0');
        const minutes = date.getMinutes().toString().padStart(2, '0');
        return `${hours}:${minutes}`;
      }
    } catch (error) {
      return '--:--';
    }
  };

  const formatDate = (dateString: string) => {
    if (!isClient) return dateString;
    try {
      return new Date(dateString).toLocaleDateString('vi-VN');
    } catch {
      return dateString;
    }
  };

  const calculateWorkHours = (checkIn: string | null, checkOut: string | null) => {
    if (!checkIn || !checkOut) return 'N/A';
    const start = new Date(checkIn);
    const end = new Date(checkOut);
    const diff = (end.getTime() - start.getTime()) / (1000 * 60 * 60);
    return `${diff.toFixed(2)} giờ`;
  };

  // Calculate attendance statistics based on filtered data
  const calculateAttendanceStats = () => {
    const dailyStats: Record<string, { total: number; late: number; hours: number; early: number; verified: number }> = {};
    let totalHours = 0;
    let totalLate = 0;
    let totalEarly = 0;
    let totalRecords = 0;
    let totalVerified = 0;
    let totalUnverified = 0;

    // Use filtered attendances for overall statistics (respecting date filters)
    allAttendances.forEach(att => {
      const date = att.date;
      if (!dailyStats[date]) {
        dailyStats[date] = { total: 0, late: 0, hours: 0, early: 0, verified: 0 };
      }
      dailyStats[date].total++;
      totalRecords++;

      if (att.late_minutes && att.late_minutes > 0) {
        dailyStats[date].late++;
        totalLate++;
      }

      if (att.early_leave_minutes && att.early_leave_minutes > 0) {
        dailyStats[date].early++;
        totalEarly++;
      }

      if (att.work_hours) {
        const hours = Number(att.work_hours);
        dailyStats[date].hours += hours;
        totalHours += hours;
      }

      // Check verification status
      if ((att as any).is_verified) {
        dailyStats[date].verified++;
        totalVerified++;
      } else {
        totalUnverified++;
      }
    });

    // Calculate chart data using current week attendances
    const getCurrentWeekDates = () => {
      const now = new Date();
      const currentDay = now.getDay(); // 0 = Sunday, 1 = Monday, ..., 6 = Saturday

      // Calculate Monday of current week (Monday = 1, Sunday = 0)
      const monday = new Date(now);
      const diffToMonday = currentDay === 0 ? -6 : 1 - currentDay; // If Sunday (0), go back 6 days, else go to Monday
      monday.setDate(now.getDate() + diffToMonday);

      const weekDates = [];
      for (let i = 0; i < 7; i++) {
        const date = new Date(monday);
        date.setDate(monday.getDate() + i);
        weekDates.push(date);
      }
      return weekDates;
    };

    // Create chart data from current week attendances
    const weekAttendancesStats: Record<string, { total: number; late: number; hours: number; early: number; verified: number }> = {};
    currentWeekAttendances.forEach(att => {
      const date = att.date;
      if (!weekAttendancesStats[date]) {
        weekAttendancesStats[date] = { total: 0, late: 0, hours: 0, early: 0, verified: 0 };
      }
      weekAttendancesStats[date].total++;

      if (att.late_minutes && att.late_minutes > 0) {
        weekAttendancesStats[date].late++;
      }

      if (att.early_leave_minutes && att.early_leave_minutes > 0) {
        weekAttendancesStats[date].early++;
      }

      if (att.work_hours) {
        const hours = Number(att.work_hours);
        weekAttendancesStats[date].hours += hours;
      }

      // Check verification status
      if ((att as any).is_verified) {
        weekAttendancesStats[date].verified++;
      }
    });

    // Create data for current week (7 days) for charts
    const currentWeekDates = getCurrentWeekDates();
    const dailyData = currentWeekDates.map(date => {
      const dateStr = date.toISOString().split('T')[0]; // YYYY-MM-DD format
      const stats = weekAttendancesStats[dateStr] || { total: 0, late: 0, hours: 0, early: 0, verified: 0 };

      return {
        date: isClient ? date.toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit' }) : dateStr,
        'Số ca': stats.total,
        'Đi muộn': stats.late,
        'Giờ làm': Number(stats.hours.toFixed(2)),
      };
    });

    // Calculate pie chart data for attendance status distribution
    const totalWeekRecords = currentWeekAttendances.length;
    const lateCount = currentWeekAttendances.filter(att => att.late_minutes && att.late_minutes > 0).length;
    const onTimeCount = currentWeekAttendances.filter(att =>
      (!att.late_minutes || att.late_minutes === 0) &&
      (!att.early_leave_minutes || att.early_leave_minutes === 0) &&
      att.check_in && att.check_out
    ).length;

    // Missing count: records that are expected but not present
    // For simplicity, we'll show records that don't have check-in as missing
    const missingCount = currentWeekAttendances.filter(att => !att.check_in).length;

    const totalForPercentage = lateCount + onTimeCount + missingCount;

    const pieData = [
      {
        name: 'Đi muộn',
        value: lateCount,
        percentage: totalForPercentage > 0 ? Number(((lateCount / totalForPercentage) * 100).toFixed(1)) : 0,
        color: '#ef4444'
      },
      {
        name: 'Đúng giờ',
        value: onTimeCount,
        percentage: totalForPercentage > 0 ? Number(((onTimeCount / totalForPercentage) * 100).toFixed(1)) : 0,
        color: '#10b981'
      },
      {
        name: 'Không điểm danh',
        value: missingCount,
        percentage: totalForPercentage > 0 ? Number(((missingCount / totalForPercentage) * 100).toFixed(1)) : 0,
        color: '#6b7280'
      }
    ];

    return {
      dailyData,
      pieData,
      totalHours: Number(totalHours.toFixed(2)),
      totalLate,
      totalEarly,
      totalRecords,
      totalVerified,
      totalUnverified,
      averageHours: totalRecords > 0 ? Number((totalHours / totalRecords).toFixed(2)) : 0,
      lateRate: totalRecords > 0 ? Number(((totalLate / totalRecords) * 100).toFixed(1)) : 0,
      earlyRate: totalRecords > 0 ? Number(((totalEarly / totalRecords) * 100).toFixed(1)) : 0,
      verifiedRate: totalRecords > 0 ? Number(((totalVerified / totalRecords) * 100).toFixed(1)) : 0,
    };
  };

  const attendanceStats = calculateAttendanceStats();

  return (
    <div className="space-y-6">
      {contextHolder}

      {/* Today's Status Card for Employees */}
      {isEmployee && (
        <div className="bg-gradient-to-r from-blue-600 to-indigo-600 rounded-xl shadow-lg p-6 text-white">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-white/20 rounded-lg">
                <Shield className="w-6 h-6" />
              </div>
              <div>
                <h2 className="text-xl font-bold">Chấm công hôm nay</h2>
                <p className="text-white/80 text-sm" suppressHydrationWarning>
                  {isClient ? currentDateFormatted : ''}
                </p>
              </div>
            </div>
          </div>

          {statusLoading ? (
            <div className="flex items-center justify-center py-4">
              <Loader2 className="w-6 h-6 animate-spin" />
            </div>
          ) : todayStatus ? (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
              <div className="bg-white/10 rounded-lg p-4">
                <div className="flex items-center gap-2 mb-1">
                  <Clock className="w-4 h-4" />
                  <span className="text-sm font-medium">Check-in</span>
                </div>
                <p className="text-2xl font-bold">
                  {todayStatus.check_in_time ? formatTime(todayStatus.check_in_time) : '--:--'}
                </p>
              </div>
              <div className="bg-white/10 rounded-lg p-4">
                <div className="flex items-center gap-2 mb-1">
                  <Clock className="w-4 h-4" />
                  <span className="text-sm font-medium">Check-out</span>
                </div>
                <p className="text-2xl font-bold">
                  {todayStatus.check_out_time ? formatTime(todayStatus.check_out_time) : '--:--'}
                </p>
              </div>
              <div className="bg-white/10 rounded-lg p-4">
                <div className="flex items-center gap-2 mb-1">
                  <BarChart3 className="w-4 h-4" />
                  <span className="text-sm font-medium">Giờ làm</span>
                </div>
                <p className="text-2xl font-bold">
                  {todayStatus.work_hours ? `${Number(todayStatus.work_hours).toFixed(1)}h` : '-'}
                </p>
              </div>
              <div className="bg-white/10 rounded-lg p-4">
                <div className="flex items-center gap-2 mb-1">
                  {todayStatus.is_verified ? (
                    <CheckCircle className="w-4 h-4 text-green-300" />
                  ) : (
                    <X className="w-4 h-4 text-yellow-300" />
                  )}
                  <span className="text-sm font-medium">Trạng thái</span>
                </div>
                <p className="text-lg font-bold">
                  {todayStatus.is_verified ? 'Đã xác thực' : todayStatus.has_checked_in ? 'Chờ xác thực' : 'Chưa chấm công'}
                </p>
              </div>
            </div>
          ) : null}

          {/* Verification Features (Display only - no actions) */}
          <div className="mt-4 flex items-center justify-center gap-6 text-sm text-white/70">
            <div className="flex items-center gap-2">
              <Camera className="w-4 h-4" />
              <span>Ảnh xác thực</span>
            </div>
            <div className="flex items-center gap-2">
              <Smartphone className="w-4 h-4" />
              <span>Thiết bị đăng ký</span>
            </div>
          </div>
        </div>
      )}

      {/* Statistics Section */}
      {!statsLoading && allAttendances.length > 0 && (
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-4 mb-6">
          <div className="bg-white rounded-xl shadow-sm p-6">
            <div className="flex items-center gap-2 mb-2">
              <Clock className="w-5 h-5 text-blue-600" />
              <h3 className="text-sm font-medium text-gray-600">Tổng giờ làm</h3>
            </div>
            <p className="text-2xl font-bold text-gray-900">{attendanceStats.totalHours}h</p>
            <p className="text-xs text-gray-500 mt-1">Trung bình: {attendanceStats.averageHours}h/ca</p>
          </div>
          <div className="bg-white rounded-xl shadow-sm p-6">
            <div className="flex items-center gap-2 mb-2">
              <CheckCircle className="w-5 h-5 text-green-600" />
              <h3 className="text-sm font-medium text-gray-600">Tổng số ca</h3>
            </div>
            <p className="text-2xl font-bold text-gray-900">{attendanceStats.totalRecords}</p>
            <p className="text-xs text-gray-500 mt-1">Đã chấm công</p>
          </div>
          <div className="bg-white rounded-xl shadow-sm p-6">
            <div className="flex items-center gap-2 mb-2">
              <X className="w-5 h-5 text-red-600" />
              <h3 className="text-sm font-medium text-gray-600">Đi muộn</h3>
            </div>
            <p className="text-2xl font-bold text-gray-900">{attendanceStats.totalLate}</p>
            <p className="text-xs text-gray-500 mt-1">Tỷ lệ: {attendanceStats.lateRate}%</p>
          </div>
          <div className="bg-white rounded-xl shadow-sm p-6">
            <div className="flex items-center gap-2 mb-2">
              <TrendingUp className="w-5 h-5 text-purple-600" />
              <h3 className="text-sm font-medium text-gray-600">Hiệu suất</h3>
            </div>
            <p className="text-2xl font-bold text-gray-900">{100 - attendanceStats.lateRate}%</p>
            <p className="text-xs text-gray-500 mt-1">Tỷ lệ đúng giờ</p>
          </div>
        </div>
      )}

      {/* Charts Section */}
      {!statsLoading && allAttendances.length > 0 && attendanceStats.dailyData.length > 0 && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
          <div className="bg-white rounded-xl shadow-sm p-6">
            <div className="flex items-center gap-2 mb-4">
              <BarChart3 className="w-5 h-5 text-blue-600" />
              <h3 className="text-lg font-semibold text-gray-900">Tỷ lệ chấm công tuần này</h3>
            </div>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={attendanceStats.pieData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, value, payload }) => `${name}: ${payload.percentage}%`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {attendanceStats.pieData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip formatter={(value, name) => [`${value} ca (${attendanceStats.pieData.find(d => d.name === name)?.percentage}%)`, name]} />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </div>

          <div className="bg-white rounded-xl shadow-sm p-6">
            <div className="flex items-center gap-2 mb-4">
              <TrendingUp className="w-5 h-5 text-green-600" />
              <h3 className="text-lg font-semibold text-gray-900">Giờ làm theo ngày</h3>
            </div>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={attendanceStats.dailyData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Line type="monotone" dataKey="Giờ làm" stroke="#10b981" strokeWidth={2} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}

      {/* Summary Section - Show when in table view */}
      {viewMode === 'table' && !statsLoading && (
        <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl shadow-sm p-6 mb-6 border border-blue-100">
          <div className="flex items-center gap-2 mb-4">
            <BarChart3 className="w-6 h-6 text-blue-600" />
            <h2 className="text-xl font-bold text-gray-900">Tổng hợp chấm công</h2>
            {filterStartDate && filterEndDate && (
              <span className="text-sm text-gray-600 ml-auto">
                {isClient && new Date(filterStartDate).toLocaleDateString('vi-VN')} - {isClient && new Date(filterEndDate).toLocaleDateString('vi-VN')}
              </span>
            )}
          </div>
          
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
            <div className="bg-white rounded-lg p-4 shadow-sm">
              <div className="flex items-center gap-2 mb-1">
                <CheckCircle className="w-4 h-4 text-green-600" />
                <span className="text-xs font-medium text-gray-600">Tổng số ca</span>
              </div>
              <p className="text-2xl font-bold text-gray-900">{attendanceStats.totalRecords}</p>
              <p className="text-xs text-gray-500 mt-1">Bản ghi</p>
            </div>
            
            <div className="bg-white rounded-lg p-4 shadow-sm">
              <div className="flex items-center gap-2 mb-1">
                <Clock className="w-4 h-4 text-blue-600" />
                <span className="text-xs font-medium text-gray-600">Tổng giờ làm</span>
              </div>
              <p className="text-2xl font-bold text-gray-900">{attendanceStats.totalHours}h</p>
              <p className="text-xs text-gray-500 mt-1">TB: {attendanceStats.averageHours}h/ca</p>
            </div>
            
            <div className="bg-white rounded-lg p-4 shadow-sm">
              <div className="flex items-center gap-2 mb-1">
                <X className="w-4 h-4 text-red-600" />
                <span className="text-xs font-medium text-gray-600">Đi muộn</span>
              </div>
              <p className="text-2xl font-bold text-gray-900">{attendanceStats.totalLate}</p>
              <p className="text-xs text-gray-500 mt-1">{attendanceStats.lateRate}%</p>
            </div>
            
            <div className="bg-white rounded-lg p-4 shadow-sm">
              <div className="flex items-center gap-2 mb-1">
                <X className="w-4 h-4 text-orange-600" />
                <span className="text-xs font-medium text-gray-600">Về sớm</span>
              </div>
              <p className="text-2xl font-bold text-gray-900">{attendanceStats.totalEarly || 0}</p>
              <p className="text-xs text-gray-500 mt-1">{attendanceStats.earlyRate || 0}%</p>
            </div>
            
            <div className="bg-white rounded-lg p-4 shadow-sm">
              <div className="flex items-center gap-2 mb-1">
                <Shield className="w-4 h-4 text-green-600" />
                <span className="text-xs font-medium text-gray-600">Đã xác thực</span>
              </div>
              <p className="text-2xl font-bold text-gray-900">{attendanceStats.totalVerified || 0}</p>
              <p className="text-xs text-gray-500 mt-1">{attendanceStats.verifiedRate || 0}%</p>
            </div>
            
            <div className="bg-white rounded-lg p-4 shadow-sm">
              <div className="flex items-center gap-2 mb-1">
                <TrendingUp className="w-4 h-4 text-purple-600" />
                <span className="text-xs font-medium text-gray-600">Hiệu suất</span>
              </div>
              <p className="text-2xl font-bold text-gray-900">{100 - attendanceStats.lateRate}%</p>
              <p className="text-xs text-gray-500 mt-1">Đúng giờ</p>
            </div>
          </div>
        </div>
      )}

      {/* Header */}
      <div className="bg-white rounded-xl shadow-sm p-6">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-blue-100 rounded-lg">
              <Calendar className="w-6 h-6 text-blue-600" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Quản lý chấm công</h1>
              <p className="text-sm text-gray-500">Tổng số: {total} bản ghi</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            {/* View Mode Toggle */}
            <div className="flex items-center gap-2 bg-gray-100 rounded-lg p-1">
              <button
                onClick={() => setViewMode('calendar')}
                className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                  viewMode === 'calendar'
                    ? 'bg-white text-blue-600 shadow-sm'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                Lịch
              </button>
              <button
                onClick={() => setViewMode('table')}
                className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                  viewMode === 'table'
                    ? 'bg-white text-blue-600 shadow-sm'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                Bảng
              </button>
            </div>
            {canManage && (
              <button
                onClick={openCreateModal}
                className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                <Plus className="w-5 h-5" />
                Thêm bản ghi
              </button>
            )}
          </div>
        </div>

        {/* Filters - Only show in table view */}
        {viewMode === 'table' && (
          <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
          {canManage && isViewAll && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Nhân viên</label>
              <select
                value={filterEmployeeId || ''}
                onChange={(e) => setFilterEmployeeId(e.target.value ? Number(e.target.value) : undefined)}
                className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
              >
                <option value="">Tất cả</option>
                {employees.map((emp) => (
                  <option key={emp.id} value={emp.id}>
                    {emp.full_name} ({emp.employee_code})
                  </option>
                ))}
              </select>
            </div>
          )}
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
              <label className="block text-sm font-medium text-gray-700 mb-2">Trạng thái</label>
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
              >
                <option value="">Tất cả</option>
                <option value="valid">Hợp lệ</option>
                <option value="late">Đi muộn</option>
                <option value="missing">Không chấm công</option>
              </select>
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
        )}
      </div>

      {/* Error Message */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-xl p-4">
          <p className="text-red-600 text-sm">{error}</p>
        </div>
      )}

      {/* Calendar View */}
      {viewMode === 'calendar' && (
        <AttendanceCalendar
          employeeId={isViewMy ? user?.id : filterEmployeeId}
          startDate={filterStartDate}
          endDate={filterEndDate}
        />
      )}

      {/* Table View */}
      {viewMode === 'table' && (
        <>
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
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase">
                      Nhân viên
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase">
                      Ngày
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase">
                      Check-in
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase">
                      Check-out
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase">
                      Giờ làm
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase">
                      Xác thực
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase">
                      Muộn/ Sớm
                    </th>
                    {canManage && (
                      <th className="px-6 py-4 text-right text-xs font-semibold text-gray-600 uppercase">
                        Thao tác
                      </th>
                    )}
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {attendances.map((att) => (
                    <tr key={att.id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          <User className="w-4 h-4 text-gray-400" />
                          <div>
                            <p className="font-medium text-gray-900">
                              {att.employee?.full_name || 'N/A'}
                            </p>
                            <p className="text-sm text-gray-500">
                              {att.employee?.employee_code || ''}
                            </p>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <p className="text-sm text-gray-900">{formatDate(att.date)}</p>
                      </td>
                      <td className="px-6 py-4">
                        <p className="text-sm text-gray-900">{formatTime(att.check_in)}</p>
                      </td>
                      <td className="px-6 py-4">
                        <p className="text-sm text-gray-900">{formatTime(att.check_out)}</p>
                      </td>
                      <td className="px-6 py-4">
                        <p className="text-sm text-gray-900">
                          {att.work_hours 
                            ? `${Number(att.work_hours).toFixed(2)}h` 
                            : calculateWorkHours(att.check_in, att.check_out)}
                        </p>
                      </td>
                      <td className="px-6 py-4">
                        {(att as any).is_verified ? (
                          <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-700">
                            <CheckCircle className="w-3 h-3" />
                            Đã xác thực
                          </span>
                        ) : (att as any).check_in_photo_url ? (
                          <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium bg-yellow-100 text-yellow-700">
                            <Camera className="w-3 h-3" />
                            Có ảnh
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-600">
                            Không xác thực
                          </span>
                        )}
                      </td>
                      <td className="px-6 py-4">
                        {att.late_minutes && att.late_minutes > 0 ? (
                          <p className="text-xs text-red-600">Muộn: {att.late_minutes} phút</p>
                        ) : (
                          <p className="text-xs text-green-600">Đúng giờ</p>
                        )}
                      </td>
                      {canManage && (
                        <td className="px-6 py-4">
                          <div className="flex items-center justify-end gap-2">
                            <button
                              onClick={() => openViewModal(att.id)}
                              className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                              title="Xem chi tiết"
                            >
                              <Eye className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => openEditModal(att.id)}
                              className="p-2 text-green-600 hover:bg-green-50 rounded-lg transition-colors"
                              title="Chỉnh sửa"
                            >
                              <Edit className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => handleDelete(att.id)}
                              className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                              title="Xóa"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </td>
                      )}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Empty State */}
            {attendances.length === 0 && !loading && (
              <div className="text-center py-12">
                <Calendar className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                <p className="text-gray-500 text-lg font-medium">Không tìm thấy bản ghi chấm công</p>
              </div>
            )}
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="bg-white rounded-xl shadow-sm p-4">
              <div className="flex items-center justify-between">
                <p className="text-sm text-gray-600">
                  Hiển thị <span className="font-semibold">{attendances.length}</span> / {total} bản ghi
                  (Trang {page} / {totalPages})
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
        </>
      )}

      {/* Modal */}
      {modalMode && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-200 flex items-center justify-between">
              <h2 className="text-xl font-bold text-gray-900">
                {modalMode === 'create' && 'Thêm bản ghi chấm công'}
                {modalMode === 'edit' && 'Chỉnh sửa bản ghi chấm công'}
                {modalMode === 'view' && 'Chi tiết chấm công'}
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

            {modalMode === 'view' && selectedAttendance ? (
              <div className="p-6 space-y-4">
                <DetailField label="Nhân viên" value={selectedAttendance.employee?.full_name || 'N/A'} />
                <DetailField label="Ngày" value={formatDate(selectedAttendance.date)} />
                <DetailField label="Check-in" value={formatTime(selectedAttendance.check_in)} />
                <DetailField label="Check-out" value={formatTime(selectedAttendance.check_out)} />
                <DetailField
                  label="Giờ làm"
                  value={selectedAttendance.work_hours ? `${Number(selectedAttendance.work_hours).toFixed(2)}h` : 'N/A'}
                />
                <DetailField
                  label="Muộn"
                  value={selectedAttendance.late_minutes ? `${selectedAttendance.late_minutes} phút` : '0 phút'}
                />
                <DetailField
                  label="Sớm"
                  value={selectedAttendance.early_leave_minutes ? `${selectedAttendance.early_leave_minutes} phút` : '0 phút'}
                />
                <DetailField label="Ghi chú" value={selectedAttendance.note || 'N/A'} />
                
                {/* Verification Info */}
                {(selectedAttendance as any).check_in_photo_url && (
                  <div>
                    <p className="text-xs font-semibold text-gray-500 uppercase mb-2">Ảnh Check-in</p>
                    <img 
                      src={(selectedAttendance as any).check_in_photo_url} 
                      alt="Check-in" 
                      className="w-32 h-32 object-cover rounded-lg"
                    />
                  </div>
                )}
                {(selectedAttendance as any).check_out_photo_url && (
                  <div>
                    <p className="text-xs font-semibold text-gray-500 uppercase mb-2">Ảnh Check-out</p>
                    <img 
                      src={(selectedAttendance as any).check_out_photo_url} 
                      alt="Check-out" 
                      className="w-32 h-32 object-cover rounded-lg"
                    />
                  </div>
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
                {canManage && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Nhân viên <span className="text-red-500">*</span>
                    </label>
                    <select
                      value={formData.employee_id}
                      onChange={(e) => handleFormChange('employee_id', Number(e.target.value))}
                      required
                      disabled={formSubmitting || isEmployee}
                      className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none disabled:bg-gray-100"
                    >
                      <option value={0}>Chọn nhân viên</option>
                      {employees.map((emp) => (
                        <option key={emp.id} value={emp.id}>
                          {emp.full_name} ({emp.employee_code})
                        </option>
                      ))}
                    </select>
                  </div>
                )}

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Ngày <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="date"
                    value={formData.date}
                    onChange={(e) => handleFormChange('date', e.target.value)}
                    required
                    disabled={formSubmitting}
                    className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none disabled:bg-gray-100"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Check-in</label>
                    <input
                      type="datetime-local"
                      value={formData.check_in}
                      onChange={(e) => handleFormChange('check_in', e.target.value)}
                      disabled={formSubmitting}
                      className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none disabled:bg-gray-100"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Check-out</label>
                    <input
                      type="datetime-local"
                      value={formData.check_out}
                      onChange={(e) => handleFormChange('check_out', e.target.value)}
                      disabled={formSubmitting}
                      className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none disabled:bg-gray-100"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Muộn (phút)</label>
                    <input
                      type="number"
                      min="0"
                      value={formData.late_minutes}
                      onChange={(e) => handleFormChange('late_minutes', Number(e.target.value))}
                      disabled={formSubmitting}
                      className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none disabled:bg-gray-100"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Sớm (phút)</label>
                    <input
                      type="number"
                      min="0"
                      value={formData.early_leave_minutes}
                      onChange={(e) => handleFormChange('early_leave_minutes', Number(e.target.value))}
                      disabled={formSubmitting}
                      className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none disabled:bg-gray-100"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Ghi chú</label>
                  <textarea
                    value={formData.note}
                    onChange={(e) => handleFormChange('note', e.target.value)}
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
                    {modalMode === 'create' ? 'Tạo bản ghi' : 'Lưu thay đổi'}
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

function DetailField({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="text-xs font-semibold text-gray-500 uppercase">{label}</p>
      <p className="mt-1 text-gray-900">{value}</p>
    </div>
  );
}
