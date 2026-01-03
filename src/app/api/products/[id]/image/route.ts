import { NextRequest, NextResponse } from 'next/server';
import * as imageService from '@/lib/db/product-images';
import { CreateProductImageSchema } from '@/lib/validators';

export const dynamic = 'force-dynamic';

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
    
    // Asegurar que siempre sea Uint8Array
    const pngBytes: Uint8Array = image.png_bytes instanceof Uint8Array 
      ? image.png_bytes 
      : new Uint8Array(image.png_bytes as ArrayLike<number>);
    
    // Crear un nuevo ArrayBuffer para evitar problemas de tipos con SharedArrayBuffer
    const buffer = new ArrayBuffer(pngBytes.length);
    const view = new Uint8Array(buffer);
    view.set(pngBytes);
    
    // Retornar la imagen como PNG con headers para evitar caché
    // Usar updated_at como ETag para cache busting
    const etag = image.updated_at ? new Date(image.updated_at).getTime().toString() : Date.now().toString();
    
    return new NextResponse(buffer, {
      headers: {
        'Content-Type': 'image/png',
        'Content-Length': image.bytes_size.toString(),
        'Cache-Control': 'no-cache, no-store, must-revalidate, max-age=0',
        'Pragma': 'no-cache',
        'Expires': '0',
        'ETag': etag,
        'Last-Modified': image.updated_at || new Date().toUTCString(),
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
    // Validar UUID del producto
    const { isValidUUID } = await import('@/lib/security');
    if (!isValidUUID(params.id)) {
      return NextResponse.json(
        { success: false, error: 'ID de producto inválido' },
        { status: 400 }
      );
    }

    const formData = await request.formData();
    const file = formData.get('file') as File | null;
    
    if (!file) {
      return NextResponse.json(
        { success: false, error: 'No se proporcionó un archivo' },
        { status: 400 }
      );
    }
    
    // Validar que sea un File object válido
    if (!(file instanceof File)) {
      return NextResponse.json(
        { success: false, error: 'Archivo inválido' },
        { status: 400 }
      );
    }
    
    // Validar tipo MIME (verificar tanto el type como el nombre del archivo)
    const validMimeTypes = ['image/png'];
    const validExtensions = ['.png'];
    const fileName = file.name.toLowerCase();
    
    if (!validMimeTypes.includes(file.type) || !validExtensions.some(ext => fileName.endsWith(ext))) {
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

    // Validar que el archivo no esté vacío
    if (file.size === 0) {
      return NextResponse.json(
        { success: false, error: 'El archivo está vacío' },
        { status: 400 }
      );
    }
    
    // Convertir File a Uint8Array
    const pngBytes = await imageService.fileToUint8Array(file);
    
    console.log('Tamaño del archivo:', file.size, 'bytes');
    console.log('Tamaño del Uint8Array:', pngBytes.length);
    
    const imageData = CreateProductImageSchema.parse({
      product_id: params.id,
      png_bytes: pngBytes,
      bytes_size: file.size,
    });
    
    console.log('Intentando guardar imagen para producto:', params.id);
    const image = await imageService.upsertProductImage(imageData);
    console.log('Imagen guardada exitosamente');
    
    return NextResponse.json({ success: true, data: image }, { status: 201 });
  } catch (error: any) {
    console.error('Error al guardar imagen:', error);
    console.error('Tipo de error:', error.constructor.name);
    console.error('Mensaje de error:', error.message);
    console.error('Stack:', error.stack);
    
    if (error.name === 'ZodError') {
      console.error('Errores de validación Zod:', error.errors);
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
    
    const errorMessage = error.message || error.toString() || 'Error desconocido al guardar imagen';
    console.error('Error final:', errorMessage);
    
    return NextResponse.json(
      { success: false, error: errorMessage },
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

