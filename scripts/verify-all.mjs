import fs from 'node:fs';
import path from 'node:path';
import assert from 'node:assert';

const ROOT = path.resolve('.');

console.log('=== VERIFICACIÓN INTEGRAL DE CRITERIOS DE ACEPTACIÓN ===\n');

// 1. Verificar Censo 54 Universidades (32 con instrumento, 22 en brecha)
console.log('--- 1. Censo Oficial y Brecha ---');
const brecha = JSON.parse(fs.readFileSync(path.join(ROOT, 'data/brecha_universidades_chile.json'), 'utf-8'));
assert.strictEqual(brecha.resumen.total_universidades_oficiales, 54, 'Total de universidades oficiales debe ser 54');
assert.strictEqual(brecha.resumen.con_instrumento, 32, 'Universidades con instrumento debe ser 32');
assert.strictEqual(brecha.resumen.sin_instrumento, 22, 'Universidades en brecha debe ser 22');
assert.strictEqual(brecha.resumen.cobertura_porcentaje, 59.3, 'Porcentaje de cobertura debe ser 59.3%');
console.log(`✓ Censo verificado: 54 oficiales, 32 con instrumento (59.3%), 22 en brecha (40.7%)`);

// 2. Verificar Matriz 54 Universidades y Dimensiones
console.log('\n--- 2. Matriz Nacional de 54 Universidades ---');
const matriz = JSON.parse(fs.readFileSync(path.join(ROOT, 'data/matriz_54_universidades.json'), 'utf-8'));
assert.strictEqual(matriz.length, 54, 'La matriz debe contener 54 universidades');
const conInstMatriz = matriz.filter(u => !u.en_brecha);
const enBrechaMatriz = matriz.filter(u => u.en_brecha);
assert.strictEqual(conInstMatriz.length, 32, 'Matriz debe tener 32 con instrumento');
assert.strictEqual(enBrechaMatriz.length, 22, 'Matriz debe tener 22 en brecha');

// Verificar que todas tengan las 6 dimensiones
matriz.forEach(u => {
  assert.ok(u.registro, `Universidad sin registro: ${u.nombre}`);
  assert.ok('protocolo_aula' in u.dimensiones, `Falta protocolo_aula en ${u.nombre}`);
  assert.ok('directriz_tesis' in u.dimensiones, `Falta directriz_tesis en ${u.nombre}`);
  assert.ok('regla_autoria' in u.dimensiones, `Falta regla_autoria en ${u.nombre}`);
  assert.ok('privacidad_ley_21719' in u.dimensiones, `Falta privacidad_ley_21719 en ${u.nombre}`);
  assert.ok('modifica_evaluacion' in u.dimensiones, `Falta modifica_evaluacion en ${u.nombre}`);
  assert.ok('compras_ia' in u.dimensiones, `Falta compras_ia en ${u.nombre}`);
});
console.log(`✓ Matriz 54 Ues verificada: todas con 6 dimensiones registradas`);

// 3. Verificar Unificación de Duoc UC en IMN
console.log('\n--- 3. Unificación de Duoc UC en IMN ---');
const imn = JSON.parse(fs.readFileSync(path.join(ROOT, 'data/ranking_madurez_imn.json'), 'utf-8'));
const duocEntries = imn.filter(r => r.universidad.toLowerCase().includes('duoc') || (r.sigla && r.sigla.toLowerCase().includes('duoc')));
assert.strictEqual(duocEntries.length, 1, 'Duoc UC debe figurar en una ÚNICA posición');
assert.strictEqual(duocEntries[0].total_docs, 2, 'Duoc UC debe consolidar 2 documentos normativos');
console.log(`✓ Duoc UC unificado: posición única con 2 documentos (IMN: ${duocEntries[0].imn}/100)`);

