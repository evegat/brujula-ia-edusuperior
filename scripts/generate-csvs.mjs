import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '..');

const matrizPath = path.join(rootDir, 'data', 'matriz_54_universidades.json');
const comprasPath = path.join(rootDir, 'data', 'compras_clasificadas.json');
const publicDir = path.join(rootDir, 'public');

function escapeCsv(val) {
  if (val === null || val === undefined) return '""';
  const str = String(val).replace(/"/g, '""');
  return `"${str}"`;
}

// 1. Generar matriz_54_universidades.csv
const matriz = JSON.parse(fs.readFileSync(matrizPath, 'utf-8'));

const matrizHeaders = [
  'N',
  'Registro_Mineduc',
  'Universidad',
  'Sigla',
  'Tipo_Oficial',
  'Segmento_Institucional',
  'Estado_Normativo',
  'Total_Instrumentos',
  'IMN_Puntaje',
  'IMN_Nivel',
  'Eje1_Aula',
  'Eje2_Tesis',
  'Eje3_Autoria',
  'Eje4_Privacidad_Ley_21719',
  'Eje5_Evaluacion',
  'Eje6_Compras_Mercado_Publico',
  'Sede_Central',
  'Territorio',
  'Alcance_Normativo'
];

const matrizRows = matriz.map((u, idx) => {
  const esEstatal = u.tipo_categoria === 'Estatales';
  let comprasVal = 'N/A (Régimen Privado - No sujeto a Ley 19.886)';
  if (esEstatal) {
    comprasVal = u.dimensiones.compras_ia 
      ? `SI (${u.compras?.total || 1} contratos)` 
      : 'NO (Sin contratos identificados en MP)';
  }

  return [
    idx + 1,
    escapeCsv(u.registro),
    escapeCsv(u.nombre),
    escapeCsv(u.sigla),
    escapeCsv(u.tipo_oficial),
    escapeCsv(u.tipo_categoria),
    escapeCsv(u.en_brecha ? 'Sin instrumento público identificado' : 'Con instrumento identificado'),
    u.total_instrumentos,
    u.imn,
    escapeCsv(u.imn_categoria),
    u.dimensiones.protocolo_aula ? 'SI' : 'NO',
    u.dimensiones.directriz_tesis ? 'SI' : 'NO',
    u.dimensiones.regla_autoria ? 'SI' : 'NO',
    u.dimensiones.privacidad_ley_21719 ? 'SI' : 'NO',
    u.dimensiones.modifica_evaluacion ? 'SI' : 'NO',
    escapeCsv(comprasVal),
    escapeCsv(u.sede_central || 'N/D'),
    escapeCsv(u.territorio || 'N/D'),
    escapeCsv(u.alcance_normativo || 'Sin instrumento')
  ].join(';');
});

const matrizCsvContent = '\uFEFF' + [matrizHeaders.join(';'), ...matrizRows].join('\n');
const matrizCsvPath = path.join(publicDir, 'matriz_54_universidades.csv');
fs.writeFileSync(matrizCsvPath, matrizCsvContent, 'utf-8');
console.log(`✓ Generado ${matrizCsvPath} (${matriz.length} filas)`);

// 2. Generar compras_ia_estatales.csv
const compras = JSON.parse(fs.readFileSync(comprasPath, 'utf-8'));

const comprasHeaders = [
  'ID_Compra',
  'Universidad',
  'Nombre_Proceso',
  'Descripcion',
  'Monto_CLP',
  'Proveedor',
  'Fecha',
  'Capa_Funcional',
  'Tipo_Uso',
  'Categoria_Tecnologica',
  'Categoria_Corta',
  'Confianza_Clasificacion',
  'Link_Mercado_Publico'
];

const comprasRows = compras.map((c) => {
  return [
    c.id_compra,
    escapeCsv(c.universidad),
    escapeCsv(c.nombre),
    escapeCsv(c.descripcion),
    c.monto || 0,
    escapeCsv(c.proveedor),
    escapeCsv(c.fecha),
    escapeCsv(c.capa_funcional),
    escapeCsv(c.tipo_uso),
    escapeCsv(c.categoria_tecnologica),
    escapeCsv(c.categoria_corta),
    escapeCsv(c.confianza_clasificacion),
    escapeCsv(c.link)
  ].join(';');
});

const comprasCsvContent = '\uFEFF' + [comprasHeaders.join(';'), ...comprasRows].join('\n');
const comprasCsvPath = path.join(publicDir, 'compras_ia_estatales.csv');
fs.writeFileSync(comprasCsvPath, comprasCsvContent, 'utf-8');
console.log(`✓ Generado ${comprasCsvPath} (${compras.length} filas)`);
