import { NextRequest, NextResponse } from 'next/server';
import * as branchService from '@/lib/db/branches';
import { UpdateBranchSchema } from '@/lib/validators';

/**
 * GET /api/branches/[id] - Obtiene una sucursal por ID
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
        { success: false, error: 'ID de sucursal inválido' },
        { status: 400 }
      );
    }

    const branch = await branchService.getBranchById(params.id);
    
    if (!branch) {
      return NextResponse.json(
        { success: false, error: 'Sucursal no encontrada' },
        { status: 404 }
      );
    }
    
    return NextResponse.json({ success: true, data: branch });
  } catch (error) {
    console.error('Error al obtener sucursal:', error);
    return NextResponse.json(
      { success: false, error: 'Error al obtener sucursal' },
      { status: 500 }
    );
  }
}

/**
 * PUT /api/branches/[id] - Actualiza una sucursal
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
        { success: false, error: 'ID de sucursal inválido' },
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
    const validatedData = UpdateBranchSchema.parse(body);
    
    const branch = await branchService.updateBranch(params.id, validatedData);
    return NextResponse.json({ success: true, data: branch });
  } catch (error: any) {
    console.error('Error al actualizar sucursal:', error);
    
    if (error.name === 'ZodError') {
      return NextResponse.json(
        { success: false, error: 'Datos inválidos', details: error.errors },
        { status: 400 }
      );
    }
    
    if (error.message?.includes('no encontrada')) {
      return NextResponse.json(
        { success: false, error: error.message },
        { status: 404 }
      );
    }
    
    return NextResponse.json(
      { success: false, error: error.message || 'Error al actualizar sucursal' },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/branches/[id] - Elimina una sucursal
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
        { success: false, error: 'ID de sucursal inválido' },
        { status: 400 }
      );
    }

    const deleted = await branchService.deleteBranch(params.id);
    
    if (!deleted) {
      return NextResponse.json(
        { success: false, error: 'Sucursal no encontrada' },
        { status: 404 }
      );
    }
    
    return NextResponse.json({ success: true, message: 'Sucursal eliminada' });
  } catch (error) {
    console.error('Error al eliminar sucursal:', error);
    return NextResponse.json(
      { success: false, error: 'Error al eliminar sucursal' },
      { status: 500 }
    );
  }
}

