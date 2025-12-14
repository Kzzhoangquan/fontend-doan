// src/app/dashboard/hr/positions/page.tsx
'use client';

import { useState, useEffect } from 'react';
import { notification } from 'antd';
import { Briefcase, Search, Plus, Edit, Trash2, Eye, Loader2, Building2, List, Network, ChevronRight, ChevronDown } from 'lucide-react';
import { positionService, Position, CreatePositionDto, UpdatePositionDto } from '@/lib/api/services/position.service';
import { departmentService, Department } from '@/lib/api/services/department.service';
import { useAuth } from '@/hooks/useAuth';
import { UserRole } from '@/lib/constants/roles';
import { useI18n } from '@/hooks/useI18n';

type ViewMode = 'table' | 'tree';

export default function PositionsPage() {
  const { hasRole } = useAuth();
  const { t } = useI18n();
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
  const [selectedDepartmentId, setSelectedDepartmentId] = useState<number | undefined>(undefined);
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
  const [isDepartmentDropdownOpen, setIsDepartmentDropdownOpen] = useState(false);
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
  }, [page, search, selectedDepartmentId, viewMode]);

  useEffect(() => {
    if (viewMode === 'tree') {
      fetchDepartmentTree();
    }
  }, [viewMode, selectedDepartmentId]);

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
        departmentId: selectedDepartmentId,
      });

      setPositions(data.data);
      setTotal(data.total);
      setTotalPages(data.totalPages);
    } catch (err: unknown) {
      // Error fetching positions
      const errorMessage = (err as { response?: { data?: { message?: string } } })?.response?.data?.message || t('positions.loadError');
      setError(errorMessage);
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
        departmentId: selectedDepartmentId,
      });

      setAllPositions(data.data);
    } catch (err: unknown) {
      // Error fetching all positions
      const errorMessage = (err as { response?: { data?: { message?: string } } })?.response?.data?.message || t('positions.loadError');
      setError(errorMessage);
    } finally {
      setTreeLoading(false);
    }
  };

  // Tìm phòng ban trong cây và trả về nó cùng với các con
  const findDepartmentInTree = (
    depts: Department[],
    targetId: number
  ): Department | null => {
    for (const dept of depts) {
      if (dept.id === targetId) {
        return dept;
      }
      if (dept.children && dept.children.length > 0) {
        const found = findDepartmentInTree(dept.children, targetId);
        if (found) {
          return found;
        }
      }
    }
    return null;
  };

  const fetchDepartmentTree = async () => {
    try {
      const data = await departmentService.getTree();
      setDepartmentTree(data);
      // Auto expand all departments initially, hoặc chỉ expand phòng ban được chọn và các con
      const allIds = new Set<number>();
      
      if (selectedDepartmentId) {
        // Chỉ expand phòng ban được chọn và các con
        const foundDept = findDepartmentInTree(data, selectedDepartmentId);
        if (foundDept) {
          const expandDeptAndChildren = (dept: Department) => {
            allIds.add(dept.id);
            if (dept.children) {
              dept.children.forEach(expandDeptAndChildren);
            }
          };
          expandDeptAndChildren(foundDept);
        }
      } else {
        // Expand tất cả
        const collectIds = (depts: Department[]) => {
          depts.forEach(dept => {
            allIds.add(dept.id);
            if (dept.children) {
              collectIds(dept.children);
            }
          });
        };
        collectIds(data);
      }
      setExpandedDepartments(allIds);
    } catch (err: unknown) {
      // Error fetching department tree
    }
  };

  const fetchDepartments = async () => {
    setOptionsLoading(true);
    try {
      const data = await departmentService.getAll({ pageSize: 1000 });
      setDepartments(data.data);
    } catch (err: unknown) {
      // Error fetching departments
    } finally {
      setOptionsLoading(false);
    }
  };

  const handleSearch = (value: string) => {
    setSearch(value);
    setPage(1);
  };

  const handleDepartmentFilterChange = (value: string) => {
    setSelectedDepartmentId(value ? Number(value) : undefined);
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
    if (!confirm(t('positions.deleteConfirm', { title }))) return;

    try {
      await positionService.delete(id);
      if (viewMode === 'table') {
        fetchPositions();
      } else {
        fetchAllPositionsForTree();
      }
      showNotification('success', t('positions.deleteSuccess'));
    } catch (err: unknown) {
      // Error deleting position
      const errorMessage = (err as { response?: { data?: { message?: string } } })?.response?.data?.message;
      showNotification('error', t('positions.deleteError'), errorMessage);
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
    } catch (err: unknown) {
      const errorMessage = (err as { response?: { data?: { message?: string } } })?.response?.data?.message || 'Không thể tải chi tiết vị trí';
      showNotification('error', 'Không thể tải chi tiết vị trí', errorMessage);
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
    } catch (err: unknown) {
      const errorMessage = (err as { response?: { data?: { message?: string } } })?.response?.data?.message || 'Không thể tải chi tiết vị trí';
      showNotification('error', 'Không thể tải chi tiết vị trí', errorMessage);
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

  // Lọc cây phòng ban dựa trên selectedDepartmentId
  const getFilteredDepartmentTree = (): Department[] => {
    if (!selectedDepartmentId) {
      return departmentTree;
    }

    const foundDept = findDepartmentInTree(departmentTree, selectedDepartmentId);
    if (foundDept) {
      // Trả về mảng chứa phòng ban được chọn (với các con của nó)
      return [foundDept];
    }

    return [];
  };

  const renderDepartmentTree = (depts: Department[], level: number = 0, parentPath: number[] = []): JSX.Element[] => {
    return depts.map((dept, index) => {
      const positionsInDept = getPositionsByDepartment(dept.id);
      const isExpanded = expandedDepartments.has(dept.id);
      const hasChildren = dept.children && dept.children.length > 0;
      const hasPositions = positionsInDept.length > 0;
      const isLast = index === depts.length - 1;
      const currentPath = [...parentPath, dept.id];

      return (
        <div key={dept.id} className="relative">
          {/* Department Header */}
          <div
            className={`flex items-center gap-3 p-4 mb-2 rounded-xl border-2 transition-all ${
              level === 0
                ? 'bg-gradient-to-r from-blue-50 to-indigo-50 border-blue-200 hover:border-blue-300'
                : level === 1
                ? 'bg-gradient-to-r from-purple-50 to-pink-50 border-purple-200 hover:border-purple-300'
                : 'bg-gray-50 border-gray-200 hover:border-gray-300'
            }`}
            style={{ marginLeft: `${level * 1.5}rem` }}
          >
            {/* Tree Lines */}
            {level > 0 && (
              <div className="absolute left-0 top-0 bottom-0 w-6 flex items-center">
                <div className="w-full h-px bg-gray-300"></div>
              </div>
            )}

            {/* Expand/Collapse Button */}
            <button
              onClick={() => toggleDepartment(dept.id)}
              className={`flex-shrink-0 p-1.5 rounded-lg transition-colors ${
                hasChildren || hasPositions
                  ? 'bg-white hover:bg-gray-100 text-gray-700'
                  : 'invisible'
              }`}
            >
              {isExpanded ? (
                <ChevronDown className="w-5 h-5" />
              ) : (
                <ChevronRight className="w-5 h-5" />
              )}
            </button>

            {/* Department Icon */}
            <div
              className={`flex-shrink-0 p-2 rounded-lg ${
                level === 0
                  ? 'bg-blue-100 text-blue-600'
                  : level === 1
                  ? 'bg-purple-100 text-purple-600'
                  : 'bg-gray-100 text-gray-600'
              }`}
            >
              <Building2 className="w-5 h-5" />
            </div>

            {/* Department Info */}
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-3">
                <h3 className="font-semibold text-gray-900 text-lg">{dept.name}</h3>
                {hasPositions && (
                  <span className="px-3 py-1 text-xs font-medium bg-white text-blue-600 rounded-full border border-blue-200">
                    {t('positions.positionsCount', { count: positionsInDept.length })}
                  </span>
                )}
                {hasChildren && (
                  <span className="px-3 py-1 text-xs font-medium bg-white text-gray-600 rounded-full border border-gray-200">
                    {t('positions.childDepartments', { count: dept.children?.length || 0 })}
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* Positions List */}
          {isExpanded && hasPositions && (
            <div
              className="space-y-2 mb-4"
              style={{ marginLeft: `${(level + 1) * 1.5}rem` }}
            >
              {positionsInDept.map((pos, posIndex) => (
                <div
                  key={pos.id}
                  className="group flex items-center justify-between p-4 bg-white border border-gray-200 rounded-lg hover:border-blue-300 hover:shadow-md transition-all"
                >
                  <div className="flex items-center gap-4 flex-1 min-w-0">
                    <div className="flex-shrink-0 p-2 bg-blue-50 rounded-lg">
                      <Briefcase className="w-5 h-5 text-blue-600" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-gray-900 text-base mb-1">{pos.title}</p>
                      <div className="flex items-center gap-4 flex-wrap">
                        {pos.level && (
                          <span className="inline-flex items-center gap-1 text-xs text-gray-600 bg-gray-50 px-2 py-1 rounded">
                            <span className="font-medium">{t('positions.level')}:</span>
                            <span className="font-bold text-blue-600">{pos.level}</span>
                          </span>
                        )}
                        {pos.description && (
                          <span className="text-xs text-gray-500 truncate max-w-md">
                            {pos.description}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                  {canManage && (
                    <div className="flex items-center gap-2 ml-4 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button
                        onClick={() => openViewModal(pos.id)}
                        className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                        title={t('common.view')}
                      >
                        <Eye className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => openEditModal(pos.id)}
                        className="p-2 text-green-600 hover:bg-green-50 rounded-lg transition-colors"
                        title={t('common.edit')}
                      >
                        <Edit className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDelete(pos.id, pos.title)}
                        className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                        title={t('common.delete')}
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}

          {/* Children Departments */}
          {isExpanded && hasChildren && dept.children && (
            <div className="relative">
              {renderDepartmentTree(dept.children, level + 1, currentPath)}
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
        showNotification('success', t('positions.createSuccess'));
      } else if (modalMode === 'edit' && selectedPosition) {
        await positionService.update(selectedPosition.id, payload as UpdatePositionDto);
        showNotification('success', t('positions.updateSuccess'));
      }
      closeModal();
      if (viewMode === 'table') {
        fetchPositions();
      } else {
        fetchAllPositionsForTree();
        fetchDepartmentTree();
      }
    } catch (err: unknown) {
      const errorData = (err as { response?: { data?: { message?: string | string[] } } })?.response?.data;
      const message = errorData?.message || 'Có lỗi xảy ra, vui lòng thử lại';
      setFormError(Array.isArray(message) ? message.join(', ') : String(message));
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
              <h1 className="text-2xl font-bold text-gray-900">{t('positions.title')}</h1>
              <p className="text-sm text-gray-500">
                {t('positions.subtitle', { count: viewMode === 'table' ? total : allPositions.length })}
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
                  {t('positions.tableView')}
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
                  {t('positions.treeView')}
                </div>
              </button>
            </div>
            {canManage && (
              <button
                onClick={openCreateModal}
                className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                <Plus className="w-5 h-5" />
                {t('positions.addPosition')}
              </button>
            )}
          </div>
        </div>

        {/* Search and Filters */}
        <div className="flex items-center gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder={t('positions.searchPlaceholder')}
              value={search}
              onChange={(e) => handleSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
            />
          </div>
          <div className="w-64 relative">
            <button
              type="button"
              onClick={() => setIsDepartmentDropdownOpen(!isDepartmentDropdownOpen)}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none bg-white text-left flex items-center justify-between hover:border-gray-400 transition-colors"
            >
              <span className="text-gray-700 truncate">
                {selectedDepartmentId
                  ? departments.find((d) => d.id === selectedDepartmentId)?.name || t('positions.allDepartments')
                  : t('positions.allDepartments')}
              </span>
              <ChevronDown
                className={`w-4 h-4 text-gray-400 transition-transform flex-shrink-0 ${
                  isDepartmentDropdownOpen ? 'transform rotate-180' : ''
                }`}
              />
            </button>
            {isDepartmentDropdownOpen && (
              <>
                <div
                  className="fixed inset-0 z-10"
                  onClick={() => setIsDepartmentDropdownOpen(false)}
                ></div>
                <div className="absolute z-20 w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-lg max-h-64 overflow-y-auto">
                  <button
                    type="button"
                    onClick={() => {
                      handleDepartmentFilterChange('');
                      setIsDepartmentDropdownOpen(false);
                    }}
                    className={`w-full px-4 py-2.5 text-left hover:bg-gray-50 transition-colors ${
                      !selectedDepartmentId ? 'bg-blue-50 text-blue-600 font-medium' : 'text-gray-700'
                    }`}
                  >
                    {t('positions.allDepartments')}
                  </button>
                  {departments.map((dept) => (
                    <button
                      key={dept.id}
                      type="button"
                      onClick={() => {
                        handleDepartmentFilterChange(dept.id.toString());
                        setIsDepartmentDropdownOpen(false);
                      }}
                      className={`w-full px-4 py-2.5 text-left hover:bg-gray-50 transition-colors border-t border-gray-100 ${
                        selectedDepartmentId === dept.id
                          ? 'bg-blue-50 text-blue-600 font-medium'
                          : 'text-gray-700'
                      }`}
                    >
                      {dept.name}
                    </button>
                  ))}
                </div>
              </>
            )}
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
      {(loading || (viewMode === 'tree' && treeLoading)) ? (
        <div className="bg-white rounded-xl shadow-sm p-12">
          <div className="flex flex-col items-center justify-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mb-4"></div>
                  <p className="text-gray-600">{t('positions.loading')}</p>
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
                        {t('positions.positionName')}
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase">
                        {t('positions.department')}
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase">
                        {t('positions.level')}
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase">
                        {t('positions.description')}
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
                            {pos.department?.name || t('positions.notAssigned')}
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
                  <p className="text-gray-500 text-lg font-medium">{t('positions.noPositions')}</p>
                  <p className="text-gray-400 text-sm mt-1">
                    {search ? t('positions.noPositionsDesc') : t('positions.noPositionsEmpty')}
                  </p>
                </div>
              )}
            </div>
          ) : (
            /* Tree View */
            <div className="bg-white rounded-xl shadow-sm p-6">
              <div className="space-y-4 max-h-[calc(100vh-300px)] overflow-y-auto pr-2">
                {(() => {
                  const filteredTree = getFilteredDepartmentTree();
                  return filteredTree.length > 0 ? (
                    <>
                      {renderDepartmentTree(filteredTree)}
                      {!selectedDepartmentId && getPositionsWithoutDepartment().length > 0 && (
                      <div className="mt-8 pt-6 border-t-2 border-dashed border-gray-300">
                        <div className="flex items-center gap-3 p-4 mb-4 bg-gradient-to-r from-amber-50 to-orange-50 border-2 border-amber-200 rounded-xl">
                          <div className="p-2 bg-amber-100 rounded-lg">
                            <Briefcase className="w-5 h-5 text-amber-600" />
                          </div>
                          <div className="flex-1">
                            <h3 className="font-semibold text-gray-900 text-lg">{t('positions.unassignedPositions')}</h3>
                            <p className="text-xs text-gray-600 mt-1">
                              {t('positions.unassignedPositionsDesc')}
                            </p>
                          </div>
                          <span className="px-3 py-1 text-xs font-medium bg-white text-amber-600 rounded-full border border-amber-200">
                            {t('positions.positionsCount', { count: getPositionsWithoutDepartment().length })}
                          </span>
                        </div>
                        <div className="space-y-2">
                          {getPositionsWithoutDepartment().map(pos => (
                            <div
                              key={pos.id}
                              className="group flex items-center justify-between p-4 bg-white border border-gray-200 rounded-lg hover:border-amber-300 hover:shadow-md transition-all"
                            >
                              <div className="flex items-center gap-4 flex-1 min-w-0">
                                <div className="flex-shrink-0 p-2 bg-amber-50 rounded-lg">
                                  <Briefcase className="w-5 h-5 text-amber-600" />
                                </div>
                                <div className="flex-1 min-w-0">
                                  <p className="font-semibold text-gray-900 text-base mb-1">{pos.title}</p>
                                  <div className="flex items-center gap-4 flex-wrap">
                                    {pos.level && (
                                      <span className="inline-flex items-center gap-1 text-xs text-gray-600 bg-gray-50 px-2 py-1 rounded">
                                        <span className="font-medium">Cấp độ:</span>
                                        <span className="font-bold text-amber-600">{pos.level}</span>
                                      </span>
                                    )}
                                    {pos.description && (
                                      <span className="text-xs text-gray-500 truncate max-w-md">
                                        {pos.description}
                                      </span>
                                    )}
                                  </div>
                                </div>
                              </div>
                              {canManage && (
                                <div className="flex items-center gap-2 ml-4 opacity-0 group-hover:opacity-100 transition-opacity">
                                  <button
                                    onClick={() => openViewModal(pos.id)}
                                    className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                                    title={t('common.view')}
                                  >
                                    <Eye className="w-4 h-4" />
                                  </button>
                                  <button
                                    onClick={() => openEditModal(pos.id)}
                                    className="p-2 text-green-600 hover:bg-green-50 rounded-lg transition-colors"
                                    title={t('common.edit')}
                                  >
                                    <Edit className="w-4 h-4" />
                                  </button>
                                  <button
                                    onClick={() => handleDelete(pos.id, pos.title)}
                                    className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                                    title={t('common.delete')}
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
                    <p className="text-gray-500 text-lg font-medium">
                      {selectedDepartmentId
                        ? t('positions.noDepartmentData')
                        : t('positions.noData')}
                    </p>
                  </div>
                );
                })()}
              </div>
            </div>
          )}

          {/* Pagination - Only show in table view */}
          {viewMode === 'table' && totalPages > 1 && (
            <div className="bg-white rounded-xl shadow-sm p-4">
              <div className="flex items-center justify-between">
                <p className="text-sm text-gray-600">
                  {t('common.view')} <span className="font-semibold">{positions.length}</span> / {total} {t('positions.positionName').toLowerCase()}
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
                {modalMode === 'create' && t('positions.createTitle')}
                {modalMode === 'edit' && t('positions.editTitle')}
                {modalMode === 'view' && t('positions.viewTitle')}
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
                <DetailField label={t('positions.positionName')} value={selectedPosition.title} />
                <DetailField 
                  label={t('positions.department')} 
                  value={selectedPosition.department?.name || t('positions.notAssigned')} 
                />
                <DetailField label={t('positions.level')} value={selectedPosition.level?.toString() || 'N/A'} />
                <DetailField label={t('positions.description')} value={selectedPosition.description || 'N/A'} />
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
                  label={t('positions.positionName')}
                  value={formData.title}
                  onChange={(value) => handleFormChange('title', value)}
                  required
                  disabled={formSubmitting}
                />

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    {t('positions.department')}
                  </label>
                  <select
                    value={formData.department_id || ''}
                    onChange={(e) =>
                      handleFormChange('department_id', e.target.value ? Number(e.target.value) : undefined)
                    }
                    disabled={formSubmitting || optionsLoading}
                    className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none disabled:bg-gray-100"
                  >
                    <option value="">{t('positions.selectDepartment')}</option>
                    {departments.map((dept) => (
                      <option key={dept.id} value={dept.id}>
                        {dept.name}
                      </option>
                    ))}
                  </select>
                  <p className="text-xs text-gray-500 mt-1">
                    {t('positions.departmentOptional')}
                  </p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    {t('positions.levelLabel')}
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
                  <label className="block text-sm font-medium text-gray-700 mb-2">{t('positions.description')}</label>
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
                    {t('common.cancel')}
                  </button>
                  <button
                    type="submit"
                    disabled={formSubmitting}
                    className="px-6 py-2 rounded-lg bg-blue-600 text-white font-medium hover:bg-blue-700 transition-colors disabled:opacity-60 flex items-center gap-2"
                  >
                    {formSubmitting && <Loader2 className="w-4 h-4 animate-spin" />}
                    {modalMode === 'create' ? t('positions.create') : t('positions.save')}
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




