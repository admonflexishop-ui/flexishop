'use client';

import React, { useEffect, useState } from 'react';
import { AppShell } from '@/components/AppShell';
import type { Branch } from '@/types';
import { listBranches } from '@/lib/firestore';
import { useStore } from '@/lib/store';

// Iconos SVG
const LocationIcon = ({ className }: { className?: string }) => (
  <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
    <path strokeLinecap="round" strokeLinejoin="round" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
  </svg>
);

const ClockIcon = ({ className }: { className?: string }) => (
  <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
  </svg>
);

const PhoneIcon = ({ className }: { className?: string }) => (
  <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
  </svg>
);

const NavigationIcon = ({ className }: { className?: string }) => (
  <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />
  </svg>
);

function BranchCard({ branch }: { branch: Branch }) {
  const { store } = useStore();
  const accentColor = store?.accentColor || '#F59E0B';

  const handleGetDirections = () => {
    if (branch.address) {
      const address = encodeURIComponent(branch.address);
      window.open(`https://www.google.com/maps/search/?api=1&query=${address}`, '_blank');
    }
  };

  const handleCall = () => {
    if (branch.phone) {
      // Limpiar el teléfono para el enlace tel: (mantener solo dígitos y +)
      const cleanPhone = branch.phone.replace(/[^\d+]/g, '');
      window.location.href = `tel:${cleanPhone}`;
    }
  };

  return (
    <div className="card overflow-hidden max-w-[250px] w-full">
      {/* Header con accent color */}
      <div 
        className="px-4 py-3 flex items-center gap-2"
        style={{ backgroundColor: accentColor }}
      >
        <LocationIcon className="w-5 h-5 text-white flex-shrink-0" />
        <div className="text-white font-bold text-base">{branch.name}</div>
      </div>

      {/* Contenido blanco */}
      <div className="p-4 space-y-4">
        {/* Dirección */}
        {branch.address && (
          <div className="flex items-start gap-3">
            <LocationIcon className="w-5 h-5 text-neutral-400 flex-shrink-0 mt-0.5" />
            <div className="flex-1">
              <div className="text-sm font-bold text-neutral-800">Dirección</div>
              <div className="text-sm text-neutral-600 mt-0.5">{branch.address}</div>
            </div>
          </div>
        )}

        {/* Horario - Siempre visible */}
        <div className="flex items-start gap-3">
          <ClockIcon className="w-5 h-5 text-neutral-400 flex-shrink-0 mt-0.5" />
          <div className="flex-1">
            <div className="text-sm font-bold text-neutral-800">Horario</div>
            <div className="text-sm text-neutral-600 mt-0.5">
              {branch.hours || 'No definido'}
            </div>
          </div>
        </div>

        {/* Teléfono */}
        {branch.phone && (
          <div className="flex items-start gap-3">
            <PhoneIcon className="w-5 h-5 text-neutral-400 flex-shrink-0 mt-0.5" />
            <div className="flex-1">
              <div className="text-sm font-bold text-neutral-800">Teléfono</div>
              <div className="text-sm text-neutral-600 mt-0.5">{branch.phone}</div>
            </div>
          </div>
        )}

        {/* Botones de acción */}
        <div className="flex items-center justify-between pt-2 border-t border-neutral-100">
          <button
            onClick={handleGetDirections}
            disabled={!branch.address}
            className="flex items-center gap-2 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            style={{ 
              color: accentColor 
            }}
            onMouseEnter={(e) => {
              if (!e.currentTarget.disabled) {
                e.currentTarget.style.filter = 'brightness(0.85)';
              }
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.filter = '';
            }}
          >
            <NavigationIcon className="w-5 h-5" />
            <span className="text-sm">Cómo llegar</span>
          </button>

          <button
            onClick={handleCall}
            disabled={!branch.phone}
            className="flex items-center gap-2 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            style={{ 
              color: accentColor 
            }}
            onMouseEnter={(e) => {
              if (!e.currentTarget.disabled) {
                e.currentTarget.style.filter = 'brightness(0.85)';
              }
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.filter = '';
            }}
          >
            <PhoneIcon className="w-5 h-5" />
            <span className="text-sm">Llamar</span>
          </button>
        </div>
      </div>
    </div>
  );
}

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

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 justify-items-center">
          {branches.map((b) => (
            <BranchCard key={b.id} branch={b} />
          ))}
        </div>
      </div>
    </AppShell>
  );
}
