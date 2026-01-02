'use client';

import React, { createContext, useContext, useEffect, useMemo, useState } from 'react';
import type { Product } from '@/types';

export type CartItem = {
  product: Product;
  qty: number;
};

type CartState = {
  items: CartItem[];
  add: (p: Product) => void;
  setQty: (productId: string, qty: number) => void;
  clear: () => void;
  total: number;
};

const KEY = 'flexishop_cart_v1';

const CartContext = createContext<CartState | null>(null);

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([]);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(KEY);
      if (raw) setItems(JSON.parse(raw));
    } catch {}
  }, []);

  useEffect(() => {
    try {
      localStorage.setItem(KEY, JSON.stringify(items));
    } catch {}
  }, [items]);

  const total = useMemo(
    () => items.reduce((acc, it) => acc + (Number(it.product.price) || 0) * it.qty, 0),
    [items]
  );

  const value = useMemo<CartState>(
    () => ({
      items,
      total,
      add: (p) => {
        setItems((prev) => {
          const existing = prev.find((x) => x.product.id === p.id);
          if (existing) return prev.map((x) => (x.product.id === p.id ? { ...x, qty: x.qty + 1 } : x));
          return [...prev, { product: p, qty: 1 }];
        });
      },
      setQty: (productId, qty) => {
        setItems((prev) =>
          prev
            .map((x) => (x.product.id === productId ? { ...x, qty } : x))
            .filter((x) => x.qty > 0)
        );
      },
      clear: () => setItems([])
    }),
    [items, total]
  );

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error('useCart must be used within CartProvider');
  return ctx;
}
