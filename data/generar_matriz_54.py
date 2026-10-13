import json
import unicodedata
from pathlib import Path

BASE_DIR = Path(__file__).resolve().parent.parent
DATA_DIR = BASE_DIR / "data"

with open(DATA_DIR / "nomina_oficial_ies_mineduc.json", encoding="utf-8") as f:
    oficiales = json.load(f)

with open(DATA_DIR / "brecha_universidades_chile.json", encoding="utf-8") as f:
    brecha = json.load(f)

with open(DATA_DIR / "compras_clasificadas.json", encoding="utf-8") as f:
    compras = json.load(f)

with open(DATA_DIR / "clausulas_corpus.json", encoding="utf-8") as f:
    clausulas = json.load(f)

with open(BASE_DIR / "inventario.json", encoding="utf-8") as f:
    inventario = json.load(f)

with open(DATA_DIR / "ranking_madurez_imn.json", encoding="utf-8") as f:
    ranking_imn = json.load(f)

def norm_tokens(text):
    text = unicodedata.normalize('NFKD', str(text))
    text = ''.join(c for c in text if not unicodedata.combining(c))
    text = text.lower().replace('.', ' ').replace('-', ' ').replace("'", ' ')
    stop_words = {'universidad', 'de', 'del', 'la', 'las', 'los', 'el', 'y', 'pontificia', 'tecnica'}
    tokens = [w for w in text.split() if w not in stop_words]
    return ' '.join(tokens)

# Mapear IMN por universidad
imn_por_u = {}
for r in ranking_imn:
    imn_por_u[norm_tokens(r['universidad'])] = r

# Mapear compras por universidad
compras_por_u = {}
for c in compras:
    u_norm = norm_tokens(c['universidad'])
    if u_norm not in compras_por_u:
        compras_por_u[u_norm] = []
    compras_por_u[u_norm].append(c)

# Siglas con clausulas de tesis en corpus_md
siglas_con_tesis_corpus = set()
for c in clausulas:
    if c.get('clausulas', {}).get('tesis') and len(c['clausulas']['tesis']) > 0:
        siglas_con_tesis_corpus.add(c.get('sigla', '').lower())

# Universidades con instrumento segun brecha
con_inst_map = {norm_tokens(u['nombre']): u for u in brecha['universidades_con_instrumento']}

# Construir matriz de las 54 universidades oficiales
matriz = []

universidades_54 = [u for u in oficiales if 'UNIVERSIDAD' in u['tipo']]

