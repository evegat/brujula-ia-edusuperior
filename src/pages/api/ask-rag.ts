import type { APIRoute } from 'astro';
import citasData from '../../../data/citas_enriquecidas.json' with { type: 'json' };

export const prerender = false;

export interface Citation {
  id: number;
  doc_id: string;
  sigla: string;
  universidad: string;
  documento: string;
  tema: string;
  pagina: number;
  cita_limpia: string;
  url_original?: string | null;
  archivo_md?: string | null;
  archivo_pdf?: string;
  score?: number;
}

export function normalizeText(text: string): string {
  return (text || '')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

export function searchCitations(query: string, topK: number = 4): Citation[] {
  const safeTopK = Math.min(Math.max(1, Number(topK) || 4), 10);
  const normQuery = normalizeText(query);
  const queryTokens = normQuery.split(' ').filter(t => t.length > 2);
  
  if (queryTokens.length === 0) {
    return [];
  }

  // Diccionario temático enriquecido con terminología académica chilena
  const topicKeywords: Record<string, string[]> = {
    tesis: ['tesis', 'memoria', 'grado', 'postgrado', 'posgrado', 'afe', 'investigador', 'titulacion', 'seminario'],
    evaluacion: ['evaluacion', 'evaluaciones', 'examen', 'examenes', 'prueba', 'pruebas', 'certamen', 'certamenes', 'control', 'controles', 'rediseño', 'rubrica', 'rubricas', 'delegacion', 'tarea', 'aprendizaje', 'competencia'],
    autoria: ['autoria', 'autor', 'autores', 'coautor', 'coautora', 'propiedad', 'intelectual', 'sustituye', 'responsabilidad'],
    privacidad: ['privacidad', 'datos', 'personales', 'sensibles', 'confidencial', 'consentimiento', '21719', 'reserva', 'seguridad', 'plataforma'],
    sanciones: ['sancion', 'sanciones', 'plagio', 'falta', 'infraccion', 'disciplina', 'debido', 'proceso', 'prohibido', 'copia', 'deshonestidad'],
    transparencia: ['prompt', 'prompts', 'declaracion', 'declarar', 'transparencia', 'informar', 'citar', 'citacion', 'reconocimiento', 'metodologia']
  };

  const scored: Array<Citation & { score: number }> = (citasData as Citation[]).map(c => {
    let score = 0;
    const normCita = normalizeText(c.cita_limpia);
    const normDoc = normalizeText(c.documento);
    const normUni = normalizeText(c.universidad);
    const normSigla = normalizeText(c.sigla);

    // 1. Tokens directos en la cita y metadatos
    for (const token of queryTokens) {
      if (normCita.includes(token)) score += 3;
      if (normDoc.includes(token)) score += 2;
      if (normUni.includes(token) || normSigla.includes(token)) score += 5;
    }

    // 2. Coincidencia de tema semántico
    for (const [topic, words] of Object.entries(topicKeywords)) {
      const queryMatchesTopic = words.some(w => normQuery.includes(w));
      if (queryMatchesTopic) {
        if (c.tema === topic) score += 6;
        if (words.some(w => normCita.includes(w))) score += 2;
      }
    }

    return { ...c, score };
  });

  scored.sort((a, b) => b.score - a.score);

  // Umbral de relevancia: si ninguna cita supera score de 3 (solo stopwords débiles),
  // significa que la consulta no guarda relación con las cláusulas del corpus
  const relevant = scored.filter(c => c.score > 3);
  if (relevant.length === 0) {
    return [];
  }

  return relevant.slice(0, safeTopK);
}

export function synthesizeAnswer(query: string, citations: Citation[]): string {
  if (citations.length === 0) {
    return `No se encontraron cláusulas o regulaciones pertinentes en el catálogo de universidades chilenas para la consulta "${query}". Te invitamos a buscar sobre temas como: declaración obligatoria de prompts, autoría en tesis, directrices de evaluación y pruebas, o protección de datos personales bajo la Ley N° 21.719.`;
  }

  const unis = Array.from(new Set(citations.map(c => c.sigla || c.universidad))).join(', ');
  const normQuery = normalizeText(query);

  let resumenTematico = '';
  if (normQuery.includes('prompt') || normQuery.includes('declar') || normQuery.includes('cit')) {
    resumenTematico = 'Las normativas universitarias analizadas establecen de forma coincidente la **obligación de declarar transparentemente el uso de IA y los prompts utilizados** en trabajos académicos. Planteles como la Universidad de Chile (UChile), Pontificia Universidad Católica (PUC) y Universidad Adolfo Ibáñez (UAI) disponen que la asistencia de modelos generativos no exime de la autoría individual ni sustituye la argumentación del estudiante.';
  } else if (normQuery.includes('tesis') || normQuery.includes('memoria') || normQuery.includes('grado')) {
    resumenTematico = 'En el ámbito de **tesis y memorias de grado**, la regulación chilena exige declarar de manera explícita el rol que cumplió la IA (traducción, asistencia en síntesis o revisión estilística), prohibiendo terminantemente atribuirle la condición de coautora. En la Universidad de Chile y UDP, los instructivos de postgrado definen categorías estrictas de delegación permitida y no permitida.';
  } else if (normQuery.includes('autor') || normQuery.includes('propiedad')) {
    resumenTematico = 'Existe consenso unánime en el corpus regulatorio: **la Inteligencia Artificial no es persona jurídica ni puede ser reconocida como autora o coautora** de ningún trabajo, paper ni memoria académica. Quien presenta la obra asume la responsabilidad ética y científica total por el contenido generado.';
  } else if (normQuery.includes('privacid') || normQuery.includes('dato') || normQuery.includes('21719') || normQuery.includes('personal')) {
    resumenTematico = 'Con la promulgación de la **Ley N° 21.719 de Protección de Datos Personales**, los reglamentos de planteles como UAI, UDLA y UNAB prohíben explícitamente ingresar a herramientas comerciales de IA datos personales de estudiantes o pacientes, información institucional reservada o transcripciones de entrevistas sin consentimiento expreso.';
  } else if (normQuery.includes('sancion') || normQuery.includes('plagio') || normQuery.includes('falta') || normQuery.includes('copia')) {
    resumenTematico = 'El uso no autorizado de IA en actividades formativas se tipifica como **infracción grave a la integridad académica**. Las instituciones contemplan sanciones que van desde la anulación de la evaluación (calificación mínima 1.0) hasta sumarios disciplinarios o suspensión temporal, garantizando el debido proceso y derecho a descargo.';
  } else if (normQuery.includes('evalua') || normQuery.includes('examen') || normQuery.includes('prueba') || normQuery.includes('certamen') || normQuery.includes('rubric')) {
    resumenTematico = 'Respecto a **evaluaciones, pruebas y certámenes formativos**, las directrices universitarias orientan al cuerpo docente hacia el rediseño evaluativo y aprendizajes auténticos. El uso de modelos generativos en exámenes sumativos queda condicionado a la autorización expresa del equipo docente y la declaración metodológica obligatoria.';
  } else {
    resumenTematico = `A partir del análisis comparado de las normativas vigentes en instituciones como ${unis}, se constata una regulación orientada a la **integridad formativa, la transparencia en la declaración del uso y la centralidad de la evaluación auténtica**, buscando habilitar el uso pedagógico de la IA sin comprometer el aprendizaje reflexivo.`;
  }

  const detallesCitas = citations.map((c, i) => 
    `> **[${i + 1}] ${c.universidad} (${c.sigla})** — *${c.documento}*, pág. ${c.pagina}:\n> "${c.cita_limpia}"`
  ).join('\n\n');

  return `${resumenTematico}\n\n### Evidencia Textual Recuperada:\n\n${detallesCitas}`;
}

const CORS_HEADERS = {
  'Content-Type': 'application/json',
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
  'X-Content-Type-Options': 'nosniff'
};

const ragRateLimitMap = new Map<string, { count: number; resetAt: number }>();
function checkRagRateLimit(ip: string, limit: number = 30, windowMs: number = 60000): boolean {
  const now = Date.now();
  if (ragRateLimitMap.size > 1000) {
    for (const [k, v] of ragRateLimitMap.entries()) {
      if (now > v.resetAt) ragRateLimitMap.delete(k);
    }
  }
  const entry = ragRateLimitMap.get(ip);
  if (!entry || now > entry.resetAt) {
    ragRateLimitMap.set(ip, { count: 1, resetAt: now + windowMs });
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

    if (!checkRagRateLimit(clientIp, 30)) {
      return new Response(JSON.stringify({
        success: false,
        error: 'Límite de consultas superado (máximo 30 por minuto). Por favor reintenta en un momento.'
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

    const { query, top_k = 4 } = body;
    const safeTopK = Math.min(Math.max(1, Number(top_k) || 4), 10);

    if (!query || typeof query !== 'string' || query.trim().length < 3) {
      return new Response(JSON.stringify({
        success: false,
        error: 'Debe ingresar una consulta de al menos 3 caracteres'
      }), {
        status: 400,
        headers: CORS_HEADERS
      });
    }

    const cleanQuery = query.trim().slice(0, 500); // Límite seguro de longitud

    // 1. Verificar si existe webhook externo n8n configurado en variables de entorno
    const n8nWebhook = (locals as any)?.runtime?.env?.N8N_RAG_WEBHOOK_URL || 
      (typeof process !== 'undefined' ? process.env.N8N_RAG_WEBHOOK_URL : null);
    
    let usedFallbackDueToError = false;

    if (n8nWebhook && typeof n8nWebhook === 'string' && n8nWebhook.startsWith('http')) {
      try {
        const response = await fetch(n8nWebhook, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ query: cleanQuery, top_k: safeTopK }),
          signal: AbortSignal.timeout(5000) // Timeout de 5s para evitar colgar al cliente
        });

        if (response.ok) {
          const n8nRaw = await response.json();
          // Normalizar formato de salida de n8n (puede venir como array de nodos o como objeto directo)
          let target = n8nRaw;
          if (Array.isArray(n8nRaw) && n8nRaw.length > 0) {
            target = n8nRaw[0]?.json || n8nRaw[0] || {};
          }

          const webhookAnswer = target.answer || target.output || target.text || target.response;
          const webhookCitations = Array.isArray(target.citations) ? target.citations : [];

          // Si n8n entregó una respuesta válida, la retornamos enriquecida
          if (webhookAnswer && typeof webhookAnswer === 'string') {
            const finalCitations = webhookCitations.length > 0 ? webhookCitations : searchCitations(cleanQuery, safeTopK);
            return new Response(JSON.stringify({
              success: true,
              query: cleanQuery,
              answer: webhookAnswer,
              citations: finalCitations,
              source_count: finalCitations.length,
              source: 'n8n-webhook',
              engine: 'n8n Webhook Generativo',
              timestamp: new Date().toISOString()
            }), {
              status: 200,
              headers: CORS_HEADERS
            });
          }
        } else {
          usedFallbackDueToError = true;
        }
      } catch (err) {
        usedFallbackDueToError = true;
        console.warn('Webhook n8n no disponible o timeout superado, activando motor RAG local:', err);
      }
    }

    // 2. Motor RAG local autónomo ($0 costo, BM25 / recuperación semántica estructurada)
    const citations = searchCitations(cleanQuery, safeTopK);
    const answer = synthesizeAnswer(cleanQuery, citations);

    return new Response(JSON.stringify({
      success: true,
      query: cleanQuery,
      answer,
      citations,
      source_count: citations.length,
      source: usedFallbackDueToError ? 'local-rag-fallback' : 'local-rag',
      engine: usedFallbackDueToError 
        ? 'Motor Local Autónomo (Fallback de Alta Disponibilidad)' 
        : 'Motor Local Autónomo ($0 costo)',
      fallback: true,
      timestamp: new Date().toISOString()
    }), {
      status: 200,
      headers: CORS_HEADERS
    });
  } catch (err: any) {
    return new Response(JSON.stringify({
      success: false,
      error: 'Error procesando consulta RAG: ' + (err?.message || 'Error interno')
    }), {
      status: 400,
      headers: CORS_HEADERS
    });
  }
};
