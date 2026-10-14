import type { APIRoute } from 'astro';
import { getAdminPassword, createSessionToken, buildSessionCookie } from '../../../lib/auth.ts';
import { getDb } from '../../../lib/kv.ts';

export const prerender = false;

const loginRateLimitMap = new Map<string, { count: number; resetAt: number }>();
function checkLoginRateLimit(ip: string, limit: number = 5, windowMs: number = 60000): boolean {
  const now = Date.now();
  if (loginRateLimitMap.size > 1000) {
    for (const [k, v] of loginRateLimitMap.entries()) {
      if (now > v.resetAt) loginRateLimitMap.delete(k);
    }
  }
  const entry = loginRateLimitMap.get(ip);
  if (!entry || now > entry.resetAt) {
    loginRateLimitMap.set(ip, { count: 1, resetAt: now + windowMs });
    return true;
  }
  if (entry.count >= limit) return false;
  entry.count++;
  return true;
}

export const POST: APIRoute = async ({ request }) => {
  const clientIp = request.headers.get('cf-connecting-ip') || 
    request.headers.get('x-forwarded-for')?.split(',')[0].trim() || 
    '127.0.0.1';

  if (!checkLoginRateLimit(clientIp, 5)) {
    return new Response(JSON.stringify({
      success: false,
      error: 'Demasiados intentos fallidos. Por favor espera un minuto.'
    }), {
      status: 429,
      headers: { 'Content-Type': 'application/json' }
    });
  }

  let body: any;
  try {
    body = await request.json();
  } catch {
    return new Response(JSON.stringify({ success: false, error: 'JSON inválido' }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' }
    });
  }

  const { password } = body || {};
  let env: any = null;
  try {
    const mod = await import('cloudflare:workers');
    env = mod?.env;
  } catch (_) {}

  const correctPassword = getAdminPassword(env);

  if (!password || password.trim() !== correctPassword) {
    return new Response(JSON.stringify({
      success: false,
      error: 'Contraseña incorrecta'
    }), {
      status: 401,
      headers: { 'Content-Type': 'application/json' }
    });
  }

  const token = await createSessionToken();
  const cookieHeader = buildSessionCookie(token);

  return new Response(JSON.stringify({
    success: true,
    message: 'Autenticación exitosa'
  }), {
    status: 200,
    headers: {
      'Content-Type': 'application/json',
      'Set-Cookie': cookieHeader
    }
  });
};
