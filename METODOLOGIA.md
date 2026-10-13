# Marco Metodológico y Protocolo de Observación
## P154 — Brújula IA Educación Superior Chile

- **Versión metodológica:** 2.2.0
- **Fecha de corte del levantamiento:** 13 de octubre de 2026
- **Investigador responsable:** Eduardo Vega Toledo (`https://www.linkedin.com/in/evegat1989/`)
- **Contacto metodológico:** `eduardo@evegat.cl`
- **Licencia de datos y contenidos:** Creative Commons Atribución 4.0 Internacional (CC BY 4.0)

---

### 1. Propósito y Principios Epistemológicos

*Brújula IA Educación Superior Chile* es un observatorio empírico independiente cuyo propósito es catastrar, clasificar, monitorear y poner a disposición pública los instrumentos de gobernanza, directrices pedagógicas y decisiones de inversión tecnológica vinculadas a la inteligencia artificial en el sistema universitario chileno.

El observatorio se rige por cuatro principios fundamentales:

1. **Evidencia sobre Inferencia:** Todo dato reportado proviene de una fuente documental verificable, pública y archivada con identificador criptográfico. Ninguna calificación se otorga por presunción o deducción no respaldada.
2. **Neutralidad Descriptiva:** El observatorio no emite juicios morales ni rankings punitivos sobre la celeridad regulatoria de las instituciones. Registra la presencia o ausencia de instrumentos formalizados y públicamente accesibles.
3. **No Equivalencia entre Ausencia de Hallazgo y Ausencia de Norma:** La no identificación de directrices en portales abiertos no faculta a concluir que una universidad carece de normativas internas. Se declara estrictamente: *«Sin instrumento público identificado en el levantamiento»*.
4. **Reproducibilidad Total:** Los datasets, scripts de extracción, reglas de clasificación y textos completos en formato Markdown están publicados bajo estándares de datos abiertos para su auditoría y replicación independiente.

---

### 2. Universo Institucional de Estudio

El universo de análisis está delimitado por las **54 Universidades oficialmente reconocidas y vigentes en Chile** según los registros del Ministerio de Educación (Mineduc) y el Servicio de Información de Educación Superior (SIES):

| Segmento Institucional | Cantidad | Descripción |
|---|---:|---|
| **Universidades Estatales** | 18 | Planteles pertenecientes al Consorcio de Universidades del Estado de Chile (CUECH), sujetos al régimen de derecho público y a la Ley de Compras Públicas (Ley N° 19.886). |
| **Universidades Privadas CRUCH (G9)** | 9 | Planteles tradicionales de vocación pública con aporte fiscal indirecto o histórico, miembros del Consejo de Rectores. |
| **Universidades Privadas no CRUCH** | 27 | Planteles creados bajo el DFL N° 1 de 1980, regulados por la Ley N° 21.091 sobre Educación Superior. |
| **Total Universo Oficial** | **54** | **100% del sistema universitario chileno** |

> *Nota sobre IP y CFT:* Los Institutos Profesionales y Centros de Formación Técnica no forman parte del censo de las 54 universidades. Los instrumentos de planteles técnico-profesionales levantados (p. ej., Duoc UC, IP Santo Tomás) se preservan en el catálogo documental como casos de referencia sectorial, pero no computan en los denominadores del censo universitario.

---

### 3. Procedimiento de Levantamiento Documental y Fuentes

El levantamiento empírico de instrumentos normativos se desarrolló mediante un proceso sistemático en cuatro fases:

1. **Rastreo en Portales Institucionales Oficiales:**
   - Páginas web oficiales de Rectoría, Vicerrectorías Académicas y Direcciones de Docencia.
   - Repositorios normativos centrales y boletines de decretos universitarios.
   - Sitios web de centros de innovación docente y bibliotecas institucionales.
2. **Consultas a Direcciones de Docencia y Autoridades:**
   - Verificación de resoluciones, circulares, guías y orientaciones docentes emitidas formalmente.
3. **Búsquedas Avanzadas con Operadores Booleanos:**
   - Consultas exhaustivas en motores de búsqueda (`site:[dominio_institucional] filetype:pdf ("inteligencia artificial" OR "ChatGPT" OR "IA generativa")`).
