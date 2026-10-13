> [!WARNING] **Skepticism Disclaimer**
> Estoy confiado en la integridad de los datos normalizados y en la compilación limpia hacia Cloudflare Workers/Assets porque ejecuté suites automatizadas de extremo a extremo, pero el comportamiento del webhook externo n8n no pudo ser probado en vivo contra una instancia productiva real sino únicamente mediante su fallback local determinista.

## 1. What I changed
- `inventario.json`: Normalizado el documento id 51 de "IP Duoc UC" a "Duoc UC" para unificar Duoc en una sola posición institucional.
- `data/calcular_imn.py`: Actualizado para usar rutas relativas agnósticas y recalcular el ranking IMN con Duoc UC consolidado con sus 2 documentos vigentes.
- `data/cruce_ies.py`: Corregido algoritmo eliminando tokens laxos y falsos positivos de cruce para fijar el censo oficial en exactamente 32 universidades con instrumento verificado (59.3%) y 22 en brecha sobre las 54 oficiales Mineduc/SIES.
- `data/brecha_universidades_chile.json`: Regenerado reflejando el diagnóstico de 32 con instrumento y 22 en brecha.
- `data/generar_matriz_54.py` y `data/matriz_54_universidades.json`: Creado dataset consolidado de las 54 universidades oficiales con sus 6 dimensiones diagnósticas (Aula, Tesis, Autoría, Privacidad Ley 21.719, Evaluación, Compras IA) y cruce con compras públicas.
- `data/generar_citas_enriquecidas.py` y `data/citas_enriquecidas.json`: Creado dataset de 87 citas textuales con número de página verificado, fuente institucional y enlaces de acceso dual (Markdown respaldado y fuente externa original).
- `package.json` y `astro.config.mjs`: Configurada la aplicación moderna en Astro 7 con `@astrojs/cloudflare` en modo serverless SSG/hybrid con $0 costo marginal.
- `src/layouts/Layout.astro`: Layout base con Newsreader e Inter, tema claro/oscuro persistente en `localStorage`, header móvil con menú hamburguesa colapsable sin overflow horizontal (`overflow-x: hidden`).
- `src/components/Hero.astro`: Encabezado con propuesta de bien público, KPIs generales y UX discovery orientado a 3 perfiles (Autoridades, Investigadores/Periodistas, Docentes/Estudiantes).
- `src/components/RagAssistant.astro`: Módulo interactivo "Pregúntale a las Normativas de IA" con chips de preguntas frecuentes, recuperación semántica y citas textuales exactas.
- `src/components/MatrizNacional.astro`: Matriz interactiva de las 54 universidades con semáforo de 6 dimensiones, filtros por tipo de plantel (Estatales, Privadas CRUCH, Privadas no CRUCH, En Brecha) y botón de aporte directo para planteles en brecha.
- `src/components/ModalCrowdsourcing.astro`: Modal reactivo de crowdsourcing prellenado con la universidad seleccionada, conectado a `/api/submit-normativa` y con aviso para envío de PDFs adjuntos a `eduardo@evegat.cl`.
- `src/components/MadurezIMN.astro`: Render semántico de la fórmula matemática del IMN ($$IMN = 0.20 \cdot S_1 + 0.20 \cdot S_2 + 0.15 \cdot S_3 + 0.15 \cdot S_4 + 0.15 \cdot S_5 + 0.15 \cdot S_6$$) sin caracteres de escape rotos, ficha metodológica GENIAL y ranking consolidado con Duoc UC.
- `src/components/ComprasPublicas.astro`: Tabla interactiva de las 85 licitaciones con titular formal requerido (*"Adquisiciones tecnológicas sin protocolo de aula localizado en el alcance del catastro (2020–2026)"*), clasificación en 4 capas y links directos funcionales a Mercado Público.
- `src/components/CitasTextuales.astro`: Buscador de citas con número de página y acceso dual a Markdown y original.
- `src/components/CatalogoProtocolos.astro`: Catálogo de los 52 instrumentos con buscador instantáneo en tiempo real, contador de resultados y estado vacío explicativo con botón de reseteo.
- `src/components/Comparador.astro`: Comparador lado a lado de políticas entre instituciones y facultades.
- `src/components/Ecosistema.astro`: Referentes internacionales de ciencia abierta (GENIAL Erasmus+, ObIA-Educ UDLA, UNESCO).
- `src/components/ComunidadBuzon.astro`: Formulario de suscripción a alertas normativas (`/api/subscribe`), formulario de contacto directo (`/api/contact`) y descargas de datos abiertos.
- `src/components/Footer.astro`: Brandeo institucional y enlaces al ecosistema `evegat.cl` (InnCívica, Bastidor, Granola, GitHub) con licencia CC BY 4.0.
- `src/pages/api/subscribe.ts`: Endpoint Cloudflare Worker para suscripción con validación JSON.
- `src/pages/api/contact.ts`: Endpoint Cloudflare Worker para contacto con validación JSON.
- `src/pages/api/submit-normativa.ts`: Endpoint Cloudflare Worker para aportes comunitarios con emisión de ticket ID.
- `src/pages/api/ask-rag.ts`: Endpoint Cloudflare Worker para consultas RAG con soporte de webhook n8n y motor local semántico estructurado.
- `scripts/test-api.mjs`: Suite de pruebas unitarias para los 4 endpoints serverless.
- `scripts/verify-all.mjs`: Suite de validación integral sobre todos los criterios de aceptación y artefactos compilados.

