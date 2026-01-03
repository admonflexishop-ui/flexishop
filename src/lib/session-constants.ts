/**
 * Constantes para el manejo de sesiones
 * Centraliza el nombre de la cookie/sessionStorage para mantener consistencia
 */

// Nombre de la cookie de sesión (usado en el servidor)
export const SESSION_COOKIE_NAME = process.env.KEY_SESSION || 'admin_session';

// Nombre de la clave en sessionStorage (usado en el cliente)
// En Next.js, las variables de entorno del cliente deben tener el prefijo NEXT_PUBLIC_
export const SESSION_STORAGE_KEY = process.env.NEXT_PUBLIC_KEY_SESSION || 'logeo';

