'use client';

import React, { useEffect, useMemo, useState } from 'react';
import type { Branch, Product } from '@/types';
import { createBranch, createProduct, deleteBranch, deleteProduct, listBranches, listProducts, updateBranch, updateProduct } from '@/lib/firestore';
import { useStore } from '@/lib/store';
import { updateStoreConfig } from '@/lib/firestore';
import * as api from '@/lib/api';

const tabs = [
  { id: 'products', label: 'Productos' },
  { id: 'branches', label: 'Sucursales' },
  { id: 'store', label: 'Tienda' }
] as const;

type TabId = (typeof tabs)[number]['id'];

function money(n: number) {
  return n.toLocaleString('es-MX', { style: 'currency', currency: 'MXN' });
}

export function AdminDashboard({ onLogout }: { onLogout: () => Promise<void> }) {
  const { store, refresh: refreshStore, setAccentLocal } = useStore();
  const [tab, setTab] = useState<TabId>('products');
  const [products, setProducts] = useState<Product[]>([]);
  const [branches, setBranches] = useState<Branch[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const reload = async () => {
    setLoading(true);
    setError(null);
    try {
      const [p, b] = await Promise.all([listProducts(), listBranches()]);
      setProducts(p);
      setBranches(b);
      await refreshStore();
    } catch (e: any) {
      setError(e?.message || 'Error al cargar datos');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    reload();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [editingBranch, setEditingBranch] = useState<Branch | null>(null);

  const accent = store?.accentColor || '#F59E0B';

  return (
    <div className="mx-auto w-full max-w-5xl px-4 py-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <div className="text-2xl font-bold">Admin</div>
          <div className="text-sm text-neutral-500">CRUD de productos, sucursales y configuración.</div>
        </div>
        <div className="flex gap-2">
        <button className="btn" onClick={onLogout}>Salir</button>
      </div>
      </div>

      <div className="mt-4 flex gap-2">
        {tabs.map((t) => {
          const active = tab === t.id;
          return (
            <button
              key={t.id}
              className={
                'rounded-lg px-3 py-2 text-sm font-medium ' +
                (active ? 'bg-neutral-900 text-white' : 'bg-neutral-100 text-neutral-900')
              }
              onClick={() => setTab(t.id)}
            >
              {t.label}
            </button>
          );
        })}
      </div>

      {loading && <div className="mt-4 text-sm text-neutral-500">Cargando...</div>}
      {error && <div className="mt-4 text-sm text-red-600">{error}</div>}

      {!loading && !error && (
        <div className="mt-4">
          {tab === 'products' && (
            <section className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="text-lg font-semibold">Productos</div>
                <button
                  className="btn btn-accent"
                  onClick={() =>
                    setEditingProduct({
                      id: 'new',
                      storeId: 'default',
                      name: '',
                      price: 0,
                      stock: 0,
                      description: '',
                      imageUrl: '',
                      active: true
                    })
                  }
                >
                  Agregar producto
                </button>
              </div>

              <div className="grid grid-cols-1 gap-3">
                {products.map((p) => (
                  <div key={p.id} className="card p-4">
                    <div className="flex flex-wrap items-start justify-between gap-2">
                      <div>
                        <div className="font-semibold">{p.name}</div>
                        <div className="text-sm text-neutral-600">{money(p.price)} · Stock: {p.stock}</div>
                        <div className="mt-1 text-xs text-neutral-500">{p.description}</div>
                        <div className="mt-1 text-xs text-neutral-500">{p.active ? 'Activo' : 'Inactivo'}</div>
                      </div>
                      <div className="flex gap-2">
                        <button className="btn" onClick={() => setEditingProduct(p)}>
                          Editar
                        </button>
                        <button
                          className="btn"
                          onClick={async () => {
                            if (!confirm('¿Eliminar este producto?')) return;
                            try {
                              await deleteProduct(p.id);
                              await reload();
                            } catch (error: any) {
                              alert(`Error al eliminar: ${error.message}`);
                            }
                          }}
                        >
                          Eliminar
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
                {products.length === 0 && <div className="text-sm text-neutral-500">Sin productos.</div>}
              </div>

              {editingProduct && (
                <Modal onClose={() => setEditingProduct(null)} title={editingProduct.id === 'new' ? 'Nuevo producto' : 'Editar producto'}>
                  <ProductForm
                    initial={editingProduct}
                    onCancel={() => setEditingProduct(null)}
                    onSave={async (values, imageFile) => {
                      if (editingProduct.id === 'new') {
                        const product = await createProduct({
                          storeId: values.storeId,
                          name: values.name,
                          price: values.price,
                          stock: values.stock,
                          description: values.description,
                          imageUrl: values.imageUrl,
                          active: values.active
                        });
                        // Subir imagen si se proporcionó
                        if (imageFile) {
                          try {
                            await api.uploadProductImage(product.id, imageFile);
                          } catch (error: any) {
                            console.error('Error al subir imagen:', error);
                            alert(`Producto creado pero error al subir imagen: ${error.message}`);
                          }
                        }
                      } else {
                        await updateProduct(editingProduct.id, values);
                        // Subir nueva imagen si se proporcionó
                        if (imageFile) {
                          try {
                            await api.uploadProductImage(editingProduct.id, imageFile);
                          } catch (error: any) {
                            console.error('Error al subir imagen:', error);
                            alert(`Producto actualizado pero error al subir imagen: ${error.message}`);
                          }
                        }
                      }
                      setEditingProduct(null);
                      await reload();
                    }}
                  />
                </Modal>
              )}
            </section>
          )}

          {tab === 'branches' && (
            <section className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="text-lg font-semibold">Sucursales</div>
                <button
                  className="btn btn-accent"
                  onClick={() =>
                    setEditingBranch({
                      id: 'new',
                      storeId: 'default',
                      name: '',
                      address: '',
                      hours: '',
                      phone: '',
                      location: { lat: 0, lng: 0 }
                    })
                  }
                >
                  Agregar sucursal
                </button>
              </div>

              <div className="grid grid-cols-1 gap-3">
                {branches.map((b) => (
                  <div key={b.id} className="card p-4">
                    <div className="flex flex-wrap items-start justify-between gap-2">
                      <div>
                        <div className="font-semibold">{b.name}</div>
                        <div className="text-sm text-neutral-600">{b.address}</div>
                        <div className="text-sm text-neutral-600">{b.hours}</div>
                        <div className="text-sm text-neutral-600">{b.phone}</div>
                      </div>
                      <div className="flex gap-2">
                        <button className="btn" onClick={() => setEditingBranch(b)}>
                          Editar
                        </button>
                        <button
                          className="btn"
                          onClick={async () => {
                            if (!confirm('¿Eliminar esta sucursal?')) return;
                            try {
                              await deleteBranch(b.id);
                              await reload();
                            } catch (error: any) {
                              alert(`Error al eliminar: ${error.message}`);
                            }
                          }}
                        >
                          Eliminar
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
                {branches.length === 0 && <div className="text-sm text-neutral-500">Sin sucursales.</div>}
              </div>

              {editingBranch && (
                <Modal onClose={() => setEditingBranch(null)} title={editingBranch.id === 'new' ? 'Nueva sucursal' : 'Editar sucursal'}>
                  <BranchForm
                    initial={editingBranch}
                    onCancel={() => setEditingBranch(null)}
                    onSave={async (values) => {
                      try {
                        if (editingBranch.id === 'new') {
                          await createBranch({
                            storeId: values.storeId,
                            name: values.name,
                            address: values.address,
                            hours: values.hours,
                            phone: values.phone,
                            location: values.location
                          });
                        } else {
                          await updateBranch(editingBranch.id, values);
                        }
                        setEditingBranch(null);
                        await reload();
                      } catch (error: any) {
                        alert(`Error: ${error.message}`);
                      }
                    }}
                  />
                </Modal>
              )}
            </section>
          )}

          {tab === 'store' && (
            <section className="space-y-3">
              <div className="text-lg font-semibold">Configuración de tienda</div>

              <div className="card p-4">
                <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                  <div>
                    <label className="mb-1 block text-sm font-medium">Nombre de la tienda</label>
                    <input
                      className="input"
                      defaultValue={store?.storeName || ''}
                      onChange={(e) => updateStoreConfig({ storeName: e.target.value })}
                      placeholder="Nombre"
                    />
                  </div>
                  <div>
                    <label className="mb-1 block text-sm font-medium">WhatsApp</label>
                    <input
                      className="input"
                      defaultValue={store?.whatsappNumber || ''}
                      onChange={(e) => updateStoreConfig({ whatsappNumber: e.target.value })}
                      placeholder="+52 897 128 2130"
                    />
                  </div>
                  <div>
                    <label className="mb-1 block text-sm font-medium">Color de acento (hex)</label>
                    <input
                      className="input"
                      defaultValue={accent}
                      onChange={(e) => {
                        const v = e.target.value;
                        setAccentLocal(v);
                        updateStoreConfig({ accentColor: v });
                      }}
                      placeholder="#F59E0B"
                    />
                    <div className="mt-2 flex items-center gap-2">
                      <div className="h-6 w-6 rounded" style={{ backgroundColor: 'var(--accent-color)' }} />
                      <div className="text-xs text-neutral-500">Vista previa en tiempo real</div>
                    </div>
                  </div>

                    <div className="sm:col-span-2">
                    <button
                      className="btn btn-accent"
                      onClick={async () => {
                        try {
                          await refreshStore();
                          alert('Guardado ✅');
                        } catch (error: any) {
                          alert(`Error al guardar: ${error.message}`);
                        }
                      }}
                    >
                      Confirmar cambios
                    </button>
                    <div className="mt-2 text-xs text-neutral-500">
                      Los cambios se guardan automáticamente en la base de datos.
                    </div>
                  </div>
                </div>
              </div>
            </section>
          )}
        </div>
      )}
    </div>
  );
}

function Modal({ title, children, onClose }: { title: string; children: React.ReactNode; onClose: () => void }) {
  return (
    <div className="fixed inset-0 z-50">
      <div className="absolute inset-0 bg-black/40" onClick={onClose} />
      <div className="absolute left-1/2 top-1/2 w-[95vw] max-w-xl -translate-x-1/2 -translate-y-1/2 rounded-2xl bg-white p-4 shadow-2xl">
        <div className="flex items-center justify-between border-b border-neutral-200 pb-3">
          <div className="text-lg font-semibold">{title}</div>
          <button className="btn" onClick={onClose}>
            Cerrar
          </button>
        </div>
        <div className="pt-3">{children}</div>
      </div>
    </div>
  );
}

function ProductForm({
  initial,
  onSave,
  onCancel
}: {
  initial: Product;
  onSave: (p: Omit<Product, 'id'>, imageFile?: File) => Promise<void>;
  onCancel: () => void;
}) {
  const [name, setName] = useState(initial.name);
  const [price, setPrice] = useState(initial.price);
  const [stock, setStock] = useState(initial.stock);
  const [description, setDescription] = useState(initial.description);
  const [active, setActive] = useState(initial.active);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const storeId = initial.storeId;

  return (
    <form
      className="space-y-3"
      onSubmit={async (e) => {
        e.preventDefault();
        setUploading(true);
        try {
          await onSave({ storeId, name, price: Number(price), stock: Number(stock), description, imageUrl: initial.imageUrl, active }, imageFile || undefined);
        } finally {
          setUploading(false);
        }
      }}
    >
      <div>
        <label className="mb-1 block text-sm font-medium">Nombre</label>
        <input className="input" value={name} onChange={(e) => setName(e.target.value)} required />
      </div>
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        <div>
          <label className="mb-1 block text-sm font-medium">Precio (MXN)</label>
          <input
            className="input"
            type="number"
            step="0.01"
            min="0"
            value={price}
            onChange={(e) => setPrice(Number(e.target.value))}
            required
          />
        </div>
        <div>
          <label className="mb-1 block text-sm font-medium">Stock</label>
          <input
            className="input"
            type="number"
            min="0"
            value={stock}
            onChange={(e) => setStock(Number(e.target.value))}
            required
          />
        </div>
      </div>
      <div>
        <label className="mb-1 block text-sm font-medium">Descripción</label>
        <textarea className="input" value={description} onChange={(e) => setDescription(e.target.value)} rows={3} />
      </div>
      <div>
        <label className="mb-1 block text-sm font-medium">Imagen (PNG, máximo 500 KB)</label>
        <input
          className="input"
          type="file"
          accept="image/png"
          onChange={(e) => {
            const file = e.target.files?.[0];
            if (file) {
              if (file.type !== 'image/png') {
                alert('Solo se permiten archivos PNG');
                return;
              }
              if (file.size > 512000) {
                alert('El archivo no puede exceder 500 KB');
                return;
              }
              setImageFile(file);
            }
          }}
        />
        {imageFile && (
          <div className="mt-1 text-xs text-green-600">
            Archivo seleccionado: {imageFile.name} ({(imageFile.size / 1024).toFixed(2)} KB)
          </div>
        )}
        {initial.imageUrl && !imageFile && (
          <div className="mt-2">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={initial.imageUrl} alt={initial.name} className="h-20 w-20 rounded object-cover" />
          </div>
        )}
      </div>
      <label className="flex items-center gap-2 text-sm">
        <input type="checkbox" checked={active} onChange={(e) => setActive(e.target.checked)} />
        Activo
      </label>
      <div className="flex gap-2 pt-2">
        <button type="button" className="btn w-full" onClick={onCancel} disabled={uploading}>
          Cancelar
        </button>
        <button type="submit" className="btn btn-accent w-full" disabled={uploading}>
          {uploading ? 'Guardando...' : 'Guardar'}
        </button>
      </div>
    </form>
  );
}

function BranchForm({
  initial,
  onSave,
  onCancel
}: {
  initial: Branch;
  onSave: (b: Omit<Branch, 'id'>) => Promise<void>;
  onCancel: () => void;
}) {
  const [name, setName] = useState(initial.name);
  const [address, setAddress] = useState(initial.address);
  const [phone, setPhone] = useState(initial.phone);
  const [active, setActive] = useState(true);
  const storeId = initial.storeId;

  return (
    <form
      className="space-y-3"
      onSubmit={async (e) => {
        e.preventDefault();
        await onSave({
          storeId,
          name,
          address,
          hours: '',
          phone,
          location: undefined
        });
      }}
    >
      <div>
        <label className="mb-1 block text-sm font-medium">Nombre</label>
        <input className="input" value={name} onChange={(e) => setName(e.target.value)} required />
      </div>
      <div>
        <label className="mb-1 block text-sm font-medium">Dirección</label>
        <input className="input" value={address} onChange={(e) => setAddress(e.target.value)} />
      </div>
      <div>
        <label className="mb-1 block text-sm font-medium">Teléfono</label>
        <input className="input" value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="+52 555 123 4567" />
      </div>
      <label className="flex items-center gap-2 text-sm">
        <input type="checkbox" checked={active} onChange={(e) => setActive(e.target.checked)} />
        Activa
      </label>
      <div className="flex gap-2 pt-2">
        <button type="button" className="btn w-full" onClick={onCancel}>
          Cancelar
        </button>
        <button type="submit" className="btn btn-accent w-full">
          Guardar
        </button>
      </div>
    </form>
  );
}
