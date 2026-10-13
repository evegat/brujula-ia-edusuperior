# Reporte de Revisión Adversaria — Brújula IA Educación Superior (P154)

> [!WARNING] **Skepticism Disclaimer**
> El sistema ahora compila de forma limpia en Astro SSG con 100% de los datos prerenderizados en el HTML y pasa una suite exhaustiva de tests adversarios, pero la integración viva con n8n dependerá en producción de que la instancia remota esté en línea dentro del umbral de 5 segundos.

## 1. What the prior attempt got wrong

### Hallazgo 1: Prerenderizado Falso (HTML Inicial Vacío / Dependencia 100% de JS)
- **Input:** Carga inicial de `dist/client/index.html` por motores de búsqueda, lectores de pantalla o navegadores con JavaScript deshabilitado.
- **Expected:** Las 54 universidades, 85 compras públicas, 52 instrumentos y 87 citas deben estar prerenderizadas en el HTML estático de Astro SSG.
- **Actual:** Los contenedores `#matriz-cards-grid`, `#compras-tbody`, `#catalogo-cards-grid` y `#citas-cards-grid` contenían únicamente comentarios vacíos (`<!-- Inyectado por JS -->`). Todo el contenido se inyectaba exclusivamente en el cliente mediante scripts inline.
- **Root cause:** El implementador delegó el render inicial completamente a manipulación DOM en cliente (`innerHTML = ...`) en lugar de usar templates Astro declarativos (`{matrizData.map(...)}`).

### Hallazgo 2: Fallo de Búsqueda por Tildes y Diacríticos
- **Input:** Términos de búsqueda sin tilde comunes en teclado móvil: "concepcion", "biobio", "adolfo ibanez", "autoria", "evaluacion".
- **Expected:** Coincidencia con "Universidad de Concepción", "Universidad del Bío-Bío", "Universidad Adolfo Ibáñez" y cláusulas temáticas.
- **Actual:** Retornaba 0 resultados y activaba la pantalla de estado vacío ("No se encontraron instrumentos para tu búsqueda").
- **Root cause:** Uso de `String.prototype.includes()` plano sin normalización Unicode ni eliminación de marcas diacríticas (`normalize('NFD').replace(/[\u0300-\u036f]/g, '')`).

### Hallazgo 3: Alucinación de Citas en RAG y Omisión de Vocabulario Evaluativo Chileno
- **Input:** Consultas fuera de ámbito (ej: "¿cuál es la capital de Francia?") o términos de evaluación chilenos ("prueba", "certamen").
- **Expected:** Consultas fuera de ámbito deben advertir honestamente que no hay cláusulas pertinentes y retornar 0 citas. Términos de aula chilenos deben activar la síntesis de rediseño evaluativo.
- **Actual:** Consultas fuera de ámbito retornaban 4 citas arbitrarias con un texto genérico simulando respuesta; consultas con "prueba" o "certamen" caían al caso residual genérico.
- **Root cause:** `searchCitations` carecía de umbral mínimo de score relevante, y `topicKeywords` / `synthesizeAnswer` omitían el vocabulario universitario chileno.

### Hallazgo 4: Fragilidad y Riesgo de Crash en Endpoint e Integración Webhook n8n
- **Input:** Webhook de n8n retornando formatos estándar de nodo (`[{ json: { ... } }]`, `{ output: "..." }`), respuestas sin `citations`, o demoras de red.
- **Expected:** El endpoint `/api/ask-rag` debe normalizar el payload, aplicar timeout estricto de 5s (`AbortSignal.timeout(5000)`) y hacer fallback al motor local si no hay respuesta válida.
- **Actual:** El implementador usaba `...n8nData` sin validar estructura. Si n8n retornaba un array o un objeto sin `answer`/`citations`, el cliente Astro arrojaba `TypeError: Cannot read properties of undefined (reading 'split')` y bloqueaba la interfaz de usuario.
- **Root cause:** Falta de esquema defensivo de normalización de respuestas y ausencia de timeout en la llamada `fetch`.