for u in universidades_54:
    u_norm = norm_tokens(u['nombre'])
    info_con = con_inst_map.get(u_norm)
    en_brecha = info_con is None
    
    # Categoría
    tipo_oficial = u['tipo']
    if tipo_oficial == 'UNIVERSIDAD ESTATAL':
        tipo_categoria = 'Estatales'
    elif tipo_oficial == 'UNIVERSIDAD PARTICULAR CON APORTES':
        tipo_categoria = 'Privadas CRUCH'
    else:
        tipo_categoria = 'Privadas no CRUCH'
        
    # Instrumentos asociados en inventario
    docs = []
    if not en_brecha:
        for item in inventario:
            if 'IP' in item.get('tipo_institucion', '') or 'CFT' in item.get('tipo_institucion', ''):
                continue
            if norm_tokens(item['universidad']) == u_norm:
                docs.append(item)
                
    sigla = docs[0].get('sigla', '') if docs else ''
    if not sigla:
        # Siglas estándar para universidades en brecha si aplica
        palabras = [w for w in u['nombre'].split() if len(w) > 2 and w.upper() not in ['DEL', 'LOS', 'LAS', 'PARA', 'POR']]
        if 'METROPOLITANA' in u['nombre']:
            sigla = 'UTEM'
        elif 'SERENA' in u['nombre']:
            sigla = 'ULS'
        elif 'BIO' in u['nombre']:
            sigla = 'UBB'
        elif 'TARAPACA' in u['nombre']:
            sigla = 'UTA'
        elif 'ARTURO PRAT' in u['nombre']:
            sigla = 'UNAP'
        elif 'MAGALLANES' in u['nombre']:
            sigla = 'UMAG'
        elif 'PLAYA ANCHA' in u['nombre']:
            sigla = 'UPLA'
        elif 'AYSEN' in u['nombre']:
            sigla = 'UAysén'
        elif 'OHIGGINS' in norm_tokens(u['nombre']):
            sigla = 'UOH'
        else:
            sigla = ''.join([p[0] for p in palabras])[:6].upper()

    # Dimensiones
    # 1. Protocolo de Aula: ¿cuenta con instrumento normativo verificado?
    protocolo_aula = not en_brecha
    
    # 2. Directriz de Tesis: ¿menciona tesis en documento, alcance o corpus?
    directriz_tesis = False
    if not en_brecha:
        directriz_tesis = any('tesis' in (d.get('documento', '') + ' ' + d.get('alcance_detalle', '')).lower() for d in docs)
        if sigla.lower() in siglas_con_tesis_corpus:
            directriz_tesis = True
            
    # 3. Regla de Autoría: IA no es autora
    regla_autoria = False
    if not en_brecha:
        regla_autoria = any(d.get('ia_no_autora', False) for d in docs)
        
    # 4. Privacidad Ley N° 21.719
    privacidad_ley_21719 = False
    if not en_brecha:
        privacidad_ley_21719 = any(d.get('menciona_datos_personales', False) for d in docs)
        
    # 5. Modificación de Evaluaciones
    modifica_evaluacion = False
    if not en_brecha:
        modifica_evaluacion = any(d.get('modifica_evaluacion', False) for d in docs)
        
    # 6. Compras de IA registradas
    compras_u = compras_por_u.get(u_norm, [])
    tiene_compras = len(compras_u) > 0
    capas_compras = sorted(list(set(c.get('capa_funcional', '') for c in compras_u)))
    monto_total_compras = sum(c.get('monto', 0) for c in compras_u)

    # Datos IMN si existen
    datos_imn = imn_por_u.get(u_norm)
    
    matriz.append({
        'registro': u['registro'],
        'nombre': u['nombre'],
        'sigla': sigla,
        'tipo_oficial': tipo_oficial,
        'tipo_categoria': tipo_categoria,
        'en_brecha': en_brecha,
        'total_instrumentos': len(docs),
        'imn': datos_imn['imn'] if datos_imn else None,
        'imn_categoria': datos_imn['categoria'] if datos_imn else None,
        'dimensiones': {
            'protocolo_aula': protocolo_aula,
            'directriz_tesis': directriz_tesis,
            'regla_autoria': regla_autoria,
            'privacidad_ley_21719': privacidad_ley_21719,
            'modifica_evaluacion': modifica_evaluacion,
            'compras_ia': tiene_compras
        },
        'compras': {
            'total': len(compras_u),
            'monto_total': monto_total_compras,
            'capas': capas_compras
        },
        'instrumentos': [
            {
                'id': d['id'],
                'documento': d['documento'],
                'unidad': d['unidad'],
                'fecha': d['fecha'],
                'url': d['url'],
                'enforcement': d.get('enforcement', ''),
                'exige_declaracion': d.get('exige_declaracion', False)
            }
            for d in docs
        ]
    })

matriz.sort(key=lambda x: (x['en_brecha'], x['nombre']))

out_file = DATA_DIR / "matriz_54_universidades.json"
with open(out_file, "w", encoding="utf-8") as f:
    json.dump(matriz, f, ensure_ascii=False, indent=2)

print(f"Matriz de las 54 Universidades generada exitosamente en {out_file}")
print(f"Total universidades: {len(matriz)}")
print(f"Con instrumento: {sum(1 for m in matriz if not m['en_brecha'])}")
print(f"En brecha: {sum(1 for m in matriz if m['en_brecha'])}")
print(f"Con compras de IA: {sum(1 for m in matriz if m['dimensiones']['compras_ia'])}")
print(f"En brecha Y con compras registradas: {sum(1 for m in matriz if m['en_brecha'] and m['dimensiones']['compras_ia'])}")
