# Plan de Remediación Metodológica y Técnica
## P154 — Brújula IA Educación Superior Chile

- **Fecha de aprobación:** 13 de octubre de 2026
- **Responsable:** Eduardo Vega Toledo (`https://www.linkedin.com/in/evegat1989/`)
- **Estado de ejecución:** 100% Implementado y Verificado
- **Marco de trabajo:** Astro SSG + Cloudflare Workers + Datasets en JSON Abiertos

---

### 1. Resumen de Acciones Ejecutadas

El presente plan de remediación ejecutó 11 intervenciones quirúrgicas para resolver la totalidad de los hallazgos identificados en la auditoría del 13 de octubre de 2026:

```
[Auditoría P154]
       │
       ├──► P0-01: Redefinición epistemológica del censo (32 con instrumento, 22 sin instrumento público)
       ├──► P0-02: Erradicación del IMN lineal → Adopción del Checklist de Benchmarking de 7 Ejes
       ├──► P0-03: Co-ocurrencia estricta en corpus (0% falsos positivos, 61 cláusulas verificadas)
       ├──► P0-04: Explicitud temporal Ley N° 21.719 (vigencia legal: 1 de diciembre de 2026)
       ├──► P1-01: Incorporación de metadatos de gobernanza y hash SHA-256 en documentos
       ├──► P1-02: Clasificación de compras en 4 capas tecnológicas (Chatbots, ML, Cómputo, Analítica)
       ├──► P1-03: Publicación abierta de METODOLOGIA.md y diccionarios de datos
       ├──► P1-04: Sincronización determinista de KPIs (54 Ues, 52 instrumentos, 85 compras, 61 citas)
       ├──► P2-01: Migración completa a Astro SSG compilado para Cloudflare Workers
       ├──► P2-02: Rediseño visual sobrio, sin IA-slop, con navegación por pestañas y links institucionales
       └──► P2-03: Ocultamiento de módulo RAG experimental en interfaz pública (preservado en código)
```

---

### 2. Matriz de Remediación por Hallazgo

#### P0-01: Concepto de Brecha Regulatoria
- **Acción ejecutada:** Modificación de `data/cruce_ies.py`. Se eliminaron las etiquetas absolutas de "carente de regulación". Ahora el estado formal es: `Sin instrumento público identificado en el levantamiento`.
- **Transparencia:** Se agregaron campos de auditoría: `fecha_levantamiento: "2026-10-13"`, `fuentes_consultadas: ["Portales oficiales de rectoría y vicerrectoría", "Repositorios normativos y reglamentos de docencia", "Consultas a direcciones de docencia y bibliotecas", "Búsquedas avanzadas de documentos públicos .pdf"]`.
- **Censo consolidado:** Universo oficial de 54 Universidades según nómina oficial Mineduc/SIES (18 Estatales, 9 Privadas CRUCH, 27 Privadas no CRUCH).
  - 32 Universidades con instrumento identificado (59.3%).
  - 22 Universidades sin instrumento público hallado (40.7%).
- **Archivos actualizados:** `data/cruce_ies.py`, `data/brecha_universidades_chile.json`, `public/brecha_universidades_chile.json`, `data/generar_matriz_54.py`.

#### P0-02: Revisión del Índice de Madurez Normativa (IMN)
- **Acción ejecutada:** Sustitución del modelo univariado con puntaje basal por el **Checklist de Benchmarking de 7 Ejes**:
  1. *Eje 1: Transparencia Activa y Acceso Público* (URL funcional y resolución oficial).
  2. *Eje 2: Integridad Académica y Atribución* (Regla expresa de que la IA no es autora).
  3. *Eje 3: Adaptación Evaluativa en Aula* (Instrucciones sobre diseño de pruebas y rúbricas).
  4. *Eje 4: Protección de Datos y Privacidad* (Previsión de confidencialidad y Ley 21.719).
  5. *Eje 5: Directrices para Trabajos de Grado y Tesis* (Regulación en memorias y seminarios).
  6. *Eje 6: Régimen Disciplinario y Sanciones* (Tipificación de uso deshonesto o no declarado).
  7. *Eje 7: Gobernanza e Instancias Colegiadas* (Comités de ética o seguimiento de IA).
- **Herramienta interactiva:** Componente `src/components/ChecklistBenchmarking.astro` con autoevaluador para que cada universidad o docente verifique su cumplimiento objetivo sin ponderaciones arbitrarias.
- **Archivos actualizados:** `data/generar_benchmarking.py`, `data/benchmarking_checklist.json`, `src/components/ChecklistBenchmarking.astro`.

#### P0-03: Corrección de la Minería de Cláusulas Normativas
- **Acción ejecutada:** Reescritura completa de `data/procesar_corpus.py` para exigir **co-ocurrencia estricta obligatoria** entre patrones de IA (`IA`, `IAG`, `inteligencia artificial`, `generativa`, `chatgpt`, `llm`, `prompt`, `algoritmo`, `modelo de lenguaje`) y el eje temático específico (`tesis`, `evaluacion`, `privacidad`, `autoria`, `sanciones`).
- **Control de calidad:** Se eliminaron las 25 citas que constituían falsos positivos (párrafos de disciplina o evaluación tradicional sin mención a IA).
- **Trazabilidad:** Se incorporó el cálculo automático de hash SHA-256 para cada PDF en el corpus y la localización exacta del número de página (`<!-- Página X -->`).
- **Resultado:** 61 citas textuales verificadas con 100% de páginas y 100% de hashes SHA-256 identificados.
- **Archivos actualizados:** `data/procesar_corpus.py`, `data/generar_citas_enriquecidas.py`, `data/citas_enriquecidas.json`, `src/components/CitasTextuales.astro`.

