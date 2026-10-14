import { defineMiddleware } from 'astro:middleware';

export const onRequest = defineMiddleware(async (context, next) => {
  const url = new URL(context.request.url);
  const pathname = url.pathname;

  // Rutas exentas de mantenimiento (assets, imágenes, API admin, página de mantenimiento)
  if (
    pathname.startsWith('/mantenimiento') ||
    pathname.startsWith('/_astro') ||
    pathname.startsWith('/favicon') ||
    pathname.startsWith('/api/admin') ||
    pathname.startsWith('/admin')
  ) {
    return next();
  }

  // Verificar si la bandera de mantenimiento está activa en Cloudflare KV o en locals/env
  try {
    const runtime = (context.locals as any)?.runtime;
    const db = runtime?.env?.BRUJULA_DB;
    if (db) {
      const mode = await db.get('system:maintenance_mode');
      if (mode === 'true') {
        return context.redirect('/mantenimiento', 302);
      }
    }
  } catch (err) {
    // Falla silenciosa si no está disponible KV en local
  }

  return next();
});
