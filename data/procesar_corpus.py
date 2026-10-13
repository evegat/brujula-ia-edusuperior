import os
import json
import re
from pathlib import Path
import pypdf

BASE_DIR = Path(__file__).resolve().parent.parent
PDF_DIR = BASE_DIR / "corpus_pdf"
MD_DIR = BASE_DIR / "corpus_md"
MD_DIR.mkdir(parents=True, exist_ok=True)

# Co-ocurrencia OBLIGATORIA de IA para evitar falsos positivos
PATRON_IA_OBLIGATORIO = re.compile(
    r"\bIA\b|\bIAG\b|inteligencia\s+artificial|generativ[ao]s?|chatgpt|\bllm\b|prompts?|"
    r"modelos?\s+de\s+lenguaje|herramientas?\s+de\s+ia|sistemas?\s+de\s+ia",
    re.IGNORECASE
)

# Patrones temáticos estrictos y contextualmente calificados
TEMAS = {
    "tesis": [
        r"\btesis\b",
        r"\bmemoria\b",
        r"actividad\s+formativa\s+equivalente",
        r"graduaci[oó]n",
        r"titulaci[oó]n",
        r"seminario\s+de\s+t[ií]tulo"
    ],
    "evaluacion": [
        r"evaluaci[oó]n(?:es)?",
        r"\bexamen(?:es)?\b",
        r"\bpruebas?\b",
        r"\btareas?\b",
        r"\br[uú]bricas?\b",
        r"calificaci[oó]n(?:es)?"
    ],
    "privacidad": [
        r"datos\s+personales",
        r"\bprivacidad\b",
        r"confidencialidad",
        r"21\.?719",
        r"secreto\s+profesional",
        r"protecci[oó]n\s+de\s+datos"
    ],
    "autoria": [
        r"autor[ií]a",
        r"co-?autor(?:[ií]a)?",
        r"propiedad\s+intelectual",
        r"derechos?\s+de\s+autor",
        r"atribuci[oó]n"
    ],
    "sanciones": [
        r"\bplagio\b",
        r"sanci[oó]n(?:es)?",
        r"falta\s+grave",
        r"falta\s+disciplinaria",
        r"deshonestidad\s+acad[eé]mica",
        r"infracci[oó]n",
        r"procedimiento\s+disciplinario",
        r"suspensi[oó]n"
    ]
}

pdfs = sorted([f for f in os.listdir(PDF_DIR) if f.endswith(".pdf")])
print(f"Procesando {len(pdfs)} documentos del corpus oficial...")

clausulas_corpus = []

for pdf_name in pdfs:
    pdf_path = PDF_DIR / pdf_name
    doc_id = pdf_name.split("_")[0]
    sigla = pdf_name.split("_")[1].replace(".pdf", "")
    
    print(f"Extrayendo [{doc_id}] {sigla}...")
    texto_completo = []
    
    try:
        reader = pypdf.PdfReader(str(pdf_path))
        total_pags = len(reader.pages)
        for i, page in enumerate(reader.pages):
            t = page.extract_text() or ""
            texto_completo.append(f"<!-- Página {i+1} -->\n" + t)
            
        texto_str = "\n\n".join(texto_completo)
        
        # Guardar archivo Markdown completo
        md_file = MD_DIR / pdf_name.replace(".pdf", ".md")
        with open(md_file, "w", encoding="utf-8") as f:
            f.write(f"# Documento Oficial: {pdf_name}\n\n" + texto_str)
            
        # Extraer cláusulas temáticas (párrafos que coinciden estrictamente)
        parrafos = re.split(r"\n\s*\n", texto_str)
        citas_doc = {
            "doc_id": doc_id,
            "sigla": sigla,
            "archivo": pdf_name,
            "paginas": total_pags,
            "clausulas": {}
        }
        
        for k, patrones in TEMAS.items():
            citas_doc["clausulas"][k] = []
            for p in parrafos:
                p_clean = " ".join(p.split())
                # Regla de longitud: párrafos sustantivos
                if 80 < len(p_clean) < 900:
                    # REGLA METODOLÓGICA P0-03:
                    # Debe contener simultáneamente:
                    # 1) Mención explícita a IA / LLM / algoritmos generativos
                    # 2) Mención específica al patrón temático
                    match_ia = PATRON_IA_OBLIGATORIO.search(p_clean)
                    if match_ia and any(re.search(pat, p_clean, re.IGNORECASE) for pat in patrones):
                        if p_clean not in citas_doc["clausulas"][k]:
                            citas_doc["clausulas"][k].append(p_clean)
                            
            # Limitar a las 4 mejores citas representativas por tema
            citas_doc["clausulas"][k] = citas_doc["clausulas"][k][:4]
            
        clausulas_corpus.append(citas_doc)
        total_citas_encontradas = sum(len(v) for v in citas_doc["clausulas"].values())
        print(f"   -> OK: {total_pags} págs procesadas. {total_citas_encontradas} cláusulas de IA válidas.")
        
    except Exception as e:
        print(f"   -> Error procesando {pdf_name}: {e}")

# Guardar base de cláusulas filtradas
out_corpus = BASE_DIR / "data" / "clausulas_corpus.json"
with open(out_corpus, "w", encoding="utf-8") as f:
    json.dump(clausulas_corpus, f, ensure_ascii=False, indent=2)

print(f"\n¡Extracción y auditoría de cláusulas completada! Guardado en {out_corpus}")
