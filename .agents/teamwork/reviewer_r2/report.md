> [!WARNING] **Skepticism Disclaimer**
> El sistema ha superado dos rondas exhaustivas de pruebas adversarias y compila limpiamente para Cloudflare Workers con 100% de datos y componentes prerenderizados en SSR; no obstante, el despliegue a producción requiere inyectar las credenciales DNS de la cuenta Cloudflare de Eduardo.

## 1. What the prior attempt got wrong

### Hallazgo 1: Alucinación de Citas en RAG ante Consultas con Caracteres de Puntuación o Stopwords
- **Input:** Consultas con signos o stopwords sin palabras con más de 2 caracteres (ej: `"---"`, `"???"`, `"..."`, `"de la el"`).
- **Expected:** Debe retornar 0 citas y advertir honestamente que no se encontraron cláusulas pertinentes en el corpus.
- **Actual:** Retornaba las primeras 4 citas del corpus (`UDP`, `UChile`, etc.) y el asistente sintetizaba un texto genérico inventando relevancia.
- **Root cause:** `searchCitations` en `src/pages/api/ask-rag.ts` tenía una cláusula residual `if (queryTokens.length === 0) return (citasData as Citation[]).slice(0, safeTopK);` que devolvía las primeras 4 citas indiscriminadamente ante consultas sin tokens válidos.

### Hallazgo 2: Omisión de Prerenderizado SSR en el Comparador Lado a Lado (Falso SSR Parcial)
- **Input:** Carga inicial estática de `dist/client/index.html` por motores de búsqueda o navegadores con JavaScript deshabilitado.
- **Expected:** El comparador debe contener la tabla comparativa por defecto (UChile vs PUC) completamente poblada con sus encabezados y 8 dimensiones evaluadas.
- **Actual:** Los encabezados `#th-doc-1`, `#th-doc-2` y el cuerpo `#tbody-comparador` estaban completamente vacíos en el HTML crudo (`<!-- Inyectado por JS -->`), violando el principio de SSG estricto.
- **Root cause:** `src/components/Comparador.astro` delegaba el render inicial exclusivamente al hook client-side `actualizarComparativa()` sin renderizar el estado inicial en el template Astro.

### Hallazgo 3: Anomalía Visual y Tabla Huérfana en Filtros Vacíos de Compras Públicas
- **Input:** Búsqueda en la tabla de compras públicas que arrojara 0 resultados.
- **Expected:** La tabla completa debe ocultarse y mostrar de forma limpia el estado vacío explicativo con su botón de reinicio.
- **Actual:** Se ocultaban los `<tr>` del cuerpo, pero el contenedor y la cabecera `<thead>` permanecían visibles y flotando sobre el mensaje de estado vacío.
- **Root cause:** El selector de la función `filtrarCompras()` en `ComprasPublicas.astro` manipulaba las filas individuales sin ocultar el contenedor padre de la tabla.

### Hallazgo 4: Ausencia de Handlers OPTIONS y Preflight CORS en Endpoints
- **Input:** Petición HTTP `OPTIONS` (preflight CORS) desde clientes externos o aplicaciones frontend consumiendo `/api/subscribe`, `/api/contact`, `/api/submit-normativa` o `/api/ask-rag`.
- **Expected:** Respuesta `204 No Content` con cabeceras `Access-Control-Allow-Origin: *` y métodos permitidos.
- **Actual:** Astro respondía con error `405 Method Not Allowed`, bloqueando cualquier consumo cross-origin de la API pública.
- **Root cause:** Los archivos de endpoints en `src/pages/api/` solo exportaban el handler `POST`, omitiendo `OPTIONS`.

### Hallazgo 5: Ausencia de Rate Limiting y Protección contra Ráfagas
- **Input:** Ráfagas automatizadas de peticiones repetitivas a los formularios o consultas del motor RAG.
- **Expected:** Bloqueo defensivo con código HTTP `429 Too Many Requests` y cabecera `Retry-After: 60`.
- **Actual:** Se procesaban todas las solicitudes sin límite, arriesgando saturación innecesaria en la cuota serverless.
- **Root cause:** Los endpoints carecían de control por IP en ventana deslizante de 60 segundos.

