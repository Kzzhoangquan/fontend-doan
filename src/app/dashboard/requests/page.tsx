// src/app/dashboard/requests/page.tsx
'use client';

import { useState, useEffect } from 'react';
import { Package, FileText, Plus, Bell, X } from 'lucide-react';
import {
  requestService,
  notificationService,
  Request,
  Notification,
  RequestType,
  RequestPriority,
  CreateRequestDto,
} from '@/lib/api/services/request.service';
import { categoryService, Category } from '@/lib/api/services/asset.service';
import { useAuth } from '@/hooks/useAuth';
import toast, { Toaster } from 'react-hot-toast';

const REQUEST_TYPES: Record<RequestType, string> = {
  PURCHASE: 'Yêu cầu cấp mới',
  REPAIR: 'Yêu cầu sửa chữa',
  MAINTENANCE: 'Yêu cầu bảo trì',
};

const STATUS_LABELS: Record<string, string> = {
  PENDING: 'Chờ duyệt',
  APPROVED: 'Đã duyệt',
  REJECTED: 'Từ chối',
  IN_PROGRESS: 'Đang xử lý',
  COMPLETED: 'Hoàn thành',
};

const PRIORITY_LABELS: Record<string, string> = {
  LOW: 'Thấp',
  MEDIUM: 'Trung bình',
  HIGH: 'Cao',
  URGENT: 'Khẩn cấp',
};

const getStatusColor = (status: string) => {
  const colors: Record<string, string> = {
    PENDING: 'bg-yellow-100 text-yellow-800',
    APPROVED: 'bg-green-100 text-green-800',
    REJECTED: 'bg-red-100 text-red-800',
    IN_PROGRESS: 'bg-blue-100 text-blue-800',
    COMPLETED: 'bg-gray-100 text-gray-800',
  };
  return colors[status] || 'bg-gray-100 text-gray-800';
};

const getPriorityColor = (priority: string) => {
  const colors: Record<string, string> = {
    LOW: 'bg-green-100 text-green-800',
    MEDIUM: 'bg-blue-100 text-blue-800',
    HIGH: 'bg-orange-100 text-orange-800',
    URGENT: 'bg-red-100 text-red-800',
  };
  return colors[priority] || 'bg-gray-100 text-gray-800';
};

interface MyAsset {
  id: number;
  asset_code: string;
  asset_name: string;
  category: { category_name: string };
  assignment_date: string;
  condition?: string;
}

