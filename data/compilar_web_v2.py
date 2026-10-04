import json

# Cargar inventario y brecha
with open(r'D:\Proyectos\P154 - NormatIA\inventario.json', 'r', encoding='utf-8') as f:
    inventario = json.load(f)

with open(r'D:\Proyectos\P154 - NormatIA\data\brecha_universidades_chile.json', 'r', encoding='utf-8') as f:
    brecha = json.load(f)

inventario_json_str = json.dumps(inventario, ensure_ascii=False)
brecha_json_str = json.dumps(brecha, ensure_ascii=False)

html_content = f'''<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Brújula IA Educación Superior — Observatorio Abierto de Protocolos en Chile</title>
    <meta name="description" content="Observatorio abierto, catastro granular y comparador de protocolos y normativas de Inteligencia Artificial en la educación superior chilena.">
    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
    <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=Newsreader:ital,opsz,wght@0,6..72,400;0,6..72,500;0,6..72,600;1,6..72,400&display=swap" rel="stylesheet">
    <style>
        :root {{
            --sidebar-bg: #06182c;
            --sidebar-text: #ffffff;
            --canvas-bg: #faf8f5;
            --text-main: #2d3748;
            --text-muted: #718096;
            --accent-green: #2d9c6f;
            --accent-amber: #d4a017;
            --accent-red: #c0392b;
            --accent-blue: #3182ce;
            --border-color: #e2e8f0;
            --card-bg: #ffffff;
            --font-serif: 'Newsreader', serif;
            --font-sans: 'Inter', system-ui, -apple-system, sans-serif;
            --transition: all 0.25s ease;
        }}
        [data-theme="dark"] {{
            --sidebar-bg: #030a12;
            --canvas-bg: #121212;
            --text-main: #e2e8f0;
            --text-muted: #a0aec0;
            --border-color: #2d3748;
            --card-bg: #1a202c;
        }}
        * {{ box-sizing: border-box; margin: 0; padding: 0; }}
        body {{ font-family: var(--font-sans); background-color: var(--canvas-bg); color: var(--text-main); line-height: 1.6; display: flex; min-height: 100vh; }}
        h1, h2, h3, h4, h5, h6 {{ font-family: var(--font-serif); font-weight: 600; color: var(--text-main); margin-bottom: 0.5em; }}
        
        /* Layout */
        .sidebar {{ width: 280px; background-color: var(--sidebar-bg); color: var(--sidebar-text); padding: 2.5rem 1.75rem; position: fixed; height: 100vh; overflow-y: auto; z-index: 100; }}
        .main-content {{ margin-left: 280px; padding: 3rem 4rem; flex: 1; max-width: 1280px; }}
        
        .logo {{ font-family: var(--font-serif); font-size: 1.6rem; font-weight: 700; color: #fff; text-decoration: none; display: block; line-height: 1.2; margin-bottom: 2rem; }}
        .logo span {{ font-size: 0.85rem; font-family: var(--font-sans); color: #a0aec0; font-weight: 400; display: block; margin-top: 0.25rem; }}
        
        .nav-links {{ list-style: none; }}
        .nav-links li {{ margin-bottom: 0.85rem; }}
        .nav-links a {{ color: #cbd5e0; text-decoration: none; font-size: 0.92rem; display: flex; align-items: center; gap: 0.6rem; transition: var(--transition); padding: 0.35rem 0.5rem; border-radius: 4px; }}
        .nav-links a:hover, .nav-links a.active {{ color: #fff; background: rgba(255,255,255,0.08); }}
        
        .theme-toggle {{ margin-top: 2rem; background: rgba(255,255,255,0.05); border: 1px solid rgba(255,255,255,0.2); color: #fff; padding: 0.6rem 1rem; border-radius: 6px; cursor: pointer; width: 100%; font-size: 0.85rem; transition: var(--transition); }}
        .theme-toggle:hover {{ background: rgba(255,255,255,0.15); }}
        
        /* Componentes */
        section {{ margin-bottom: 4.5rem; scroll-margin-top: 2rem; }}
        .badge {{ display: inline-block; font-size: 0.75rem; font-weight: 600; padding: 0.2rem 0.55rem; border-radius: 4px; }}
        .badge-green {{ background: rgba(45, 156, 111, 0.15); color: var(--accent-green); }}
        .badge-amber {{ background: rgba(212, 160, 23, 0.15); color: var(--accent-amber); }}
        .badge-red {{ background: rgba(192, 57, 43, 0.15); color: var(--accent-red); }}
        .badge-blue {{ background: rgba(49, 130, 206, 0.15); color: var(--accent-blue); }}
        
        .card {{ background: var(--card-bg); border: 1px solid var(--border-color); border-radius: 10px; padding: 1.5rem; transition: var(--transition); }}
        .card:hover {{ transform: translateY(-2px); box-shadow: 0 6px 20px rgba(0,0,0,0.04); }}
        
        /* KPI Cards */
        .kpi-grid {{ display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 1.25rem; margin: 2rem 0; }}
        .kpi-card {{ background: var(--card-bg); border: 1px solid var(--border-color); padding: 1.5rem; border-radius: 10px; text-align: center; }}
        .kpi-num {{ font-size: 2.2rem; font-weight: 700; color: #06182c; margin-bottom: 0.25rem; font-family: var(--font-serif); }}
        [data-theme="dark"] .kpi-num {{ color: #ffffff; }}
        .kpi-label {{ font-size: 0.85rem; color: var(--text-muted); }}

        /* Comparador Interactivo */
        .comparador-container {{ background: var(--card-bg); border: 1px solid var(--border-color); border-radius: 12px; padding: 2rem; margin-top: 1.5rem; }}
        .select-group {{ display: flex; gap: 1.5rem; margin-bottom: 2rem; flex-wrap: wrap; }}
        .select-box {{ flex: 1; min-width: 250px; }}
        .select-box label {{ display: block; font-size: 0.85rem; font-weight: 600; margin-bottom: 0.5rem; color: var(--text-muted); }}
        .select-box select {{ width: 100%; padding: 0.75rem 1rem; border: 1px solid var(--border-color); border-radius: 6px; background: var(--card-bg); color: var(--text-main); font-size: 0.95rem; }}
        
        .comp-table {{ width: 100%; border-collapse: collapse; margin-top: 1rem; }}
        .comp-table th, .comp-table td {{ padding: 1rem 1.25rem; border: 1px solid var(--border-color); text-align: left; vertical-align: top; }}
        .comp-table th {{ background: rgba(0,0,0,0.02); font-size: 0.85rem; text-transform: uppercase; color: var(--text-muted); }}
        
        /* Botones y filtros */
        .btn {{ display: inline-flex; align-items: center; gap: 0.5rem; padding: 0.6rem 1.2rem; border-radius: 6px; font-weight: 600; text-decoration: none; cursor: pointer; border: none; font-size: 0.9rem; transition: var(--transition); }}
        .btn-primary {{ background: #06182c; color: #fff; }}
        .btn-primary:hover {{ background: #1a365d; }}
        .btn-outline {{ background: transparent; border: 1px solid var(--border-color); color: var(--text-main); }}
        .btn-outline:hover {{ background: rgba(0,0,0,0.03); }}
        
        @media (max-width: 900px) {{
            body {{ flex-direction: column; }}
            .sidebar {{ width: 100%; height: auto; position: static; padding: 1.5rem; }}
            .main-content {{ margin-left: 0; padding: 2rem 1.5rem; }}
        }}
    </style>
</head>
<body>

    <!-- Sidebar de Navegación -->
    <aside class="sidebar">
        <a href="#" class="logo">
            Brújula IA
            <span>Educación Superior Chile</span>
        </a>
        <nav>
            <ul class="nav-links">
                <li><a href="#inicio" class="active">🧭 Inicio & Propósito</a></li>
                <li><a href="#comparador">⚖️ Comparador Lado a Lado</a></li>
                <li><a href="#catalogo">📚 Catálogo de Protocolos</a></li>
                <li><a href="#censo">🏛️ Censo 54 Universidades</a></li>
                <li><a href="#ecosistema">🌐 Ecosistema & Referentes</a></li>
                <li><a href="#comunidad">💬 Comunidad & Buzón</a></li>
                <li><a href="#datos">💾 Datos Abiertos & API</a></li>
            </ul>
        </nav>
        <button class="theme-toggle" onclick="toggleTheme()">🌓 Alternar Modo Oscuro</button>
        <div style="margin-top: 3rem; font-size: 0.78rem; color: #718096; line-height: 1.4;">
            Iniciativa independiente de bien público.<br>
            Director: <strong>Eduardo Vega Toledo</strong>.<br>
            Actualizado: Octubre 2026.
        </div>
    </aside>

    <!-- Contenido Principal -->
    <main class="main-content">
        
        <!-- Header / Hero -->
        <section id="inicio">
            <span class="badge badge-blue" style="margin-bottom: 0.75rem;">Bien Público Digital • Datos Abiertos</span>
            <h1 style="font-size: 2.8rem; line-height: 1.15; margin-bottom: 1rem;">
                Radiografía y Observatorio de Inteligencia Artificial en la Educación Superior Chilena
            </h1>
            <p style="font-size: 1.15rem; color: var(--text-muted); max-width: 820px; margin-bottom: 2rem;">
                Monitoreo continuo, catálogo granular de normativas por facultad y herramientas aplicadas para docentes, directivos e investigadores. Un espacio colaborativo orientado al aprendizaje ético, la integridad formativa y la transparencia institucional.
            </p>

            <div class="kpi-grid">
                <div class="kpi-card">
                    <div class="kpi-num" id="kpi-instrumentos">52</div>
                    <div class="kpi-label">Instrumentos Catastrados</div>
                </div>
                <div class="kpi-card">
                    <div class="kpi-num" id="kpi-cobertura">66.7%</div>
                    <div class="kpi-label">Cobertura en Universidades (36/54)</div>
                </div>
                <div class="kpi-card">
                    <div class="kpi-num">17</div>
                    <div class="kpi-label">PDFs Originales en Repositorio</div>
                </div>
                <div class="kpi-card">
                    <div class="kpi-num">100%</div>
                    <div class="kpi-label">Acceso Abierto (CC BY 4.0)</div>
                </div>
            </div>

            <!-- Banner Filosofía No-Punitiva -->
            <div style="background: rgba(45, 156, 111, 0.08); border-left: 4px solid var(--accent-green); padding: 1.25rem 1.5rem; border-radius: 0 8px 8px 0; margin-top: 1.5rem;">
                <h4 style="color: var(--accent-green); margin-bottom: 0.25rem;">Nuestra Postura: Observatorio Aplicado, No un Tribunal</h4>
                <p style="font-size: 0.92rem; color: var(--text-main); margin: 0;">
                    No calificamos ni juzgamos a los planteles. Visibilizamos la diversidad de modelos de gobernanza (centralizados, federados y de plataforma) para compartir buenas prácticas, acelerar la transferencia pedagógica y apoyar a las comunidades educativas en su autorregulación.
                </p>
            </div>
        </section>

        <!-- Herramienta 1: Comparador Lado a Lado -->
        <section id="comparador">
            <h2>Comparador Lado a Lado de Políticas</h2>
            <p style="color: var(--text-muted); margin-bottom: 1.5rem;">
                Selecciona dos instituciones o facultades para contrastar sus reglas de autoría, exigencia de declaración jurada, tratamiento de datos personales y postura evaluativa.
            </p>

            <div class="comparador-container">
                <div class="select-group">
                    <div class="select-box">
                        <label for="sel-inst-1">Primera Institución / Facultad:</label>
                        <select id="sel-inst-1" onchange="actualizarComparador()"></select>
                    </div>
                    <div class="select-box">
                        <label for="sel-inst-2">Segunda Institución / Facultad:</label>
                        <select id="sel-inst-2" onchange="actualizarComparador()"></select>
                    </div>
                </div>

                <div id="resultado-comparativa">
                    <!-- Tabla comparativa inyectada con JS -->
                </div>
            </div>
        </section>

        <!-- Herramienta 2: Catálogo Filtrable con Marco GENIAL D1-D6 -->
        <section id="catalogo">
            <div style="display: flex; justify-content: space-between; align-items: flex-end; flex-wrap: wrap; gap: 1rem; margin-bottom: 1.5rem;">
                <div>
                    <h2>Catálogo Granular de Instrumentos Normativos</h2>
                    <p style="color: var(--text-muted);">Explora los 52 decretos, políticas, protocolos y guías oficiales identificadas en Chile.</p>
                </div>
                <div>
                    <input type="text" id="busqueda-input" placeholder="🔍 Buscar por U, palabra o cláusula..." 
                           oninput="filtrarCatalogo()"
                           style="padding: 0.65rem 1.25rem; border: 1px solid var(--border-color); border-radius: 6px; width: 320px; font-size: 0.9rem; background: var(--card-bg); color: var(--text-main);">
                </div>
            </div>

            <!-- Botones de Filtro Rápido Temático -->
            <div style="display: flex; gap: 0.5rem; flex-wrap: wrap; margin-bottom: 1.5rem;">
                <button class="btn btn-outline" onclick="filtrarPorClausula('tesis')">🎓 IA en Tesis / Memorias</button>
                <button class="btn btn-outline" onclick="filtrarPorClausula('datos')">🔒 Privacidad (Ley 21.719)</button>
                <button class="btn btn-outline" onclick="filtrarPorClausula('autoria')">✍️ Prohibición Autoría IA</button>
                <button class="btn btn-outline" onclick="filtrarPorClausula('decreto')">📜 Decretos Formales</button>
                <button class="btn btn-outline" onclick="filtrarCatalogo('todos')">Ver Todos</button>
            </div>

            <div id="grid-catalogo" style="display: grid; grid-template-columns: repeat(auto-fill, minmax(340px, 1fr)); gap: 1.25rem;">
                <!-- Poblado dinámicamente con JS -->
            </div>
        </section>

        <!-- Censo de 54 Universidades Oficiales -->
        <section id="censo">
            <div style="display: flex; justify-content: space-between; align-items: flex-start; flex-wrap: wrap; gap: 1rem; margin-bottom: 1.5rem;">
                <div>
                    <h2>Censo Oficial de las 54 Universidades de Chile</h2>
                    <p style="color: var(--text-muted); max-width: 750px;">
                        Cruce canónico contra la nómina oficial vigente de IES del <strong>Mineduc / SIES (Mayo 2026)</strong>.
                    </p>
                </div>
                <div style="background: rgba(45, 156, 111, 0.1); border: 1px solid var(--accent-green); padding: 0.85rem 1.5rem; border-radius: 8px; text-align: right;">
                    <div style="font-size: 1.6rem; font-weight: 700; color: var(--accent-green);">66.7%</div>
                    <div style="font-size: 0.82rem; color: var(--text-muted);">36 con documento / 18 en brecha</div>
                </div>
            </div>

            <div style="display: flex; gap: 1rem; margin-bottom: 1.5rem; border-bottom: 1px solid var(--border-color); padding-bottom: 0.5rem;">
                <button onclick="filtrarCenso('todas')" class="btn btn-outline" id="btn-c-todas">Todas (54)</button>
                <button onclick="filtrarCenso('con')" class="btn btn-outline" id="btn-c-con">Con Instrumento (36)</button>
                <button onclick="filtrarCenso('sin')" class="btn btn-outline" id="btn-c-sin">Sin Protocolo Público (18)</button>
            </div>

            <div id="grid-censo" style="display: grid; grid-template-columns: repeat(auto-fill, minmax(320px, 1fr)); gap: 1rem;">
                <!-- Tarjetas del censo -->
            </div>
        </section>

        <!-- Ecosistema y Referentes Abiertos -->
        <section id="ecosistema">
            <h2>Ecosistema Abierto: Complementariedad, No Duplicación</h2>
            <p style="color: var(--text-muted); margin-bottom: 2rem;">
                Brújula IA Educación Superior se integra armónicamente con las principales iniciativas regionales e internacionales de ciencia abierta.
            </p>

            <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(320px, 1fr)); gap: 1.5rem;">
                <div class="card" style="border-top: 4px solid #3182ce;">
                    <span class="badge badge-blue" style="margin-bottom: 0.5rem;">Nivel Macro Regional (LAC)</span>
                    <h3 style="font-size: 1.25rem;">Observatorio Regional GENIAL</h3>
                    <p style="font-size: 0.9rem; color: var(--text-muted); margin-bottom: 1rem;">
                        Proyecto Erasmus+ financiado por la UE liderado por la Universidad de Cuenca. Catastró 813 instrumentos en 33 países (con 105 de Chile) bajo el Marco Dimensional D1-D6 y el Índice de Madurez Normativa (IMN).
                    </p>
                    <a href="https://proyectogenial.org/observatorio/" target="_blank" style="color: #3182ce; font-weight: 600; text-decoration: none; font-size: 0.88rem;">
                        Visitar Observatorio GENIAL &rarr;
                    </a>
                </div>

                <div class="card" style="border-top: 4px solid #2d9c6f;">
                    <span class="badge badge-green" style="margin-bottom: 0.5rem;">Reflexión Pedagógica Nacional</span>
                    <h3 style="font-size: 1.25rem;">ObIA-Educ (UDLA Chile)</h3>
                    <p style="font-size: 0.9rem; color: var(--text-muted); margin-bottom: 1rem;">
                        Observatorio sobre el Uso de IA en Educación de la Facultad de Educación UDLA. Centrado en el andamiaje formativo, webinars, ética docente y su libro <em>"Inteligencia Artificial y Educación"</em> (2025).
                    </p>
                    <a href="https://educacion.udla.cl" target="_blank" style="color: #2d9c6f; font-weight: 600; text-decoration: none; font-size: 0.88rem;">
                        Explorar ObIA-Educ &rarr;
                    </a>
                </div>

                <div class="card" style="border-top: 4px solid #d4a017;">
                    <span class="badge badge-amber" style="margin-bottom: 0.5rem;">Estándares Globales</span>
                    <h3 style="font-size: 1.25rem;">Directrices UNESCO & Russell Group</h3>
                    <p style="font-size: 0.9rem; color: var(--text-muted); margin-bottom: 1rem;">
                        Marcos globales de referencia para la gobernanza de la IA generativa en investigación y educación, protegiendo los derechos de autor, la equidad de género y la agencia del estudiante.
                    </p>
                    <a href="https://www.unesco.org/es/articles/guia-para-el-uso-de-ia-generativa-en-educacion-e-investigacion" target="_blank" style="color: #d4a017; font-weight: 600; text-decoration: none; font-size: 0.88rem;">
                        Ver Guía UNESCO &rarr;
                    </a>
                </div>
            </div>
        </section>

        <!-- Comunidad y Buzón de Aportes -->
        <section id="comunidad">
            <div style="background: linear-gradient(135deg, #06182c 0%, #1e3a5f 100%); color: #fff; padding: 2.5rem; border-radius: 12px; box-shadow: 0 8px 30px rgba(0,0,0,0.12);">
                <div style="max-width: 800px;">
                    <span style="background: #2d9c6f; color: white; padding: 0.25rem 0.75rem; border-radius: 4px; font-size: 0.75rem; text-transform: uppercase; font-weight: 600; letter-spacing: 0.5px;">Buzón Abierto y Comunidad</span>
                    <h2 style="color: white; font-size: 2rem; margin: 0.75rem 0 1rem 0;">Construyamos este Bien Público en Red</h2>
                    <p style="color: #cbd5e0; font-size: 1rem; line-height: 1.6; margin-bottom: 1.5rem;">
                        Este observatorio se nutre de la colaboración de profesores, directores de escuela y estudiantes. ¿Tu institución aprobó lineamientos recientes? ¿Te gustaría comparar otra variable no incluida?
                    </p>
                    <div style="display: flex; gap: 1rem; flex-wrap: wrap;">
                        <a href="mailto:eduardo@evegat.cl?subject=Aporte%20Protocolo%20IA&body=Hola%20Eduardo,%0A%0AQuiero%20aportar%20el%20protocolo%20de%20la%20siguiente%20instituci%C3%B3n:%0A-%20Instituci%C3%B3n:%20%0A-%20Documento:%20%0A-%20Enlace%20o%20adjunto:%20" 
                           class="btn" style="background: #ffffff; color: #06182c; font-weight: 700;">
                            📤 Enviar un Protocolo Nuevo
                        </a>
                        <a href="mailto:eduardo@evegat.cl?subject=Sugerencia%20de%20Variable%20Br%C3%BAjula%20IA&body=Hola%20Eduardo,%0A%0AMe%20gustar%C3%ADa%20proponer%20la%20siguiente%20variable%20para%20el%20an%C3%A1lisis%20comparado:%0A%0A" 
                           class="btn" style="background: rgba(255,255,255,0.15); color: #ffffff; border: 1px solid rgba(255,255,255,0.3);">
                            💡 Proponer Nueva Variable
                        </a>
                    </div>
                </div>
            </div>
        </section>

        <!-- Descarga de Datos Abiertos -->
        <section id="datos">
            <h2>Datos Abiertos para Investigadores & API</h2>
            <p style="color: var(--text-muted); margin-bottom: 1.5rem;">
                Todos los datos recolectados están a disposición libre bajo licencia Creative Commons Attribution 4.0 International (CC BY 4.0).
            </p>

            <div style="display: flex; gap: 1rem; flex-wrap: wrap;">
                <a href="/inventario.json" download class="btn btn-primary">
                    💾 Descargar Dataset Completo (JSON)
                </a>
                <a href="https://github.com/evegat/normatia" target="_blank" class="btn btn-outline">
                    📦 Repositorio GitHub con PDFs
                </a>
            </div>
        </section>

    </main>

    <!-- Scripts y Datos Inyectados -->
    <script>
        const INVENTARIO = {inventario_json_str};
        const DATOS_BRECHA = {brecha_json_str};

        // Inicialización
        window.addEventListener('DOMContentLoaded', () => {{
            poblarSelectoresComparador();
            actualizarComparador();
            renderCatalogo(INVENTARIO);
            renderCenso('todas');
        }});

        // Modo Oscuro
        function toggleTheme() {{
            const current = document.documentElement.getAttribute('data-theme');
            const target = current === 'dark' ? 'light' : 'dark';
            document.documentElement.setAttribute('data-theme', target);
            localStorage.setItem('theme', target);
        }}
        if (localStorage.getItem('theme') === 'dark') {{
            document.documentElement.setAttribute('data-theme', 'dark');
        }}

        // Poblar Selectores del Comparador
        function poblarSelectoresComparador() {{
            const sel1 = document.getElementById('sel-inst-1');
            const sel2 = document.getElementById('sel-inst-2');
            if (!sel1 || !sel2) return;

            sel1.innerHTML = '';
            sel2.innerHTML = '';

            INVENTARIO.forEach(item => {{
                const optText = `${{item.sigla}} — ${{item.unidad}} (${{item.fecha}})`;
                const opt1 = new Option(optText, item.id);
                const opt2 = new Option(optText, item.id);
                sel1.add(opt1);
                sel2.add(opt2);
            }});

            // Seleccionar por defecto dos interesantes (ej. FAMED UChile vs ISUC PUC)
            if (sel1.options.length > 2) sel1.selectedIndex = 1;
            if (sel2.options.length > 6) sel2.selectedIndex = 6;
        }}

        // Actualizar Comparador Lado a Lado
        function actualizarComparador() {{
            const id1 = parseInt(document.getElementById('sel-inst-1').value);
            const id2 = parseInt(document.getElementById('sel-inst-2').value);

            const doc1 = INVENTARIO.find(x => x.id === id1) || INVENTARIO[0];
            const doc2 = INVENTARIO.find(x => x.id === id2) || INVENTARIO[1];

            const contenedor = document.getElementById('resultado-comparativa');
            if (!contenedor) return;

            contenedor.innerHTML = `
                <table class="comp-table">
                    <thead>
                        <tr>
                            <th style="width: 25%;">Variable de Análisis</th>
                            <th style="width: 37.5%; font-size: 1rem; color: #06182c; font-weight: 700;">${{doc1.universidad}} <br><span style="font-size:0.8rem; font-weight:normal; color:var(--text-muted);">${{doc1.unidad}}</span></th>
                            <th style="width: 37.5%; font-size: 1rem; color: #06182c; font-weight: 700;">${{doc2.universidad}} <br><span style="font-size:0.8rem; font-weight:normal; color:var(--text-muted);">${{doc2.unidad}}</span></th>
                        </tr>
                    </thead>
                    <tbody>
                        <tr>
                            <td><strong>Instrumento</strong></td>
                            <td>${{doc1.documento}} (${{doc1.fecha}})</td>
                            <td>${{doc2.documento}} (${{doc2.fecha}})</td>
                        </tr>
                        <tr>
                            <td><strong>Gobernanza</strong></td>
                            <td><span class="badge badge-blue">${{doc1.gobernanza.toUpperCase()}}</span> — ${{doc1.enforcement}}</td>
                            <td><span class="badge badge-blue">${{doc2.gobernanza.toUpperCase()}}</span> — ${{doc2.enforcement}}</td>
                        </tr>
                        <tr>
                            <td><strong>Exigencia Declaración / Prompts</strong></td>
                            <td>${{doc1.exige_declaracion ? '<span class="badge badge-green">✓ OBLIGATORIA</span>' : '<span class="badge badge-amber">Opcional / Sugerida</span>'}}</td>
                            <td>${{doc2.exige_declaracion ? '<span class="badge badge-green">✓ OBLIGATORIA</span>' : '<span class="badge badge-amber">Opcional / Sugerida</span>'}}</td>
                        </tr>
                        <tr>
                            <td><strong>Regla de Autoría IA</strong></td>
                            <td>${{doc1.ia_no_autora ? '<span class="badge badge-green">✓ Prohibida autoría IA</span>' : '<span class="badge badge-amber">No especificado</span>'}}</td>
                            <td>${{doc2.ia_no_autora ? '<span class="badge badge-green">✓ Prohibida autoría IA</span>' : '<span class="badge badge-amber">No especificado</span>'}}</td>
                        </tr>
                        <tr>
                            <td><strong>Privacidad & Datos (Ley 21.719)</strong></td>
                            <td>${{doc1.menciona_datos_personales ? '<span class="badge badge-green">✓ Cláusula de protección explícita</span>' : '<span class="badge badge-amber">Sin mención directa</span>'}}</td>
                            <td>${{doc2.menciona_datos_personales ? '<span class="badge badge-green">✓ Cláusula de protección explícita</span>' : '<span class="badge badge-amber">Sin mención directa</span>'}}</td>
                        </tr>
                        <tr>
                            <td><strong>Enfoque GENIAL (D5)</strong></td>
                            <td><span class="badge badge-blue">${{doc1.d5_enfoque || 'Habilitador / Reflexivo'}}</span></td>
                            <td><span class="badge badge-blue">${{doc2.d5_enfoque || 'Habilitador / Reflexivo'}}</span></td>
                        </tr>
                        <tr>
                            <td><strong>Acceso al Documento</strong></td>
                            <td>${{doc1.url ? `<a href="${{doc1.url}}" target="_blank" style="color:#3182ce; font-weight:600; text-decoration:none;">Descargar / Ver &rarr;</a>` : 'Repositorio Interno'}}</td>
                            <td>${{doc2.url ? `<a href="${{doc2.url}}" target="_blank" style="color:#3182ce; font-weight:600; text-decoration:none;">Descargar / Ver &rarr;</a>` : 'Repositorio Interno'}}</td>
                        </tr>
                    </tbody>
                </table>
            `;
        }}

        // Render Catálogo de Documentos
        function renderCatalogo(lista) {{
            const grid = document.getElementById('grid-catalogo');
            if (!grid) return;
            grid.innerHTML = '';

            lista.forEach(doc => {{
                const card = document.createElement('div');
                card.className = 'card';
                card.innerHTML = `
                    <div style="display:flex; justify-content:space-between; align-items:flex-start; margin-bottom:0.75rem;">
                        <span class="badge badge-blue">${{doc.sigla}}</span>
                        <span style="font-size:0.78rem; color:var(--text-muted);">${{doc.fecha}}</span>
                    </div>
                    <h4 style="font-size:1.05rem; line-height:1.3; margin-bottom:0.35rem;">${{doc.universidad}}</h4>
                    <div style="font-size:0.85rem; color:var(--text-muted); margin-bottom:0.75rem;">${{doc.unidad}}</div>
                    <p style="font-size:0.9rem; margin-bottom:1rem; color:var(--text-main); font-weight:500;">
                        ${{doc.documento}}
                    </p>
                    <div style="display:flex; gap:0.4rem; flex-wrap:wrap; margin-bottom:1rem;">
                        <span class="badge ${{doc.exige_declaracion ? 'badge-green' : 'badge-amber'}}">${{doc.exige_declaracion ? 'Declaración obligatoria' : 'Declaración optativa'}}</span>
                        ${{doc.menciona_datos_personales ? '<span class="badge badge-green">Protección datos</span>' : ''}}
                        <span class="badge badge-blue">${{doc.gobernanza}}</span>
                    </div>
                    ${{doc.url ? `<a href="${{doc.url}}" target="_blank" style="color:#3182ce; font-size:0.88rem; font-weight:600; text-decoration:none;">Acceder al documento &rarr;</a>` : '<span style="font-size:0.85rem; color:var(--text-muted);">En proceso de digitalización</span>'}}
                `;
                grid.appendChild(card);
            }});
        }}

        // Filtrado de Catálogo
        function filtrarCatalogo(tipo = '') {{
            const q = document.getElementById('busqueda-input').value.toLowerCase();
            let filtrados = INVENTARIO.filter(doc => {{
                const matchTexto = doc.universidad.toLowerCase().includes(q) || 
                                   doc.documento.toLowerCase().includes(q) || 
                                   doc.unidad.toLowerCase().includes(q) ||
                                   doc.sigla.toLowerCase().includes(q);
                return matchTexto;
            }});
            renderCatalogo(filtrados);
        }}

        function filtrarPorClausula(tipo) {{
            let filtrados = [];
            if (tipo === 'tesis') {{
                filtrados = INVENTARIO.filter(d => d.documento.toLowerCase().includes('tesis') || (d.alcance_detalle && d.alcance_detalle.toLowerCase().includes('tesis')));
            }} else if (tipo === 'datos') {{
                filtrados = INVENTARIO.filter(d => d.menciona_datos_personales);
            }} else if (tipo === 'autoria') {{
                filtrados = INVENTARIO.filter(d => d.ia_no_autora);
            }} else if (tipo === 'decreto') {{
                filtrados = INVENTARIO.filter(d => d.enforcement.toLowerCase().includes('decreto') || d.enforcement.toLowerCase().includes('resolución'));
            }} else {{
                filtrados = INVENTARIO;
            }}
            renderCatalogo(filtrados);
        }}

        // Render Censo
        function renderCenso(filtro = 'todas') {{
            const grid = document.getElementById('grid-censo');
            if (!grid) return;
            grid.innerHTML = '';

            let listado = [];
            if (filtro === 'todas' || filtro === 'con') {{
                DATOS_BRECHA.universidades_con_instrumento.forEach(u => listado.push({{ ...u, tiene: true }}));
            }}
            if (filtro === 'todas' || filtro === 'sin') {{
                DATOS_BRECHA.universidades_sin_instrumento.forEach(u => listado.push({{ ...u, tiene: false }}));
            }}

            listado.sort((a, b) => a.nombre.localeCompare(b.nombre));

            listado.forEach(u => {{
                const card = document.createElement('div');
                card.className = 'card';
                card.style.display = 'flex';
                card.style.flexDirection = 'column';
                card.style.justifyContent = 'space-between';

                const badgeColor = u.tiene ? 'var(--accent-green)' : 'var(--accent-red)';
                const badgeBg = u.tiene ? 'rgba(45, 156, 111, 0.1)' : 'rgba(192, 57, 43, 0.1)';
                const badgeText = u.tiene ? '✓ Con Instrumento' : 'Sin documento público';

                card.innerHTML = `
                    <div>
                        <div style="display:flex; justify-content:space-between; align-items:flex-start; margin-bottom:0.5rem;">
                            <span style="font-size:0.75rem; text-transform:uppercase; color:var(--text-muted); font-weight:600;">${{u.tipo}}</span>
                            <span style="font-size:0.75rem; font-weight:600; padding:0.2rem 0.5rem; border-radius:4px; color:${{badgeColor}}; background:${{badgeBg}};">${{badgeText}}</span>
                        </div>
                        <h4 style="font-size:0.98rem; line-height:1.3; margin-bottom:0.5rem;">${{u.nombre}}</h4>
                    </div>
                    <div style="margin-top:0.75rem; font-size:0.85rem;">
                        ${{u.tiene ? `
                            <span style="color:var(--text-muted);">Instrumento verificado en catastro.</span>
                        ` : `
                            <a href="mailto:eduardo@evegat.cl?subject=Aporte%20Protocolo%20${{encodeURIComponent(u.nombre)}}" style="color:#3182ce; text-decoration:none; font-weight:600;">
                                + Reportar protocolo de esta U &rarr;
                            </a>
                        `}}
                    </div>
                `;
                grid.appendChild(card);
            }});
        }}

        function filtrarCenso(tipo) {{
            document.querySelectorAll('#censo .btn').forEach(b => b.classList.remove('btn-primary'));
            const activo = document.getElementById('btn-c-' + tipo);
            if (activo) activo.classList.add('btn-primary');
            renderCenso(tipo);
        }}
    </script>
</body>
</html>'''

with open(r'D:\Proyectos\P154 - NormatIA\index.html', 'w', encoding='utf-8') as f:
    f.write(html_content)

print(f"HTML generado exitosamente! Tamaño: {len(html_content)} caracteres.")
