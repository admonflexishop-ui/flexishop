import { NextRequest, NextResponse } from 'next/server';
import * as settingsService from '@/lib/db/settings';
import { UpdateSettingsSchema } from '@/lib/validators';

/**
 * GET /api/settings - Obtiene la configuración
 */
export async function GET() {
  try {
    const settings = await settingsService.getSettings();
    
    if (!settings) {
      return NextResponse.json(
        { success: false, error: 'Configuración no encontrada' },
        { status: 404 }
      );
    }
    
    return NextResponse.json({ success: true, data: settings });
  } catch (error) {
    console.error('Error al obtener configuración:', error);
    return NextResponse.json(
      { success: false, error: 'Error al obtener configuración' },
      { status: 500 }
    );
  }
}

/**
 * PUT /api/settings - Actualiza la configuración
 */
export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const validatedData = UpdateSettingsSchema.parse(body);
    
    const settings = await settingsService.updateSettings(validatedData);
    return NextResponse.json({ success: true, data: settings });
  } catch (error: any) {
    console.error('Error al actualizar configuración:', error);
    
    if (error.name === 'ZodError') {
      return NextResponse.json(
        { success: false, error: 'Datos inválidos', details: error.errors },
        { status: 400 }
      );
    }
    
    return NextResponse.json(
      { success: false, error: error.message || 'Error al actualizar configuración' },
      { status: 500 }
    );
  }
}

