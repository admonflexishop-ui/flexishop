'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import type { StoreConfig } from '@/types';
import { getStoreConfig } from './firestore';

type StoreContextType = {
  store: StoreConfig | null;
  refresh: () => Promise<void>;
  setAccentLocal: (color: string) => void;
};

const StoreContext = createContext<StoreContextType | null>(null);

export function StoreProvider({ children }: { children: React.ReactNode }) {
  const [store, setStore] = useState<StoreConfig | null>(null);
  const [accentColor, setAccentColor] = useState('#F59E0B');

  const refresh = async () => {
    try {
      const config = await getStoreConfig();
      setStore(config);
      setAccentColor(config.accentColor);
      // Actualizar CSS variable
      document.documentElement.style.setProperty('--accent-color', config.accentColor);
    } catch (error) {
      console.error('Error loading store config:', error);
    }
  };

  const setAccentLocal = (color: string) => {
    setAccentColor(color);
    document.documentElement.style.setProperty('--accent-color', color);
  };

  useEffect(() => {
    refresh();
  }, []);

  // Actualizar CSS variable cuando cambia el store
  useEffect(() => {
    if (store?.accentColor) {
      document.documentElement.style.setProperty('--accent-color', store.accentColor);
    }
  }, [store?.accentColor]);

  return (
    <StoreContext.Provider value={{ store, refresh, setAccentLocal }}>
      {children}
    </StoreContext.Provider>
  );
}

export function useStore() {
  const ctx = useContext(StoreContext);
  if (!ctx) throw new Error('useStore must be used within StoreProvider');
  return ctx;
}

