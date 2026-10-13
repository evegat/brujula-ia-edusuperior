import json

with open(r'D:\Proyectos\P154 - Brujula IA EduSuperior\inventario.json', 'r', encoding='utf-8') as f:
    inventario = json.load(f)

# Agrupar instrumentos por institución
por_u = {}
for item in inventario:
    u = item['universidad']
    if u not in por_u:
        por_u[u] = []
    por_u[u].append(item)

checklist_data = []

for u, docs in sorted(por_u.items()):
    c_fuerza = any('decreto' in d.get('enforcement', '').lower() or 'resoluci' in d.get('enforcement', '').lower() or 'reglamento' in d.get('enforcement', '').lower() for d in docs)
    c_decl = any(d.get('exige_declaracion') for d in docs)
    c_aut = any(d.get('ia_no_autora') for d in docs)
    c_priv = any(d.get('menciona_datos_personales') for d in docs)
    c_eval = any(d.get('modifica_evaluacion') for d in docs)
    c_tesis = any('tesis' in d.get('documento', '').lower() or 'tesis' in d.get('alcance_detalle', '').lower() for d in docs)
    c_gob = any(d.get('revision_periodica') for d in docs)

    ejes = [
        {"id": "fuerza", "nombre": "Fuerza Jurídica Formal", "descripcion": "Decreto, resolución o reglamento formal", "cumple": c_fuerza},
        {"id": "declaracion", "nombre": "Declaración de Uso", "descripcion": "Exige transparentar el uso de IA y prompts", "cumple": c_decl},
        {"id": "autoria", "nombre": "Regla de Autoría", "descripcion": "Prohíbe atribuir autoría o propiedad a la IA", "cumple": c_aut},
        {"id": "privacidad", "nombre": "Privacidad Ley 21.719", "descripcion": "Resguardo de datos personales y confidencialidad", "cumple": c_priv},
        {"id": "evaluacion", "nombre": "Rediseño Evaluativo", "descripcion": "Adaptación de pautas y evaluación auténtica", "cumple": c_eval},
        {"id": "tesis", "nombre": "Directrices en Tesis", "descripcion": "Regulación específica para memorias y grado", "cumple": c_tesis},
        {"id": "gobernanza", "nombre": "Gobernanza Viva", "descripcion": "Comité de seguimiento o revisión periódica", "cumple": c_gob}
    ]

    total_cumplidos = sum(1 for e in ejes if e['cumple'])
    sigla = docs[0].get('sigla', u)
    tipo = docs[0].get('tipo_institucion', '')

    checklist_data.append({
        "universidad": u,
        "sigla": sigla,
        "tipo": tipo,
        "total_docs": len(docs),
        "total_ejes": total_cumplidos,
        "max_ejes": len(ejes),
        "porcentaje_adopcion": round((total_cumplidos / len(ejes)) * 100, 1),
        "ejes": ejes,
        "documentos": [{"id": d["id"], "titulo": d["documento"], "url": d.get("url")} for d in docs]
    })

# Ordenar alfabéticamente por nombre de institución para evitar un ranking punitivo
checklist_data.sort(key=lambda x: x["universidad"])

with open(r'D:\Proyectos\P154 - Brujula IA EduSuperior\data\benchmarking_checklist.json', 'w', encoding='utf-8') as f:
    json.dump(checklist_data, f, ensure_ascii=False, indent=2)

with open(r'D:\Proyectos\P154 - Brujula IA EduSuperior\public\benchmarking_checklist.json', 'w', encoding='utf-8') as f:
    json.dump(checklist_data, f, ensure_ascii=False, indent=2)

print(f"Dataset de benchmarking generado con éxito para {len(checklist_data)} instituciones.")