### Hallazgo 5: Desborde CSS en Viewports Móviles Angostos (320px–360px)
- **Input:** Visualización en pantallas móviles de 320px–360px (ej: iPhone SE, Galaxy compactos).
- **Expected:** Tarjetas y formularios fluidos adaptados al ancho disponible (331px útiles con padding).
- **Actual:** Columnas con `minmax(350px, 1fr)` y formularios con `grid-template-columns: 1fr 1fr` rígido forzaban desborde horizontal y truncaban campos.
- **Root cause:** Tamaños mínimos fijos mayores al ancho del viewport en CSS Grid.

### Hallazgo 6: Validación Laxa de Datos en Endpoints
- **Input:** Cuerpos JSON `null`, emails malformados (`@.`, `a@.`, `foo@bar.`) o URLs con esquemas no HTTP (`ftp://...`).
- **Expected:** Respuestas 400 estructuradas y limpias.
- **Actual:** Cuerpos `null` provocaban TypeErrors internos no controlados (`Cannot destructure property 'query' of 'body' as it is null`), y se aceptaban correos sintácticamente inválidos.
- **Root cause:** Comprobaciones ingenuas con `.includes('@')` sin validación regex formal (`EMAIL_REGEX`).

### Hallazgo 7: Descarga Incompleta de Datos Abiertos
- **Input:** Periodistas o investigadores intentando descargar los datasets de la Matriz 54, Compras Públicas y Citas Textuales.
- **Expected:** Enlaces directos a archivos JSON en `public/`.
- **Actual:** Solo `inventario.json` estaba en `public/`; los demás datasets permanecían inaccesibles en `data/`.
- **Root cause:** No se habían copiado los datasets secundarios al directorio público de distribución.

---

## 2. What I changed

1. **`src/components/MatrizNacional.astro`:**
   - Prerenderizado SSR completo de las 54 universidades en el HTML estático.
   - Búsqueda insensible a tildes (`normalizeInput`).
   - Dimensionamiento de grilla responsivo con `minmax(min(100%, 320px), 1fr)`.
2. **`src/components/ComprasPublicas.astro`:**
   - Prerenderizado SSR de las 85 filas de compras públicas en `<tbody>`.
   - Búsqueda insensible a tildes (`normalizeInput`).
   - Scroll táctil suave (`-webkit-overflow-scrolling: touch;`).
3. **`src/components/CatalogoProtocolos.astro`:**
   - Prerenderizado SSR de los 52 instrumentos en el HTML estático.
   - Búsqueda insensible a tildes (`normalizeInput`).
   - Grilla responsiva adaptativa `minmax(min(100%, 320px), 1fr)`.
4. **`src/components/CitasTextuales.astro`:**
   - Prerenderizado SSR de las 87 citas textuales con número de página y acceso dual.
   - Búsqueda temática y de texto insensible a tildes.
   - Grilla responsiva adaptativa.
5. **`src/components/RagAssistant.astro`:**
   - Normalización de texto y fallback cliente insensible a tildes.
   - Protección contra citas vacías o respuestas nulas para evitar TypeErrors.
   - Grilla responsiva `minmax(min(100%, 300px), 1fr)`.
6. **`src/pages/api/ask-rag.ts`:**
   - Timeout de 5s en fetch (`AbortSignal.timeout(5000)`).
   - Normalización de formatos n8n (arrays, objetos, extracción de `answer` y `citations`).
   - Umbral de score mínimo (>3) para evitar citas espurias en preguntas off-topic.
   - Incorporación de vocabulario universitario chileno (`prueba`, `certamen`, `control`, etc.).
   - Sanitización y clampeo de `top_k` (1 a 10) y longitud de consulta.
7. **`src/pages/api/subscribe.ts`:**
   - Validación regex de correo (`/^[^\s@]+@[^\s@]+\.[^\s@]+$/`).
   - Manejo seguro de cuerpo `null` y datos malformados.
8. **`src/pages/api/contact.ts`:**
   - Validación regex de correo y longitud de mensaje.
   - Manejo seguro de cuerpo `null`.
9. **`src/pages/api/submit-normativa.ts`:**
   - Validación estricta de esquema HTTP/HTTPS para `url_normativa`.
   - Validación regex opcional para email de remitente.
   - Manejo seguro de cuerpo `null`.
