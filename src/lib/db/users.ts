import { db } from '../db';
import { UserSchema, CreateUserSchema, UpdateUserSchema, type User, type CreateUser, type UpdateUser } from '../validators';
import { randomUUID } from 'crypto';
import bcrypt from 'bcryptjs';
import { normalizeDateTime } from './utils';

/**
 * Obtiene todos los usuarios (sin password por seguridad)
 */
export async function getAllUsers(): Promise<User[]> {
  const result = await db.execute({
    sql: 'SELECT id, email, name, role, is_active, created_at, updated_at FROM users ORDER BY created_at DESC',
    args: [],
  });

  return result.rows.map((row) => {
    const user = {
      id: row.id as string,
      email: row.email as string,
      name: (row.name as string | null) ?? null,
      role: (row.role as 'admin' | 'editor') ?? 'admin',
      is_active: (row.is_active as number) ?? 1,
      created_at: normalizeDateTime(row.created_at as string),
      updated_at: normalizeDateTime(row.updated_at as string),
    };
    return UserSchema.parse(user);
  });
}

/**
 * Obtiene un usuario por ID (sin password por seguridad)
 */
export async function getUserById(id: string): Promise<User | null> {
  const result = await db.execute({
    sql: 'SELECT id, email, name, role, is_active, created_at, updated_at FROM users WHERE id = ?',
    args: [id],
  });

  if (result.rows.length === 0) {
    return null;
  }

  const row = result.rows[0];
  const user = {
    id: row.id as string,
    email: row.email as string,
    name: (row.name as string | null) ?? null,
    role: (row.role as 'admin' | 'editor') ?? 'admin',
    is_active: (row.is_active as number) ?? 1,
    created_at: normalizeDateTime(row.created_at as string),
    updated_at: normalizeDateTime(row.updated_at as string),
  };

  return UserSchema.parse(user);
}

/**
 * Obtiene un usuario por email (sin password por seguridad)
 */
export async function getUserByEmail(email: string): Promise<User | null> {
  const result = await db.execute({
    sql: 'SELECT id, email, name, role, is_active, created_at, updated_at FROM users WHERE email = ?',
    args: [email],
  });

  if (result.rows.length === 0) {
    return null;
  }

  const row = result.rows[0];
  const user = {
    id: row.id as string,
    email: row.email as string,
    name: (row.name as string | null) ?? null,
    role: (row.role as 'admin' | 'editor') ?? 'admin',
    is_active: (row.is_active as number) ?? 1,
    created_at: normalizeDateTime(row.created_at as string),
    updated_at: normalizeDateTime(row.updated_at as string),
  };

  return UserSchema.parse(user);
}

/**
 * Obtiene un usuario por email CON password (solo para autenticación)
 * ⚠️ Esta función debe usarse solo para verificar credenciales
 */
export async function getUserByEmailWithPassword(email: string): Promise<{ id: string; email: string; password: string | null; role: 'admin' | 'editor'; is_active: number } | null> {
  const result = await db.execute({
    sql: 'SELECT id, email, password, role, is_active FROM users WHERE email = ?',
    args: [email],
  });

  if (result.rows.length === 0) {
    return null;
  }

  const row = result.rows[0];
  return {
    id: row.id as string,
    email: row.email as string,
    password: (row.password as string | null) ?? null,
    role: (row.role as 'admin' | 'editor') ?? 'admin',
    is_active: (row.is_active as number) ?? 1,
  };
}

/**
 * Crea un nuevo usuario
 */
export async function createUser(data: CreateUser): Promise<User> {
  const validatedData = CreateUserSchema.parse(data);
  const id = randomUUID();
  const now = new Date().toISOString();

  // Hashear password con bcrypt
  const hashedPassword = await bcrypt.hash(validatedData.password, 10);

  await db.execute({
    sql: `
      INSERT INTO users (id, email, name, password, role, is_active, created_at, updated_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `,
    args: [
      id,
      validatedData.email,
      validatedData.name ?? null,
      hashedPassword,
      validatedData.role ?? 'admin',
      validatedData.is_active ?? 1,
      now,
      now,
    ],
  });

  const user = await getUserById(id);
  if (!user) {
    throw new Error('Error al crear el usuario');
  }

  return user;
}

/**
 * Actualiza un usuario existente
 */
export async function updateUser(id: string, data: UpdateUser): Promise<User> {
  const validatedData = UpdateUserSchema.parse(data);
  const now = new Date().toISOString();

  // Construir la consulta dinámicamente basándose en los campos proporcionados
  const fields: string[] = [];
  const values: any[] = [];

  if (validatedData.email !== undefined) {
    fields.push('email = ?');
    values.push(validatedData.email);
  }
  if (validatedData.name !== undefined) {
    fields.push('name = ?');
    values.push(validatedData.name ?? null);
  }
  if (validatedData.role !== undefined) {
    fields.push('role = ?');
    values.push(validatedData.role);
  }
  if (validatedData.is_active !== undefined) {
    fields.push('is_active = ?');
    values.push(validatedData.is_active);
  }
  if (validatedData.password !== undefined) {
    // Hashear password con bcrypt al actualizar
    const hashedPassword = await bcrypt.hash(validatedData.password, 10);
    fields.push('password = ?');
    values.push(hashedPassword);
  }

  if (fields.length === 0) {
    const user = await getUserById(id);
    if (!user) {
      throw new Error('Usuario no encontrado');
    }
    return user;
  }

  fields.push('updated_at = ?');
  values.push(now);
  values.push(id);

  await db.execute({
    sql: `UPDATE users SET ${fields.join(', ')} WHERE id = ?`,
    args: values,
  });

  const user = await getUserById(id);
  if (!user) {
    throw new Error('Error al actualizar el usuario');
  }

  return user;
}

/**
 * Elimina un usuario
 */
export async function deleteUser(id: string): Promise<boolean> {
  const result = await db.execute({
    sql: 'DELETE FROM users WHERE id = ?',
    args: [id],
  });

  return (result.rowsAffected ?? 0) > 0;
}

