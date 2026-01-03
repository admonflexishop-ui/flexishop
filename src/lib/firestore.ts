/**
 * Wrapper para mantener compatibilidad con el código existente
 * Este archivo mapea las funciones antiguas a las nuevas APIs REST
 */

import * as api from './api';
import type { Product, Branch, StoreConfig } from '@/types';

// ============
// Products
// ============
export async function listProducts(): Promise<Product[]> {
  const products = await api.listProducts(false);
  // Transformar desde el formato del backend al formato del frontend
  return products.map((p: any) => ({
    id: p.id,
    storeId: 'default', // El backend no tiene storeId, usar default
    name: p.name,
    price: p.price_cents / 100, // Convertir centavos a pesos
    stock: p.stock,
    description: p.description || '',
    imageUrl: api.getProductImageUrl(p.id),
    active: p.is_active === 1,
    createdAt: p.created_at,
    updatedAt: p.updated_at,
  }));
}

export async function createProduct(data: Omit<Product, 'id'>): Promise<Product> {
  const product = await api.createProduct({
    name: data.name,
    description: data.description || null,
    price_cents: Math.round(data.price * 100), // Convertir pesos a centavos
    stock: data.stock,
    is_active: data.active ? 1 : 0,
  });
  
  return {
    id: product.id,
    storeId: 'default',
    name: product.name,
    price: product.price_cents / 100,
    stock: product.stock,
    description: product.description || '',
    imageUrl: api.getProductImageUrl(product.id),
    active: product.is_active === 1,
    createdAt: product.created_at,
    updatedAt: product.updated_at,
  };
}

export async function updateProduct(id: string, data: Partial<Omit<Product, 'id'>>): Promise<Product> {
  const updateData: any = {};
  
  if (data.name !== undefined) updateData.name = data.name;
  if (data.price !== undefined) updateData.price_cents = Math.round(data.price * 100);
  if (data.stock !== undefined) updateData.stock = data.stock;
  if (data.description !== undefined) updateData.description = data.description || null;
  if (data.active !== undefined) updateData.is_active = data.active ? 1 : 0;
  
  const product = await api.updateProduct(id, updateData);
  
  return {
    id: product.id,
    storeId: 'default',
    name: product.name,
    price: product.price_cents / 100,
    stock: product.stock,
    description: product.description || '',
    imageUrl: api.getProductImageUrl(product.id),
    active: product.is_active === 1,
    createdAt: product.created_at,
    updatedAt: product.updated_at,
  };
}

export async function deleteProduct(id: string): Promise<void> {
  await api.deleteProduct(id);
}

// ============
// Branches
// ============
export async function listBranches(): Promise<Branch[]> {
  const branches = await api.listBranches(false);
  // Transformar desde el formato del backend al formato del frontend
  return branches.map((b: any) => ({
    id: b.id,
    storeId: 'default',
    name: b.name,
    address: b.address || '',
    hours: '', // El backend no tiene hours, dejar vacío
    phone: b.phone || '',
    location: undefined,
    createdAt: b.created_at,
    updatedAt: b.updated_at,
  }));
}

export async function createBranch(data: Omit<Branch, 'id'>): Promise<Branch> {
  const branch = await api.createBranch({
    name: data.name,
    address: data.address || null,
    phone: data.phone || null,
    is_active: 1,
  });
  
  return {
    id: branch.id,
    storeId: 'default',
    name: branch.name,
    address: branch.address || '',
    hours: '',
    phone: branch.phone || '',
    location: undefined,
    createdAt: branch.created_at,
    updatedAt: branch.updated_at,
  };
}

export async function updateBranch(id: string, data: Partial<Omit<Branch, 'id'>>): Promise<Branch> {
  const updateData: any = {};
  
  if (data.name !== undefined) updateData.name = data.name;
  if (data.address !== undefined) updateData.address = data.address || null;
  if (data.phone !== undefined) updateData.phone = data.phone || null;
  
  const branch = await api.updateBranch(id, updateData);
  
  return {
    id: branch.id,
    storeId: 'default',
    name: branch.name,
    address: branch.address || '',
    hours: '',
    phone: branch.phone || '',
    location: undefined,
    createdAt: branch.created_at,
    updatedAt: branch.updated_at,
  };
}

export async function deleteBranch(id: string): Promise<void> {
  await api.deleteBranch(id);
}

// ============
// Settings / Store Config
// ============
export async function getStoreConfig(): Promise<StoreConfig> {
  const settings = await api.getSettings();
  
  return {
    storeId: 'default',
    storeName: settings.store_name,
    accentColor: settings.accent_color,
    whatsappNumber: settings.default_whatsapp || '',
    createdAt: settings.created_at,
    updatedAt: settings.updated_at,
  };
}

export async function updateStoreConfig(data: Partial<StoreConfig>): Promise<StoreConfig> {
  const updateData: any = {};
  
  if (data.storeName !== undefined) updateData.store_name = data.storeName;
  if (data.accentColor !== undefined) updateData.accent_color = data.accentColor;
  if (data.whatsappNumber !== undefined) updateData.default_whatsapp = data.whatsappNumber || null;
  
  const settings = await api.updateSettings(updateData);
  
  return {
    storeId: 'default',
    storeName: settings.store_name,
    accentColor: settings.accent_color,
    whatsappNumber: settings.default_whatsapp || '',
    createdAt: settings.created_at,
    updatedAt: settings.updated_at,
  };
}

