'use client';

import React, { useEffect, useState } from 'react';
import { AppShell } from '@/components/AppShell';
import type { Branch } from '@/types';
import { listBranches } from '@/lib/firestore';

export default function BranchesPage() {
  const [branches, setBranches] = useState<Branch[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const data = await listBranches();
        if (!mounted) return;
        setBranches(data);
      } catch (e: any) {
        setError(e?.message || 'Error al cargar sucursales');
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
        {loading && <div className="text-sm text-neutral-500">Cargando...</div>}
        {error && <div className="text-sm text-red-600">{error}</div>}
        {!loading && !error && branches.length === 0 && (
          <div className="text-sm text-neutral-500">Sin sucursales aún.</div>
        )}

        <div className="space-y-3">
          {branches.map((b) => (
            <div key={b.id} className="card p-4">
              <div className="text-base font-semibold">{b.name}</div>
              <div className="mt-1 text-sm text-neutral-700">{b.address}</div>
              <div className="mt-1 text-sm text-neutral-700">Horario: {b.hours}</div>
              <div className="mt-1 text-sm text-neutral-700">Tel: {b.phone}</div>
              <div className="mt-3 rounded-lg border border-neutral-200 bg-neutral-50 p-3 text-xs text-neutral-500">
                Mapa: (real en versión final)
              </div>
            </div>
          ))}
        </div>
      </div>
    </AppShell>
  );
}
