import fs from 'node:fs';
import path from 'node:path';
import { spawn } from 'node:child_process';

const outDir = path.resolve('capturas_linkedin');
if (!fs.existsSync(outDir)) {
  fs.mkdirSync(outDir, { recursive: true });
}

const edgePath = 'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe';
const port = 9666;

async function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

async function run() {
  console.log(`Iniciando Edge headless en puerto ${port}...`);
  const edge = spawn(edgePath, [
    '--headless',
    '--disable-gpu',
    `--remote-debugging-port=${port}`,
    '--window-size=1400,950',
    'https://brujulaiaedusuperior.evegat.cl'
  ]);

  let pageWsUrl = null;
  for (let i = 0; i < 25; i++) {
    await sleep(400);
    try {
      const res = await fetch(`http://127.0.0.1:${port}/json/list`);
      if (res.ok) {
        const list = await res.json();
        const page = list.find(t => t.type === 'page');
        if (page && page.webSocketDebuggerUrl) {
          pageWsUrl = page.webSocketDebuggerUrl;
          break;
        }
      }
    } catch {}
  }

  if (!pageWsUrl) {
    console.error('❌ No se encontró target tipo page.');
    edge.kill();
    return;
  }

  console.log('Conectado a Page WebSocket:', pageWsUrl);
  const ws = new WebSocket(pageWsUrl);
  await new Promise(r => ws.onopen = r);

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

  function send(method, params = {}) {
    return new Promise((resolve) => {
      const id = idCounter++;
      pending.set(id, resolve);
      ws.send(JSON.stringify({ id, method, params }));
    });
  }

  await send('Page.enable');
  await send('Runtime.enable');
  await send('Emulation.setDeviceMetricsOverride', {
    width: 1400,
    height: 950,
    deviceScaleFactor: 1.5,
    mobile: false
  });

  console.log('Esperando estabilización de página (4s)...');
  await sleep(4000);

  const steps = [
    {
      file: '01_portada_y_guia_3_pasos.png',
      desc: 'Portada y Guía de Orientación en 3 Pasos',
      fn: async () => {
        return send('Runtime.evaluate', {
          expression: `
            (() => {
              window.scrollTo(0, 0);
              return 'top_scrolled';
            })()
          `
        });
      }
    },
    {
      file: '02_matriz_54_universidades.png',
      desc: 'Matriz Nacional de 54 Universidades con Filtros y Semáforos',
      fn: async () => {
        return send('Runtime.evaluate', {
          expression: `
            (() => {
              const btn = document.querySelector('.tab-btn[data-tab="tab-matriz"]');
              if (btn) btn.click();
              const el = document.getElementById('matriz-cards-grid');
              if (el) {
                const targetY = el.getBoundingClientRect().top + window.scrollY - 190;
                window.scrollTo(0, targetY);
                return 'scrolled_to_matriz_cards: ' + targetY;
              }
              return 'matriz_cards_not_found';
            })()
          `
        });
      }
    },
    {
      file: '03_radar_ley_21719_datos_personales.png',
      desc: 'Radar Ley 21.719 de Protección de Datos y Kit Normativo',
      fn: async () => {
        return send('Runtime.evaluate', {
          expression: `
            (() => {
              const btn = document.querySelector('.tab-btn[data-tab="tab-kit"]');
              if (btn) btn.click();
              const nav = document.querySelector('.tabs-nav');
              const targetY = nav ? (nav.getBoundingClientRect().top + window.scrollY) : 600;
              window.scrollTo(0, targetY);
              return 'opened_tab_kit_scrolled: ' + targetY;
            })()
          `
        });
      }
    },
    {
      file: '04_compras_publicas_mercado_publico.png',
      desc: '85 Licitaciones de IA en Mercado Público (Universidades del Estado)',
      fn: async () => {
        return send('Runtime.evaluate', {
          expression: `
            (() => {
              const btn = document.querySelector('.tab-btn[data-tab="tab-compras"]');
              if (btn) btn.click();
              const nav = document.querySelector('.tabs-nav');
              const targetY = nav ? (nav.getBoundingClientRect().top + window.scrollY) : 600;
              window.scrollTo(0, targetY);
              return 'opened_tab_compras_scrolled: ' + targetY;
            })()
          `
        });
      }
    },
    {
      file: '05_planilla_chequeo_benchmarking.png',
      desc: 'Planilla Interactiva de Chequeo Institucional y Exportación CSV',
      fn: async () => {
        return send('Runtime.evaluate', {
          expression: `
            (() => {
              const btn = document.querySelector('.tab-btn[data-tab="tab-matriz"]');
              if (btn) btn.click();
              const el = document.getElementById('planilla');
              if (el) {
                const targetY = el.getBoundingClientRect().top + window.scrollY - 70;
                window.scrollTo(0, targetY);
                return 'scrolled_to_planilla: ' + targetY;
              }
              return 'planilla_not_found';
            })()
          `
        });
      }
    }
  ];

  for (const step of steps) {
    console.log(`\nCapturando: ${step.file} (${step.desc})...`);
    const evalRes = await step.fn();
    console.log('   Eval resultado:', evalRes.result?.value, evalRes.exceptionDetails || '');
    await sleep(800);
    const snap = await send('Page.captureScreenshot', { format: 'png' });
    if (snap.result && snap.result.data) {
      const buf = Buffer.from(snap.result.data, 'base64');
      const dest = path.join(outDir, step.file);
      fs.writeFileSync(dest, buf);
      console.log(`✓ Guardado: ${step.file} (${Math.round(buf.length / 1024)} KB)`);
    } else {
      console.error(`❌ Error capturando: ${step.file}`);
    }
  }

  ws.close();
  edge.kill();
  console.log('\n🎉 Capturas diferenciadas completadas exitosamente.');
}

run().catch(err => {
  console.error('Error fatal:', err);
  process.exit(1);
});
