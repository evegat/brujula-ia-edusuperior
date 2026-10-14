import fs from 'node:fs';
import path from 'node:path';
import { execFileSync } from 'node:child_process';

const outDir = path.resolve('capturas_linkedin');
if (!fs.existsSync(outDir)) {
  fs.mkdirSync(outDir, { recursive: true });
}

const edgePath = 'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe';

const targets = [
  { file: '01_portada_y_guia_orientacion.png', url: 'https://brujulaiaedusuperior.evegat.cl', w: 1366, h: 960 },
  { file: '02_matriz_54_universidades.png', url: 'https://brujulaiaedusuperior.evegat.cl', w: 1366, h: 1400 },
  { file: '03_radar_ley21719_y_compras.png', url: 'https://brujulaiaedusuperior.evegat.cl', w: 1366, h: 1200 }
];

console.log('Generando capturas de pantalla para LinkedIn...');

for (const t of targets) {
  const dest = path.join(outDir, t.file);
  console.log(`- Capturando ${t.file}...`);
  try {
    execFileSync(edgePath, [
      '--headless',
      '--disable-gpu',
      `--window-size=${t.w},${t.h}`,
      '--virtual-time-budget=6000',
      `--screenshot=${dest}`,
      t.url
    ]);
    const stat = fs.statSync(dest);
    console.log(`  ✓ Creado: ${t.file} (${Math.round(stat.size / 1024)} KB)`);
  } catch (err) {
    console.error(`  ❌ Error capturando ${t.file}:`, err.message);
  }
}

console.log('\nProceso de capturas finalizado en:', outDir);
