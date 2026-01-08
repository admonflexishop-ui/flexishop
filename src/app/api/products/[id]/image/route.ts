import { NextRequest, NextResponse } from 'next/server';
import * as imageService from '@/lib/db/product-images';
import { CreateProductImageSchema } from '@/lib/validators';

export const dynamic = 'force-dynamic';

// Configurar duración máxima para plan Hobby de Vercel
// Vercel Hobby: máximo 10 segundos de ejecución
// Para archivos grandes, considera actualizar a plan Pro (60s) o Enterprise (300s)
export const maxDuration = 10; // 10 segundos (máximo del plan Hobby)

// Límite máximo de tamaño de archivo recomendado para plan Hobby (5 MB)
// Archivos más grandes pueden no completarse en 10 segundos
// Si necesitas archivos más grandes, actualiza a plan Pro de Vercel
const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5 MB en bytes (optimizado para plan Hobby)

/**
 * Detecta el tipo MIME de una imagen desde sus primeros bytes (magic numbers)
 */
function detectImageType(bytes: Uint8Array): string {
  if (bytes.length < 4) {
    return 'image/png'; // Default
  }

  // PNG: 89 50 4E 47
  if (bytes[0] === 0x89 && bytes[1] === 0x50 && bytes[2] === 0x4E && bytes[3] === 0x47) {
    return 'image/png';
  }

  // JPEG: FF D8 FF
  if (bytes[0] === 0xFF && bytes[1] === 0xD8 && bytes[2] === 0xFF) {
    return 'image/jpeg';
  }

  // GIF: 47 49 46 38 (GIF8)
  if (bytes[0] === 0x47 && bytes[1] === 0x49 && bytes[2] === 0x46 && bytes[3] === 0x38) {
    return 'image/gif';
  }

  // WebP: RIFF...WEBP (más complejo, necesita más bytes)
  if (bytes.length >= 12 && 
      bytes[0] === 0x52 && bytes[1] === 0x49 && bytes[2] === 0x46 && bytes[3] === 0x46 &&
      bytes[8] === 0x57 && bytes[9] === 0x45 && bytes[10] === 0x42 && bytes[11] === 0x50) {
    return 'image/webp';
  }

  // SVG: empieza con '<svg' o '<?xml'
  const textDecoder = new TextDecoder('utf-8', { fatal: false });
  const header = textDecoder.decode(bytes.slice(0, Math.min(100, bytes.length)));
  if (header.trim().startsWith('<svg') || header.trim().startsWith('<?xml')) {
    return 'image/svg+xml';
  }

  // Default a PNG si no se puede detectar
  return 'image/png';
}

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
    const imageBytes: Uint8Array = image.png_bytes instanceof Uint8Array 
      ? image.png_bytes 
      : new Uint8Array(image.png_bytes as ArrayLike<number>);
    
    // Detectar el tipo MIME de la imagen desde los primeros bytes (magic numbers)
    const contentType = detectImageType(imageBytes);
    
    // Crear un nuevo ArrayBuffer para evitar problemas de tipos con SharedArrayBuffer
    const buffer = new ArrayBuffer(imageBytes.length);
    const view = new Uint8Array(buffer);
    view.set(imageBytes);
    
    // Retornar la imagen con headers para evitar caché
    // Usar updated_at como ETag para cache busting
    const etag = image.updated_at ? new Date(image.updated_at).getTime().toString() : Date.now().toString();
    
    return new NextResponse(buffer, {
      headers: {
        'Content-Type': contentType,
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
    
    // Validar que sea un archivo de imagen
    if (!file.type.startsWith('image/')) {
      return NextResponse.json(
        { success: false, error: 'El archivo debe ser una imagen' },
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

    // Validar tamaño máximo del archivo
    if (file.size > MAX_FILE_SIZE) {
      return NextResponse.json(
        { 
          success: false, 
          error: `El archivo es demasiado grande. Tamaño máximo permitido: ${(MAX_FILE_SIZE / 1024 / 1024).toFixed(0)} MB. Tu archivo: ${(file.size / 1024 / 1024).toFixed(2)} MB. Para archivos más grandes, considera actualizar a un plan Pro de Vercel.` 
        },
        { status: 413 } // 413 Payload Too Large
      );
    }
    
    // Advertencia para archivos que pueden acercarse al límite de tiempo
    if (file.size > 3 * 1024 * 1024) { // Archivos > 3MB
      console.log(`[UPLOAD] Archivo mediano detectado: ${file.name}, ${(file.size / 1024 / 1024).toFixed(2)} MB - Puede tardar varios segundos`);
    }
    
    // Convertir File a Uint8Array
    // Para archivos grandes, esto puede consumir memoria significativa
    // Considerar usar streams en el futuro si hay problemas de memoria
    const imageBytes = await imageService.fileToUint8Array(file);
    
    console.log('Tamaño del archivo:', file.size, 'bytes');
    console.log('Tipo MIME:', file.type);
    console.log('Tamaño del Uint8Array:', imageBytes.length);
    
    const imageData = CreateProductImageSchema.parse({
      product_id: params.id,
      png_bytes: imageBytes, // Mantener el nombre del campo para compatibilidad con BD
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
    
    // Manejo específico de errores de memoria o tamaño
    if (error.message?.includes('allocation') || error.message?.includes('memory') || error.message?.includes('heap')) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'El archivo es demasiado grande para procesar. Intenta con una imagen más pequeña o comprime la imagen antes de subirla.' 
        },
        { status: 413 }
      );
    }

    // Manejo de errores de timeout
    if (error.message?.includes('timeout') || error.message?.includes('timed out') || error.message?.includes('Function execution exceeded')) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'La subida del archivo tardó demasiado (límite de 10 segundos en plan Hobby). Intenta con un archivo más pequeño (máximo 5 MB recomendado) o considera actualizar a un plan Pro de Vercel para archivos más grandes.' 
        },
        { status: 504 }
      );
    }
    
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

    // Errores relacionados con tamaño de archivo
    if (error.message?.includes('demasiado grande') || error.message?.includes('too large')) {
      return NextResponse.json(
        { success: false, error: error.message },
        { status: 413 }
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

