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
  const [items, setItems] = useState<Array<any>>([]);
  const [loading, setLoading] = useState(false);

  const loadProducts = async () => {
    setLoading(true);
    const token = JSON.parse(localStorage.getItem('shop:web:auth') || '{}')?.token;
  const response = await fetch(`${API_BASE}/api/products`, {
      headers: token ? { Authorization: `Bearer ${token}` } : undefined
    });
    const data = await response.json();
    setItems(data);
    setLoading(false);
  };

  const createProduct = async (payload: ProductCreateRequest, token: string) => {
    await fetch(`${API_BASE}/api/products`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
      body: JSON.stringify(payload)
    });
    await loadProducts();
  };

  useEffect(() => {
    if (role) {
      void loadProducts();
    }
  }, [role]);

  return { items, loading, loadProducts, createProduct };
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