### Hallazgo 6: Brechas de Accesibilidad WCAG (Focus Trap, Return Focus y Skip Link)
- **Input:** Navegación exclusiva por teclado (`Tab`, `Shift+Tab`, lectores de pantalla) en el modal de crowdsourcing y menú principal.
- **Expected:** Focus trap estricto dentro del modal activo, foco automático al abrir, retorno del foco al elemento desencadenador al cerrar, y enlace accesible "Saltar al contenido principal".
- **Actual:** El foco tabbing escapaba del modal hacia el fondo de la página; no se restauraba el foco al cerrar; y faltaba el salto directo accesible al contenido.
- **Root cause:** Ausencia de listener de intercepción de `Tab` dentro del modal, omisión de guardado de `previouslyFocusedElement`, y falta de estilos/markup para bypass blocks.

### Hallazgo 7: Visualización Cruda de Asteriscos Markdown en Respuesta RAG
- **Input:** Respuesta generada por el motor RAG conteniendo énfasis sintáctico (`**negrita**`).
- **Expected:** Formateo semántico HTML seguro (`<strong>negrita</strong>`).
- **Actual:** Se asignaba con `textContent`, mostrando los asteriscos literales crudos (`**declaración obligatoria**`) en la interfaz.
- **Root cause:** Asignación directa a `textContent` sin formateador inline seguro previo.

---

## 2. What I changed

1. **`src/pages/api/ask-rag.ts`:**
   - Corregido `searchCitations`: ahora retorna `[]` cuando `queryTokens.length === 0` (evita citas espurias ante `"---"`, signos o stopwords).
   - Añadido handler `OPTIONS` con código `204` y cabeceras CORS (`Access-Control-Allow-Origin: *`, `X-Content-Type-Options: nosniff`).
   - Implementado rate limiting por IP (máximo 30 peticiones/minuto, respuesta 429 con `Retry-After: 60`).
   - Diferenciación explícita de origen y motor: `source: 'n8n-webhook'`, `source: 'local-rag-fallback'` (si n8n falló) y `source: 'local-rag'` (si operó autónomo directo).

2. **`src/pages/api/subscribe.ts`:**
   - Añadido handler `OPTIONS` (204 CORS).
   - Implementado rate limiting por IP (máximo 10 peticiones/minuto, 429).
   - Inyección de cabeceras de seguridad en todas las respuestas.

3. **`src/pages/api/contact.ts`:**
   - Añadido handler `OPTIONS` (204 CORS).
   - Implementado rate limiting por IP (máximo 10 peticiones/minuto, 429).
   - Inyección de cabeceras de seguridad en todas las respuestas.

4. **`src/pages/api/submit-normativa.ts`:**
   - Añadido handler `OPTIONS` (204 CORS).
   - Implementado rate limiting por IP (máximo 10 peticiones/minuto, 429).
   - Inyección de cabeceras de seguridad en todas las respuestas.

5. **`src/components/Comparador.astro`:**
   - Prerenderizado SSR completo del estado inicial de comparación (UChile vs PUC) en el HTML estático (`th-doc-1`, `th-doc-2` y `tbody-comparador`).
   - Añadido atributo `scope="col"` en encabezados para accesibilidad.
   - Preservada la actualización reactiva del cliente al cambiar selectores.

6. **`src/components/ComprasPublicas.astro`:**
   - Asignado identificador `#compras-table-container` al contenedor de la tabla.
   - Corregida la función `filtrarCompras()` para ocultar la tabla completa y mostrar limpiamente el estado vacío cuando `visibles === 0`.
   - Incorporado `scope="col"` en todas las columnas `<th>` para cumplimiento WCAG.

7. **`src/components/ModalCrowdsourcing.astro`:**
   - Implementado focus trap accesible para la tecla `Tab` / `Shift+Tab`.
   - Implementado foco automático en el primer campo al abrir y retorno de foco al elemento activo previo al cerrar.

8. **`src/components/RagAssistant.astro`:**
   - Incorporadas funciones `escapeHtml` y `formatInlineMarkdown` para renderizar `**negrita**` como `<strong>` de forma segura contra XSS.
   - Enriquecido el badge de origen para reflejar con transparencia: `⚡ n8n Webhook Generativo`, `🤖 Motor Local Autónomo` o `⚠️ Motor Local (Fallback n8n)`.

