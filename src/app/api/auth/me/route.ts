import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import * as userService from '@/lib/db/users';
import { isValidUUID } from '@/lib/security';
import { SESSION_COOKIE_NAME } from '@/lib/session-constants';

// Forzar ruta dinámica (usa cookies)
export const dynamic = 'force-dynamic';

/**
 * GET /api/auth/me - Obtiene el usuario actual autenticado
 */
export async function GET() {
  try {
    const cookieStore = cookies();
    const sessionCookie = cookieStore.get(SESSION_COOKIE_NAME);

    // Log para debug en desarrollo
    if (process.env.NODE_ENV === 'development') {
      console.log('[AUTH/ME] Verificando sesión - Cookie encontrada:', !!sessionCookie);
      if (sessionCookie?.value) {
        try {
          const parsed = JSON.parse(sessionCookie.value);
          console.log('[AUTH/ME] Cookie válida, userId:', parsed.userId);
        } catch (e) {
          console.log('[AUTH/ME] Cookie con valor pero no parseable');
        }
      } else {
        console.log('[AUTH/ME] No hay cookie o valor vacío');
      }
    }

    if (!sessionCookie || !sessionCookie.value) {
      return NextResponse.json(
        { success: false, error: 'No autenticado' },
        { status: 401 }
      );
    }

    // Parsear sesión con manejo de errores
    let session;
    try {
      session = JSON.parse(sessionCookie.value);
    } catch (parseError) {
      console.error('Error al parsear cookie de sesión:', parseError);
      // Cookie corrupta, eliminarla
      cookieStore.delete(SESSION_COOKIE_NAME);
      return NextResponse.json(
        { success: false, error: 'Sesión inválida' },
        { status: 401 }
      );
    }

    // Validar que la sesión tenga la estructura correcta
    if (!session || !session.userId || typeof session.userId !== 'string') {
      console.error('Sesión con estructura inválida:', session);
      cookieStore.delete(SESSION_COOKIE_NAME);
      return NextResponse.json(
        { success: false, error: 'Sesión inválida' },
        { status: 401 }
      );
    }

    // Validar UUID antes de buscar usuario
    if (!isValidUUID(session.userId)) {
      console.error('UUID inválido en sesión:', session.userId);
      cookieStore.delete(SESSION_COOKIE_NAME);
      return NextResponse.json(
        { success: false, error: 'Sesión inválida' },
        { status: 401 }
      );
    }

    // Obtener usuario
    let user;
    try {
      user = await userService.getUserById(session.userId);
    } catch (dbError: any) {
      console.error('Error al buscar usuario:', dbError);
      // Error de base de datos, pero no exponer detalles
      return NextResponse.json(
        { success: false, error: 'Error al verificar sesión' },
        { status: 500 }
      );
    }

    if (!user) {
      // Sesión inválida, eliminar cookie
      cookieStore.delete(SESSION_COOKIE_NAME);
      return NextResponse.json(
        { success: false, error: 'Sesión inválida' },
        { status: 401 }
      );
    }

    // Verificar que siga siendo admin
    if (user.role !== 'admin' || user.is_active !== 1) {
      cookieStore.delete(SESSION_COOKIE_NAME);
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
    console.error('Error inesperado al verificar sesión:', error);
    // En caso de error inesperado, intentar limpiar la cookie
    try {
      const cookieStore = cookies();
      cookieStore.delete(SESSION_COOKIE_NAME);
    } catch (cleanupError) {
      // Ignorar errores al limpiar
    }
    
    return NextResponse.json(
      { success: false, error: 'Error al verificar sesión' },
      { status: 500 }
    );
  }
}