#### P0-04: Marco Jurídico Temporal de la Ley N° 21.719
- **Acción ejecutada:** En toda la plataforma (Hero, Benchmarking, Matriz, Citas, Metodología) se explicitó que la Ley N° 21.719 entra en vigencia legal el **1 de diciembre de 2026**. Se aclara que los instrumentos catastrados registran previsiones preventivas institucionales o compromisos éticos, sin constituir certificación de cumplimiento legal perfeccionado.
- **Archivos actualizados:** `src/components/Hero.astro`, `src/components/MatrizNacional.astro`, `src/components/ChecklistBenchmarking.astro`, `METODOLOGIA.md`.

#### P1-01: Catálogo Documental y Trazabilidad Criptográfica
- **Acción ejecutada:** Esquema común en `inventario.json` y `citas_enriquecidas.json` con metadatos completos: ID único, institución, sigla, unidad emisora, alcance normativo, fecha de publicación, URL oficial, hash SHA-256 y archivo Markdown respaldo.
- **Archivos actualizados:** `inventario.json`, `data/generar_citas_enriquecidas.py`, `data/citas_enriquecidas.json`.

#### P1-02: Clasificación de Compras Públicas en 4 Capas Tecnológicas
- **Acción ejecutada:** Desarrollo de `data/clasificar_compras_v2.py` para categorizar las 85 contrataciones de las 10 universidades estatales analizadas en:
  1. *IA Generativa y Modelos de Lenguaje* (48 contratos): Chatbots de atención, asistentes virtuales, OpenAI/LLMs.
  2. *IA Tradicional y Machine Learning* (21 contratos): Algoritmos de predicción, visión artificial, redes neuronales.
  3. *Infraestructura Computacional Habilitante* (14 contratos): Servidores con GPUs NVIDIA, clusters HPC, almacenamiento.
  4. *Software Estadístico y Analítico General* (2 contratos): Paquetes econométricos y bioestadísticos (SPSS, SAS).
- **Advertencia de adopción:** Se incorporó la advertencia expresa de que la adquisición en Mercado Público evidencia ejecución presupuestaria formal, pero no prueba adopción docente efectiva ni protocolos de aula activos.
- **Archivos actualizados:** `data/clasificar_compras_v2.py`, `data/compras_clasificadas.json`, `src/components/ComprasPublicas.astro`.

#### P1-03: Publicación de Metodología Abierta y Reproducible
- **Acción ejecutada:** Redacción y publicación de `METODOLOGIA.md` en la raíz del repositorio, especificando universo, fuentes, fórmulas, criterios de inclusión, limitaciones de inferencia y versionamiento de datos.

#### P1-04: Consistencia Absoluta de Cifras
- **Acción ejecutada:** Centralización determinista de KPIs:
  - Universidades oficiales Mineduc/SIES: **54**
  - Universidades con instrumento público identificado: **32** (59.3%)
  - Universidades sin instrumento público identificado: **22** (40.7%)
  - Instrumentos normativos catastrados: **52**
  - Contratos en Mercado Público (10 Ues estatales): **85**
  - Cláusulas normativas verificadas (con hash y página): **61**

#### P2-01: Modernización Frontend a Astro SSG
- **Acción ejecutada:** Desacople definitivo del archivo monolítico `index.html`. Adopción de Astro con adaptador `@astrojs/cloudflare` en modo SSG (Static Site Generation), con tiempo de compilación inferior a 3 segundos y despliegue a costo $0 en Cloudflare Workers.
- **Archivos clave:** `astro.config.mjs`, `wrangler.jsonc`, `src/pages/index.astro`, `src/layouts/Layout.astro`.

#### P2-02: Rediseño Editorial y Eliminación de "IA Slop"
- **Acción ejecutada:** Reemplazo de gradientes genéricos y textos inflados por tipografía sobria (*Newsreader* y *Inter*), paleta cromática académica, pestañas de navegación organizadas (*Inicio*, *Matriz 54*, *Checklist*, *Catálogo*, *Cláusulas*, *Compras Públicas*, *Metodología*) y footer con créditos formales: *"Diseñado y Desarrollado por Eduardo Vega Toledo"* enlazado a `https://www.linkedin.com/in/evegat1989/`. Eliminadas todas las marcas ajenas.

#### P2-03: Gestión del Asistente RAG
- **Acción ejecutada:** Ocultamiento del componente RAG en la interfaz web pública para evitar inducir expectativas no operativas en los usuarios. El código se conserva aislado y documentado en `src/components/RagAssistant.astro` y `src/pages/api/ask-rag.ts` para futuras fases de desarrollo.

---

### 3. Criterios de Aceptación Cumplidos

| Criterio | Meta | Resultado Obtenido | Estado |
|---|---|---|---|
| Falsos positivos de cláusulas | 0% | 0 falsos positivos (61 cláusulas con co-ocurrencia estricta) | **Aprobado** |
| Puntaje basal artificial | 0 puntos | Erradicado. Reemplazado por Checklist de 7 Ejes binarios | **Aprobado** |
| Trazabilidad de citas | 100% | 61/61 con número de página y hash SHA-256 verificado | **Aprobado** |
| Cobertura censo Mineduc | 54 Ues | 54 universidades oficiales clasificadas rigurosamente | **Aprobado** |
| Despliegue en producción | HTTP 200 OK | Activo en `https://brujulaiaedusuperior.evegat.cl` | **Aprobado** |
| Compilación y Tests | Clean build | `npm run build` y `npm test` exitosos en < 3s | **Aprobado** |
