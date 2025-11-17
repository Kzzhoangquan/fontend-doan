import React, { useState } from 'react';
import { Package, FileText, Plus, Bell } from 'lucide-react';

interface Asset {
  id: number;
  assetCode: string;
  assetName: string;
  categoryName: string;
  assignmentDate: string;
  condition: string;
  status: string;
}

interface Request {
  id: number;
  requestType: 'PURCHASE' | 'REPAIR' | 'MAINTENANCE';
  assetNameSuggest?: string;
  categoryId?: number;
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
  approvalDate: string | null;
  approverName: string | null;
}

interface Category {
  id: number;
  name: string;
}

interface Notification {
  id: number;
  type: string;
  title: string;
  content: string;
  isRead: boolean;
  createdAt: string;
}

interface RequestForm {
  requestType: 'PURCHASE' | 'REPAIR' | 'MAINTENANCE';
  assetId: string;
  categoryId: string;
  assetNameSuggest: string;
  quantity: number;
  reason: string;
  neededDate: string;
  priority: 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT';
  imageUrl: string;
}

const EmployeeRequestSystem: React.FC = () => {
  const [currentView, setCurrentView] = useState<'my-assets' | 'my-requests' | 'create-request'>('my-assets');
  
  const currentUser = {
    id: 1,
    name: 'Nguyễn Văn A',
    code: 'NV001',
    department: 'IT'
  };

  const [myAssets] = useState<Asset[]>([
    {
      id: 1,
      assetCode: 'MT001',
      assetName: 'Laptop Dell XPS 15',
      categoryName: 'Máy tính',
      assignmentDate: '2024-01-15',
      condition: 'Tốt',
      status: 'ASSIGNED'
    },
    {
      id: 2,
      assetCode: 'DT001',
      assetName: 'iPhone 15 Pro',
      categoryName: 'Điện thoại',
      assignmentDate: '2024-02-20',
      condition: 'Tốt',
      status: 'ASSIGNED'
    }
  ]);

  const [requests, setRequests] = useState<Request[]>([
    {
      id: 1,
      requestType: 'PURCHASE',
      assetNameSuggest: 'Màn hình Dell 27 inch',
      categoryName: 'Thiết bị văn phòng',
      reason: 'Cần màn hình phụ để làm việc hiệu quả hơn',
      requestDate: '2024-10-15',
      neededDate: '2024-11-01',
      priority: 'MEDIUM',
      status: 'APPROVED',
      approvalDate: '2024-10-16',
      approverName: 'Trần Văn B'
    },
    {
      id: 2,
      requestType: 'REPAIR',
      assetId: 1,
      assetCode: 'MT001',
      assetName: 'Laptop Dell XPS 15',
      reason: 'Bàn phím bị lỗi một số phím',
      requestDate: '2024-10-20',
      neededDate: '2024-10-25',
      priority: 'HIGH',
      status: 'IN_PROGRESS',
      approvalDate: '2024-10-20',
      approverName: 'Trần Văn B'
    },
    {
      id: 3,
      requestType: 'MAINTENANCE',
      assetId: 2,
      assetCode: 'DT001',
      assetName: 'iPhone 15 Pro',
      reason: 'Bảo dưỡng định kỳ',
      requestDate: '2024-10-22',
      neededDate: '2024-11-05',
      priority: 'LOW',
      status: 'PENDING',
      approvalDate: null,
      approverName: null
    }
  ]);

  const [categories] = useState<Category[]>([
    { id: 1, name: 'Máy tính' },
    { id: 2, name: 'Bàn ghế' },
    { id: 3, name: 'Thiết bị văn phòng' },
    { id: 4, name: 'Điện thoại' },
  ]);

  const [notifications, setNotifications] = useState<Notification[]>([
    {
      id: 1,
      type: 'APPROVED',
      title: 'Yêu cầu được duyệt',
      content: 'Yêu cầu mua Màn hình Dell 27 inch đã được phê duyệt',
      isRead: false,
      createdAt: '2024-10-16 10:30'
    },
    {
      id: 2,
      type: 'IN_PROGRESS',
      title: 'Yêu cầu đang xử lý',
      content: 'Yêu cầu sửa chữa Laptop Dell XPS 15 đang được xử lý',
      isRead: false,
      createdAt: '2024-10-20 14:20'
    }
  ]);

  const [requestForm, setRequestForm] = useState<RequestForm>({
    requestType: 'PURCHASE',
    assetId: '',
    categoryId: '',
    assetNameSuggest: '',
    quantity: 1,
    reason: '',
    neededDate: '',
    priority: 'MEDIUM',
    imageUrl: ''
  });

  const [showNotifications, setShowNotifications] = useState<boolean>(false);

  const requestTypes: Record<string, string> = {
    PURCHASE: 'Yêu cầu cấp mới',
    REPAIR: 'Yêu cầu sửa chữa',
    MAINTENANCE: 'Yêu cầu bảo trì'
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
    switch (status) {
      case 'PENDING': return 'bg-yellow-100 text-yellow-800';
      case 'APPROVED': return 'bg-green-100 text-green-800';
      case 'REJECTED': return 'bg-red-100 text-red-800';
      case 'IN_PROGRESS': return 'bg-blue-100 text-blue-800';
      case 'COMPLETED': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getPriorityColor = (priority: string): string => {
    switch (priority) {
      case 'LOW': return 'bg-green-100 text-green-800';
      case 'MEDIUM': return 'bg-blue-100 text-blue-800';
      case 'HIGH': return 'bg-orange-100 text-orange-800';
      case 'URGENT': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const handleSubmitRequest = (): void => {
    if (requestForm.requestType === 'PURCHASE' && !requestForm.assetNameSuggest) {
      alert('Vui lòng nhập tên tài sản đề xuất!');
      return;
    }
    if ((requestForm.requestType === 'REPAIR' || requestForm.requestType === 'MAINTENANCE') && !requestForm.assetId) {
      alert('Vui lòng chọn tài sản cần ' + (requestForm.requestType === 'REPAIR' ? 'sửa chữa' : 'bảo trì') + '!');
      return;
    }
    if (!requestForm.reason) {
      alert('Vui lòng nhập lý do yêu cầu!');
      return;
    }

    const newRequest: Request = {
      id: Date.now(),
      requestType: requestForm.requestType,
      assetNameSuggest: requestForm.assetNameSuggest,
      categoryId: requestForm.categoryId ? parseInt(requestForm.categoryId) : undefined,
      assetId: requestForm.assetId ? parseInt(requestForm.assetId) : undefined,
      quantity: requestForm.quantity,
      reason: requestForm.reason,
      requestDate: new Date().toISOString().split('T')[0],
      neededDate: requestForm.neededDate,
      priority: requestForm.priority,
      status: 'PENDING',
      approvalDate: null,
      approverName: null
    };

    setRequests([newRequest, ...requests]);
    setCurrentView('my-requests');
    alert('Gửi yêu cầu thành công!');
    
    setRequestForm({
      requestType: 'PURCHASE',
      assetId: '',
      categoryId: '',
      assetNameSuggest: '',
      quantity: 1,
      reason: '',
      neededDate: '',
      priority: 'MEDIUM',
      imageUrl: ''
    });
  };

  const unreadCount = notifications.filter(n => !n.isRead).length;

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold text-gray-800">Quản lý Yêu cầu</h1>
              <p className="text-gray-600 mt-1">Xin chào, {currentUser.name} ({currentUser.code})</p>
            </div>
            <div className="flex gap-3">
              <button
                onClick={() => setShowNotifications(!showNotifications)}
                className="relative p-2 bg-gray-100 rounded-lg hover:bg-gray-200 transition"
              >
                <Bell size={24} />
                {unreadCount > 0 && (
                  <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs w-5 h-5 rounded-full flex items-center justify-center">
                    {unreadCount}
                  </span>
                )}
              </button>
              <button
                onClick={() => setCurrentView('create-request')}
                className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
              >
                <Plus size={20} />
                Tạo yêu cầu mới
              </button>
            </div>
          </div>
        </div>

        {showNotifications && (
          <div className="absolute right-6 top-32 w-96 bg-white rounded-lg shadow-lg z-50 max-h-96 overflow-y-auto">
            <div className="p-4 border-b">
              <h3 className="font-semibold">Thông báo ({unreadCount} chưa đọc)</h3>
            </div>
            {notifications.length === 0 ? (
              <div className="p-4 text-center text-gray-500">Không có thông báo</div>
            ) : (
              <div>
                {notifications.map(notif => (
                  <div
                    key={notif.id}
                    className={`p-4 border-b hover:bg-gray-50 cursor-pointer ${!notif.isRead ? 'bg-blue-50' : ''}`}
                  >
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <h4 className="font-medium text-sm">{notif.title}</h4>
                        <p className="text-sm text-gray-600 mt-1">{notif.content}</p>
                        <p className="text-xs text-gray-400 mt-1">{notif.createdAt}</p>
                      </div>
                      {!notif.isRead && (
                        <div className="w-2 h-2 bg-blue-600 rounded-full"></div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        <div className="bg-white rounded-lg shadow-sm p-4 mb-6">
          <div className="flex gap-2">
            <button
              onClick={() => setCurrentView('my-assets')}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg transition ${
                currentView === 'my-assets'
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              <Package size={20} />
              Tài sản của tôi
            </button>
            <button
              onClick={() => setCurrentView('my-requests')}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg transition ${
                currentView === 'my-requests'
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              <FileText size={20} />
              Lịch sử yêu cầu
            </button>
          </div>
        </div>

        {currentView === 'my-assets' && (
          <div className="bg-white rounded-lg shadow-sm overflow-hidden">
            <div className="p-4 bg-gray-50 border-b">
              <h2 className="text-lg font-semibold text-gray-800">Tài sản được cấp phát</h2>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Mã TS</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Tên tài sản</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Loại</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Ngày nhận</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Tình trạng</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Thao tác</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {myAssets.map(asset => (
                    <tr key={asset.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{asset.assetCode}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{asset.assetName}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">{asset.categoryName}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">{asset.assignmentDate}</td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="px-2 py-1 text-xs font-semibold rounded-full bg-green-100 text-green-800">
                          {asset.condition}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm">
                        <button className="text-orange-600 hover:text-orange-800 text-sm mr-2">
                          Yêu cầu sửa chữa
                        </button>
                        <button className="text-blue-600 hover:text-blue-800 text-sm">
                          Yêu cầu bảo trì
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {myAssets.length === 0 && (
                <div className="text-center py-8 text-gray-500">
                  Bạn chưa được cấp phát tài sản nào
                </div>
              )}
            </div>
          </div>
        )}

        {currentView === 'my-requests' && (
          <div className="bg-white rounded-lg shadow-sm overflow-hidden">
            <div className="p-4 bg-gray-50 border-b">
              <h2 className="text-lg font-semibold text-gray-800">Lịch sử yêu cầu của tôi</h2>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b border-gray-200">
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
                <tbody className="bg-white divide-y divide-gray-200">
                  {requests.map(request => (
                    <tr key={request.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {requestTypes[request.requestType]}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {request.assetName || request.assetNameSuggest}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-600 max-w-xs truncate">
                        {request.reason}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                        {request.requestDate}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-2 py-1 text-xs font-semibold rounded-full ${getPriorityColor(request.priority)}`}>
                          {priorityLabels[request.priority]}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(request.status)}`}>
                          {statusLabels[request.status]}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                        {request.approverName || '-'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {requests.length === 0 && (
                <div className="text-center py-8 text-gray-500">
                  Bạn chưa có yêu cầu nào
                </div>
              )}
            </div>
          </div>
        )}

        {currentView === 'create-request' && (
          <div className="bg-white rounded-lg shadow-sm p-6">
            <h2 className="text-xl font-bold mb-6">Tạo yêu cầu mới</h2>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Loại yêu cầu *</label>
                <select
                  value={requestForm.requestType}
                  onChange={(e) => setRequestForm({...requestForm, requestType: e.target.value as 'PURCHASE' | 'REPAIR' | 'MAINTENANCE', assetId: '', assetNameSuggest: ''})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                >
                  <option value="PURCHASE">Yêu cầu cấp mới</option>
                  <option value="REPAIR">Yêu cầu sửa chữa</option>
                  <option value="MAINTENANCE">Yêu cầu bảo trì</option>
                </select>
              </div>

              {requestForm.requestType === 'PURCHASE' && (
                <>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Loại tài sản *</label>
                    <select
                      value={requestForm.categoryId}
                      onChange={(e) => setRequestForm({...requestForm, categoryId: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                    >
                      <option value="">Chọn loại tài sản</option>
                      {categories.map(cat => (
                        <option key={cat.id} value={cat.id}>{cat.name}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Tên tài sản đề xuất *</label>
                    <input
                      type="text"
                      value={requestForm.assetNameSuggest}
                      onChange={(e) => setRequestForm({...requestForm, assetNameSuggest: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                      placeholder="VD: Laptop Dell XPS 15, Màn hình LG 27 inch..."
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Số lượng</label>
                    <input
                      type="number"
                      value={requestForm.quantity}
                      onChange={(e) => setRequestForm({...requestForm, quantity: parseInt(e.target.value) || 1})}
                      min="1"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                    />
                  </div>
                </>
              )}

              {(requestForm.requestType === 'REPAIR' || requestForm.requestType === 'MAINTENANCE') && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Chọn tài sản *</label>
                  <select
                    value={requestForm.assetId}
                    onChange={(e) => setRequestForm({...requestForm, assetId: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                  >
                    <option value="">Chọn tài sản từ danh sách của bạn</option>
                    {myAssets.map(asset => (
                      <option key={asset.id} value={asset.id}>
                        {asset.assetCode} - {asset.assetName}
                      </option>
                    ))}
                  </select>
                </div>
              )}

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Lý do yêu cầu *</label>
                <textarea
                  value={requestForm.reason}
                  onChange={(e) => setRequestForm({...requestForm, reason: e.target.value})}
                  rows={4}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                  placeholder="Mô tả chi tiết lý do yêu cầu..."
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Ngày cần</label>
                  <input
                    type="date"
                    value={requestForm.neededDate}
                    onChange={(e) => setRequestForm({...requestForm, neededDate: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Mức độ ưu tiên</label>
                  <select
                    value={requestForm.priority}
                    onChange={(e) => setRequestForm({...requestForm, priority: e.target.value as 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT'})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                  >
                    <option value="LOW">Thấp</option>
                    <option value="MEDIUM">Trung bình</option>
                    <option value="HIGH">Cao</option>
                    <option value="URGENT">Khẩn cấp</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Hình ảnh đính kèm (URL)</label>
                <input
                  type="text"
                  value={requestForm.imageUrl}
                  onChange={(e) => setRequestForm({...requestForm, imageUrl: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                  placeholder="https://example.com/image.jpg"
                />
              </div>
            </div>

            <div className="flex gap-3 mt-6">
              <button
                onClick={handleSubmitRequest}
                className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              >
                Gửi yêu cầu
              </button>
              <button
                onClick={() => setCurrentView('my-requests')}
                className="flex-1 px-4 py-2 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400"
              >
                Hủy
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default EmployeeRequestSystem;