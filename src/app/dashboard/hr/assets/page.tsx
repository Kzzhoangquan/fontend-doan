// src/app/dashboard/hr/assets/page.tsx
'use client';

import { useState, useEffect } from 'react';
import { Search, Plus, Edit2, Trash2, Settings, Package } from 'lucide-react';
import { 
  assetService, 
  categoryService, 
  Asset, 
  Category, 
  AssetStatus 
} from '@/lib/api/services/asset.service';
import { useAuth } from '@/hooks/useAuth';
import { UserRole } from '@/lib/constants/roles';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import Modal from '@/components/ui/Modal';
import Badge from '@/components/ui/Badge';

// ✅ Status mapping theo đúng Backend Entity
const STATUS_MAP: Record<AssetStatus, { label: string; variant: string }> = {
  NEW: { label: 'Mới', variant: 'success' },
  IN_USE: { label: 'Đang sử dụng', variant: 'primary' },
  UNDER_REPAIR: { label: 'Đang sửa chữa', variant: 'warning' },
  UNDER_MAINTENANCE: { label: 'Đang bảo trì', variant: 'warning' },
  BROKEN: { label: 'Hỏng', variant: 'danger' },
  LIQUIDATED: { label: 'Đã thanh lý', variant: 'gray' },
};

const STATUSES: AssetStatus[] = [
  'NEW',
  'IN_USE',
  'UNDER_REPAIR',
  'UNDER_MAINTENANCE',
  'BROKEN',
  'LIQUIDATED'
];

