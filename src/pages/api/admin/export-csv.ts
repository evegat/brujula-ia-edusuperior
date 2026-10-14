import type { APIRoute } from 'astro';
import { getSessionFromRequest, verifySessionToken } from '../../../lib/auth.ts';
import { getDb } from '../../../lib/kv.ts';

export const prerender = false;

export const GET: APIRoute = async ({ request }) => {
  const token = getSessionFromRequest(request);
  if (!token || !(await verifySessionToken(token))) {
    return new Response(JSON.stringify({ error: 'No autorizado' }), {
      status: 401,
      headers: { 'Content-Type': 'application/json' }
    });
  }

  const db = await getDb();
  let subList: any[] = [];

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
    } catch (_) {}
  }

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
      'Content-Type': 'text/csv; charset=utf-8',
      'Content-Disposition': 'attachment; filename="suscriptores_brujula_ia.csv"',
      'Cache-Control': 'no-store'
    }
  });
};