export default function EmployeeRequestPage() {
  const { user } = useAuth();

  const [currentView, setCurrentView] = useState<'my-assets' | 'my-requests' | 'create-request'>('my-assets');
  const [myAssets, setMyAssets] = useState<MyAsset[]>([]);
  const [requests, setRequests] = useState<Request[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);

  const [requestForm, setRequestForm] = useState<CreateRequestDto & { asset_id_str: string; category_id_str: string }>({
    request_type: 'PURCHASE',
    asset_id_str: '',
    category_id_str: '',
    asset_name_suggest: '',
    quantity: 1,
    reason: '',
    needed_date: '',
    priority: 'MEDIUM',
    image_url: '',
  });

  useEffect(() => {
    fetchInitialData();
  }, []);

  useEffect(() => {
    if (currentView === 'my-assets') fetchMyAssets();
    if (currentView === 'my-requests') fetchMyRequests();
  }, [currentView]);

  const fetchInitialData = async () => {
    try {
      const [categoriesData, notifData, unreadData] = await Promise.all([
        categoryService.getAll(),
        notificationService.getMyNotifications(),
        notificationService.getUnreadCount(),
      ]);
      setCategories(categoriesData);
      setNotifications(notifData);
      setUnreadCount(unreadData.count);
    } catch (err) {
      console.error('Error fetching initial data:', err);
    }
  };

  const fetchMyAssets = async () => {
    setLoading(true);
    try {
      const data = await requestService.getMyAssets();
      setMyAssets(data.data || data || []);
    } catch (err) {
      console.error('Error fetching my assets:', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchMyRequests = async () => {
    setLoading(true);
    try {
      const data = await requestService.getMyRequests({ page: 1, pageSize: 100 });
      setRequests(data.data);
    } catch (err) {
      console.error('Error fetching my requests:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmitRequest = async () => {
    if (requestForm.request_type === 'PURCHASE' && !requestForm.asset_name_suggest) {
      toast.error('Vui lòng nhập tên tài sản đề xuất!');
      return;
    }
    if ((requestForm.request_type === 'REPAIR' || requestForm.request_type === 'MAINTENANCE') && !requestForm.asset_id_str) {
      toast.error(`Vui lòng chọn tài sản cần ${requestForm.request_type === 'REPAIR' ? 'sửa chữa' : 'bảo trì'}!`);
      return;
    }
    if (!requestForm.reason) {
      toast.error('Vui lòng nhập lý do yêu cầu!');
      return;
    }

    setSubmitting(true);
    try {
      const payload: CreateRequestDto = {
        request_type: requestForm.request_type,
        reason: requestForm.reason,
        priority: requestForm.priority,
        needed_date: requestForm.needed_date || undefined,
        image_url: requestForm.image_url || undefined,
      };

      if (requestForm.request_type === 'PURCHASE') {
        payload.category_id = requestForm.category_id_str ? parseInt(requestForm.category_id_str) : undefined;
        payload.asset_name_suggest = requestForm.asset_name_suggest;
        payload.quantity = requestForm.quantity;
      } else {
        payload.asset_id = parseInt(requestForm.asset_id_str);
      }

      await requestService.create(payload);
      toast.success('Gửi yêu cầu thành công!');
      setCurrentView('my-requests');
      resetForm();
    } catch (err: any) {
      console.error('Error creating request:', err);
      toast.error(err.response?.data?.message || 'Không thể gửi yêu cầu');
    } finally {
      setSubmitting(false);
    }
  };

  const resetForm = () => {
    setRequestForm({
      request_type: 'PURCHASE',
      asset_id_str: '',
      category_id_str: '',
      asset_name_suggest: '',
      quantity: 1,
      reason: '',
      needed_date: '',
      priority: 'MEDIUM',
      image_url: '',
    });
  };

  const handleMarkAsRead = async (id: number) => {
    try {
      await notificationService.markAsRead(id);
      setNotifications(prev => prev.map(n => n.id === id ? { ...n, is_read: true } : n));
      setUnreadCount(prev => Math.max(0, prev - 1));
    } catch (err) {
      console.error(err);
    }
  };

  const startRepairRequest = (asset: MyAsset) => {
    setRequestForm({
      ...requestForm,
      request_type: 'REPAIR',
      asset_id_str: asset.id.toString(),
    });
    setCurrentView('create-request');
  };

  const startMaintenanceRequest = (asset: MyAsset) => {
    setRequestForm({
      ...requestForm,
      request_type: 'MAINTENANCE',
      asset_id_str: asset.id.toString(),
    });
    setCurrentView('create-request');
  };

  return (
    <div className="space-y-6">
      <Toaster position="top-right" toastOptions={{className: '',style: {animation: 'slide-in 0.3s ease-out',},}}/>
      {/* Header */}
      <div className="bg-white rounded-lg shadow-sm p-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Quản lý Yêu cầu</h1>
            <p className="text-gray-600 mt-1">Xin chào, {user?.full_name} ({user?.employee_code})</p>
          </div>
          <div className="flex gap-3">
            {/* NOTIFICATION BELL – SIÊU ĐẸP VỚI CHẤM ĐỎ + NHẤP NHÁY + SỐ */}
            <div className="relative">
              <button
                onClick={() => setShowNotifications(!showNotifications)}
                className="relative p-3 bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl hover:shadow-md transition-all group"
              >
                <Bell size={26} className="text-blue-700 group-hover:scale-110 transition-transform" />

                {/* HIỆU ỨNG KHI CÓ THÔNG BÁO MỚI */}
                {unreadCount > 0 && (
                  <>
                    {/* Chấm đỏ nhỏ bên ngoài */}
                    <div className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 rounded-full border-2 border-white shadow-lg"></div>
                    
                    {/* Nhấp nháy xung quanh chấm đỏ */}
                    <div className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 rounded-full animate-ping opacity-75"></div>
                    
                    {/* Số lượng thông báo */}
                    <span className="absolute top-0 right-0 transform translate-x-1/2 -translate-y-1/2 bg-red-600 text-white text-xs font-bold rounded-full min-w-6 h-6 flex items-center justify-center shadow-lg border-2 border-white px-1">
                      {unreadCount > 99 ? '99+' : unreadCount}
                    </span>
                  </>
                )}
              </button>

              {/* Dropdown thông báo */}
              {showNotifications && (
                <div className="absolute right-0 mt-3 w-96 bg-white rounded-2xl shadow-2xl border border-gray-200 z-50 max-h-96 overflow-y-auto">
                  <div className="p-5 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-t-2xl flex justify-between items-center">
                    <h3 className="font-bold text-lg">Thông báo</h3>
                    <button onClick={() => setShowNotifications(false)} className="p-1 hover:bg-white/20 rounded">
                      <X size={20} />
                    </button>
                  </div>
                  {notifications.length === 0 ? (
                    <div className="p-8 text-center">
                      <p className="text-gray-500 font-semibold">Không có thông báo nào</p>
                    </div>
                  ) : (
                    notifications.map(notif => (
                      <div
                        key={notif.id}
                        onClick={() => handleMarkAsRead(notif.id)}
                        className={`p-5 border-b hover:bg-gray-50 cursor-pointer transition ${!notif.is_read ? 'bg-blue-50' : ''}`}
                      >
                        <div className="flex justify-between items-start">
                          <div className="flex-1">
                            <h4 className="font-bold text-gray-900">{notif.title}</h4>
                            <p className="text-gray-700 font-medium mt-1">{notif.content}</p>
                            <p className="text-xs text-gray-500 mt-2 font-medium">
                              {new Date(notif.created_at).toLocaleString('vi-VN')}
                            </p>
                          </div>
                          {!notif.is_read && (
                            <div className="w-3 h-3 bg-blue-600 rounded-full animate-ping"></div>
                          )}
                        </div>
                      </div>
                    ))
                  )}
                </div>
              )}
            </div>

            <button
              onClick={() => setCurrentView('create-request')}
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition font-semibold"
            >
              <Plus size={20} />
              Tạo yêu cầu mới
            </button>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="bg-white rounded-lg shadow-sm p-4">
        <div className="flex gap-2">
          <button
            onClick={() => setCurrentView('my-assets')}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg transition font-medium ${
              currentView === 'my-assets' ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            <Package size={20} />
            Tài sản của tôi
          </button>
          <button
            onClick={() => setCurrentView('my-requests')}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg transition font-medium ${
              currentView === 'my-requests' ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            <FileText size={20} />
            Lịch sử yêu cầu
          </button>
        </div>
      </div>

      {/* Content */}
      {loading && currentView !== 'create-request' ? (
        <div className="bg-white rounded-lg shadow-sm p-12 text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Đang tải...</p>
        </div>
      ) : (
        <>
          {/* My Assets */}
          {currentView === 'my-assets' && (
            <div className="bg-white rounded-lg shadow-sm overflow-hidden">
              <div className="p-4 bg-gray-50 border-b">
                <h2 className="text-lg font-semibold text-gray-600">Tài sản được cấp phát</h2>
              </div>
              <table className="w-full">
                <thead className="bg-gray-50 border-b">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Mã TS</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Tên tài sản</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Loại</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Ngày nhận</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Thao tác</th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {myAssets.map(asset => (
                    <tr key={asset.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 text-sm font-medium text-gray-600">{asset.asset_code}</td>
                      <td className="px-6 py-4 text-sm text-gray-600">{asset.asset_name}</td>
                      <td className="px-6 py-4 text-sm text-gray-600">{asset.category?.category_name}</td>
                      <td className="px-6 py-4 text-sm text-gray-600">{asset.assignment_date?.split('-').reverse().join('/')}</td>
                      <td className="px-6 py-4 text-sm">
                        <button onClick={() => startRepairRequest(asset)} className="text-orange-600 hover:text-orange-800 mr-3 font-semibold">
                          Sửa chữa
                        </button>
                        <button onClick={() => startMaintenanceRequest(asset)} className="text-blue-600 hover:text-blue-800 font-semibold">
                          Bảo trì
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {myAssets.length === 0 && (
                <div className="text-center py-8 text-gray-500">Bạn chưa được cấp phát tài sản nào</div>
              )}
            </div>
          )}

          {/* My Requests */}
          {currentView === 'my-requests' && (
            <div className="bg-white rounded-lg shadow-sm overflow-hidden">
              <div className="p-4 bg-gray-50 border-b">
                <h2 className="text-lg font-semibold text-gray-600">Lịch sử yêu cầu của tôi</h2>
              </div>
              <table className="w-full">
                <thead className="bg-gray-50 border-b">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Loại YC</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Tài sản</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Lý do</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Ngày YC</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Ưu tiên</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Trạng thái</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Người duyệt</th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {requests.map(req => (
                    <tr key={req.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 text-sm text-gray-600">{REQUEST_TYPES[req.request_type]}</td>
                      <td className="px-6 py-4 text-sm text-gray-600">{req.asset?.asset_name || req.asset_name_suggest}</td>
                      <td className="px-6 py-4 text-sm text-gray-600 max-w-xs truncate">{req.reason}</td>
                      <td className="px-6 py-4 text-sm text-gray-600">{req.request_date?.split('-').reverse().join('/')}</td>
                      <td className="px-6 py-4">
                        <span className={`px-3 py-1.5 text-xs font-bold rounded-full ${getPriorityColor(req.priority)}`}>
                          {PRIORITY_LABELS[req.priority]}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`px-3 py-1.5 text-xs font-bold rounded-full ${getStatusColor(req.status)}`}>
                          {STATUS_LABELS[req.status]}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-600">{req.approver?.full_name || '-'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {requests.length === 0 && (
                <div className="text-center py-8 text-gray-500">Bạn chưa có yêu cầu nào</div>
              )}
            </div>
          )}

          {/* Create Request Form */}
          {currentView === 'create-request' && (
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h2 className="text-xl font-bold mb-6 text-gray-700">Tạo yêu cầu mới</h2>
              <div className="space-y-5">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Loại yêu cầu <span className="text-red-500">*</span></label>
                  <select
                    value={requestForm.request_type}
                    onChange={(e) => setRequestForm({ ...requestForm, request_type: e.target.value as RequestType, asset_id_str: '', asset_name_suggest: '' })}
                    className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg text-gray-600 focus:border-blue-500 focus:ring-4 focus:ring-blue-100 outline-none transition"
                  >
                    <option value="PURCHASE">Yêu cầu cấp mới</option>
                    <option value="REPAIR">Yêu cầu sửa chữa</option>
                    <option value="MAINTENANCE">Yêu cầu bảo trì</option>
                  </select>
                </div>

                {requestForm.request_type === 'PURCHASE' && (
                  <>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Loại tài sản <span className="text-red-500">*</span></label>
                      <select
                        value={requestForm.category_id_str}
                        onChange={(e) => setRequestForm({ ...requestForm, category_id_str: e.target.value })}
                        className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg text-gray-600 focus:border-blue-500 focus:ring-4 focus:ring-blue-100 outline-none"
                      >
                        <option value="">Chọn loại tài sản</option>
                        {categories.map(cat => (
                          <option key={cat.id} value={cat.id}>{cat.category_name}</option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Tên tài sản đề xuất <span className="text-red-500">*</span></label>
                      <input
                        type="text"
                        value={requestForm.asset_name_suggest}
                        onChange={(e) => setRequestForm({ ...requestForm, asset_name_suggest: e.target.value })}
                        className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg text-gray-600 placeholder-gray-500 focus:border-blue-500 focus:ring-4 focus:ring-blue-100 outline-none"
                        placeholder="VD: Laptop Dell XPS 15..."
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Số lượng <span className="text-red-500">*</span></label>
                      <input
                        type="number"
                        value={requestForm.quantity}
                        onChange={(e) => setRequestForm({ ...requestForm, quantity: parseInt(e.target.value) || 1 })}
                        min="1"
                        className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg text-gray-600 focus:border-blue-500 focus:ring-4 focus:ring-blue-100 outline-none"
                      />
                    </div>
                  </>
                )}

                {(requestForm.request_type === 'REPAIR' || requestForm.request_type === 'MAINTENANCE') && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Chọn tài sản <span className="text-red-500">*</span></label>
                    <select
                      value={requestForm.asset_id_str}
                      onChange={(e) => setRequestForm({ ...requestForm, asset_id_str: e.target.value })}
                      className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg text-gray-600 focus:border-blue-500 focus:ring-4 focus:ring-blue-100 outline-none"
                    >
                      <option value="">Chọn tài sản từ danh sách của bạn</option>
                      {myAssets.map(asset => (
                        <option key={asset.id} value={asset.id}>
                          {asset.asset_code} - {asset.asset_name}
                        </option>
                      ))}
                    </select>
                  </div>
                )}

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Lý do yêu cầu <span className="text-red-500">*</span></label>
                  <textarea
                    value={requestForm.reason}
                    onChange={(e) => setRequestForm({ ...requestForm, reason: e.target.value })}
                    rows={5}
                    className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg text-gray-600 placeholder-gray-500 focus:border-blue-500 focus:ring-4 focus:ring-blue-100 outline-none resize-none"
                    placeholder="Mô tả chi tiết lý do yêu cầu..."
                  />
                </div>

                <div className="grid grid-cols-2 gap-5">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Ngày cần <span className="text-red-500">*</span></label>
                    <input
                      type="date"
                      value={requestForm.needed_date}
                      onChange={(e) => setRequestForm({ ...requestForm, needed_date: e.target.value })}
                      className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg text-gray-600 focus:border-blue-500 focus:ring-4 focus:ring-blue-100 outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Mức độ ưu tiên <span className="text-red-500">*</span></label>
                    <select
                      value={requestForm.priority}
                      onChange={(e) => setRequestForm({ ...requestForm, priority: e.target.value as RequestPriority })}
                      className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg text-gray-600 focus:border-blue-500 focus:ring-4 focus:ring-blue-100 outline-none"
                    >
                      <option value="LOW">Thấp</option>
                      <option value="MEDIUM">Trung bình</option>
                      <option value="HIGH">Cao</option>
                      <option value="URGENT">Khẩn cấp</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Hình ảnh đính kèm (URL)</label>
                  <input
                    type="text"
                    value={requestForm.image_url}
                    onChange={(e) => setRequestForm({ ...requestForm, image_url: e.target.value })}
                    className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg text-gray-600 placeholder-gray-500 focus:border-blue-500 focus:ring-4 focus:ring-blue-100 outline-none"
                    placeholder="https://..."
                  />
                </div>
              </div>

              <div className="flex gap-3 mt-8">
                <button
                  onClick={handleSubmitRequest}
                  disabled={submitting}
                  className="flex-1 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 font-bold text-lg transition"
                >
                  {submitting ? 'Đang gửi...' : 'Gửi yêu cầu'}
                </button>
                <button
                  onClick={() => { resetForm(); setCurrentView('my-requests'); }}
                  className="flex-1 px-6 py-3 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400 font-bold text-lg transition"
                >
                  Hủy
                </button>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}