10. **`src/components/ModalCrowdsourcing.astro`:**
    - Cierre accesible con tecla `Escape`.
    - Campos de formulario apilables en móvil (`minmax(min(100%, 200px), 1fr)`).
    - Cierre automático suave post-envío exitoso.
11. **`src/components/MadurezIMN.astro`:**
    - Grilla responsiva con `minmax(min(100%, 300px), 1fr)`.
12. **`src/components/ComunidadBuzon.astro`:**
    - Formularios adaptativos para pantallas pequeñas.
    - Botones de descarga de datos abiertos para los 4 datasets (`inventario.json`, `matriz_54_universidades.json`, `compras_clasificadas.json`, `citas_enriquecidas.json`).
13. **`src/layouts/Layout.astro`:**
    - Reglas `box-sizing: border-box;` y `max-width: 100%;` en `.content-area`.
14. **`public/`:**
    - Copiados los datasets `matriz_54_universidades.json`, `compras_clasificadas.json` y `citas_enriquecidas.json`.
15. **`scripts/test-adversarial.mjs` & `package.json`:**
    - Suite de pruebas de robustez adversaria añadida a `npm test`.

---

## 3. Verification Record

- **Deep Verification (ran actual tests):**
  - `npm test`: Ejecutó 3 suites completas:
    1. `scripts/test-api.mjs`: Todos los 4 endpoints serverless validados (códigos 200 y 400).
    2. `scripts/verify-all.mjs`: Todos los criterios de aceptación R1-R4 verificados:
       - Censo oficial: 54 Ues (32 con instrumento, 22 en brecha).
       - Duoc UC unificado en posición única con 2 documentos (IMN: 100/100).
       - Compras públicas: 85 licitaciones con URLs funcionales a Mercado Público en 4 capas.
       - Citas textuales: 87/87 citas limpias con página y acceso dual.
       - Artefactos de build: `dist/client/index.html` (938 KB completamente prerenderizado) y `dist/server/entry.mjs`.
    3. `scripts/test-adversarial.mjs`: 100% de tests adversarios pasados:
       - Rechazo de Content-Type no-JSON y payloads `null`.
       - Rechazo de emails malformados (`@.`, `a@.`, `foo@bar.`, etc.).
       - Rechazo de esquemas de URL inválidos en aportes comunitarios.
       - Rechazo de consultas off-topic en RAG sin alucinar citas.
       - Detección de terminología chilena ("prueba", "certamen") en RAG.
       - Búsquedas con diacríticos ("concepcion", "biobio", "adolfo ibanez").
       - Verificación de 54/54 universidades y 85 compras en el HTML estático crudo.
       - Verificación de existencia de los 4 datasets descargables en `public/` y `dist/client/`.
  - `npm run build`: Compilación limpia en 1.54s sin warnings.
  - `npx wrangler deploy --dry-run`: Empaquetado exitoso para Cloudflare Workers (833 KiB total, gzip 201 KiB).

- **Shallow Verification (manual only):**
  - Inspección ocular del HTML prerenderizado confirmando la estructura semántica de tarjetas, tablas y botones.

- **Unverified aspects:**
  - Comunicación en vivo con una instancia remota de n8n con credenciales reales (se probó su fallback local, timeout y normalización de payloads).
  - Publicación DNS en `brujulaiaedusuperior.evegat.cl` (requiere token de Cloudflare de Eduardo).

---

## 4. Known Issues

- `Minor Robustness Risk` — Si se configura un webhook remoto de n8n que tarde más de 5 segundos en responder, el sistema activará transparentemente el motor RAG local determinista sin notificar al usuario final de la degradación (comportamiento por diseño para garantizar disponibilidad).
- `Shallow Verification` — El despliegue productivo final requerirá ejecutar `npx wrangler deploy` en un entorno autenticado en Cloudflare con la cuenta de Eduardo.

---

## 5. Remaining risk & next step

El sistema está completamente refactorizado, probado adversariamente y listo para producción.
- **Siguiente paso:** Proceder con el despliegue a Cloudflare Workers (`npx wrangler deploy`) cuando Eduardo disponga las credenciales productivas de la zona DNS `evegat.cl`.
