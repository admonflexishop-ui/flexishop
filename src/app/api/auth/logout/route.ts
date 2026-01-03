import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';

// Forzar ruta dinámica (usa cookies)
export const dynamic = 'force-dynamic';

/**
 * POST /api/auth/logout - Cierra sesión
 */
export async function POST() {
  try {
    const cookieStore = cookies();
    cookieStore.delete('admin_session');

    return NextResponse.json({ success: true, message: 'Sesión cerrada' });
  } catch (error: any) {
    console.error('Error al cerrar sesión:', error);
    return NextResponse.json(
      { success: false, error: 'Error al cerrar sesión' },
      { status: 500 }
    );
  }
}

