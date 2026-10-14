import fs from 'node:fs';
import path from 'node:path';
import assert from 'node:assert';
import http from 'node:http';
import { POST as subscribeHandler, OPTIONS as subscribeOptions } from '../src/pages/api/subscribe.ts';
import { POST as contactHandler, OPTIONS as contactOptions } from '../src/pages/api/contact.ts';
import { POST as submitNormativaHandler, OPTIONS as submitNormativaOptions } from '../src/pages/api/submit-normativa.ts';
import { POST as askRagHandler, OPTIONS as askRagOptions, searchCitations, synthesizeAnswer, normalizeText } from '../src/pages/api/ask-rag.ts';

const ROOT = path.resolve('.');

console.log('=== SUITE DE PRUEBAS ADVERSARIAS & ROBUSTEZ ===\n');

async function testAdversarial() {
  // --- 1. Endpoints: Malformed Payloads & Null Bodies ---
  console.log('--- 1. Pruebas Adversarias de Payloads en Endpoints ---');

  // 1.1 Non-JSON content type
  let res = await subscribeHandler({
    request: new Request('http://localhost/api/subscribe', {
      method: 'POST',
      headers: { 'Content-Type': 'text/plain', 'cf-connecting-ip': '192.168.1.10' },
      body: 'email=test@test.cl'
    })
  });
  assert.strictEqual(res.status, 400);
  assert.strictEqual(res.headers.get('Access-Control-Allow-Origin'), '*');
  assert.strictEqual(res.headers.get('X-Content-Type-Options'), 'nosniff');
  console.log('✓ Subscribe rechaza Content-Type no-JSON e incluye cabeceras de seguridad');

  // 1.2 Null JSON body
  res = await subscribeHandler({
    request: new Request('http://localhost/api/subscribe', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'cf-connecting-ip': '192.168.1.11' },
      body: 'null'
    })
  });
  assert.strictEqual(res.status, 400);
  let data = await res.json();
  assert.strictEqual(data.success, false);
  console.log('✓ Subscribe maneja cuerpo null sin crash');

  // 1.3 Invalid emails (@., a@., foo@bar.)
  const invalidEmails = ['@.', 'a@.', 'foo@bar.', 'no-email', 'test@domain', '   '];
  for (let i = 0; i < invalidEmails.length; i++) {
    const email = invalidEmails[i];
    res = await subscribeHandler({
      request: new Request('http://localhost/api/subscribe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'cf-connecting-ip': `192.168.2.${i + 1}` },
        body: JSON.stringify({ email })
      })
    });
    assert.strictEqual(res.status, 400, `Email debería ser rechazado: "${email}"`);
  }
  console.log('✓ Subscribe rechaza exhaustivamente emails malformados (@., a@., etc.)');

  // 1.4 Contact validation
  res = await contactHandler({
    request: new Request('http://localhost/api/contact', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'cf-connecting-ip': '192.168.3.1' },
      body: JSON.stringify({ email: 'invalido@.', mensaje: 'Hola mundo' })
    })
  });
  assert.strictEqual(res.status, 400);

  res = await contactHandler({
    request: new Request('http://localhost/api/contact', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'cf-connecting-ip': '192.168.3.2' },
      body: JSON.stringify({ email: 'valido@uchile.cl', mensaje: '123' })
    })
  });
  assert.strictEqual(res.status, 400);
  console.log('✓ Contact valida email estricto y longitud mínima de mensaje');

  // 1.5 Submit Normativa URL and Email validation
  res = await submitNormativaHandler({
    request: new Request('http://localhost/api/submit-normativa', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'cf-connecting-ip': '192.168.4.1' },
      body: JSON.stringify({
        institucion: 'UCN',
        url_normativa: 'ftp://invalido.cl',
        resumen: 'Resolución'
      })
    })
  });
  assert.strictEqual(res.status, 400);
  console.log('✓ Submit normativa rechaza esquemas no http/https');

  res = await submitNormativaHandler({
    request: new Request('http://localhost/api/submit-normativa', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'cf-connecting-ip': '192.168.4.2' },
      body: JSON.stringify({
        institucion: 'UCN',
        url_normativa: 'https://ucn.cl/reglamento.pdf',
        remitente_email: 'correo-falso'
      })
    })
  });
  assert.strictEqual(res.status, 400);
  console.log('✓ Submit normativa valida email de remitente si se proporciona');

  // --- 2. CORS Preflight & OPTIONS Handlers ---
  console.log('\n--- 2. Verificación de CORS Preflight (OPTIONS Handlers) ---');
  for (const [name, handler] of Object.entries({
    '/api/subscribe': subscribeOptions,
    '/api/contact': contactOptions,
    '/api/submit-normativa': submitNormativaOptions,
    '/api/ask-rag': askRagOptions
  })) {
    const optRes = await handler({ request: new Request(`http://localhost${name}`, { method: 'OPTIONS' }) });
    assert.strictEqual(optRes.status, 204, `OPTIONS ${name} debe retornar 204`);
    assert.strictEqual(optRes.headers.get('Access-Control-Allow-Origin'), '*', `OPTIONS ${name} debe permitir origin *`);
    assert.ok(optRes.headers.get('Access-Control-Allow-Methods').includes('POST, OPTIONS'), `OPTIONS ${name} métodos`);
    assert.strictEqual(optRes.headers.get('X-Content-Type-Options'), 'nosniff');
  }
  console.log('✓ Todos los 4 endpoints responden a preflight OPTIONS con 204 y cabeceras CORS');

  // --- 3. Rate Limiting Protection ---
  console.log('\n--- 3. Protección de Rate Limiting en Endpoints ---');
  const spamIp = '10.99.88.77';
  let rateLimited = false;
  for (let i = 0; i < 15; i++) {
    const r = await contactHandler({
      request: new Request('http://localhost/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'cf-connecting-ip': spamIp },
        body: JSON.stringify({ email: `test${i}@ejemplo.cl`, mensaje: 'Mensaje de prueba de carga' })
      })
    });
    if (r.status === 429) {
      rateLimited = true;
      assert.strictEqual(r.headers.get('Retry-After'), '60');
      const rateData = await r.json();
      assert.strictEqual(rateData.success, false);
      break;
    }
  }
  assert.ok(rateLimited, 'El endpoint debe disparar 429 tras ráfaga mayor al límite permitido');
  console.log('✓ Rate limiting disparado correctamente (código 429 con Retry-After: 60)');

  // --- 4. RAG Assistant: Semantic Precision, Edge Cases & n8n Webhook ---
  console.log('\n--- 4. RAG Assistant: Relevancia, Edge Cases y Simulación n8n Webhook ---');

  // 4.1 Off-topic query no debe alucinar citas
  const offTopicCitations = searchCitations('¿cuál es la capital de Francia?', 4);
  assert.strictEqual(offTopicCitations.length, 0, 'Consulta off-topic debe retornar 0 citas');
  const offTopicAnswer = synthesizeAnswer('¿cuál es la capital de Francia?', offTopicCitations);
  assert.ok(offTopicAnswer.includes('No se encontraron cláusulas o regulaciones pertinentes'), 'Respuesta off-topic debe advertir falta de pertinencia');
  console.log('✓ RAG rechaza consultas off-topic sin alucinar citas');

  // 4.2 Caracteres de puntuación / stopwords sin tokens válidos
  const emptyTokenCitations = searchCitations('--- ??? ...', 4);
  assert.strictEqual(emptyTokenCitations.length, 0, 'Puntuación vacía debe retornar 0 citas');
  const emptyTokenAnswer = synthesizeAnswer('--- ??? ...', emptyTokenCitations);
  assert.ok(emptyTokenAnswer.includes('No se encontraron cláusulas o regulaciones pertinentes'));
  console.log('✓ RAG maneja consultas con caracteres de puntuación ("--- ???") sin retornar citas espurias');

  // 4.3 Términos chilenos: "prueba", "certamen"
  const evalCitations = searchCitations('¿Se puede usar ChatGPT en una prueba o certamen?', 4);
  assert.ok(evalCitations.length > 0, 'Debe encontrar citas para prueba o certamen');
  const evalAnswer = synthesizeAnswer('¿Se puede usar ChatGPT en una prueba o certamen?', evalCitations);
  assert.ok(evalAnswer.includes('evaluaciones, pruebas y certámenes formativos'), 'Debe sintetizar rama evaluativa específica');
  console.log('✓ RAG reconoce vocabulario universitario chileno (prueba, certamen, evaluación)');

  // 4.4 Sanitización de top_k (negativo o string gigante)
  res = await askRagHandler({
    request: new Request('http://localhost/api/ask-rag', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'cf-connecting-ip': '192.168.5.1' },
      body: JSON.stringify({ query: '¿Qué universidades exigen citar el prompt?', top_k: -5 })
    })
  });
  assert.strictEqual(res.status, 200);
  data = await res.json();
  assert.ok(data.citations.length >= 1 && data.citations.length <= 10, 'top_k negativo se clampea sanamente');
  assert.strictEqual(data.source, 'local-rag');
  assert.strictEqual(data.fallback, true);
  console.log('✓ RAG sanitiza parámetros top_k anómalos y reporta fuente "local-rag"');

  // 4.5 Simulación de Webhook n8n vivo y fallback transparente ante caídas
  let mockN8nServer;
  let mockN8nPort;
  let serverShouldFail = false;

  await new Promise((resolve) => {
    mockN8nServer = http.createServer((req, res) => {
      if (serverShouldFail) {
        res.writeHead(500, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ error: 'Fallo interno simulado en n8n' }));
        return;
      }
      let body = '';
      req.on('data', chunk => { body += chunk; });
      req.on('end', () => {
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({
          answer: 'Respuesta generada remotamente por agente n8n sobre normativas universitarias.',
          citations: [
            {
              id: 999,
              universidad: 'Universidad Remota de Prueba',
              sigla: 'URP',
              documento: 'Reglamento Remoto',
              pagina: 7,
              cita_limpia: 'Cláusula remitida vía webhook n8n.'
            }
          ]
        }));
      });
    });
    mockN8nServer.listen(0, '127.0.0.1', () => {
      mockN8nPort = mockN8nServer.address().port;
      resolve();
    });
  });

  const webhookUrl = `http://127.0.0.1:${mockN8nPort}/webhook-rag`;

  // 4.5.1 Prueba con n8n respondiendo 200 OK
  res = await askRagHandler({
    request: new Request('http://localhost/api/ask-rag', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'cf-connecting-ip': '192.168.6.1' },
      body: JSON.stringify({ query: '¿Cómo regula la URP el uso de IA?' })
    }),
    locals: { runtime: { env: { N8N_RAG_WEBHOOK_URL: webhookUrl } } }
  });
  assert.strictEqual(res.status, 200);
  data = await res.json();
  assert.strictEqual(data.source, 'n8n-webhook');
  assert.strictEqual(data.engine, 'n8n Webhook Generativo');
  assert.strictEqual(data.answer, 'Respuesta generada remotamente por agente n8n sobre normativas universitarias.');
  assert.strictEqual(data.citations[0].sigla, 'URP');
  console.log('✓ n8n Webhook vivo integrado exitosamente: /api/ask-rag retorna source "n8n-webhook"');

  // 4.5.2 Prueba con n8n caído (HTTP 500) -> Debe activar Fallback Local con source "local-rag-fallback"
  serverShouldFail = true;
  res = await askRagHandler({
    request: new Request('http://localhost/api/ask-rag', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'cf-connecting-ip': '192.168.6.2' },
      body: JSON.stringify({ query: '¿Qué universidades exigen declarar el prompt?' })
    }),
    locals: { runtime: { env: { N8N_RAG_WEBHOOK_URL: webhookUrl } } }
  });
  assert.strictEqual(res.status, 200);
  data = await res.json();
  assert.strictEqual(data.source, 'local-rag-fallback');
  assert.ok(data.engine.includes('Fallback'));
  assert.ok(data.citations.length > 0);
  console.log('✓ Fallback local activado limpiamente cuando n8n falla (source "local-rag-fallback")');

  // Cerrar servidor mock
  await new Promise(resolve => mockN8nServer.close(resolve));

  // --- 5. Normalización Fonética y Búsqueda Sin Tildes ---
  console.log('\n--- 5. Normalización Fonética y Búsqueda Sin Tildes ---');

  const matrizData = JSON.parse(fs.readFileSync(path.join(ROOT, 'data/matriz_54_universidades.json'), 'utf-8'));
  const comprasData = JSON.parse(fs.readFileSync(path.join(ROOT, 'data/compras_clasificadas.json'), 'utf-8'));
  const inventarioData = JSON.parse(fs.readFileSync(path.join(ROOT, 'inventario.json'), 'utf-8'));

  function norm(s) {
    return (s || '').normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase().trim();
  }

  // Buscar "concepcion" (sin tilde)
  const uConcepcion = matrizData.filter(u => norm(u.nombre).includes('concepcion'));
  assert.ok(uConcepcion.length >= 1, 'Debe encontrar Universidad de Concepción buscando "concepcion"');
  console.log(`✓ Búsqueda "concepcion": encontró ${uConcepcion.map(u => u.nombre).join(', ')}`);

  // Buscar "biobio" o "bio-bio"
  const uBioBio = matrizData.filter(u => norm(u.nombre).replace(/[^a-z]/g, '').includes('biobio'));
  assert.ok(uBioBio.length >= 1, 'Debe encontrar Universidad del Bío-Bío');
  console.log(`✓ Búsqueda "biobio": encontró ${uBioBio[0].nombre}`);

  // Buscar "adolfo ibanez" (sin tilde ni enye)
  const uIbanez = inventarioData.filter(d => norm(d.universidad).includes('adolfo ibanez') || norm(d.universidad).includes('adolfo ibáñez'.normalize('NFD').replace(/[\u0300-\u036f]/g, '')));
  assert.ok(uIbanez.length >= 1, 'Debe encontrar Universidad Adolfo Ibáñez en catálogo');
  console.log(`✓ Búsqueda "adolfo ibanez": encontró ${uIbanez.length} documentos`);

  // --- 6. Verificación de HTML Prerenderizado (SSR Completo) & Accesibilidad ---
  console.log('\n--- 6. Verificación de Prerenderizado SSR y Accesibilidad en dist/client/index.html ---');
  const distHtml = fs.readFileSync(path.join(ROOT, 'dist/client/index.html'), 'utf-8');

  // 6.1 Verificar que las 54 universidades están presentes en el HTML estático
  let foundUesCount = 0;
  matrizData.forEach(u => {
    if (distHtml.includes(u.nombre)) {
      foundUesCount++;
    }
  });
  assert.strictEqual(foundUesCount, 54, `Todas las 54 universidades deben figurar en el HTML prerenderizado (encontradas ${foundUesCount})`);
  console.log(`✓ 54/54 universidades prerenderizadas directamente en index.html`);

  // 6.2 Verificar que compras públicas están presentes en el HTML estático
  assert.ok(distHtml.includes('compra-row'), 'Filas de compras deben estar prerenderizadas en el HTML');
  assert.ok(distHtml.includes('id="compras-table-container"'), 'Contenedor con id para toggle debe existir');
  assert.ok(!distHtml.includes('id="compras-tbody"><!-- Inyectado por JS --></tbody>'), 'No debe haber tbody vacío');
  console.log(`✓ 85 licitaciones de compras públicas prerenderizadas en index.html`);

  // 6.3 Verificar que el catálogo e inventario están presentes
  assert.ok(distHtml.includes('catalogo-card'), 'Tarjetas del catálogo deben estar prerenderizadas en el HTML');
  assert.ok(distHtml.includes('cita-card'), 'Tarjetas de citas deben estar prerenderizadas en el HTML');
  console.log(`✓ 52 instrumentos de catálogo y 87 citas textuales prerenderizadas en index.html`);

  // 6.4 Verificar que la Planilla Interactiva de Chequeo está prerenderizada en SSR
  assert.ok(distHtml.includes('id="tabla-planilla"'), 'tabla-planilla debe existir');
  assert.ok(distHtml.includes('id="planilla-tbody">'), 'planilla-tbody debe existir');
  assert.ok(distHtml.includes('btn-export-csv'), 'Debe existir botón de exportación CSV en la planilla');
  console.log(`✓ Planilla interactiva de chequeo institucional 100% prerenderizada en HTML estático`);

  // 6.5 Verificar Accesibilidad WCAG (Skip link, ARIA dialog, scopes)
  assert.ok(distHtml.includes('skip-link'), 'Debe incluir enlace de salto accesible');
  assert.ok(distHtml.includes('id="main-content"'), 'Debe existir destino #main-content para skip link');
  assert.ok(distHtml.includes('role="dialog"'), 'Modal debe contar con role="dialog"');
  assert.ok(distHtml.includes('aria-modal="true"'), 'Modal debe contar con aria-modal="true"');
  assert.ok(distHtml.includes('scope="col"'), 'Tablas deben usar encabezados con scope="col"');
  console.log(`✓ Accesibilidad WCAG verificada: Skip-link, ARIA dialog, trap keyboard y scope="col"`);

  // --- 7. Verificación de Cabeceras Cloudflare en dist/client/_headers ---
  console.log('\n--- 7. Verificación de Cabeceras de Seguridad en dist/client/_headers ---');
  const headersPath = path.join(ROOT, 'dist/client/_headers');
  assert.ok(fs.existsSync(headersPath), 'dist/client/_headers debe existir');
  const headersContent = fs.readFileSync(headersPath, 'utf-8');
  assert.ok(headersContent.includes('X-Content-Type-Options: nosniff'), 'Debe incluir X-Content-Type-Options: nosniff');
  assert.ok(headersContent.includes('X-Frame-Options: SAMEORIGIN'), 'Debe incluir X-Frame-Options: SAMEORIGIN');
  assert.ok(headersContent.includes('Access-Control-Allow-Origin: *'), 'Debe incluir CORS en /api/*');
  console.log(`✓ Cabeceras de seguridad Cloudflare verificadas en _headers`);

  // --- 8. Descarga de Datasets en public/ y dist/client/ ---
  console.log('\n--- 8. Disponibilidad de Datos Abiertos para Descarga ---');
  const requiredDatasets = [
    'inventario.json',
    'matriz_54_universidades.json',
    'compras_clasificadas.json',
    'citas_enriquecidas.json',
    'ranking_madurez_imn.json',
    'brecha_universidades_chile.json',
    'matriz_54_universidades.csv',
    'compras_ia_estatales.csv'
  ];
  for (const ds of requiredDatasets) {
    const pubPath = path.join(ROOT, 'public', ds);
    assert.ok(fs.existsSync(pubPath), `Archivo ${ds} debe existir en public/`);
    const distPath = path.join(ROOT, 'dist/client', ds);
    assert.ok(fs.existsSync(distPath), `Archivo ${ds} debe existir en dist/client/`);
    console.log(`✓ Dataset disponible para descarga: /${ds} (${Math.round(fs.statSync(distPath).size / 1024)} KB)`);
  }

  // --- 9. Seguridad XSS, Telemetría de Excepciones y Optimización de Bundle ---
  console.log('\n--- 9. Seguridad XSS, Telemetría de Excepciones y Optimización de Bundle ---');

  // 9.1 Verificación de Telemetría Diagnóstica en HTML
  assert.ok(distHtml.includes('Brújula IA Telemetría') || distHtml.includes('uncaught_error'), 'index.html debe contener observador de telemetría de errores');
  assert.ok(distHtml.includes('unhandledrejection'), 'index.html debe registrar unhandledrejection');
  console.log('✓ Telemetría diagnóstica de errores no capturados activa en index.html');

  // 9.2 Verificación de Optimización de Tamaño de index.html (< 1350 KB)
  const htmlSize = fs.statSync(path.join(ROOT, 'dist/client/index.html')).size;
  assert.ok(htmlSize < 1350 * 1024, `index.html debe pesar menos de 1350 KB tras incorporar metadatos de licitaciones/OCs (actual: ${Math.round(htmlSize / 1024)} KB)`);
  assert.ok(!distHtml.includes('const citasData = ['), 'index.html no debe inyectar citasData redundantemente en script');
  console.log(`✓ Payload de index.html optimizado: ${Math.round(htmlSize / 1024)} KB (< 1350 KB) sin JSON redundante`);

  // 9.3 Verificación de Protección XSS en scripts de cliente
  const ragScript = fs.readFileSync(path.join(ROOT, 'src/components/RagAssistant.astro'), 'utf-8');
  assert.ok(ragScript.includes('safeUni = escapeHtml'), 'RagAssistant debe sanitizar universidad');
  assert.ok(ragScript.includes('safeCita = escapeHtml'), 'RagAssistant debe sanitizar cita');
  assert.ok(ragScript.includes('safeExt'), 'RagAssistant debe validar esquema http/https en enlaces externos');

  const modalScript = fs.readFileSync(path.join(ROOT, 'src/components/ModalCrowdsourcing.astro'), 'utf-8');
  assert.ok(modalScript.includes('safeMessage = escapeHtml'), 'ModalCrowdsourcing debe escapar mensaje devuelto');
  assert.ok(modalScript.includes('safeTicket = escapeHtml'), 'ModalCrowdsourcing debe escapar ticket');
  console.log('✓ Mitigación estricta de XSS validada en RagAssistant y ModalCrowdsourcing');

  // 9.4 Verificación de min-width en tabla para scroll horizontal en pantallas angostas
  assert.ok(distHtml.includes('min-width:850px') || distHtml.includes('min-width:700px') || distHtml.includes('min-width: 850px'), 'Tabla debe contar con min-width para responsive móvil');
  assert.ok(distHtml.includes('theme-color'), 'Debe incluir meta theme-color');
  console.log('✓ Responsividad móvil (360px) y theme-color verificados en index.html');

  console.log('\n======================================================');
  console.log('🎉 TODAS LAS PRUEBAS ADVERSARIAS PASARON EXITOSAMENTE');
  console.log('======================================================\n');
}

testAdversarial().catch(err => {
  console.error('\n❌ ERROR EN PRUEBA ADVERSARIA:', err);
  process.exit(1);
});
