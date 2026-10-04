import json, re

with open(r'D:\Proyectos\P154 - brujula-ia-edusuperior\data\brecha_universidades_chile.json', encoding='utf-8') as f:
    brecha = json.load(f)

with open(r'D:\Proyectos\P154 - brujula-ia-edusuperior\index.html', 'r', encoding='utf-8') as f:
    html = f.read()

# Crear bloque de datos JSON para incrustar
brecha_json_str = json.dumps(brecha, ensure_ascii=False)

# Reemplazar la sección de Cobertura o enriquecerla
nuevo_cobertura_section = f'''
        <section id="cobertura">
            <div style="display: flex; justify-content: space-between; align-items: flex-start; flex-wrap: wrap; gap: 1rem; margin-bottom: 1.5rem;">
                <div>
                    <h2>Radiografía y Brecha Nacional de Universidades</h2>
                    <p style="color: var(--text-muted); max-width: 700px;">
                        Cruce exhaustivo contra la <strong>Nómina Oficial del Mineduc / SIES (Mayo 2026)</strong>: 54 universidades vigentes reconocidas por el Estado.
                    </p>
                </div>
                <div style="background: rgba(45, 156, 111, 0.1); border: 1px solid var(--accent-green); padding: 1rem 1.5rem; border-radius: 8px; text-align: right;">
                    <div style="font-size: 1.8rem; font-weight: 700; color: var(--accent-green);">55.6%</div>
                    <div style="font-size: 0.85rem; color: var(--text-muted);">Cobertura (30 de 54 planteles con instrumento)</div>
                </div>
            </div>

            <!-- Callout de colaboración comunitaria -->
            <div style="background: linear-gradient(135deg, #06182c 0%, #1a365d 100%); color: #ffffff; padding: 1.5rem 2rem; border-radius: 12px; margin-bottom: 2rem; display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 1.5rem; box-shadow: 0 4px 15px rgba(0,0,0,0.1);">
                <div style="max-width: 650px;">
                    <span style="background: #2d9c6f; color: white; padding: 0.2rem 0.6rem; border-radius: 4px; font-size: 0.75rem; text-transform: uppercase; font-weight: 600; letter-spacing: 0.5px;">Campaña Abierta</span>
                    <h3 style="color: white; margin: 0.5rem 0; font-size: 1.25rem;">¿Tu universidad cuenta con lineamientos y no aparece catastrada?</h3>
                    <p style="color: #cbd5e0; font-size: 0.95rem; margin: 0;">
                        Identificamos 24 universidades sin documento público accesible. Si eres docente, estudiante o directivo y tu institución aprobó una política, protocolo o guía de IA, compártela para actualizar este bien público.
                    </p>
                </div>
                <div>
                    <a href="mailto:eduardo@evegat.cl?subject=Aporte%20Protocolo%20IA%20-%20Br%C3%BAjula%20IA%20EdSup&body=Hola%20Eduardo,%0A%0AQuiero%20aportar%20informaci%C3%B3n%20sobre%20el%20protocolo/lineamiento%20de%20la%20siguiente%20universidad:%0A-%20Instituci%C3%B3n:%20%0A-%20Nombre%20del%20documento:%20%0A-%20Enlace%20o%20adjunto:%20%0A%0ASaludos!" 
                       style="background: #ffffff; color: #06182c; padding: 0.85rem 1.5rem; border-radius: 6px; font-weight: 600; text-decoration: none; display: inline-block; transition: all 0.2s ease;">
                       Compartir Protocolo &rarr;
                    </a>
                </div>
            </div>

            <!-- Tabs de navegación de brecha -->
            <div style="display: flex; gap: 1rem; margin-bottom: 1.5rem; border-bottom: 1px solid var(--border-color); padding-bottom: 0.5rem;">
                <button onclick="filtrarBrecha('todas')" class="tab-btn active" id="btn-todas" style="background:none; border:none; padding: 0.5rem 1rem; font-weight:600; cursor:pointer; color:var(--text-main); border-bottom: 2px solid #06182c;">Todas (54)</button>
                <button onclick="filtrarBrecha('con')" class="tab-btn" id="btn-con" style="background:none; border:none; padding: 0.5rem 1rem; font-weight:600; cursor:pointer; color:var(--text-muted);">Con Instrumento (30)</button>
                <button onclick="filtrarBrecha('sin')" class="tab-btn" id="btn-sin" style="background:none; border:none; padding: 0.5rem 1rem; font-weight:600; cursor:pointer; color:var(--text-muted);">Sin Protocolo Público (24)</button>
            </div>

            <div id="grid-censo-universidades" style="display: grid; grid-template-columns: repeat(auto-fill, minmax(320px, 1fr)); gap: 1rem;">
                <!-- Poblado dinámicamente con JS -->
            </div>
        </section>
'''

