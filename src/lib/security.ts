/**
 * Utilidades de seguridad y validación
 */

/**
 * Sanitiza una cadena para prevenir XSS
 */
export function sanitizeString(input: string): string {
  if (typeof input !== 'string') return '';
  
  return input
    .replace(/[<>]/g, '') // Remover caracteres peligrosos
    .trim()
    .substring(0, 1000); // Limitar longitud
}

/**
 * Valida formato de email
 */
export function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email) && email.length <= 255;
}

/**
 * Valida formato de color hexadecimal
 */
export function isValidHexColor(color: string): boolean {
  return /^#[0-9A-Fa-f]{6}$/.test(color);
}

/**
 * Valida formato de teléfono (básico)
 */
export function isValidPhone(phone: string): boolean {
  // Permitir números, espacios, +, -, ( y )
  const phoneRegex = /^[\d\s\+\-\(\)]{10,20}$/;
  return phoneRegex.test(phone);
}

/**
 * Valida que un número sea positivo y esté en un rango válido
 */
export function isValidPositiveNumber(value: number, max?: number): boolean {
  if (typeof value !== 'number' || isNaN(value) || value < 0) return false;
  if (max !== undefined && value > max) return false;
  return true;
}

/**
 * Valida tamaño de payload JSON
 */
export function validatePayloadSize(body: string, maxSize: number = 10240): boolean {
  return new Blob([body]).size <= maxSize;
}

/**
 * Valida que un UUID sea válido
 */
export function isValidUUID(uuid: string): boolean {
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
  return uuidRegex.test(uuid);
}

/**
 * Escapa caracteres especiales para prevenir inyección SQL
 * (Aunque usamos prepared statements, es una capa adicional)
 */
export function escapeSqlString(input: string): string {
  return input.replace(/'/g, "''").replace(/;/g, '');
}

/**
 * Valida que una cadena no contenga comandos SQL peligrosos
 */
export function containsSqlInjection(input: string): boolean {
  const dangerousPatterns = [
    /(\b(SELECT|INSERT|UPDATE|DELETE|DROP|CREATE|ALTER|EXEC|EXECUTE|UNION|SCRIPT)\b)/i,
    /(--|#|\/\*|\*\/|;|xp_|sp_)/i,
  ];
  
  return dangerousPatterns.some(pattern => pattern.test(input));
}

