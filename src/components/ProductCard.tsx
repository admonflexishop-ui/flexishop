'use client';

import Image from 'next/image';
import React from 'react';
import type { Product } from '@/types';
import { useCart } from '@/lib/cart';

function money(n: number) {
  return n.toLocaleString('es-MX', { style: 'currency', currency: 'MXN' });
}

export function ProductCard({ product }: { product: Product }) {
  const { add } = useCart();

  return (
    <div className="card overflow-hidden">
      <div className="relative aspect-square w-full bg-neutral-50">
        {product.imageUrl ? (
          <Image
            src={product.imageUrl}
            alt={product.name}
            fill
            className="object-cover"
            sizes="(max-width: 768px) 100vw, 33vw"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center text-sm text-neutral-400">Sin imagen</div>
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
