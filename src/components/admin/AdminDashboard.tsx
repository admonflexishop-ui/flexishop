'use client';

import React, { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import type { Branch, Product } from '@/types';
import { createBranch, createProduct, deleteBranch, deleteProduct, listBranches, listProducts, updateBranch, updateProduct } from '@/lib/firestore';
import { useStore } from '@/lib/store';
import { updateStoreConfig } from '@/lib/firestore';
import * as api from '@/lib/api';
import { Loader, Spinner } from '@/components/Loader';

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
  
  // Estado local para el formulario de configuración de tienda
  const [storeForm, setStoreForm] = useState({
    storeName: store?.storeName || '',
    whatsappNumber: store?.whatsappNumber || '',
    accentColor: store?.accentColor || '#F59E0B',
  });
  const [savingStore, setSavingStore] = useState(false);
  
  // Actualizar formulario cuando cambia el store
  useEffect(() => {
    if (store) {
      setStoreForm({
        storeName: store.storeName || '',
        whatsappNumber: store.whatsappNumber || '',
        accentColor: store.accentColor || '#F59E0B',
      });
    }
  }, [store]);

  return (
    <div className="mx-auto w-full max-w-5xl px-4 py-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <div className="text-2xl font-bold">Admin</div>
          <div className="text-sm text-neutral-500">CRUD de productos, sucursales y configuración.</div>
        </div>
        <div className="flex gap-2">
          <Link href="/products" className="btn">
            Ver Tienda
          </Link>
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
                            console.log('Subiendo imagen para producto:', product.id);
                            console.log('Archivo:', imageFile.name, imageFile.type, imageFile.size);
                            await api.uploadProductImage(product.id, imageFile);
                            console.log('Imagen subida exitosamente');
                            // Forzar refresh de productos para actualizar URLs de imágenes
                            await reload();
                          } catch (error: any) {
                            console.error('Error al subir imagen:', error);
                            console.error('Error completo:', JSON.stringify(error, null, 2));
                            alert(`Producto creado pero error al subir imagen: ${error.message || 'Error desconocido'}`);
                          }
                        } else {
                          console.log('No se proporcionó archivo de imagen');
                        }
                      } else {
                        await updateProduct(editingProduct.id, values);
                        // Subir nueva imagen si se proporcionó
                        if (imageFile) {
                          try {
                            await api.uploadProductImage(editingProduct.id, imageFile);
                            // Forzar refresh de productos para actualizar URLs de imágenes
                            await reload();
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
                    <label className="mb-1 block text-sm font-medium">Nombre de la tienda *</label>
                    <input
                      className="input"
                      value={storeForm.storeName}
                      onChange={(e) => setStoreForm({ ...storeForm, storeName: e.target.value })}
                      placeholder="Nombre"
                      required
                    />
                  </div>
                  <div>
                    <label className="mb-1 block text-sm font-medium">WhatsApp *</label>
                    <input
                      className="input"
                      type="tel"
                      value={storeForm.whatsappNumber}
                      onChange={(e) => {
                        // Solo permitir números y algunos caracteres de formato
                        const value = e.target.value.replace(/[^\d\+\-\(\)\s]/g, '');
                        // Limitar a 20 caracteres máximo
                        if (value.length <= 20) {
                          setStoreForm({ ...storeForm, whatsappNumber: value });
                        }
                      }}
                      placeholder="+52 555 123 4567"
                      required
                      maxLength={20}
                    />
                    <div className="mt-1 text-xs text-neutral-500">
                      Máximo 20 caracteres
                    </div>
                  </div>
                  <div>
                    <label className="mb-1 block text-sm font-medium">Color de acento *</label>
                    <div className="flex items-center gap-3">
                      <input
                        type="color"
                        value={storeForm.accentColor}
                        onChange={(e) => {
                          const v = e.target.value;
                          setStoreForm({ ...storeForm, accentColor: v });
                          // Vista previa en tiempo real
                          setAccentLocal(v);
                        }}
                        className="h-10 w-20 cursor-pointer rounded border border-neutral-200"
                        required
                      />
                      <input
                        type="text"
                        value={storeForm.accentColor}
                        onChange={(e) => {
                          const v = e.target.value;
                          setStoreForm({ ...storeForm, accentColor: v });
                          // Vista previa en tiempo real
                          setAccentLocal(v);
                        }}
                        placeholder="#F59E0B"
                        className="input flex-1 hidden"
                        pattern="^#[0-9A-Fa-f]{6}$"
                        required
                      />
                    </div>
                    <div className="mt-2 flex items-center gap-2">
                      <div className="h-6 w-6 rounded border border-neutral-200" style={{ backgroundColor: storeForm.accentColor }} />
                      <div className="text-xs text-neutral-500">Vista previa en tiempo real</div>
                    </div>
                  </div>

                  <div className="sm:col-span-2">
                    <button
                      className="btn btn-accent"
                      disabled={savingStore}
                      onClick={async (e) => {
                        e.preventDefault();
                        
                        // Validar que todos los campos estén completos
                        if (!storeForm.storeName.trim()) {
                          alert('El nombre de la tienda es obligatorio');
                          return;
                        }
                        if (!storeForm.whatsappNumber.trim()) {
                          alert('El número de WhatsApp es obligatorio');
                          return;
                        }
                        if (!storeForm.accentColor.trim() || !/^#[0-9A-Fa-f]{6}$/i.test(storeForm.accentColor)) {
                          alert('El color de acento es obligatorio y debe estar en formato hexadecimal (#RRGGBB)');
                          return;
                        }
                        
                        setSavingStore(true);
                        try {
                          // Guardar todos los cambios
                          await updateStoreConfig({
                            storeName: storeForm.storeName.trim(),
                            whatsappNumber: storeForm.whatsappNumber.trim(),
                            accentColor: storeForm.accentColor.trim(),
                          });
                          
                          // Refrescar el estado global para que se refleje en todo el UI
                          await refreshStore();
                          
                          alert('Guardado ✅');
                        } catch (error: any) {
                          alert(`Error al guardar: ${error.message}`);
                        } finally {
                          setSavingStore(false);
                        }
                      }}
                    >
                      {savingStore ? 'Guardando...' : 'Guardar cambios'}
                    </button>
                    <div className="mt-2 text-xs text-neutral-500">
                      Todos los campos son obligatorios. Haz clic en &quot;Guardar cambios&quot; para aplicar las modificaciones.
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
  const [price, setPrice] = useState(initial.price ? String(initial.price) : '');
  const [stock, setStock] = useState(initial.stock ? String(initial.stock) : '');
  const [description, setDescription] = useState(initial.description);
  const [active, setActive] = useState(initial.active);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const storeId = initial.storeId;

  // Simular progreso de carga para dar feedback visual al usuario
  useEffect(() => {
    if (uploading && imageFile) {
      // Simular progreso gradualmente (no es el progreso real, pero da feedback visual)
      const interval = setInterval(() => {
        setUploadProgress((prev) => {
          if (prev >= 90) return prev; // No llegar al 100% hasta que termine realmente
          return prev + Math.random() * 10;
        });
      }, 200);
      return () => clearInterval(interval);
    } else {
      setUploadProgress(0);
    }
  }, [uploading, imageFile]);

  return (
    <form
      className="space-y-3"
      onSubmit={async (e) => {
        e.preventDefault();
        setUploading(true);
        setUploadProgress(0);
        try {
          // Convertir precio y stock a números, manejando valores vacíos
          const priceValue = price === '' || price === '0' ? 0 : parseFloat(String(price)) || 0;
          const stockValue = stock === '' || stock === '0' ? 0 : parseInt(String(stock), 10) || 0;
          
          await onSave({ 
            storeId, 
            name, 
            price: priceValue, 
            stock: stockValue, 
            description, 
            imageUrl: initial.imageUrl, 
            active 
          }, imageFile || undefined);
          setUploadProgress(100);
          // Pequeña pausa para que el usuario vea que terminó
          await new Promise(resolve => setTimeout(resolve, 300));
        } finally {
          setUploading(false);
          setUploadProgress(0);
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
            type="text"
            value={price}
            onChange={(e) => {
              let value = e.target.value;
              // Permitir números, punto decimal, y teclas de control
              // Validar formato: números con máximo un punto decimal y 2 decimales
              const priceRegex = /^\d*\.?\d{0,2}$/;
              if (value === '' || priceRegex.test(value)) {
                setPrice(value);
              }
            }}
            onKeyDown={(e) => {
              // Permitir teclas de control: Tab, Enter, Backspace, Delete, Arrow keys, Home, End
              const allowedKeys = [
                'Tab',
                'Enter',
                'Backspace',
                'Delete',
                'ArrowLeft',
                'ArrowRight',
                'ArrowUp',
                'ArrowDown',
                'Home',
                'End',
              ];
              // Permitir Ctrl/Cmd + A, C, V, X
              if (e.ctrlKey || e.metaKey) {
                return;
              }
              // Si no es una tecla permitida y no es un número o punto, prevenir
              if (!allowedKeys.includes(e.key) && !/[\d.]/.test(e.key)) {
                e.preventDefault();
              }
            }}
            placeholder="0.00"
            required
          />
        </div>
        <div>
          <label className="mb-1 block text-sm font-medium">Stock</label>
          <input
            className="input"
            type="text"
            value={stock}
            onChange={(e) => {
              let value = e.target.value;
              // Solo permitir números enteros
              const numberRegex = /^\d*$/;
              if (value === '' || numberRegex.test(value)) {
                setStock(value);
              }
            }}
            onKeyDown={(e) => {
              // Permitir teclas de control: Tab, Enter, Backspace, Delete, Arrow keys, Home, End
              const allowedKeys = [
                'Tab',
                'Enter',
                'Backspace',
                'Delete',
                'ArrowLeft',
                'ArrowRight',
                'ArrowUp',
                'ArrowDown',
                'Home',
                'End',
              ];
              // Permitir Ctrl/Cmd + A, C, V, X
              if (e.ctrlKey || e.metaKey) {
                return;
              }
              // Si no es una tecla permitida y no es un número, prevenir
              if (!allowedKeys.includes(e.key) && !/[\d]/.test(e.key)) {
                e.preventDefault();
              }
            }}
            placeholder="0"
            required
          />
        </div>
      </div>
      <div>
        <label className="mb-1 block text-sm font-medium">Descripción</label>
        <textarea className="input" value={description} onChange={(e) => setDescription(e.target.value)} rows={3} />
      </div>
      <div>
        <label className="mb-1 block text-sm font-medium">Imagen</label>
        <input
          className="input"
          type="file"
          accept="image/*"
          onChange={(e) => {
            const file = e.target.files?.[0];
            if (file) {
              if (!file.type.startsWith('image/')) {
                alert('El archivo debe ser una imagen');
                return;
              }
              // Validar tamaño máximo (5 MB)
              const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5 MB
              if (file.size > MAX_FILE_SIZE) {
                alert(`El archivo es demasiado grande. Tamaño máximo permitido: 5 MB. Tu archivo: ${(file.size / 1024 / 1024).toFixed(2)} MB`);
                e.target.value = ''; // Limpiar el input
                return;
              }
              setImageFile(file);
            }
          }}
        />
        <div className="mt-1 text-xs text-neutral-500">
          Tamaño máximo: 5 MB. Formatos soportados: PNG, JPEG, GIF, WebP, SVG
        </div>
        {imageFile && (
          <div className="mt-1 text-xs text-green-600">
            Archivo seleccionado: {imageFile.name} ({(imageFile.size / 1024 / 1024).toFixed(2)} MB)
          </div>
        )}
        {uploading && imageFile && (
          <div className="mt-3 space-y-2 rounded-lg border border-neutral-200 p-3 bg-neutral-50">
            <div className="flex items-center gap-2 text-sm text-neutral-700">
              <Spinner size="sm" />
              <span className="font-medium">Subiendo imagen...</span>
            </div>
            <div className="w-full bg-neutral-200 rounded-full h-2 overflow-hidden">
              <div 
                className="bg-accent h-2 rounded-full transition-all duration-300"
                style={{ width: `${Math.min(uploadProgress, 100)}%` }}
              />
            </div>
            <div className="text-xs text-neutral-500">
              {uploadProgress < 90 ? 'Por favor espera, esto puede tardar unos momentos...' : 'Finalizando...'}
            </div>
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
          {uploading ? (
            <span className="flex items-center gap-2">
              <Spinner size="sm" />
              Guardando...
            </span>
          ) : (
            'Guardar'
          )}
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
  const [hours, setHours] = useState(initial.hours);
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
          hours,
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
        <input 
          className="input" 
          type="tel"
          value={phone} 
          onChange={(e) => {
            // Solo permitir números y algunos caracteres de formato
            const value = e.target.value.replace(/[^\d\+\-\(\)\s]/g, '');
            // Limitar a 20 caracteres máximo
            if (value.length <= 20) {
              setPhone(value);
            }
          }} 
          placeholder="+52 555 123 4567"
          maxLength={20}
        />
        <div className="mt-1 text-xs text-neutral-500">
          Máximo 20 caracteres
        </div>
      </div>
      <div>
        <label className="mb-1 block text-sm font-medium">Horario</label>
        <input 
          className="input" 
          value={hours} 
          onChange={(e) => setHours(e.target.value)} 
          placeholder="Lun-Vie: 9:00 - 19:00"
        />
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
