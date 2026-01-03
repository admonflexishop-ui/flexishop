import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import * as userService from '@/lib/db/users';

/**
 * GET /api/auth/me - Obtiene el usuario actual autenticado
 */
export async function GET() {
  try {
    const cookieStore = cookies();
    const sessionCookie = cookieStore.get('admin_session');

    if (!sessionCookie || !sessionCookie.value) {
      return NextResponse.json(
        { success: false, error: 'No autenticado' },
        { status: 401 }
      );
    }

    const session = JSON.parse(sessionCookie.value);
    const user = await userService.getUserById(session.userId);

    if (!user) {
      // Sesión inválida, eliminar cookie
      cookieStore.delete('admin_session');
      return NextResponse.json(
        { success: false, error: 'Sesión inválida' },
        { status: 401 }
      );
    }

    // Verificar que siga siendo admin
    if (user.role !== 'admin' || user.is_active !== 1) {
      cookieStore.delete('admin_session');
      return NextResponse.json(
        { success: false, error: 'No tienes permisos' },
        { status: 403 }
      );
    }

    return NextResponse.json({
      success: true,
      data: user,
    });
  } catch (error: any) {
    console.error('Error al verificar sesión:', error);
    return NextResponse.json(
      { success: false, error: 'Error al verificar sesión' },
      { status: 500 }
    );
  }
}

