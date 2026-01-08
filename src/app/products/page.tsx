'use client';

import React, { useEffect, useState } from 'react';
import { AppShell } from '@/components/AppShell';
import { ProductCard } from '@/components/ProductCard';
import { Loader } from '@/components/Loader';
import type { Product } from '@/types';
import { listProducts } from '@/lib/firestore';

export default function ProductsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const data = await listProducts();
        if (!mounted) return;
        setProducts(data.filter((p) => p.active !== false));
      } catch (e: any) {
        setError(e?.message || 'Error al cargar productos');
      } finally {
        setLoading(false);
      }
    })();
    return () => {
      mounted = false;
    };
  }, []);

  return (
    <AppShell>
      <div className="space-y-4">
        {loading && (
          <div className="flex items-center justify-center py-12">
            <Loader size="lg" text="Cargando productos..." />
          </div>
        )}
        {error && <div className="text-sm text-red-600">{error}</div>}
        {!loading && !error && products.length === 0 && (
          <div className="text-sm text-neutral-500">Sin productos aún.</div>
        )}

        {!loading && (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {products.map((p) => (
              <ProductCard key={p.id} product={p} />
            ))}
          </div>
        )}
      </div>
    </AppShell>
  );
}
