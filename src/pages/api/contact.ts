import type { APIRoute } from 'astro';

export const prerender = false;

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const CORS_HEADERS = {
  'Content-Type': 'application/json',
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
  'X-Content-Type-Options': 'nosniff'
};

const contactRateLimitMap = new Map<string, { count: number; resetAt: number }>();
function checkContactRateLimit(ip: string, limit: number = 10, windowMs: number = 60000): boolean {
  const now = Date.now();
  if (contactRateLimitMap.size > 1000) {
    for (const [k, v] of contactRateLimitMap.entries()) {
      if (now > v.resetAt) contactRateLimitMap.delete(k);
    }
  }
  const entry = contactRateLimitMap.get(ip);
  if (!entry || now > entry.resetAt) {
    contactRateLimitMap.set(ip, { count: 1, resetAt: now + windowMs });
    return true;
  }
  if (entry.count >= limit) {
    return false;
  }
  entry.count++;
  return true;
}

export const OPTIONS: APIRoute = async () => {
  return new Response(null, {
    status: 204,
    headers: CORS_HEADERS
  });
};

export const POST: APIRoute = async ({ request }) => {
  try {
    const clientIp = request.headers.get('cf-connecting-ip') || 
      request.headers.get('x-forwarded-for')?.split(',')[0].trim() || 
      '127.0.0.1';

    if (!checkContactRateLimit(clientIp, 10)) {
      return new Response(JSON.stringify({
        success: false,
        error: 'Demasiados mensajes enviados. Por favor reintenta en un minuto.'
      }), {
        status: 429,
        headers: { ...CORS_HEADERS, 'Retry-After': '60' }
      });
    }

    const contentType = request.headers.get('content-type') || '';
    if (!contentType.includes('application/json')) {
      return new Response(JSON.stringify({
        success: false,
        error: 'Content-Type debe ser application/json'
      }), {
        status: 400,
        headers: CORS_HEADERS
      });
    }

    let body: any;
    try {
      body = await request.json();
    } catch {
      return new Response(JSON.stringify({
        success: false,
        error: 'JSON inválido o malformado en el cuerpo de la solicitud'
      }), {
        status: 400,
        headers: CORS_HEADERS
      });
    }

    if (!body || typeof body !== 'object') {
      return new Response(JSON.stringify({
        success: false,
        error: 'El cuerpo debe ser un objeto JSON válido'
      }), {
        status: 400,
        headers: CORS_HEADERS
      });
    }

    const { nombre, email, mensaje, asunto } = body;

    if (!email || typeof email !== 'string' || !EMAIL_REGEX.test(email.trim())) {
      return new Response(JSON.stringify({
        success: false,
        error: 'Debe ingresar un correo electrónico válido'
      }), {
        status: 400,
        headers: CORS_HEADERS
      });
    }

    if (!mensaje || typeof mensaje !== 'string' || mensaje.trim().length < 5) {
      return new Response(JSON.stringify({
        success: false,
        error: 'Debe ingresar un mensaje de al menos 5 caracteres'
      }), {
        status: 400,
        headers: CORS_HEADERS
      });
    }

    const cleanEmail = email.trim().toLowerCase();
    const cleanNombre = nombre && typeof nombre === 'string' ? nombre.trim() : 'Anónimo';
    const cleanAsunto = asunto && typeof asunto === 'string' ? asunto.trim() : 'Contacto Brújula IA';

    return new Response(JSON.stringify({
      success: true,
      message: 'Mensaje enviado correctamente. Eduardo se pondrá en contacto a la brevedad.',
      data: {
        nombre: cleanNombre,
        email: cleanEmail,
        asunto: cleanAsunto,
        timestamp: new Date().toISOString()
      }
    }), {
      status: 200,
      headers: CORS_HEADERS
    });
  } catch (err: any) {
    return new Response(JSON.stringify({
      success: false,
      error: 'Error procesando solicitud: ' + (err?.message || 'Error interno')
    }), {
      status: 400,
      headers: CORS_HEADERS
    });
  }
};
