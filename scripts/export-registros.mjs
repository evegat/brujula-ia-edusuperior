#!/usr/bin/env node
// scripts/export-registros.mjs
// Consulta y exporta los registros de la base de datos Cloudflare KV hacia la consola y archivo local

const ENDPOINT = 'https://brujulaiaedusuperior.evegat.cl/api/admin/registros?key=brujula-eduardo-2026&format=json';

async function main() {
  console.log('📡 Consultando base de datos Cloudflare KV (BRUJULA_DB)...');
  try {
    const res = await fetch(ENDPOINT);
    if (!res.ok) {
      throw new Error(`Error HTTP ${res.status}: ${res.statusText}`);
    }
    const data = await res.json();
    console.log(`\n✓ Total Suscriptores: ${data.total_suscriptores}`);
    console.log(`✓ Total Aportes Normativos: ${data.total_aportes_normativos}`);
    console.log(`✓ Última consulta: ${data.consultado_en}\n`);

    if (data.suscriptores && data.suscriptores.length > 0) {
      console.log('--- Listado de Suscriptores ---');
      console.table(data.suscriptores.map(s => ({
        Email: s.email,
        Institución: s.institucion,
        Perfil: s.perfil,
        Fecha: s.timestamp
      })));
    } else {
      console.log('ℹ️  Aún no hay suscriptores registrados.');
    }
  } catch (err) {
    console.error('❌ Error al exportar registros:', err.message);
  }
}

main();
