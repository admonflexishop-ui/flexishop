import { NextRequest, NextResponse } from 'next/server';
import * as imageService from '@/lib/db/product-images';
import { CreateProductImageSchema } from '@/lib/validators';

/**
 * GET /api/products/[id]/image - Obtiene la imagen de un producto
 */
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const image = await imageService.getProductImage(params.id);
    
    if (!image) {
      return NextResponse.json(
        { success: false, error: 'Imagen no encontrada' },
        { status: 404 }
      );
    }
    
    // Retornar la imagen como PNG
    return new NextResponse(image.png_bytes, {
      headers: {
        'Content-Type': 'image/png',
        'Content-Length': image.bytes_size.toString(),
      },
    });
  } catch (error) {
    console.error('Error al obtener imagen:', error);
    return NextResponse.json(
      { success: false, error: 'Error al obtener imagen' },
      { status: 500 }
    );
  }
}

/**
 * POST /api/products/[id]/image - Crea o actualiza la imagen de un producto
 */
export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const formData = await request.formData();
    const file = formData.get('file') as File | null;
    
    if (!file) {
      return NextResponse.json(
        { success: false, error: 'No se proporcionó un archivo' },
        { status: 400 }
      );
    }
    
    // Validar tipo MIME
    if (file.type !== 'image/png') {
      return NextResponse.json(
        { success: false, error: 'El archivo debe ser una imagen PNG' },
        { status: 400 }
      );
    }
    
    // Validar tamaño (500 KB = 512000 bytes)
    if (file.size > 512000) {
      return NextResponse.json(
        { success: false, error: 'El archivo no puede exceder 500 KB' },
        { status: 400 }
      );
    }
    
    // Convertir File a Uint8Array
    const pngBytes = await imageService.fileToUint8Array(file);
    
    const imageData = CreateProductImageSchema.parse({
      product_id: params.id,
      png_bytes: pngBytes,
      bytes_size: file.size,
    });
    
    const image = await imageService.upsertProductImage(imageData);
    return NextResponse.json({ success: true, data: image }, { status: 201 });
  } catch (error: any) {
    console.error('Error al guardar imagen:', error);
    
    if (error.name === 'ZodError') {
      return NextResponse.json(
        { success: false, error: 'Datos inválidos', details: error.errors },
        { status: 400 }
      );
    }
    
    if (error.message?.includes('no existe') || error.message?.includes('no encontrado')) {
      return NextResponse.json(
        { success: false, error: error.message },
        { status: 404 }
      );
    }
    
    return NextResponse.json(
      { success: false, error: error.message || 'Error al guardar imagen' },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/products/[id]/image - Elimina la imagen de un producto
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const deleted = await imageService.deleteProductImage(params.id);
    
    if (!deleted) {
      return NextResponse.json(
        { success: false, error: 'Imagen no encontrada' },
        { status: 404 }
      );
    }
    
    return NextResponse.json({ success: true, message: 'Imagen eliminada' });
  } catch (error) {
    console.error('Error al eliminar imagen:', error);
    return NextResponse.json(
      { success: false, error: 'Error al eliminar imagen' },
      { status: 500 }
    );
  }
}

