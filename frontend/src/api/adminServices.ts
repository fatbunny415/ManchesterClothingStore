import api from './axios';
import type {
  Product,
  CreateProductData,
  UpdateProductData,
  AdminOrder,
  User,
} from '../types';

// ===========================
// Products — Admin
// ===========================
export const adminProductService = {
  async getAll(params?: {
    category?: string;
    search?: string;
    active?: boolean;
  }): Promise<Product[]> {
    const query: Record<string, string | boolean> = {};
    if (params?.category) query.category = params.category;
    if (params?.search) query.search = params.search;
    if (params?.active !== undefined) query.active = params.active;

    const { data } = await api.get<Product[]>('/products', { params: query });
    return data;
  },

  async getById(id: string): Promise<Product> {
    const { data } = await api.get<Product>(`/products/${id}`);
    return data;
  },

  async create(product: CreateProductData): Promise<Product> {
    const { data } = await api.post<Product>('/products', product);
    return data;
  },

  async update(id: string, product: UpdateProductData): Promise<void> {
    await api.put(`/products/${id}`, product);
  },

  async delete(id: string): Promise<void> {
    await api.delete(`/products/${id}`);
  },

  async seed(force: boolean = false): Promise<{ message: string; total: number; force?: boolean }> {
    const { data } = await api.post<{ message: string; total: number; force?: boolean }>(
      `/products/seed${force ? '?force=true' : ''}`
    );
    return data;
  },
};

// ===========================
// Orders — Admin
// ===========================
export const adminOrderService = {
  /** GET /api/orders — Admin/Vendedor: all orders */
  async getAll(): Promise<AdminOrder[]> {
    const { data } = await api.get<AdminOrder[]>('/orders');
    return data;
  },

  /** PUT /api/orders/{id}/status — Update order status */
  async updateStatus(
    orderId: string,
    status: number
  ): Promise<{ message: string; orderId: string; status: string }> {
    const { data } = await api.patch<{
      message: string;
      orderId: string;
      status: string;
    }>(`/orders/${orderId}/status`, { status });
    return data;
  },
};

// ===========================
// Users — Admin (profile)
// ===========================
export const adminUserService = {
  /** GET /api/users/me */
  async getMe(): Promise<User> {
    const { data } = await api.get<User>('/users/me');
    return data;
  },

  /** PUT /api/users/change-password */
  async changePassword(
    currentPassword: string,
    newPassword: string
  ): Promise<string> {
    const { data } = await api.put<string>('/users/change-password', {
      currentPassword,
      newPassword,
    });
    return data;
  },

  /** GET /api/users */
  async getAll(): Promise<any[]> {
    const { data } = await api.get<any[]>('/users');
    return data;
  },

  /** PUT /api/users/{id}/role */
  async updateRole(id: string, role: number): Promise<any> {
    const { data } = await api.put<any>(`/users/${id}/role`, { role });
    return data;
  },

  /** DELETE /api/users/{id} */
  async delete(id: string): Promise<any> {
    const { data } = await api.delete<any>(`/users/${id}`);
    return data;
  }
};
