"use client";

import React, { useState } from 'react';
import { Users, Package, History, X, Calendar, User, FileText } from 'lucide-react';

interface Employee {
  id: number;
  code: string;
  name: string;
  department: string;
  position: string;
}

interface Asset {
  id: number;
  code: string;
  name: string;
  category: string;
  status: string;
}

interface Assignment {
  id: number;
  assetId: number;
  employeeId: number;
  assignDate: string;
  returnDate: string | null;
  status: 'Đang sử dụng' | 'Đã trả';
  note: string;
  assignedBy: string;
}

interface AssignForm {
  assetId: string;
  employeeId: string;
  assignDate: string;
  note: string;
  assignedBy: string;
}

const AssetAssignmentSystem = () => {
  const [employees] = useState<Employee[]>([
    { id: 1, code: 'NV001', name: 'Nguyễn Văn A', department: 'IT', position: 'Lập trình viên' },
    { id: 2, code: 'NV002', name: 'Trần Thị B', department: 'Kế toán', position: 'Kế toán viên' },
    { id: 3, code: 'NV003', name: 'Lê Văn C', department: 'Nhân sự', position: 'Chuyên viên' },
    { id: 4, code: 'NV004', name: 'Phạm Thị D', department: 'IT', position: 'Tester' },
    { id: 5, code: 'NV005', name: 'Hoàng Văn E', department: 'Marketing', position: 'Marketing Manager' },
  ]);

  const [assets] = useState<Asset[]>([
    { id: 1, code: 'MT001', name: 'Laptop Dell XPS 15', category: 'Máy tính', status: 'Đang sử dụng' },
    { id: 2, code: 'BG001', name: 'Bàn làm việc gỗ', category: 'Bàn ghế', status: 'Mới' },
    { id: 3, code: 'TB001', name: 'Máy in HP LaserJet', category: 'Thiết bị văn phòng', status: 'Đang sử dụng' },
    { id: 4, code: 'DT001', name: 'iPhone 15 Pro', category: 'Điện thoại', status: 'Mới' },
    { id: 5, code: 'MT002', name: 'MacBook Pro M3', category: 'Máy tính', status: 'Mới' },
    { id: 6, code: 'TB002', name: 'Màn hình Dell 27 inch', category: 'Thiết bị văn phòng', status: 'Mới' },
  ]);

  const [assignments, setAssignments] = useState<Assignment[]>([
    {
      id: 1,
      assetId: 1,
      employeeId: 1,
      assignDate: '2024-01-15',
      returnDate: null,
      status: 'Đang sử dụng',
      note: 'Laptop cho dự án mới',
      assignedBy: 'Admin'
    },
    {
      id: 2,
      assetId: 3,
      employeeId: 2,
      assignDate: '2024-02-20',
      returnDate: '2024-05-20',
      status: 'Đã trả',
      note: 'Sử dụng tạm thời',
      assignedBy: 'Admin'
    },
    {
      id: 3,
      assetId: 4,
      employeeId: 4,
      assignDate: '2024-03-10',
      returnDate: null,
      status: 'Đang sử dụng',
      note: 'Điện thoại công ty',
      assignedBy: 'Admin'
    },
  ]);

  const [currentView, setCurrentView] = useState<'list' | 'history'>('list');
  const [showAssignModal, setShowAssignModal] = useState(false);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [selectedAssignment, setSelectedAssignment] = useState<Assignment | null>(null);
  
  const [assignForm, setAssignForm] = useState<AssignForm>({
    assetId: '',
    employeeId: '',
    assignDate: new Date().toISOString().split('T')[0],
    note: '',
    assignedBy: 'Admin'
  });

  const [filterEmployee, setFilterEmployee] = useState('');
  const [filterStatus, setFilterStatus] = useState('');

  const getEmployeeName = (employeeId: number): string => {
    const employee = employees.find((e) => e.id === employeeId);
    return employee ? employee.name : '';
  };

  const getAssetName = (assetId: number): string => {
    const asset = assets.find((a) => a.id === assetId);
    return asset ? asset.name : '';
  };

  const getAssetCode = (assetId: number): string => {
    const asset = assets.find((a) => a.id === assetId);
    return asset ? asset.code : '';
  };

  const getEmployee = (employeeId: number): Employee | undefined => {
    return employees.find((e) => e.id === employeeId);
  };

  const getAsset = (assetId: number): Asset | undefined => {
    return assets.find((a) => a.id === assetId);
  };

  const handleAssignAsset = () => {
    if (!assignForm.assetId || !assignForm.employeeId) {
      alert('Vui lòng chọn đầy đủ tài sản và nhân viên!');
      return;
    }

    const newAssignment: Assignment = {
      id: Date.now(),
      assetId: parseInt(assignForm.assetId),
      employeeId: parseInt(assignForm.employeeId),
      assignDate: assignForm.assignDate,
      returnDate: null,
      status: 'Đang sử dụng',
      note: assignForm.note,
      assignedBy: assignForm.assignedBy
    };

    setAssignments([...assignments, newAssignment]);
    setShowAssignModal(false);
    setAssignForm({
      assetId: '',
      employeeId: '',
      assignDate: new Date().toISOString().split('T')[0],
      note: '',
      assignedBy: 'Admin'
    });
    alert('Phân công tài sản thành công!');
  };

  const handleReturnAsset = (assignmentId: number) => {
    if (window.confirm('Xác nhận thu hồi tài sản này?')) {
      setAssignments(assignments.map((a) => 
        a.id === assignmentId 
          ? { ...a, returnDate: new Date().toISOString().split('T')[0], status: 'Đã trả' as const }
          : a
      ));
      alert('Thu hồi tài sản thành công!');
    }
  };

  const viewDetail = (assignment: Assignment) => {
    setSelectedAssignment(assignment);
    setShowDetailModal(true);
  };

  const filteredAssignments = assignments.filter((a) => {
    const matchesEmployee = !filterEmployee || a.employeeId === parseInt(filterEmployee);
    const matchesStatus = !filterStatus || a.status === filterStatus;
    return matchesEmployee && matchesStatus;
  });

  const availableAssets = assets.filter((asset) => {
    return !assignments.some((a) => a.assetId === asset.id && a.status === 'Đang sử dụng');
  });

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold text-gray-800">Quản lý Phân công Tài sản</h1>
              <p className="text-gray-600 mt-1">Phân công và theo dõi tài sản cho nhân viên</p>
            </div>
            <button
              onClick={() => setShowAssignModal(true)}
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
            >
              <Package size={20} />
              Phân công mới
            </button>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm p-4 mb-6">
          <div className="flex gap-2">
            <button
              onClick={() => setCurrentView('list')}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg transition ${
                currentView === 'list'
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              <Users size={20} />
              Danh sách phân công
            </button>
            <button
              onClick={() => setCurrentView('history')}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg transition ${
                currentView === 'history'
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              <History size={20} />
              Lịch sử phân công
            </button>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Nhân viên</label>
              <select
                value={filterEmployee}
                onChange={(e) => setFilterEmployee(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="">Tất cả nhân viên</option>
                {employees.map((emp) => (
                  <option key={emp.id} value={emp.id}>{emp.name} - {emp.code}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Trạng thái</label>
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="">Tất cả trạng thái</option>
                <option value="Đang sử dụng">Đang sử dụng</option>
                <option value="Đã trả">Đã trả</option>
              </select>
            </div>
          </div>
        </div>

        {currentView === 'list' && (
          <div className="bg-white rounded-lg shadow-sm overflow-hidden">
            <div className="p-4 bg-gray-50 border-b">
              <h2 className="text-lg font-semibold text-gray-800">Tài sản đang được phân công</h2>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Mã TS</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Tên tài sản</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Nhân viên</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Ngày phân công</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Trạng thái</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Thao tác</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {filteredAssignments.filter((a) => a.status === 'Đang sử dụng').map((assignment) => (
                    <tr key={assignment.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        {getAssetCode(assignment.assetId)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {getAssetName(assignment.assetId)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {getEmployeeName(assignment.employeeId)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                        {assignment.assignDate}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="px-2 py-1 text-xs font-semibold rounded-full bg-green-100 text-green-800">
                          {assignment.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm">
                        <div className="flex gap-2">
                          <button
                            onClick={() => viewDetail(assignment)}
                            className="text-blue-600 hover:text-blue-800"
                            title="Xem chi tiết"
                          >
                            <FileText size={18} />
                          </button>
                          <button
                            onClick={() => handleReturnAsset(assignment.id)}
                            className="px-3 py-1 bg-orange-500 text-white rounded hover:bg-orange-600 text-xs"
                          >
                            Thu hồi
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {filteredAssignments.filter((a) => a.status === 'Đang sử dụng').length === 0 && (
                <div className="text-center py-8 text-gray-500">
                  Không có tài sản nào đang được phân công
                </div>
              )}
            </div>
          </div>
        )}

        {currentView === 'history' && (
          <div className="bg-white rounded-lg shadow-sm overflow-hidden">
            <div className="p-4 bg-gray-50 border-b">
              <h2 className="text-lg font-semibold text-gray-800">Lịch sử phân công tài sản</h2>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Mã TS</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Tên tài sản</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Nhân viên</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Ngày phân công</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Ngày trả</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Trạng thái</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Chi tiết</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {filteredAssignments.map((assignment) => (
                    <tr key={assignment.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        {getAssetCode(assignment.assetId)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {getAssetName(assignment.assetId)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {getEmployeeName(assignment.employeeId)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                        {assignment.assignDate}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                        {assignment.returnDate || '-'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-2 py-1 text-xs font-semibold rounded-full ${
                          assignment.status === 'Đang sử dụng' 
                            ? 'bg-green-100 text-green-800' 
                            : 'bg-gray-100 text-gray-800'
                        }`}>
                          {assignment.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm">
                        <button
                          onClick={() => viewDetail(assignment)}
                          className="text-blue-600 hover:text-blue-800"
                          title="Xem chi tiết"
                        >
                          <FileText size={18} />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {filteredAssignments.length === 0 && (
                <div className="text-center py-8 text-gray-500">
                  Không có lịch sử phân công
                </div>
              )}
            </div>
          </div>
        )}

        {showAssignModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg p-6 w-full max-w-md">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-bold">Phân công Tài sản</h2>
                <button onClick={() => setShowAssignModal(false)} className="text-gray-500 hover:text-gray-700">
                  <X size={24} />
                </button>
              </div>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Tài sản *</label>
                  <select
                    value={assignForm.assetId}
                    onChange={(e) => setAssignForm({...assignForm, assetId: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="">Chọn tài sản</option>
                    {availableAssets.map((asset) => (
                      <option key={asset.id} value={asset.id}>
                        {asset.code} - {asset.name}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Nhân viên *</label>
                  <select
                    value={assignForm.employeeId}
                    onChange={(e) => setAssignForm({...assignForm, employeeId: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="">Chọn nhân viên</option>
                    {employees.map((emp) => (
                      <option key={emp.id} value={emp.id}>
                        {emp.code} - {emp.name} ({emp.department})
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Ngày phân công *</label>
                  <input
                    type="date"
                    value={assignForm.assignDate}
                    onChange={(e) => setAssignForm({...assignForm, assignDate: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Ghi chú</label>
                  <textarea
                    value={assignForm.note}
                    onChange={(e) => setAssignForm({...assignForm, note: e.target.value})}
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Ghi chú về việc phân công..."
                  />
                </div>
              </div>
              <div className="flex gap-3 mt-6">
                <button
                  onClick={handleAssignAsset}
                  className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
                >
                  Phân công
                </button>
                <button
                  onClick={() => setShowAssignModal(false)}
                  className="flex-1 px-4 py-2 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400 transition"
                >
                  Hủy
                </button>
              </div>
            </div>
          </div>
        )}

        {showDetailModal && selectedAssignment && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg p-6 w-full max-w-2xl max-h-screen overflow-y-auto">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-bold">Chi tiết Phân công</h2>
                <button onClick={() => setShowDetailModal(false)} className="text-gray-500 hover:text-gray-700">
                  <X size={24} />
                </button>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-gray-50 p-4 rounded-lg">
                  <h3 className="font-semibold text-gray-700 mb-3 flex items-center gap-2">
                    <Package size={18} />
                    Thông tin Tài sản
                  </h3>
                  <div className="space-y-2 text-sm">
                    <div>
                      <span className="text-gray-600">Mã tài sản:</span>
                      <span className="ml-2 font-medium">{getAssetCode(selectedAssignment.assetId)}</span>
                    </div>
                    <div>
                      <span className="text-gray-600">Tên tài sản:</span>
                      <span className="ml-2 font-medium">{getAssetName(selectedAssignment.assetId)}</span>
                    </div>
                    <div>
                      <span className="text-gray-600">Loại:</span>
                      <span className="ml-2 font-medium">{getAsset(selectedAssignment.assetId)?.category}</span>
                    </div>
                  </div>
                </div>

                <div className="bg-gray-50 p-4 rounded-lg">
                  <h3 className="font-semibold text-gray-700 mb-3 flex items-center gap-2">
                    <User size={18} />
                    Thông tin Nhân viên
                  </h3>
                  <div className="space-y-2 text-sm">
                    <div>
                      <span className="text-gray-600">Mã NV:</span>
                      <span className="ml-2 font-medium">{getEmployee(selectedAssignment.employeeId)?.code}</span>
                    </div>
                    <div>
                      <span className="text-gray-600">Họ tên:</span>
                      <span className="ml-2 font-medium">{getEmployeeName(selectedAssignment.employeeId)}</span>
                    </div>
                    <div>
                      <span className="text-gray-600">Phòng ban:</span>
                      <span className="ml-2 font-medium">{getEmployee(selectedAssignment.employeeId)?.department}</span>
                    </div>
                    <div>
                      <span className="text-gray-600">Chức vụ:</span>
                      <span className="ml-2 font-medium">{getEmployee(selectedAssignment.employeeId)?.position}</span>
                    </div>
                  </div>
                </div>

                <div className="col-span-1 md:col-span-2 bg-gray-50 p-4 rounded-lg">
                  <h3 className="font-semibold text-gray-700 mb-3 flex items-center gap-2">
                    <Calendar size={18} />
                    Thông tin Phân công
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="text-gray-600">Ngày phân công:</span>
                      <span className="ml-2 font-medium">{selectedAssignment.assignDate}</span>
                    </div>
                    <div>
                      <span className="text-gray-600">Ngày trả:</span>
                      <span className="ml-2 font-medium">{selectedAssignment.returnDate || 'Chưa trả'}</span>
                    </div>
                    <div>
                      <span className="text-gray-600">Người phân công:</span>
                      <span className="ml-2 font-medium">{selectedAssignment.assignedBy}</span>
                    </div>
                    <div>
                      <span className="text-gray-600">Trạng thái:</span>
                      <span className={`ml-2 px-2 py-1 text-xs font-semibold rounded-full ${
                        selectedAssignment.status === 'Đang sử dụng' 
                          ? 'bg-green-100 text-green-800' 
                          : 'bg-gray-100 text-gray-800'
                      }`}>
                        {selectedAssignment.status}
                      </span>
                    </div>
                    {selectedAssignment.note && (
                      <div className="col-span-1 md:col-span-2">
                        <span className="text-gray-600">Ghi chú:</span>
                        <p className="ml-2 mt-1 text-gray-800">{selectedAssignment.note}</p>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              <div className="mt-6">
                <button
                  onClick={() => setShowDetailModal(false)}
                  className="w-full px-4 py-2 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400 transition"
                >
                  Đóng
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AssetAssignmentSystem;