## 2. Why
Resolver de raíz los 7 hallazgos de auditoría (H01-H07) y las decisiones acordadas en Grill-Me:
- Eliminar coincidencias laxas que inflaban artificialmente la cobertura y fijar con precisión el censo oficial en 32 universidades con protocolo y 22 en brecha sobre las 54 oficiales Mineduc/SIES.
- Corregir la fragmentación de Duoc UC en dos filas para consolidarlo en una única posición representativa en el ranking IMN.
- Brindar trazabilidad pública irrefutable a las 85 compras tecnológicas en Mercado Público de planteles estatales.
- Otorgar a la comunidad académica una herramienta de búsqueda semántica RAG asistida con citas textuales y números de página verificados.
- Permitir el crowdsourcing directo desde la matriz hacia la API serverless para acelerar la actualización colaborativa del catastro.

## 3. Verification Record
- **Deep Verification (ran actual tests):**
  - `npm test`: Ejecutó `scripts/test-api.mjs` y `scripts/verify-all.mjs`. Todos los tests pasaron (código de salida 0):
    - `/api/subscribe`: validación de email y rechazo de payload erróneo.
    - `/api/contact`: validación de mensaje y rechazo de inputs incompletos.
    - `/api/submit-normativa`: validación de campos obligatorios y generación de tickets `NORM-*`.
    - `/api/ask-rag`: recuperación semántica sobre prompts, tesis y síntesis contextual con citas.
    - Censo 54 Ues: verificado exactamente 32 con instrumento (59.3%) y 22 en brecha (40.7%).
    - Unificación Duoc UC: posición única y consolidación de 2 documentos comprobada.
    - Compras públicas: 85 contratos verificados con URLs a `mercadopublico.cl` y 4 capas funcionales.
    - Citas textuales: 87/87 citas limpias con número de página verificado.
  - `npm run build`: Compilación exitosa en 1.81s generando `dist/client/index.html` (576 KB prerenderizado) y `dist/server/entry.mjs` (Cloudflare Worker).
  - `npx wrangler deploy --dry-run`: Verificación de compatibilidad Cloudflare sin errores de configuración.
- **Shallow Verification (manual run only):**
  - Inspección ocular del HTML generado para verificar tags KaTeX/Newsreader, badges CSS y scripts inline.
- **Unverified aspects:**
  - Envío real de requests HTTP contra una instancia remota de webhook n8n en producción (se verificó su fallback local autónomo).
  - Despliegue en vivo en la zona DNS productiva de Cloudflare (requiere credenciales/token de despliegue de Eduardo).

## 4. Known Issues
- `Minor Robustness Risk` — Si un usuario desactiva JavaScript por completo en su navegador móvil, las funciones reactivas del cliente (filtros en vivo de la matriz y el modal de crowdsourcing) no abrirán dinámicamente, aunque todo el contenido y las tablas permanecen visibles en el HTML prerenderizado.
- `Shallow Verification` — El reenvío a webhook n8n en `/api/ask-rag` asume que el webhook retorna un payload JSON compatible con `{ answer, citations }` si la variable de entorno `N8N_RAG_WEBHOOK_URL` está definida.

## 5. Untested Edge Cases & Next Step
- **Ataque prioritario para el revisor:**
  - Probar la responsividad móvil en viewports extremos (320px–360px) en Safari iOS y Chrome Android para comprobar que no existan desbordes horizontales con tablas anchas.
  - Enviar solicitudes concurrentes a los endpoints `/api/*` con payloads JSON malformados o de gran tamaño para evaluar la robustez del worker.
  - Verificar la experiencia de usuario al prellenar el modal de crowdsourcing desde distintas filas de la matriz nacional.
