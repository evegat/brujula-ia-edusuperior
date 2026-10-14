// src/lib/auth.ts
// Autenticación segura mediante cookies firmadas con HMAC SHA-256 (Web Crypto API)

const DEFAULT_SECRET = 'BRUJULA_SECRET_SALT_2026_EDUARDO_VEGA_UCHILE';
const SESSION_COOKIE_NAME = 'brujula_admin_session';
const SESSION_MAX_AGE_SECONDS = 8 * 60 * 60; // 8 horas

// Contraseña por defecto o desde env
export function getAdminPassword(env?: any): string {
  return env?.ADMIN_PASSWORD || 'EduardoBrujula2026!';
}

// Genera un token firmado con HMAC SHA-256
export async function createSessionToken(secret: string = DEFAULT_SECRET): Promise<string> {
  const payload = {
    auth: true,
    exp: Date.now() + SESSION_MAX_AGE_SECONDS * 1000,
    rnd: Math.random().toString(36).substring(2)
  };
  const dataStr = JSON.stringify(payload);
  const encoder = new TextEncoder();
  
  const key = await crypto.subtle.importKey(
    'raw',
    encoder.encode(secret),
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign']
  );

  const signature = await crypto.subtle.sign('HMAC', key, encoder.encode(dataStr));
  const b64Payload = btoa(dataStr);
  const b64Sig = btoa(String.fromCharCode(...new Uint8Array(signature)));
  
  return `${b64Payload}.${b64Sig}`;
}

// Verifica si el token es válido y no ha expirado
export async function verifySessionToken(token: string, secret: string = DEFAULT_SECRET): Promise<boolean> {
  try {
    const parts = token.split('.');
    if (parts.length !== 2) return false;

    const [b64Payload, b64Sig] = parts;
    const dataStr = atob(b64Payload);
    const payload = JSON.parse(dataStr);

    if (!payload.auth || !payload.exp || Date.now() > payload.exp) {
      return false; // Expirado
    }

    const encoder = new TextEncoder();
    const key = await crypto.subtle.importKey(
      'raw',
      encoder.encode(secret),
      { name: 'HMAC', hash: 'SHA-256' },
      false,
      ['verify']
    );

    const sigBytes = Uint8Array.from(atob(b64Sig), c => c.charCodeAt(0));
    return await crypto.subtle.verify('HMAC', key, sigBytes, encoder.encode(dataStr));
  } catch {
    return false;
  }
}

// Extrae el valor de la cookie de sesión desde las cabeceras
export function getSessionFromRequest(request: Request): string | null {
  const cookieHeader = request.headers.get('cookie') || '';
  const cookies = cookieHeader.split(';').map(c => c.trim());
  for (const c of cookies) {
    if (c.startsWith(`${SESSION_COOKIE_NAME}=`)) {
      return decodeURIComponent(c.substring(SESSION_COOKIE_NAME.length + 1));
    }
  }
  return null;
}

export function buildSessionCookie(token: string): string {
  return `${SESSION_COOKIE_NAME}=${encodeURIComponent(token)}; Path=/; HttpOnly; Secure; SameSite=Strict; Max-Age=${SESSION_MAX_AGE_SECONDS}`;
}

export function buildClearCookie(): string {
  return `${SESSION_COOKIE_NAME}=; Path=/; HttpOnly; Secure; SameSite=Strict; Max-Age=0`;
}
