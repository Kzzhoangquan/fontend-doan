// src/app/dashboard/hr/departments/page.tsx
'use client';

import { useState, useEffect } from 'react';
import { notification } from 'antd';
import { Building2, Search, Plus, Edit, Trash2, Eye, Loader2, List, Network, Users, ChevronRight, ChevronDown, X } from 'lucide-react';
import { departmentService, Department, CreateDepartmentDto, UpdateDepartmentDto } from '@/lib/api/services/department.service';
import { useAuth } from '@/hooks/useAuth';
import { UserRole } from '@/lib/constants/roles';
import { useI18n } from '@/hooks/useI18n';

type ViewMode = 'list' | 'tree';

export default function DepartmentsPage() {
  const { hasRole } = useAuth();
  const { t } = useI18n();
  const [api, contextHolder] = notification.useNotification();

  // States
  const [viewMode, setViewMode] = useState<ViewMode>('list');
  const [departments, setDepartments] = useState<Department[]>([]);
  const [treeData, setTreeData] = useState<Department[]>([]);
  const [loading, setLoading] = useState(true);
  const [treeLoading, setTreeLoading] = useState(false);
  const [error, setError] = useState('');
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [pageSize] = useState(10);
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [modalMode, setModalMode] = useState<'create' | 'edit' | 'view' | null>(null);
  const [selectedDepartment, setSelectedDepartment] = useState<Department | null>(null);
  const [departmentEmployees, setDepartmentEmployees] = useState<any>(null);
  const [departmentStats, setDepartmentStats] = useState<any>(null);
  const [loadingDetail, setLoadingDetail] = useState(false);
  const [formSubmitting, setFormSubmitting] = useState(false);
  const [formError, setFormError] = useState('');
  const [formData, setFormData] = useState<CreateDepartmentDto>({
    name: '',
    description: '',
    parent_id: undefined,
  });
  const [allDepartments, setAllDepartments] = useState<Department[]>([]);
  const [expandedNodes, setExpandedNodes] = useState<Set<number>>(new Set());

  // Fetch departments với debounce
  useEffect(() => {
    if (viewMode === 'list') {
      const timeoutId = setTimeout(() => {
        fetchDepartments();
      }, 300);
      return () => clearTimeout(timeoutId);
    }
  }, [page, search, viewMode]);

  useEffect(() => {
    if (viewMode === 'tree') {
      fetchTreeData();
    }
  }, [viewMode]);

  useEffect(() => {
    fetchAllDepartments();
  }, []);

  const fetchDepartments = async () => {
    setLoading(true);
    setError('');

    try {
      const data = await departmentService.getAll({
        page,
        pageSize,
        search: search.trim(),
        includeChildren: false,
      });

      setDepartments(data.data);
      setTotal(data.total);
      setTotalPages(data.totalPages);
    } catch (err: unknown) {
      // Error fetching departments
      const errorMessage = (err as { response?: { data?: { message?: string } } })?.response?.data?.message || t('departments.loadError');
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const fetchTreeData = async () => {
    setTreeLoading(true);
    setError('');

    try {
      const data = await departmentService.getTree();
      setTreeData(data);
      // Auto expand all nodes initially
      const allIds = new Set<number>();
      const collectIds = (depts: Department[]) => {
        depts.forEach(dept => {
          allIds.add(dept.id);
          if (dept.children) {
            collectIds(dept.children);
          }
        });
      };
      collectIds(data);
      setExpandedNodes(allIds);
    } catch (err: unknown) {
      // Error fetching tree
      const errorMessage = (err as { response?: { data?: { message?: string } } })?.response?.data?.message || t('departments.loadError');
      setError(errorMessage);
    } finally {
      setTreeLoading(false);
    }
  };

  const fetchAllDepartments = async () => {
    try {
      const data = await departmentService.getAll({ pageSize: 1000 });
      setAllDepartments(data.data);
    } catch (err: unknown) {
      // Error fetching all departments
    }
  };

  const handleSearch = (value: string) => {
    setSearch(value);
    setPage(1);
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

  const handleDelete = async (id: number, name: string) => {
    if (!confirm(t('departments.deleteConfirm', { name }))) return;

    try {
      await departmentService.delete(id);
      fetchDepartments();
      fetchTreeData();
      fetchAllDepartments();
      showNotification('success', t('departments.deleteSuccess'));
    } catch (err: unknown) {
      // Error deleting department
      const errorMessage = (err as { response?: { data?: { message?: string } } })?.response?.data?.message;
      showNotification('error', t('departments.deleteError'), errorMessage);
    }
  };

  const canManage = hasRole(UserRole.MANAGER) || hasRole(UserRole.SUPER_ADMIN);

  const openCreateModal = () => {
    setModalMode('create');
    setFormData({
      name: '',
      description: '',
      parent_id: undefined,
    });
    setFormError('');
  };

  const openEditModal = async (departmentId: number) => {
    setFormError('');
    try {
      setFormSubmitting(true);
      const department = await departmentService.getById(departmentId);
      setSelectedDepartment(department);
      setFormData({
        name: department.name,
        description: department.description || '',
        parent_id: department.parent_id || undefined,
      });
      setModalMode('edit');
    } catch (err: unknown) {
      const errorMessage = (err as { response?: { data?: { message?: string } } })?.response?.data?.message || 'Không thể tải chi tiết phòng ban';
      showNotification('error', 'Không thể tải chi tiết phòng ban', errorMessage);
    } finally {
      setFormSubmitting(false);
    }
  };

  const openViewModal = async (departmentId: number) => {
    setFormError('');
    setLoadingDetail(true);
    setDepartmentEmployees(null);
    setDepartmentStats(null);
    
    try {
      const [department, employees, stats] = await Promise.all([
        departmentService.getById(departmentId, true),
        departmentService.getEmployees(departmentId),
        departmentService.getStatistics(departmentId),
      ]);
      
      setSelectedDepartment(department);
      setDepartmentEmployees(employees);
      setDepartmentStats(stats);
      setModalMode('view');
    } catch (err: unknown) {
      const errorMessage = (err as { response?: { data?: { message?: string } } })?.response?.data?.message || 'Không thể tải chi tiết phòng ban';
      showNotification('error', 'Không thể tải chi tiết phòng ban', errorMessage);
    } finally {
      setLoadingDetail(false);
    }
  };

  const closeModal = () => {
    setModalMode(null);
    setSelectedDepartment(null);
    setDepartmentEmployees(null);
    setDepartmentStats(null);
    setFormError('');
  };

  const handleFormChange = (field: keyof CreateDepartmentDto, value: string | number | undefined) => {
    setFormData(prev => ({
      ...prev,
      [field]: value === '' ? undefined : value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!modalMode || modalMode === 'view') return;

    setFormSubmitting(true);
    setFormError('');

    const payload: CreateDepartmentDto | UpdateDepartmentDto = {
      ...formData,
      parent_id: formData.parent_id || undefined,
    };

    try {
      if (modalMode === 'create') {
        await departmentService.create(payload as CreateDepartmentDto);
        showNotification('success', t('departments.createSuccess'));
      } else if (modalMode === 'edit' && selectedDepartment) {
        await departmentService.update(selectedDepartment.id, payload as UpdateDepartmentDto);
        showNotification('success', t('departments.updateSuccess'));
      }
      closeModal();
      fetchDepartments();
      fetchTreeData();
      fetchAllDepartments();
    } catch (err: unknown) {
      const errorData = (err as { response?: { data?: { message?: string | string[] } } })?.response?.data;
      const message = errorData?.message || 'Có lỗi xảy ra, vui lòng thử lại';
      setFormError(Array.isArray(message) ? message.join(', ') : String(message));
    } finally {
      setFormSubmitting(false);
    }
  };

  const toggleNode = (id: number) => {
    setExpandedNodes(prev => {
      const newSet = new Set(prev);
      if (newSet.has(id)) {
        newSet.delete(id);
      } else {
        newSet.add(id);
      }
      return newSet;
    });
  };

  const renderTreeNode = (dept: Department, level: number = 0) => {
    const isExpanded = expandedNodes.has(dept.id);
    const hasChildren = dept.children && dept.children.length > 0;

    return (
      <div key={dept.id} className="select-none">
        <div
          className={`flex items-center gap-2 py-2 px-3 hover:bg-gray-50 rounded-lg cursor-pointer group ${
            level > 0 ? 'ml-6' : ''
          }`}
          style={{ paddingLeft: `${level * 24 + 12}px` }}
        >
          {hasChildren ? (
            <button
              onClick={(e) => {
                e.stopPropagation();
                toggleNode(dept.id);
              }}
              className="p-1 hover:bg-gray-200 rounded"
            >
              {isExpanded ? (
                <ChevronDown className="w-4 h-4 text-gray-500" />
              ) : (
                <ChevronRight className="w-4 h-4 text-gray-500" />
              )}
            </button>
          ) : (
            <div className="w-6" />
          )}
          <Building2 className="w-4 h-4 text-blue-500" />
          <span className="flex-1 font-medium text-gray-900">{dept.name}</span>
          <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
            <button
              onClick={(e) => {
                e.stopPropagation();
                openViewModal(dept.id);
              }}
              className="p-1.5 text-blue-600 hover:bg-blue-50 rounded transition-colors"
              title="Xem chi tiết"
            >
              <Eye className="w-4 h-4" />
            </button>
            {canManage && (
              <>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    openEditModal(dept.id);
                  }}
                  className="p-1.5 text-green-600 hover:bg-green-50 rounded transition-colors"
                  title="Chỉnh sửa"
                >
                  <Edit className="w-4 h-4" />
                </button>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleDelete(dept.id, dept.name);
                  }}
                  className="p-1.5 text-red-600 hover:bg-red-50 rounded transition-colors"
                  title="Xóa"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </>
            )}
          </div>
        </div>
        {hasChildren && isExpanded && (
          <div>
            {dept.children!.map(child => renderTreeNode(child, level + 1))}
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="space-y-6">
      {contextHolder}
      {/* Header */}
      <div className="bg-white rounded-xl shadow-sm p-6">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-blue-100 rounded-lg">
              <Building2 className="w-6 h-6 text-blue-600" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">{t('departments.title')}</h1>
              <p className="text-sm text-gray-500">{'Tổng'}: {total} {t('departments.departmentName').toLowerCase()}</p>
            </div>
          </div>
          {canManage && (
            <button
              onClick={openCreateModal}
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              <Plus className="w-5 h-5" />
              {t('departments.addDepartment')}
            </button>
          )}
        </div>

        {/* View Mode Toggle */}
        <div className="flex items-center gap-4 mb-4">
          <div className="flex items-center gap-2 bg-gray-100 rounded-lg p-1">
            <button
              onClick={() => setViewMode('list')}
              className={`flex items-center gap-2 px-4 py-2 rounded-md transition-colors ${
                viewMode === 'list'
                  ? 'bg-white text-blue-600 shadow-sm'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              <List className="w-4 h-4" />
              {t('departments.listView')}
            </button>
            <button
              onClick={() => setViewMode('tree')}
              className={`flex items-center gap-2 px-4 py-2 rounded-md transition-colors ${
                viewMode === 'tree'
                  ? 'bg-white text-blue-600 shadow-sm'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              <Network className="w-4 h-4" />
              {t('departments.treeView')}
            </button>
          </div>

          {/* Search - only show in list view */}
          {viewMode === 'list' && (
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                placeholder={t('departments.searchPlaceholder')}
                value={search}
                onChange={(e) => handleSearch(e.target.value)}
                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
              />
            </div>
          )}
        </div>
      </div>

      {/* Error Message */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-xl p-4">
          <p className="text-red-600 text-sm">{error}</p>
        </div>
      )}

      {/* Loading */}
      {(loading || treeLoading) ? (
        <div className="bg-white rounded-xl shadow-sm p-12">
          <div className="flex flex-col items-center justify-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mb-4"></div>
            <p className="text-gray-600">{t('common.loading')}</p>
          </div>
        </div>
      ) : (
        <>
          {viewMode === 'list' ? (
            <>
              {/* Table */}
              <div className="bg-white rounded-xl shadow-sm overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-gray-50 border-b border-gray-200">
                      <tr>
                        <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase">
                          {t('departments.departmentName')}
                        </th>
                        <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase">
                          {'Mô tả'}
                        </th>
                        <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase">
                          {t('departments.parentDepartment')}
                        </th>
                        {canManage && (
                          <th className="px-6 py-4 text-right text-xs font-semibold text-gray-600 uppercase">
                            {'Thao tác'}
                          </th>
                        )}
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                      {departments.map((dept) => (
                        <tr key={dept.id} className="hover:bg-gray-50 transition-colors">
                          <td className="px-6 py-4">
                            <p className="font-medium text-gray-900">{dept.name}</p>
                          </td>
                          <td className="px-6 py-4">
                            <p className="text-sm text-gray-600">{dept.description || 'N/A'}</p>
                          </td>
                          <td className="px-6 py-4">
                            <p className="text-sm text-gray-600">
                              {dept.parent?.name || 'N/A'}
                            </p>
                          </td>
                          {canManage && (
                            <td className="px-6 py-4">
                              <div className="flex items-center justify-end gap-2">
                                <button
                                  onClick={() => openViewModal(dept.id)}
                                  className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                                >
                                  <Eye className="w-4 h-4" />
                                </button>
                                <button
                                  onClick={() => openEditModal(dept.id)}
                                  className="p-2 text-green-600 hover:bg-green-50 rounded-lg transition-colors"
                                >
                                  <Edit className="w-4 h-4" />
                                </button>
                                <button
                                  onClick={() => handleDelete(dept.id, dept.name)}
                                  className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
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
                {departments.length === 0 && !loading && (
                  <div className="text-center py-12">
                    <Building2 className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                    <p className="text-gray-500 text-lg font-medium">{t('common.noData')}</p>
                    <p className="text-gray-400 text-sm mt-1">
                      {search ? t('common.search') : t('departments.addDepartment')}
                    </p>
                  </div>
                )}
              </div>

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="bg-white rounded-xl shadow-sm p-4">
                  <div className="flex items-center justify-between">
                    <p className="text-sm text-gray-600">
                      Hiển thị <span className="font-semibold">{departments.length}</span> / {total} phòng ban
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
          ) : (
            /* Tree View */
            <div className="bg-white rounded-xl shadow-sm p-6">
              {treeData.length === 0 ? (
                <div className="text-center py-12">
                  <Building2 className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                  <p className="text-gray-500 text-lg font-medium">Chưa có phòng ban nào</p>
                </div>
              ) : (
                <div className="space-y-1">
                  {treeData.map(dept => renderTreeNode(dept))}
                </div>
              )}
            </div>
          )}
        </>
      )}

      {/* Modal */}
      {modalMode && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-200 flex items-center justify-between sticky top-0 bg-white z-10">
              <h2 className="text-xl font-bold text-gray-900">
                {modalMode === 'create' && t('departments.createTitle')}
                {modalMode === 'edit' && t('departments.editTitle')}
                {modalMode === 'view' && t('departments.viewTitle')}
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

            {modalMode === 'view' && selectedDepartment ? (
              <div className="p-6 space-y-6">
                {loadingDetail ? (
                  <div className="flex items-center justify-center py-12">
                    <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
                  </div>
                ) : (
                  <>
                    {/* Statistics */}
                    {departmentStats && (
                      <div className="grid grid-cols-3 gap-4">
                        <div className="bg-blue-50 rounded-lg p-4">
                          <div className="flex items-center gap-3">
                            <div className="p-2 bg-blue-100 rounded-lg">
                              <Users className="w-5 h-5 text-blue-600" />
                            </div>
                            <div>
                              <p className="text-sm text-gray-600">Tổng nhân viên</p>
                              <p className="text-2xl font-bold text-gray-900">{departmentStats.totalEmployees}</p>
                            </div>
                          </div>
                        </div>
                        <div className="bg-green-50 rounded-lg p-4">
                          <div className="flex items-center gap-3">
                            <div className="p-2 bg-green-100 rounded-lg">
                              <Building2 className="w-5 h-5 text-green-600" />
                            </div>
                            <div>
                              <p className="text-sm text-gray-600">Phòng ban con</p>
                              <p className="text-2xl font-bold text-gray-900">{departmentStats.childDepartments}</p>
                            </div>
                          </div>
                        </div>
                        <div className="bg-purple-50 rounded-lg p-4">
                          <div className="flex items-center gap-3">
                            <div className="p-2 bg-purple-100 rounded-lg">
                              <Network className="w-5 h-5 text-purple-600" />
                            </div>
                            <div>
                              <p className="text-sm text-gray-600">Tổng phòng ban</p>
                              <p className="text-2xl font-bold text-gray-900">{departmentStats.totalDepartments}</p>
                            </div>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Department Info */}
                    <div className="bg-gray-50 rounded-lg p-4 space-y-3">
                      <DetailField label={t('departments.departmentName')} value={selectedDepartment.name} />
                      <DetailField label={t('common.description')} value={selectedDepartment.description || 'N/A'} />
                      <DetailField
                        label={t('departments.parentDepartment')}
                        value={selectedDepartment.parent?.name || 'N/A'}
                      />
                    </div>

                    {/* Child Departments */}
                    {selectedDepartment.children && selectedDepartment.children.length > 0 && (
                      <div>
                        <h3 className="text-lg font-semibold text-gray-900 mb-3">Phòng ban con</h3>
                        <div className="bg-gray-50 rounded-lg p-4">
                          <div className="grid grid-cols-2 gap-2">
                            {selectedDepartment.children.map((child) => (
                              <div
                                key={child.id}
                                className="flex items-center gap-2 p-2 bg-white rounded-lg hover:bg-gray-50 cursor-pointer"
                                onClick={() => {
                                  closeModal();
                                  setTimeout(() => openViewModal(child.id), 100);
                                }}
                              >
                                <Building2 className="w-4 h-4 text-blue-500" />
                                <span className="text-sm font-medium text-gray-900">{child.name}</span>
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Employees */}
                    {departmentEmployees && (
                      <div>
                        <h3 className="text-lg font-semibold text-gray-900 mb-3">
                          Nhân viên ({departmentEmployees.totalEmployees} người)
                        </h3>
                        <div className="bg-gray-50 rounded-lg p-4 space-y-4 max-h-96 overflow-y-auto">
                          {Object.entries(departmentEmployees.employees).map(([deptId, employees]: [string, any]) => (
                            <div key={deptId} className="bg-white rounded-lg p-4">
                              <div className="flex items-center gap-2 mb-3">
                                <Building2 className="w-4 h-4 text-blue-500" />
                                <span className="font-medium text-gray-900">
                                  {employees[0]?.department_name || 'Phòng ban không xác định'}
                                </span>
                                <span className="text-sm text-gray-500">({employees.length} người)</span>
                              </div>
                              <div className="space-y-2">
                                {employees.map((emp: any) => (
                                  <div key={emp.id} className="flex items-center justify-between p-2 hover:bg-gray-50 rounded">
                                    <div className="flex items-center gap-3">
                                      <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                                        <span className="text-xs font-semibold text-blue-600">
                                          {emp.full_name.charAt(0).toUpperCase()}
                                        </span>
                                      </div>
                                      <div>
                                        <p className="text-sm font-medium text-gray-900">{emp.full_name}</p>
                                        <p className="text-xs text-gray-500">{emp.employee_code} • {emp.position?.title || 'N/A'}</p>
                                      </div>
                                    </div>
                                    <div className="text-xs text-gray-500">{emp.email}</div>
                                  </div>
                                ))}
                              </div>
                            </div>
                          ))}
                          {Object.keys(departmentEmployees.employees).length === 0 && (
                            <p className="text-center text-gray-500 py-4">Chưa có nhân viên nào</p>
                          )}
                        </div>
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
                  </>
                )}
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="p-6 space-y-4">
                <InputField
                  label={t('departments.departmentName')}
                  value={formData.name}
                  onChange={(value) => handleFormChange('name', value)}
                  required
                  disabled={formSubmitting}
                />

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    {t('departments.parentDepartment')}
                  </label>
                  <select
                    value={formData.parent_id || ''}
                    onChange={(e) =>
                      handleFormChange('parent_id', e.target.value ? Number(e.target.value) : undefined)
                    }
                    disabled={formSubmitting}
                    className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none disabled:bg-gray-100"
                  >
                    <option value="">{t('departments.noParent')}</option>
                    {allDepartments
                      .filter((d) => d.id !== selectedDepartment?.id)
                      .map((dept) => (
                        <option key={dept.id} value={dept.id}>
                          {dept.name}
                        </option>
                      ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">{t('common.description')}</label>
                  <textarea
                    value={formData.description || ''}
                    onChange={(e) => handleFormChange('description', e.target.value)}
                    disabled={formSubmitting}
                    rows={4}
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
                    {modalMode === 'create' ? t('common.create') : t('common.save')}
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

function InputField({
  label,
  value,
  onChange,
  required,
  disabled,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  required?: boolean;
  disabled?: boolean;
}) {
  return (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-2">
        {label} {required && <span className="text-red-500">*</span>}
      </label>
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        required={required}
        disabled={disabled}
        className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none disabled:bg-gray-100"
      />
    </div>
  );
}

function DetailField({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="text-xs font-semibold text-gray-500 uppercase mb-1">{label}</p>
      <p className="text-gray-900">{value}</p>
    </div>
  );
}
