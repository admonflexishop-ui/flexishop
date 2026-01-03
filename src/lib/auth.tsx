'use client';

import React, { createContext, useContext, useState } from 'react';

type UserRole = 'admin' | 'customer';

type AuthContextType = {
  user: any | null;
  role: UserRole;
  isAuthenticated: boolean;
};

// TODO: Implementar autenticación real con el backend
// Por ahora, retornamos valores por defecto
const AuthContext = createContext<AuthContextType>({
  user: null,
  role: 'customer',
  isAuthenticated: false,
});

export function AuthProvider({ children }: { children: React.ReactNode }) {
  // TODO: Implementar lógica de autenticación
  // Por ahora, siempre retornamos customer
  const [user] = useState<any | null>(null);
  const [role] = useState<UserRole>('customer');
  const [isAuthenticated] = useState(false);

  return (
    <AuthContext.Provider value={{ user, role, isAuthenticated }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}