export default function AssetsPage() {
  const { hasRole } = useAuth();
  const canManage = hasRole(UserRole.MANAGER);

  // States
  const [assets, setAssets] = useState<Asset[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  const [searchTerm, setSearchTerm] = useState('');
  const [filterCategory, setFilterCategory] = useState('');
  const [filterStatus, setFilterStatus] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  
  const [showAssetModal, setShowAssetModal] = useState(false);
  const [showCategoryModal, setShowCategoryModal] = useState(false);
  const [editingAsset, setEditingAsset] = useState<Asset | null>(null);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const [assetForm, setAssetForm] = useState({
    asset_code: '',
    asset_name: '',
    category_id: 0,
    price: 0,
    purchase_date: '',
    status: 'NEW' as AssetStatus,
    description: '',
  });

  const [categoryForm, setCategoryForm] = useState({
    category_code: '',
    category_name: '',
    description: '',
  });

  // Fetch categories
  useEffect(() => {
    fetchCategories();
  }, []);

  // Fetch assets with debounce
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      fetchAssets();
    }, 300);
    return () => clearTimeout(timeoutId);
  }, [currentPage, itemsPerPage, searchTerm, filterCategory, filterStatus]);

  const fetchCategories = async () => {
    try {
      const data = await categoryService.getAll();
      setCategories(data);
    } catch (err: any) {
      console.error('Error fetching categories:', err);
      setError('Không thể tải danh sách loại tài sản');
    }
  };

  const fetchAssets = async () => {
    setLoading(true);
    setError('');
    try {
      const data = await assetService.getAll({
        page: currentPage,
        pageSize: itemsPerPage,
        search: searchTerm.trim(),
        categoryId: filterCategory ? parseInt(filterCategory) : undefined,
        status: filterStatus ? (filterStatus as AssetStatus) : undefined,
      });
      
      setAssets(data.data);
      setTotal(data.total);
      setTotalPages(data.totalPages);
    } catch (err: any) {
      console.error('Error fetching assets:', err);
      setError(err.response?.data?.message || 'Không thể tải danh sách tài sản');
    } finally {
      setLoading(false);
    }
  };

  // Asset CRUD
  const handleAddAsset = () => {
    setEditingAsset(null);
    setAssetForm({
      asset_code: '',
      asset_name: '',
      category_id: 0,
      price: 0,
      purchase_date: '',
      status: 'NEW',
      description: '',
    });
    setShowAssetModal(true);
  };

  const handleEditAsset = (asset: Asset) => {
    setEditingAsset(asset);
    setAssetForm({
      asset_code: asset.asset_code,
      asset_name: asset.asset_name,
      category_id: asset.category.id,
      price: asset.price || 0,
      purchase_date: asset.purchase_date || '',
      status: asset.status,
      description: asset.description || '',
    });
    setShowAssetModal(true);
  };

  const handleSaveAsset = async () => {
    if (!assetForm.asset_code || !assetForm.asset_name || !assetForm.category_id) {
      alert('Vui lòng điền đầy đủ thông tin bắt buộc!');
      return;
    }

    setSubmitting(true);
    try {
      if (editingAsset) {
        const { asset_code, ...updateData } = assetForm;
        await assetService.update(editingAsset.id, updateData);
        alert('Cập nhật tài sản thành công!');
      } else {
        await assetService.create(assetForm);
        alert('Thêm tài sản thành công!');
      }
      setShowAssetModal(false);
      fetchAssets();
    } catch (err: any) {
      console.error('Error saving asset:', err);
      alert(err.response?.data?.message || 'Không thể lưu tài sản');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteAsset = async (id: number, name: string) => {
    if (!confirm(`Bạn có chắc muốn xóa tài sản "${name}"?`)) return;

    try {
      await assetService.delete(id);
      alert('Xóa tài sản thành công!');
      fetchAssets();
    } catch (err: any) {
      console.error('Error deleting asset:', err);
      alert(err.response?.data?.message || 'Không thể xóa tài sản');
    }
  };

  // Category CRUD
  const handleAddCategory = () => {
    setEditingCategory(null);
    setCategoryForm({ category_code: '', category_name: '', description: '' });
    setShowCategoryModal(true);
  };

  const handleEditCategory = (category: Category) => {
    setEditingCategory(category);
    setCategoryForm({
      category_code: category.category_code,
      category_name: category.category_name,
      description: category.description || '',
    });
  };

  const handleSaveCategory = async () => {
    if (!categoryForm.category_name.trim()) {
      alert('Vui lòng nhập tên loại tài sản!');
      return;
    }

    setSubmitting(true);
    try {
      if (editingCategory) {
        const { category_code, ...updateData } = categoryForm;
        await categoryService.update(editingCategory.id, updateData);
        alert('Cập nhật loại tài sản thành công!');
        setEditingCategory(null);
      } else {
        await categoryService.create(categoryForm);
        alert('Thêm loại tài sản thành công!');
      }
      setCategoryForm({ category_code: '', category_name: '', description: '' });
      fetchCategories();
    } catch (err: any) {
      console.error('Error saving category:', err);
      alert(err.response?.data?.message || 'Không thể lưu loại tài sản');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteCategory = async (id: number, name: string) => {
    if (!confirm(`Bạn có chắc muốn xóa loại tài sản "${name}"?`)) return;

    try {
      await categoryService.delete(id);
      alert('Xóa loại tài sản thành công!');
      fetchCategories();
    } catch (err: any) {
      console.error('Error deleting category:', err);
      const message = err.response?.data?.message || 'Không thể xóa loại tài sản';
      if (message.includes('đang được sử dụng') || message.includes('in use')) {
        alert('Không thể xóa loại tài sản đang được sử dụng!');
      } else {
        alert(message);
      }
    }
  };

  const getStatusBadge = (status: AssetStatus) => {
    const config = STATUS_MAP[status];
    return <Badge variant={config.variant as any}>{config.label}</Badge>;
  };

  // ✅ Sửa getStatistics để dùng đúng status từ backend
  const getStatistics = () => {
    return {
      total: total,
      inUse: assets.filter(a => a.status === 'IN_USE').length,
      maintenance: assets.filter(a => a.status === 'UNDER_MAINTENANCE').length,
      repair: assets.filter(a => a.status === 'UNDER_REPAIR').length,
      broken: assets.filter(a => a.status === 'BROKEN').length,
    };
  };

  const stats = getStatistics();

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Quản lý Tài sản</h1>
          <p className="text-gray-600 mt-1">Quản lý tài sản công ty</p>
        </div>
        {canManage && (
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
        )}
      </div>

      {/* Error */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-xl p-4">
          <p className="text-red-600 text-sm">{error}</p>
        </div>
      )}

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card className="border-l-4 border-l-blue-500">
          <p className="text-sm text-gray-600">Tổng tài sản</p>
          <p className="text-2xl font-bold text-gray-900 mt-1">{stats.total}</p>
        </Card>
        <Card className="border-l-4 border-l-green-500">
          <p className="text-sm text-gray-600">Đang sử dụng</p>
          <p className="text-2xl font-bold text-gray-900 mt-1">{stats.inUse}</p>
        </Card>
        <Card className="border-l-4 border-l-yellow-500">
          <p className="text-sm text-gray-600">Bảo trì</p>
          <p className="text-2xl font-bold text-gray-900 mt-1">{stats.maintenance}</p>
        </Card>
        <Card className="border-l-4 border-l-red-500">
          <p className="text-sm text-gray-600">Hỏng</p>
          <p className="text-2xl font-bold text-gray-900 mt-1">{stats.broken}</p>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-gray-600">
          <Input
            placeholder="Tìm theo tên, mã tài sản..."
            value={searchTerm}
            onChange={(e) => {
              setSearchTerm(e.target.value);
              setCurrentPage(1);
            }}
            icon={<Search className="w-5 h-5" />}
          />
          <select
            value={filterCategory}
            onChange={(e) => {
              setFilterCategory(e.target.value);
              setCurrentPage(1);
            }}
            className="w-full px-4 py-2.5 rounded-lg border focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
          >
            <option value="">Tất cả loại</option>
            {categories.map(cat => (
              <option key={cat.id} value={cat.id}>{cat.category_name}</option>
            ))}
          </select>
          <select
            value={filterStatus}
            onChange={(e) => {
              setFilterStatus(e.target.value);
              setCurrentPage(1);
            }}
            className="w-full px-4 py-2.5 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
          >
            <option value="">Tất cả trạng thái</option>
            {STATUSES.map(status => (
              <option key={status} value={status}>{STATUS_MAP[status].label}</option>
            ))}
          </select>
        </div>
      </Card>

      {/* Loading */}
      {loading ? (
        <Card>
          <div className="flex flex-col items-center justify-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mb-4"></div>
            <p className="text-gray-600">Đang tải dữ liệu...</p>
          </div>
        </Card>
      ) : (
        <>
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
                    {canManage && (
                      <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase">Thao tác</th>
                    )}
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {assets.length === 0 ? (
                    <tr>
                      <td colSpan={canManage ? 7 : 6} className="px-6 py-12 text-center">
                        <Package className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                        <p className="text-gray-500">Không tìm thấy tài sản nào</p>
                      </td>
                    </tr>
                  ) : (
                    assets.map(asset => (
                      <tr key={asset.id} className="hover:bg-gray-50 transition-colors">
                        <td className="px-6 py-4 text-sm font-medium text-gray-900">{asset.asset_code}</td>
                        <td className="px-6 py-4 text-sm text-gray-900">{asset.asset_name}</td>
                        <td className="px-6 py-4 text-sm text-gray-600">{asset.category.category_name}</td>
                        <td className="px-6 py-4 text-sm text-gray-900 font-medium">
                          {asset.price ? `${Number(asset.price).toLocaleString('vi-VN')} ₫` : 'N/A'}
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-600">
                          {asset.purchase_date || 'N/A'}
                        </td>
                        <td className="px-6 py-4">{getStatusBadge(asset.status)}</td>
                        {canManage && (
                          <td className="px-6 py-4">
                            <div className="flex gap-2">
                              <button
                                onClick={() => handleEditAsset(asset)}
                                className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                              >
                                <Edit2 className="w-4 h-4" />
                              </button>
                              <button
                                onClick={() => handleDeleteAsset(asset.id, asset.asset_name)}
                                className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </div>
                          </td>
                        )}
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </Card>

          {/* Pagination */}
          {totalPages > 1 && (
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
                  <span>/ {total} bản ghi</span>
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
          )}
        </>
      )}

      {/* Asset Modal */}
      <Modal
        isOpen={showAssetModal}
        onClose={() => setShowAssetModal(false)}
        title={editingAsset ? 'Sửa Tài sản' : 'Thêm Tài sản Mới'}
        size="md"
      >
        <div className="space-y-4 text-gray-700">
          <Input
            label="Mã tài sản *"
            value={assetForm.asset_code}
            onChange={(e) => setAssetForm({...assetForm, asset_code: e.target.value})}
            placeholder="Nhập mã tài sản"
            disabled={!!editingAsset}
          />
          <Input
            label="Tên tài sản *"
            value={assetForm.asset_name}
            onChange={(e) => setAssetForm({...assetForm, asset_name: e.target.value})}
            placeholder="Nhập tên tài sản"
          />
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Loại tài sản *</label>
            <select
              value={assetForm.category_id}
              onChange={(e) => setAssetForm({...assetForm, category_id: parseInt(e.target.value)})}
              className="w-full px-4 py-2.5 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
            >
              <option value={0}>Chọn loại</option>
              {categories.map(cat => (
                <option key={cat.id} value={cat.id}>{cat.category_name}</option>
              ))}
            </select>
          </div>
          <Input
            label="Giá trị (VNĐ)"
            type="number"
            value={assetForm.price}
            onChange={(e) => setAssetForm({...assetForm, price: parseInt(e.target.value) || 0})}
            placeholder="Nhập giá trị"
          />
          <Input
            label="Ngày mua"
            type="date"
            value={assetForm.purchase_date}
            onChange={(e) => setAssetForm({...assetForm, purchase_date: e.target.value})}
          />
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Trạng thái</label>
            <select
              value={assetForm.status}
              onChange={(e) => setAssetForm({...assetForm, status: e.target.value as AssetStatus})}
              className="w-full px-4 py-2.5 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
            >
              {STATUSES.map(status => (
                <option key={status} value={status}>{STATUS_MAP[status].label}</option>
              ))}
            </select>
          </div>
          <Input
            label="Mô tả"
            value={assetForm.description}
            onChange={(e) => setAssetForm({...assetForm, description: e.target.value})}
            placeholder="Nhập mô tả"
          />
        </div>
        <div className="flex gap-3 mt-6">
          <Button onClick={handleSaveAsset} className="flex-1" disabled={submitting}>
            {submitting ? 'Đang lưu...' : 'Lưu'}
          </Button>
          <Button variant="secondary" onClick={() => setShowAssetModal(false)} className="flex-1">
            Hủy
          </Button>
        </div>
      </Modal>

      {/* Category Modal */}
      <Modal
        isOpen={showCategoryModal}
        onClose={() => setShowCategoryModal(false)}
        title="Quản lý Danh mục Loại Tài sản"
        size="lg"
      >
        <div className="space-y-4 text-gray-700">
          <div className="space-y-3">
            {!editingCategory && (
              <Input
                placeholder="Mã loại danh mục"
                value={categoryForm.category_code}
                onChange={(e) => setCategoryForm({...categoryForm, category_code: e.target.value})}
              />
            )}
            <div className="flex gap-2">
              <Input
                placeholder="Tên loại danh mục"
                value={categoryForm.category_name}
                onChange={(e) => setCategoryForm({...categoryForm, category_name: e.target.value})}
                className="flex-1"
              />
              <Button onClick={handleSaveCategory} disabled={submitting}>
                {submitting ? 'Đang lưu...' : editingCategory ? 'Cập nhật' : 'Thêm'}
              </Button>
              {editingCategory && (
                <Button 
                  variant="secondary" 
                  onClick={() => {
                    setEditingCategory(null);
                    setCategoryForm({ category_code: '', category_name: '', description: '' });
                  }}
                >
                  Hủy
                </Button>
              )}
            </div>
          </div>

          <div className="border rounded-lg overflow-hidden">
            <table className="w-full">
              <thead className="bg-gray-50 border-b">
                <tr>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Mã</th>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Tên loại</th>
                  <th className="px-4 py-3 text-right text-sm font-semibold text-gray-700">Thao tác</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {categories.map(cat => (
                  <tr key={cat.id} className="hover:bg-gray-50">
                    <td className="px-4 py-3 text-sm font-mono">{cat.category_code}</td>
                    <td className="px-4 py-3 text-sm">{cat.category_name}</td>
                    <td className="px-4 py-3 text-right">
                      <div className="flex justify-end gap-2">
                        <button
                          onClick={() => handleEditCategory(cat)}
                          className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDeleteCategory(cat.id, cat.category_name)}
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