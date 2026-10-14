import fs from 'node:fs';
import path from 'node:path';
import { spawn } from 'node:child_process';

const outDir = path.resolve('capturas_linkedin');
if (!fs.existsSync(outDir)) {
  fs.mkdirSync(outDir, { recursive: true });
}

const edgePath = 'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe';
const port = 9333;

async function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

async function run() {
  console.log('Iniciando Microsoft Edge headless con CDP en puerto ' + port + '...');
  const edgeProcess = spawn(edgePath, [
    '--headless',
    '--disable-gpu',
    `--remote-debugging-port=${port}`,
    '--window-size=1366,900',
    'about:blank'
  ]);

  // Esperar a que el puerto responda
  let wsUrl = null;
  for (let i = 0; i < 20; i++) {
    await sleep(400);
    try {
      const res = await fetch(`http://127.0.0.1:${port}/json/version`);
      if (res.ok) {
        const data = await res.json();
        wsUrl = data.webSocketDebuggerUrl;
        break;
      }
    } catch {}
  }

  if (!wsUrl) {
    console.error('❌ No se pudo conectar a Edge CDP.');
    edgeProcess.kill();
    return;
  }

  console.log('Conectado a CDP:', wsUrl);
  const ws = new WebSocket(wsUrl);

  let idCounter = 1;
  const pending = new Map();

  ws.onmessage = (event) => {
    const msg = JSON.parse(event.data);
    if (msg.id && pending.has(msg.id)) {
      const resolve = pending.get(msg.id);
      pending.delete(msg.id);
      resolve(msg);
    }
  };

  await new Promise(resolve => ws.onopen = resolve);

  function sendCommand(method, params = {}) {
    return new Promise((resolve) => {
      const id = idCounter++;
      pending.set(id, resolve);
      ws.send(JSON.stringify({ id, method, params }));
    });
  }

  // Crear una nueva página (Target)
  const targetRes = await sendCommand('Target.createTarget', { url: 'https://brujulaiaedusuperior.evegat.cl' });
  const targetId = targetRes.result.targetId;

  // Conectar a la sesión del target
  const sessionRes = await sendCommand('Target.attachToTarget', { targetId, flatten: true });
  const sessionId = sessionRes.result.sessionId;

  function sendSession(method, params = {}) {
    return new Promise((resolve) => {
      const id = idCounter++;
      pending.set(id, resolve);
      ws.send(JSON.stringify({ id, sessionId, method, params }));
    });
  }

  await sendSession('Page.enable');
  await sendSession('Runtime.enable');
  await sendSession('Emulation.setDeviceMetricsOverride', {
    width: 1366,
    height: 900,
    deviceScaleFactor: 1.5,
    mobile: false
  });

  console.log('Esperando carga completa de https://brujulaiaedusuperior.evegat.cl...');
  await sleep(3500);

  const captures = [
    {
      name: '01_portada_y_guia_3_pasos.png',
      desc: 'Portada, Radiografía y Guía Rápida de 3 Pasos',
      action: async () => {
        await sendSession('Runtime.evaluate', {
          expression: `window.scrollTo({ top: 0, behavior: 'instant' });`
        });
        await sleep(500);
      }
    },
    {
      name: '02_matriz_54_universidades.png',
      desc: 'Matriz Nacional de 54 Universidades con Semáforos y Filtros',
      action: async () => {
        await sendSession('Runtime.evaluate', {
          expression: `
            const btn = document.querySelector('.tab-btn[data-tab="tab-matriz"]');
            if (btn) btn.click();
            const el = document.getElementById('matriz-nacional');
            if (el) el.scrollIntoView({ behavior: 'instant' });
          `
        });
        await sleep(800);
      }
    },
    {
      name: '03_radar_ley_21719_datos_personales.png',
      desc: 'Radar Ley N° 21.719 de Protección de Datos y Kit Normativo',
      action: async () => {
        await sendSession('Runtime.evaluate', {
          expression: `
            const btn = document.querySelector('.tab-btn[data-tab="tab-kit"]');
            if (btn) btn.click();
            const el = document.getElementById('tab-kit');
            if (el) el.scrollIntoView({ behavior: 'instant' });
          `
        });
        await sleep(800);
      }
    },
    {
      name: '04_compras_publicas_mercado_publico.png',
      desc: '85 Licitaciones de Software e IA en Mercado Público',
      action: async () => {
        await sendSession('Runtime.evaluate', {
          expression: `
            const btn = document.querySelector('.tab-btn[data-tab="tab-compras"]');
            if (btn) btn.click();
            const el = document.getElementById('tab-compras');
            if (el) el.scrollIntoView({ behavior: 'instant' });
          `
        });
        await sleep(800);
      }
    },
    {
      name: '05_planilla_chequeo_benchmarking.png',
      desc: 'Planilla Interactiva de Chequeo y Exportación CSV',
      action: async () => {
        await sendSession('Runtime.evaluate', {
          expression: `
            const btn = document.querySelector('.tab-btn[data-tab="tab-matriz"]');
            if (btn) btn.click();
            const el = document.getElementById('planilla');
            if (el) el.scrollIntoView({ behavior: 'instant' });
          `
        });
        await sleep(800);
      }
    }
  ];

  for (const cap of captures) {
    console.log(`- Generando captura: ${cap.name} (${cap.desc})...`);
    await cap.action();
    const snap = await sendSession('Page.captureScreenshot', { format: 'png', captureBeyondViewport: false });
    if (snap.result && snap.result.data) {
      const buffer = Buffer.from(snap.result.data, 'base64');
      const targetPath = path.join(outDir, cap.name);
      fs.writeFileSync(targetPath, buffer);
      console.log(`  ✓ Guardado: ${cap.name} (${Math.round(buffer.length / 1024)} KB)`);
    } else {
      console.error(`  ❌ Error capturando ${cap.name}`);
    }
  }

  ws.close();
  edgeProcess.kill();
  console.log('\n🎉 Todas las capturas diferenciadas se han generado con éxito en:', outDir);
}

run().catch(err => {
  console.error('Error fatal:', err);
  process.exit(1);
});
