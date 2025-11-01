'use client';

import { useState } from 'react';
import { Search, Plus, Edit2, Trash2, Settings, X, Package } from 'lucide-react';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import Modal from '@/components/ui/Modal';
import Badge from '@/components/ui/Badge';

interface Category {
  id: number;
  name: string;
}

interface Asset {
  id: number;
  code: string;
  name: string;
  categoryId: number;
  value: number;
  purchaseDate: string;
  status: 'Mới' | 'Đang sử dụng' | 'Hỏng' | 'Bảo trì' | 'Thanh lý';
}

export default function AssetsPage() {
  // Categories
  const [categories, setCategories] = useState<Category[]>([
    { id: 1, name: 'Máy tính' },
    { id: 2, name: 'Bàn ghế' },
    { id: 3, name: 'Thiết bị văn phòng' },
    { id: 4, name: 'Điện thoại' },
  ]);

  // Assets
  const [assets, setAssets] = useState<Asset[]>([
    { id: 1, code: 'MT001', name: 'Laptop Dell XPS 15', categoryId: 1, value: 25000000, purchaseDate: '2024-01-15', status: 'Đang sử dụng' },
    { id: 2, code: 'BG001', name: 'Bàn làm việc gỗ', categoryId: 2, value: 3500000, purchaseDate: '2024-02-20', status: 'Mới' },
    { id: 3, code: 'TB001', name: 'Máy in HP LaserJet', categoryId: 3, value: 8000000, purchaseDate: '2024-03-10', status: 'Đang sử dụng' },
    { id: 4, code: 'DT001', name: 'iPhone 15 Pro', categoryId: 4, value: 29000000, purchaseDate: '2024-04-05', status: 'Hỏng' },
    { id: 5, code: 'MT002', name: 'MacBook Pro M3', categoryId: 1, value: 45000000, purchaseDate: '2024-05-12', status: 'Bảo trì' },
  ]);

  const statuses: Asset['status'][] = ['Mới', 'Đang sử dụng', 'Hỏng', 'Bảo trì', 'Thanh lý'];

  // State
  const [searchTerm, setSearchTerm] = useState('');
  const [filterCategory, setFilterCategory] = useState('');
  const [filterStatus, setFilterStatus] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  
  const [showAssetModal, setShowAssetModal] = useState(false);
  const [showCategoryModal, setShowCategoryModal] = useState(false);
  const [editingAsset, setEditingAsset] = useState<Asset | null>(null);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);

  const [assetForm, setAssetForm] = useState({
    code: '',
    name: '',
    categoryId: 0,
    value: 0,
    purchaseDate: '',
    status: 'Mới' as Asset['status']
  });

  const [categoryForm, setCategoryForm] = useState({ name: '' });

  // Filter logic
  const filteredAssets = assets.filter(asset => {
    const matchesSearch = 
      asset.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      asset.code.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = !filterCategory || asset.categoryId === parseInt(filterCategory);
    const matchesStatus = !filterStatus || asset.status === filterStatus;
    return matchesSearch && matchesCategory && matchesStatus;
  });

  // Pagination
  const totalPages = Math.ceil(filteredAssets.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedAssets = filteredAssets.slice(startIndex, startIndex + itemsPerPage);

  // Get category name
  const getCategoryName = (categoryId: number) => {
    return categories.find(c => c.id === categoryId)?.name || '';
  };

  // Asset CRUD
  const handleAddAsset = () => {
    setEditingAsset(null);
    setAssetForm({ code: '', name: '', categoryId: 0, value: 0, purchaseDate: '', status: 'Mới' });
    setShowAssetModal(true);
  };

  const handleEditAsset = (asset: Asset) => {
    setEditingAsset(asset);
    setAssetForm(asset);
    setShowAssetModal(true);
  };

  const handleSaveAsset = () => {
    if (editingAsset) {
      setAssets(assets.map(a => a.id === editingAsset.id ? { ...assetForm, id: a.id } : a));
    } else {
      setAssets([...assets, { ...assetForm, id: Date.now() }]);
    }
    setShowAssetModal(false);
  };

  const handleDeleteAsset = (id: number) => {
    if (window.confirm('Bạn có chắc muốn xóa tài sản này?')) {
      setAssets(assets.filter(a => a.id !== id));
    }
  };

  // Category CRUD
  const handleAddCategory = () => {
    setEditingCategory(null);
    setCategoryForm({ name: '' });
    setShowCategoryModal(true);
  };

  const handleEditCategory = (category: Category) => {
    setEditingCategory(category);
    setCategoryForm(category);
  };

  const handleSaveCategory = () => {
    if (!categoryForm.name.trim()) return;
    
    if (editingCategory) {
      setCategories(categories.map(c => c.id === editingCategory.id ? { ...categoryForm, id: c.id } : c));
      setEditingCategory(null);
    } else {
      setCategories([...categories, { ...categoryForm, id: Date.now() }]);
    }
    setCategoryForm({ name: '' });
  };

  const handleDeleteCategory = (id: number) => {
    const isUsed = assets.some(a => a.categoryId === id);
    if (isUsed) {
      alert('Không thể xóa loại tài sản đang được sử dụng!');
      return;
    }
    if (window.confirm('Bạn có chắc muốn xóa loại tài sản này?')) {
      setCategories(categories.filter(c => c.id !== id));
    }
  };

  const getStatusBadge = (status: Asset['status']) => {
    const variants = {
      'Mới': 'success',
      'Đang sử dụng': 'primary',
      'Hỏng': 'danger',
      'Bảo trì': 'warning',
      'Thanh lý': 'gray',
    };
    return <Badge variant={variants[status] as any}>{status}</Badge>;
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Quản lý Tài sản</h1>
          <p className="text-gray-600 mt-1">Quản lý tài sản công ty</p>
        </div>
        <div className="flex gap-3">
          <Button
            variant="secondary"
            icon={<Settings className="w-5 h-5" />}
            onClick={handleAddCategory}
          >
            Danh mục
          </Button>
          <Button
            icon={<Plus className="w-5 h-5" />}
            onClick={handleAddAsset}
          >
            Thêm Tài sản
          </Button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card className="border-l-4 border-l-blue-500">
          <p className="text-sm text-gray-600">Tổng tài sản</p>
          <p className="text-2xl font-bold text-gray-900 mt-1">{assets.length}</p>
        </Card>
        <Card className="border-l-4 border-l-green-500">
          <p className="text-sm text-gray-600">Đang sử dụng</p>
          <p className="text-2xl font-bold text-gray-900 mt-1">
            {assets.filter(a => a.status === 'Đang sử dụng').length}
          </p>
        </Card>
        <Card className="border-l-4 border-l-yellow-500">
          <p className="text-sm text-gray-600">Bảo trì</p>
          <p className="text-2xl font-bold text-gray-900 mt-1">
            {assets.filter(a => a.status === 'Bảo trì').length}
          </p>
        </Card>
        <Card className="border-l-4 border-l-red-500">
          <p className="text-sm text-gray-600">Hỏng</p>
          <p className="text-2xl font-bold text-gray-900 mt-1">
            {assets.filter(a => a.status === 'Hỏng').length}
          </p>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Input
            placeholder="Tìm theo tên, mã tài sản..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            icon={<Search className="w-5 h-5" />}
          />
          <div>
            <select
              value={filterCategory}
              onChange={(e) => setFilterCategory(e.target.value)}
              className="w-full px-4 py-2.5 rounded-lg border border-gray-300 focus:ring-2 focus:ring-(--color-primary-blue) focus:border-transparent outline-none transition-all"
            >
              <option value="">Tất cả loại</option>
              {categories.map(cat => (
                <option key={cat.id} value={cat.id}>{cat.name}</option>
              ))}
            </select>
          </div>
          <div>
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="w-full px-4 py-2.5 rounded-lg border border-gray-300 focus:ring-2 focus:ring-(--color-primary-blue) focus:border-transparent outline-none transition-all"
            >
              <option value="">Tất cả trạng thái</option>
              {statuses.map(status => (
                <option key={status} value={status}>{status}</option>
              ))}
            </select>
          </div>
        </div>
      </Card>

      {/* Table */}
      <Card padding="none">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase">Mã TS</th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase">Tên tài sản</th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase">Loại</th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase">Giá trị</th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase">Ngày mua</th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase">Trạng thái</th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase">Thao tác</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {paginatedAssets.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-6 py-12 text-center">
                    <Package className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                    <p className="text-gray-500">Không tìm thấy tài sản nào</p>
                  </td>
                </tr>
              ) : (
                paginatedAssets.map(asset => (
                  <tr key={asset.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4 text-sm font-medium text-gray-900">{asset.code}</td>
                    <td className="px-6 py-4 text-sm text-gray-900">{asset.name}</td>
                    <td className="px-6 py-4 text-sm text-gray-600">{getCategoryName(asset.categoryId)}</td>
                    <td className="px-6 py-4 text-sm text-gray-900 font-medium">
                      {asset.value.toLocaleString('vi-VN')} ₫
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600">{asset.purchaseDate}</td>
                    <td className="px-6 py-4">{getStatusBadge(asset.status)}</td>
                    <td className="px-6 py-4">
                      <div className="flex gap-2">
                        <button
                          onClick={() => handleEditAsset(asset)}
                          className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDeleteAsset(asset.id)}
                          className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </Card>

      {/* Pagination */}
      <Card>
        <div className="flex flex-col md:flex-row justify-between items-center gap-4">
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <span>Hiển thị</span>
            <select
              value={itemsPerPage}
              onChange={(e) => {
                setItemsPerPage(Number(e.target.value));
                setCurrentPage(1);
              }}
              className="px-3 py-1 border border-gray-300 rounded-lg"
            >
              <option value={10}>10</option>
              <option value={20}>20</option>
              <option value={50}>50</option>
            </select>
            <span>bản ghi / trang</span>
          </div>
          <div className="flex gap-2">
            <Button
              variant="outline"
              onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
              disabled={currentPage === 1}
            >
              Trước
            </Button>
            <span className="px-4 py-2 text-sm text-gray-700">
              Trang {currentPage} / {totalPages}
            </span>
            <Button
              variant="outline"
              onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
              disabled={currentPage === totalPages}
            >
              Sau
            </Button>
          </div>
        </div>
      </Card>

      {/* Asset Modal */}
      <Modal
        isOpen={showAssetModal}
        onClose={() => setShowAssetModal(false)}
        title={editingAsset ? 'Sửa Tài sản' : 'Thêm Tài sản Mới'}
        size="md"
      >
        <div className="space-y-4">
          <Input
            label="Mã tài sản *"
            value={assetForm.code}
            onChange={(e) => setAssetForm({...assetForm, code: e.target.value})}
            placeholder="Nhập mã tài sản"
          />
          <Input
            label="Tên tài sản *"
            value={assetForm.name}
            onChange={(e) => setAssetForm({...assetForm, name: e.target.value})}
            placeholder="Nhập tên tài sản"
          />
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Loại tài sản *</label>
            <select
              value={assetForm.categoryId}
              onChange={(e) => setAssetForm({...assetForm, categoryId: parseInt(e.target.value)})}
              className="w-full px-4 py-2.5 rounded-lg border border-gray-300 focus:ring-2 focus:ring-(--color-primary-blue) focus:border-transparent outline-none transition-all"
            >
              <option value={0}>Chọn loại</option>
              {categories.map(cat => (
                <option key={cat.id} value={cat.id}>{cat.name}</option>
              ))}
            </select>
          </div>
          <Input
            label="Giá trị (VNĐ) *"
            type="number"
            value={assetForm.value}
            onChange={(e) => setAssetForm({...assetForm, value: parseInt(e.target.value)})}
            placeholder="Nhập giá trị"
          />
          <Input
            label="Ngày mua *"
            type="date"
            value={assetForm.purchaseDate}
            onChange={(e) => setAssetForm({...assetForm, purchaseDate: e.target.value})}
          />
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Trạng thái</label>
            <select
              value={assetForm.status}
              onChange={(e) => setAssetForm({...assetForm, status: e.target.value as Asset['status']})}
              className="w-full px-4 py-2.5 rounded-lg border border-gray-300 focus:ring-2 focus:ring-(--color-primary-blue) focus:border-transparent outline-none transition-all"
            >
              {statuses.map(status => (
                <option key={status} value={status}>{status}</option>
              ))}
            </select>
          </div>
        </div>
        <div className="flex gap-3 mt-6">
          <Button onClick={handleSaveAsset} className="flex-1">Lưu</Button>
          <Button variant="secondary" onClick={() => setShowAssetModal(false)} className="flex-1">Hủy</Button>
        </div>
      </Modal>

      {/* Category Modal */}
      <Modal
        isOpen={showCategoryModal}
        onClose={() => setShowCategoryModal(false)}
        title="Quản lý Danh mục Loại Tài sản"
        size="lg"
      >
        <div className="space-y-4">
          <div className="flex gap-2">
            <Input
              placeholder="Tên loại tài sản"
              value={categoryForm.name}
              onChange={(e) => setCategoryForm({name: e.target.value})}
              className="flex-1"
            />
            <Button onClick={handleSaveCategory}>
              {editingCategory ? 'Cập nhật' : 'Thêm'}
            </Button>
          </div>

          <div className="border rounded-lg overflow-hidden">
            <table className="w-full">
              <thead className="bg-gray-50 border-b">
                <tr>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Tên loại</th>
                  <th className="px-4 py-3 text-right text-sm font-semibold text-gray-700">Thao tác</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {categories.map(cat => (
                  <tr key={cat.id} className="hover:bg-gray-50">
                    <td className="px-4 py-3 text-sm">{cat.name}</td>
                    <td className="px-4 py-3 text-right">
                      <div className="flex justify-end gap-2">
                        <button
                          onClick={() => handleEditCategory(cat)}
                          className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDeleteCategory(cat.id)}
                          className="p-2 text-red-600 hover:bg-red-50 rounded-lg"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </Modal>
    </div>
  );
}