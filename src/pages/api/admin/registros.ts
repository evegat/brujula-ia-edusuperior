import type { APIRoute } from 'astro';

export const prerender = false;

const ADMIN_SECRET = 'brujula-eduardo-2026';

const CORS_HEADERS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
  'X-Content-Type-Options': 'nosniff'
};

export const OPTIONS: APIRoute = async () => {
  return new Response(null, {
    status: 204,
    headers: CORS_HEADERS
  });
};

export const GET: APIRoute = async ({ request, locals }) => {
  const url = new URL(request.url);
  const keyParam = url.searchParams.get('key');
  const authHeader = request.headers.get('authorization')?.replace('Bearer ', '').trim();
  const providedKey = keyParam || authHeader;

  if (providedKey !== ADMIN_SECRET) {
    return new Response(JSON.stringify({
      error: 'No autorizado. Debe proporcionar la clave de acceso ?key='
    }), {
      status: 401,
      headers: { ...CORS_HEADERS, 'Content-Type': 'application/json' }
    });
  }

  const db = (locals as any)?.runtime?.env?.BRUJULA_DB;
  const format = url.searchParams.get('format') || 'html';

  let subList: any[] = [];
  let normativaList: any[] = [];

  if (db) {
    try {
      const rawSubIndex = await db.get('sub_index');
      if (rawSubIndex) {
        const emails: string[] = JSON.parse(rawSubIndex);
        for (const email of emails) {
          const rawRecord = await db.get(`sub:${email}`);
          if (rawRecord) {
            try { subList.push(JSON.parse(rawRecord)); } catch (_) {}
          } else {
            subList.push({ email, timestamp: 'Desconocido' });
          }
        }
      }

      const rawNormIndex = await db.get('normativa_index');
      if (rawNormIndex) {
        const tickets: string[] = JSON.parse(rawNormIndex);
        for (const t of tickets) {
          const rawN = await db.get(`normativa:${t}`);
          if (rawN) {
            try { normativaList.push(JSON.parse(rawN)); } catch (_) {}
          }
        }
      }
    } catch (e: any) {
      console.warn('[admin] Error leyendo Cloudflare KV:', e);
    }
  }

  // Formato CSV para exportación directa
  if (format === 'csv') {
    const csvHeader = '\uFEFF"Email","Institución","Perfil","Fecha Registro","Consentimiento Ley 21.719","IP"\n';
    const csvRows = subList.map(s => {
      const em = `"${(s.email || '').replace(/"/g, '""')}"`;
      const inst = `"${(s.institucion || '').replace(/"/g, '""')}"`;
      const perf = `"${(s.perfil || '').replace(/"/g, '""')}"`;
      const date = `"${(s.timestamp || '').replace(/"/g, '""')}"`;
      const cons = `"${s.consentimiento_ley_21719 ? 'Sí' : 'No'}"`;
      const ip = `"${(s.ip || '').replace(/"/g, '""')}"`;
      return `${em},${inst},${perf},${date},${cons},${ip}`;
    }).join('\n');

    return new Response(csvHeader + csvRows, {
      status: 200,
      headers: {
        ...CORS_HEADERS,
        'Content-Type': 'text/csv; charset=utf-8',
        'Content-Disposition': 'attachment; filename="suscriptores_brujula_ia.csv"'
      }
    });
  }

  // Formato JSON para consumo por API o scripts
  if (format === 'json') {
    return new Response(JSON.stringify({
      total_suscriptores: subList.length,
      total_aportes_normativos: normativaList.length,
      suscriptores: subList,
      normativas: normativaList,
      consultado_en: new Date().toISOString()
    }, null, 2), {
      status: 200,
      headers: { ...CORS_HEADERS, 'Content-Type': 'application/json' }
    });
  }

  // Formato HTML por defecto: Panel visual limpio y sobrio
  const htmlRows = subList.length === 0
    ? '<tr><td colspan="5" style="text-align:center; padding:1.5rem; color:#64748b;">No hay suscriptores registrados aún en la base de datos.</td></tr>'
    : subList.map((s, idx) => `
      <tr style="border-bottom: 1px solid #e2e8f0; background: ${idx % 2 === 0 ? '#ffffff' : '#f8fafc'};">
        <td style="padding: 0.75rem 1rem; font-weight:600; color:#0f172a;">${escapeHtml(s.email)}</td>
        <td style="padding: 0.75rem 1rem; color:#334155;">${escapeHtml(s.institucion || 'No informada')}</td>
        <td style="padding: 0.75rem 1rem; color:#475569;"><span style="background:#e0f2fe; color:#0369a1; padding:0.2rem 0.5rem; border-radius:4px; font-size:0.75rem;">${escapeHtml(s.perfil || 'general')}</span></td>
        <td style="padding: 0.75rem 1rem; font-size:0.82rem; color:#64748b;">${escapeHtml(s.timestamp || '-')}</td>
        <td style="padding: 0.75rem 1rem; font-size:0.82rem; color:#16a34a; font-weight:600;">✓ Aceptado</td>
      </tr>
    `).join('');

  const html = `<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Panel de Registros — Brújula IA Educación Superior</title>
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif; background: #f1f5f9; color: #1e293b; margin: 0; padding: 2rem 1rem; }
    .container { max-width: 1000px; margin: 0 auto; background: #ffffff; border-radius: 12px; box-shadow: 0 4px 6px -1px rgba(0,0,0,0.08); overflow: hidden; border: 1px solid #cbd5e1; }
    .header { background: #06182c; color: #ffffff; padding: 1.5rem 2rem; display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 1rem; }
    .title { font-size: 1.4rem; font-weight: 700; margin: 0; }
    .subtitle { font-size: 0.85rem; color: #94a3b8; margin-top: 0.25rem; }
    .btn { background: #059669; color: #ffffff; text-decoration: none; padding: 0.5rem 1rem; border-radius: 6px; font-size: 0.85rem; font-weight: 600; display: inline-flex; align-items: center; gap: 0.4rem; }
    .btn:hover { background: #047857; }
    .btn-secondary { background: #334155; }
    .btn-secondary:hover { background: #1e293b; }
    .stats-bar { display: flex; gap: 1.5rem; padding: 1rem 2rem; background: #f8fafc; border-bottom: 1px solid #e2e8f0; font-size: 0.9rem; }
    .stat-item { display: flex; align-items: center; gap: 0.4rem; font-weight: 500; }
    .stat-num { font-weight: 700; color: #1d4ed8; font-size: 1.1rem; }
    table { width: 100%; border-collapse: collapse; text-align: left; font-size: 0.88rem; }
    th { background: #f8fafc; padding: 0.75rem 1rem; font-weight: 600; color: #475569; border-bottom: 2px solid #cbd5e1; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <div>
        <h1 class="title">🧭 Observatorio Brújula IA — Registros y Alertas</h1>
        <div class="subtitle">Base de datos Cloudflare KV (BRUJULA_DB) • Interés público y Ley N° 21.719</div>
      </div>
      <div style="display: flex; gap: 0.5rem;">
        <a href="?key=${ADMIN_SECRET}&format=csv" class="btn">📥 Descargar CSV</a>
        <a href="?key=${ADMIN_SECRET}&format=json" class="btn btn-secondary">JSON</a>
      </div>
    </div>

    <div class="stats-bar">
      <div class="stat-item">Total Suscriptores Activos: <span class="stat-num">${subList.length}</span></div>
      <div class="stat-item">Aportes Normativos: <span class="stat-num">${normativaList.length}</span></div>
      <div class="stat-item" style="margin-left:auto; font-size:0.8rem; color:#64748b;">Consultado: ${new Date().toLocaleDateString('es-CL')} ${new Date().toLocaleTimeString('es-CL')}</div>
    </div>

    <div style="overflow-x: auto;">
      <table>
        <thead>
          <tr>
            <th>Email</th>
            <th>Institución / Plantel</th>
            <th>Perfil</th>
            <th>Fecha Registro</th>
            <th>Consentimiento</th>
          </tr>
        </thead>
        <tbody>
          ${htmlRows}
        </tbody>
      </table>
    </div>
  </div>
</body>
</html>`;

  return new Response(html, {
    status: 200,
    headers: { ...CORS_HEADERS, 'Content-Type': 'text/html; charset=utf-8' }
  });
};

function escapeHtml(str: string): string {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}
