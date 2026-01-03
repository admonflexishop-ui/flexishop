import { db } from '../db';
import { BranchSchema, CreateBranchSchema, UpdateBranchSchema, type Branch, type CreateBranch, type UpdateBranch } from '../validators';
import { randomUUID } from 'crypto';

/**
 * Obtiene todas las sucursales
 */
export async function getAllBranches(): Promise<Branch[]> {
  const result = await db.execute({
    sql: 'SELECT * FROM branches ORDER BY created_at DESC',
    args: [],
  });

  return result.rows.map((row) => {
    const branch = {
      id: row.id as string,
      name: row.name as string,
      address: (row.address as string | null) ?? null,
      phone: (row.phone as string | null) ?? null,
      is_active: (row.is_active as number) ?? 1,
      created_at: row.created_at as string,
      updated_at: row.updated_at as string,
    };
    return BranchSchema.parse(branch);
  });
}

/**
 * Obtiene todas las sucursales activas
 */
export async function getActiveBranches(): Promise<Branch[]> {
  const result = await db.execute({
    sql: 'SELECT * FROM branches WHERE is_active = 1 ORDER BY name ASC',
    args: [],
  });

  return result.rows.map((row) => {
    const branch = {
      id: row.id as string,
      name: row.name as string,
      address: (row.address as string | null) ?? null,
      phone: (row.phone as string | null) ?? null,
      is_active: (row.is_active as number) ?? 1,
      created_at: row.created_at as string,
      updated_at: row.updated_at as string,
    };
    return BranchSchema.parse(branch);
  });
}

/**
 * Obtiene una sucursal por ID
 */
export async function getBranchById(id: string): Promise<Branch | null> {
  const result = await db.execute({
    sql: 'SELECT * FROM branches WHERE id = ?',
    args: [id],
  });

  if (result.rows.length === 0) {
    return null;
  }

  const row = result.rows[0];
  const branch = {
    id: row.id as string,
    name: row.name as string,
    address: (row.address as string | null) ?? null,
    phone: (row.phone as string | null) ?? null,
    is_active: (row.is_active as number) ?? 1,
    created_at: row.created_at as string,
    updated_at: row.updated_at as string,
  };

  return BranchSchema.parse(branch);
}

/**
 * Crea una nueva sucursal
 */
export async function createBranch(data: CreateBranch): Promise<Branch> {
  const validatedData = CreateBranchSchema.parse(data);
  const id = randomUUID();
  const now = new Date().toISOString();

  await db.execute({
    sql: `
      INSERT INTO branches (id, name, address, phone, is_active, created_at, updated_at)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `,
    args: [
      id,
      validatedData.name,
      validatedData.address ?? null,
      validatedData.phone ?? null,
      validatedData.is_active ?? 1,
      now,
      now,
    ],
  });

  const branch = await getBranchById(id);
  if (!branch) {
    throw new Error('Error al crear la sucursal');
  }

  return branch;
}

/**
 * Actualiza una sucursal existente
 */
export async function updateBranch(id: string, data: UpdateBranch): Promise<Branch> {
  const validatedData = UpdateBranchSchema.parse(data);
  const now = new Date().toISOString();

  const fields: string[] = [];
  const values: any[] = [];

  if (validatedData.name !== undefined) {
    fields.push('name = ?');
    values.push(validatedData.name);
  }
  if (validatedData.address !== undefined) {
    fields.push('address = ?');
    values.push(validatedData.address ?? null);
  }
  if (validatedData.phone !== undefined) {
    fields.push('phone = ?');
    values.push(validatedData.phone ?? null);
  }
  if (validatedData.is_active !== undefined) {
    fields.push('is_active = ?');
    values.push(validatedData.is_active);
  }

  if (fields.length === 0) {
    const branch = await getBranchById(id);
    if (!branch) {
      throw new Error('Sucursal no encontrada');
    }
    return branch;
  }

  fields.push('updated_at = ?');
  values.push(now);
  values.push(id);

  await db.execute({
    sql: `UPDATE branches SET ${fields.join(', ')} WHERE id = ?`,
    args: values,
  });

  const branch = await getBranchById(id);
  if (!branch) {
    throw new Error('Error al actualizar la sucursal');
  }

  return branch;
}

/**
 * Elimina una sucursal
 */
export async function deleteBranch(id: string): Promise<boolean> {
  const result = await db.execute({
    sql: 'DELETE FROM branches WHERE id = ?',
    args: [id],
  });

  return (result.rowsAffected ?? 0) > 0;
}

