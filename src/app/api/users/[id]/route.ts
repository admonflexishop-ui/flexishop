import { NextRequest, NextResponse } from 'next/server';
import * as userService from '@/lib/db/users';
import { UpdateUserSchema } from '@/lib/validators';

/**
 * GET /api/users/[id] - Obtiene un usuario por ID
 */
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Validar UUID
    const { isValidUUID } = await import('@/lib/security');
    if (!isValidUUID(params.id)) {
      return NextResponse.json(
        { success: false, error: 'ID de usuario inválido' },
        { status: 400 }
      );
    }

    const user = await userService.getUserById(params.id);
    
    if (!user) {
      return NextResponse.json(
        { success: false, error: 'Usuario no encontrado' },
        { status: 404 }
      );
    }
    
    return NextResponse.json({ success: true, data: user });
  } catch (error) {
    console.error('Error al obtener usuario:', error);
    return NextResponse.json(
      { success: false, error: 'Error al obtener usuario' },
      { status: 500 }
    );
  }
}

/**
 * PUT /api/users/[id] - Actualiza un usuario
 */
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Validar UUID
    const { isValidUUID, validatePayloadSize } = await import('@/lib/security');
    if (!isValidUUID(params.id)) {
      return NextResponse.json(
        { success: false, error: 'ID de usuario inválido' },
        { status: 400 }
      );
    }

    // Validar tamaño del body
    const bodyText = await request.text();
    if (!validatePayloadSize(bodyText, 10240)) {
      return NextResponse.json(
        { success: false, error: 'Payload demasiado grande' },
        { status: 413 }
      );
    }

    const body = JSON.parse(bodyText);
    const validatedData = UpdateUserSchema.parse(body);
    
    const user = await userService.updateUser(params.id, validatedData);
    return NextResponse.json({ success: true, data: user });
  } catch (error: any) {
    console.error('Error al actualizar usuario:', error);
    
    if (error.name === 'ZodError') {
      return NextResponse.json(
        { success: false, error: 'Datos inválidos', details: error.errors },
        { status: 400 }
      );
    }
    
    if (error.message?.includes('no encontrado')) {
      return NextResponse.json(
        { success: false, error: error.message },
        { status: 404 }
      );
    }
    
    if (error.message?.includes('UNIQUE constraint')) {
      return NextResponse.json(
        { success: false, error: 'El email ya está en uso' },
        { status: 409 }
      );
    }
    
    return NextResponse.json(
      { success: false, error: error.message || 'Error al actualizar usuario' },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/users/[id] - Elimina un usuario
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Validar UUID
    const { isValidUUID } = await import('@/lib/security');
    if (!isValidUUID(params.id)) {
      return NextResponse.json(
        { success: false, error: 'ID de usuario inválido' },
        { status: 400 }
      );
    }

    const deleted = await userService.deleteUser(params.id);
    
    if (!deleted) {
      return NextResponse.json(
        { success: false, error: 'Usuario no encontrado' },
        { status: 404 }
      );
    }
    
    return NextResponse.json({ success: true, message: 'Usuario eliminado' });
  } catch (error) {
    console.error('Error al eliminar usuario:', error);
    return NextResponse.json(
      { success: false, error: 'Error al eliminar usuario' },
      { status: 500 }
    );
  }
}

