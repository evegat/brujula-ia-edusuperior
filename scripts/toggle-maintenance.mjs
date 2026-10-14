#!/usr/bin/env node
/**
 * Script para alternar el modo mantenimiento de Brújula IA en Cloudflare KV
 * Uso:
 *   node scripts/toggle-maintenance.mjs on      -> Activa modo mantenimiento (redirige a /mantenimiento)
 *   node scripts/toggle-maintenance.mjs off     -> Desactiva modo mantenimiento (sitio en línea)
 *   node scripts/toggle-maintenance.mjs status  -> Consulta estado actual
 */

import { execSync } from 'node:child_process';

const action = process.argv[2]?.toLowerCase() || 'status';

try {
  if (action === 'on') {
    console.log('Activando modo mantenimiento en Cloudflare KV (BRUJULA_DB)...');
    execSync('npx wrangler kv:key put --binding=BRUJULA_DB system:maintenance_mode "true"', { stdio: 'inherit' });
    console.log('\n🔒 Modo mantenimiento ACTIVADO. Todo el tráfico será redirigido a /mantenimiento');
  } else if (action === 'off') {
    console.log('Desactivando modo mantenimiento en Cloudflare KV (BRUJULA_DB)...');
    try {
      execSync('npx wrangler kv:key delete --binding=BRUJULA_DB system:maintenance_mode', { stdio: 'inherit' });
    } catch {}
    console.log('\n🟢 Modo mantenimiento DESACTIVADO. Plataforma en línea con normalidad.');
  } else {
    console.log('Consultando estado del modo mantenimiento...');
    try {
      const val = execSync('npx wrangler kv:key get --binding=BRUJULA_DB system:maintenance_mode', { encoding: 'utf-8' }).trim();
      console.log(`Estado actual: ${val === 'true' ? '🔒 ACTIVADO (En mantenimiento)' : '🟢 DESACTIVADO (En línea)'}`);
    } catch {
      console.log('Estado actual: 🟢 DESACTIVADO (En línea)');
    }
  }
} catch (err) {
  console.error('Error al operar wrangler KV:', err.message);
  process.exit(1);
}
