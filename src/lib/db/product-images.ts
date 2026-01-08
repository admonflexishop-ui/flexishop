import { db } from '../db';
import { ProductImageSchema, CreateProductImageSchema, type ProductImage, type CreateProductImage } from '../validators';
import { normalizeDateTime } from './utils';

/**
 * Obtiene la imagen de un producto
 */
export async function getProductImage(productId: string): Promise<ProductImage | null> {
  const result = await db.execute({
    sql: 'SELECT * FROM product_image WHERE product_id = ?',
    args: [productId],
  });

  if (result.rows.length === 0) {
    return null;
  }

  const row = result.rows[0];
  
  // Convertir el BLOB a Uint8Array (libSQL puede retornar ArrayBuffer o Uint8Array)
  let pngBytes: Uint8Array;
  if (row.png_bytes instanceof Uint8Array) {
    pngBytes = row.png_bytes;
  } else if (row.png_bytes instanceof ArrayBuffer) {
    pngBytes = new Uint8Array(row.png_bytes);
  } else if (Buffer.isBuffer(row.png_bytes)) {
    pngBytes = new Uint8Array(row.png_bytes);
  } else {
    // Convertir a Uint8Array desde cualquier formato
    pngBytes = new Uint8Array(row.png_bytes as any);
  }
  
  const image = {
    product_id: row.product_id as string,
    png_bytes: pngBytes,
    bytes_size: (row.bytes_size as number) ?? 0,
    updated_at: normalizeDateTime(row.updated_at as string),
  };

  return ProductImageSchema.parse(image);
}

/**
 * Crea o actualiza la imagen de un producto
 */
export async function upsertProductImage(data: CreateProductImage): Promise<ProductImage> {
  const validatedData = CreateProductImageSchema.parse(data);
  const now = new Date().toISOString();

  // Verificar que el producto existe
  const { getProductById } = await import('./products');
  const product = await getProductById(validatedData.product_id);
  if (!product) {
    throw new Error('El producto no existe');
  }

  // Validar tamaño máximo optimizado para plan Hobby de Vercel
  // libSQL/Turso puede manejar hasta ~100MB por registro, pero con plan Hobby
  // el límite práctico es menor debido al timeout de 10 segundos
  const MAX_DB_SIZE = 5 * 1024 * 1024; // 5 MB (optimizado para plan Hobby)
  if (validatedData.bytes_size > MAX_DB_SIZE) {
    throw new Error(`La imagen es demasiado grande. Tamaño máximo: ${(MAX_DB_SIZE / 1024 / 1024).toFixed(0)} MB (plan Hobby). Para archivos más grandes, actualiza a plan Pro.`);
  }

  // Convertir a Uint8Array para libSQL (libSQL funciona mejor con Uint8Array para BLOBs)
  let pngBytes: Uint8Array;
  if (Buffer.isBuffer(validatedData.png_bytes)) {
    pngBytes = new Uint8Array(validatedData.png_bytes);
  } else if (validatedData.png_bytes instanceof Uint8Array) {
    pngBytes = validatedData.png_bytes;
  } else {
    throw new Error('Formato de imagen no soportado');
  }

  try {
    console.log('Insertando imagen en BD - Product ID:', validatedData.product_id);
    console.log('Tamaño del Buffer:', pngBytes.length, 'bytes');
    console.log('Tipo del Buffer:', typeof pngBytes, Buffer.isBuffer(pngBytes));
    
    const result = await db.execute({
      sql: `
        INSERT INTO product_image (product_id, png_bytes, bytes_size, updated_at)
        VALUES (?, ?, ?, ?)
        ON CONFLICT(product_id) DO UPDATE SET
          png_bytes = excluded.png_bytes,
          bytes_size = excluded.bytes_size,
          updated_at = excluded.updated_at
      `,
      args: [validatedData.product_id, pngBytes, validatedData.bytes_size, now],
    });
    
    console.log('Imagen insertada en BD. Rows affected:', result.rowsAffected);
  } catch (dbError: any) {
    console.error('Error en la base de datos al guardar imagen:', dbError);
    console.error('Stack trace:', dbError.stack);
    throw new Error(`Error al guardar imagen en la base de datos: ${dbError.message || dbError}`);
  }

  const image = await getProductImage(validatedData.product_id);
  if (!image) {
    throw new Error('Error al guardar la imagen');
  }

  return image;
}

/**
 * Elimina la imagen de un producto
 */
export async function deleteProductImage(productId: string): Promise<boolean> {
  const result = await db.execute({
    sql: 'DELETE FROM product_image WHERE product_id = ?',
    args: [productId],
  });

  return (result.rowsAffected ?? 0) > 0;
}

/**
 * Convierte un File a Uint8Array
 */
export async function fileToUint8Array(file: File): Promise<Uint8Array> {
  const arrayBuffer = await file.arrayBuffer();
  return new Uint8Array(arrayBuffer);
}

