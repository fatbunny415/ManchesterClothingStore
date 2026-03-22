export type UserRole = 'Admin' | 'Vendedor' | 'Cliente';

export interface User {
  id: string;
  fullName: string;
  email: string;
  role: UserRole;
}

export interface AuthResponse {
  token: string;
  userId: string;
  email: string;
  fullName: string;
  role: UserRole;
  expiresAt: string;
}

export interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  stock: number;
  category: string;
  isActive: boolean;
  imageUrl?: string;
  // Now provided by backend as comma-separated strings
  sizes?: string;
  colors?: string;
  createdAt: string;
  updatedAt?: string;
}

export interface ApiResponse<T> {
  message?: string;
  data?: T;
  detail?: string;
}
