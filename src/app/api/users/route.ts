import { NextRequest, NextResponse } from 'next/server';
import * as userService from '@/lib/db/users';
import { CreateUserSchema, UpdateUserSchema } from '@/lib/validators';

/**
 * GET /api/users - Obtiene todos los usuarios
 */
export async function GET() {
  try {
    const users = await userService.getAllUsers();
    return NextResponse.json({ success: true, data: users });
  } catch (error) {
    console.error('Error al obtener usuarios:', error);
    return NextResponse.json(
      { success: false, error: 'Error al obtener usuarios' },
      { status: 500 }
    );
  }
}

/**
 * POST /api/users - Crea un nuevo usuario
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const validatedData = CreateUserSchema.parse(body);
    
    const user = await userService.createUser(validatedData);
    return NextResponse.json({ success: true, data: user }, { status: 201 });
  } catch (error: any) {
    console.error('Error al crear usuario:', error);
    
    if (error.name === 'ZodError') {
      return NextResponse.json(
        { success: false, error: 'Datos inválidos', details: error.errors },
        { status: 400 }
      );
    }
    
    if (error.message?.includes('UNIQUE constraint')) {
      return NextResponse.json(
        { success: false, error: 'El email ya está en uso' },
        { status: 409 }
      );
    }
    
    return NextResponse.json(
      { success: false, error: error.message || 'Error al crear usuario' },
      { status: 500 }
    );
  }
}

