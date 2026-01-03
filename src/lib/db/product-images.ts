import { db } from '../db';
import { ProductImageSchema, CreateProductImageSchema, type ProductImage, type CreateProductImage } from '../validators';

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
  const image = {
    product_id: row.product_id as string,
    png_bytes: row.png_bytes as Uint8Array,
    bytes_size: (row.bytes_size as number) ?? 0,
    updated_at: row.updated_at as string,
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

  // Verificar tamaño máximo (500 KB = 512000 bytes)
  if (validatedData.bytes_size > 512000) {
    throw new Error('La imagen no puede exceder 500 KB');
  }

  // Convertir a Uint8Array si es Buffer
  let pngBytes: Uint8Array;
  if (Buffer.isBuffer(validatedData.png_bytes)) {
    pngBytes = new Uint8Array(validatedData.png_bytes);
  } else {
    pngBytes = validatedData.png_bytes;
  }

  await db.execute({
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