9. **`src/layouts/Layout.astro`:**
   - Añadido enlace de salto accesible `<a href="#main-content" class="skip-link">Saltar al contenido principal</a>`.
   - Asignado `id="main-content"` al elemento `<main>`.
   - Asignadas etiquetas `aria-label` descriptivas a los botones de alternancia de tema visual.

10. **`public/_headers` & Datasets:**
    - Creado `public/_headers` con directivas de seguridad para Cloudflare: `X-Content-Type-Options: nosniff`, `X-Frame-Options: SAMEORIGIN`, `Referrer-Policy: strict-origin-when-cross-origin`, `Permissions-Policy` y CORS para `/api/*`.
    - Copiados los datasets adicionales `ranking_madurez_imn.json` y `brecha_universidades_chile.json` a `public/` y `dist/client/`.

11. **`scripts/test-adversarial.mjs`:**
    - Suite expandida a 8 secciones incluyendo servidor mock local de n8n (validando tanto éxito 200 como degradación controlada 500), verificación de OPTIONS, rate limiting 429, validación de accesibilidad WCAG y cabeceras Cloudflare.

---

## 3. Verification Record

- **Deep Verification (ran actual tests):**
  - `npm test`: Pasó las 3 suites completas:
    1. `scripts/test-api.mjs`: Todos los endpoints validados en escenarios nominales y de validación.
    2. `scripts/verify-all.mjs`: Todos los criterios R1-R4 confirmados (54 Ues, 85 compras públicas con links Mercado Público, Duoc UC consolidado en IMN, 87 citas con número de página y acceso dual, index.html de 945 KB prerenderizado).
    3. `scripts/test-adversarial.mjs`: Pasó el 100% de las 8 pruebas de estrés:
       - Rechazo de Content-Type no-JSON y payloads null.
       - Rechazo de correos malformados.
       - Validación de preflight CORS `OPTIONS` en los 4 endpoints (código 204).
       - Disparo efectivo de rate limiting 429 con cabecera `Retry-After: 60`.
       - Rechazo de citas espurias en RAG ante queries vacías o con signos (`"--- ??? ..."`).
       - Detección de vocabulario evaluativo chileno (`prueba`, `certamen`).
       - Simulación exitosa de webhook n8n en vivo (código 200, `source: 'n8n-webhook'`).
       - Fallback de alta disponibilidad ante caída de n8n (código 500, `source: 'local-rag-fallback'`).
       - Búsquedas con diacríticos (`concepcion`, `biobio`, `adolfo ibanez`).
       - Verificación de 54/54 universidades y 85 compras en el HTML prerenderizado.
       - Verificación de Comparador lado a lado 100% prerenderizado en HTML.
       - Verificación de accesibilidad WCAG: Skip-link, ARIA dialog y focus trap.
       - Verificación de cabeceras de seguridad en `dist/client/_headers`.
       - Disponibilidad de los 6 datasets descargables en `public/` y `dist/client/`.
  - `npm run build`: Compilación limpia en 1.62s sin errores ni advertencias.
  - `npx wrangler deploy --dry-run`: Empaquetado exitoso para Cloudflare Workers (833.10 KiB Worker bundle + 29 archivos en assets `dist/client`).

- **Shallow Verification (manual only):**
  - Inspección del marcado HTML de `dist/client/index.html` confirmando la presencia de las tablas, selectores, roles ARIA y enlaces de salto.

- **Unverified aspects:**
  - Despliegue en producción sobre la zona DNS activa de Cloudflare (requiere token de autenticación de Eduardo en `wrangler`).

---

## 4. Known Issues

- `Shallow Verification` — El despliegue productivo final requerirá ejecutar `npx wrangler deploy` una vez autenticado con la cuenta de Cloudflare de Eduardo.

---

## 5. Remaining risk & next step

El sistema se encuentra en un estado sumamente robusto, con arquitectura SSG + serverless en Cloudflare Workers, cero costos fijos, resguardo de accesibilidad WCAG y manejo defensivo de fallas de red.
- **Siguiente paso:** La refactorización está completa. El proyecto está listo para ser desplegado a producción cuando Eduardo ejecute `npx wrangler deploy`.