4. **Validación, Deduplicación y Custodia:**
   - Descarga del documento original en formato PDF.
   - Asignación de identificador único (`doc_id`).
   - Cálculo del Hash SHA-256 para garantizar la inmutabilidad y autenticidad del archivo.
   - Conversión a texto Markdown estructurado por páginas (`<!-- Página X -->`) para su consulta abierta.

---

### 4. Clasificación del Estado Institucional y Criterio de Brecha

Cada universidad oficial es clasificada en uno de dos estados objetivos:

1. **Con instrumento normativo identificado (32 universidades / 59.3%):**
   - La institución cuenta con al menos un documento formal (política marco, resolución de rectoría, lineamientos de vicerrectoría, guía docente o reglamento de carrera/facultad) que regula o norma el uso de IA.
2. **Sin instrumento público identificado en el levantamiento (22 universidades / 40.7%):**
   - No se identificaron documentos normativos públicos en los canales institucionales abiertos durante el período de levantamiento.
   - En cada ficha se habilita un canal de crowdsourcing comunitario para que docentes, estudiantes o autoridades aporten antecedentes no localizados.

---

### 5. Modelo de Benchmarking de 7 Ejes Normativos

En sustitución de índices univariados con puntajes basales artificiales, el observatorio implementa una **matriz de benchmarking multidimensional de 7 ejes binarios** (1 = Evidencia identificada; 0 = Sin evidencia localizada en documentos públicos):

```
                                  [BENCHMARKING DE 7 EJES]
                                             │
      ┌────────────────┬─────────────────────┼─────────────────────┬────────────────┐
      │                │                     │                     │                │
[1. Transparencia] [2. Integridad]    [3. Adaptación Aula]  [4. Privacidad]   [5. Tesis & Grado]
  Acceso público     IA no es autora    Rediseño evaluativo   Ley N° 21.719     Regla explícita
      │                │                     │                     │                │
      └────────────────┴─────────────────────┼─────────────────────┴────────────────┘
                                             │
                             ┌───────────────┴───────────────┐
                             │                               │
                     [6. Régimen Disciplinario]      [7. Gobernanza Institucional]
                       Tipificación de faltas          Comités y comisiones de IA
```

#### Descripción de los 7 Ejes:
1. **Eje 1: Transparencia Activa y Acceso Público:** El instrumento cuenta con resolución o decreto formal y está disponible públicamente en internet con enlace verificable.
2. **Eje 2: Integridad Académica y Atribución:** La norma prohíbe explícitamente atribuir autoría moral o legal a sistemas de IA y exige declaración expresa de uso de prompts o modelos.
3. **Eje 3: Adaptación Evaluativa en Aula:** El documento instruye a los cuerpos docentes a rediseñar instrumentos de evaluación (pruebas orales, defensas, procesos iterativos) frente a la IA generativa.
4. **Eje 4: Protección de Datos y Privacidad:** La directriz prohíbe alimentar modelos públicos con datos personales de la comunidad universitaria o propiedad intelectual inédita.
5. **Eje 5: Directrices para Trabajos de Tesis y Graduación:** Regulación específica sobre el empleo permitido, asistido o prohibido de IA en memorias, tesis de grado y seminarios de título.
6. **Eje 6: Régimen Disciplinario y Tipificación de Faltas:** El reglamento tipifica el uso no autorizado o el plagio mediado por IA dentro de los procedimientos de sanción y deshonestidad académica.
7. **Eje 7: Gobernanza e Instancias Colegiadas:** Creación formal de comités de ética, mesas técnicas multidisciplinarias o unidades permanentes para la actualización de directrices de IA.

---

### 6. Marco Temporal y Jurídico de la Ley N° 21.719

El observatorio audita con especial celo la dimensión de privacidad institucional:

- **Vigencia Legal:** La **Ley N° 21.719 sobre Protección de Datos Personales** fue promulgada en 2024 y establece un período de vacancia legal cuya **vigencia obligatoria formal rige a contar del 1 de diciembre de 2026**.
- **Criterio de Evaluación:** Los instrumentos universitarios catastrados que mencionan privacidad o resguardo de datos se consideran **manifestaciones de previsión preventiva o buenas prácticas de gobierno de datos**. En ningún caso se certifica su "conformidad jurídica plena", ya que dicha exigibilidad está sujeta a la entrada en vigor de la Agencia de Protección de Datos Personales y sus reglamentos complementarios.

