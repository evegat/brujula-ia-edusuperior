import json
import re
from pathlib import Path

BASE_DIR = Path(__file__).resolve().parent.parent
DATA_DIR = BASE_DIR / "data"

with open(DATA_DIR / "clausulas_corpus.json", encoding="utf-8") as f:
    clausulas = json.load(f)

with open(BASE_DIR / "inventario.json", encoding="utf-8") as f:
    inv = json.load(f)

inv_by_id = {str(item['id']).zfill(2): item for item in inv}
inv_by_id.update({str(item['id']): item for item in inv})

citas_enriquecidas = []

for c in clausulas:
    doc_id = str(c['doc_id'])
    doc_info = inv_by_id.get(doc_id) or inv_by_id.get(doc_id.lstrip('0')) or {}
    
    archivo_pdf = c.get('archivo', f"{doc_id.zfill(2)}_{c.get('sigla', '')}.pdf")
    base_stem = archivo_pdf.replace('.pdf', '')
    archivo_md = f"{base_stem}.md"
    
    md_path = BASE_DIR / "corpus_md" / archivo_md
    md_content = md_path.read_text(encoding="utf-8") if md_path.exists() else ""
    
    for tema, citas in c.get('clausulas', {}).items():
        for cita_texto in citas:
            # 1. Extraer número de página si existe <!-- Página X --> o -X- en la misma cita
            pag_match = re.search(r'<!--\s*P[aá]gina\s*(\d+)\s*-->', cita_texto, re.IGNORECASE)
            pagina = None
            if pag_match:
                pagina = int(pag_match.group(1))
            else:
                pag_alt = re.search(r'-\s*(\d+)\s*-', cita_texto)
                if pag_alt:
                    pagina = int(pag_alt.group(1))
                    
            # 2. Si no tiene página, buscar en el contenido MD
            texto_limpio = re.sub(r'<!--\s*P[aá]gina\s*\d+\s*-->', '', cita_texto).strip()
            texto_limpio = re.sub(r'^-\d+-\s*', '', texto_limpio).strip()
            
            if pagina is None and md_content:
                # Tomar los primeros 35 caracteres para ubicar
                snippet = texto_limpio[:35].strip()
                idx = md_content.find(snippet)
                if idx != -1:
                    sub = md_content[:idx]
                    pages = re.findall(r'<!--\s*P[aá]gina\s*(\d+)\s*-->', sub, re.IGNORECASE)
                    if pages:
                        pagina = int(pages[-1])
                        
            # Si el documento tiene 1 página o es breve y no se encontró página, fijar 1
            if pagina is None:
                total_pags = c.get('paginas') or doc_info.get('paginas')
                if total_pags and total_pags <= 3:
                    pagina = 1
                elif total_pags == 1:
                    pagina = 1
                    
            citas_enriquecidas.append({
                'id': len(citas_enriquecidas) + 1,
                'doc_id': doc_id,
                'sigla': c.get('sigla') or doc_info.get('sigla', ''),
                'universidad': doc_info.get('universidad', c.get('sigla', '')),
                'documento': doc_info.get('documento', 'Documento Institucional'),
                'tema': tema,
                'pagina': pagina if pagina is not None else 1,
                'cita_raw': cita_texto,
                'cita_limpia': texto_limpio,
                'url_original': doc_info.get('url'),
                'archivo_md': archivo_md if md_content else None,
                'archivo_pdf': archivo_pdf
            })

out_file = DATA_DIR / "citas_enriquecidas.json"
with open(out_file, "w", encoding="utf-8") as f:
    json.dump(citas_enriquecidas, f, ensure_ascii=False, indent=2)

print(f"Citas enriquecidas guardadas: {len(citas_enriquecidas)} en {out_file}")
con_pagina = sum(1 for c in citas_enriquecidas if c['pagina'] is not None)
print(f"Citas con página identificada: {con_pagina}/{len(citas_enriquecidas)}")
