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
  sellerPublicUserId?: string;
  images: ProductImage[];
};

export type UserSummary = {
  id: number;
  email: string;
  publicUserId: string;
  role: string;
  isActive: boolean;
};

type ApiResponse = {
  succeeded: boolean;
  token?: string;
  email?: string;
  role?: string;
  publicUserId?: string;
  message?: string;
};

export type UserProductsResponse = {
  publicUserId: string;
  products: ProductSummary[];
};

const API_BASE = import.meta.env.VITE_API_URL ?? '';

export async function login(request: LoginRequest): Promise<ApiResponse> {
  const response = await fetch(`${API_BASE}/api/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(request)
  });
  return response.json();
}

export async function register(request: LoginRequest & { publicUserId: string }): Promise<ApiResponse> {
  const response = await fetch(`${API_BASE}/api/auth/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(request)
  });
  return response.json();
}

export async function getProducts(): Promise<ProductSummary[]> {
  const response = await fetch(`${API_BASE}/api/products`);

  if (!response.ok) {
    throw new Error('產品清單載入失敗');
  }

  const data = await response.json();
  return Array.isArray(data) ? data : [];
}

export async function getProductsByUserId(publicUserId: string): Promise<UserProductsResponse> {
  const response = await fetch(`${API_BASE}/api/products/user/${encodeURIComponent(publicUserId)}`);

  if (!response.ok) {
    const data = await response.json().catch(() => null);
    throw new Error(data?.message || 'Failed to load user page.');
  }

  const data = await response.json();
  return {
    publicUserId: data.publicUserId,
    products: Array.isArray(data.products) ? data.products : []
  };
}

export async function createProduct(payload: ProductCreateRequest, token: string): Promise<ProductSummary> {
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
}

export async function uploadProductImage(productId: number, file: File, token: string): Promise<ProductImage> {
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
}

export async function deleteProduct(productId: number, token: string): Promise<void> {
  const response = await fetch(`${API_BASE}/api/products/${productId}`, {
    method: 'DELETE',
    headers: { Authorization: `Bearer ${token}` }
  });

  if (!response.ok) {
    const data = await response.json().catch(() => null);
    throw new Error(data?.message || 'Failed to delete product.');
  }
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

export async function createSeller(request: LoginRequest & { publicUserId: string }, token: string): Promise<void> {
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
