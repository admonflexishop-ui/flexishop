import { db } from '../db';
import { SettingsSchema, UpdateSettingsSchema, type Settings, type UpdateSettings } from '../validators';

/**
 * Obtiene la configuración (solo hay una fila con id = 1)
 */
export async function getSettings(): Promise<Settings | null> {
  const result = await db.execute({
    sql: 'SELECT * FROM settings WHERE id = 1',
    args: [],
  });

  if (result.rows.length === 0) {
    // Si no existe, crear con valores por defecto
    return await initializeSettings();
  }

  const row = result.rows[0];
  const settings = {
    id: (row.id as number) ?? 1,
    store_name: (row.store_name as string) ?? 'FlexiShop',
    default_whatsapp: (row.default_whatsapp as string | null) ?? null,
    currency: (row.currency as string) ?? 'MXN',
    accent_color: (row.accent_color as string) ?? '#000000',
    created_at: row.created_at as string,
    updated_at: row.updated_at as string,
  };

  return SettingsSchema.parse(settings);
}

/**
 * Inicializa la configuración con valores por defecto
 */
async function initializeSettings(): Promise<Settings> {
  const now = new Date().toISOString();

  await db.execute({
    sql: `
      INSERT INTO settings (id, store_name, default_whatsapp, currency, accent_color, created_at, updated_at)
      VALUES (1, 'FlexiShop', NULL, 'MXN', '#000000', ?, ?)
      ON CONFLICT(id) DO NOTHING
    `,
    args: [now, now],
  });

  const settings = await getSettings();
  if (!settings) {
    throw new Error('Error al inicializar la configuración');
  }

  return settings;
}

/**
 * Actualiza la configuración
 */
export async function updateSettings(data: UpdateSettings): Promise<Settings> {
  const validatedData = UpdateSettingsSchema.parse(data);
  const now = new Date().toISOString();

  // Asegurar que existe la configuración
  await getSettings();

  const fields: string[] = [];
  const values: any[] = [];

  if (validatedData.store_name !== undefined) {
    fields.push('store_name = ?');
    values.push(validatedData.store_name);
  }
  if (validatedData.default_whatsapp !== undefined) {
    fields.push('default_whatsapp = ?');
    values.push(validatedData.default_whatsapp ?? null);
  }
  if (validatedData.currency !== undefined) {
    fields.push('currency = ?');
    values.push(validatedData.currency);
  }
  if (validatedData.accent_color !== undefined) {
    fields.push('accent_color = ?');
    values.push(validatedData.accent_color);
  }

  if (fields.length === 0) {
    const settings = await getSettings();
    if (!settings) {
      throw new Error('Error al obtener la configuración');
    }
    return settings;
  }

  fields.push('updated_at = ?');
  values.push(now);
  values.push(1); // id = 1

  await db.execute({
    sql: `UPDATE settings SET ${fields.join(', ')} WHERE id = ?`,
    args: values,
  });

  const settings = await getSettings();
  if (!settings) {
    throw new Error('Error al actualizar la configuración');
  }

  return settings;
}

