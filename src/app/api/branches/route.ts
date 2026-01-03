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
    const body = await request.json();
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

