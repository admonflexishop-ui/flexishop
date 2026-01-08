'use client';

import Image from 'next/image';
import React, { useState } from 'react';
import type { Product } from '@/types';
import { useCart } from '@/lib/cart';
import { Spinner } from '@/components/Loader';
import { ProductPlaceholder } from '@/components/ProductPlaceholder';

function money(n: number) {
  return n.toLocaleString('es-MX', { style: 'currency', currency: 'MXN' });
}

export function ProductCard({ product }: { product: Product }) {
  const { add } = useCart();
  const [imageLoading, setImageLoading] = useState(true);
  const [imageError, setImageError] = useState(false);

  return (
    <div className="card overflow-hidden">
      <div className="relative aspect-square w-full bg-neutral-50">
        {product.imageUrl && !imageError ? (
          <>
            {imageLoading && (
              <div className="absolute inset-0 flex items-center justify-center bg-neutral-100">
                <Spinner size="md" />
              </div>
            )}
            <Image
              src={product.imageUrl}
              alt={product.name}
              fill
              className={`object-cover transition-opacity duration-300 ${imageLoading ? 'opacity-0' : 'opacity-100'}`}
              sizes="(max-width: 768px) 100vw, 33vw"
              onLoad={() => setImageLoading(false)}
              onError={() => {
                setImageLoading(false);
                setImageError(true);
              }}
            />
          </>
        ) : (
          <ProductPlaceholder />
        )}
      </div>

      <div className="flex flex-col gap-1 p-3">
        <div className="text-sm font-semibold">{product.name}</div>
        <div className="text-sm font-bold">{money(product.price)}</div>
        <div className="text-xs text-neutral-600">Stock: {product.stock}</div>
        <div className="max-h-10 overflow-hidden text-ellipsis text-xs text-neutral-600">{product.description}</div>

        <button
          className="btn btn-accent mt-2"
          onClick={() => add(product)}
          disabled={product.stock <= 0}
        >
          Agregar al carrito
        </button>
      </div>
    </div>
  );
}
