import type { APIRoute } from 'astro';
import { getDb } from '../../lib/kv.ts';

export const prerender = false;

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const CORS_HEADERS = {
  'Content-Type': 'application/json',
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
  'X-Content-Type-Options': 'nosniff'
};

const submitRateLimitMap = new Map<string, { count: number; resetAt: number }>();
function checkSubmitRateLimit(ip: string, limit: number = 10, windowMs: number = 60000): boolean {
  const now = Date.now();
  if (submitRateLimitMap.size > 1000) {
    for (const [k, v] of submitRateLimitMap.entries()) {
      if (now > v.resetAt) submitRateLimitMap.delete(k);
    }
  }
  const entry = submitRateLimitMap.get(ip);
  if (!entry || now > entry.resetAt) {
    submitRateLimitMap.set(ip, { count: 1, resetAt: now + windowMs });
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

export const POST: APIRoute = async ({ request, locals }) => {
  try {
    const clientIp = request.headers.get('cf-connecting-ip') || 
      request.headers.get('x-forwarded-for')?.split(',')[0].trim() || 
      '127.0.0.1';

    if (!checkSubmitRateLimit(clientIp, 10)) {
      return new Response(JSON.stringify({
        success: false,
        error: 'Demasiadas solicitudes de aporte comunitario. Por favor reintenta en un minuto.'
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

    const { 
      institucion, 
      numero_decreto, 
      organo_emisor, 
      url_normativa, 
      url_adjunto, 
      resumen, 
      remitente_email, 
      remitente_nombre 
    } = body;

    if (!institucion || typeof institucion !== 'string' || institucion.trim().length === 0) {
      return new Response(JSON.stringify({
        success: false,
        error: 'El nombre de la institución es obligatorio'
      }), {
        status: 400,
        headers: CORS_HEADERS
      });
    }

    const hasUrl = url_normativa && typeof url_normativa === 'string' && url_normativa.trim().length > 0;
    const hasAdjunto = url_adjunto && typeof url_adjunto === 'string' && url_adjunto.trim().length > 0;
    const hasResumen = resumen && typeof resumen === 'string' && resumen.trim().length > 0;
    const hasDecreto = numero_decreto && typeof numero_decreto === 'string' && numero_decreto.trim().length > 0;

    if (!hasUrl && !hasResumen && !hasDecreto && !hasAdjunto) {
      return new Response(JSON.stringify({
        success: false,
        error: 'Debe ingresar un enlace a la normativa, el N° de decreto o un resumen del antecedente'
      }), {
        status: 400,
        headers: CORS_HEADERS
      });
    }

    if (hasUrl) {
      const trimmedUrl = url_normativa.trim();
      if (!trimmedUrl.startsWith('http://') && !trimmedUrl.startsWith('https://')) {
        return new Response(JSON.stringify({
          success: false,
          error: 'El enlace a la normativa debe ser una URL válida (http:// o https://)'
        }), {
          status: 400,
          headers: CORS_HEADERS
        });
      }
    }

    if (hasAdjunto) {
      const trimmedAdj = url_adjunto.trim();
      if (!trimmedAdj.startsWith('http://') && !trimmedAdj.startsWith('https://')) {
        return new Response(JSON.stringify({
          success: false,
          error: 'El enlace al archivo adjunto debe ser una URL válida (http:// o https://)'
        }), {
          status: 400,
          headers: CORS_HEADERS
        });
      }
    }

    if (remitente_email && typeof remitente_email === 'string' && remitente_email.trim().length > 0) {
      if (!EMAIL_REGEX.test(remitente_email.trim())) {
        return new Response(JSON.stringify({
          success: false,
          error: 'El correo electrónico ingresado no es válido'
        }), {
          status: 400,
          headers: CORS_HEADERS
        });
      }
    }

    const ticket_id = 'NORM-' + Date.now().toString(36).toUpperCase();
    const nowIso = new Date().toISOString();

    const aporteRecord = {
      ticket_id,
      institucion: institucion.trim(),
      numero_decreto: hasDecreto ? numero_decreto.trim() : null,
      organo_emisor: organo_emisor && typeof organo_emisor === 'string' ? organo_emisor.trim() : null,
      url_normativa: hasUrl ? url_normativa.trim() : null,
      url_adjunto: hasAdjunto ? url_adjunto.trim() : null,
      resumen: hasResumen ? resumen.trim() : null,
      remitente_email: remitente_email && typeof remitente_email === 'string' ? remitente_email.trim() : null,
      remitente_nombre: remitente_nombre && typeof remitente_nombre === 'string' ? remitente_nombre.trim() : null,
      timestamp: nowIso
    };

    const db = await getDb();
    if (db) {
      try {
        await db.put(`normativa:${ticket_id}`, JSON.stringify(aporteRecord));

        const rawNormIndex = await db.get('normativa_index');
        let normIndex: string[] = [];
        if (rawNormIndex) {
          try { normIndex = JSON.parse(rawNormIndex); } catch (_) {}
        }
        normIndex.unshift(ticket_id);
        await db.put('normativa_index', JSON.stringify(normIndex));
      } catch (dbErr) {
        console.warn('[submit-normativa] Error guardando en Cloudflare KV:', dbErr);
      }
    }

    return new Response(JSON.stringify({
      success: true,
      message: `Aporte comunitario registrado para ${institucion.trim()}. ¡Muchas gracias por contribuir a la transparencia del catastro! Si deseas adjuntar el PDF o resolución escaneada, por favor envíala a eduardo@evegat.cl mencionando el ticket ${ticket_id}.`,
      ticket_id,
      data: aporteRecord
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
