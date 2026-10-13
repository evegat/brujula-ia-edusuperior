# Registro de Cambios (Changelog)
## P154 — Brújula IA Educación Superior Chile

Todas las modificaciones notables en este proyecto se documentan en este archivo, siguiendo las directrices de [Keep a Changelog](https://keepachangelog.com/es-ES/1.0.0/) y versionamiento semántico [SemVer](https://semver.org/lang/es/).

---

### [2.2.0] — 2026-10-13 (Remediación Integral de Auditoría y Rigor Metodológico)

Esta versión resuelve el 100% de los hallazgos críticos (P0) y de alta prioridad (P1) emitidos en el *Informe de Auditoría y Plan de Remediación* del 13 de octubre de 2026.

#### Modificado (Metodología y Datos)
- **Epistemología de Brecha (P0-01):** Reemplazada la etiqueta categórica "En Brecha" por la denominación formal `Sin instrumento público identificado en el levantamiento` en `cruce_ies.py` y `brecha_universidades_chile.json`. Incorporados campos de fecha de levantamiento (2026-10-13) y fuentes consultadas.
- **Erradicación del IMN y Adopción de Benchmarking (P0-02):** Eliminado el modelo lineal con sesgo basal de cortesía (+28.2 puntos artificiales). Introducido el **Checklist de Benchmarking de 7 Ejes** binarios verificables en `src/components/ChecklistBenchmarking.astro` con autoevaluador interactivo.
- **Co-ocurrencia Estricta en Corpus (P0-03):** Reescrito `data/procesar_corpus.py` para exigir co-ocurrencia obligatoria de léxico de IA (`IA`, `IAG`, `inteligencia artificial`, `generativa`, `chatgpt`, `llm`, `prompt`, `algoritmo`, `modelo de lenguaje`) con cada categoría temática. Erradicadas 25 cláusulas que constituían falsos positivos de disciplina tradicional. El corpus queda en 61 citas verificadas.
- **Marco Temporal Ley N° 21.719 (P0-04):** Explicitada la vacancia legal de la Ley N° 21.719 (vigencia obligatoria a partir del 1 de diciembre de 2026) y aclarado que las cláusulas catastradas reflejan prevención institucional interna y no certificación jurídica formal.
- **Tipología de Compras Públicas en 4 Capas (P1-02):** Reclasificados los 85 contratos de Mercado Público de las 10 universidades estatales analizadas en:
  1. *IA Generativa y Modelos de Lenguaje* (48 contratos)
  2. *IA Tradicional y Machine Learning* (21 contratos)
  3. *Infraestructura Computacional Habilitante* (14 contratos)
  4. *Software Estadístico y Analítico General* (2 contratos)
  Incorporadas reglas de inclusión, nivel de confianza y advertencia metodológica de que la compra no certifica adopción docente efectiva en aula.
- **Trazabilidad Criptográfica (P1-01):** Generado hash SHA-256 para el 100% de los documentos PDF del corpus oficial en `citas_enriquecidas.json` con indicación de número de página.

#### Agregado (Documentación y Gobernanza)
- Creados los 5 documentos de auditoría y rigor metodológico en la raíz del repositorio:
  - `AUDITORIA.md`: Diagnóstico ejecutivo y matriz de severidad.
  - `PLAN_REMEDIACION.md`: Detalle de intervenciones y criterios de aceptación.
  - `METODOLOGIA.md`: Protocolo de observación, fuentes, universo y fórmulas.
  - `CHANGELOG.md`: Trazabilidad histórica de versiones.
  - `VALIDACION.md`: Informe de pruebas y verificación técnica.

#### Modificado (Frontend y Experiencia de Usuario)
- Centralizados los créditos institucionales: *"Diseñado y Desarrollado por Eduardo Vega Toledo"* con enlace directo a LinkedIn (`https://www.linkedin.com/in/evegat1989/`).
- Eliminadas todas las menciones a marcas externas no vinculadas (InnCívica, Bastidor).
- Navegación optimizada por pestañas limpias (*Inicio*, *Matriz 54*, *Checklist*, *Catálogo*, *Cláusulas*, *Compras Públicas*, *Metodología*).
- Ocultado el módulo RAG experimental en la vista pública, preservando el código serverless para futuros desarrollos.

---

### [2.1.0] — 2026-10-13 (Salto a Astro SSG y Matriz Nacional)
- Migración completa de arquitectura monolítica a **Astro SSG** con `@astrojs/cloudflare` en `dist/`.
- Construcción de la **Matriz Nacional de las 54 Universidades** oficiales en Chile (`src/components/MatrizNacional.astro`).
- Incorporación del modal de crowdsourcing ciudadano (`src/components/ModalCrowdsourcing.astro`).
- Adopción de diseño editorial con tipografía *Newsreader* y *Inter*.

---

### [1.0.0] — 2026-10-04 (Lanzamiento Inicial)
- Compilación inicial mediante scripts de inyección en Python (`compilar_web_v3.py`, `index.html`).
- Levantamiento preliminar de 52 instrumentos normativos y 85 contratos de software.
- Creación del Índice de Madurez Normativa (IMN) preliminar v1.
