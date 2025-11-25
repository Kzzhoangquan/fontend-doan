// src/app/dashboard/hr/employees/page.tsx
'use client';

import { useState, useEffect } from 'react';
import { notification } from 'antd';
import { 
  Users, 
  Search, 
  Plus, 
  Edit, 
  Trash2, 
  Eye, 
  Mail, 
  Phone, 
  Briefcase, 
  Loader2,
  X,
  Shield,
  BarChart3,
  PieChart
} from 'lucide-react';
import { PieChart as RechartsPieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { employeeService, Employee } from '@/lib/api/services/employee.service';
import { departmentService, Department } from '@/lib/api/services/department.service';
import { positionService, Position } from '@/lib/api/services/position.service';
import { roleService, Role } from '@/lib/api/services/role.service';
import { useAuth } from '@/hooks/useAuth';
import { UserRole } from '@/lib/constants/roles';

export default function EmployeesPage() {
  const [notificationApi, contextHolder] = notification.useNotification();
  const { hasRole } = useAuth();
  
  // States
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [pageSize] = useState(10);
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [modalMode, setModalMode] = useState<'create' | 'edit' | 'view' | null>(null);
  const [selectedEmployee, setSelectedEmployee] = useState<Employee | null>(null);
  const [formSubmitting, setFormSubmitting] = useState(false);
  const [formError, setFormError] = useState('');
  const [departments, setDepartments] = useState<Department[]>([]);
  const [positions, setPositions] = useState<Position[]>([]);
  const [roles, setRoles] = useState<Role[]>([]);
  const [optionsLoading, setOptionsLoading] = useState(false);
  const [assignRolesModalOpen, setAssignRolesModalOpen] = useState(false);
  const [assigningRoles, setAssigningRoles] = useState(false);
  const [selectedRoleIds, setSelectedRoleIds] = useState<number[]>([]);
  const [formData, setFormData] = useState<Partial<Employee>>({
    full_name: '',
    username: '',
    email: '',
    employee_code: '',
    phone: '',
    department: '',
    position: '',
    status: 'ACTIVE',
    password: '',
  });

  // Fetch employees với debounce
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      fetchEmployees();
    }, 300); // Debounce 300ms

    return () => clearTimeout(timeoutId);
  }, [page, search]);

  useEffect(() => {
    fetchReferenceOptions();
  }, []);

  const [allEmployees, setAllEmployees] = useState<Employee[]>([]);
  const [statsLoading, setStatsLoading] = useState(false);

  const fetchEmployees = async () => {
    setLoading(true);
    setError('');
    
    try {
      const data = await employeeService.getAll({
        page,
        pageSize,
        search: search.trim(),
      });
      
      setEmployees(data.data);
      setTotal(data.total);
      setTotalPages(data.totalPages);
    } catch (err: any) {
      console.error('Error fetching employees:', err);
      setError(err.response?.data?.message || 'Không thể tải danh sách nhân viên');
    } finally {
      setLoading(false);
    }
  };

  const fetchAllEmployeesForStats = async () => {
    setStatsLoading(true);
    try {
      const data = await employeeService.getAll({ pageSize: 1000 });
      setAllEmployees(data.data);
    } catch (err: any) {
      console.error('Error fetching all employees for stats:', err);
    } finally {
      setStatsLoading(false);
    }
  };

  useEffect(() => {
    fetchAllEmployeesForStats();
  }, []);

  const fetchReferenceOptions = async () => {
    setOptionsLoading(true);
    try {
      const [deptRes, posRes, rolesRes] = await Promise.all([
        departmentService.getAll({ pageSize: 100 }),
        positionService.getAll({ pageSize: 100 }),
        roleService.getAll({ pageSize: 100 }),
      ]);
      setDepartments(deptRes.data);
      setPositions(posRes.data);
      setRoles(rolesRes.data);
    } catch (err: any) {
      console.error('Error loading reference data:', err);
      showNotification('error', 'Không thể tải danh sách phòng ban / vị trí / quyền', err.response?.data?.message);
    } finally {
      setOptionsLoading(false);
    }
  };

  const handleSearch = (value: string) => {
    setSearch(value);
    setPage(1); // Reset về trang 1 khi search
  };

  const showNotification = (
    type: 'success' | 'error' | 'info' | 'warning',
    message: string,
    description?: string,
  ) => {
    notificationApi[type]({
      message,
      description,
      placement: 'topRight',
    });
  };

  const handleDelete = async (id: number, name: string) => {
    if (!confirm(`Bạn có chắc muốn xóa nhân viên "${name}"?`)) return;

    try {
      await employeeService.delete(id);
      fetchEmployees(); // Reload list
      showNotification('success', 'Xóa nhân viên thành công!');
    } catch (err: any) {
      console.error('Error deleting employee:', err);
      showNotification('error', 'Không thể xóa nhân viên', err.response?.data?.message);
    }
  };

  const getStatusBadge = (status: string) => {
    const statusMap: Record<string, { bg: string; text: string; label: string }> = {
      ACTIVE: { bg: 'bg-green-100', text: 'text-green-700', label: 'Hoạt động' },
      INACTIVE: { bg: 'bg-gray-100', text: 'text-gray-700', label: 'Ngừng' },
      SUSPENDED: { bg: 'bg-red-100', text: 'text-red-700', label: 'Tạm khóa' },
    };
    const style = statusMap[status] || statusMap.ACTIVE;
    return (
      <span className={`px-2 py-1 rounded-full text-xs font-medium ${style.bg} ${style.text}`}>
        {style.label}
      </span>
    );
  };

  // Calculate statistics
  const calculateStats = () => {
    const statusCount: Record<string, number> = {};
    const departmentCount: Record<string, number> = {};
    const roleCount: Record<string, number> = {};

    allEmployees.forEach(emp => {
      // Status stats
      statusCount[emp.status] = (statusCount[emp.status] || 0) + 1;
      
      // Department stats
      const dept = emp.department || 'Chưa phân công';
      departmentCount[dept] = (departmentCount[dept] || 0) + 1;
      
      // Role stats
      if (emp.roles && emp.roles.length > 0) {
        emp.roles.forEach(role => {
          roleCount[role.name] = (roleCount[role.name] || 0) + 1;
        });
      } else {
        roleCount['Chưa có quyền'] = (roleCount['Chưa có quyền'] || 0) + 1;
      }
    });

    const statusData = Object.entries(statusCount).map(([name, value]) => ({
      name: name === 'ACTIVE' ? 'Hoạt động' : name === 'INACTIVE' ? 'Ngừng' : 'Tạm khóa',
      value,
    }));

    const departmentData = Object.entries(departmentCount)
      .map(([name, value]) => ({ name, value }))
      .sort((a, b) => b.value - a.value)
      .slice(0, 10); // Top 10 departments

    const roleData = Object.entries(roleCount)
      .map(([name, value]) => ({ name, value }))
      .sort((a, b) => b.value - a.value);

    return { statusData, departmentData, roleData };
  };

  const { statusData, departmentData, roleData } = calculateStats();

  const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899', '#06b6d4'];

  // Check permission
  const canManage = hasRole(UserRole.MANAGER) || hasRole(UserRole.SUPER_ADMIN);
  const canAssignRoles = hasRole(UserRole.SUPER_ADMIN);

  const openCreateModal = () => {
    setModalMode('create');
    setFormData({
      full_name: '',
      username: '',
      email: '',
      employee_code: '',
      phone: '',
      department: '',
      position: '',
      status: 'ACTIVE',
      password: '',
    });
    setFormError('');
    // Đảm bảo load lại danh sách departments và positions khi mở modal
    if (departments.length === 0 || positions.length === 0) {
      fetchReferenceOptions();
    }
  };

  const openEditModal = async (employeeId: number) => {
    setFormError('');
    try {
      setFormSubmitting(true);
      const employee = await employeeService.getById(employeeId);
      setSelectedEmployee(employee);
      setFormData({
        full_name: employee.full_name,
        username: employee.username,
        email: employee.email,
        employee_code: employee.employee_code,
        phone: employee.phone || '',
        department: employee.department || '',
        position: employee.position || '',
        status: employee.status,
        password: '',
      });
      setModalMode('edit');
    } catch (err: any) {
      showNotification('error', 'Không thể tải chi tiết nhân viên', err.response?.data?.message);
    } finally {
      setFormSubmitting(false);
    }
  };

  const openViewModal = async (employeeId: number) => {
    setFormError('');
    try {
      setFormSubmitting(true);
      const employee = await employeeService.getById(employeeId);
      setSelectedEmployee(employee);
      setModalMode('view');
    } catch (err: any) {
      showNotification('error', 'Không thể tải chi tiết nhân viên', err.response?.data?.message);
    } finally {
      setFormSubmitting(false);
    }
  };

  const closeModal = () => {
    setModalMode(null);
    setSelectedEmployee(null);
    setFormError('');
  };

  const openAssignRolesModal = async (employeeId: number) => {
    try {
      setAssigningRoles(true);
      const employee = await employeeService.getById(employeeId);
      setSelectedEmployee(employee);
      setSelectedRoleIds(employee.roles?.map(r => r.id) || []);
      setAssignRolesModalOpen(true);
    } catch (err: any) {
      showNotification('error', 'Không thể tải thông tin nhân viên', err.response?.data?.message);
    } finally {
      setAssigningRoles(false);
    }
  };

  const closeAssignRolesModal = () => {
    setAssignRolesModalOpen(false);
    setSelectedEmployee(null);
    setSelectedRoleIds([]);
  };

  const handleRoleToggle = (roleId: number) => {
    setSelectedRoleIds(prev => 
      prev.includes(roleId)
        ? prev.filter(id => id !== roleId)
        : [...prev, roleId]
    );
  };

  const handleAssignRoles = async () => {
    if (!selectedEmployee) return;

    try {
      setAssigningRoles(true);
      await employeeService.assignRoles(selectedEmployee.id, selectedRoleIds);
      showNotification('success', 'Gán quyền thành công!');
      closeAssignRolesModal();
      fetchEmployees();
    } catch (err: any) {
      showNotification('error', 'Không thể gán quyền', err.response?.data?.message);
    } finally {
      setAssigningRoles(false);
    }
  };

  const handleFormChange = (field: keyof Employee, value: string) => {
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
    const payload: Partial<Employee> = {
      ...formData,
      status: formData.status || 'ACTIVE',
    };

    try {
      if (modalMode === 'create') {
        await employeeService.create(payload);
        showNotification('success', 'Tạo nhân viên thành công');
      } else if (modalMode === 'edit' && selectedEmployee) {
        await employeeService.update(selectedEmployee.id, payload);
        showNotification('success', 'Cập nhật nhân viên thành công');
      }
      closeModal();
      fetchEmployees();
    } catch (err: any) {
      const message = err.response?.data?.message || 'Có lỗi xảy ra, vui lòng thử lại';
      setFormError(Array.isArray(message) ? message.join(', ') : message);
      showNotification('error', 'Thao tác thất bại', Array.isArray(message) ? message.join(', ') : message);
    } finally {
      setFormSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      {contextHolder}
      {/* Statistics Section */}
      {!statsLoading && allEmployees.length > 0 && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Status Distribution */}
          <div className="bg-white rounded-xl shadow-sm p-6">
            <div className="flex items-center gap-2 mb-4">
              <PieChart className="w-5 h-5 text-blue-600" />
              <h3 className="text-lg font-semibold text-gray-900">Phân bố theo trạng thái</h3>
            </div>
            <ResponsiveContainer width="100%" height={250}>
              <RechartsPieChart>
                <Pie
                  data={statusData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {statusData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </RechartsPieChart>
            </ResponsiveContainer>
          </div>

          {/* Department Distribution */}
          <div className="bg-white rounded-xl shadow-sm p-6">
            <div className="flex items-center gap-2 mb-4">
              <BarChart3 className="w-5 h-5 text-purple-600" />
              <h3 className="text-lg font-semibold text-gray-900">Phân bố theo phòng ban</h3>
            </div>
            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={departmentData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis 
                  dataKey="name" 
                  angle={-45}
                  textAnchor="end"
                  height={80}
                  fontSize={12}
                />
                <YAxis />
                <Tooltip />
                <Bar dataKey="value" fill="#8b5cf6" />
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* Role Distribution */}
          <div className="bg-white rounded-xl shadow-sm p-6">
            <div className="flex items-center gap-2 mb-4">
              <Users className="w-5 h-5 text-green-600" />
              <h3 className="text-lg font-semibold text-gray-900">Phân bố theo vai trò</h3>
            </div>
            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={roleData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis 
                  dataKey="name" 
                  angle={-45}
                  textAnchor="end"
                  height={80}
                  fontSize={12}
                />
                <YAxis />
                <Tooltip />
                <Bar dataKey="value" fill="#10b981" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}

      {/* Header */}
      <div className="bg-white rounded-xl shadow-sm p-6">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-blue-100 rounded-lg">
              <Users className="w-6 h-6 text-blue-600" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Quản lý nhân viên</h1>
              <p className="text-sm text-gray-500">Tổng số: {total} nhân viên</p>
            </div>
          </div>
          {canManage && (
            <button
              onClick={openCreateModal}
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              <Plus className="w-5 h-5" />
              Thêm nhân viên
            </button>
          )}
        </div>

        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input
            type="text"
            placeholder="Tìm kiếm theo tên, email, mã nhân viên..."
            value={search}
            onChange={(e) => handleSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
          />
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
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase">
                      Nhân viên
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase">
                      Mã NV
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase">
                      Liên hệ
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase">
                      Phòng ban
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase">
                      Vai trò
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase">
                      Trạng thái
                    </th>
                    {canManage && (
                      <th className="px-6 py-4 text-right text-xs font-semibold text-gray-600 uppercase">
                        Thao tác
                      </th>
                    )}
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {employees.map((emp) => (
                    <tr key={emp.id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white font-semibold">
                            {emp.full_name.charAt(0).toUpperCase()}
                          </div>
                          <div>
                            <p className="font-medium text-gray-900">{emp.full_name}</p>
                            <p className="text-sm text-gray-500">@{emp.username}</p>
                          </div>
                        </div>
                      </td>

                      <td className="px-6 py-4">
                        <span className="font-mono text-sm text-gray-700">
                          {emp.employee_code}
                        </span>
                      </td>

                      <td className="px-6 py-4">
                        <div className="space-y-1">
                          <div className="flex items-center gap-2 text-sm text-gray-600">
                            <Mail className="w-4 h-4" />
                            {emp.email}
                          </div>
                          {emp.phone && (
                            <div className="flex items-center gap-2 text-sm text-gray-600">
                              <Phone className="w-4 h-4" />
                              {emp.phone}
                            </div>
                          )}
                        </div>
                      </td>

                      <td className="px-6 py-4">
                        <div className="space-y-1">
                          <p className="text-sm font-medium text-gray-900">
                            {emp.department || 'N/A'}
                          </p>
                          <p className="text-xs text-gray-500 flex items-center gap-1">
                            <Briefcase className="w-3 h-3" />
                            {emp.position || 'N/A'}
                          </p>
                        </div>
                      </td>

                      <td className="px-6 py-4">
                        <div className="flex flex-wrap gap-1">
                            {emp.roles && emp.roles.length > 0 ? (
                            emp.roles.map((role) => (
                              <span
                                key={role.id}
                                className="px-2 py-1 bg-purple-100 text-purple-700 rounded text-xs font-medium"
                              >
                                {role.name}
                              </span>
                            ))
                          ) : (
                            <span className="text-sm text-gray-400">Chưa có</span>
                          )}
                        </div>
                      </td>

                      <td className="px-6 py-4">
                        {getStatusBadge(emp.status)}
                      </td>

                      {canManage && (
                        <td className="px-6 py-4">
                          <div className="flex items-center justify-end gap-2">
                            <button
                              onClick={() => openViewModal(emp.id)}
                              className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                            >
                              <Eye className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => openEditModal(emp.id)}
                              className="p-2 text-green-600 hover:bg-green-50 rounded-lg transition-colors"
                              title="Chỉnh sửa"
                            >
                              <Edit className="w-4 h-4" />
                            </button>
                            {canAssignRoles && (
                              <button
                                onClick={() => openAssignRolesModal(emp.id)}
                                className="p-2 text-purple-600 hover:bg-purple-50 rounded-lg transition-colors"
                                title="Gán quyền"
                              >
                                <Shield className="w-4 h-4" />
                              </button>
                            )}
                            <button
                              onClick={() => handleDelete(emp.id, emp.full_name)}
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
            {employees.length === 0 && !loading && (
              <div className="text-center py-12">
                <Users className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                <p className="text-gray-500 text-lg font-medium">Không tìm thấy nhân viên</p>
                <p className="text-gray-400 text-sm mt-1">
                  {search ? 'Thử thay đổi từ khóa tìm kiếm' : 'Thêm nhân viên mới để bắt đầu'}
                </p>
              </div>
            )}
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="bg-white rounded-xl shadow-sm p-4">
              <div className="flex items-center justify-between">
                <p className="text-sm text-gray-600">
                  Hiển thị <span className="font-semibold">{employees.length}</span> / {total} nhân viên
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
      {!!modalMode && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4">
          <div className="w-full max-w-2xl bg-white rounded-2xl shadow-2xl">
            <div className="flex items-center justify-between border-b px-6 py-4">
              <div>
                <h2 className="text-xl font-semibold text-gray-900">
                  {modalMode === 'create' && 'Thêm nhân viên'}
                  {modalMode === 'edit' && 'Cập nhật nhân viên'}
                  {modalMode === 'view' && 'Chi tiết nhân viên'}
                </h2>
                {modalMode !== 'view' && (
                  <p className="text-sm text-gray-500 mt-1">
                    Nhập đầy đủ thông tin theo mẫu bên dưới
                  </p>
                )}
              </div>
              <button
                onClick={closeModal}
                className="p-2 rounded-full hover:bg-gray-100 transition-colors"
              >
                <X className="w-5 h-5 text-gray-500" />
              </button>
            </div>

            {modalMode === 'view' && selectedEmployee ? (
              <div className="p-6 space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <DetailField label="Họ tên" value={selectedEmployee.full_name} />
                  <DetailField label="Tên đăng nhập" value={selectedEmployee.username} />
                  <DetailField label="Email" value={selectedEmployee.email} />
                  <DetailField label="Mã nhân viên" value={selectedEmployee.employee_code} />
                  <DetailField label="Số điện thoại" value={selectedEmployee.phone || '—'} />
                  <DetailField label="Phòng ban" value={selectedEmployee.department || '—'} />
                  <DetailField label="Vị trí" value={selectedEmployee.position || '—'} />
                  <DetailField label="Trạng thái" value={selectedEmployee.status} />
                </div>

                <div>
                  <p className="text-sm font-semibold text-gray-700 mb-2">Vai trò</p>
                  {selectedEmployee.roles && selectedEmployee.roles.length > 0 ? (
                    <div className="flex flex-wrap gap-2">
                      {selectedEmployee.roles.map(role => (
                        <span
                          key={role.id}
                          className="px-3 py-1 bg-purple-100 text-purple-700 rounded-full text-xs font-medium"
                        >
                          {role.name}
                        </span>
                      ))}
                    </div>
                  ) : (
                    <p className="text-sm text-gray-500">Chưa có vai trò</p>
                  )}
                </div>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="p-6 space-y-4">
                {formError && (
                  <div className="bg-red-50 border border-red-200 text-red-600 text-sm rounded-lg px-4 py-2">
                    {formError}
                  </div>
                )}

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <InputField
                    label="Họ và tên"
                    required
                    value={formData.full_name || ''}
                    onChange={(value) => handleFormChange('full_name', value)}
                  />
                  <InputField
                    label="Tên đăng nhập"
                    required
                    value={formData.username || ''}
                    onChange={(value) => handleFormChange('username', value)}
                    disabled={modalMode === 'edit'}
                  />
                  <InputField
                    label="Mật khẩu"
                    type="password"
                    value={formData.password || ''}
                    onChange={(value) => handleFormChange('password', value)}
                    placeholder={modalMode === 'edit' ? 'Để trống nếu không đổi' : 'Nhập mật khẩu (tùy chọn)'}
                  />
                  <InputField
                    label="Email"
                    type="email"
                    required
                    value={formData.email || ''}
                    onChange={(value) => handleFormChange('email', value)}
                  />
                  <InputField
                    label="Mã nhân viên"
                    required
                    value={formData.employee_code || ''}
                    onChange={(value) => handleFormChange('employee_code', value)}
                  />
                  <InputField
                    label="Số điện thoại"
                    value={formData.phone || ''}
                    onChange={(value) => handleFormChange('phone', value)}
                  />
                  <SelectField
                    label="Phòng ban"
                    value={formData.department || ''}
                    onChange={(value) => handleFormChange('department', value)}
                    options={departments.map((dept) => ({
                      label: dept.name,
                      value: dept.name,
                    }))}
                    placeholder={optionsLoading ? 'Đang tải danh sách...' : 'Chọn phòng ban'}
                    loading={optionsLoading}
                  />
                  <SelectField
                    label="Vị trí"
                    value={formData.position || ''}
                    onChange={(value) => handleFormChange('position', value)}
                    options={positions.map((pos) => ({
                      label: pos.title,
                      value: pos.title,
                    }))}
                    placeholder={optionsLoading ? 'Đang tải danh sách...' : 'Chọn vị trí'}
                    loading={optionsLoading}
                  />
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Trạng thái</label>
                    <select
                      value={formData.status || 'ACTIVE'}
                      onChange={(e) => handleFormChange('status', e.target.value)}
                      className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                    >
                      <option value="ACTIVE">Hoạt động</option>
                      <option value="INACTIVE">Ngừng</option>
                      <option value="SUSPENDED">Tạm khóa</option>
                    </select>
                  </div>
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
                    {modalMode === 'create' ? 'Tạo nhân viên' : 'Lưu thay đổi'}
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}

      {/* Modal Gán Quyền */}
      {assignRolesModalOpen && selectedEmployee && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-200 flex items-center justify-between">
              <div>
                <h2 className="text-xl font-bold text-gray-900">Gán quyền cho nhân viên</h2>
                <p className="text-sm text-gray-500 mt-1">{selectedEmployee.full_name}</p>
              </div>
              <button
                onClick={closeAssignRolesModal}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <X className="w-5 h-5 text-gray-500" />
              </button>
            </div>

            <div className="p-6">
              {assigningRoles && !selectedEmployee ? (
                <div className="flex items-center justify-center py-8">
                  <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
                </div>
              ) : (
                <div className="space-y-4">
                  <p className="text-sm text-gray-600 mb-4">
                    Chọn các quyền bạn muốn gán cho nhân viên này:
                  </p>
                  
                  {roles.length === 0 ? (
                    <div className="text-center py-8 text-gray-500">
                      Không có quyền nào trong hệ thống
                    </div>
                  ) : (
                    <div className="space-y-2 max-h-96 overflow-y-auto">
                      {roles.map((role) => (
                        <label
                          key={role.id}
                          className="flex items-start gap-3 p-4 border border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer transition-colors"
                        >
                          <input
                            type="checkbox"
                            checked={selectedRoleIds.includes(role.id)}
                            onChange={() => handleRoleToggle(role.id)}
                            className="mt-1 w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                          />
                          <div className="flex-1">
                            <div className="flex items-center gap-2">
                              <p className="font-medium text-gray-900">{role.name}</p>
                              <span className="text-xs text-gray-500">({role.code})</span>
                            </div>
                            {role.description && (
                              <p className="text-sm text-gray-500 mt-1">{role.description}</p>
                            )}
                          </div>
                        </label>
                      ))}
                    </div>
                  )}

                  <div className="flex items-center justify-end gap-3 pt-4 border-t">
                    <button
                      type="button"
                      onClick={closeAssignRolesModal}
                      className="px-4 py-2 rounded-lg border border-gray-300 text-gray-700 hover:bg-gray-50 transition-colors"
                    >
                      Hủy
                    </button>
                    <button
                      onClick={handleAssignRoles}
                      disabled={assigningRoles}
                      className="px-6 py-2 rounded-lg bg-blue-600 text-white font-medium hover:bg-blue-700 transition-colors disabled:opacity-60 flex items-center gap-2"
                    >
                      {assigningRoles && <Loader2 className="w-4 h-4 animate-spin" />}
                      Lưu quyền
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function InputField({
  label,
  value,
  onChange,
  type = 'text',
  required,
  disabled,
  placeholder,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  type?: string;
  required?: boolean;
  disabled?: boolean;
  placeholder?: string;
}) {
  return (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-2">
        {label} {required && <span className="text-red-500">*</span>}
      </label>
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        required={required}
        disabled={disabled}
        placeholder={placeholder}
        className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none disabled:bg-gray-100"
      />
    </div>
  );
}

function SelectField({
  label,
  value,
  onChange,
  options,
  placeholder,
  required,
  loading,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  options: Array<{ label: string; value: string }>;
  placeholder?: string;
  required?: boolean;
  loading?: boolean;
}) {
  return (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-2">
        {label} {required && <span className="text-red-500">*</span>}
      </label>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        required={required}
        disabled={loading}
        className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none disabled:bg-gray-100"
      >
        <option value="">{placeholder || 'Chọn mục'}</option>
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
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