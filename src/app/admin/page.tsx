'use client';

import React, { useEffect, useState } from 'react';
import { useAuth } from '@/lib/auth';
import { AdminDashboard } from '@/components/admin/AdminDashboard';

export default function AdminPage() {
  const { user, role, loading, loginEmail, loginGoogle, logout } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [err, setErr] = useState<string | null>(null);

  useEffect(() => {
    setErr(null);
  }, [user]);

  if (loading) {
    return <div className="mx-auto max-w-md p-6 text-sm text-neutral-600">Cargando...</div>;
  }

  if (user && role === 'admin') {
    return <AdminDashboard onLogout={logout} />;
  }

  return (
    <div className="mx-auto max-w-md space-y-4 p-6">
      <div className="text-2xl font-semibold">Admin</div>
      <div className="text-sm text-neutral-600">
        Inicia sesión para administrar productos, sucursales y personalización.
      </div>

      {user && role !== 'admin' && (
        <div className="card p-4 text-sm">
          Estás logueado como <b>customer</b>. Solo un usuario con rol <b>admin</b> puede editar.
          <div className="mt-2">
            <button className="btn" onClick={() => logout()}>
              Cerrar sesión
            </button>
          </div>
        </div>
      )}

      {!user && (
        <div className="card p-4 space-y-3">
          {err && <div className="text-sm text-red-600">{err}</div>}
          <div>
            <label className="text-xs text-neutral-600">Email</label>
            <input className="input mt-1" value={email} onChange={(e) => setEmail(e.target.value)} />
          </div>
          <div>
            <label className="text-xs text-neutral-600">Contraseña</label>
            <input
              className="input mt-1"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>
          <button
            className="btn btn-accent w-full"
            onClick={async () => {
              try {
                setErr(null);
                await loginEmail(email, password);
              } catch (e: any) {
                setErr(e?.message || 'No se pudo iniciar sesión');
              }
            }}
          >
            Entrar
          </button>
          <button
            className="btn w-full"
            onClick={async () => {
              try {
                setErr(null);
                await loginGoogle();
              } catch (e: any) {
                setErr(e?.message || 'No se pudo iniciar con Google');
              }
            }}
          >
            Entrar con Google
          </button>
        </div>
      )}

      <div className="text-xs text-neutral-500">
        Para convertirte en admin: crea tu usuario en Auth, luego en Firestore colección <code>users</code> cambia el campo{' '}
        <code>role</code> a <code>admin</code>.
      </div>
    </div>
  );
}
