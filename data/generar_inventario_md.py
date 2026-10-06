import json

with open(r'D:\Proyectos\P154 - Brujula IA EduSuperior\inventario.json', encoding='utf-8') as f:
    inv = json.load(f)

with open(r'D:\Proyectos\P154 - Brujula IA EduSuperior\data\ranking_madurez_imn.json', encoding='utf-8') as f:
    imn_data = json.load(f)

imn_map = {}
for item in imn_data:
    sigla = item.get('sigla', '')
    imn_map[sigla] = item

md = [
    '# P154 — Inventario Exhaustivo de Instrumentos Normativos de IA en Educación Superior\n',
    '**Actualizado:** 2026-10-06  ',
    f'**Total instrumentos catastrados:** {len(inv)}  ',
    '**Plataforma oficial:** https://brujulaiaedusuperior.evegat.cl  ',
    '**Corpus auditado:** 17 PDFs locales convertidos a Markdown en `corpus_md/`\n',
    '---\n',
    '## 1. Tabla Resumen de Instrumentos\n',
    '| ID | Institución | Tipo | Unidad | Documento / Título | Año | Gobernanza | Enforcement | IMN (Genial) | URL |',
    '|---|---|---|---|---|---|---|---|---|---|'
]

for x in inv:
    sigla = x.get('sigla', '')
    imn_val = imn_map.get(sigla, {}).get('imn', 'N/A')
    url = x.get('url', '')
    url_link = f"[Ver enlace]({url})" if url else "No disponible"
    doc = str(x.get('documento', '')).replace('|', '-')
    uni = str(x.get('universidad', '')).replace('|', '-')
    unidad = str(x.get('unidad', '')).replace('|', '-')
    row = f"| {x.get('id')} | **{sigla}** ({uni}) | {x.get('tipo_institucion')} | {unidad} | {doc} | {x.get('fecha')} | {x.get('gobernanza')} | {x.get('enforcement')} | {imn_val} | {url_link} |"
    md.append(row)

md.append('\n---\n')
md.append('## 2. Fichas Detalladas por Instrumento\n')

for x in inv:
    sigla = x.get('sigla', '')
    imn_info = imn_map.get(sigla, {})
    imn_score = imn_info.get('imn', 'N/A')
    imn_cat = imn_info.get('categoria', 'No clasificado')
    md.append(f"### [{x.get('id')}] {x.get('sigla')} — {x.get('documento')}")
    md.append(f"- **Institución:** {x.get('universidad')} ({x.get('tipo_institucion')})")
    md.append(f"- **Unidad emisora:** {x.get('unidad')}")
    md.append(f"- **Fecha / Año:** {x.get('fecha')}")
    md.append(f"- **Alcance:** {x.get('alcance')} — *{x.get('alcance_detalle')}*")
    md.append(f"- **Modelo de gobernanza:** {x.get('gobernanza')}")
    md.append(f"- **Nivel de enforcement:** {x.get('enforcement')}")
    md.append(f"- **Índice de Madurez Normativa (IMN):** {imn_score}/100 ({imn_cat})")
    md.append(f"- **Exige declaración de uso:** {'Sí' if x.get('exige_declaracion') else 'No'}")
    md.append(f"- **Prohíbe autoría de IA:** {'Sí' if x.get('ia_no_autora') else 'No'}")
    md.append(f"- **Protección datos personales (Ley 21.719):** {'Sí' if x.get('menciona_datos_personales') else 'No'}")
    md.append(f"- **Modifica criterios de evaluación:** {'Sí' if x.get('modifica_evaluacion') else 'No'}")
    md.append(f"- **Dimensiones GENIAL (D1-D6):** D1={x.get('d1_actor')}, D2={x.get('d2_objeto')}, D3={x.get('d3_mecanismo')}, D4={x.get('d4_finalidad')}, D5={x.get('d5_enfoque')}, D6={x.get('d6_madurez')}")
    md.append(f"- **Enlace oficial:** {x.get('url')}\n")

content = '\n'.join(md)
dest = r'c:\Users\evega\OneDrive\Documents\Obsidian\MyWorld\2 - Project\P154 - Brujula IA Educacion Superior\02 - Inventario.md'
with open(dest, 'w', encoding='utf-8') as f:
    f.write(content)
print(f'Archivo escrito con exito en {dest}: {len(content)} caracteres')
