import json, unicodedata

def norm(text):
    text = unicodedata.normalize('NFD', str(text))
    text = ''.join(c for c in text if unicodedata.category(c) != 'Mn')
    text = text.lower().replace('del ', ' ').replace('de ', ' ').replace('la ', ' ').replace('el ', ' ').replace('los ', ' ').replace('las ', ' ').replace('y ', ' ').replace('-', ' ').replace('.', ' ')
    return ' '.join(text.split())

with open(r'D:\Proyectos\P154 - brujula-ia-edusuperior\data\nomina_oficial_ies_mineduc.json', encoding='utf-8') as f:
    oficiales = json.load(f)

with open(r'D:\Proyectos\P154 - brujula-ia-edusuperior\inventario.json', encoding='utf-8') as f:
    catastro = json.load(f)

# 54 Universidades oficiales
universidades = [u for u in oficiales if 'UNIVERSIDAD' in u['tipo']]

# Mapear nombres en el catastro
catastro_unis = {}
for item in catastro:
    key = norm(item['universidad'])
    if key not in catastro_unis:
        catastro_unis[key] = []
    catastro_unis[key].append(item)

con_protocolo = []
sin_protocolo = []

# Alias comunes
alias_map = {
    'universidad santiago chile': 'universidad santiago chile usach',
    'pontificia universidad catolica chile': 'pontificia universidad catolica chile puc',
    'universidad chile': 'universidad chile uchile',
    'universidad concepcion': 'universidad concepcion udec',
    'universidad valparaiso': 'universidad valparaiso uv',
    'universidad frontera': 'universidad frontera ufro',
    'universidad adolfo ibanez': 'universidad adolfo ibanez uai',
    'universidad diego portales': 'universidad diego portales udp',
    'universidad andres bello': 'universidad andres bello unab',
    'universidad austral chile': 'universidad austral chile uach',
    'universidad autonoma chile': 'universidad autonoma chile uautonoma',
    'universidad desarrollo': 'universidad desarrollo udd',
    'universidad americas': 'universidad americas udla',
    'universidad catolica temuco': 'universidad catolica temuco uct',
    'universidad catolica norte': 'universidad catolica norte ucn',
    'universidad pontificia catolica valparaiso': 'pontificia universidad catolica valparaiso pucv',
    'pontificia universidad catolica valparaiso': 'pontificia universidad catolica valparaiso pucv',
    'universidad bernardo o higgins': 'universidad bernardo ohiggins ubo',
    'universidad central chile': 'universidad central chile ucen',
    'universidad santo tomas': 'universidad santo tomas ust',
    'universidad mayor': 'universidad mayor umayor',
    'universidad san sebastian': 'universidad san sebastian uss',
    'universidad gabriela mistral': 'universidad gabriela mistral ugm',
    'universidad atacama': 'universidad atacama uda',
    'universidad antofagasta': 'universidad antofagasta ua',
    'universidad talca': 'universidad talca utalca',
    'universidad lagos': 'universidad lagos ulagos',
    'universidad alberto hurtado': 'universidad alberto hurtado uah'
}

for u in universidades:
    u_n = norm(u['nombre'])
    match = None
    
    # 1. Match directo o por alias
    for k, docs in catastro_unis.items():
        if k in u_n or u_n in k:
            match = docs
            break
        # Buscar palabras clave fuertes (ej: 'tarapaca', 'atacama', 'frontera', 'araucana')
        tokens_u = [t for t in u_n.split() if len(t) > 5 and t not in ['universidad', 'ciencias', 'educacion']]
        tokens_k = [t for t in k.split() if len(t) > 5 and t not in ['universidad', 'ciencias', 'educacion']]
        if tokens_u and tokens_k and any(tu in tokens_k or any(tk in tu for tk in tokens_k) for tu in tokens_u):
            match = docs
            break
            
    if match:
        con_protocolo.append({
            'registro': u['registro'],
            'nombre': u['nombre'],
            'tipo': u['tipo'],
            'total_instrumentos': len(match),
            'instrumentos': [{'documento': d['documento'], 'unidad': d['unidad'], 'fecha': d['fecha'], 'url': d['url']} for d in match]
        })
    else:
        sin_protocolo.append({
            'registro': u['registro'],
            'nombre': u['nombre'],
            'tipo': u['tipo']
        })

print(f"Total Universidades Oficiales Mineduc: {len(universidades)}")
print(f"Universidades CON instrumentos identificados: {len(con_protocolo)} ({len(con_protocolo)*100/len(universidades):.1f}%)")
print(f"Universidades SIN instrumentos públicos hallados: {len(sin_protocolo)} ({len(sin_protocolo)*100/len(universidades):.1f}%)")

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

with open(r'D:\Proyectos\P154 - brujula-ia-edusuperior\data\brecha_universidades_chile.json', 'w', encoding='utf-8') as f:
    json.dump(resultado, f, ensure_ascii=False, indent=2)

print("\nGuardado exitosamente en data/brecha_universidades_chile.json")

