import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import bcrypt from 'bcryptjs';
import * as userService from '@/lib/db/users';

// Forzar ruta dinámica (usa cookies)
export const dynamic = 'force-dynamic';

/**
 * POST /api/auth/login - Inicia sesión
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email, password } = body;

    if (!email || !password) {
      return NextResponse.json(
        { success: false, error: 'Email y contraseña son requeridos' },
        { status: 400 }
      );
    }

    // Obtener usuario con password
    const user = await userService.getUserByEmailWithPassword(email);

    if (!user) {
      return NextResponse.json(
        { success: false, error: 'Credenciales inválidas' },
        { status: 401 }
      );
    }

    // Verificar que el usuario esté activo
    if (user.is_active !== 1) {
      return NextResponse.json(
        { success: false, error: 'Usuario inactivo' },
        { status: 403 }
      );
    }

    // Verificar que tenga rol de admin
    if (user.role !== 'admin') {
      return NextResponse.json(
        { success: false, error: 'No tienes permisos para acceder al admin' },
        { status: 403 }
      );
    }

    // Verificar password con bcrypt
    if (!user.password) {
      return NextResponse.json(
        { success: false, error: 'Credenciales inválidas' },
        { status: 401 }
      );
    }

    // Comparar password: si empieza con $2b$ es bcrypt, sino es texto plano (migración)
    const isPasswordValid = user.password.startsWith('$2b$')
      ? await bcrypt.compare(password, user.password)
      : user.password === password;

    if (!isPasswordValid) {
      return NextResponse.json(
        { success: false, error: 'Credenciales inválidas' },
        { status: 401 }
      );
    }

    // Crear sesión (guardar en cookie)
    const cookieStore = cookies();
    const sessionData = {
      userId: user.id,
      email: user.email,
      role: user.role,
    };

    cookieStore.set('admin_session', JSON.stringify(sessionData), {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      // Duración muy larga (10 años) - la sesión durará hasta que el usuario haga logout
      maxAge: 60 * 60 * 24 * 365 * 10, // 10 años (prácticamente permanente hasta logout)
      path: '/',
    });

    return NextResponse.json({
      success: true,
      data: {
        id: user.id,
        email: user.email,
        role: user.role,
      },
    });
  } catch (error: any) {
    console.error('Error al iniciar sesión:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Error al iniciar sesión' },
      { status: 500 }
    );
  }
}

