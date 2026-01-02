'use client';

import React, { useEffect, useMemo, useState } from 'react';
import { AppShell } from '@/components/AppShell';
import { useStore } from '@/lib/store';
import { updateStoreConfig } from '@/lib/firestore';
import { useAuth } from '@/lib/auth';

function isHex(hex: string) {
  return /^#([0-9a-fA-F]{3}|[0-9a-fA-F]{6})$/.test(hex);
}

export default function PersonalizarPage() {
  const { store, refresh, setAccentLocal } = useStore();
  const { role, user } = useAuth();
  const [storeName, setStoreName] = useState('');
  const [accent, setAccent] = useState('#F59E0B');
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);

  useEffect(() => {
    if (!store) return;
    setStoreName(store.storeName);
    setAccent(store.accentColor);
  }, [store]);

  const canSave = useMemo(() => role === 'admin' && !!user, [role, user]);

  useEffect(() => {
    if (isHex(accent)) setAccentLocal(accent);
  }, [accent, setAccentLocal]);

  const onSave = async () => {
    setMsg(null);
    if (!canSave) {
      setMsg('Solo el admin puede guardar cambios.');
      return;
    }
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
      await updateStoreConfig({ storeName: storeName.trim(), accentColor: accent });
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

            <button className="btn btn-accent w-fit" onClick={onSave} disabled={saving}>
              {saving ? 'Guardando...' : 'Guardar'}
            </button>

            {msg && <div className="text-sm text-neutral-700">{msg}</div>}
            {!canSave && (
              <div className="text-xs text-neutral-500">
                Para guardar: inicia sesión en <a className="underline" href="/admin">Admin</a> con un usuario con rol
                <span className="font-semibold"> admin</span>.
              </div>
            )}
          </div>
        </div>
      </div>
    </AppShell>
  );
}
