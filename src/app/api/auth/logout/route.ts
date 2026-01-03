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
    
    // Eliminar la cookie estableciendo una fecha de expiración en el pasado
    cookieStore.set('admin_session', '', {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 0,
      path: '/',
    });

    return NextResponse.json({ success: true, message: 'Sesión cerrada' });
  } catch (error: any) {
    console.error('Error al cerrar sesión:', error);
    return NextResponse.json(
      { success: false, error: 'Error al cerrar sesión' },
      { status: 500 }
    );
  }
}

