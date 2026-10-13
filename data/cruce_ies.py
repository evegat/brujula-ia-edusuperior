import json
import unicodedata
from pathlib import Path

BASE_DIR = Path(__file__).resolve().parent.parent
DATA_DIR = BASE_DIR / "data"

def norm_tokens(text):
    text = unicodedata.normalize('NFKD', str(text))
    text = ''.join(c for c in text if not unicodedata.combining(c))
    text = text.lower().replace('.', ' ').replace('-', ' ').replace("'", ' ')
    stop_words = {'universidad', 'de', 'del', 'la', 'las', 'los', 'el', 'y', 'pontificia', 'tecnica'}
    tokens = [w for w in text.split() if w not in stop_words]
    return ' '.join(tokens)

with open(DATA_DIR / "nomina_oficial_ies_mineduc.json", encoding="utf-8") as f:
    oficiales = json.load(f)

with open(BASE_DIR / "inventario.json", encoding="utf-8") as f:
    catastro = json.load(f)

# 54 Universidades oficiales
universidades = [u for u in oficiales if 'UNIVERSIDAD' in u['tipo']]

# Agrupar instrumentos de universidades en el catastro (excluyendo IP/CFT)
catastro_unis = {}
for item in catastro:
    tipo_inst = item.get('tipo_institucion', '')
    if 'IP' in tipo_inst or 'CFT' in tipo_inst:
        continue
    key = norm_tokens(item['universidad'])
    if key not in catastro_unis:
        catastro_unis[key] = []
    catastro_unis[key].append(item)

con_protocolo = []
sin_protocolo = []

FECHA_LEVANTAMIENTO = "2026-10-13"
FUENTES_CONSULTADAS = [
    "Sitios oficiales de Rectoría y Vicerrectorías Académicas",
    "Reglamentos de docencia de pregrado y postgrado",
    "Portales de Transparencia Activa",
    "Buscadores institucionales y repositorios documentales"
]

for u in universidades:
    u_key = norm_tokens(u['nombre'])
    docs = catastro_unis.get(u_key)
    
    if docs:
        con_protocolo.append({
            'registro': u['registro'],
            'nombre': u['nombre'],
            'tipo': u['tipo'],
            'estado_levantamiento': "Instrumento público identificado",
            'fecha_consulta': FECHA_LEVANTAMIENTO,
            'total_instrumentos': len(docs),
            'instrumentos': [
                {
                    'id': d.get('id'),
                    'documento': d['documento'],
                    'unidad': d['unidad'],
                    'alcance': d.get('alcance', 'Institucional'),
                    'fecha': d['fecha'],
                    'url': d['url'],
                    'exige_declaracion': d.get('exige_declaracion', False),
                    'ia_no_autora': d.get('ia_no_autora', False),
                    'menciona_datos_personales': d.get('menciona_datos_personales', False),
                    'modifica_evaluacion': d.get('modifica_evaluacion', False),
                    'enforcement': d.get('enforcement', '')
                }
                for d in docs
            ]
        })
    else:
        sin_protocolo.append({
            'registro': u['registro'],
            'nombre': u['nombre'],
            'tipo': u['tipo'],
            'estado_levantamiento': "Sin instrumento público identificado en el levantamiento",
            'fecha_consulta': FECHA_LEVANTAMIENTO,
            'fuentes_consultadas': FUENTES_CONSULTADAS,
            'observacion': "La no localización de instrumentos públicos en el catastro no prueba inexistencia de normativas internas, directrices de carrera no publicadas o iniciativas en formulación."
        })

print(f"Total Universidades Oficiales Mineduc: {len(universidades)}")
print(f"Universidades CON instrumentos identificados: {len(con_protocolo)} ({len(con_protocolo)*100/len(universidades):.1f}%)")
print(f"Universidades SIN instrumentos públicos hallados: {len(sin_protocolo)} ({len(sin_protocolo)*100/len(universidades):.1f}%)")

resultado = {
    'metadatos': {
        'version_catastro': "2.1.0",
        'fecha_corte': FECHA_LEVANTAMIENTO,
        'universo_evaluado': "54 Universidades oficiales reconocidas por Mineduc/SIES",
        'nota_epistemologica': "La categoría 'Sin instrumento público identificado' describe el resultado del barrido documental público y en ningún caso constituye declaración de inexistencia institucional."
    },
    'resumen': {
        'total_universidades_oficiales': len(universidades),
        'con_instrumento': len(con_protocolo),
        'sin_instrumento_identificado': len(sin_protocolo),
        'cobertura_porcentaje': round(len(con_protocolo)*100/len(universidades), 1)
    },
    'universidades_con_instrumento': con_protocolo,
    'universidades_sin_instrumento_identificado': sin_protocolo
}

out_data = DATA_DIR / "brecha_universidades_chile.json"
out_public = BASE_DIR / "public" / "brecha_universidades_chile.json"

for p in [out_data, out_public]:
    with open(p, "w", encoding="utf-8") as f:
        json.dump(resultado, f, ensure_ascii=False, indent=2)

print(f"Guardado exitosamente en data/ y public/ brecha_universidades_chile.json")
