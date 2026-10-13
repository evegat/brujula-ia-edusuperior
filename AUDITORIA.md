# Informe de Auditoría Metodológica y Técnica
## P154 — Brújula IA Educación Superior Chile

- **Fecha de auditoría:** 13 de octubre de 2026
- **Versión evaluada:** v1.0.0 (sitio público monolítico) y v2.0.0 (prototipo de migración)
- **Repositorio:** `https://github.com/evegat/brujula-ia-edusuperior`
- **Sitio público:** `https://brujulaiaedusuperior.evegat.cl/`
- **Auditor / Responsable técnico:** Eduardo Vega Toledo (Diseñador, Desarrollador e Investigador Principal)
- **Ámbito:** Gobernanza universitaria, minería de datos normativos, compras públicas en Mercado Público y arquitectura web serverless.

---

### 1. Diagnóstico Ejecutivo

La plataforma *Brújula IA Educación Superior Chile* nació como un observatorio empírico pionero para catastrar y analizar la respuesta regulatoria de las instituciones de educación superior en Chile frente a la irrupción de la inteligencia artificial generativa. 

No obstante su indudable valor de política pública, la auditoría integral identificó riesgos metodológicos y técnicos que debían ser subsanados para garantizar su rigor como referencia académica e institucional:

1. **Confusión epistemológica en la brecha regulatoria:** Asumir que la no localización de documentos en portales públicos equivalía a una ausencia real de directrices institucionales internas.
2. **Sesgo positivo y basal en el Índice de Madurez Normativa (IMN):** El modelo lineal ponderado asignaba hasta 28,2 puntos sobre 100 a instituciones sin evidencia positiva en subíndices específicos.
3. **Falsos positivos en la minería de cláusulas normativas:** Clasificación temática basada en palabras clave aisladas (`evaluación`, `sanción`, `disciplina`) que capturaba fragmentos de reglamentos de docencia tradicionales sin relación alguna con IA.
4. **Heterogeneidad conceptual en compras públicas:** Agrupación indiscriminada de software analítico tradicional (SPSS de 2009), servidores y chatbots bajo el rótulo genérico de "IA", e inferencia equívoca de adopción docente a partir de una orden de compra.
5. **Ambigüedad temporal respecto a la Ley N° 21.719:** Asunción de cumplimiento de una ley de protección de datos cuya vigencia formal rige a contar del 1 de diciembre de 2026.
6. **Mantenibilidad y arquitectura web:** Coexistencia de scripts generadores de HTML monolítico, rutas absolutas en entornos Windows y assets no versionados.

---

### 2. Matriz de Hallazgos y Calificación de Severidad

| Código | Hallazgo | Severidad | Estado Post-Auditoría |
|---|---|---|---|
| **P0-01** | Confusión entre ausencia de documento público y ausencia de regulación efectiva. | **Crítico (P0)** | **SUBSANADO** |
| **P0-02** | Asignación de puntaje positivo sin evidencia en el Índice de Madurez Normativa (IMN). | **Crítico (P0)** | **SUBSANADO** |
| **P0-03** | Clasificación de cláusulas con patrones laxos y falsos positivos temáticos. | **Crítico (P0)** | **SUBSANADO** |
| **P0-04** | Falta de distinción temporal y jurídica en privacidad (Ley N° 21.719, dic 2026). | **Crítico (P0)** | **SUBSANADO** |
| **P1-01** | Catálogo documental heterogéneo y sin trazabilidad criptográfica (SHA-256). | **Alto (P1)** | **SUBSANADO** |
| **P1-02** | Compras públicas sin desglose tecnológico ni advertencia de adopción real. | **Alto (P1)** | **SUBSANADO** |
| **P1-03** | Metodología no publicada de forma abierta, reproducible y versionada. | **Alto (P1)** | **SUBSANADO** |
| **P1-04** | Inconsistencia de cifras y KPIs entre componentes visuales y datasets. | **Alto (P1)** | **SUBSANADO** |
| **P2-01** | Arquitectura híbrida frágil con generación de HTML monolítico y rutas absolutas. | **Medio (P2)** | **SUBSANADO** |
| **P2-02** | Usabilidad móvil deficiente y sobrecarga visual en Hero (*IA slop*). | **Medio (P2)** | **SUBSANADO** |
| **P2-03** | Dependencia no operativa de asistente RAG en interfaz pública. | **Medio (P2)** | **SUBSANADO** |

---

### 3. Detalle de Hallazgos Críticos

#### P0-01: Redefinición del Concepto de Brecha
- **Diagnóstico original:** `cruce_ies.py` calificaba categóricamente como "En Brecha" a cualquier universidad que no tuviera un PDF en el repositorio.
- **Riesgo:** Injusticia reputacional hacia universidades que poseen normativas internas en intranets privadas o que se encontraban en proceso de elaboración no publicado.
- **Dictamen:** Es metodológicamente imperativo sustituir la categoría punitiva por la etiqueta descriptiva: `Sin instrumento público identificado en el levantamiento`, transparentando la fecha de corte (octubre 2026) y las fuentes de levantamiento.

#### P0-02: Erradicación del IMN y Adopción de Benchmarking Multieje
- **Diagnóstico original:** El algoritmo de `calcular_imn.py` calculaba:
  $$IMN = 0.20 \cdot S_1 + 0.20 \cdot S_2 + 0.15 \cdot S_3 + 0.15 \cdot S_4 + 0.15 \cdot S_5 + 0.15 \cdot S_6$$
  donde cada subíndice otorgaba puntuaciones basales de cortesía que inflaban instituciones sin evidencia demostrada.
- **Riesgo:** Producción de un ranking engañoso carente de sustento psicométrico o validación externa.
- **Dictamen:** Retirar el ranking ordinal y sustituirlo por una matriz multidimensional de **Benchmarking de 7 Ejes** verificables (1 si existe evidencia comprobada, 0 si no se identifica evidencia pública), permitiendo la autoevaluación institucional interactiva y objetiva.

#### P0-03: Co-ocurrencia Estricta en Minería de Cláusulas
- **Diagnóstico original:** Búsqueda regex en párrafos (`procesar_corpus.py`) de palabras como `plagio` o `examen`. Resultó en que 25 de 87 cláusulas (28.7%) correspondían a reglamentos disciplinarios generales sin mención a inteligencia artificial.
- **Dictamen:** Implementar filtro determinista de co-ocurrencia obligatoria: para pertenecer a cualquier dimensión temática, el fragmento DEBE contener explícitamente términos del léxico de IA (`IA`, `IAG`, `inteligencia artificial`, `generativa`, `chatgpt`, `llm`, `prompt`, `algoritmo`, `modelo de lenguaje`).

#### P0-04: Marco Jurídico Temporal de la Ley N° 21.719
- **Diagnóstico original:** Se asumía que una mención a datos personales implicaba "cumplimiento" de la Ley N° 21.719.
- **Dictamen:** Aclarar expresamente en la interfaz y en los metadatos que la Ley N° 21.719 entra en vigor legal obligatorio el **1 de diciembre de 2026**. Los instrumentos actuales constituyen únicamente previsiones preventivas de política institucional interna.

---

### 4. Conclusión de la Auditoría

La auditoría concluye que el valor fundamental de la plataforma radica en su **evidencia empírica abierta**. La remediación técnica y metodológica aplicada en la versión 2.2.0 subsana el 100% de los hallazgos críticos (P0) y altos (P1), transformando *Brújula IA Educación Superior* en un observatorio científico robusto, verificable y reproducible.
