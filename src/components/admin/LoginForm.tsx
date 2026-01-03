'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useAuth } from '@/lib/auth';
import { useRouter } from 'next/navigation';

export function LoginForm() {
  const { login } = useAuth();
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      await login(email, password);
      // Pequeño delay para asegurar que la cookie se establezca
      await new Promise(resolve => setTimeout(resolve, 100));
      router.push('/admin');
      router.refresh();
    } catch (err: any) {
      setError(err.message || 'Error al iniciar sesión');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="mx-auto max-w-md space-y-4 p-6">
      <div className="text-2xl font-semibold">Admin Login</div>
      <div className="text-sm text-neutral-600">
        Inicia sesión con tu cuenta de administrador
      </div>

      <form className="card p-4 space-y-3" onSubmit={handleSubmit}>
        {error && <div className="text-sm text-red-600 bg-red-50 p-2 rounded">{error}</div>}
        
        <div>
          <label className="text-xs text-neutral-600">Email</label>
          <input
            className="input mt-1 w-full"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            disabled={loading}
            placeholder="admin@example.com"
          />
        </div>
        
        <div>
          <label className="text-xs text-neutral-600">Contraseña</label>
          <input
            className="input mt-1 w-full"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            disabled={loading}
            placeholder="••••••••"
          />
        </div>
        
        <button
          className="btn btn-accent w-full"
          type="submit"
          disabled={loading}
        >
          {loading ? 'Iniciando sesión...' : 'Iniciar sesión'}
        </button>
      </form>

      <div className="text-xs text-neutral-500">
        Solo usuarios con rol <span className="font-semibold">admin</span> pueden acceder.
      </div>
      
      <div className="pt-2 border-t border-neutral-200">
        <Link
          href="/products"
          className="btn w-full text-center"
        >
          ← Volver a la tienda
        </Link>
      </div>
    </div>
  );
}

