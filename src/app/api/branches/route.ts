import { NextRequest, NextResponse } from 'next/server';
import * as branchService from '@/lib/db/branches';
import { CreateBranchSchema, UpdateBranchSchema } from '@/lib/validators';

/**
 * GET /api/branches - Obtiene todas las sucursales
 * Query params: ?active=true para solo activas
 */
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const onlyActive = searchParams.get('active') === 'true';
    
    const branches = onlyActive
      ? await branchService.getActiveBranches()
      : await branchService.getAllBranches();
    
    return NextResponse.json({ success: true, data: branches });
  } catch (error) {
    console.error('Error al obtener sucursales:', error);
    return NextResponse.json(
      { success: false, error: 'Error al obtener sucursales' },
      { status: 500 }
    );
  }
}

/**
 * POST /api/branches - Crea una nueva sucursal
 */
export async function POST(request: NextRequest) {
  try {
    // Validar tamaño del body
    const { validatePayloadSize, isValidPhone } = await import('@/lib/security');
    const bodyText = await request.text();
    if (!validatePayloadSize(bodyText, 10240)) {
      return NextResponse.json(
        { success: false, error: 'Payload demasiado grande' },
        { status: 413 }
      );
    }

    const body = JSON.parse(bodyText);
    
    // Validaciones adicionales antes de Zod
    if (body.phone && !isValidPhone(body.phone)) {
      return NextResponse.json(
        { success: false, error: 'Número de teléfono inválido' },
        { status: 400 }
      );
    }

    const validatedData = CreateBranchSchema.parse(body);
    
    const branch = await branchService.createBranch(validatedData);
    return NextResponse.json({ success: true, data: branch }, { status: 201 });
  } catch (error: any) {
    console.error('Error al crear sucursal:', error);
    
    if (error.name === 'ZodError') {
      return NextResponse.json(
        { success: false, error: 'Datos inválidos', details: error.errors },
        { status: 400 }
      );
    }
    
    return NextResponse.json(
      { success: false, error: error.message || 'Error al crear sucursal' },
      { status: 500 }
    );
  }
}

