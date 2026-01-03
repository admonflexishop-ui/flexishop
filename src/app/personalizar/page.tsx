'use client';

import React, { useEffect, useMemo, useState } from 'react';
import { AppShell } from '@/components/AppShell';
import { useStore } from '@/lib/store';
import { updateStoreConfig } from '@/lib/firestore';

function isHex(hex: string) {
  return /^#([0-9a-fA-F]{3}|[0-9a-fA-F]{6})$/.test(hex);
}

export default function PersonalizarPage() {
  const { store, refresh, setAccentLocal } = useStore();
  const [storeName, setStoreName] = useState('');
  const [accent, setAccent] = useState('#F59E0B');
  const [whatsapp, setWhatsapp] = useState('');
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);

  useEffect(() => {
    if (!store) return;
    setStoreName(store.storeName);
    setAccent(store.accentColor);
    setWhatsapp(store.whatsappNumber);
  }, [store]);

  useEffect(() => {
    if (isHex(accent)) setAccentLocal(accent);
  }, [accent, setAccentLocal]);

  const onSave = async () => {
    setMsg(null);
    if (!storeName.trim()) {
      setMsg('El nombre de tienda es obligatorio.');
      return;
    }
    if (!isHex(accent)) {
      setMsg('El color debe ser un HEX válido (ej: #F59E0B).');
      return;
    }
    setSaving(true);
    try {
      await updateStoreConfig({ 
        storeName: storeName.trim(), 
        accentColor: accent,
        whatsappNumber: whatsapp.trim()
      });
      await refresh();
      setMsg('Guardado ✅');
    } catch (e: any) {
      setMsg(e?.message || 'No se pudo guardar.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <AppShell>
      <div className="space-y-4">
        <div className="card p-4">
          <div className="text-lg font-semibold">Personalizar tienda</div>
          <div className="mt-1 text-sm text-neutral-600">
            Vista previa en tiempo real. Guardar cambios requiere permisos de admin.
          </div>

          <div className="mt-4 grid gap-3">
            <label className="grid gap-1">
              <span className="text-xs font-medium text-neutral-700">Nombre de la tienda</span>
              <input className="input" value={storeName} onChange={(e) => setStoreName(e.target.value)} />
            </label>

            <label className="grid gap-1">
              <span className="text-xs font-medium text-neutral-700">Color de acento (HEX)</span>
              <div className="flex gap-2">
                <input className="input" value={accent} onChange={(e) => setAccent(e.target.value)} />
                <input
                  aria-label="color"
                  type="color"
                  value={isHex(accent) ? accent : '#F59E0B'}
                  onChange={(e) => setAccent(e.target.value)}
                  className="h-10 w-12 cursor-pointer rounded-lg border border-neutral-200 bg-white p-1"
                />
              </div>
            </label>

            <label className="grid gap-1">
              <span className="text-xs font-medium text-neutral-700">Número de WhatsApp</span>
              <input 
                className="input"
                type="tel"
                value={whatsapp} 
                onChange={(e) => {
                  // Solo permitir números y algunos caracteres de formato
                  const value = e.target.value.replace(/[^\d\+\-\(\)\s]/g, '');
                  // Limitar a 20 caracteres máximo
                  if (value.length <= 20) {
                    setWhatsapp(value);
                  }
                }} 
                placeholder="+52 555 123 4567"
                maxLength={20}
              />
              <span className="text-xs text-neutral-500">Máximo 20 caracteres</span>
            </label>

            <button className="btn btn-accent w-fit" onClick={onSave} disabled={saving}>
              {saving ? 'Guardando...' : 'Guardar'}
            </button>

            {msg && <div className="text-sm text-neutral-700">{msg}</div>}
          </div>
        </div>
      </div>
    </AppShell>
  );
}
