import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import bcrypt from 'bcryptjs';
import * as userService from '@/lib/db/users';
import { isValidEmail, validatePayloadSize, containsSqlInjection } from '@/lib/security';
import { resetLoginRateLimit } from '@/middleware';

// Forzar ruta dinámica (usa cookies)
export const dynamic = 'force-dynamic';

// Tamaño máximo del body (10 KB)
const MAX_BODY_SIZE = 10240;

/**
 * POST /api/auth/login - Inicia sesión
 */
export async function POST(request: NextRequest) {
  try {
    // Validar tamaño del body
    const bodyText = await request.text();
    if (!validatePayloadSize(bodyText, MAX_BODY_SIZE)) {
      return NextResponse.json(
        { success: false, error: 'Payload demasiado grande' },
        { status: 413 }
      );
    }

    const body = JSON.parse(bodyText);
    const { email, password } = body;

    // Validar que los campos existan
    if (!email || !password) {
      return NextResponse.json(
        { success: false, error: 'Email y contraseña son requeridos' },
        { status: 400 }
      );
    }

    // Validar tipos y formato
    if (typeof email !== 'string' || typeof password !== 'string') {
      return NextResponse.json(
        { success: false, error: 'Formato de datos inválido' },
        { status: 400 }
      );
    }

    // Validar formato de email
    if (!isValidEmail(email)) {
      return NextResponse.json(
        { success: false, error: 'Formato de email inválido' },
        { status: 400 }
      );
    }

    // Validar longitud de inputs
    if (email.length > 255 || password.length > 128) {
      return NextResponse.json(
        { success: false, error: 'Datos inválidos' },
        { status: 400 }
      );
    }

    // Prevenir inyección SQL básica (aunque usamos prepared statements)
    if (containsSqlInjection(email) || containsSqlInjection(password)) {
      return NextResponse.json(
        { success: false, error: 'Datos inválidos' },
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

    const cookieOptions: any = {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax' as const,
      maxAge: 60 * 60 * 24 * 365 * 10, // 10 años (prácticamente permanente hasta logout)
      path: '/',
    };

    cookieStore.set('admin_session', JSON.stringify(sessionData), cookieOptions);
    
    // Resetear rate limit después de login exitoso
    resetLoginRateLimit(request);
    
    // Log para debug en desarrollo
    if (process.env.NODE_ENV === 'development') {
      console.log('Cookie configurada:', {
        name: 'admin_session',
        secure: cookieOptions.secure,
        sameSite: cookieOptions.sameSite,
        maxAge: cookieOptions.maxAge,
      });
    }

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