# Reemplazar la sección #cobertura existente
html_actualizado = re.sub(r'<section id="cobertura">.*?</section>', nuevo_cobertura_section, html, flags=re.DOTALL)

# Inyectar script de brecha antes de </script>
script_censo = f'''
        const DATOS_BRECHA = {brecha_json_str};

        function renderCenso(filtro = 'todas') {{
            const grid = document.getElementById('grid-censo-universidades');
            if (!grid) return;
            grid.innerHTML = '';

            let listado = [];
            if (filtro === 'todas' || filtro === 'con') {{
                DATOS_BRECHA.universidades_con_instrumento.forEach(u => {{
                    listado.push({{ ...u, tiene: true }});
                }});
            }}
            if (filtro === 'todas' || filtro === 'sin') {{
                DATOS_BRECHA.universidades_sin_instrumento.forEach(u => {{
                    listado.push({{ ...u, tiene: false }});
                }});
            }}

            // Ordenar alfabéticamente
            listado.sort((a, b) => a.nombre.localeCompare(b.nombre));

            listado.forEach(u => {{
                const card = document.createElement('div');
                card.style.cssText = 'background: var(--card-bg); border: 1px solid var(--border-color); border-radius: 8px; padding: 1.25rem; display: flex; flex-direction: column; justify-content: space-between;';
                
                const badgeColor = u.tiene ? 'var(--accent-green)' : 'var(--accent-red)';
                const badgeBg = u.tiene ? 'rgba(45, 156, 111, 0.1)' : 'rgba(192, 57, 43, 0.1)';
                const badgeText = u.tiene ? `${{u.total_instrumentos}} instrumento(s)` : 'Sin protocolo público';

                card.innerHTML = `
                    <div>
                        <div style="display: flex; justify-content: space-between; align-items: flex-start; gap: 0.5rem; margin-bottom: 0.5rem;">
                            <span style="font-size: 0.75rem; text-transform: uppercase; color: var(--text-muted); font-weight: 600;">${{u.tipo}}</span>
                            <span style="font-size: 0.75rem; font-weight: 600; padding: 0.2rem 0.5rem; border-radius: 4px; color: ${{badgeColor}}; background: ${{badgeBg}};">${{badgeText}}</span>
                        </div>
                        <h4 style="font-size: 1rem; margin-bottom: 0.5rem; line-height: 1.3;">${{u.nombre}}</h4>
                    </div>
                    <div style="margin-top: 1rem; font-size: 0.85rem;">
                        ${{u.tiene ? `
                            <div style="color: var(--text-muted);">
                                Principal: <em>${{u.instrumentos[0].documento.substring(0, 70)}}...</em>
                            </div>
                        ` : `
                            <a href="mailto:eduardo@evegat.cl?subject=Aporte%20Protocolo%20${{encodeURIComponent(u.nombre)}}&body=Hola%20Eduardo,%0A%0AAdjunto%20informaci%C3%B3n%20del%20protocolo%20de%20la%20universidad%20${{encodeURIComponent(u.nombre)}}:" 
                               style="color: #3182ce; text-decoration: none; font-weight: 500;">
                               + Reportar protocolo para esta U &rarr;
                            </a>
                        `}}
                    </div>
                `;
                grid.appendChild(card);
            }});
        }}

        function filtrarBrecha(tipo) {{
            document.querySelectorAll('.tab-btn').forEach(b => {{
                b.style.color = 'var(--text-muted)';
                b.style.borderBottom = 'none';
            }});
            const activo = document.getElementById('btn-' + tipo);
            if (activo) {{
                activo.style.color = 'var(--text-main)';
                activo.style.borderBottom = '2px solid #06182c';
            }}
            renderCenso(tipo);
        }}

        // Inicializar renderCenso en la carga
        window.addEventListener('DOMContentLoaded', () => {{
            renderCenso();
        }});
    </script>
'''

# Inyectar antes de </script>
if 'renderCenso' not in html_actualizado:
    html_actualizado = html_actualizado.replace('</script>\n</body>', script_censo + '\n</body>')

with open(r'D:\Proyectos\P154 - brujula-ia-edusuperior\index.html', 'w', encoding='utf-8') as f:
    f.write(html_actualizado)

print("Actualizado index.html con Censo Nacional de 54 Universidades!")

