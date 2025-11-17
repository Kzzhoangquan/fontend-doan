"use client";

import React, { useState } from 'react';
import { CheckCircle, XCircle, Eye, Search, Clock, AlertTriangle, X } from 'lucide-react';

interface ManagerRequest {
  id: number;
  requesterName: string;
  requesterCode: string;
  requesterDepartment: string;
  requestType: 'PURCHASE' | 'REPAIR' | 'MAINTENANCE';
  assetNameSuggest?: string;
  categoryName?: string;
  assetId?: number;
  assetCode?: string;
  assetName?: string;
  quantity?: number;
  reason: string;
  requestDate: string;
  neededDate: string;
  priority: 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT';
  status: 'PENDING' | 'APPROVED' | 'REJECTED' | 'IN_PROGRESS' | 'COMPLETED';
  estimatedCost?: number;
  imageUrl?: string;
  approvalDate?: string | null;
  approverName?: string | null;
  approvalNote?: string;
  rejectionReason?: string;
  startDate?: string;
  completionDate?: string;
  actualCost?: number;
  resultNote?: string;
}

interface ApprovalForm {
  approvalNote: string;
  rejectionReason: string;
  estimatedCost: string;
  supplierId: string;
  startDate: string;
}

const ManagerRequestSystem: React.FC = () => {
  const [currentView, setCurrentView] = useState<'pending-requests' | 'all-requests'>('pending-requests');
  const [selectedRequest, setSelectedRequest] = useState<ManagerRequest | null>(null);
  const [showDetailModal, setShowDetailModal] = useState<boolean>(false);
  const [showApprovalModal, setShowApprovalModal] = useState<boolean>(false);
  const [approvalAction, setApprovalAction] = useState<'approve' | 'reject'>('approve');
  
  const currentManager = {
    id: 2,
    name: 'Trần Văn B',
    code: 'QL001',
    department: 'IT',
    role: 'MANAGER'
  };

  const [filterStatus, setFilterStatus] = useState<string>('ALL');
  const [filterType, setFilterType] = useState<string>('ALL');
  const [filterPriority, setFilterPriority] = useState<string>('ALL');
  const [searchTerm, setSearchTerm] = useState<string>('');

  const [requests, setRequests] = useState<ManagerRequest[]>([
    {
      id: 1,
      requesterName: 'Nguyễn Văn A',
      requesterCode: 'NV001',
      requesterDepartment: 'IT',
      requestType: 'PURCHASE',
      assetNameSuggest: 'Màn hình Dell 27 inch 4K',
      categoryName: 'Thiết bị văn phòng',
      quantity: 1,
      reason: 'Cần màn hình phụ để làm việc với nhiều cửa sổ đồng thời, tăng hiệu quả công việc',
      requestDate: '2024-10-15',
      neededDate: '2024-11-01',
      priority: 'MEDIUM',
      status: 'PENDING',
      estimatedCost: 8000000
    },
    {
      id: 2,
      requesterName: 'Nguyễn Văn A',
      requesterCode: 'NV001',
      requesterDepartment: 'IT',
      requestType: 'REPAIR',
      assetId: 1,
      assetCode: 'MT001',
      assetName: 'Laptop Dell XPS 15',
      reason: 'Bàn phím bị lỗi một số phím không nhận, ảnh hưởng đến công việc',
      requestDate: '2024-10-20',
      neededDate: '2024-10-25',
      priority: 'HIGH',
      status: 'PENDING',
      estimatedCost: 2000000
    },
    {
      id: 3,
      requesterName: 'Lê Thị C',
      requesterCode: 'NV002',
      requesterDepartment: 'Marketing',
      requestType: 'PURCHASE',
      assetNameSuggest: 'MacBook Pro M3 14 inch',
      categoryName: 'Máy tính',
      quantity: 1,
      reason: 'Làm công việc thiết kế đồ họa, cần máy cấu hình mạnh',
      requestDate: '2024-10-18',
      neededDate: '2024-11-15',
      priority: 'HIGH',
      status: 'PENDING',
      estimatedCost: 45000000
    },
    {
      id: 4,
      requesterName: 'Phạm Văn D',
      requesterCode: 'NV003',
      requesterDepartment: 'Kế toán',
      requestType: 'MAINTENANCE',
      assetId: 5,
      assetCode: 'MT005',
      assetName: 'Máy in HP LaserJet Pro',
      reason: 'Bảo dưỡng định kỳ 6 tháng theo quy định',
      requestDate: '2024-10-19',
      neededDate: '2024-11-10',
      priority: 'LOW',
      status: 'PENDING',
      estimatedCost: 500000
    },
    {
      id: 5,
      requesterName: 'Hoàng Thị E',
      requesterCode: 'NV004',
      requesterDepartment: 'HR',
      requestType: 'PURCHASE',
      assetNameSuggest: 'Bộ bàn ghế văn phòng ergonomic',
      categoryName: 'Bàn ghế',
      quantity: 1,
      reason: 'Ghế hiện tại gây đau lưng, cần thay thế để đảm bảo sức khỏe',
      requestDate: '2024-10-21',
      neededDate: '2024-11-20',
      priority: 'MEDIUM',
      status: 'PENDING',
      estimatedCost: 5000000
    },
    {
      id: 6,
      requesterName: 'Nguyễn Văn A',
      requesterCode: 'NV001',
      requesterDepartment: 'IT',
      requestType: 'PURCHASE',
      assetNameSuggest: 'Màn hình Dell 24 inch',
      categoryName: 'Thiết bị văn phòng',
      quantity: 1,
      reason: 'Đã được phê duyệt, đang chờ mua sắm',
      requestDate: '2024-09-15',
      neededDate: '2024-10-01',
      priority: 'MEDIUM',
      status: 'APPROVED',
      approvalDate: '2024-09-16',
      approverName: 'Trần Văn B',
      approvalNote: 'Đồng ý cấp phát. Liên hệ nhà cung cấp Dell'
    },
    {
      id: 7,
      requesterName: 'Lê Thị C',
      requesterCode: 'NV002',
      requesterDepartment: 'Marketing',
      requestType: 'REPAIR',
      assetId: 3,
      assetCode: 'MT003',
      assetName: 'iMac 27 inch',
      reason: 'Màn hình bị nhòe, cần kiểm tra',
      requestDate: '2024-10-10',
      neededDate: '2024-10-20',
      priority: 'LOW',
      status: 'REJECTED',
      approvalDate: '2024-10-11',
      approverName: 'Trần Văn B',
      rejectionReason: 'Thiết bị còn trong thời gian bảo hành, vui lòng liên hệ bảo hành'
    }
  ]);

  const [approvalForm, setApprovalForm] = useState<ApprovalForm>({
    approvalNote: '',
    rejectionReason: '',
    estimatedCost: '',
    supplierId: '',
    startDate: ''
  });

  const requestTypes: Record<string, string> = {
    PURCHASE: 'Cấp mới',
    REPAIR: 'Sửa chữa',
    MAINTENANCE: 'Bảo trì'
  };

  const statusLabels: Record<string, string> = {
    PENDING: 'Chờ duyệt',
    APPROVED: 'Đã duyệt',
    REJECTED: 'Từ chối',
    IN_PROGRESS: 'Đang xử lý',
    COMPLETED: 'Hoàn thành'
  };

  const priorityLabels: Record<string, string> = {
    LOW: 'Thấp',
    MEDIUM: 'Trung bình',
    HIGH: 'Cao',
    URGENT: 'Khẩn cấp'
  };

  const getStatusColor = (status: string): string => {
    const colors: Record<string, string> = {
      PENDING: 'bg-yellow-100 text-yellow-800',
      APPROVED: 'bg-green-100 text-green-800',
      REJECTED: 'bg-red-100 text-red-800',
      IN_PROGRESS: 'bg-blue-100 text-blue-800',
      COMPLETED: 'bg-gray-100 text-gray-800'
    };
    return colors[status] || 'bg-gray-100 text-gray-800';
  };

  const getPriorityColor = (priority: string): string => {
    const colors: Record<string, string> = {
      LOW: 'bg-green-100 text-green-800',
      MEDIUM: 'bg-blue-100 text-blue-800',
      HIGH: 'bg-orange-100 text-orange-800',
      URGENT: 'bg-red-100 text-red-800'
    };
    return colors[priority] || 'bg-gray-100 text-gray-800';
  };

  const handleApproveRequest = (): void => {
    if (!approvalForm.approvalNote) {
      alert('Vui lòng nhập ghi chú phê duyệt!');
      return;
    }

    if (!selectedRequest) return;

    const updatedRequests = requests.map(req => {
      if (req.id === selectedRequest.id) {
        return {
          ...req,
          status: 'APPROVED' as const,
          approvalDate: new Date().toISOString().split('T')[0],
          approverName: currentManager.name,
          approvalNote: approvalForm.approvalNote,
          estimatedCost: approvalForm.estimatedCost ? parseInt(approvalForm.estimatedCost) : req.estimatedCost
        };
      }
      return req;
    });

    setRequests(updatedRequests);
    setShowApprovalModal(false);
    setShowDetailModal(false);
    alert('Đã phê duyệt yêu cầu thành công!');
    resetApprovalForm();
  };

  const handleRejectRequest = (): void => {
    if (!approvalForm.rejectionReason) {
      alert('Vui lòng nhập lý do từ chối!');
      return;
    }

    if (!selectedRequest) return;

    const updatedRequests = requests.map(req => {
      if (req.id === selectedRequest.id) {
        return {
          ...req,
          status: 'REJECTED' as const,
          approvalDate: new Date().toISOString().split('T')[0],
          approverName: currentManager.name,
          rejectionReason: approvalForm.rejectionReason
        };
      }
      return req;
    });

    setRequests(updatedRequests);
    setShowApprovalModal(false);
    setShowDetailModal(false);
    alert('Đã từ chối yêu cầu!');
    resetApprovalForm();
  };

  const resetApprovalForm = (): void => {
    setApprovalForm({
      approvalNote: '',
      rejectionReason: '',
      estimatedCost: '',
      supplierId: '',
      startDate: ''
    });
  };

  const openApprovalModal = (request: ManagerRequest, action: 'approve' | 'reject'): void => {
    setSelectedRequest(request);
    setApprovalAction(action);
    setApprovalForm({
      ...approvalForm,
      estimatedCost: request.estimatedCost?.toString() || ''
    });
    setShowApprovalModal(true);
  };

  const filteredRequests = requests.filter(req => {
    const matchStatus = filterStatus === 'ALL' || req.status === filterStatus;
    const matchType = filterType === 'ALL' || req.requestType === filterType;
    const matchPriority = filterPriority === 'ALL' || req.priority === filterPriority;
    const matchSearch = searchTerm === '' || 
      req.requesterName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      req.requesterCode.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (req.assetName && req.assetName.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (req.assetNameSuggest && req.assetNameSuggest.toLowerCase().includes(searchTerm.toLowerCase()));
    
    return matchStatus && matchType && matchPriority && matchSearch;
  });

  const pendingRequests = requests.filter(r => r.status === 'PENDING');
  const approvedRequests = requests.filter(r => r.status === 'APPROVED');
  const rejectedRequests = requests.filter(r => r.status === 'REJECTED');
  const highPriorityPending = requests.filter(r => r.status === 'PENDING' && (r.priority === 'HIGH' || r.priority === 'URGENT'));

  const displayedRequests = filteredRequests.filter(req => 
    currentView === 'pending-requests' ? req.status === 'PENDING' : true
  );

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-2xl font-bold text-gray-800">Quản lý Yêu cầu</h1>
              <p className="text-sm text-gray-600 mt-1">{currentManager.name} - {currentManager.code}</p>
            </div>
            <div className="text-right">
              <div className="text-sm text-gray-500">Chờ duyệt</div>
              <div className="text-3xl font-bold text-yellow-600">{pendingRequests.length}</div>
            </div>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-4 gap-4 mb-6">
          <div className="bg-white rounded-lg shadow-sm p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-gray-500">Chờ duyệt</p>
                <p className="text-2xl font-bold text-yellow-600">{pendingRequests.length}</p>
              </div>
              <Clock className="text-yellow-600" size={28} />
            </div>
          </div>
          <div className="bg-white rounded-lg shadow-sm p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-gray-500">Đã duyệt</p>
                <p className="text-2xl font-bold text-green-600">{approvedRequests.length}</p>
              </div>
              <CheckCircle className="text-green-600" size={28} />
            </div>
          </div>
          <div className="bg-white rounded-lg shadow-sm p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-gray-500">Từ chối</p>
                <p className="text-2xl font-bold text-red-600">{rejectedRequests.length}</p>
              </div>
              <XCircle className="text-red-600" size={28} />
            </div>
          </div>
          <div className="bg-white rounded-lg shadow-sm p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-gray-500">Ưu tiên cao</p>
                <p className="text-2xl font-bold text-orange-600">{highPriorityPending.length}</p>
              </div>
              <AlertTriangle className="text-orange-600" size={28} />
            </div>
          </div>
        </div>

        {/* View Toggle */}
        <div className="bg-white rounded-lg shadow-sm p-3 mb-4">
          <div className="flex gap-2">
            <button
              onClick={() => setCurrentView('pending-requests')}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg transition text-sm ${
                currentView === 'pending-requests'
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              <Clock size={18} />
              Chờ duyệt ({pendingRequests.length})
            </button>
            <button
              onClick={() => setCurrentView('all-requests')}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg transition text-sm ${
                currentView === 'all-requests'
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              Tất cả yêu cầu
            </button>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-lg shadow-sm p-4 mb-4">
          <div className="grid grid-cols-4 gap-3">
            <div className="relative">
              <Search className="absolute left-3 top-2.5 text-gray-400" size={18} />
              <input
                type="text"
                placeholder="Tìm kiếm..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-3 py-2 text-sm border border-gray-300 rounded-lg"
              />
            </div>
            {currentView === 'all-requests' && (
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="px-3 py-2 text-sm border border-gray-300 rounded-lg"
              >
                <option value="ALL">Tất cả trạng thái</option>
                <option value="PENDING">Chờ duyệt</option>
                <option value="APPROVED">Đã duyệt</option>
                <option value="REJECTED">Từ chối</option>
              </select>
            )}
            <select
              value={filterType}
              onChange={(e) => setFilterType(e.target.value)}
              className="px-3 py-2 text-sm border border-gray-300 rounded-lg"
            >
              <option value="ALL">Tất cả loại</option>
              <option value="PURCHASE">Cấp mới</option>
              <option value="REPAIR">Sửa chữa</option>
              <option value="MAINTENANCE">Bảo trì</option>
            </select>
            <select
              value={filterPriority}
              onChange={(e) => setFilterPriority(e.target.value)}
              className="px-3 py-2 text-sm border border-gray-300 rounded-lg"
            >
              <option value="ALL">Tất cả ưu tiên</option>
              <option value="URGENT">Khẩn cấp</option>
              <option value="HIGH">Cao</option>
              <option value="MEDIUM">Trung bình</option>
              <option value="LOW">Thấp</option>
            </select>
          </div>
        </div>

        {/* Table */}
        <div className="bg-white rounded-lg shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Nhân viên</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Loại</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Tài sản</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Ngày YC</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Ưu tiên</th>
                  {currentView === 'all-requests' && (
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Trạng thái</th>
                  )}
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Thao tác</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {displayedRequests.map(request => (
                  <tr key={request.id} className="hover:bg-gray-50">
                    <td className="px-4 py-3">
                      <div className="text-sm font-medium text-gray-900">{request.requesterName}</div>
                      <div className="text-xs text-gray-500">{request.requesterCode}</div>
                    </td>
                    <td className="px-4 py-3 text-sm">{requestTypes[request.requestType]}</td>
                    <td className="px-4 py-3">
                      <div className="text-sm font-medium text-gray-900 max-w-xs truncate">
                        {request.assetName || request.assetNameSuggest}
                      </div>
                      {request.assetCode && <div className="text-xs text-gray-500">{request.assetCode}</div>}
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-600">{request.requestDate}</td>
                    <td className="px-4 py-3">
                      <span className={`px-2 py-1 text-xs font-semibold rounded-full ${getPriorityColor(request.priority)}`}>
                        {priorityLabels[request.priority]}
                      </span>
                    </td>
                    {currentView === 'all-requests' && (
                      <td className="px-4 py-3">
                        <span className={`px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(request.status)}`}>
                          {statusLabels[request.status]}
                        </span>
                      </td>
                    )}
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => {
                            setSelectedRequest(request);
                            setShowDetailModal(true);
                          }}
                          className="text-blue-600 hover:text-blue-800"
                          title="Chi tiết"
                        >
                          <Eye size={18} />
                        </button>
                        {request.status === 'PENDING' && (
                          <>
                            <button
                              onClick={() => openApprovalModal(request, 'approve')}
                              className="text-green-600 hover:text-green-800"
                              title="Duyệt"
                            >
                              <CheckCircle size={18} />
                            </button>
                            <button
                              onClick={() => openApprovalModal(request, 'reject')}
                              className="text-red-600 hover:text-red-800"
                              title="Từ chối"
                            >
                              <XCircle size={18} />
                            </button>
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {displayedRequests.length === 0 && (
              <div className="text-center py-8 text-gray-500">Không có yêu cầu nào</div>
            )}
          </div>
        </div>

        {/* Detail Modal */}
        {showDetailModal && selectedRequest && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
              <div className="p-4 border-b flex justify-between items-center">
                <h2 className="text-lg font-bold">Chi tiết yêu cầu #{selectedRequest.id}</h2>
                <button onClick={() => setShowDetailModal(false)}>
                  <X size={20} />
                </button>
              </div>
              <div className="p-4 space-y-3">
                <div className="grid grid-cols-2 gap-3 text-sm">
                  <div>
                    <label className="block text-xs font-medium text-gray-500">Nhân viên</label>
                    <p className="mt-1 text-gray-900">{selectedRequest.requesterName}</p>
                    <p className="text-xs text-gray-500">{selectedRequest.requesterCode} - {selectedRequest.requesterDepartment}</p>
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-500">Loại yêu cầu</label>
                    <p className="mt-1 text-gray-900">{requestTypes[selectedRequest.requestType]}</p>
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-500">Ngày yêu cầu</label>
                    <p className="mt-1 text-gray-900">{selectedRequest.requestDate}</p>
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-500">Ngày cần</label>
                    <p className="mt-1 text-gray-900">{selectedRequest.neededDate}</p>
                  </div>
                </div>

                <div className="text-sm">
                  <label className="block text-xs font-medium text-gray-500">Tài sản</label>
                  <p className="mt-1 text-gray-900 font-medium">
                    {selectedRequest.assetName || selectedRequest.assetNameSuggest}
                  </p>
                  {selectedRequest.assetCode && (
                    <p className="text-xs text-gray-500">Mã: {selectedRequest.assetCode}</p>
                  )}
                </div>

                <div className="text-sm">
                  <label className="block text-xs font-medium text-gray-500">Lý do</label>
                  <p className="mt-1 text-gray-900">{selectedRequest.reason}</p>
                </div>

                <div className="grid grid-cols-2 gap-3 text-sm">
                  <div>
                    <label className="block text-xs font-medium text-gray-500">Ưu tiên</label>
                    <span className={`inline-block mt-1 px-2 py-1 text-xs font-semibold rounded-full ${getPriorityColor(selectedRequest.priority)}`}>
                      {priorityLabels[selectedRequest.priority]}
                    </span>
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-500">Trạng thái</label>
                    <span className={`inline-block mt-1 px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(selectedRequest.status)}`}>
                      {statusLabels[selectedRequest.status]}
                    </span>
                  </div>
                </div>

                {selectedRequest.estimatedCost && (
                  <div className="text-sm">
                    <label className="block text-xs font-medium text-gray-500">Chi phí ước tính</label>
                    <p className="mt-1 text-gray-900">{selectedRequest.estimatedCost.toLocaleString('vi-VN')} VNĐ</p>
                  </div>
                )}

                {selectedRequest.status !== 'PENDING' && (
                  <div className="border-t pt-3">
                    <h3 className="font-semibold text-sm mb-2">Thông tin phê duyệt</h3>
                    <div className="grid grid-cols-2 gap-3 text-sm">
                      <div>
                        <label className="block text-xs font-medium text-gray-500">Người duyệt</label>
                        <p className="mt-1 text-gray-900">{selectedRequest.approverName}</p>
                      </div>
                      <div>
                        <label className="block text-xs font-medium text-gray-500">Ngày duyệt</label>
                        <p className="mt-1 text-gray-900">{selectedRequest.approvalDate}</p>
                      </div>
                    </div>
                    {selectedRequest.approvalNote && (
                      <div className="mt-2 text-sm">
                        <label className="block text-xs font-medium text-gray-500">Ghi chú</label>
                        <p className="mt-1 text-gray-900">{selectedRequest.approvalNote}</p>
                      </div>
                    )}
                    {selectedRequest.rejectionReason && (
                      <div className="mt-2 text-sm">
                        <label className="block text-xs font-medium text-gray-500">Lý do từ chối</label>
                        <p className="mt-1 text-red-600">{selectedRequest.rejectionReason}</p>
                      </div>
                    )}
                  </div>
                )}
              </div>
              <div className="p-4 border-t flex justify-end gap-2">
                {selectedRequest.status === 'PENDING' && (
                  <>
                    <button
                      onClick={() => {
                        setShowDetailModal(false);
                        openApprovalModal(selectedRequest, 'approve');
                      }}
                      className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 text-sm"
                    >
                      <CheckCircle size={16} className="inline mr-1" />
                      Phê duyệt
                    </button>
                    <button
                      onClick={() => {
                        setShowDetailModal(false);
                        openApprovalModal(selectedRequest, 'reject');
                      }}
                      className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 text-sm"
                    >
                      <XCircle size={16} className="inline mr-1" />
                      Từ chối
                    </button>
                  </>
                )}
                <button
                  onClick={() => setShowDetailModal(false)}
                  className="px-4 py-2 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400 text-sm"
                >
                  Đóng
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Approval Modal */}
        {showApprovalModal && selectedRequest && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg max-w-lg w-full">
              <div className="p-4 border-b flex justify-between items-center">
                <h2 className="text-lg font-bold">
                  {approvalAction === 'approve' ? 'Phê duyệt yêu cầu' : 'Từ chối yêu cầu'}
                </h2>
                <button onClick={() => {
                  setShowApprovalModal(false);
                  resetApprovalForm();
                }}>
                  <X size={20} />
                </button>
              </div>
              <div className="p-4 space-y-3">
                <div className="bg-gray-50 p-3 rounded-lg text-sm">
                  <p className="text-gray-600">Từ: <span className="font-medium text-gray-900">{selectedRequest.requesterName}</span></p>
                  <p className="text-gray-600">Tài sản: <span className="font-medium text-gray-900">{selectedRequest.assetName || selectedRequest.assetNameSuggest}</span></p>
                  <p className="text-gray-600">Loại: <span className="font-medium text-gray-900">{requestTypes[selectedRequest.requestType]}</span></p>
                </div>

                {approvalAction === 'approve' ? (
                  <>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Ghi chú phê duyệt *</label>
                      <textarea
                        value={approvalForm.approvalNote}
                        onChange={(e) => setApprovalForm({...approvalForm, approvalNote: e.target.value})}
                        rows={3}
                        className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg"
                        placeholder="Nhập ghi chú..."
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Chi phí ước tính (VNĐ)</label>
                      <input
                        type="number"
                        value={approvalForm.estimatedCost}
                        onChange={(e) => setApprovalForm({...approvalForm, estimatedCost: e.target.value})}
                        className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg"
                        placeholder="Nhập chi phí..."
                      />
                    </div>
                  </>
                ) : (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Lý do từ chối *</label>
                    <textarea
                      value={approvalForm.rejectionReason}
                      onChange={(e) => setApprovalForm({...approvalForm, rejectionReason: e.target.value})}
                      rows={4}
                      className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg"
                      placeholder="Nhập lý do từ chối..."
                    />
                  </div>
                )}
              </div>
              <div className="p-4 border-t flex justify-end gap-2">
                <button
                  onClick={() => {
                    setShowApprovalModal(false);
                    resetApprovalForm();
                  }}
                  className="px-4 py-2 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400 text-sm"
                >
                  Hủy
                </button>
                <button
                  onClick={approvalAction === 'approve' ? handleApproveRequest : handleRejectRequest}
                  className={`px-4 py-2 text-white rounded-lg text-sm ${
                    approvalAction === 'approve' 
                      ? 'bg-green-600 hover:bg-green-700' 
                      : 'bg-red-600 hover:bg-red-700'
                  }`}
                >
                  {approvalAction === 'approve' ? 'Xác nhận phê duyệt' : 'Xác nhận từ chối'}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ManagerRequestSystem;