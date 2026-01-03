'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import * as api from './api';
import { SESSION_STORAGE_KEY } from './session-constants';

type AuthContextType = {
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
};

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // Verificar sessionStorage al cargar
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const logeo = sessionStorage.getItem(SESSION_STORAGE_KEY);
      setIsAuthenticated(logeo === 'true');
      setIsLoading(false);
    }
  }, []);

  const login = async (email: string, password: string) => {
    // El login ya valida credenciales y rol en el backend
    // Si llega aquí sin error, significa que es válido
    await api.login(email, password);
    
    // Guardar en sessionStorage
    if (typeof window !== 'undefined') {
      sessionStorage.setItem(SESSION_STORAGE_KEY, 'true');
      setIsAuthenticated(true);
    }
  };

  const logout = () => {
    // Limpiar sessionStorage
    if (typeof window !== 'undefined') {
      sessionStorage.removeItem(SESSION_STORAGE_KEY);
      setIsAuthenticated(false);
    }
  };

  const value: AuthContextType = {
    isAuthenticated,
    isLoading,
    login,
    logout,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
