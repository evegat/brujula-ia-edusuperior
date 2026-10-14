#!/usr/bin/env node
// scripts/export-registros.mjs
// Herramienta local y privada para exportar suscriptores de Cloudflare KV (BRUJULA_DB)
// Requiere autenticación de Wrangler en la máquina local. NUNCA expuesto en la web.

import { execSync } from 'child_process';
import fs from 'fs';

const NAMESPACE_ID = '9d2279fc17db442daf6f43589e4e76d0';

function runWrangler(cmd) {
  try {
    return execSync(`npx wrangler ${cmd}`, { encoding: 'utf-8', stdio: ['pipe', 'pipe', 'ignore'] });
  } catch (err) {
    return null;
  }
}

async function main() {
  console.log('🔒 Consultando base de datos privada Cloudflare KV vía Wrangler CLI...');
  
  const rawKeys = runWrangler(`kv key list --namespace-id=${NAMESPACE_ID}`);
  if (!rawKeys) {
    console.error('❌ Error ejecutando wrangler. Asegúrate de tener credenciales válidas en tu máquina.');
    process.exit(1);
  }

  let keys = [];
  try {
    keys = JSON.parse(rawKeys.trim());
  } catch {
    keys = [];
  }

  const subKeys = keys.filter(k => k.name.startsWith('sub:') && k.name !== 'sub_index');
  console.log(`\n✓ Claves encontradas en base de datos: ${keys.length}`);
  console.log(`✓ Total Suscriptores registrados: ${subKeys.length}\n`);

  if (subKeys.length === 0) {
    console.log('ℹ️  No hay suscriptores registrados aún.');
    return;
  }

  const records = [];
  for (const k of subKeys) {
    const val = runWrangler(`kv key get --namespace-id=${NAMESPACE_ID} "${k.name}"`);
    if (val) {
      try {
        records.push(JSON.parse(val.trim()));
      } catch {
        records.push({ email: k.name.replace('sub:', '') });
      }
    }
  }

  console.table(records.map(r => ({
    Email: r.email,
    Institución: r.institucion || 'No informada',
    Perfil: r.perfil || 'general',
    Fecha: r.timestamp || '-'
  })));

  // Guardar archivo CSV local privado (ignorado por git)
  const csvHeader = '\uFEFF"Email","Institución","Perfil","Fecha Registro","Consentimiento"\n';
  const csvRows = records.map(r => {
    return `"${r.email}","${r.institucion || ''}","${r.perfil || ''}","${r.timestamp || ''}","${r.consentimiento_ley_21719 ? 'Sí' : 'No'}"`;
  }).join('\n');

  const outPath = 'suscriptores_privado.csv';
  fs.writeFileSync(outPath, csvHeader + csvRows, 'utf-8');
  console.log(`\n📥 Archivo exportado localmente en: ${outPath} (Privado en tu disco local)`);
}

main();
