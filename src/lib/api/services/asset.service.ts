// src/lib/api/services/asset.service.ts
import api from '../axios';

// ===== TYPES =====
export interface Category {
  id: number;
  category_code: string;
  category_name: string;
  description?: string;
  created_at?: any;
  updated_at?: any;
}

export type AssetStatus = 
  | 'NEW' 
  | 'IN_USE' 
  | 'UNDER_REPAIR'       
  | 'UNDER_MAINTENANCE'   
  | 'BROKEN' 
  | 'LIQUIDATED';         

export interface Asset {
  id: number;
  asset_code: string;
  asset_name: string;
  category: Category;
  price?: number;
  purchase_date?: string;
  status: AssetStatus;
  description?: string;
  image_url?: string;
  current_holder_id?: number;
  current_assignment_date?: string;
  created_at?: any;
  updated_at?: any;
}

export interface AssetsResponse {
  data: Asset[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

export interface GetAssetsParams {
  page?: number;
  pageSize?: number;
  search?: string;
  categoryId?: number;
  status?: AssetStatus;
  sortBy?: string;
  sortOrder?: 'ASC' | 'DESC';
}

export interface CreateAssetDto {
  asset_code: string;
  asset_name: string;
  category_id: number;
  price?: number;
  purchase_date?: string;
  status?: AssetStatus;
  description?: string;
  image_url?: string;
}

export interface UpdateAssetDto {
  asset_name?: string;
  category_id?: number;
  price?: number;
  purchase_date?: string;
  status?: AssetStatus;
  description?: string;
  image_url?: string;
}

export interface CreateCategoryDto {
  category_code: string;
  category_name: string;
  description?: string;
}

export interface UpdateCategoryDto {
  category_name?: string;
  description?: string;
}

// ===== ASSET SERVICE =====
export const assetService = {
  /**
   * Lấy danh sách tài sản (có phân trang, tìm kiếm, lọc)
   */
  getAll: async (params?: GetAssetsParams): Promise<AssetsResponse> => {
    const response = await api.get<AssetsResponse>('/assets', { params });
    return response.data;
  },

  /**
   * Lấy chi tiết 1 tài sản
   */
  getById: async (id: number): Promise<Asset> => {
    const response = await api.get<Asset>(`/assets/${id}`);
    return response.data;
  },

  /**
   * Tạo tài sản mới
   */
  create: async (data: CreateAssetDto): Promise<Asset> => {
    const response = await api.post<Asset>('/assets', data);
    return response.data;
  },

  /**
   * Cập nhật tài sản
   */
  update: async (id: number, data: UpdateAssetDto): Promise<Asset> => {
    const response = await api.put<Asset>(`/assets/${id}`, data);
    return response.data;
  },

  /**
   * Xóa tài sản
   */
  delete: async (id: number): Promise<void> => {
    await api.delete(`/assets/${id}`);
  },

  /**
   * Cập nhật trạng thái tài sản
   */
  updateStatus: async (id: number, status: AssetStatus): Promise<Asset> => {
    const response = await api.patch<Asset>(`/assets/${id}/status`, { status });
    return response.data;
  },
};

// ===== CATEGORY SERVICE =====
export const categoryService = {
  /**
   * Lấy danh sách tất cả loại tài sản
   */
  getAll: async (): Promise<Category[]> => {
    const response = await api.get<Category[]>('/categories');
    return response.data;
  },

  /**
   * Lấy chi tiết 1 loại tài sản
   */
  getById: async (id: number): Promise<Category> => {
    const response = await api.get<Category>(`/categories/${id}`);
    return response.data;
  },

  /**
   * Tạo loại tài sản mới
   */
  create: async (data: CreateCategoryDto): Promise<Category> => {
    const response = await api.post<Category>('/categories', data);
    return response.data;
  },

  /**
   * Cập nhật loại tài sản
   */
  update: async (id: number, data: UpdateCategoryDto): Promise<Category> => {
    const response = await api.put<Category>(`/categories/${id}`, data);
    return response.data;
  },

  /**
   * Xóa loại tài sản
   */
  delete: async (id: number): Promise<void> => {
    await api.delete(`/categories/${id}`);
  },

  /**
   * Lấy danh sách tài sản thuộc 1 loại
   */
  getAssets: async (id: number, params?: GetAssetsParams): Promise<AssetsResponse> => {
    const response = await api.get<AssetsResponse>('/assets', {
      params: { ...params, categoryId: id },
    });
    return response.data;
  },
};