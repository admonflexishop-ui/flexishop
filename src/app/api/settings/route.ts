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
    // Validar tamaño del body
    const { validatePayloadSize, isValidHexColor, isValidPhone } = await import('@/lib/security');
    const bodyText = await request.text();
    if (!validatePayloadSize(bodyText, 10240)) {
      return NextResponse.json(
        { success: false, error: 'Payload demasiado grande' },
        { status: 413 }
      );
    }

    const body = JSON.parse(bodyText);
    
    // Validaciones adicionales antes de Zod
    if (body.accent_color && !isValidHexColor(body.accent_color)) {
      return NextResponse.json(
        { success: false, error: 'Color de acento inválido' },
        { status: 400 }
      );
    }

    // Validar default_whatsapp si está presente (el campo puede venir como default_whatsapp o whatsapp)
    const whatsappValue = body.default_whatsapp || body.whatsapp;
    if (whatsappValue && !isValidPhone(whatsappValue)) {
      return NextResponse.json(
        { success: false, error: 'Número de WhatsApp inválido' },
        { status: 400 }
      );
    }

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

