// src/app/dashboard/hr/positions/page.tsx
'use client';

import { useState, useEffect } from 'react';
import { notification } from 'antd';
import { Briefcase, Search, Plus, Edit, Trash2, Eye, Loader2, Building2, List, Network, ChevronRight, ChevronDown } from 'lucide-react';
import { positionService, Position, CreatePositionDto, UpdatePositionDto } from '@/lib/api/services/position.service';
import { departmentService, Department } from '@/lib/api/services/department.service';
import { useAuth } from '@/hooks/useAuth';
import { UserRole } from '@/lib/constants/roles';

type ViewMode = 'table' | 'tree';

export default function PositionsPage() {
  const { hasRole } = useAuth();
  const [api, contextHolder] = notification.useNotification();

  // States
  const [viewMode, setViewMode] = useState<ViewMode>('table');
  const [positions, setPositions] = useState<Position[]>([]);
  const [allPositions, setAllPositions] = useState<Position[]>([]);
  const [departments, setDepartments] = useState<Department[]>([]);
  const [departmentTree, setDepartmentTree] = useState<Department[]>([]);
  const [loading, setLoading] = useState(true);
  const [treeLoading, setTreeLoading] = useState(false);
  const [error, setError] = useState('');
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [pageSize] = useState(10);
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [modalMode, setModalMode] = useState<'create' | 'edit' | 'view' | null>(null);
  const [selectedPosition, setSelectedPosition] = useState<Position | null>(null);
  const [formSubmitting, setFormSubmitting] = useState(false);
  const [formError, setFormError] = useState('');
  const [optionsLoading, setOptionsLoading] = useState(false);
  const [expandedDepartments, setExpandedDepartments] = useState<Set<number>>(new Set());
  const [formData, setFormData] = useState<CreatePositionDto>({
    title: '',
    description: '',
    level: undefined,
    department_id: undefined,
  });

  // Fetch positions với debounce
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      if (viewMode === 'table') {
        fetchPositions();
      } else {
        fetchAllPositionsForTree();
      }
    }, 300);

    return () => clearTimeout(timeoutId);
  }, [page, search, viewMode]);

  useEffect(() => {
    if (viewMode === 'tree') {
      fetchDepartmentTree();
    }
  }, [viewMode]);

  useEffect(() => {
    fetchDepartments();
  }, []);

  const fetchPositions = async () => {
    setLoading(true);
    setError('');

    try {
      const data = await positionService.getAll({
        page,
        pageSize,
        search: search.trim(),
      });

      setPositions(data.data);
      setTotal(data.total);
      setTotalPages(data.totalPages);
    } catch (err: any) {
      console.error('Error fetching positions:', err);
      setError(err.response?.data?.message || 'Không thể tải danh sách vị trí');
    } finally {
      setLoading(false);
    }
  };

  const fetchAllPositionsForTree = async () => {
    setTreeLoading(true);
    setError('');

    try {
      const data = await positionService.getAll({
        page: 1,
        pageSize: 1000,
        search: search.trim(),
      });

      setAllPositions(data.data);
    } catch (err: any) {
      console.error('Error fetching all positions:', err);
      setError(err.response?.data?.message || 'Không thể tải danh sách vị trí');
    } finally {
      setTreeLoading(false);
    }
  };

  const fetchDepartmentTree = async () => {
    try {
      const data = await departmentService.getTree();
      setDepartmentTree(data);
      // Auto expand all departments initially
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
      setExpandedDepartments(allIds);
    } catch (err: any) {
      console.error('Error fetching department tree:', err);
    }
  };

  const fetchDepartments = async () => {
    setOptionsLoading(true);
    try {
      const data = await departmentService.getAll({ pageSize: 1000 });
      setDepartments(data.data);
    } catch (err: any) {
      console.error('Error fetching departments:', err);
    } finally {
      setOptionsLoading(false);
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

  const handleDelete = async (id: number, title: string) => {
    if (!confirm(`Bạn có chắc muốn xóa vị trí "${title}"?`)) return;

    try {
      await positionService.delete(id);
      if (viewMode === 'table') {
        fetchPositions();
      } else {
        fetchAllPositionsForTree();
      }
      showNotification('success', 'Xóa vị trí thành công!');
    } catch (err: any) {
      console.error('Error deleting position:', err);
      showNotification('error', 'Không thể xóa vị trí', err.response?.data?.message);
    }
  };

  const canManage = hasRole(UserRole.MANAGER) || hasRole(UserRole.SUPER_ADMIN);

  const openCreateModal = () => {
    setModalMode('create');
    setFormData({
      title: '',
      description: '',
      level: undefined,
      department_id: undefined,
    });
    setFormError('');
    if (departments.length === 0) {
      fetchDepartments();
    }
  };

  const openEditModal = async (positionId: number) => {
    setFormError('');
    try {
      setFormSubmitting(true);
      const position = await positionService.getById(positionId);
      setSelectedPosition(position);
      setFormData({
        title: position.title,
        description: position.description || '',
        level: position.level || undefined,
        department_id: position.department_id || undefined,
      });
      setModalMode('edit');
      if (departments.length === 0) {
        fetchDepartments();
      }
    } catch (err: any) {
      showNotification('error', 'Không thể tải chi tiết vị trí', err.response?.data?.message);
    } finally {
      setFormSubmitting(false);
    }
  };

  const openViewModal = async (positionId: number) => {
    setFormError('');
    try {
      setFormSubmitting(true);
      const position = await positionService.getById(positionId);
      setSelectedPosition(position);
      setModalMode('view');
    } catch (err: any) {
      showNotification('error', 'Không thể tải chi tiết vị trí', err.response?.data?.message);
    } finally {
      setFormSubmitting(false);
    }
  };

  const closeModal = () => {
    setModalMode(null);
    setSelectedPosition(null);
    setFormError('');
  };

  const handleFormChange = (field: keyof CreatePositionDto, value: string | number | undefined) => {
    setFormData(prev => ({
      ...prev,
      [field]: value === '' ? undefined : value,
    }));
  };

  const toggleDepartment = (departmentId: number) => {
    setExpandedDepartments(prev => {
      const newSet = new Set(prev);
      if (newSet.has(departmentId)) {
        newSet.delete(departmentId);
      } else {
        newSet.add(departmentId);
      }
      return newSet;
    });
  };

  const getPositionsByDepartment = (departmentId: number | null): Position[] => {
    return allPositions.filter(pos => pos.department_id === departmentId);
  };

  const getPositionsWithoutDepartment = (): Position[] => {
    return allPositions.filter(pos => pos.department_id === null);
  };

  const renderDepartmentTree = (depts: Department[], level: number = 0): JSX.Element[] => {
    return depts.map(dept => {
      const positionsInDept = getPositionsByDepartment(dept.id);
      const isExpanded = expandedDepartments.has(dept.id);
      const hasChildren = dept.children && dept.children.length > 0;
      const hasPositions = positionsInDept.length > 0;

      return (
        <div key={dept.id}>
          <div
            className={`flex items-center gap-2 p-3 hover:bg-gray-50 rounded-lg cursor-pointer ${level > 0 ? 'ml-6' : ''}`}
            style={{ paddingLeft: `${level * 1.5}rem` }}
          >
            {hasChildren && (
              <button
                onClick={() => toggleDepartment(dept.id)}
                className="p-1 hover:bg-gray-200 rounded"
              >
                {isExpanded ? (
                  <ChevronDown className="w-4 h-4 text-gray-600" />
                ) : (
                  <ChevronRight className="w-4 h-4 text-gray-600" />
                )}
              </button>
            )}
            {!hasChildren && <div className="w-6" />}
            <Building2 className="w-4 h-4 text-blue-600" />
            <span className="font-medium text-gray-900">{dept.name}</span>
            {hasPositions && (
              <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded">
                {positionsInDept.length} vị trí
              </span>
            )}
          </div>
          {isExpanded && hasPositions && (
            <div className="ml-8 space-y-1">
              {positionsInDept.map(pos => (
                <div
                  key={pos.id}
                  className="flex items-center justify-between p-2 pl-8 bg-gray-50 rounded-lg hover:bg-gray-100"
                >
                  <div className="flex items-center gap-3">
                    <Briefcase className="w-4 h-4 text-gray-400" />
                    <div>
                      <p className="font-medium text-gray-900">{pos.title}</p>
                      {pos.level && (
                        <p className="text-xs text-gray-500">Cấp độ: {pos.level}</p>
                      )}
                    </div>
                  </div>
                  {canManage && (
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => openViewModal(pos.id)}
                        className="p-1.5 text-blue-600 hover:bg-blue-50 rounded transition-colors"
                      >
                        <Eye className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => openEditModal(pos.id)}
                        className="p-1.5 text-green-600 hover:bg-green-50 rounded transition-colors"
                      >
                        <Edit className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDelete(pos.id, pos.title)}
                        className="p-1.5 text-red-600 hover:bg-red-50 rounded transition-colors"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
          {isExpanded && hasChildren && dept.children && (
            <div className="ml-4">
              {renderDepartmentTree(dept.children, level + 1)}
            </div>
          )}
        </div>
      );
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!modalMode || modalMode === 'view') return;

    setFormSubmitting(true);
    setFormError('');

    const payload: CreatePositionDto | UpdatePositionDto = {
      ...formData,
      level: formData.level || undefined,
    };

    try {
      if (modalMode === 'create') {
        await positionService.create(payload as CreatePositionDto);
        showNotification('success', 'Tạo vị trí thành công');
      } else if (modalMode === 'edit' && selectedPosition) {
        await positionService.update(selectedPosition.id, payload as UpdatePositionDto);
        showNotification('success', 'Cập nhật vị trí thành công');
      }
      closeModal();
      if (viewMode === 'table') {
        fetchPositions();
      } else {
        fetchAllPositionsForTree();
        fetchDepartmentTree();
      }
    } catch (err: any) {
      const message = err.response?.data?.message || 'Có lỗi xảy ra, vui lòng thử lại';
      setFormError(Array.isArray(message) ? message.join(', ') : message);
    } finally {
      setFormSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      {contextHolder}
      {/* Header */}
      <div className="bg-white rounded-xl shadow-sm p-6">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-blue-100 rounded-lg">
              <Briefcase className="w-6 h-6 text-blue-600" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Quản lý vị trí</h1>
              <p className="text-sm text-gray-500">
                Tổng số: {viewMode === 'table' ? total : allPositions.length} vị trí
              </p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            {/* View Mode Toggle */}
            <div className="flex items-center gap-2 bg-gray-100 rounded-lg p-1">
              <button
                onClick={() => setViewMode('table')}
                className={`px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${
                  viewMode === 'table'
                    ? 'bg-white text-blue-600 shadow-sm'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                <div className="flex items-center gap-2">
                  <List className="w-4 h-4" />
                  Bảng
                </div>
              </button>
              <button
                onClick={() => setViewMode('tree')}
                className={`px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${
                  viewMode === 'tree'
                    ? 'bg-white text-blue-600 shadow-sm'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                <div className="flex items-center gap-2">
                  <Network className="w-4 h-4" />
                  Sơ đồ cây
                </div>
              </button>
            </div>
            {canManage && (
              <button
                onClick={openCreateModal}
                className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                <Plus className="w-5 h-5" />
                Thêm vị trí
              </button>
            )}
          </div>
        </div>

        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input
            type="text"
            placeholder="Tìm kiếm theo tên, mô tả..."
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
      {(loading || (viewMode === 'tree' && treeLoading)) ? (
        <div className="bg-white rounded-xl shadow-sm p-12">
          <div className="flex flex-col items-center justify-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mb-4"></div>
            <p className="text-gray-600">Đang tải dữ liệu...</p>
          </div>
        </div>
      ) : (
        <>
          {viewMode === 'table' ? (
            /* Table View */
            <div className="bg-white rounded-xl shadow-sm overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50 border-b border-gray-200">
                    <tr>
                      <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase">
                        Tên vị trí
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase">
                        Phòng ban
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase">
                        Cấp độ
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase">
                        Mô tả
                      </th>
                      {canManage && (
                        <th className="px-6 py-4 text-right text-xs font-semibold text-gray-600 uppercase">
                          Thao tác
                        </th>
                      )}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {positions.map((pos) => (
                      <tr key={pos.id} className="hover:bg-gray-50 transition-colors">
                        <td className="px-6 py-4">
                          <p className="font-medium text-gray-900">{pos.title}</p>
                        </td>
                        <td className="px-6 py-4">
                          <p className="text-sm text-gray-600">
                            {pos.department?.name || 'Chưa phân công'}
                          </p>
                        </td>
                        <td className="px-6 py-4">
                          <p className="text-sm text-gray-600">{pos.level || 'N/A'}</p>
                        </td>
                        <td className="px-6 py-4">
                          <p className="text-sm text-gray-600">{pos.description || 'N/A'}</p>
                        </td>
                        {canManage && (
                          <td className="px-6 py-4">
                            <div className="flex items-center justify-end gap-2">
                              <button
                                onClick={() => openViewModal(pos.id)}
                                className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                              >
                                <Eye className="w-4 h-4" />
                              </button>
                              <button
                                onClick={() => openEditModal(pos.id)}
                                className="p-2 text-green-600 hover:bg-green-50 rounded-lg transition-colors"
                              >
                                <Edit className="w-4 h-4" />
                              </button>
                              <button
                                onClick={() => handleDelete(pos.id, pos.title)}
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
              {positions.length === 0 && !loading && (
                <div className="text-center py-12">
                  <Briefcase className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                  <p className="text-gray-500 text-lg font-medium">Không tìm thấy vị trí</p>
                  <p className="text-gray-400 text-sm mt-1">
                    {search ? 'Thử thay đổi từ khóa tìm kiếm' : 'Thêm vị trí mới để bắt đầu'}
                  </p>
                </div>
              )}
            </div>
          ) : (
            /* Tree View */
            <div className="bg-white rounded-xl shadow-sm p-6">
              <div className="space-y-2">
                {departmentTree.length > 0 ? (
                  <>
                    {renderDepartmentTree(departmentTree)}
                    {getPositionsWithoutDepartment().length > 0 && (
                      <div className="mt-6 pt-6 border-t">
                        <div className="flex items-center gap-2 p-3">
                          <Briefcase className="w-4 h-4 text-gray-400" />
                          <span className="font-medium text-gray-700">Chưa phân công phòng ban</span>
                          <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded">
                            {getPositionsWithoutDepartment().length} vị trí
                          </span>
                        </div>
                        <div className="ml-8 space-y-1 mt-2">
                          {getPositionsWithoutDepartment().map(pos => (
                            <div
                              key={pos.id}
                              className="flex items-center justify-between p-2 bg-gray-50 rounded-lg hover:bg-gray-100"
                            >
                              <div className="flex items-center gap-3">
                                <Briefcase className="w-4 h-4 text-gray-400" />
                                <div>
                                  <p className="font-medium text-gray-900">{pos.title}</p>
                                  {pos.level && (
                                    <p className="text-xs text-gray-500">Cấp độ: {pos.level}</p>
                                  )}
                                </div>
                              </div>
                              {canManage && (
                                <div className="flex items-center gap-2">
                                  <button
                                    onClick={() => openViewModal(pos.id)}
                                    className="p-1.5 text-blue-600 hover:bg-blue-50 rounded transition-colors"
                                  >
                                    <Eye className="w-4 h-4" />
                                  </button>
                                  <button
                                    onClick={() => openEditModal(pos.id)}
                                    className="p-1.5 text-green-600 hover:bg-green-50 rounded transition-colors"
                                  >
                                    <Edit className="w-4 h-4" />
                                  </button>
                                  <button
                                    onClick={() => handleDelete(pos.id, pos.title)}
                                    className="p-1.5 text-red-600 hover:bg-red-50 rounded transition-colors"
                                  >
                                    <Trash2 className="w-4 h-4" />
                                  </button>
                                </div>
                              )}
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </>
                ) : (
                  <div className="text-center py-12">
                    <Network className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                    <p className="text-gray-500 text-lg font-medium">Không có dữ liệu</p>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Pagination - Only show in table view */}
          {viewMode === 'table' && totalPages > 1 && (
            <div className="bg-white rounded-xl shadow-sm p-4">
              <div className="flex items-center justify-between">
                <p className="text-sm text-gray-600">
                  Hiển thị <span className="font-semibold">{positions.length}</span> / {total} vị trí
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
                {modalMode === 'create' && 'Thêm vị trí mới'}
                {modalMode === 'edit' && 'Chỉnh sửa vị trí'}
                {modalMode === 'view' && 'Chi tiết vị trí'}
              </h2>
              <button
                onClick={closeModal}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <Loader2 className="w-5 h-5 text-gray-500" />
              </button>
            </div>

            {formError && (
              <div className="mx-6 mt-4 p-3 bg-red-50 border border-red-200 rounded-lg">
                <p className="text-red-600 text-sm">{formError}</p>
              </div>
            )}

            {modalMode === 'view' && selectedPosition ? (
              <div className="p-6 space-y-4">
                <DetailField label="Tên vị trí" value={selectedPosition.title} />
                <DetailField 
                  label="Phòng ban" 
                  value={selectedPosition.department?.name || 'Chưa phân công'} 
                />
                <DetailField label="Cấp độ" value={selectedPosition.level?.toString() || 'N/A'} />
                <DetailField label="Mô tả" value={selectedPosition.description || 'N/A'} />
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
                <InputField
                  label="Tên vị trí"
                  value={formData.title}
                  onChange={(value) => handleFormChange('title', value)}
                  required
                  disabled={formSubmitting}
                />

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Phòng ban
                  </label>
                  <select
                    value={formData.department_id || ''}
                    onChange={(e) =>
                      handleFormChange('department_id', e.target.value ? Number(e.target.value) : undefined)
                    }
                    disabled={formSubmitting || optionsLoading}
                    className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none disabled:bg-gray-100"
                  >
                    <option value="">Chọn phòng ban (tùy chọn)</option>
                    {departments.map((dept) => (
                      <option key={dept.id} value={dept.id}>
                        {dept.name}
                      </option>
                    ))}
                  </select>
                  <p className="text-xs text-gray-500 mt-1">
                    Để trống nếu vị trí không thuộc phòng ban cụ thể
                  </p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Cấp độ (1-10)
                  </label>
                  <input
                    type="number"
                    min="1"
                    max="10"
                    value={formData.level || ''}
                    onChange={(e) =>
                      handleFormChange('level', e.target.value ? Number(e.target.value) : undefined)
                    }
                    disabled={formSubmitting}
                    className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none disabled:bg-gray-100"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Mô tả</label>
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
                    {modalMode === 'create' ? 'Tạo vị trí' : 'Lưu thay đổi'}
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
      <p className="text-xs font-semibold text-gray-500 uppercase">{label}</p>
      <p className="mt-1 text-gray-900">{value}</p>
    </div>
  );
}




