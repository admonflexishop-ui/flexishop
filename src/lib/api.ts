/**
 * Cliente API para comunicarse con el backend REST
 */

const API_BASE = '/api';

type ApiResponse<T> = {
  success: boolean;
  data?: T;
  error?: string;
  details?: any;
};

async function apiRequest<T>(
  endpoint: string,
  options?: RequestInit
): Promise<T> {
  const response = await fetch(`${API_BASE}${endpoint}`, {
    headers: {
      'Content-Type': 'application/json',
      ...options?.headers,
    },
    ...options,
  });

  const data: ApiResponse<T> = await response.json();

  if (!data.success) {
    throw new Error(data.error || 'Error en la solicitud');
  }

  if (!response.ok) {
    throw new Error(data.error || `Error ${response.status}`);
  }

  return data.data as T;
}

async function apiFormDataRequest<T>(
  endpoint: string,
  formData: FormData
): Promise<T> {
  const response = await fetch(`${API_BASE}${endpoint}`, {
    method: 'POST',
    body: formData,
  });

  const data: ApiResponse<T> = await response.json();

  if (!data.success) {
    throw new Error(data.error || 'Error en la solicitud');
  }

  if (!response.ok) {
    throw new Error(data.error || `Error ${response.status}`);
  }

  return data.data as T;
}

// ============
// Products
// ============
export async function listProducts(activeOnly: boolean = false) {
  const query = activeOnly ? '?active=true' : '';
  return apiRequest<any[]>(`/products${query}`);
}

export async function getProduct(id: string) {
  return apiRequest<any>(`/products/${id}`);
}

export async function createProduct(data: any) {
  return apiRequest<any>('/products', {
    method: 'POST',
    body: JSON.stringify(data),
  });
}

export async function updateProduct(id: string, data: any) {
  return apiRequest<any>(`/products/${id}`, {
    method: 'PUT',
    body: JSON.stringify(data),
  });
}

export async function deleteProduct(id: string) {
  return apiRequest<{ message: string }>(`/products/${id}`, {
    method: 'DELETE',
  });
}

export async function uploadProductImage(productId: string, file: File) {
  const formData = new FormData();
  formData.append('file', file);
  return apiFormDataRequest<any>(`/products/${productId}/image`, formData);
}

export function getProductImageUrl(productId: string): string {
  return `${API_BASE}/products/${productId}/image`;
}

// ============
// Branches
// ============
export async function listBranches(activeOnly: boolean = false) {
  const query = activeOnly ? '?active=true' : '';
  return apiRequest<any[]>(`/branches${query}`);
}

export async function getBranch(id: string) {
  return apiRequest<any>(`/branches/${id}`);
}

export async function createBranch(data: any) {
  return apiRequest<any>('/branches', {
    method: 'POST',
    body: JSON.stringify(data),
  });
}

export async function updateBranch(id: string, data: any) {
  return apiRequest<any>(`/branches/${id}`, {
    method: 'PUT',
    body: JSON.stringify(data),
  });
}

export async function deleteBranch(id: string) {
  return apiRequest<{ message: string }>(`/branches/${id}`, {
    method: 'DELETE',
  });
}

// ============
// Settings
// ============
export async function getSettings() {
  return apiRequest<any>('/settings');
}

export async function updateSettings(data: any) {
  return apiRequest<any>('/settings', {
    method: 'PUT',
    body: JSON.stringify(data),
  });
}

// ============
// Auth
// ============
export async function login(email: string, password: string) {
  const response = await fetch(`${API_BASE}/auth/login`, {
    method: 'POST',
    credentials: 'include', // Incluir cookies en la solicitud
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ email, password }),
  });

  const data: ApiResponse<any> = await response.json();

  if (!data.success) {
    throw new Error(data.error || 'Error al iniciar sesión');
  }

  if (!response.ok) {
    throw new Error(data.error || `Error ${response.status}`);
  }

  return data.data;
}

export async function logout() {
  const response = await fetch(`${API_BASE}/auth/logout`, {
    method: 'POST',
    credentials: 'include', // Incluir cookies en la solicitud
    headers: {
      'Content-Type': 'application/json',
    },
  });

  const data: ApiResponse<{ message: string }> = await response.json();

  if (!data.success) {
    throw new Error(data.error || 'Error al cerrar sesión');
  }

  return data.data;
}

export async function getCurrentUser() {
  const response = await fetch(`${API_BASE}/auth/me`, {
    method: 'GET',
    credentials: 'include', // Incluir cookies en la solicitud
    headers: {
      'Content-Type': 'application/json',
    },
  });

  const data: ApiResponse<any> = await response.json();

  if (!data.success) {
    throw new Error(data.error || 'No autenticado');
  }

  if (!response.ok) {
    throw new Error(data.error || `Error ${response.status}`);
  }

  return data.data;
}

