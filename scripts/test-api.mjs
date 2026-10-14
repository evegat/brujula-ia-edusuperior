import { POST as subscribeHandler } from '../src/pages/api/subscribe.ts';
import { POST as contactHandler } from '../src/pages/api/contact.ts';
import { POST as submitNormativaHandler } from '../src/pages/api/submit-normativa.ts';
import { POST as askRagHandler } from '../src/pages/api/ask-rag.ts';
import assert from 'node:assert';

async function runTests() {
  console.log('--- Probando /api/subscribe ---');
  // 1. Subscribe válido
  let res = await subscribeHandler({
    request: new Request('http://localhost/api/subscribe', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: 'investigador@uchile.cl', institucion: 'Universidad de Chile', perfil: 'investigador' })
    })
  });
  assert.strictEqual(res.status, 200);
  let data = await res.json();
  assert.strictEqual(data.success, true);
  assert.ok(data.message.includes('investigador@uchile.cl'));
  console.log('✓ Subscribe válido pasó');

  // 2. Subscribe inválido (sin email)
  res = await subscribeHandler({
    request: new Request('http://localhost/api/subscribe', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: 'invalido' })
    })
  });
  assert.strictEqual(res.status, 400);
  data = await res.json();
  assert.strictEqual(data.success, false);
  console.log('✓ Subscribe inválido rechazado correctamente');

  console.log('\n--- Probando /api/contact ---');
  // 3. Contact válido
  res = await contactHandler({
    request: new Request('http://localhost/api/contact', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ nombre: 'Dra. María Paz', email: 'mpaz@instituto.cl', mensaje: 'Consulta sobre metodología GENIAL' })
    })
  });
  assert.strictEqual(res.status, 200);
  data = await res.json();
  assert.strictEqual(data.success, true);
  console.log('✓ Contact válido pasó');

  // 4. Contact inválido (mensaje muy corto)
  res = await contactHandler({
    request: new Request('http://localhost/api/contact', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ nombre: 'Test', email: 'test@test.cl', mensaje: 'hola' })
    })
  });
  assert.strictEqual(res.status, 400);
  data = await res.json();
  assert.strictEqual(data.success, false);
  console.log('✓ Contact mensaje corto rechazado correctamente');

  console.log('\n--- Probando /api/submit-normativa ---');
  // 5. Submit normativa válido
  res = await submitNormativaHandler({
    request: new Request('http://localhost/api/submit-normativa', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        institucion: 'Universidad de Magallanes',
        url_normativa: 'https://umag.cl/normativa-ia.pdf',
        resumen: 'Resolución de Rectoría N° 45/2026 sobre uso de IA en pregrado',
        remitente_email: 'docente@umag.cl'
      })
    })
  });
  assert.strictEqual(res.status, 200);
  data = await res.json();
  assert.strictEqual(data.success, true);
  assert.ok(data.ticket_id.startsWith('NORM-'));
  console.log('✓ Submit normativa válido pasó con ticket:', data.ticket_id);

  // 5b. Submit normativa estructurado (decreto, organo_emisor, url_adjunto)
  res = await submitNormativaHandler({
    request: new Request('http://localhost/api/submit-normativa', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        institucion: 'Universidad de Valparaíso',
        numero_decreto: 'Decreto Exento N° 124/2025',
        organo_emisor: 'Rectoría Central',
        url_normativa: 'https://uv.cl/decreto-124.pdf',
        url_adjunto: 'https://drive.google.com/file/d/123/view',
        resumen: 'Regulación integral de aula y autoría',
        remitente_nombre: 'Dra. María González',
        remitente_email: 'maria.gonzalez@uv.cl'
      })
    })
  });
  assert.strictEqual(res.status, 200);
  data = await res.json();
  assert.strictEqual(data.success, true);
  assert.strictEqual(data.data.numero_decreto, 'Decreto Exento N° 124/2025');
  assert.strictEqual(data.data.organo_emisor, 'Rectoría Central');
  console.log('✓ Submit normativa estructurado pasó con ticket:', data.ticket_id);

  // 6. Submit normativa sin institución
  res = await submitNormativaHandler({
    request: new Request('http://localhost/api/submit-normativa', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        url_normativa: 'https://ejemplo.cl'
      })
    })
  });
  assert.strictEqual(res.status, 400);
  data = await res.json();
  assert.strictEqual(data.success, false);
  console.log('✓ Submit normativa sin institución rechazado');

  console.log('\n--- Probando /api/ask-rag ---');
  // 7. RAG query sobre prompts
  res = await askRagHandler({
    request: new Request('http://localhost/api/ask-rag', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ query: '¿Qué universidades exigen declarar el prompt?' })
    })
  });
  assert.strictEqual(res.status, 200);
  data = await res.json();
  assert.strictEqual(data.success, true);
  assert.ok(data.citations.length > 0);
  assert.ok(data.citations[0].pagina !== null && data.citations[0].pagina !== undefined);
  assert.ok(data.citations[0].universidad);
  assert.ok(data.citations[0].documento);
  assert.ok(data.answer.includes('Evidencia Textual Recuperada'));
  console.log('✓ RAG query sobre prompts exitoso. Citas recuperadas:', data.citations.length);
  console.log('  Muestra primera cita:', data.citations[0].sigla, 'Pág:', data.citations[0].pagina, data.citations[0].documento);

  // 8. RAG query sobre tesis
  res = await askRagHandler({
    request: new Request('http://localhost/api/ask-rag', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ query: '¿Cómo se regula el uso de IA en tesis?' })
    })
  });
  assert.strictEqual(res.status, 200);
  data = await res.json();
  assert.strictEqual(data.success, true);
  assert.ok(data.citations.length > 0);
  console.log('✓ RAG query sobre tesis exitoso. Citas recuperadas:', data.citations.length);

  console.log('\n>>> TODOS LOS TESTS DE ENDPOINTS PASARON EXITOSAMENTE <<<');
}

runTests().catch(err => {
  console.error('Test falló:', err);
  process.exit(1);
});
