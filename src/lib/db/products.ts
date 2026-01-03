import { db } from '../db';
import { ProductSchema, CreateProductSchema, UpdateProductSchema, type Product, type CreateProduct, type UpdateProduct } from '../validators';
import { randomUUID } from 'crypto';

/**
 * Obtiene todos los productos
 */
export async function getAllProducts(): Promise<Product[]> {
  const result = await db.execute({
    sql: 'SELECT * FROM products ORDER BY created_at DESC',
    args: [],
  });

  return result.rows.map((row) => {
    const product = {
      id: row.id as string,
      name: row.name as string,
      description: (row.description as string | null) ?? null,
      price_cents: (row.price_cents as number) ?? 0,
      stock: (row.stock as number) ?? 0,
      is_active: (row.is_active as number) ?? 1,
      created_at: row.created_at as string,
      updated_at: row.updated_at as string,
    };
    return ProductSchema.parse(product);
  });
}

/**
 * Obtiene todos los productos activos
 */
export async function getActiveProducts(): Promise<Product[]> {
  const result = await db.execute({
    sql: 'SELECT * FROM products WHERE is_active = 1 ORDER BY name ASC',
    args: [],
  });

  return result.rows.map((row) => {
    const product = {
      id: row.id as string,
      name: row.name as string,
      description: (row.description as string | null) ?? null,
      price_cents: (row.price_cents as number) ?? 0,
      stock: (row.stock as number) ?? 0,
      is_active: (row.is_active as number) ?? 1,
      created_at: row.created_at as string,
      updated_at: row.updated_at as string,
    };
    return ProductSchema.parse(product);
  });
}

/**
 * Obtiene un producto por ID
 */
export async function getProductById(id: string): Promise<Product | null> {
  const result = await db.execute({
    sql: 'SELECT * FROM products WHERE id = ?',
    args: [id],
  });

  if (result.rows.length === 0) {
    return null;
  }

  const row = result.rows[0];
  const product = {
    id: row.id as string,
    name: row.name as string,
    description: (row.description as string | null) ?? null,
    price_cents: (row.price_cents as number) ?? 0,
    stock: (row.stock as number) ?? 0,
    is_active: (row.is_active as number) ?? 1,
    created_at: row.created_at as string,
    updated_at: row.updated_at as string,
  };

  return ProductSchema.parse(product);
}

/**
 * Crea un nuevo producto
 */
export async function createProduct(data: CreateProduct): Promise<Product> {
  const validatedData = CreateProductSchema.parse(data);
  const id = randomUUID();
  const now = new Date().toISOString();

  await db.execute({
    sql: `
      INSERT INTO products (id, name, description, price_cents, stock, is_active, created_at, updated_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `,
    args: [
      id,
      validatedData.name,
      validatedData.description ?? null,
      validatedData.price_cents,
      validatedData.stock ?? 0,
      validatedData.is_active ?? 1,
      now,
      now,
    ],
  });

  const product = await getProductById(id);
  if (!product) {
    throw new Error('Error al crear el producto');
  }

  return product;
}

/**
 * Actualiza un producto existente
 */
export async function updateProduct(id: string, data: UpdateProduct): Promise<Product> {
  const validatedData = UpdateProductSchema.parse(data);
  const now = new Date().toISOString();

  const fields: string[] = [];
  const values: any[] = [];

  if (validatedData.name !== undefined) {
    fields.push('name = ?');
    values.push(validatedData.name);
  }
  if (validatedData.description !== undefined) {
    fields.push('description = ?');
    values.push(validatedData.description ?? null);
  }
  if (validatedData.price_cents !== undefined) {
    fields.push('price_cents = ?');
    values.push(validatedData.price_cents);
  }
  if (validatedData.stock !== undefined) {
    fields.push('stock = ?');
    values.push(validatedData.stock);
  }
  if (validatedData.is_active !== undefined) {
    fields.push('is_active = ?');
    values.push(validatedData.is_active);
  }

  if (fields.length === 0) {
    const product = await getProductById(id);
    if (!product) {
      throw new Error('Producto no encontrado');
    }
    return product;
  }

  fields.push('updated_at = ?');
  values.push(now);
  values.push(id);

  await db.execute({
    sql: `UPDATE products SET ${fields.join(', ')} WHERE id = ?`,
    args: values,
  });

  const product = await getProductById(id);
  if (!product) {
    throw new Error('Error al actualizar el producto');
  }

  return product;
}

/**
 * Elimina un producto
 */
export async function deleteProduct(id: string): Promise<boolean> {
  const result = await db.execute({
    sql: 'DELETE FROM products WHERE id = ?',
    args: [id],
  });

  return (result.rowsAffected ?? 0) > 0;
}

