// ===========================
// Roles & Auth
// ===========================
export type UserRole = 'Admin' | 'Vendedor' | 'Cliente';

export interface User {
  id: string;
  fullName: string;
  email: string;
  role: UserRole;
  phoneNumber?: string;
  address?: string;
  city?: string;
  createdAt?: string;
}

export interface AuthResponse {
  token: string;
  userId: string;
  email: string;
  fullName: string;
  role: UserRole;
  expiresAt: string;
}

// ===========================
// Products
// ===========================
export interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  stock: number;
  category: string;
  isActive: boolean;
  imageUrl?: string;
  sizes?: string;
  colors?: string;
  createdAt: string;
  updatedAt?: string;
}

export interface CreateProductData {
  name: string;
  description: string;
  price: number;
  stock: number;
  category: string;
  imageUrl: string;
  isActive: boolean;
}

export interface UpdateProductData {
  name: string;
  description: string;
  price: number;
  stock: number;
  category: string;
  imageUrl: string;
  isActive: boolean;
}

// ===========================
// Orders
// ===========================
export enum OrderStatusEnum {
  Pending = 1,
  Processing = 2,
  Completed = 3,
  Cancelled = 4,
}

export const ORDER_STATUS_LABELS: Record<string, string> = {
  Pending: 'En proceso',
  Processing: 'En despacho',
  Completed: 'Enviado',
  Cancelled: 'Cancelado',
};

export const ORDER_STATUS_COLORS: Record<string, string> = {
  Pending: 'yellow',
  Processing: 'blue',
  Completed: 'green',
  Cancelled: 'red',
};

export function getOrderStatusLabel(status: string): string {
  return ORDER_STATUS_LABELS[status] || status;
}

export function getOrderStatusColor(status: string): string {
  return ORDER_STATUS_COLORS[status] || 'gray';
}

export interface OrderItem {
  id?: string;
  productId: string;
  productName?: string;
  productImageUrl?: string;
  product?: Product;
  quantity: number;
  unitPrice: number;
  lineTotal?: number;
}

export interface Order {
  id: string;
  userId: string;
  status: string;
  totalAmount: number;
  items: OrderItem[];
  createdAt: string;
  updatedAt?: string;
}

/** Order shape returned by GET /api/orders (admin endpoint) */
export interface AdminOrder {
  id: string;
  userId: string;
  customerName: string;
  customerEmail: string;
  status: string;
  totalAmount: number;
  createdAt: string;
  items: AdminOrderItem[];
}

export interface AdminOrderItem {
  productId: string;
  productName: string;
  productImageUrl?: string;
  quantity: number;
  unitPrice: number;
  lineTotal: number;
}

// ===========================
// Dashboard Metrics
// ===========================
export interface DashboardMetrics {
  totalProducts: number;
  totalOrders: number;
  totalRevenue: number;
  lowStockProducts: number;
}

// ===========================
// Generic API
// ===========================
export interface ApiResponse<T> {
  message?: string;
  data?: T;
  detail?: string;
}
