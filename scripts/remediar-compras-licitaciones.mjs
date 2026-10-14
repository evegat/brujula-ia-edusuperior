import fs from 'node:fs';
import path from 'node:path';

const comprasPath = path.resolve('data/compras_clasificadas.json');
const matrizPath = path.resolve('data/matriz_54_universidades.json');
const publicComprasPath = path.resolve('public/compras_clasificadas.json');
const publicMatrizPath = path.resolve('public/matriz_54_universidades.json');

const compras = JSON.parse(fs.readFileSync(comprasPath, 'utf-8'));
const matriz = JSON.parse(fs.readFileSync(matrizPath, 'utf-8'));

// Mapa de licitaciones en el dataset
const licMap = new Map();
compras.forEach(x => {
  const m = (x.link || '').match(/idLicitacion=([^&]+)/i);
  if (m) {
    licMap.set(m[1].toUpperCase(), x.id_compra);
  }
});

// Enriquecer compras clasificadas
const enrichedCompras = compras.map(x => {
  const isLic = (x.link || '').includes('idLicitacion=');
  const mLic = (x.link || '').match(/idLicitacion=([^&]+)/i);
  const mOC = (x.link || '').match(/codigoOC=([^&]+)/i);
  const text = ((x.nombre || '') + ' ' + (x.descripcion || '')).toLowerCase();

  let tipoDoc = isLic ? 'Licitación Pública' : 'Orden de Compra';
  let codigoDoc = isLic ? (mLic ? mLic[1].toUpperCase() : '') : (mOC ? mOC[1].toUpperCase() : '');
  let licPadre = null;
  let esDerivada = false;

  if (!isLic) {
    for (const licId of licMap.keys()) {
      if (text.includes(licId.toLowerCase())) {
        licPadre = licId;
        esDerivada = true;
        break;
      }
    }
  }

  // Verificar si esta licitación tiene OCs derivadas en el dataset
  let tieneOcsEnDataset = false;
  if (isLic && codigoDoc) {
    tieneOcsEnDataset = compras.some(o => {
      if (o.id_compra === x.id_compra) return false;
      const ot = ((o.nombre || '') + ' ' + (o.descripcion || '')).toLowerCase();
      return ot.includes(codigoDoc.toLowerCase());
    });
  }

  let computaNeto = true;
  let notaDeduplicacion = '';
  if (isLic && tieneOcsEnDataset) {
    computaNeto = false;
    notaDeduplicacion = 'Monto base licitado. El gasto real se computa a través de las órdenes de compra derivadas en este mismo dataset para evitar doble contabilización.';
  } else if (esDerivada) {
    notaDeduplicacion = `Orden de compra ejecutada a partir de la Licitación Pública ${licPadre}.`;
  }

  return {
    ...x,
    tipo_instrumento: tipoDoc,
    codigo_mercado_publico: codigoDoc,
    es_licitacion: isLic,
    es_orden_compra: !isLic,
    es_derivada: esDerivada,
    licitacion_origen: licPadre,
    tiene_ocs_asociadas: tieneOcsEnDataset,
    computa_monto_neto: computaNeto,
    nota_metodologica_compra: notaDeduplicacion
  };
});

// Guardar compras enriquecidas
fs.writeFileSync(comprasPath, JSON.stringify(enrichedCompras, null, 2), 'utf-8');
fs.writeFileSync(publicComprasPath, JSON.stringify(enrichedCompras, null, 2), 'utf-8');

// Actualizar matriz de 54 universidades con montos netos deduplicados
const norm = (s) => (s || '').normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase().trim();

const enrichedMatriz = matriz.map(u => {
  if (!u.dimensiones?.compras_ia) return u;

  const uNorm = norm(u.nombre);
  const uCompras = enrichedCompras.filter(c => {
    const cNorm = norm(c.universidad);
    return uNorm.includes(cNorm) || cNorm.includes(uNorm);
  });

  let montoNeto = 0;
  let montoBruto = 0;
  let licitaciones = 0;
  let ocs = 0;
  const procesosSet = new Set();

  uCompras.forEach(c => {
    const m = parseFloat(c.monto) || 0;
    montoBruto += m;
    if (c.computa_monto_neto) montoNeto += m;
    if (c.es_licitacion) {
      licitaciones++;
      procesosSet.add(c.codigo_mercado_publico || `LIC_${c.id_compra}`);
    } else {
      ocs++;
      if (c.es_derivada && c.licitacion_origen) {
        procesosSet.add(c.licitacion_origen);
      } else {
        procesosSet.add(c.codigo_mercado_publico || `OC_${c.id_compra}`);
      }
    }
  });

  return {
    ...u,
    compras: {
      total: uCompras.length,
      licitaciones,
      ordenes_compra: ocs,
      procesos_unicos: procesosSet.size,
      monto_total: montoNeto,
      monto_bruto: montoBruto,
      capas: u.compras?.capas || []
    }
  };
});

fs.writeFileSync(matrizPath, JSON.stringify(enrichedMatriz, null, 2), 'utf-8');
fs.writeFileSync(publicMatrizPath, JSON.stringify(enrichedMatriz, null, 2), 'utf-8');

console.log('✓ compras_clasificadas.json y matriz_54_universidades.json enriquecidos y deduplicados con éxito.');
