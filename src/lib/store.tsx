'use client';

import React, { createContext, useContext, useEffect, useMemo, useState } from 'react';
import type { StoreConfig } from '@/types';
import { getStoreConfig } from '@/lib/firestore';

type StoreState = {
  store: StoreConfig | null;
  loading: boolean;
  refresh: () => Promise<void>;
  setAccentLocal: (hex: string) => void; // for live preview
};

const StoreContext = createContext<StoreState | null>(null);

export function StoreProvider({ children }: { children: React.ReactNode }) {
  const [store, setStore] = useState<StoreConfig | null>(null);
  const [loading, setLoading] = useState(true);

  const applyAccent = (hex: string) => {
    if (typeof document !== 'undefined') {
      document.documentElement.style.setProperty('--accent-color', hex);
    }
  };

  const refresh = async () => {
    setLoading(true);
    const cfg = await getStoreConfig();
    setStore(cfg);
    applyAccent(cfg.accentColor);
    setLoading(false);
  };

  useEffect(() => {
    refresh().catch(() => setLoading(false));
  }, []);

  const value = useMemo<StoreState>(
    () => ({
      store,
      loading,
      refresh,
      setAccentLocal: (hex) => applyAccent(hex)
    }),
    [store, loading]
  );

  return <StoreContext.Provider value={value}>{children}</StoreContext.Provider>;
}

export function useStore() {
  const ctx = useContext(StoreContext);
  if (!ctx) throw new Error('useStore must be used within StoreProvider');
  return ctx;
}
