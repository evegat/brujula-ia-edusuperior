import json
import re
from pathlib import Path

BASE_DIR = Path(__file__).resolve().parent.parent
DATA_DIR = BASE_DIR / "data"
PUBLIC_DIR = BASE_DIR / "public"

with open(DATA_DIR / "compras_clasificadas.json", encoding="utf-8") as f:
    compras = json.load(f)

# Clasificador riguroso en 4 capas tecnológicas según P1-02
# 1. IA Generativa y Modelos de Lenguaje
# 2. IA Tradicional y Machine Learning
# 3. Infraestructura Computacional Habilitante
# 4. Software Estadístico y Analítico General

def clasificar_tecnologia(c):
    nombre = (c.get("nombre") or "").lower()
    desc = (c.get("descripcion") or "").lower()
    capa_f = c.get("capa_funcional", "")
    subcat = c.get("subcategoria", "")
    texto = f"{nombre} {desc}"

    # 1. Infraestructura Computacional Habilitante
    if capa_f == "Infraestructura_Computo" or any(w in texto for w in ["servidor", "gpu", "cluster", "supercómputo", "hpc", "computo", "nvidia", "storage"]):
        return {
            "categoria_tecnologica": "Infraestructura Computacional Habilitante",
            "categoria_corta": "Infraestructura & GPU",
            "confianza": "Alta",
            "regla_inclusion": "Hardware de cómputo de alto rendimiento o servidores dedicados a procesamiento de datos y modelos computacionales."
        }

    # 2. Software Estadístico y Analítico General
    # SPSS, SAS, Stata, NVivo, Minitab, Tableau, etc.
    if any(w in texto for w in ["spss", "stata", "minitab", "sas ", "nvivo", "atlas.ti", "tableau", "power bi"]) and not any(w in texto for w in ["chatbot", "gpt", "generativ"]):
        return {
            "categoria_tecnologica": "Software Estadístico y Analítico General",
            "categoria_corta": "Analítica General & Bioestadística",
            "confianza": "Alta",
            "regla_inclusion": "Paquete de software analítico, econométrico o bioestadístico tradicional utilizado para investigación o docencia."
        }

    # 3. IA Generativa y Modelos de Lenguaje (Chatbots, Agentes, LLMs, OpenAI, NLP moderno)
    if any(w in texto for w in ["chatbot", "chat bot", "ejecutivo en linea", "asistente virtual", "gpt", "generativ", "llm", "conversacional"]):
        return {
            "categoria_tecnologica": "IA Generativa y Modelos de Lenguaje",
            "categoria_corta": "IA Generativa & Chatbots",
            "confianza": "Alta",
            "regla_inclusion": "Sistemas conversacionales automatizados, agentes de atención virtual o modelos de lenguaje natural integrados a servicios institucionales."
        }

    # 4. IA Tradicional y Machine Learning (Algoritmos predictivos, visión computacional, redes neuronales clásicas, minería de datos)
    if any(w in texto for w in ["machine learning", "aprendizaje automatico", "redes neuronales", "vision", "reconocimiento facial", "mineria de datos", "inteligencia artificial"]):
        return {
            "categoria_tecnologica": "IA Tradicional y Machine Learning",
            "categoria_corta": "Machine Learning Tradicional",
            "confianza": "Alta",
            "regla_inclusion": "Solución algorítmica de aprendizaje automático, clasificación predictiva o visión computacional aplicada."
        }

    # Default a Machine Learning o Analítica según subcategoría previa
    if subcat == "NLP_Vision_LLM":
        return {
            "categoria_tecnologica": "IA Generativa y Modelos de Lenguaje",
            "categoria_corta": "IA Generativa & NLP",
            "confianza": "Media",
            "regla_inclusion": "Solución de procesamiento de lenguaje natural clasificada en el censo original."
        }
    else:
        return {
            "categoria_tecnologica": "IA Tradicional y Machine Learning",
            "categoria_corta": "Machine Learning Tradicional",
            "confianza": "Media",
            "regla_inclusion": "Herramienta algorítmica o de modelamiento clasificada en el censo original."
        }

compras_actualizadas = []
for idx, c in enumerate(compras):
    clasif = clasificar_tecnologia(c)
    
    # Asegurar enlace seguro https si aplica
    link = c.get("link", "")
    if link.startswith("http://www.mercadopublico.cl"):
        link = link.replace("http://www.mercadopublico.cl", "https://www.mercadopublico.cl")
        
    c_nueva = {
        "id_compra": idx + 1,
        "universidad": c["universidad"],
        "nombre": c.get("nombre", "Adquisición Tecnológica"),
        "descripcion": c.get("descripcion", ""),
        "monto": c.get("monto", 0),
        "proveedor": c.get("proveedor", "No informado"),
        "fecha": c.get("fecha", ""),
        "link": link,
        "subcategoria": c.get("subcategoria", ""),
        "capa_funcional": c.get("capa_funcional", ""),
        "tipo_uso": c.get("tipo_uso", ""),
        "categoria_tecnologica": clasif["categoria_tecnologica"],
        "categoria_corta": clasif["categoria_corta"],
        "confianza_clasificacion": clasif["confianza"],
        "regla_inclusion": clasif["regla_inclusion"],
        "advertencia_metodologica": "La contratación tecnológica en Mercado Público evidencia inversión presupuestaria en planteles estatales, pero no certifica adopción docente efectiva ni protocolos de aula activos."
    }
    compras_actualizadas.append(c_nueva)

# Guardar en data/ y public/
with open(DATA_DIR / "compras_clasificadas.json", "w", encoding="utf-8") as f:
    json.dump(compras_actualizadas, f, ensure_ascii=False, indent=2)

if PUBLIC_DIR.exists():
    with open(PUBLIC_DIR / "compras_clasificadas.json", "w", encoding="utf-8") as f:
        json.dump(compras_actualizadas, f, ensure_ascii=False, indent=2)

print(f"Total compras procesadas: {len(compras_actualizadas)}")
resumen = {}
for c in compras_actualizadas:
    cat = c["categoria_tecnologica"]
    resumen[cat] = resumen.get(cat, 0) + 1

for cat, count in resumen.items():
    print(f" - {cat}: {count} contratos")
