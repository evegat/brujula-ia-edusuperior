import os, json, re
import pypdf

pdf_dir = r"D:\Proyectos\P154 - Brujula IA EduSuperior\corpus_pdf"
md_dir = r"D:\Proyectos\P154 - Brujula IA EduSuperior\corpus_md"
os.makedirs(md_dir, exist_ok=True)

pdfs = [f for f in os.listdir(pdf_dir) if f.endswith(".pdf")]
print(f"Procesando {len(pdfs)} documentos...")

clausulas_corpus = []

# Patrones temáticos
temas = {
    "tesis": [r"tesis", r"memoria", r"actividad formativa equivalente", r"graduaci[oó]n", r"titulaci[oó]n"],
    "evaluacion": [r"evaluaci[oó]n", r"examen", r"prueba", r"tarea", r"r[uú]brica", r"calificaci[oó]n"],
    "privacidad": [r"datos personales", r"privacidad", r"confidencialidad", r"21\.?719", r"secreto"],
    "autoria": [r"autor[ií]a", r"co-autor", r"coautor", r"propiedad intelectual", r"derechos de autor"],
    "sanciones": [r"plagio", r"sanci[oó]n", r"falta grave", r"disciplina", r"nota m[ií]nima", r"1\.0"]
}

for pdf_name in pdfs:
    pdf_path = os.path.join(pdf_dir, pdf_name)
    doc_id = pdf_name.split("_")[0]
    sigla = pdf_name.split("_")[1].replace(".pdf", "")
    
    print(f"Extrayendo [{doc_id}] {sigla}...")
    texto_completo = []
    
    try:
        reader = pypdf.PdfReader(pdf_path)
        total_pags = len(reader.pages)
        for i, page in enumerate(reader.pages):
            t = page.extract_text() or ""
            texto_completo.append(f"<!-- Página {i+1} -->\n" + t)
            
        texto_str = "\n\n".join(texto_completo)
        
        # Guardar archivo Markdown completo
        md_file = os.path.join(md_dir, pdf_name.replace(".pdf", ".md"))
        with open(md_file, "w", encoding="utf-8") as f:
            f.write(f"# Documento Oficial: {pdf_name}\n\n" + texto_str)
            
        # Extraer cláusulas temáticas (párrafos que coinciden)
        parrafos = re.split(r"\n\s*\n", texto_str)
        citas_doc = {"doc_id": doc_id, "sigla": sigla, "archivo": pdf_name, "paginas": total_pags, "clausulas": {}}
        
        for k, patrones in temas.items():
            citas_doc["clausulas"][k] = []
            for p in parrafos:
                p_clean = " ".join(p.split())
                if len(p_clean) > 80 and len(p_clean) < 800:
                    if any(re.search(pat, p_clean, re.IGNORECASE) for pat in patrones):
                        if p_clean not in citas_doc["clausulas"][k]:
                            citas_doc["clausulas"][k].append(p_clean)
            # Limitar a las 4 mejores citas por tema
            citas_doc["clausulas"][k] = citas_doc["clausulas"][k][:4]
            
        clausulas_corpus.append(citas_doc)
        print(f"   -> OK: {total_pags} págs procesadas. Markdown guardado.")
        
    except Exception as e:
        print(f"   -> Error: {e}")

# Guardar base de cláusulas
with open(r"D:\Proyectos\P154 - Brujula IA EduSuperior\data\clausulas_corpus.json", "w", encoding="utf-8") as f:
    json.dump(clausulas_corpus, f, ensure_ascii=False, indent=2)

print("\n¡Extracción de corpus y minería de cláusulas completada con éxito!")
