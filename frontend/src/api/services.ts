import api from './axios';
import { AuthResponse, User } from '../types';

export const authService = {
  async login(email: string, password: string): Promise<AuthResponse> {
    const { data } = await api.post<AuthResponse>('/auth/login', { email, password });
    return data;
  },

  async register(fullName: string, email: string, password: string): Promise<{ message: string }> {
    const { data } = await api.post<{ message: string }>('/auth/register', { fullName, email, password });
    return data;
  },
};

export const productService = {
  async getAll(category?: string, search?: string, active?: boolean) {
    const params: any = {};
    if (category && category !== 'Todos') params.category = category;
    if (search) params.search = search;
    if (active !== undefined) params.active = active;

    const { data } = await api.get('/products', { params });
    return data;
  },

  async getById(id: string) {
    const { data } = await api.get(`/products/${id}`);
    return data;
  },

  async create(productData: any) {
    const { data } = await api.post('/products', productData);
    return data;
  },

  async seed() {
    const { data } = await api.post('/products/seed');
    return data;
  }
};

export const cartService = {
  async getMyCart() {
    const { data } = await api.get('/carts');
    return data;
  },

  async addItem(productId: string, quantity: number = 1) {
    const { data } = await api.post('/carts/items', { productId, quantity });
    return data;
  },

  async updateItem(itemId: string, quantity: number) {
    const { data } = await api.put(`/carts/items/${itemId}`, { quantity });
    return data;
  },

  async removeItem(itemId: string) {
    const { data } = await api.delete(`/carts/items/${itemId}`);
    return data;
  },

  async clearCart() {
    const { data } = await api.delete('/carts');
    return data;
  }
};

export const orderService = {
  async getMyOrders() {
    const { data } = await api.get('/orders/my-orders');
    return data;
  },

  async getById(id: string) {
    const { data } = await api.get(`/orders/${id}`);
    return data;
  },

  async createOrder() {
    const { data } = await api.post('/orders/checkout');
    return data;
  }
};


