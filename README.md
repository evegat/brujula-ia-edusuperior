# 🧭 Brújula IA: Educación Superior Chile

> **Observatorio abierto sobre gobernanza, instrumentos normativos y compras públicas de Inteligencia Artificial en las universidades chilenas.**

[![Sitio Oficial](https://img.shields.io/badge/Sitio_Oficial-brujulaiaedusuperior.evegat.cl-blue?style=flat-square)](https://brujulaiaedusuperior.evegat.cl)
[![Versión](https://img.shields.io/badge/Versi%C3%B3n-2.2.0-emerald?style=flat-square)](CHANGELOG.md)
[![Licencia Datos](https://img.shields.io/badge/Datos-CC_BY_4.0-amber?style=flat-square)](https://creativecommons.org/licenses/by/4.0/)
[![Tests](https://img.shields.io/badge/Tests-100%25_PASS-success?style=flat-square)](VALIDACION.md)
[![Despliegue](https://img.shields.io/badge/Cloudflare_Workers-$0_cost-orange?style=flat-square)](https://workers.cloudflare.com)

---

## 📌 Propósito y Alcance

**Brújula IA Educación Superior Chile** es una iniciativa de investigación independiente y ciencia de datos abierta diseñada y desarrollada por [Eduardo Vega Toledo](https://www.linkedin.com/in/evegat1989/). Su objetivo es catastrar, clasificar, auditar y poner a disposición pública los instrumentos de gobernanza, directrices pedagógicas y decisiones de inversión tecnológica vinculadas a la inteligencia artificial en el sistema universitario chileno.

A diferencia de aproximaciones abstractas o declarativas, la plataforma se basa en **evidencia empírica verificable**: resoluciones oficiales de rectoría, decretos académicos, circulares docentes, licitaciones de ChileCompra y fragmentos literales de reglamentos contrastados con hashes criptográficos.

---

## 🏛️ Universo Institucional de Estudio

El universo de observación comprende el **100% de las 54 universidades legalmente constituidas y vigentes en Chile** según la nómina oficial del Servicio de Información de Educación Superior (SIES) del Ministerio de Educación (Mineduc, corte mayo 2026):

| Segmento Institucional | Cantidad | Con Instrumento Identificado | Sin Instrumento Público Identificado |
|---|---:|---:|---:|
| **Universidades Estatales (CUECH)** | 18 | 8 (44.4%) | 10 (55.6%) |
| **Universidades Privadas CRUCH (G9)** | 9 | 7 (77.8%) | 2 (22.2%) |
| **Universidades Privadas no CRUCH** | 27 | 17 (63.0%) | 10 (37.0%) |
| **Total Universo Oficial SIES** | **54** | **32 (59.3%)** | **22 (40.7%)** |

> *Principio Epistemológico:* La no localización de documentos en canales abiertos describe el resultado del barrido público y en ningún caso constituye declaración de inexistencia institucional o falta de regulación interna. Se declara estrictamente: **«Sin instrumento público identificado en el levantamiento»**.

---

## 🚀 Funcionalidades Principales

### 1. 🏛️ Matriz Nacional de las 54 Universidades
- Ficha individual para cada plantel universitario con semáforo en 6 dimensiones:
  1. *Protocolo de Aula*
  2. *Directriz de Tesis y Graduación*
  3. *Regla de Autoría (IA no es autora moral/legal)*
  4. *Previsión de Privacidad (Ley N° 21.719)*
  5. *Rediseño Evaluativo*
  6. *Compras de IA registradas en Mercado Público*
- **Filtros Ortogonales e Independientes:** Permite cruzar segmento institucional con estado documental (e.g. ver *Estatales con instrumento* vs *Estatales sin instrumento público*).

### 2. 📊 Planilla Interactiva de Chequeo Institucional
- Tabla interactiva de cotejo tipo hoja de cálculo con checks ✓ y ○ por cada universidad.
- Conteo de dimensiones formativas identificadas (sobre 5).
- Buscador en tiempo real y botón de **exportación directa a CSV** (`planilla_chequeo_ia_universidades_chile.csv`) para análisis en Excel o R.

### 3. 📋 Checklist de Gobernanza y Adopción (7 Ejes)
- Autoevaluador interactivo para que autoridades, docentes y estudiantes verifiquen el estado de madurez de su propia facultad o institución frente a 7 ejes normativos clave.

### 4. 📚 Catálogo Documental & Buscador de Citas Textuales
- Catálogo de 52 instrumentos institucionales respaldados.
- Buscador de **61 cláusulas normativas textuales** con 100% de trazabilidad: número de página verificado, enlace al PDF original, respaldo Markdown abierto y hash SHA-256 verificado.
- **Cero Falsos Positivos:** Filtro estricto de co-ocurrencia semántica entre léxico de IA y eje temático.

### 5. 💰 Compras Públicas en Universidades Estatales (2020–2026)
- Monitoreo de 85 contrataciones de las 10 universidades del Estado compradoras en Mercado Público (ChileCompra).
- Clasificación en **4 capas tecnológicas**:
  1. *IA Generativa y Modelos de Lenguaje* (48 contratos)
  2. *IA Tradicional y Machine Learning* (21 contratos)
  3. *Infraestructura Computacional Habilitante / GPUs* (14 contratos)
  4. *Software Estadístico y Analítico General* (2 contratos)
- Advertencia metodológica explícita: la adquisición de software no acredita adopción docente efectiva ni protocolos de aula activos.

### 6. 📖 Metodología, Universo SIES y Control de Versiones
- Documentación pública y pedagógica sobre cómo se obtuvieron los datos, el universo oficial, el changelog histórico (v1.0 a v2.2) y el protocolo continuo de crowdsourcing.

---

## 📑 Suite Documental de Auditoría Metodológica

El proyecto cuenta con 5 documentos formales de auditoría en la raíz del repositorio:

| Documento | Descripción |
|---|---|
| [**AUDITORIA.md**](AUDITORIA.md) | Diagnóstico ejecutivo, riesgos epistemológicos subsanados y matriz de severidad de hallazgos (P0-01 a P2-03). |
| [**PLAN_REMEDIACION.md**](PLAN_REMEDIACION.md) | Detalle de las 11 intervenciones quirúrgicas ejecutadas y criterios de aceptación verificados. |
| [**METODOLOGIA.md**](METODOLOGIA.md) | Marco epistemológico completo, universo SIES, fórmulas, reglas de co-ocurrencia y marco temporal de la Ley N° 21.719 (vigencia diciembre 2026). |
| [**CHANGELOG.md**](CHANGELOG.md) | Registro histórico cronológico de versiones bajo estándar *Keep a Changelog* (v1.0 a v2.2). |
| [**VALIDACION.md**](VALIDACION.md) | Informe de verificación empírica con evidencias de tests unitarios, adversarios y de compilación. |

---

## 🛠️ Stack Tecnológico y Arquitectura

- **Framework Web:** [Astro 7.3.8](https://astro.build/) en modo Static Site Generation (SSG).
- **Despliegue & Hosting:** [Cloudflare Workers & Static Assets](https://workers.cloudflare.com/) (costo $0 USD/mes).
- **Tipografía y Estilo:** *Newsreader* (Serif académica) e *Inter* (Sans-serif), con diseño editorial sobrio sin *IA-slop* y soporte de tema claro/oscuro persistente.
- **Micro-Backend Serverless:** Endpoints en `/api/subscribe`, `/api/contact` y `/api/submit-normativa` con validación estricta y cabeceras de seguridad.
- **Datasets Abiertos:** Archivos JSON estructurados disponibles para descarga directa en `/public`:
  - `matriz_54_universidades.json`
  - `brecha_universidades_chile.json`
  - `benchmarking_checklist.json`
  - `citas_enriquecidas.json`
  - `compras_clasificadas.json`
  - `inventario.json`

---

## 💻 Desarrollo Local y Pruebas

### Requisitos
- Node.js >= 20.0.0
- npm >= 10.0.0
- Python >= 3.10 (para regeneración de datasets normativos)

### Instalación
```bash
# Clonar repositorio
git clone https://github.com/evegat/brujula-ia-edusuperior.git
cd brujula-ia-edusuperior

# Instalar dependencias
npm install
```

### Ejecución en Desarrollo
```bash
npm run dev
# Servidor local en http://localhost:4321
```

### Batería de Pruebas Automatizadas
```bash
npm test
# Ejecuta secuencialmente:
# 1. scripts/test-api.mjs (Validación de endpoints serverless)
# 2. scripts/verify-all.mjs (Invariantes de datos, censo 54 y compras)
# 3. scripts/test-adversarial.mjs (Pruebas de estrés, XSS, rate limit y accesibilidad)
```

### Compilación y Despliegue
```bash
# Compilar producción (SSG)
npm run build

# Desplegar a Cloudflare Workers
npx wrangler deploy
```

---

## 👤 Autoría y Créditos

- **Diseño, Desarrollo e Investigación:** [Eduardo Vega Toledo](https://www.linkedin.com/in/evegat1989/)
- **Sitio Personal:** [evegat.cl](https://evegat.cl)
- **Contacto:** `eduardo@evegat.cl`

---

## 📄 Licencia

- **Datos y Contenidos:** [Creative Commons Atribución 4.0 Internacional (CC BY 4.0)](https://creativecommons.org/licenses/by/4.0/).
- **Código Fuente:** Licencia [MIT](https://opensource.org/licenses/MIT).
