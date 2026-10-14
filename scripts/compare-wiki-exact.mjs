import fs from 'node:fs';

const wikiPath = 'C:/Users/evega/.gemini/antigravity/brain/85d51dc8-56b7-4d17-8ef2-550e8dc90b6b/.system_generated/steps/1756/content.md';
const html = fs.readFileSync(wikiPath, 'utf-8');

const matriz = JSON.parse(fs.readFileSync('D:/Proyectos/P154 - Brujula IA EduSuperior/data/matriz_54_universidades.json', 'utf-8'));

// Buscar la tabla de la sección "Lista completa de universidades de Chile"
const startMarker = 'id="Lista_completa_de_universidades_de_Chile"';
const startIndex = html.indexOf(startMarker);
const tableStart = html.indexOf('<table', startIndex);
const tableEnd = html.indexOf('</table>', tableStart);
const tableHtml = html.substring(tableStart, tableEnd);

// Extraer filas y nombres
const rows = tableHtml.match(/<tr[\s\S]*?<\/tr>/gi) || [];
console.log('Filas encontradas en tabla completa de Wikipedia:', rows.length);

const wikiList = [];
for (const r of rows) {
  // Buscar enlace de universidad en la celda
  const m = r.match(/<a\s+rel="mw:WikiLink"\s+href="[^"]*\/wiki\/([^"]+)"[^>]*>([^<]+)<\/a>/i);
  if (m) {
    const name = m[2].trim();
    if (name.includes('Universidad')) {
      wikiList.push(name);
    }
  }
}

console.log('Universidades listadas en la tabla de Wikipedia:', wikiList.length);
wikiList.forEach((u, i) => console.log(`${i + 1}. ${u}`));

function normalize(s) {
  return s.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toUpperCase().replace(/[^A-Z0-9]/g, ' ').replace(/\s+/g, ' ').trim();
}

const nuestras = matriz.map(u => ({ raw: u.nombre, norm: normalize(u.nombre) }));

console.log('\n--- Comparación ---');
const noEnNuestras = [];
for (const w of wikiList) {
  const wNorm = normalize(w);
  const match = nuestras.find(n => n.norm.includes(wNorm) || wNorm.includes(n.norm));
  if (!match) {
    noEnNuestras.push(w);
  }
}

console.log('Universidades en Wikipedia pero NO en nuestro catastro (' + noEnNuestras.length + '):');
noEnNuestras.forEach(u => console.log('  👉 ' + u));

const noEnWiki = [];
for (const n of nuestras) {
  const match = wikiList.find(w => normalize(w).includes(n.norm) || n.norm.includes(normalize(w)));
  if (!match) {
    noEnWiki.push(n.raw);
  }
}
console.log('\nUniversidades en nuestro catastro pero NO en Wikipedia (' + noEnWiki.length + '):');
noEnWiki.forEach(u => console.log('  👉 ' + u));
