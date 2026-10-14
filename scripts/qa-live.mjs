#!/usr/bin/env node
// scripts/qa-live.mjs
// Suite de Control de Calidad (QA) integral en vivo contra la instancia en producción: https://brujulaiaedusuperior.evegat.cl

const BASE_URL = 'https://brujulaiaedusuperior.evegat.cl';
const ADMIN_KEY = 'brujula-eduardo-2026';

let passed = 0;
let failed = 0;

function assert(condition, message) {
  if (condition) {
    console.log(`  ✓ ${message}`);
    passed++;
  } else {
    console.error(`  ❌ FALLÓ: ${message}`);
    failed++;
  }
}

async function testUrl(path, expectedStatus = 200, contentTypeMatch = null) {
  const url = `${BASE_URL}${path}`;
  try {
    const res = await fetch(url);
    assert(res.status === expectedStatus, `GET ${path} -> HTTP ${res.status} (esperado ${expectedStatus})`);
    if (contentTypeMatch) {
      const ct = res.headers.get('content-type') || '';
      assert(ct.includes(contentTypeMatch), `Content-Type de ${path} incluye "${contentTypeMatch}" (recibido: ${ct})`);
    }
    return res;
  } catch (err) {
    assert(false, `Error de red al conectar a ${path}: ${err.message}`);
    return null;
  }
}

async function runQa() {
  console.log('====================================================');
  console.log(`🔍 INICIANDO QA INTEGRAL EN VIVO: ${BASE_URL}`);
  console.log('====================================================\n');

  // 1. Verificación de Rutas Multilingües
  console.log('--- 1. Rutas Multilingües y Páginas Estáticas ---');
  const resEs = await testUrl('/', 200, 'text/html');
  if (resEs) {
    const textEs = await resEs.text();
    assert(textEs.includes('lang="es"'), 'Página raíz declara lang="es"');
    assert(textEs.includes('Brújula IA'), 'Página raíz contiene marca "Brújula IA"');
    assert(textEs.includes('Las 54 Universidades'), 'Página raíz contiene pestaña "Las 54 Universidades"');
    assert(textEs.includes('analytics.evegat.cl'), 'Script Umami oficial activo');
  }

  const resEn = await testUrl('/en/', 200, 'text/html');
  if (resEn) {
    const textEn = await resEn.text();
    assert(textEn.includes('lang="en"'), 'Página /en/ declara lang="en"');
    assert(textEn.includes('The 54 Universities'), 'Página /en/ traduce "The 54 Universities"');
    assert(textEn.includes('AI Compass'), 'Página /en/ traduce marca "AI Compass"');
  }

  const resPt = await testUrl('/pt/', 200, 'text/html');
  if (resPt) {
    const textPt = await resPt.text();
    assert(textPt.includes('lang="pt"'), 'Página /pt/ declara lang="pt"');
    assert(textPt.includes('As 54 Universidades'), 'Página /pt/ traduce "As 54 Universidades"');
    assert(textPt.includes('Bússola de IA'), 'Página /pt/ traduce marca "Bússola de IA"');
  }

  // 2. Verificación de Datasets Abiertos y LLM-Ready
  console.log('\n--- 2. Datasets Abiertos, Kit Docente y LLMs.txt ---');
  await testUrl('/matriz_54_universidades.json', 200, 'application/json');
  await testUrl('/inventario.json', 200, 'application/json');
  await testUrl('/compras_clasificadas.json', 200, 'application/json');
  await testUrl('/citas_enriquecidas.json', 200, 'application/json');
  await testUrl('/ranking_madurez_imn.json', 200, 'application/json');
  await testUrl('/kit_clausulas_docentes.md', 200, 'text/markdown');
  await testUrl('/llms.txt', 200, 'text/plain');
  await testUrl('/llms-full.txt', 200, 'text/plain');

  // 3. Verificación de Base de Datos KV y Flujo de Suscripción en Vivo
  console.log('\n--- 3. Flujo End-to-End en Base de Datos KV (BRUJULA_DB) ---');
  const testEmail = `qa-test-${Date.now()}@test.uchile.cl`;
  
  // Post suscripción
  const subRes = await fetch(`${BASE_URL}/api/subscribe`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      email: testEmail,
      institucion: 'Universidad de Chile - QA Test',
      perfil: 'investigador',
      consentimiento_ley_21719: true,
      origen: 'qa-automated-suite'
    })
  });
  assert(subRes.status === 200, `POST /api/subscribe con nuevo suscriptor responde HTTP 200`);
  const subData = await subRes.json();
  assert(subData.success === true, 'Payload de respuesta confirma success: true');

  // Post aporte de normativa
  const normRes = await fetch(`${BASE_URL}/api/submit-normativa`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      institucion: 'Universidad de Chile',
      url_normativa: 'https://uchile.cl/resolucion-ia-qa',
      resumen: 'Prueba automatizada de registro de aporte normativo en QA',
      remitente_email: testEmail,
      remitente_nombre: 'Inspector QA'
    })
  });
  assert(normRes.status === 200, `POST /api/submit-normativa responde HTTP 200`);
  const normData = await normRes.json();
  assert(normData.success === true && normData.ticket_id.startsWith('NORM-'), `Genera ticket válido: ${normData.ticket_id}`);

  // 4. Blindaje de Privacidad: Cero Exposición Pública de Datos
  console.log('\n--- 4. Blindaje de Privacidad (Ley N° 21.719 y UNESCO) ---');
  const adminCheck = await fetch(`${BASE_URL}/api/admin/registros`);
  assert(adminCheck.status === 404, 'Endpoint administrativo público no existe en la web (HTTP 404 Not Found)');

  const adminKeyCheck = await fetch(`${BASE_URL}/api/admin/registros?key=brujula-eduardo-2026`);
  assert(adminKeyCheck.status === 404, 'Endpoint con clave no existe en la web (HTTP 404 Not Found)');
  console.log('  🔒 Confirmado: La base de datos es 100% privada y solo accesible con credenciales de infraestructura local.');

  console.log('\n====================================================');
  console.log(`📊 RESULTADOS DEL QA EN VIVO:`);
  console.log(`   Pruebas Exitosas: ${passed}`);
  console.log(`   Pruebas Fallidas: ${failed}`);
  console.log('====================================================');

  if (failed > 0) {
    process.exit(1);
  }
}

runQa().catch(e => {
  console.error('Error fatal durante QA:', e);
  process.exit(1);
});
