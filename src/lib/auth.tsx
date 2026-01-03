'use client';

import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import * as api from './api';

type UserRole = 'admin' | 'customer' | 'editor';

type User = {
  id: string;
  email: string;
  name?: string | null;
  role: UserRole;
};

type AuthContextType = {
  user: User | null;
  role: UserRole;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  refresh: () => Promise<void>;
};

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [hasCheckedSession, setHasCheckedSession] = useState(false);

  const refresh = useCallback(async () => {
    try {
      const userData = await api.getCurrentUser();
      setUser(userData);
      return true;
    } catch (error) {
      setUser(null);
      return false;
    } finally {
      setIsLoading(false);
      setHasCheckedSession(true);
    }
  }, []);

  useEffect(() => {
    // Verificar sesión al cargar la aplicación
    refresh();
  }, [refresh]);

  useEffect(() => {
    // Verificar sesión periódicamente (cada 5 minutos) solo si hay usuario
    if (!user) return;

    const interval = setInterval(() => {
      refresh();
    }, 5 * 60 * 1000); // 5 minutos

    return () => clearInterval(interval);
  }, [user, refresh]);

  // También verificar sesión cuando la ventana recupera el foco
  useEffect(() => {
    const handleFocus = () => {
      if (hasCheckedSession) {
        refresh();
      }
    };

    window.addEventListener('focus', handleFocus);
    return () => window.removeEventListener('focus', handleFocus);
  }, [hasCheckedSession, refresh]);

  const login = async (email: string, password: string) => {
    const userData = await api.login(email, password);
    setUser(userData);
    setIsLoading(false);
    setHasCheckedSession(true);
  };

  const logout = async () => {
    try {
      await api.logout();
    } catch (error) {
      console.error('Error al cerrar sesión:', error);
    } finally {
      setUser(null);
      setIsLoading(false);
      setHasCheckedSession(false);
    }
  };

  const value: AuthContextType = {
    user,
    role: user?.role || 'customer',
    isAuthenticated: !!user && user.role === 'admin',
    isLoading,
    login,
    logout,
    refresh,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
