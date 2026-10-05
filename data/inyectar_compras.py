with open(r'D:\Proyectos\P154 - Brujula IA EduSuperior\index.html', 'r', encoding='utf-8') as f:
    html = f.read()

compras_html = '''
        <!-- Nueva Sección: Compras Públicas de IA en Universidades Estatales -->
        <section id="compras">
            <div style="display:flex; justify-content:space-between; align-items:flex-start; flex-wrap:wrap; gap:1rem; margin-bottom:1.5rem;">
                <div>
                    <span class="badge badge-amber" style="margin-bottom:0.5rem;">Investigación Especial • Mercado Público</span>
                    <h2>Compras Públicas e IA: La Paradoja de la Adquisición</h2>
                    <p style="color: var(--text-muted); max-width: 800px;">
                        Cruce sobre 85 contratos de software, chatbots y soluciones analíticas adquiridas por <strong>10 Universidades Estatales</strong> a través de ChileCompra (2020–2026).
                    </p>
                </div>
            </div>

            <div style="background: var(--card-bg); border: 1px solid var(--border-color); border-radius: 12px; padding: 2rem;">
                <div style="display:grid; grid-template-columns: repeat(auto-fit, minmax(280px, 1fr)); gap: 1.5rem; margin-bottom: 2rem;">
                    <div style="border-left: 4px solid var(--accent-blue); padding-left: 1rem;">
                        <div style="font-size: 1.8rem; font-weight: 700; color: var(--accent-blue);">85</div>
                        <div style="font-size: 0.85rem; color: var(--text-muted);">Contratos de Software / Chatbots / IA</div>
                    </div>
                    <div style="border-left: 4px solid var(--accent-green); padding-left: 1rem;">
                        <div style="font-size: 1.8rem; font-weight: 700; color: var(--accent-green);">10</div>
                        <div style="font-size: 0.85rem; color: var(--text-muted);">Universidades Estatales Compradoras</div>
                    </div>
                    <div style="border-left: 4px solid var(--accent-red); padding-left: 1rem;">
                        <div style="font-size: 1.8rem; font-weight: 700; color: var(--accent-red);">30%</div>
                        <div style="font-size: 0.85rem; color: var(--text-muted);">Compran IA sin tener Protocolo de Aula</div>
                    </div>
                </div>

                <h4 style="margin-bottom: 1rem; font-size: 1.1rem;">Universidades del Estado con Contratos Tecnológicos / IA Identificados:</h4>
                <div style="display: grid; grid-template-columns: repeat(auto-fill, minmax(260px, 1fr)); gap: 1rem;">
                    <div class="card" style="padding: 1rem;"><strong>U. de Chile</strong>: 52 contratos <br><span class="badge badge-green" style="margin-top:0.4rem;">Con protocolo de aula</span></div>
                    <div class="card" style="padding: 1rem;"><strong>USACH</strong>: 6 contratos <br><span class="badge badge-green" style="margin-top:0.4rem;">Con protocolo de aula</span></div>
                    <div class="card" style="padding: 1rem;"><strong>UTEM</strong>: 6 contratos <br><span class="badge badge-red" style="margin-top:0.4rem;">Sin protocolo público</span></div>
                    <div class="card" style="padding: 1rem;"><strong>U. de Talca</strong>: 5 contratos <br><span class="badge badge-green" style="margin-top:0.4rem;">Con protocolo de aula</span></div>
                    <div class="card" style="padding: 1rem;"><strong>U. de Atacama</strong>: 5 contratos <br><span class="badge badge-green" style="margin-top:0.4rem;">Con protocolo de aula</span></div>
                    <div class="card" style="padding: 1rem;"><strong>U. de La Serena</strong>: 4 contratos <br><span class="badge badge-red" style="margin-top:0.4rem;">Sin protocolo público</span></div>
                    <div class="card" style="padding: 1rem;"><strong>UFRO</strong>: 3 contratos <br><span class="badge badge-green" style="margin-top:0.4rem;">Con protocolo de aula</span></div>
                    <div class="card" style="padding: 1rem;"><strong>U. del Bío-Bío</strong>: 2 contratos <br><span class="badge badge-red" style="margin-top:0.4rem;">Sin protocolo público</span></div>
                    <div class="card" style="padding: 1rem;"><strong>U. de Los Lagos</strong>: 1 contrato <br><span class="badge badge-green" style="margin-top:0.4rem;">Con protocolo de aula</span></div>
                    <div class="card" style="padding: 1rem;"><strong>U. de Valparaíso</strong>: 1 contrato <br><span class="badge badge-green" style="margin-top:0.4rem;">Con protocolo de aula</span></div>
                </div>

                <div style="margin-top: 1.5rem; background: rgba(0,0,0,0.03); padding: 1.25rem; border-radius: 8px; font-size: 0.9rem; color: var(--text-muted); line-height: 1.5;">
                    <strong>Hallazgo Crítico:</strong> Planteles como la UTEM, ULS o UBB destinan recursos fiscales a la contratación de soluciones de software y chatbots sin contar aún con lineamientos públicos que resguarden la privacidad del estudiante ni orienten la integridad académica en evaluaciones. Este antecedente alimenta directamente la contribución a la <strong>Consulta Global UNESCO sobre AI Procurement</strong>.
                </div>
            </div>
        </section>
'''

html_mod = html.replace('<section id="ecosistema">', compras_html + '\n        <section id="ecosistema">')
html_mod = html_mod.replace('<li><a href="#ecosistema">', '<li><a href="#compras">💰 Compras Públicas IA</a></li>\n                <li><a href="#ecosistema">')

with open(r'D:\Proyectos\P154 - Brujula IA EduSuperior\index.html', 'w', encoding='utf-8') as f:
    f.write(html_mod)

print("Sección de compras públicas inyectada con éxito!")
