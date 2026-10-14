import fs from 'node:fs';

const wikiPath = 'C:/Users/evega/.gemini/antigravity/brain/85d51dc8-56b7-4d17-8ef2-550e8dc90b6b/.system_generated/steps/1756/content.md';
const html = fs.readFileSync(wikiPath, 'utf-8');

const matriz = JSON.parse(fs.readFileSync('D:/Proyectos/P154 - Brujula IA EduSuperior/data/matriz_54_universidades.json', 'utf-8'));
const nuestrosNombres = new Set(matriz.map(u => u.nombre.toUpperCase().trim()));

// Encontrar las tablas de universidades en Wikipedia
// Wikipedia clasifica en:
// 1. Estatales (18)
// 2. Tradicionales no estatales (CRUCH) (9)
// 3. Privadas no tradicionales (CUP + Otras)
const trs = html.match(/<tr[\s\S]*?<\/tr>/gi) || [];
const wikiUes = [];

for (const tr of trs) {
  // Ver si contiene enlace a universidad
  const m = tr.match(/<a\s+href="\/wiki\/([^"]+)"\s+title="([^"]+)">/i);
  if (m) {
    const title = m[2].trim();
    if (title.startsWith('Universidad ') || title.startsWith('Pontificia Universidad ')) {
      if (!title.includes('Anexo:') && !title.includes('Categoría:')) {
        wikiUes.push(title);
      }
    }
  }
}

const uniqueWiki = Array.from(new Set(wikiUes));
console.log('Total universidades detectadas en tablas de Wikipedia:', uniqueWiki.length);

console.log('\n--- Comparando con nuestro catastro de 54 ---');
function normalize(str) {
  return str.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toUpperCase().replace(/[^A-Z0-9]/g, ' ').trim();
}

const nuestrasNorm = matriz.map(u => ({ raw: u.nombre, norm: normalize(u.nombre), cat: u.tipo_categoria }));

const faltanEnNuestro = [];
for (const w of uniqueWiki) {
  const wNorm = normalize(w);
  const found = nuestrasNorm.find(n => n.norm.includes(wNorm) || wNorm.includes(n.norm));
  if (!found) {
    faltanEnNuestro.push(w);
  }
}

console.log('En Wikipedia pero NO en nuestras 54 (' + faltanEnNuestro.length + '):');
faltanEnNuestro.forEach(u => console.log('  ❌ ' + u));
