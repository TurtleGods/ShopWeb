import { useEffect, useState } from 'react';

export type LoginRequest = {
  email: string;
  password: string;
};

export type ProductCreateRequest = {
  name: string;
  description: string;
  price: number;
  stock: number;
};

export type ProductImage = {
  url: string;
  publicId: string;
};

export type ProductSummary = {
  id: number;
  name: string;
  description: string;
  price: number;
  stock: number;
  isPublished: boolean;
  sellerId: number;
  images: ProductImage[];
};

export type UserSummary = {
  id: number;
  email: string;
  fullName: string;
  role: string;
  storeName?: string;
  isActive: boolean;
};

type ApiResponse = {
  succeeded: boolean;
  token?: string;
  email?: string;
  role?: string;
  message?: string;
};

const API_BASE = import.meta.env.VITE_API_URL ?? '';

export function useProducts(role: 'Buyer' | 'Seller') {
  const [items, setItems] = useState<ProductSummary[]>([]);
  const [loading, setLoading] = useState(false);

  const loadProducts = async () => {
    setLoading(true);
    const token = JSON.parse(localStorage.getItem('shop:web:auth') || '{}')?.token;
  const response = await fetch(`${API_BASE}/api/products`, {
      headers: token ? { Authorization: `Bearer ${token}` } : undefined
    });
    const data = await response.json();
    setItems(Array.isArray(data) ? data : []);
    setLoading(false);
  };

  const createProduct = async (payload: ProductCreateRequest, token: string): Promise<ProductSummary> => {
    const response = await fetch(`${API_BASE}/api/products`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
      body: JSON.stringify(payload)
    });

    if (!response.ok) {
      const data = await response.json().catch(() => null);
      throw new Error(data?.message || 'Failed to create product.');
    }

    return response.json();
  };

  const uploadProductImage = async (productId: number, file: File, token: string): Promise<ProductImage> => {
    const formData = new FormData();
    formData.append('file', file);

    const response = await fetch(`${API_BASE}/api/products/${productId}/images`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${token}` },
      body: formData
    });

    if (!response.ok) {
      const data = await response.json().catch(() => null);
      throw new Error(data?.message || `Failed to upload image ${file.name}.`);
    }

    return response.json();
  };

  useEffect(() => {
    if (role) {
      void loadProducts();
    }
  }, [role]);

  return { items, loading, loadProducts, createProduct, uploadProductImage };
}

export async function login(request: LoginRequest): Promise<ApiResponse> {
  const response = await fetch(`${API_BASE}/api/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(request)
  });
  return response.json();
}

export async function register(request: LoginRequest & { fullName: string }) {
  const response = await fetch(`${API_BASE}/api/auth/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(request)
  });
  return response.json();
}

export async function getAdminUsers(token: string): Promise<UserSummary[]> {
  const response = await fetch(`${API_BASE}/api/admin/users`, {
    headers: { Authorization: `Bearer ${token}` }
  });

  if (!response.ok) {
    throw new Error('Failed to load users.');
  }

  return response.json();
}

export async function createSeller(
  request: LoginRequest & { fullName: string; storeName: string },
  token: string
): Promise<void> {
  const response = await fetch(`${API_BASE}/api/admin/users/seller`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`
    },
    body: JSON.stringify(request)
  });

  if (!response.ok) {
    const data = await response.json().catch(() => null);
    throw new Error(data?.message || 'Failed to create seller.');
  }
}

export async function updateUserStatus(id: number, isActive: boolean, token: string): Promise<void> {
  const response = await fetch(`${API_BASE}/api/admin/users/${id}/status`, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`
    },
    body: JSON.stringify({ isActive })
  });

  if (!response.ok) {
    const data = await response.json().catch(() => null);
    throw new Error(data?.message || 'Failed to update user status.');
  }
}
