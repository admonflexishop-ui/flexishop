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

  // Usar el número de WhatsApp de los settings (default_whatsapp)
  // El store.whatsappNumber viene de default_whatsapp en la base de datos
  const wa = store?.whatsappNumber;
  
  // Validar que existe y tiene contenido válido (mínimo 10 dígitos, máximo 20 caracteres)
  const digits = wa ? wa.replace(/[^0-9]/g, '') : '';
  const hasWhatsApp = wa && wa.trim() && wa.length <= 20 && digits.length >= 10;
  
  // Generar el link de WhatsApp solo si existe el número válido
  const waDigits = hasWhatsApp ? wa!.replace(/[^0-9]/g, '') : '';
  const waLink = hasWhatsApp ? `https://wa.me/${waDigits}?text=${message}` : '#';

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
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex-1 min-w-0">
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
                    <button
                      className="btn text-red-600 hover:text-red-700 hover:bg-red-50 flex-shrink-0"
                      onClick={() => setQty(it.product.id, 0)}
                      aria-label="Eliminar producto"
                      title="Eliminar producto"
                    >
                      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                    </button>
                  </div>
                </div>
              ))}

              <div className="flex items-center justify-between pt-2">
                <div className="text-sm font-semibold">Total</div>
                <div className="text-lg font-bold">{money(total)}</div>
              </div>

              <div className="flex gap-2 pt-2">
                <button className="btn w-full" onClick={clear}>Vaciar carrito</button>
                <button 
                  className={`w-full ${hasWhatsApp ? 'btn-accent' : 'btn opacity-50 cursor-not-allowed'}`}
                  disabled={!hasWhatsApp || items.length === 0}
                  onClick={() => {
                    if (!hasWhatsApp) return;
                    // Abrir WhatsApp usando el número de default_whatsapp de los settings
                    window.open(waLink, '_blank', 'noopener,noreferrer');
                    // Limpiar el carrito
                    clear();
                    // Cerrar el drawer
                    onClose();
                  }}
                >
                  Comprar por WhatsApp
                </button>
              </div>

              {!hasWhatsApp ? (
                <div className="pt-2 text-xs text-yellow-600">
                  ⚠️ Por favor configura el número de WhatsApp en la configuración de la tienda para poder realizar pedidos.
                </div>
              ) : (
                <div className="pt-2 text-xs text-neutral-500">
                  El mensaje de WhatsApp incluye lista de productos, cantidades y total.
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
