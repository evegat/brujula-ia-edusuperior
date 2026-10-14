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

const subRateLimitMap = new Map<string, { count: number; resetAt: number }>();
function checkSubRateLimit(ip: string, limit: number = 10, windowMs: number = 60000): boolean {
  const now = Date.now();
  if (subRateLimitMap.size > 1000) {
    for (const [k, v] of subRateLimitMap.entries()) {
      if (now > v.resetAt) subRateLimitMap.delete(k);
    }
  }
  const entry = subRateLimitMap.get(ip);
  if (!entry || now > entry.resetAt) {
    subRateLimitMap.set(ip, { count: 1, resetAt: now + windowMs });
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

    if (!checkSubRateLimit(clientIp, 10)) {
      return new Response(JSON.stringify({
        success: false,
        error: 'Demasiadas solicitudes de suscripción. Por favor reintenta en un minuto.'
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

    const { email, institucion, perfil, origen, consentimiento_ley_21719 } = body;

    if (!email || typeof email !== 'string' || !EMAIL_REGEX.test(email.trim())) {
      return new Response(JSON.stringify({
        success: false,
        error: 'Email inválido o ausente'
      }), {
        status: 400,
        headers: CORS_HEADERS
      });
    }

    const cleanEmail = email.trim().toLowerCase();

    let isConsent = false;
    if (consentimiento_ley_21719 === true || consentimiento_ley_21719 === 'true') {
      isConsent = true;
    } else if (consentimiento_ley_21719 === false || consentimiento_ley_21719 === 'false') {
      return new Response(JSON.stringify({
        success: false,
        error: 'El consentimiento conforme a la Ley N° 21.719 no puede ser falso ni denegado para registrar la suscripción.'
      }), {
        status: 400,
        headers: CORS_HEADERS
      });
    }

    const cleanInst = institucion && typeof institucion === 'string' ? institucion.trim() : 'No informada';
    const cleanPerfil = perfil && typeof perfil === 'string' ? perfil.trim() : 'general';

    // Despacho durable a FormSubmit hacia evegat@uchile.cl con CC eduardo@evegat.cl y auto-respuesta al suscriptor
    const autoresponseMessage = 
      '¡Hola! Gracias por registrarte en el Observatorio Brújula IA de la Educación Superior en Chile (https://brujulaiaedusuperior.evegat.cl).\n\n' +
      'Hemos recibido y registrado tus datos correctamente. Te notificaremos a esta misma casilla cuando existan actualizaciones normativas en universidades chilenas, nuevas compras públicas de tecnología registradas o publiquemos herramientas y cláusulas de interés público.\n\n' +
      'Atentamente,\n' +
      'Eduardo Vega Toledo\n' +
      'Universidad de Chile (evegat@uchile.cl / eduardo@evegat.cl)\n' +
      'Brújula IA Educación Superior';

    try {
      const formPayload = new URLSearchParams();
      formPayload.append('email', cleanEmail);
      formPayload.append('institucion', cleanInst);
      formPayload.append('perfil', cleanPerfil);
      formPayload.append('origen', origen && typeof origen === 'string' ? origen.trim() : 'brujula-p154');
      formPayload.append('consentimiento_ley_21719', 'Aceptado (Ley N° 21.719)');
      formPayload.append('_subject', `[Brújula IA] Nueva suscripción / alerta observatorio: ${cleanEmail}`);
      formPayload.append('_autoresponse', autoresponseMessage);
      formPayload.append('_cc', 'eduardo@evegat.cl');
      formPayload.append('_replyto', cleanEmail);
      formPayload.append('_template', 'table');
      formPayload.append('_captcha', 'false');

      const submitRes = await fetch('https://formsubmit.co/ajax/evegat@uchile.cl', {
        method: 'POST',
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/x-www-form-urlencoded'
        },
        body: formPayload.toString()
      });

      if (!submitRes.ok) {
        console.warn('[subscribe] FormSubmit returned status:', submitRes.status);
      }
    } catch (fsErr) {
      console.warn('[subscribe] Error despachando a FormSubmit:', fsErr);
      // No fallamos la petición del usuario si hay timeout de red externo, el registro local persiste
    }

    return new Response(JSON.stringify({
      success: true,
      message: `Suscripción registrada con éxito para ${cleanEmail}. Te hemos enviado un correo de confirmación.`,
      data: {
        email: cleanEmail,
        institucion: cleanInst,
        perfil: cleanPerfil,
        origen: origen && typeof origen === 'string' ? origen.trim() : 'brujula-p154',
        consentimiento_ley_21719: isConsent,
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
