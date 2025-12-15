'use client';

import { useState, useEffect } from 'react';
import { CheckCircle, XCircle, Eye, Search, Clock, AlertTriangle, X } from 'lucide-react';
import {
  requestService,
  Request,
  RequestType,
  RequestStatus,
  RequestPriority,
  RequestStatistics,
} from '@/lib/api/services/request.service';
import { useAuth } from '@/hooks/useAuth';
import { UserRole } from '@/lib/constants/roles';
import toast, { Toaster } from 'react-hot-toast';

const REQUEST_TYPES: Record<RequestType, string> = {
  PURCHASE: 'Cấp mới', REPAIR: 'Sửa chữa', MAINTENANCE: 'Bảo trì',
};
const STATUS_LABELS: Record<RequestStatus, string> = {
  PENDING: 'Chờ duyệt', APPROVED: 'Đã duyệt', REJECTED: 'Từ chối', IN_PROGRESS: 'Đang xử lý', COMPLETED: 'Hoàn thành',
};
const PRIORITY_LABELS: Record<RequestPriority, string> = {
  LOW: 'Thấp', MEDIUM: 'Trung bình', HIGH: 'Cao', URGENT: 'Khẩn cấp',
};
const getStatusColor = (s: string) => ({ 
  PENDING: 'bg-yellow-100 text-yellow-800', 
  APPROVED: 'bg-green-100 text-green-800', 
  REJECTED: 'bg-red-100 text-red-800', 
  IN_PROGRESS: 'bg-blue-100 text-blue-800', 
  COMPLETED: 'bg-gray-100 text-gray-800' 
}[s] || 'bg-gray-100 text-gray-800');

const getPriorityColor = (p: string) => ({ 
  LOW: 'bg-green-100 text-green-800', 
  MEDIUM: 'bg-blue-100 text-blue-800', 
  HIGH: 'bg-orange-100 text-orange-800', 
  URGENT: 'bg-red-100 text-red-800' 
}[p] || 'bg-gray-100 text-gray-800');