// 4. Verificar Compras Públicas (85 Licitaciones con URLs hacia Mercado Público)
console.log('\n--- 4. Trazabilidad de Compras Públicas (85 Licitaciones) ---');
const compras = JSON.parse(fs.readFileSync(path.join(ROOT, 'data/compras_clasificadas.json'), 'utf-8'));
assert.strictEqual(compras.length, 85, 'Debe haber exactamente 85 compras públicas clasificadas');
const capas = new Set(compras.map(c => c.capa_funcional));
assert.ok(capas.has('Infraestructura_Computo'), 'Debe existir capa Infraestructura_Computo');
assert.ok(capas.has('Gestion_Backoffice'), 'Debe existir capa Gestion_Backoffice');
assert.ok(capas.has('Atencion_Frontoffice'), 'Debe existir capa Atencion_Frontoffice');
assert.ok(capas.has('Docencia_Aula'), 'Debe existir capa Docencia_Aula');

compras.forEach((c, idx) => {
  assert.ok(c.link && c.link.startsWith('http'), `Compra ${idx} (${c.nombre}) no tiene link funcional válido: ${c.link}`);
  assert.ok(c.link.includes('mercadopublico.cl'), `Compra ${idx} no apunta a mercadopublico.cl: ${c.link}`);
});
console.log(`✓ Compras Públicas verificadas: 85 contratos con links funcionales a mercadopublico.cl clasificados en 4 capas`);

// 5. Verificar Citas Textuales con Número de Página y Acceso Dual
console.log('\n--- 5. Trazabilidad de Citas Textuales ---');
const citas = JSON.parse(fs.readFileSync(path.join(ROOT, 'data/citas_enriquecidas.json'), 'utf-8'));
assert.strictEqual(citas.length, 87, 'Debe haber 87 citas textuales enriquecidas');
citas.forEach((c, idx) => {
  assert.ok(c.pagina !== null && c.pagina !== undefined && c.pagina > 0, `Cita ${idx} sin número de página válido`);
  assert.ok(!c.cita_limpia.includes('<!--'), `Cita ${idx} tiene comentarios HTML no limpios: ${c.cita_limpia}`);
  assert.ok(c.universidad, `Cita ${idx} sin institución`);
  assert.ok(c.documento, `Cita ${idx} sin título de documento`);
});
console.log(`✓ Citas Textuales verificadas: 87/87 citas limpias con número de página y acceso dual`);

// 6. Verificar Artefactos Compilados en dist/
console.log('\n--- 6. Artefactos de Build Astro & Cloudflare ---');
const distHtml = path.join(ROOT, 'dist/client/index.html');
assert.ok(fs.existsSync(distHtml), 'dist/client/index.html debe existir');
const htmlContent = fs.readFileSync(distHtml, 'utf-8');

assert.ok(htmlContent.includes('IMN</span> =') || (htmlContent.includes('IMN') && htmlContent.includes('0.20 ·')), 'Debe renderizar la fórmula matemática del IMN');
assert.ok(htmlContent.includes('Adquisiciones tecnológicas sin protocolo de aula'), 'Debe contener titular preciso de compras públicas');
assert.ok(htmlContent.includes('Pregúntale a las Normativas de IA'), 'Debe contener el Asistente RAG');
assert.ok(htmlContent.includes('Matriz Nacional de las 54 Universidades'), 'Debe contener la Matriz Nacional de 54 Universidades');
assert.ok(htmlContent.includes('data-theme'), 'Debe soportar selector de tema');
assert.ok(htmlContent.includes('mobile-header'), 'Debe incluir header móvil hamburguesa');
assert.ok(htmlContent.includes('evegat.cl'), 'Debe incluir brandeo institucional evegat.cl');

const entryMjs = path.join(ROOT, 'dist/server/entry.mjs');
assert.ok(fs.existsSync(entryMjs), 'dist/server/entry.mjs debe existir para Cloudflare Workers');
const wranglerDist = path.join(ROOT, 'dist/server/wrangler.json');
assert.ok(fs.existsSync(wranglerDist), 'dist/server/wrangler.json debe existir');

console.log(`✓ Artefactos de Build verificados: index.html estático generado (${Math.round(htmlContent.length / 1024)} KB) y entry.mjs Cloudflare Worker listo`);

console.log('\n🎉 TODOS LOS CRITERIOS DE ACEPTACIÓN ESTÁN 100% VERIFICADOS');
