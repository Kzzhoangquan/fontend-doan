// src/app/dashboard/hr/asset-assignment/page.tsx
'use client';

import { useState, useEffect } from 'react';
import { Users, Package, History, FileText, Search, AlertCircle } from 'lucide-react';
import {
  assignmentService,
  Assignment,
  AssignmentStatus,
  Employee,
} from '@/lib/api/services/assignment.service';
import { Asset } from '@/lib/api/services/asset.service';
import { employeeService } from '@/lib/api/services/employee.service';
import { departmentService, Department } from '@/lib/api/services/department.service'; // ← IMPORT MỚI
import { useAuth } from '@/hooks/useAuth';
import { UserRole } from '@/lib/constants/roles';

import Modal from '@/components/ui/Modal';
import Button from '@/components/ui/Button';

const STATUS_MAP: Record<AssignmentStatus, { label: string; color: string }> = {
  ASSIGNED: { label: 'Đang sử dụng', color: 'bg-green-100 text-green-800' },
  RETURNED: { label: 'Đã trả', color: 'bg-gray-100 text-gray-800' },
};

export default function AssetAssignmentPage() {
  const { user, hasRole } = useAuth();
  const canManage = hasRole(UserRole.MANAGER);

  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [departments, setDepartments] = useState<Department[]>([]); // ← STATE MỚI
  const [availableAssets, setAvailableAssets] = useState<Asset[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const [currentView, setCurrentView] = useState<'list' | 'history'>('list');
  const [showAssignModal, setShowAssignModal] = useState(false);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [showReturnModal, setShowReturnModal] = useState(false);
  const [selectedAssignment, setSelectedAssignment] = useState<Assignment | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const [assignForm, setAssignForm] = useState({
    asset_id: 0,
    employee_id: 0,
    assignment_date: new Date().toISOString().split('T')[0],
    note: '',
  });

  const [returnForm, setReturnForm] = useState({
    return_date: new Date().toISOString().split('T')[0],
    return_reason: '',
    condition_on_return: '',
  });

  const [searchTerm, setSearchTerm] = useState('');
  const [filterDepartment, setFilterDepartment] = useState(''); // ← THAY ĐỔI TỪ filterEmployee
  const [filterStatus, setFilterStatus] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(0);

  // === FETCH DATA ===
  useEffect(() => { 
    fetchEmployees(); 
    fetchDepartments(); // ← FETCH DEPARTMENTS
  }, []);

  useEffect(() => {
    const timeoutId = setTimeout(() => fetchAssignments(), 300);
    return () => clearTimeout(timeoutId);
  }, [currentPage, searchTerm, filterDepartment, filterStatus]); // ← CẬP NHẬT DEPENDENCY

  const fetchEmployees = async () => {
    try {
      const data = await employeeService.getAll({ page: 1, pageSize: 1000 });
      setEmployees(data.data);
    } catch (err) { console.error(err); }
  };

  const fetchDepartments = async () => {
    try {
      const data = await departmentService.getAll({ page: 1, pageSize: 1000 });
      setDepartments(data.data);
    } catch (err) { console.error(err); }
  };

  const fetchAvailableAssets = async () => {
    try {
      const data = await assignmentService.getAvailableAssets(1, 1000);
      setAvailableAssets(data.data || []);
    } catch (err) { console.error(err); }
  };

  const fetchAssignments = async () => {
    setLoading(true); setError('');
    try {
      const data = await assignmentService.getAll({
        page: currentPage,
        pageSize: itemsPerPage,
        search: searchTerm.trim(),
        departmentId: filterDepartment ? parseInt(filterDepartment) : undefined, // ← SỬ DỤNG departmentId
        status: filterStatus ? (filterStatus as AssignmentStatus) : undefined,
      });
      setAssignments(data.data);
      setTotal(data.total);
      setTotalPages(data.totalPages);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Không thể tải danh sách phân công');
    } finally {
      setLoading(false);
    }
  };

  // === PHÂN CÔNG MỚI ===
  const handleAddAssignment = () => {
    fetchAvailableAssets();
    setAssignForm({
      asset_id: 0,
      employee_id: 0,
      assignment_date: new Date().toISOString().split('T')[0],
      note: '',
    });
    setShowAssignModal(true);
  };

  const handleAssignAsset = async () => {
    if (!assignForm.asset_id || !assignForm.employee_id) {
      alert('Vui lòng chọn đầy đủ tài sản và nhân viên!');
      return;
    }
    setSubmitting(true);
    try {
      await assignmentService.create(assignForm, user?.id);
      alert('Phân công tài sản thành công!');
      setShowAssignModal(false);
      fetchAssignments();
    } catch (err: any) {
      alert(err.response?.data?.message || 'Không thể phân công tài sản');
    } finally {
      setSubmitting(false);
    }
  };

  // === THU HỒI ===
  const openReturnModal = (assignment: Assignment) => {
    setSelectedAssignment(assignment);
    setReturnForm({
      return_date: new Date().toISOString().split('T')[0],
      return_reason: '',
      condition_on_return: '',
    });
    setShowReturnModal(true);
  };

  const handleReturnAsset = async () => {
    if (!selectedAssignment) return;
    setSubmitting(true);
    try {
      await assignmentService.returnAssignment(selectedAssignment.id, returnForm, user?.id);
      alert('Thu hồi tài sản thành công!');
      setShowReturnModal(false);
      fetchAssignments();
    } catch (err: any) {
      alert(err.response?.data?.message || 'Không thể thu hồi tài sản');
    } finally {
      setSubmitting(false);
    }
  };

  const viewDetail = (assignment: Assignment) => {
    setSelectedAssignment(assignment);
    setShowDetailModal(true);
  };

  const filteredForView = currentView === 'list'
    ? assignments.filter(a => a.status === 'ASSIGNED')
    : assignments;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-lg shadow-sm p-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Quản lý Phân công Tài sản</h1>
            <p className="text-gray-600 mt-1">Phân công và theo dõi tài sản cho nhân viên</p>
          </div>
          {canManage && (
            <Button onClick={handleAddAssignment} icon={<Package className="w-5 h-5" />}>
              Phân công mới
            </Button>
          )}
        </div>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-xl p-4">
          <p className="text-red-600 text-sm font-medium">{error}</p>
        </div>
      )}

      {/* Tabs */}
      <div className="bg-white rounded-lg shadow-sm p-4">
        <div className="flex gap-3">
          <button
            onClick={() => setCurrentView('list')}
            className={`flex items-center gap-2 px-5 py-3 rounded-lg font-semibold transition ${currentView === 'list' ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}
          >
            <Users size={20} /> Danh sách phân công
          </button>
          <button
            onClick={() => setCurrentView('history')}
            className={`flex items-center gap-2 px-5 py-3 rounded-lg font-semibold transition ${currentView === 'history' ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}
          >
            <History size={20} /> Lịch sử phân công
          </button>
        </div>
      </div>

      {/* ✅ FILTERS – ĐÃ THAY ĐỔI: PHÒNG BAN THAY VÌ NHÂN VIÊN */}
      <div className="bg-white rounded-lg shadow-sm p-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
            <input
              type="text"
              placeholder="Tìm theo tên NV, mã/tên TS..."
              value={searchTerm}
              onChange={(e) => { setSearchTerm(e.target.value); setCurrentPage(1); }}
              className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none font-semibold text-gray-900 placeholder-gray-500"
            />
          </div>
          
          {/* ✅ DROPDOWN LỌC THEO PHÒNG BAN */}
          <select
            value={filterDepartment}
            onChange={(e) => { setFilterDepartment(e.target.value); setCurrentPage(1); }}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none font-semibold text-gray-900"
          >
            <option value="">Tất cả phòng ban</option>
            {departments.map(dept => (
              <option key={dept.id} value={dept.id}>
                {dept.name}
              </option>
            ))}
          </select>

          <select
            value={filterStatus}
            onChange={(e) => { setFilterStatus(e.target.value); setCurrentPage(1); }}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none font-semibold text-gray-900"
          >
            <option value="">Tất cả trạng thái</option>
            <option value="ASSIGNED">Đang sử dụng</option>
            <option value="RETURNED">Đã trả</option>
          </select>
        </div>
      </div>

      {/* Table */}
      {loading ? (
        <div className="bg-white rounded-lg shadow-sm p-16 text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-4 border-blue-600 mx-auto mb-4" />
          <p className="text-lg font-semibold text-gray-700">Đang tải dữ liệu...</p>
        </div>
      ) : (
        <>
          <div className="bg-white rounded-lg shadow-sm overflow-hidden">
            <div className="p-5 bg-gray-50 border-b">
              <h2 className="text-xl font-bold text-gray-900">
                {currentView === 'list' ? 'Tài sản đang được phân công' : 'Lịch sử phân công tài sản'}
              </h2>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b-2 border-gray-200">
                  <tr>
                    <th className="px-6 py-4 text-left text-sm font-bold text-gray-700 uppercase">Mã TS</th>
                    <th className="px-6 py-4 text-left text-sm font-bold text-gray-700 uppercase">Tên tài sản</th>
                    <th className="px-6 py-4 text-left text-sm font-bold text-gray-700 uppercase">Nhân viên</th>
                    <th className="px-6 py-4 text-left text-sm font-bold text-gray-700 uppercase">Phòng ban</th> {/* ← THÊM CỘT MỚI */}
                    <th className="px-6 py-4 text-left text-sm font-bold text-gray-700 uppercase">Ngày phân công</th>
                    {currentView === 'history' && <th className="px-6 py-4 text-left text-sm font-bold text-gray-700 uppercase">Ngày trả</th>}
                    <th className="px-6 py-4 text-left text-sm font-bold text-gray-700 uppercase">Trạng thái</th>
                    <th className="px-6 py-4 text-left text-sm font-bold text-gray-700 uppercase">Thao tác</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {filteredForView.length === 0 ? (
                    <tr>
                      <td colSpan={currentView === 'history' ? 8 : 7} className="px-6 py-24 text-center">
                        <Package className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                        <p className="text-lg font-semibold text-gray-600">
                          {currentView === 'list' ? 'Không có tài sản nào đang được phân công' : 'Không có lịch sử phân công'}
                        </p>
                      </td>
                    </tr>
                  ) : (
                    filteredForView.map(assignment => (
                      <tr key={assignment.id} className="hover:bg-gray-50 transition">
                        <td className="px-6 py-4 font-bold text-gray-900">{assignment.asset.asset_code}</td>
                        <td className="px-6 py-4 font-semibold text-gray-900">{assignment.asset.asset_name}</td>
                        <td className="px-6 py-4 font-semibold text-gray-900">{assignment.employee.full_name}</td>
                        <td className="px-6 py-4 text-gray-700 font-medium">
                          {(() => {
                            const currentPositions = assignment.employee.employee_positions?.filter(ep => ep.is_current) || [];
                            const primaryPosition = currentPositions[0];
                            return primaryPosition?.department?.name || (assignment.employee as any).department_relation?.name || 'Chưa xác định';
                          })()}
                        </td>
                        <td className="px-6 py-4 text-gray-700">{assignment.assignment_date}</td>
                        {currentView === 'history' && (
                          <td className="px-6 py-4 text-gray-700">{assignment.return_date || '-'}</td>
                        )}
                        <td className="px-6 py-4">
                          <span className={`px-3 py-1.5 text-sm font-bold rounded-full ${STATUS_MAP[assignment.status].color}`}>
                            {STATUS_MAP[assignment.status].label}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-3">
                            <button onClick={() => viewDetail(assignment)} className="text-blue-600 hover:text-blue-800 transition">
                              <FileText size={20} />
                            </button>
                            {canManage && assignment.status === 'ASSIGNED' && (
                              <button
                                onClick={() => openReturnModal(assignment)}
                                className="px-4 py-2 bg-red-600 text-white text-sm font-bold rounded-lg hover:bg-red-700 transition"
                              >
                                Thu hồi
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="bg-white rounded-lg shadow-sm p-5">
              <div className="flex justify-between items-center">
                <p className="font-semibold text-gray-700">Hiển thị 10 / {total} bản ghi</p>
                <div className="flex gap-3">
                  <button onClick={() => setCurrentPage(p => Math.max(1, p - 1))} disabled={currentPage === 1}
                    className="px-5 py-2.5 border-2 border-gray-300 rounded-lg font-bold hover:bg-gray-50 disabled:opacity-50">
                    Trước
                  </button>
                  <span className="px-5 py-2.5 font-bold">Trang {currentPage} / {totalPages}</span>
                  <button onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))} disabled={currentPage === totalPages}
                    className="px-5 py-2.5 border-2 border-gray-300 rounded-lg font-bold hover:bg-gray-50 disabled:opacity-50">
                    Sau
                  </button>
                </div>
              </div>
            </div>
          )}
        </>
      )}

     {/* MODAL PHÂN CÔNG */}
      <Modal isOpen={showAssignModal} onClose={() => setShowAssignModal(false)} title="Phân công Tài sản" size="md">
        <div className="space-y-4 text-gray-700">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Tài sản *</label>
            <select
              value={assignForm.asset_id}
              onChange={e => setAssignForm({ ...assignForm, asset_id: parseInt(e.target.value) })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
            >
              <option value={0}>Chọn tài sản</option>
              {availableAssets.map(asset => (
                <option key={asset.id} value={asset.id}>
                  {asset.asset_code} - {asset.asset_name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Nhân viên *</label>
            <select
              value={assignForm.employee_id}
              onChange={e => setAssignForm({ ...assignForm, employee_id: parseInt(e.target.value) })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
            >
              <option value={0}>Chọn nhân viên</option>
              {employees.map(emp => {
                const currentPositions = emp.employee_positions?.filter(ep => ep.is_current) || [];
                const primaryPosition = currentPositions[0];
                const deptName = primaryPosition?.department?.name || (emp as any).department_relation?.name || 'N/A';
                return (
                  <option key={emp.id} value={emp.id}>
                    {emp.employee_code} - {emp.full_name} ({deptName})
                  </option>
                );
              })}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Ngày phân công *</label>
            <input
              type="date"
              value={assignForm.assignment_date}
              onChange={e => setAssignForm({ ...assignForm, assignment_date: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Ghi chú</label>
            <textarea
              value={assignForm.note}
              onChange={e => setAssignForm({ ...assignForm, note: e.target.value })}
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
              placeholder="Ghi chú về việc phân công..."
            />
          </div>
        </div>

        <div className="flex gap-3 mt-6">
          <Button onClick={handleAssignAsset} className="flex-1" disabled={submitting}>
            {submitting ? 'Đang xử lý...' : 'Phân công'}
          </Button>
          <Button variant="secondary" onClick={() => setShowAssignModal(false)} className="flex-1">
            Hủy
          </Button>
        </div>
      </Modal>

      {/* MODAL CHI TIẾT */}
      <Modal isOpen={showDetailModal} onClose={() => setShowDetailModal(false)} title="Chi tiết Phân công" size="lg">
        {selectedAssignment && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="bg-gradient-to-br from-blue-50 to-blue-100 p-6 rounded-2xl">
              <h3 className="text-xl font-bold text-blue-900 mb-5 flex items-center gap-3">
                <Package size={24} /> Thông tin Tài sản
              </h3>
              <div className="space-y-4 text-lg">
                <div className="flex justify-between"><span className="font-bold text-gray-700">Mã tài sản:</span> <span className="font-black text-gray-900">{selectedAssignment.asset.asset_code}</span></div>
                <div className="flex justify-between"><span className="font-bold text-gray-700">Tên tài sản:</span> <span className="font-black text-gray-900">{selectedAssignment.asset.asset_name}</span></div>
                <div className="flex justify-between"><span className="font-bold text-gray-700">Loại:</span> <span className="font-black text-gray-900">{selectedAssignment.asset.category?.category_name || 'Chưa xác định'}</span></div>
              </div>
            </div>

            <div className="bg-gradient-to-br from-green-50 to-green-100 p-6 rounded-2xl">
              <h3 className="text-xl font-bold text-green-900 mb-5 flex items-center gap-3">
                <Users size={24} /> Thông tin Nhân viên
              </h3>
              <div className="space-y-4 text-lg">
                <div className="flex justify-between"><span className="font-bold text-gray-700">Mã NV:</span> <span className="font-black text-gray-900">{selectedAssignment.employee.employee_code}</span></div>
                <div className="flex justify-between"><span className="font-bold text-gray-700">Họ tên:</span> <span className="font-black text-gray-900">{selectedAssignment.employee.full_name}</span></div>
                <div className="flex justify-between"><span className="font-bold text-gray-700">Phòng ban:</span> <span className="font-black text-gray-900">
                  {(() => {
                    const currentPositions = selectedAssignment.employee.employee_positions?.filter(ep => ep.is_current) || [];
                    const primaryPosition = currentPositions[0];
                    return primaryPosition?.department?.name || (selectedAssignment.employee as any).department_relation?.name || 'N/A';
                  })()}
                </span></div>
                <div className="flex justify-between"><span className="font-bold text-gray-700">Chức vụ:</span> <span className="font-black text-gray-900">
                  {(() => {
                    const currentPositions = selectedAssignment.employee.employee_positions?.filter(ep => ep.is_current) || [];
                    const primaryPosition = currentPositions[0];
                    return primaryPosition?.position?.title || 'N/A';
                  })()}
                </span></div>
              </div>
            </div>

            <div className="col-span-2 bg-gradient-to-r from-purple-50 to-pink-50 p-6 rounded-2xl">
              <h3 className="text-xl font-bold text-purple-900 mb-5 flex items-center gap-3">
                <History size={24} /> Thông tin Phân công
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-lg">
                <div><span className="font-bold text-gray-700">Ngày phân công:</span> <span className="font-black text-gray-900">{selectedAssignment.assignment_date}</span></div>
                <div><span className="font-bold text-gray-700">Ngày trả:</span> <span className="font-black text-gray-900">{selectedAssignment.return_date || 'Chưa trả'}</span></div>
                <div><span className="font-bold text-gray-700">Người phân công:</span> <span className="font-black text-gray-900">{selectedAssignment.assigned_by?.full_name || 'N/A'}</span></div>
                <div><span className="font-bold text-gray-700">Trạng thái:</span>
                  <span className={`ml-3 px-4 py-2 rounded-full font-bold ${STATUS_MAP[selectedAssignment.status].color}`}>
                    {STATUS_MAP[selectedAssignment.status].label}
                  </span>
                </div>
                {selectedAssignment.note && (
                  <div className="md:col-span-2">
                    <span className="font-bold text-gray-700">Ghi chú:</span>
                    <p className="mt-2 text-gray-900 font-medium bg-white p-4 rounded-lg shadow-inner">{selectedAssignment.note}</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
        <div className="mt-8">
          <Button variant="secondary" onClick={() => setShowDetailModal(false)} className="w-full text-xl font-bold py-4">
            Đóng
          </Button>
        </div>
      </Modal>

      {/* MODAL XÁC NHẬN THU HỒI */}
      <Modal isOpen={showReturnModal} onClose={() => setShowReturnModal(false)} title="Xác nhận Thu hồi Tài sản" size="md">
        {selectedAssignment && (
          <div className="text-center py-6">
            <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <AlertCircle size={44} className="text-red-600" />
            </div>
            <h3 className="text-2xl font-bold text-gray-900 mb-4">
              Bạn có chắc chắn muốn thu hồi?
            </h3>
            <div className="bg-gray-50 p-5 rounded-xl mb-6 text-left">
              <p className="font-bold text-lg text-gray-900">{selectedAssignment.asset.asset_name}</p>
              <p className="text-gray-700">Mã: <span className="font-bold">{selectedAssignment.asset.asset_code}</span></p>
              <p className="text-gray-700">Đang sử dụng bởi: <span className="font-bold">{selectedAssignment.employee.full_name}</span></p>
            </div>
            <div className="flex gap-4">
              <Button onClick={handleReturnAsset} className="flex-1 bg-red-600 hover:bg-red-700 text-white font-bold text-lg py-4" disabled={submitting}>
                {submitting ? 'Đang thu hồi...' : 'Xác nhận thu hồi'}
              </Button>
              <Button variant="secondary" onClick={() => setShowReturnModal(false)} className="flex-1 font-bold text-lg py-4">
                Hủy bỏ
              </Button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}