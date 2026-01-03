import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

/**
 * Rate limiting simple en memoria (para producción usar Redis o similar)
 */
const loginAttempts = new Map<string, { count: number; resetTime: number }>();

const RATE_LIMIT = {
  windowMs: 15 * 60 * 1000, // 15 minutos
  maxAttempts: 5, // máximo 5 intentos por ventana
};

function getRateLimitKey(request: NextRequest): string {
  // Usar IP + User-Agent como clave
  const ip = request.headers.get('x-forwarded-for') || 
             request.headers.get('x-real-ip') || 
             'unknown';
  const ua = request.headers.get('user-agent') || 'unknown';
  return `${ip}-${ua}`;
}

function checkRateLimit(request: NextRequest, endpoint: string): boolean {
  if (endpoint !== '/api/auth/login') return true;

  const key = getRateLimitKey(request);
  const now = Date.now();
  const record = loginAttempts.get(key);

  if (!record || now > record.resetTime) {
    loginAttempts.set(key, { count: 1, resetTime: now + RATE_LIMIT.windowMs });
    return true;
  }

  if (record.count >= RATE_LIMIT.maxAttempts) {
    return false;
  }

  record.count++;
  return true;
}

export function resetLoginRateLimit(request: NextRequest) {
  const key = getRateLimitKey(request);
  loginAttempts.delete(key);
}

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Rate limiting para login
  if (pathname === '/api/auth/login' && request.method === 'POST') {
    if (!checkRateLimit(request, pathname)) {
      return NextResponse.json(
        { success: false, error: 'Demasiados intentos. Por favor intenta más tarde.' },
        { status: 429 }
      );
    }
  }

  // Headers de seguridad
  const response = NextResponse.next();

  // Prevenir clickjacking
  response.headers.set('X-Frame-Options', 'DENY');
  
  // Prevenir MIME type sniffing
  response.headers.set('X-Content-Type-Options', 'nosniff');
  
  // XSS Protection
  response.headers.set('X-XSS-Protection', '1; mode=block');
  
  // Referrer Policy
  response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin');
  
  // Permissions Policy
  response.headers.set(
    'Permissions-Policy',
    'camera=(), microphone=(), geolocation=(), interest-cohort=()'
  );

  // Content Security Policy
  const csp = [
    "default-src 'self'",
    "script-src 'self' 'unsafe-inline' 'unsafe-eval'", // Next.js requiere unsafe-inline/unsafe-eval
    "style-src 'self' 'unsafe-inline'", // Tailwind requiere unsafe-inline
    "img-src 'self' data: blob: https:",
    "font-src 'self' data:",
    "connect-src 'self'",
    "frame-ancestors 'none'",
    "base-uri 'self'",
    "form-action 'self'",
  ].join('; ');

  response.headers.set('Content-Security-Policy', csp);

  // HSTS (solo en producción con HTTPS)
  if (process.env.NODE_ENV === 'production') {
    response.headers.set('Strict-Transport-Security', 'max-age=31536000; includeSubDomains');
  }

  return response;
}

export const config = {
  matcher: [
    /*
     * Match all request paths except:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder
     */
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
};
