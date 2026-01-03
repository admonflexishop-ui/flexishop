'use client';

import React, { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { AdminDashboard } from '@/components/admin/AdminDashboard';
import { LoginForm } from '@/components/admin/LoginForm';
import { useAuth } from '@/lib/auth';

export default function AdminPage() {
  const { isAuthenticated, isLoading, logout } = useAuth();
  const router = useRouter();

  const handleLogout = () => {
    logout();
    router.push('/products');
    router.refresh();
  };

  if (isLoading) {
    return (
      <div className="mx-auto max-w-md p-6">
        <div className="text-sm text-neutral-500">Cargando...</div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <LoginForm />;
  }

  return <AdminDashboard onLogout={handleLogout} />;
}
