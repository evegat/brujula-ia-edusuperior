import json

with open(r"D:\Proyectos\P154 - Brujula IA EduSuperior\inventario.json", "r", encoding="utf-8") as f:
    inventario = json.load(f)

# Agrupar por universidad
por_u = {}
for item in inventario:
    u = item["universidad"]
    if u not in por_u:
        por_u[u] = []
    por_u[u].append(item)

ranking_madurez = []

for u, docs in por_u.items():
    # Calcular subíndices normalizados (0-100)
    # S1: Fuerza jurídica (Decreto=100, Reglamento=80, Política=60, Guía=40)
    max_fuerza = 40
    for d in docs:
        enf = d.get("enforcement", "").lower()
        if "decreto" in enf or "resolución" in enf:
            max_fuerza = max(max_fuerza, 100)
        elif "reglamento" in enf or "política institucional" in enf:
            max_fuerza = max(max_fuerza, 80)
        elif "instructivo" in enf:
            max_fuerza = max(max_fuerza, 70)
        elif "guía" in enf or "orientaciones" in enf:
            max_fuerza = max(max_fuerza, 50)
            
    # S2: Transparencia (Exigencia de declaración de uso)
    s2 = 100 if any(d.get("exige_declaracion") for d in docs) else 30
    
    # S3: Regla de autoría (IA no es autora)
    s3 = 100 if any(d.get("ia_no_autora") for d in docs) else 20
    
    # S4: Privacidad y Protección de Datos (Ley 21.719)
    s4 = 100 if any(d.get("menciona_datos_personales") for d in docs) else 20
    
    # S5: Impacto en Evaluación y Aprendizaje Auténtico
    s5 = 100 if any(d.get("modifica_evaluacion") for d in docs) else 30
    
    # S6: Gobernanza Viva (Revisión periódica / Comité)
    s6 = 100 if any(d.get("revision_periodica") for d in docs) else 25
    
    # IMN ponderado (según escenario E2 de referencia GENIAL)
    imn = round(0.20 * max_fuerza + 0.20 * s2 + 0.15 * s3 + 0.15 * s4 + 0.15 * s5 + 0.15 * s6, 1)
    
    # Nivel de madurez cualitativo
    if imn >= 75:
        categoria = "Madurez Avanzada"
    elif imn >= 55:
        categoria = "Madurez Intermedia"
    else:
        categoria = "Regulación Inicial"
        
    ranking_madurez.append({
        "universidad": u,
        "sigla": docs[0].get("sigla", ""),
        "tipo": docs[0].get("tipo_institucion", ""),
        "total_docs": len(docs),
        "imn": imn,
        "categoria": categoria,
        "subindices": {
            "fuerza_juridica": max_fuerza,
            "transparencia": s2,
            "autoria": s3,
            "privacidad": s4,
            "evaluacion": s5,
            "gobernanza": s6
        }
    })

ranking_madurez.sort(key=lambda x: x["imn"], reverse=True)

with open(r"D:\Proyectos\P154 - Brujula IA EduSuperior\data\ranking_madurez_imn.json", "w", encoding="utf-8") as f:
    json.dump(ranking_madurez, f, ensure_ascii=False, indent=2)

print(f"IMN calculado para {len(ranking_madurez)} instituciones.")
print("\nTop 5 Madurez Normativa en Chile:")
for r in ranking_madurez[:5]:
    print(f"  #{r['sigla']} - {r['universidad']}: IMN {r['imn']}/100 ({r['categoria']})")