---

### 7. Minería de Cláusulas Textuales: Co-ocurrencia Estricta

Para la construcción del corpus de citas normativas y la eliminación absoluta de falsos positivos (hallazgo P0-03), el observatorio aplica un filtro determinista de doble factor:

$$\text{Párrafo Válido} \iff (\text{Léxico IA}) \land (\text{Patrón Temático})$$

1. **Léxico de IA Obligatorio:** El párrafo debe contener de forma obligatoria al menos una coincidencia del conjunto:
   `\bIA\b`, `\bIAG\b`, `inteligencia artificial`, `generativa`, `chatgpt`, `\bllm\b`, `prompt`, `algoritmo`, `modelo de lenguaje`, `sistemas de ia`.
2. **Patrón Temático Específico:** Coincidencia con los términos calificados de las categorías `tesis`, `evaluacion`, `privacidad`, `autoria` o `sanciones`.
3. **Trazabilidad Criptográfica:** Cada cita extraída conserva su número de página verificado, enlace al PDF original, enlace a la versión Markdown completa y el hash SHA-256 del documento fuente.

---

### 8. Compras Públicas en Universidades del Estado (Mercado Público)

La auditoría de contrataciones públicas se circunscribe estrictamente al ámbito de las **universidades del Estado**, sujetas a la plataforma ChileCompra (Ley N° 19.886). Las universidades privadas no participan de dicho portal y no forman parte de este componente.

#### Tipología Tecnológica en 4 Capas (85 Contratos Auditados):
1. **IA Generativa y Modelos de Lenguaje (48 contratos):** Chatbots con modelos de lenguaje, asistentes conversacionales para admisión y atención estudiantil, suscripciones institucionales a servicios LLM.
2. **IA Tradicional y Machine Learning (21 contratos):** Modelos predictivos de retención estudiantil, minería de datos, visión computacional y redes neuronales especializadas.
3. **Infraestructura Computacional Habilitante (14 contratos):** Servidores de alto rendimiento con aceleradores GPU (NVIDIA), clusters de supercómputo y almacenamiento para modelamiento numérico.
4. **Software Estadístico y Analítico General (2 contratos):** Licenciamiento de paquetes tradicionales (SPSS, SAS) para investigación cuantitativa.

> **Advertencia Metodológica de Adopción:** La adjudicación de una orden de compra en Mercado Público acredita inversión presupuestaria y despliegue técnico por parte de la universidad, pero **no certifica adopción docente efectiva en las aulas ni existencia de gobernanza ética de los datos procesados**.

---

### 9. Limitaciones Metodológicas y Crowdsourcing

1. **Intranets y Documentos no Públicos:** Universidades con normativas internas de circulación restringida a correos institucionales pueden figurar en estado *"Sin instrumento público identificado"* hasta que un miembro de la comunidad las comparta mediante el canal de aporte ciudadano.
2. **Dinámica Temporal:** La regulación de la IA es un campo en evolución vertiginosa. El observatorio actualiza periódicamente sus datasets mediante el protocolo de versionamiento Git.
3. **Mecanismo de Aporte Ciudadano:** Cualquier persona puede enviar nuevos reglamentos, rectificaciones o enlaces oficiales mediante el formulario integrado en la plataforma o escribiendo directamente a `eduardo@evegat.cl`.

---

### 10. Versionamiento y Acceso a Datasets

Todos los datos están disponibles en la carpeta `/public` y descargables directamente:
- `brecha_universidades_chile.json`: Censo de las 54 universidades y estado de identificación.
- `matriz_54_universidades.json`: Matriz multidimensional completa por plantel.
- `benchmarking_checklist.json`: Diagnóstico de los 7 ejes y autoevaluador.
- `citas_enriquecidas.json`: 61 cláusulas textuales con hash SHA-256 y páginas.
- `compras_clasificadas.json`: 85 contratos de Mercado Público en 4 capas tecnológicas.
