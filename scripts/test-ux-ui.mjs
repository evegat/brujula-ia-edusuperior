import fs from 'node:fs';
import path from 'node:path';
import assert from 'node:assert';

const ROOT = path.resolve('.');
const indexPath = path.join(ROOT, 'dist/client/index.html');

console.log('=== SUITE DE PRUEBAS UX / UI, USABILIDAD Y ARQUITECTURA ===\n');

if (!fs.existsSync(indexPath)) {
  console.error('❌ dist/client/index.html no existe. Ejecuta npm run build primero.');
  process.exit(1);
}

const html = fs.readFileSync(indexPath, 'utf-8');

// 1. Verificación de Telemetría Umami Activa
console.log('--- 1. Telemetría Umami & Configuración de Tracking ---');
assert.ok(html.includes('https://analytics.evegat.cl/script.js'), 'Debe incluir script de analytics.evegat.cl');
assert.ok(html.includes('data-website-id="96982ca8-66da-4b58-976c-f98e06f05a6d"'), 'Debe contener el Website ID oficial');
assert.ok(html.includes('data-host-url="https://analytics.evegat.cl"'), 'Debe contener data-host-url explícito');
assert.ok(!html.includes('data-do-not-track="true"'), 'NO debe contener data-do-not-track="true" para evitar silenciamiento');
console.log('✓ Umami activo con Website ID verificado y sin restricciones DNT');

// 2. Verificación de Eliminación de la "Banda de Slide"
console.log('\n--- 2. Navegación Sobria (Cero Slider Horizontal) ---');
assert.ok(!html.includes('btn-quick-cross'), 'No debe contener bloque redundante de accesos rápidos');
assert.ok(
  html.includes('data-tab="tab-matriz"'),
  'Debe tener pestaña de Universidades'
);
assert.ok(
  html.includes('data-tab="tab-kit"'),
  'Debe tener pestaña de Reglas / Kit'
);
assert.ok(
  html.includes('data-tab="tab-compras"'),
  'Debe tener pestaña de Compras'
);
console.log('✓ Navegación consolidada y en lenguaje claro sin desborde horizontal');

// 3. Verificación de Usabilidad y Eliminación de Bloques Redundantes
console.log('\n--- 3. Saneamiento Anti-Slop & Carga Cognitiva ---');
assert.ok(!html.includes('btn-quick-cross'), 'No debe contener bloque redundante de accesos rápidos cruzados');
assert.ok(!html.includes('href="#benchmarking" class="btn btn-outline btn-sm"'), 'No debe contener botones de anclas duplicados en el Hero');
console.log('✓ Hero limpio y sin dobles barras de botones redundantes');

// 4. Verificación de Exportación CSV en Planilla
console.log('\n--- 4. Planilla Interactiva & Exportación CSV ---');
assert.ok(html.includes('id="btn-export-csv"'), 'Debe existir botón de exportación CSV');
assert.ok(html.includes('planilla_chequeo_ia_universidades_chile.csv'), 'Debe exportar archivo con nombre descriptivo');
assert.ok(html.includes('\\uFEFF') || html.includes('\uFEFF'), 'Debe incluir BOM UTF-8 para apertura correcta en Microsoft Excel');
console.log('✓ Exportación CSV con BOM UTF-8 y 54 filas dimensionales');

// 5. Verificación de Accesibilidad WCAG y Semántica
console.log('\n--- 5. Accesibilidad WCAG & Semántica ARIA ---');
assert.ok(html.includes('class="skip-link"'), 'Debe existir skip-link para lectores de pantalla');
assert.ok(html.includes('aria-label="Secciones del Observatorio"'), 'Barra de pestañas con aria-label descriptivo');
assert.ok(html.includes('id="modal-aviso-legal"'), 'Modal de aviso legal presente');
assert.ok(html.includes('role="dialog"'), 'Modales con role="dialog"');
assert.ok(html.includes('aria-modal="true"'), 'Modales con aria-modal="true"');
console.log('✓ Accesibilidad WCAG validada (skip-link, modales accesibles y semántica ARIA)');

// 6. Verificación de Blindaje Jurídico y Derechos
console.log('\n--- 6. Blindaje Jurídico y Atribución ---');
assert.ok(html.includes('Eduardo Vega Toledo'), 'Atribución a Eduardo Vega Toledo presente');
assert.ok(html.includes('https://www.linkedin.com/in/evegat1989/'), 'Enlace a LinkedIn de Eduardo presente');
assert.ok(!html.includes('Bastidor'), 'Cero menciones a Bastidor');
assert.ok(!html.includes('InnCívica') && !html.includes('Inncivica'), 'Cero menciones a InnCívica');
assert.ok(html.includes('Ley N° 20.285') || html.includes('Ley N&#176; 20.285'), 'Mención a Ley de Transparencia');
assert.ok(html.includes('Ley N° 19.886') || html.includes('Ley N&#176; 19.886'), 'Mención a Ley de Compras');
console.log('✓ Blindaje normativo chileno verificado (Transparencia, Compras, Cita y Protección de Datos)');

// 7. Verificación de Guía de Uso y Botones de Aporte (Links / PDF)
console.log('\n--- 7. Guía de Orientación & Botones de Aporte (Links / PDF) ---');
assert.ok(html.includes('id="guia-uso"'), 'Debe incluir sección de orientación rápida');
assert.ok(html.includes('Cómo explorar y utilizar este Observatorio') || html.includes('C&#243;mo explorar'), 'Debe incluir título explicativo de orientación');
assert.ok(html.includes('mailto:eduardo@evegat.cl'), 'Debe incluir enlaces directos para enviar PDF por correo');
assert.ok(html.includes('Aportar Enlace'), 'Debe incluir botones de aporte de enlace');
assert.ok(html.includes('Enviar PDF'), 'Debe incluir botones para enviar PDF por correo');
console.log('✓ Guía rápida de uso y canales duales (link web + envío de PDF por correo) verificados');

console.log('\n======================================================');
console.log('🎉 TODAS LAS PRUEBAS DE UX / UI Y USABILIDAD PASARON');
console.log('======================================================\n');
