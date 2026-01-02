'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import React, { useMemo, useState } from 'react';
import { useStore } from '@/lib/store';
import { useCart } from '@/lib/cart';
import { CartDrawer } from '@/components/CartDrawer';

const tabs = [
  { href: '/products', label: 'Productos' },
  { href: '/branches', label: 'Sucursales' },
  { href: '/personalizar', label: 'Personalizar' }
];

export function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const { store } = useStore();
  const { items } = useCart();
  const [openCart, setOpenCart] = useState(false);

  const cartCount = useMemo(() => items.reduce((a, it) => a + it.qty, 0), [items]);

  return (
    <div className="min-h-screen">
      <header className="sticky top-0 z-10 border-b border-neutral-200 bg-white/90 backdrop-blur">
        <div className="mx-auto flex w-full max-w-5xl items-center justify-between px-4 py-4">
          <div className="flex items-center gap-3">
            <div
              className="h-8 w-8 rounded-lg"
              style={{ backgroundColor: 'var(--accent-color)' }}
              aria-hidden
            />
            <div className="leading-tight">
              <div className="text-lg font-semibold">{store?.storeName ?? 'FlexiShop'}</div>
              <div className="text-xs text-neutral-500">Tienda lista para WhatsApp</div>
            </div>
          </div>
          <button className="btn btn-accent" onClick={() => setOpenCart(true)}>
            Carrito
            {cartCount > 0 && (
              <span className="ml-2 inline-flex h-5 min-w-5 items-center justify-center rounded-full bg-black/10 px-2 text-xs">
                {cartCount}
              </span>
            )}
          </button>
        </div>
        <div className="mx-auto w-full max-w-5xl px-4 pb-3">
          <nav className="flex gap-2">
            {tabs.map((t) => {
              const active = pathname === t.href;
              return (
                <Link
                  key={t.href}
                  href={t.href}
                  className={
                    'rounded-lg px-3 py-2 text-sm font-medium ' +
                    (active ? 'bg-neutral-900 text-white' : 'bg-neutral-100 text-neutral-900')
                  }
                >
                  {t.label}
                </Link>
              );
            })}
            <div className="flex-1" />
            <Link href="/admin" className="rounded-lg px-3 py-2 text-sm font-medium text-neutral-600 hover:bg-neutral-100">
              Admin
            </Link>
          </nav>
        </div>
      </header>

      <main className="mx-auto w-full max-w-5xl px-4 py-6">{children}</main>

      <CartDrawer open={openCart} onClose={() => setOpenCart(false)} />
    </div>
  );
}
