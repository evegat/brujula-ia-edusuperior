// src/lib/kv.ts
// Acceso seguro y compatible a Cloudflare KV (BRUJULA_DB) para Astro v6/v7

export async function getDb(): Promise<any> {
  try {
    // Astro v6/v7 deprecó locals.runtime.env y exige importar desde 'cloudflare:workers'
    // @ts-ignore
    const { env } = await import('cloudflare:workers');
    return env?.BRUJULA_DB || null;
  } catch {
    return null;
  }
}
