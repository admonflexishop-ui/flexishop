/**
 * Utilidades compartidas para operaciones de base de datos
 */

/**
 * Normaliza una fecha de SQLite/libSQL al formato ISO 8601 que Zod espera
 * SQLite puede devolver fechas en formato "YYYY-MM-DD HH:MM:SS" 
 * pero Zod espera formato ISO 8601 "YYYY-MM-DDTHH:MM:SSZ"
 */
export function normalizeDateTime(dateStr: string | null | undefined): string {
  if (!dateStr) return new Date().toISOString();
  
  // Si ya está en formato ISO completo con T y Z o timezone, devolverlo tal cual
  if (dateStr.includes('T')) {
    // Si ya tiene Z o timezone al final, está bien
    if (dateStr.endsWith('Z') || dateStr.match(/[+-]\d{2}:?\d{2}$/)) {
      return dateStr;
    }
    // Si tiene T pero no Z, agregar Z
    return dateStr + 'Z';
  }
  
  // Convertir formato SQLite (YYYY-MM-DD HH:MM:SS o YYYY-MM-DD HH:MM:SS.SSS) a ISO 8601
  // Reemplazar el primer espacio entre fecha y hora con T
  let normalized = dateStr.trim().replace(/^(\d{4}-\d{2}-\d{2}) (\d{2}:\d{2}:\d{2}(?:\.\d+)?)/, '$1T$2');
  
  // Si aún no tiene T (caso de error), intentar otro patrón
  if (!normalized.includes('T')) {
    normalized = normalized.replace(' ', 'T');
  }
  
  // Si no tiene información de zona horaria (Z, +, - con formato correcto), agregar Z
  if (!normalized.includes('Z') && !normalized.match(/[+-]\d{2}:?\d{2}$/)) {
    normalized = normalized + 'Z';
  }
  
  return normalized;
}

