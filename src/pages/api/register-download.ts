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

const dlRateLimitMap = new Map<string, { count: number; resetAt: number }>();
function checkDlRateLimit(ip: string, limit: number = 15, windowMs: number = 60000): boolean {
  const now = Date.now();
  if (dlRateLimitMap.size > 1000) {
    for (const [k, v] of dlRateLimitMap.entries()) {
      if (now > v.resetAt) dlRateLimitMap.delete(k);
    }
  }
  const entry = dlRateLimitMap.get(ip);
  if (!entry || now > entry.resetAt) {
    dlRateLimitMap.set(ip, { count: 1, resetAt: now + windowMs });
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

    if (!checkDlRateLimit(clientIp, 15)) {
      return new Response(JSON.stringify({
        success: false,
        error: 'Demasiadas solicitudes de descarga. Por favor reintenta en un minuto.'
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
      nombre, 
      email, 
      institucion, 
      estamento_rol, 
      proposito_uso, 
      detalle_proyecto, 
      archivo_solicitado, 
      consentimiento 
    } = body;

    // Validación de Nombre
    if (!nombre || typeof nombre !== 'string' || nombre.trim().length < 2) {
      return new Response(JSON.stringify({
        success: false,
        error: 'El nombre es obligatorio (mínimo 2 caracteres)'
      }), {
        status: 400,
        headers: CORS_HEADERS
      });
    }

    // Validación de Email
    if (!email || typeof email !== 'string' || !EMAIL_REGEX.test(email.trim())) {
      return new Response(JSON.stringify({
        success: false,
        error: 'Debe ingresar un correo electrónico válido'
      }), {
        status: 400,
        headers: CORS_HEADERS
      });
    }

    // Validación de Institución
    if (!institucion || typeof institucion !== 'string' || institucion.trim().length < 2) {
      return new Response(JSON.stringify({
        success: false,
        error: 'La institución o universidad es obligatoria'
      }), {
        status: 400,
        headers: CORS_HEADERS
      });
    }

    // Validación de Rol / Estamento
    if (!estamento_rol || typeof estamento_rol !== 'string' || estamento_rol.trim().length === 0) {
      return new Response(JSON.stringify({
        success: false,
        error: 'Debe seleccionar su rol o estamento institucional'
      }), {
        status: 400,
        headers: CORS_HEADERS
      });
    }

    // Validación de Propósito de Uso
    if (!proposito_uso || typeof proposito_uso !== 'string' || proposito_uso.trim().length === 0) {
      return new Response(JSON.stringify({
        success: false,
        error: 'Debe indicar para qué utilizará la información'
      }), {
        status: 400,
        headers: CORS_HEADERS
      });
    }

    // Validación de Consentimiento
    if (consentimiento !== true && consentimiento !== 'true') {
      return new Response(JSON.stringify({
        success: false,
        error: 'Debe aceptar el registro de datos para trazabilidad académica'
      }), {
        status: 400,
        headers: CORS_HEADERS
      });
    }

    const fileToDownload = (archivo_solicitado && typeof archivo_solicitado === 'string' && archivo_solicitado.trim().length > 0)
      ? archivo_solicitado.trim()
      : '/matriz_54_universidades.csv';

    const record_id = 'DL-' + Date.now().toString(36).toUpperCase();
    const nowIso = new Date().toISOString();

    const downloadRecord = {
      record_id,
      nombre: nombre.trim(),
      email: email.trim().toLowerCase(),
      institucion: institucion.trim(),
      estamento_rol: estamento_rol.trim(),
      proposito_uso: proposito_uso.trim(),
      detalle_proyecto: (detalle_proyecto && typeof detalle_proyecto === 'string') ? detalle_proyecto.trim() : null,
      archivo_solicitado: fileToDownload,
      timestamp: nowIso
    };

    const db = await getDb();
    if (db) {
      try {
        await db.put(`descarga:${record_id}`, JSON.stringify(downloadRecord));

        const rawDlIndex = await db.get('descarga_index');
        let dlIndex: string[] = [];
        if (rawDlIndex) {
          try { dlIndex = JSON.parse(rawDlIndex); } catch (_) {}
        }
        dlIndex.unshift(record_id);
        await db.put('descarga_index', JSON.stringify(dlIndex));

        // Registrar también en el índice de suscriptores para el envío de novedades
        const rawSubIndex = await db.get('sub_index');
        let subIndex: string[] = [];
        if (rawSubIndex) {
          try { subIndex = JSON.parse(rawSubIndex); } catch (_) {}
        }
        if (!subIndex.includes(downloadRecord.email)) {
          subIndex.unshift(downloadRecord.email);
          await db.put('sub_index', JSON.stringify(subIndex));
          await db.put(`sub:${downloadRecord.email}`, JSON.stringify({
            email: downloadRecord.email,
            nombre: downloadRecord.nombre,
            institucion: downloadRecord.institucion,
            origen: 'descarga_dataset',
            timestamp: nowIso
          }));
        }
      } catch (dbErr) {
        console.warn('[register-download] Error guardando en Cloudflare KV:', dbErr);
      }
    }

    return new Response(JSON.stringify({
      success: true,
      message: 'Registro completado con éxito. Descarga autorizada.',
      download_url: fileToDownload,
      record_id,
      ticket_id: record_id,
      data: downloadRecord
    }), {
      status: 200,
      headers: CORS_HEADERS
    });

  } catch (err: any) {
    return new Response(JSON.stringify({
      success: false,
      error: 'Error procesando registro de descarga: ' + (err?.message || 'Error interno')
    }), {
      status: 400,
      headers: CORS_HEADERS
    });
  }
};