export default function ManagerRequestPage() {
  const { user, hasRole } = useAuth();
  const canManage = hasRole(UserRole.MANAGER);
  const [requests, setRequests] = useState<Request[]>([]);
  const [statistics, setStatistics] = useState<RequestStatistics | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [currentView, setCurrentView] = useState<'pending' | 'all'>('pending');
  const [selectedRequest, setSelectedRequest] = useState<Request | null>(null);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [showApprovalModal, setShowApprovalModal] = useState(false);
  const [approvalAction, setApprovalAction] = useState<'approve' | 'reject'>('approve');
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('');
  const [filterType, setFilterType] = useState('');
  const [filterPriority, setFilterPriority] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [approvalForm, setApprovalForm] = useState({ 
    approval_note: '', 
    rejection_reason: '', 
    estimated_cost: '' 
  });

  useEffect(() => { fetchStatistics(); }, []);
  useEffect(() => {
    const t = setTimeout(() => fetchRequests(), 300);
    return () => clearTimeout(t);
  }, [currentPage, searchTerm, filterStatus, filterType, filterPriority, currentView]);

  const fetchStatistics = async () => {
    try { 
      setStatistics(await requestService.getStatistics()); 
    } catch (e) { console.error(e); }
  };

  const fetchRequests = async () => {
    setLoading(true);
    try {
      const status = currentView === 'pending' ? 'PENDING' : (filterStatus || undefined);
      const data = await requestService.getAll({
        page: currentPage, 
        pageSize: 10, 
        search: searchTerm.trim() || undefined,
        status: status as RequestStatus, 
        request_type: filterType as RequestType || undefined,
        priority: filterPriority as RequestPriority || undefined,
      });
      setRequests(data.data); 
      setTotal(data.total); 
      setTotalPages(data.totalPages);
    } catch (e) { console.error(e); } 
    finally { setLoading(false); }
  };

  const openApprovalModal = (req: Request, action: 'approve' | 'reject') => {
    setSelectedRequest(req); 
    setApprovalAction(action);
    setApprovalForm({ 
      approval_note: '', 
      rejection_reason: '', 
      estimated_cost: req.estimated_cost || '' 
    });
    setShowApprovalModal(true);
  };

  const handleApprove = async () => {
    if (!approvalForm.approval_note) return alert('Vui lòng nhập ghi chú phê duyệt!');
    if (!selectedRequest) return;
    setSubmitting(true);
    try {
      await requestService.approve(selectedRequest.id, {
        approval_note: approvalForm.approval_note,
        estimated_cost: approvalForm.estimated_cost ? parseFloat(approvalForm.estimated_cost) : undefined,
      });
      alert('Đã phê duyệt yêu cầu thành công!');
      setShowApprovalModal(false); 
      setShowDetailModal(false); 
      fetchRequests(); 
      fetchStatistics();
    } catch (e: any) { 
      alert(e.response?.data?.message || 'Lỗi'); 
    } finally { setSubmitting(false); }
  };

  const handleReject = async () => {
    if (!approvalForm.rejection_reason) return alert('Vui lòng nhập lý do từ chối!');
    if (!selectedRequest) return;
    setSubmitting(true);
    try {
      await requestService.reject(selectedRequest.id, { 
        rejection_reason: approvalForm.rejection_reason 
      });
      alert('Đã từ chối yêu cầu!');
      setShowApprovalModal(false); 
      setShowDetailModal(false); 
      fetchRequests(); 
      fetchStatistics();
    } catch (e: any) { 
      alert(e.response?.data?.message || 'Lỗi'); 
    } finally { setSubmitting(false); }
  };

  return (
    <div className="space-y-6">
      <Toaster position="top-right" toastOptions={{className: '',style: {animation: 'slide-in 0.3s ease-out',},}}/>
      {/* Header */}
      <div className="bg-white rounded-lg shadow-sm p-6 flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Quản lý Yêu cầu</h1>
          <p className="text-sm text-gray-600 mt-1">{user?.full_name} - {user?.employee_code}</p>
        </div>
        <div className="text-right">
          <div className="text-sm text-gray-500">Chờ duyệt</div>
          <div className="text-3xl font-bold text-yellow-600">{statistics?.pending || 0}</div>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-4 gap-4">
        {[
          { label: 'Chờ duyệt', value: statistics?.pending, color: 'yellow', icon: Clock },
          { label: 'Đã duyệt', value: statistics?.approved, color: 'green', icon: CheckCircle },
          { label: 'Từ chối', value: statistics?.rejected, color: 'red', icon: XCircle },
          { label: 'Ưu tiên cao', value: statistics?.high_priority_pending, color: 'orange', icon: AlertTriangle },
        ].map((s, i) => (
          <div key={i} className="bg-white rounded-lg shadow-sm p-4 flex items-center justify-between">
            <div>
              <p className="text-xs text-gray-500">{s.label}</p>
              <p className={`text-2xl font-bold text-${s.color}-600`}>{s.value || 0}</p>
            </div>
            <s.icon className={`text-${s.color}-600`} size={28} />
          </div>
        ))}
      </div>

      {/* Tabs */}
      <div className="bg-white rounded-lg shadow-sm p-3 flex gap-2 text-gray-600">
        <button 
          onClick={() => { setCurrentView('pending'); setCurrentPage(1); }} 
          className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm ${currentView === 'pending' ? 'bg-blue-600 text-white' : 'bg-gray-100 hover:bg-gray-200'}`}>
          <Clock size={18} /> Chờ duyệt ({statistics?.pending || 0})
        </button>
        <button 
          onClick={() => { setCurrentView('all'); setCurrentPage(1); }} 
          className={`px-4 py-2 rounded-lg text-sm ${currentView === 'all' ? 'bg-blue-600 text-white' : 'bg-gray-100 hover:bg-gray-200'}`}>
          Tất cả yêu cầu
        </button>
      </div>

      {/* Filters */}
<div className="grid grid-cols-1 md:grid-cols-4 gap-4">
  <div className="relative">
    <Search className="absolute left-3 top-3 text-gray-400 w-5 h-5" />
    <input
      type="text"
      placeholder="Tìm kiếm..."
      value={searchTerm}
      onChange={(e) => {
        setSearchTerm(e.target.value);
        setCurrentPage(1);
      }}
      className="w-full pl-10 pr-4 py-2.5 rounded-lg border border-gray-300 text-gray-900 font-medium focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all placeholder:text-gray-400"
    />
  </div>

  {currentView === 'all' && (
    <select
      value={filterStatus}
      onChange={(e) => {
        setFilterStatus(e.target.value);
        setCurrentPage(1);
      }}
      className="w-full px-4 py-2.5 rounded-lg border border-gray-300 text-gray-700 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
    >
      <option value="">Tất cả trạng thái</option>
      {Object.entries(STATUS_LABELS).map(([k, v]) => (
        <option key={k} value={k}>
          {v}
        </option>
      ))}
    </select>
  )}

  {/* Type Filter */}
  <select
    value={filterType}
    onChange={(e) => {
      setFilterType(e.target.value);
      setCurrentPage(1);
    }}
    className="w-full px-4 py-2.5 rounded-lg border border-gray-300 text-gray-700 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
  >
    <option value="">Tất cả loại</option>
    {Object.entries(REQUEST_TYPES).map(([k, v]) => (
      <option key={k} value={k}>
        {v}
      </option>
    ))}
  </select>

  {/* Priority Filter */}
  <select
    value={filterPriority}
    onChange={(e) => {
      setFilterPriority(e.target.value);
      setCurrentPage(1);
    }}
    className="w-full px-4 py-2.5 rounded-lg border border-gray-300 text-gray-700 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
  >
    <option value="">Tất cả ưu tiên</option>
    {Object.entries(PRIORITY_LABELS).map(([k, v]) => (
      <option key={k} value={k}>
        {v}
      </option>
    ))}
  </select>
</div>

      {/* Table */}
      {loading ? (
        <div className="bg-white rounded-lg shadow-sm p-12 text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4" />
          <p className="text-gray-600">Đang tải...</p>
        </div>
      ) : (
        <div className="bg-white rounded-lg shadow-sm overflow-hidden text-gray-700">
          <table className="w-full">
            <thead className="bg-gray-50 border-b">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Nhân viên</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Loại</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Tài sản</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Ngày YC</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Ưu tiên</th>
                {currentView === 'all' && <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Trạng thái</th>}
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Thao tác</th>
              </tr>
            </thead>
            <tbody className="divide-y text-gray-600">
              {requests.length === 0 ? (
                <tr><td colSpan={7} className="text-center py-8 text-gray-500">Không có yêu cầu nào</td></tr>
              ) : (
                requests.map(req => (
                  <tr key={req.id} className="hover:bg-gray-50">
                    <td className="px-4 py-3">
                      <div className="text-sm font-medium">{req.requester?.full_name}</div>
                      <div className="text-xs text-gray-500">{req.requester?.employee_code}</div>
                    </td>
                    <td className="px-4 py-3 text-sm">{REQUEST_TYPES[req.request_type]}</td>
                    <td className="px-4 py-3">
                      <div className="text-sm font-medium truncate max-w-xs">{req.asset?.asset_name || req.asset_name_suggest}</div>
                      {req.asset?.asset_code && <div className="text-xs text-gray-500">{req.asset.asset_code}</div>}
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-600">{req.request_date}</td>
                    <td className="px-4 py-3">
                      <span className={`px-2 py-1 text-xs font-semibold rounded-full ${getPriorityColor(req.priority)}`}>
                        {PRIORITY_LABELS[req.priority]}
                      </span>
                    </td>
                    {currentView === 'all' && (
                      <td className="px-4 py-3">
                        <span className={`px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(req.status)}`}>
                          {STATUS_LABELS[req.status]}
                        </span>
                      </td>
                    )}
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <button onClick={() => { setSelectedRequest(req); setShowDetailModal(true); }} className="text-blue-600 hover:text-blue-800">
                          <Eye size={18} />
                        </button>
                        {canManage && req.status === 'PENDING' && (
                          <>
                            <button onClick={() => openApprovalModal(req, 'approve')} className="text-green-600 hover:text-green-800">
                              <CheckCircle size={18} />
                            </button>
                            <button onClick={() => openApprovalModal(req, 'reject')} className="text-red-600 hover:text-red-800">
                              <XCircle size={18} />
                            </button>
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="bg-white rounded-lg shadow-sm p-4 flex justify-between items-center">
          <span className="text-sm text-gray-600">Hiển thị {requests.length} / {total}</span>
          <div className="flex gap-2">
            <button onClick={() => setCurrentPage(p => Math.max(1, p - 1))} disabled={currentPage === 1} className="px-4 py-2 border rounded-lg disabled:opacity-50">Trước</button>
            <span className="px-4 py-2">Trang {currentPage} / {totalPages}</span>
            <button onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))} disabled={currentPage === totalPages} className="px-4 py-2 border rounded-lg disabled:opacity-50">Sau</button>
          </div>
        </div>
      )}

      {/* Detail Modal – ĐÃ MỜ ĐẸP */}
      {showDetailModal && selectedRequest && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm text-gray-600">
          <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-4 border-b flex justify-between items-center">
              <h2 className="text-lg font-bold">Chi tiết yêu cầu #{selectedRequest.id}</h2>
              <button onClick={() => setShowDetailModal(false)}><X size={20} /></button>
            </div>
            <div className="p-4 space-y-3 text-sm">
              <div className="grid grid-cols-2 gap-3">
                <div><label className="text-xs text-gray-500">Nhân viên</label><p className="font-medium">{selectedRequest.requester?.full_name}</p><p className="text-xs text-gray-500">{selectedRequest.requester?.employee_code}</p></div>
                <div><label className="text-xs text-gray-500">Loại</label><p>{REQUEST_TYPES[selectedRequest.request_type]}</p></div>
                <div><label className="text-xs text-gray-500">Ngày YC</label><p>{selectedRequest.request_date}</p></div>
                <div><label className="text-xs text-gray-500">Ngày cần</label><p>{selectedRequest.needed_date || '-'}</p></div>
              </div>
              <div><label className="text-xs text-gray-500">Tài sản</label><p className="font-medium">{selectedRequest.asset?.asset_name || selectedRequest.asset_name_suggest}</p></div>
              <div><label className="text-xs text-gray-500">Lý do</label><p>{selectedRequest.reason}</p></div>
              <div className="grid grid-cols-2 gap-3">
                <div><label className="text-xs text-gray-500">Ưu tiên</label><span className={`px-2 py-1 text-xs rounded-full ${getPriorityColor(selectedRequest.priority)}`}>{PRIORITY_LABELS[selectedRequest.priority]}</span></div>
                <div><label className="text-xs text-gray-500">Trạng thái</label><span className={`px-2 py-1 text-xs rounded-full ${getStatusColor(selectedRequest.status)}`}>{STATUS_LABELS[selectedRequest.status]}</span></div>
              </div>
              {selectedRequest.status !== 'PENDING' && (
                <div className="border-t pt-3">
                  <h3 className="font-semibold mb-2">Thông tin phê duyệt</h3>
                  <div className="grid grid-cols-2 gap-3">
                    <div><label className="text-xs text-gray-500">Người duyệt</label><p>{selectedRequest.approver?.full_name || '-'}</p></div>
                    <div><label className="text-xs text-gray-500">Ngày duyệt</label><p>{selectedRequest.approval_date || '-'}</p></div>
                  </div>
                  {selectedRequest.approval_note && <div className="mt-2"><label className="text-xs text-gray-500">Ghi chú</label><p>{selectedRequest.approval_note}</p></div>}
                  {selectedRequest.rejection_reason && <div className="mt-2"><label className="text-xs text-gray-500">Lý do từ chối</label><p className="text-red-600">{selectedRequest.rejection_reason}</p></div>}
                </div>
              )}
            </div>
            <div className="p-4 border-t flex justify-end gap-2">
              {canManage && selectedRequest.status === 'PENDING' && (
                <>
                  <button onClick={() => { setShowDetailModal(false); openApprovalModal(selectedRequest, 'approve'); }} className="px-4 py-2 bg-green-600 text-white rounded-lg text-sm">Phê duyệt</button>
                  <button onClick={() => { setShowDetailModal(false); openApprovalModal(selectedRequest, 'reject'); }} className="px-4 py-2 bg-red-600 text-white rounded-lg text-sm">Từ chối</button>
                </>
              )}
              <button onClick={() => setShowDetailModal(false)} className="px-4 py-2 bg-gray-300 rounded-lg text-sm">Đóng</button>
            </div>
          </div>
        </div>
      )}

      {/* Approval Modal – ĐÃ MỜ ĐẸP */}
      {showApprovalModal && selectedRequest && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm text-gray-600">
          <div className="bg-white rounded-lg max-w-lg w-full">
            <div className="p-4 border-b flex justify-between items-center">
              <h2 className="text-lg font-bold">{approvalAction === 'approve' ? 'Phê duyệt' : 'Từ chối'} yêu cầu</h2>
              <button onClick={() => setShowApprovalModal(false)}><X size={20} /></button>
            </div>
            <div className="p-4 space-y-3">
              <div className="bg-gray-50 p-3 rounded-lg text-sm">
                <p>Từ: <span className="font-medium">{selectedRequest.requester?.full_name}</span></p>
                <p>Tài sản: <span className="font-medium">{selectedRequest.asset?.asset_name || selectedRequest.asset_name_suggest}</span></p>
                <p>Loại: <span className="font-medium">{REQUEST_TYPES[selectedRequest.request_type]}</span></p>
              </div>
              {approvalAction === 'approve' ? (
                <>
                  <div>
                    <label className="block text-sm font-medium mb-1">Ghi chú phê duyệt *</label>
                    <textarea 
                      value={approvalForm.approval_note} 
                      onChange={(e) => setApprovalForm({ ...approvalForm, approval_note: e.target.value })} 
                      rows={3} 
                      className="w-full px-3 py-2 text-sm border rounded-lg" 
                      placeholder="Nhập ghi chú..." 
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">Chi phí ước tính (VNĐ)</label>
                    <input 
                      type="number" 
                      value={approvalForm.estimated_cost} 
                      onChange={(e) => setApprovalForm({ ...approvalForm, estimated_cost: e.target.value })} 
                      className="w-full px-3 py-2 text-sm border rounded-lg" 
                    />
                  </div>
                </>
              ) : (
                <div>
                  <label className="block text-sm font-medium mb-1">Lý do từ chối *</label>
                  <textarea 
                    value={approvalForm.rejection_reason} 
                    onChange={(e) => setApprovalForm({ ...approvalForm, rejection_reason: e.target.value })} 
                    rows={4} 
                    className="w-full px-3 py-2 text-sm border rounded-lg" 
                    placeholder="Nhập lý do..." 
                  />
                </div>
              )}
            </div>
            <div className="p-4 border-t flex justify-end gap-2">
              <button onClick={() => setShowApprovalModal(false)} className="px-4 py-2 bg-gray-300 rounded-lg text-sm">Hủy</button>
              <button 
                onClick={approvalAction === 'approve' ? handleApprove : handleReject} 
                disabled={submitting} 
                className={`px-4 py-2 text-white rounded-lg text-sm disabled:opacity-50 ${approvalAction === 'approve' ? 'bg-green-600' : 'bg-red-600'}`}
              >
                {submitting ? 'Đang xử lý...' : approvalAction === 'approve' ? 'Xác nhận phê duyệt' : 'Xác nhận từ chối'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}