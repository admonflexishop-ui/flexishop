import { NextRequest, NextResponse } from 'next/server';
import * as userService from '@/lib/db/users';

/**
 * GET /api/users/email/[email] - Obtiene un usuario por email
 */
export async function GET(
  request: NextRequest,
  { params }: { params: { email: string } }
) {
  try {
    const decodedEmail = decodeURIComponent(params.email);
    const user = await userService.getUserByEmail(decodedEmail);
    
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

