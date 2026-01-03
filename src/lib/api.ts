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
    credentials: 'include', // Siempre incluir cookies
    headers: {
      'Content-Type': 'application/json',
      ...options?.headers,
    },
    ...options,
  });

  // Verificar si la respuesta tiene contenido antes de parsear JSON
  const contentType = response.headers.get('content-type');
  const text = await response.text();
  
  // Si no hay contenido o no es JSON, lanzar error con el status
  if (!text || !contentType?.includes('application/json')) {
    if (!response.ok) {
      throw new Error(`Error ${response.status}: ${response.statusText || 'Método no permitido'}`);
    }
    throw new Error('Respuesta vacía o inválida del servidor');
  }

  let data: ApiResponse<T>;
  try {
    data = JSON.parse(text);
  } catch (error) {
    throw new Error(`Error al parsear respuesta: ${text.substring(0, 100)}`);
  }

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
    credentials: 'include', // Siempre incluir cookies
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

export function getProductImageUrl(productId: string, cacheBuster?: string | number): string {
  const baseUrl = `${API_BASE}/products/${productId}/image`;
  // Agregar cache buster si se proporciona (timestamp o versión)
  if (cacheBuster !== undefined) {
    return `${baseUrl}?v=${cacheBuster}`;
  }
  return baseUrl;
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
    credentials: 'include',
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

// Logout y getCurrentUser ya no son necesarios
// La autenticación se maneja completamente del lado del cliente con sessionStorage

