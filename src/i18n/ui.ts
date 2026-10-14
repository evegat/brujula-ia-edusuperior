// src/i18n/ui.ts
// Diccionario oficial multilingüe (ES, EN, PT) para el Observatorio Brújula IA Educación Superior

export const languages = {
  es: { code: 'es', label: 'Español', flag: '🇨🇱' },
  en: { code: 'en', label: 'English', flag: '🇬🇧' },
  pt: { code: 'pt', label: 'Português', flag: '🇧🇷' }
} as const;

export type SupportedLang = keyof typeof languages;

export const defaultLang: SupportedLang = 'es';

export const ui = {
  es: {
    // Header & Meta
    'meta.title': 'Brújula IA Educación Superior — Observatorio Abierto de Normativas',
    'meta.description': 'Observatorio abierto, catastro de 54 universidades y comparador de normativas de Inteligencia Artificial en la educación superior chilena.',
    'brand.name': 'Brújula IA',
    'brand.subtitle': 'Educación Superior Chile',
    'brand.badge': 'Matriz 54 Universidades',
    'brand.artifact': 'Artefacto activo de información de interés público sobre el uso, regulación y compras de IA en las 54 universidades oficiales de Chile.',
    
    // Theme & Navigation
    'theme.toggle': '🌓 Alternar Modo Oscuro',
    'nav.universities': '🏛️ Las 54 Universidades',
    'nav.rules': '📋 Reglas para Copiar',
    'nav.ideas': '💡 Ideas de Profes',
    'nav.procurement': '💰 Compras en Tecnología',
    'nav.catalog': '📚 Catálogo & Citas',
    'nav.methodology': '📖 Datos & Metodología',
    
    // Hero & Summary
    'hero.badge_unesco': 'Bien Público Digital • UNESCO 2021/2023',
    'hero.badge_free': '100% Abierto & Sin Fines de Lucro',
    'hero.date_cut': 'Levantamiento a Octubre 2026',
    'hero.date_cut_sub': 'Si tu universidad aprobó cambios normativos recientemente, avísanos para actualizarla.',
    'hero.stat_total': '54 Planteles Oficiales',
    'hero.stat_total_desc': 'Censo oficial Mineduc / SIES',
    'hero.stat_with_rules': '32 con Reglas de IA (59.3%)',
    'hero.stat_with_rules_desc': 'Protocolos o directrices vigentes',
    'hero.stat_gap': '22 en Brecha (40.7%)',
    'hero.stat_gap_desc': 'Sin norma pública identificada',
    'hero.stat_procurement': '85 Compras de IA',
    'hero.stat_procurement_desc': 'Licitaciones en Mercado Público',

    // Quick Guide
    'guide.title': '¿Qué necesitas hacer hoy?',
    'guide.profile1_title': 'Soy Directivo o Diseñador de Políticas',
    'guide.profile1_desc': 'Compara qué exigen otros planteles chilenos en autoría, evaluación y privacidad.',
    'guide.profile2_title': 'Soy Docente o Investigador',
    'guide.profile2_desc': 'Copia cláusulas probadas para tu syllabus y revisa ideas de actividades con IA.',
    'guide.profile3_title': 'Soy Periodista o Auditor Público',
    'guide.profile3_desc': 'Revisa el registro de compras públicas de tecnología y descarga los datasets abiertos.',

    // Buttons & Actions
    'btn.download_data': 'Descargar Datos Abiertos',
    'btn.submit_normativa': 'Aportar Normativa',
    'btn.copy_rule': 'Copiar Cláusula',
    'btn.view_details': 'Ver Ficha Completa',
    'btn.subscribe': 'Avisarme de Novedades',
    
    // Attribution & Footer
    'footer.author_title': 'Investigación y desarrollo por',
    'footer.author_name': 'Eduardo Vega Toledo',
    'footer.affiliation': 'Universidad de Chile',
    'footer.law_compliance': 'Cumplimiento estricto de la Ley N° 21.719 de Protección de Datos Personales.',
    'footer.rights': 'Datos abiertos para la investigación, la docencia y la política pública.'
  },
  en: {
    // Header & Meta
    'meta.title': 'AI Higher Education Compass — Open University Policy Observatory',
    'meta.description': 'Open observatory, 54-university census, and policy comparator for Artificial Intelligence regulation in Chilean higher education.',
    'brand.name': 'AI Compass',
    'brand.subtitle': 'Higher Education Chile',
    'brand.badge': '54 Universities Matrix',
    'brand.artifact': 'Active public-interest information artifact tracking AI use, regulation, and public procurement across all 54 official Chilean universities.',
    
    // Theme & Navigation
    'theme.toggle': '🌓 Toggle Dark Mode',
    'nav.universities': '🏛️ The 54 Universities',
    'nav.rules': '📋 Ready-to-Use Rules',
    'nav.ideas': '💡 Faculty Ideas & Cases',
    'nav.procurement': '💰 Tech Procurement',
    'nav.catalog': '📚 Catalog & Citations',
    'nav.methodology': '📖 Data & Methodology',
    
    // Hero & Summary
    'hero.badge_unesco': 'Digital Public Good • UNESCO 2021/2023',
    'hero.badge_free': '100% Open & Non-Profit',
    'hero.date_cut': 'Census Cutoff: October 2026',
    'hero.date_cut_sub': 'If your institution enacted new AI policies recently, submit an update.',
    'hero.stat_total': '54 Official Universities',
    'hero.stat_total_desc': 'Official Mineduc / SIES census',
    'hero.stat_with_rules': '32 with AI Guidelines (59.3%)',
    'hero.stat_with_rules_desc': 'Active policy frameworks',
    'hero.stat_gap': '22 Regulatory Gap (40.7%)',
    'hero.stat_gap_desc': 'No identified public policy',
    'hero.stat_procurement': '85 AI Procurement Contracts',
    'hero.stat_procurement_desc': 'Public procurement tenders',

    // Quick Guide
    'guide.title': 'What do you need to do today?',
    'guide.profile1_title': 'I am a Dean or Policy Maker',
    'guide.profile1_desc': 'Benchmark what other universities require regarding authorship, grading, and data privacy.',
    'guide.profile2_title': 'I am a Professor or Researcher',
    'guide.profile2_desc': 'Copy tested syllabus clauses and explore classroom assignments and reverse audit prompts.',
    'guide.profile3_title': 'I am a Journalist or Public Auditor',
    'guide.profile3_desc': 'Audit institutional tech procurement contracts and download raw open datasets.',

    // Buttons & Actions
    'btn.download_data': 'Download Open Datasets',
    'btn.submit_normativa': 'Submit Policy Record',
    'btn.copy_rule': 'Copy Syllabus Clause',
    'btn.view_details': 'View Institution Record',
    'btn.subscribe': 'Get Policy Alerts',
    
    // Attribution & Footer
    'footer.author_title': 'Research and technical design by',
    'footer.author_name': 'Eduardo Vega Toledo',
    'footer.affiliation': 'University of Chile',
    'footer.law_compliance': 'Strict compliance with Data Privacy Law No. 21,719 and UNESCO ethical standards.',
    'footer.rights': 'Open data for higher education research, teaching, and evidence-based public policy.'
  },
  pt: {
    // Header & Meta
    'meta.title': 'Bússola de IA no Ensino Superior — Observatório Aberto de Políticas',
    'meta.description': 'Observatório aberto, censo de 54 universidades e comparador de diretrizes de Inteligência Artificial no ensino superior chileno.',
    'brand.name': 'Bússola de IA',
    'brand.subtitle': 'Ensino Superior Chile',
    'brand.badge': 'Matriz 54 Universidades',
    'brand.artifact': 'Artefato ativo de interesse público sobre o uso, regulação e compras de IA nas 54 universidades oficiais do Chile.',
    
    // Theme & Navigation
    'theme.toggle': '🌓 Alternar Modo Escuro',
    'nav.universities': '🏛️ As 54 Universidades',
    'nav.rules': '📋 Modelos de Cláusulas',
    'nav.ideas': '💡 Ideias e Casos Docentes',
    'nav.procurement': '💰 Compras em Tecnologia',
    'nav.catalog': '📚 Catálogo e Citações',
    'nav.methodology': '📖 Dados e Metodologia',
    
    // Hero & Summary
    'hero.badge_unesco': 'Bem Público Digital • UNESCO 2021/2023',
    'hero.badge_free': '100% Aberto e Sem Fins Lucrativos',
    'hero.date_cut': 'Levantamento até Outubro de 2026',
    'hero.date_cut_sub': 'Se a sua universidade aprovou novas diretrizes recentemente, envie-nos para atualização.',
    'hero.stat_total': '54 Universidades Oficiais',
    'hero.stat_total_desc': 'Censo oficial Mineduc / SIES',
    'hero.stat_with_rules': '32 com Políticas de IA (59.3%)',
    'hero.stat_with_rules_desc': 'Protocolos e diretrizes vigentes',
    'hero.stat_gap': '22 em Lacuna Regulatória (40.7%)',
    'hero.stat_gap_desc': 'Sem política pública identificada',
    'hero.stat_procurement': '85 Contratos de Compras',
    'hero.stat_procurement_desc': 'Licitações em compras públicas',

    // Quick Guide
    'guide.title': 'O que você precisa consultar hoje?',
    'guide.profile1_title': 'Sou Gestor Universitário ou Formulador de Políticas',
    'guide.profile1_desc': 'Compare o que outras universidades exigem em autoria, avaliação e privacidade de dados.',
    'guide.profile2_title': 'Sou Docente ou Pesquisador',
    'guide.profile2_desc': 'Copie cláusulas testadas para seus planos de aula e veja práticas docentes aplicadas.',
    'guide.profile3_title': 'Sou Jornalista ou Auditor Público',
    'guide.profile3_desc': 'Consulte contratos de compras públicas em tecnologia e baixe bases de dados abertas.',

    // Buttons & Actions
    'btn.download_data': 'Baixar Dados Abertos',
    'btn.submit_normativa': 'Enviar Diretriz Universitária',
    'btn.copy_rule': 'Copiar Cláusula',
    'btn.view_details': 'Ver Ficha Completa',
    'btn.subscribe': 'Receber Notificações',
    
    // Attribution & Footer
    'footer.author_title': 'Pesquisa e arquitetura técnica por',
    'footer.author_name': 'Eduardo Vega Toledo',
    'footer.affiliation': 'Universidade do Chile',
    'footer.law_compliance': 'Conformidade estrita com a Lei Nº 21.719 e recomendações éticas da UNESCO.',
    'footer.rights': 'Dados abertos para pesquisa acadêmica, docência e formulação de políticas públicas.'
  }
} as const;

export function useTranslations(lang: SupportedLang = 'es') {
  return function t(key: keyof typeof ui['es']): string {
    const langDict = ui[lang] || ui.es;
    return (langDict as any)[key] || (ui.es as any)[key] || key;
  };
}
