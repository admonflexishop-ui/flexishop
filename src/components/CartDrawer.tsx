'use client';

import React from 'react';
import { useCart } from '@/lib/cart';
import { useStore } from '@/lib/store';

function money(n: number) {
  return n.toLocaleString('es-MX', { style: 'currency', currency: 'MXN' });
}

export function CartDrawer({ open, onClose }: { open: boolean; onClose: () => void }) {
  const { items, setQty, clear, total } = useCart();
  const { store } = useStore();

  if (!open) return null;

  const message = encodeURIComponent(
    ['Hola, quiero comprar:', ...items.map((it) => `• ${it.product.name} x${it.qty} = ${money(it.product.price * it.qty)}`), '', `Total: ${money(total)}`].join('\n')
  );

  const wa = store?.whatsappNumber || '+52 897 128 2130';
  const waDigits = wa.replace(/[^0-9]/g, '');
  const waLink = `https://wa.me/${waDigits}?text=${message}`;

  return (
    <div className="fixed inset-0 z-50">
      <div className="absolute inset-0 bg-black/40" onClick={onClose} />
      <div className="absolute right-0 top-0 h-full w-full max-w-md bg-white shadow-2xl">
        <div className="flex items-center justify-between border-b border-neutral-200 p-4">
          <div className="text-lg font-semibold">Carrito</div>
          <button className="btn" onClick={onClose}>Cerrar</button>
        </div>

        <div className="p-4">
          {items.length === 0 ? (
            <div className="text-sm text-neutral-500">Tu carrito está vacío.</div>
          ) : (
            <div className="space-y-3">
              {items.map((it) => (
                <div key={it.product.id} className="card p-3">
                  <div className="font-medium">{it.product.name}</div>
                  <div className="mt-1 flex items-center justify-between">
                    <div className="text-sm text-neutral-600">{money(it.product.price)}</div>
                    <div className="flex items-center gap-2">
                      <button
                        className="btn"
                        onClick={() => setQty(it.product.id, Math.max(1, it.qty - 1))}
                        aria-label="decrement"
                      >
                        −
                      </button>
                      <div className="w-8 text-center">{it.qty}</div>
                      <button
                        className="btn"
                        onClick={() => setQty(it.product.id, it.qty + 1)}
                        aria-label="increment"
                      >
                        +
                      </button>
                    </div>
                  </div>
                </div>
              ))}

              <div className="flex items-center justify-between pt-2">
                <div className="text-sm font-semibold">Total</div>
                <div className="text-lg font-bold">{money(total)}</div>
              </div>

              <div className="flex gap-2 pt-2">
                <button className="btn w-full" onClick={clear}>Vaciar carrito</button>
                <a className="btn-accent w-full text-center" href={waLink} target="_blank" rel="noreferrer">
                  Comprar por WhatsApp
                </a>
              </div>

              <div className="pt-2 text-xs text-neutral-500">
                El mensaje de WhatsApp incluye lista de productos, cantidades y total.
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
