import json
import unicodedata
import os
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

for u in universidades:
    u_key = norm_tokens(u['nombre'])
    docs = catastro_unis.get(u_key)
    
    if docs:
        con_protocolo.append({
            'registro': u['registro'],
            'nombre': u['nombre'],
            'tipo': u['tipo'],
            'total_instrumentos': len(docs),
            'instrumentos': [
                {
                    'documento': d['documento'],
                    'unidad': d['unidad'],
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
            'tipo': u['tipo']
        })

print(f"Total Universidades Oficiales Mineduc: {len(universidades)}")
print(f"Universidades CON instrumentos identificados: {len(con_protocolo)} ({len(con_protocolo)*100/len(universidades):.1f}%)")
print(f"Universidades SIN instrumentos públicos hallados (Brecha): {len(sin_protocolo)} ({len(sin_protocolo)*100/len(universidades):.1f}%)")

resultado = {
    'resumen': {
        'total_universidades_oficiales': len(universidades),
        'con_instrumento': len(con_protocolo),
        'sin_instrumento': len(sin_protocolo),
        'cobertura_porcentaje': round(len(con_protocolo)*100/len(universidades), 1)
    },
    'universidades_con_instrumento': con_protocolo,
    'universidades_sin_instrumento': sin_protocolo
}

out_path = DATA_DIR / "brecha_universidades_chile.json"
with open(out_path, "w", encoding="utf-8") as f:
    json.dump(resultado, f, ensure_ascii=False, indent=2)

print(f"\nGuardado exitosamente en {out_path}")
