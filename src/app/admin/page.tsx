'use client';

import React from 'react';
import { AdminDashboard } from '@/components/admin/AdminDashboard';

// TODO: Implementar autenticación real con el backend
// Por ahora, permitimos acceso directo al dashboard
export default function AdminPage() {
  const handleLogout = async () => {
    // TODO: Implementar logout
    window.location.href = '/';
  };

  return <AdminDashboard onLogout={handleLogout} />;
}
