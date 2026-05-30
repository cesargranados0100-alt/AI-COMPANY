#!/usr/bin/env node
/**
 * Adds "artículos relacionados" internal link section to each blog article.
 * Improves PageRank distribution and time-on-site.
 * Run: node scripts/add-internal-links.js
 */

const fs = require('fs');
const path = require('path');

const BLOG_DIR = path.resolve(__dirname, '..', 'blog');

// Map each article to 3 related articles
const RELATED = {
  'cuanto-cuesta-chatbot-ia-colombia': [
    { slug: 'como-automatizar-whatsapp-business-colombia', titulo: 'Cómo Automatizar WhatsApp Business en Colombia', emoji: '💬' },
    { slug: 'chatbot-ia-clinicas-colombia', titulo: 'Chatbot IA para Clínicas en Colombia', emoji: '🏥' },
    { slug: 'que-es-n8n-automatizacion-colombia', titulo: '¿Qué es n8n y cómo automatiza tu negocio?', emoji: '⚡' },
  ],
  'marketing-digital-restaurantes-colombia': [
    { slug: 'cuanto-cuesta-pagina-web-restaurante-colombia', titulo: '¿Cuánto Cuesta la Web de un Restaurante?', emoji: '🍽️' },
    { slug: 'automatizar-whatsapp-ferreterias-colombia', titulo: 'WhatsApp Automático para tu Negocio', emoji: '💬' },
    { slug: 'marketing-digital-gimnasios-colombia', titulo: 'Marketing Digital para Gimnasios', emoji: '💪' },
  ],
  'pagina-web-clinica-colombia': [
    { slug: 'chatbot-ia-clinicas-colombia', titulo: 'Chatbot con IA para Clínicas', emoji: '🤖' },
    { slug: 'cuanto-cuesta-chatbot-ia-colombia', titulo: '¿Cuánto Cuesta un Chatbot con IA?', emoji: '💰' },
    { slug: 'como-automatizar-whatsapp-business-colombia', titulo: 'Automatizar WhatsApp Business', emoji: '💬' },
  ],
  'automatizacion-procesos-constructoras-colombia': [
    { slug: 'que-es-n8n-automatizacion-colombia', titulo: '¿Qué es n8n y para qué sirve?', emoji: '⚡' },
    { slug: 'facturacion-electronica-automatica-colombia', titulo: 'Facturación Electrónica Automática', emoji: '🧾' },
    { slug: 'cuanto-cuesta-chatbot-ia-colombia', titulo: '¿Cuánto Cuesta un Chatbot con IA?', emoji: '🤖' },
  ],
  'whatsapp-business-hoteles-colombia': [
    { slug: 'como-automatizar-whatsapp-business-colombia', titulo: 'Cómo Automatizar WhatsApp Business', emoji: '💬' },
    { slug: 'marketing-digital-restaurantes-colombia', titulo: 'Marketing Digital para Restaurantes', emoji: '📈' },
    { slug: 'chatbot-ia-clinicas-colombia', titulo: 'Chatbot IA: Casos de Uso', emoji: '🤖' },
  ],
  'app-movil-supermercado-colombia': [
    { slug: 'como-automatizar-whatsapp-business-colombia', titulo: 'WhatsApp Automático para tu Negocio', emoji: '💬' },
    { slug: 'sistema-gestion-talleres-mecanicos-colombia', titulo: 'Sistemas de Gestión a la Medida', emoji: '⚙️' },
    { slug: 'cuanto-cuesta-chatbot-ia-colombia', titulo: '¿Cuánto Cuesta un Sistema Digital?', emoji: '💰' },
  ],
  'automatizar-whatsapp-ferreterias-colombia': [
    { slug: 'como-automatizar-whatsapp-business-colombia', titulo: 'Guía Completa WhatsApp Business API', emoji: '💬' },
    { slug: 'cuanto-cuesta-chatbot-ia-colombia', titulo: '¿Cuánto Cuesta Automatizar mi Negocio?', emoji: '💰' },
    { slug: 'sistema-gestion-talleres-mecanicos-colombia', titulo: 'Sistema de Gestión para tu Negocio', emoji: '⚙️' },
  ],
  'chatbot-ia-clinicas-colombia': [
    { slug: 'pagina-web-clinica-colombia', titulo: 'Página Web Profesional para Clínicas', emoji: '🌐' },
    { slug: 'cuanto-cuesta-chatbot-ia-colombia', titulo: '¿Cuánto Cuesta un Chatbot con IA?', emoji: '💰' },
    { slug: 'como-automatizar-whatsapp-business-colombia', titulo: 'WhatsApp Automático para Clínicas', emoji: '💬' },
  ],
  'como-automatizar-whatsapp-business-colombia': [
    { slug: 'cuanto-cuesta-chatbot-ia-colombia', titulo: '¿Cuánto Cuesta un Chatbot con IA?', emoji: '🤖' },
    { slug: 'automatizar-whatsapp-ferreterias-colombia', titulo: 'Caso Real: WhatsApp en Ferreterías', emoji: '🔧' },
    { slug: 'whatsapp-business-hoteles-colombia', titulo: 'Caso Real: WhatsApp en Hoteles', emoji: '🏨' },
  ],
  'facturacion-electronica-automatica-colombia': [
    { slug: 'que-es-n8n-automatizacion-colombia', titulo: 'n8n: Automatiza Todo tu Negocio', emoji: '⚡' },
    { slug: 'automatizacion-procesos-constructoras-colombia', titulo: 'Automatización para Empresas', emoji: '🏗️' },
    { slug: 'cuanto-cuesta-chatbot-ia-colombia', titulo: '¿Cuánto Cuesta Automatizar?', emoji: '💰' },
  ],
  'marketing-digital-gimnasios-colombia': [
    { slug: 'marketing-digital-restaurantes-colombia', titulo: 'Marketing Digital: Guía para Negocios', emoji: '📈' },
    { slug: 'cuanto-cuesta-pagina-web-restaurante-colombia', titulo: '¿Cuánto Cuesta una Página Web?', emoji: '🌐' },
    { slug: 'como-automatizar-whatsapp-business-colombia', titulo: 'WhatsApp Automático para tu Gimnasio', emoji: '💬' },
  ],
  'cuanto-cuesta-pagina-web-restaurante-colombia': [
    { slug: 'marketing-digital-restaurantes-colombia', titulo: 'Marketing Digital para Restaurantes', emoji: '📈' },
    { slug: 'cuanto-cuesta-chatbot-ia-colombia', titulo: '¿Cuánto Cuesta un Chatbot?', emoji: '🤖' },
    { slug: 'como-automatizar-whatsapp-business-colombia', titulo: 'WhatsApp Automático para Restaurantes', emoji: '💬' },
  ],
  'sistema-gestion-talleres-mecanicos-colombia': [
    { slug: 'cuanto-cuesta-chatbot-ia-colombia', titulo: '¿Cuánto Cuesta Digitalizar mi Taller?', emoji: '💰' },
    { slug: 'que-es-n8n-automatizacion-colombia', titulo: 'Herramientas de Automatización', emoji: '⚡' },
    { slug: 'facturacion-electronica-automatica-colombia', titulo: 'Facturación Electrónica para Talleres', emoji: '🧾' },
  ],
  'que-es-n8n-automatizacion-colombia': [
    { slug: 'como-automatizar-whatsapp-business-colombia', titulo: 'Automatiza WhatsApp con n8n', emoji: '💬' },
    { slug: 'automatizacion-procesos-constructoras-colombia', titulo: 'Casos Reales de Automatización', emoji: '🏗️' },
    { slug: 'facturacion-electronica-automatica-colombia', titulo: 'Automatizar Facturación con n8n', emoji: '🧾' },
  ],
};

function buildRelatedHtml(related) {
  const cards = related.map(r => `
      <a href="../${r.slug}/" class="rel-card">
        <span class="rel-emoji">${r.emoji}</span>
        <span class="rel-titulo">${r.titulo}</span>
        <span class="rel-arrow">→</span>
      </a>`).join('');

  return `
  <section class="related-section">
    <h3 class="related-title">Artículos Relacionados</h3>
    <div class="related-grid">${cards}
    </div>
  </section>`;
}

const RELATED_CSS = `
    .related-section { margin: 2.5rem 0; padding: 1.5rem; background: #12121C; border-radius: 14px; border: 1px solid #1E1E2E; }
    .related-title { color: #9B5FFF; font-size: 1rem; font-weight: 700; margin-bottom: 1rem; text-transform: uppercase; letter-spacing: 0.05em; }
    .related-grid { display: flex; flex-direction: column; gap: 0.5rem; }
    .rel-card { display: flex; align-items: center; gap: 0.75rem; padding: 0.75rem 1rem; background: #0D0D14; border-radius: 8px; border: 1px solid #1E1E2E; text-decoration: none; color: #E8E8F0; transition: border-color 0.2s; }
    .rel-card:hover { border-color: rgba(155,95,255,0.4); text-decoration: none; }
    .rel-emoji { font-size: 1.2rem; flex-shrink: 0; }
    .rel-titulo { flex: 1; font-size: 0.9rem; font-weight: 500; }
    .rel-arrow { color: #9B5FFF; flex-shrink: 0; }`;

function processArticle(slug, related) {
  const articlePath = path.join(BLOG_DIR, slug, 'index.html');
  if (!fs.existsSync(articlePath)) {
    console.log(`  SKIP ${slug} (no existe)`);
    return;
  }

  let html = fs.readFileSync(articlePath, 'utf8');

  if (html.includes('related-section')) {
    console.log(`  SKIP ${slug} (ya tiene artículos relacionados)`);
    return;
  }

  // Add CSS
  html = html.replace(/(<style[^>]*>)/, `$1${RELATED_CSS}`);

  // Add related articles before FAQ section or before </main> or before footer
  const relatedHtml = buildRelatedHtml(related);
  if (html.includes('class="faq-section"')) {
    html = html.replace('class="faq-section"', `${relatedHtml}\n\n  <section class="faq-section"`);
    html = html.replace(`<section ${relatedHtml}`, relatedHtml); // cleanup if double section tag
  } else if (html.includes('</main>')) {
    html = html.replace('</main>', relatedHtml + '\n  </main>');
  } else if (html.includes('<footer')) {
    html = html.replace('<footer', relatedHtml + '\n  <footer');
  }

  fs.writeFileSync(articlePath, html, 'utf8');
  console.log(`  ✓ ${slug}`);
}

// Fix the replacement to avoid double section tag
function processArticleSafe(slug, related) {
  const articlePath = path.join(BLOG_DIR, slug, 'index.html');
  if (!fs.existsSync(articlePath)) { console.log(`  SKIP ${slug}`); return; }

  let html = fs.readFileSync(articlePath, 'utf8');
  if (html.includes('related-section')) { console.log(`  SKIP ${slug} (ya tiene)`); return; }

  // Add CSS inside existing <style> block
  html = html.replace(/(<style[^>]*>)/, `$1${RELATED_CSS}`);

  const relHtml = buildRelatedHtml(related);

  // Insert before faq-section if present
  if (html.includes('id="preguntas-frecuentes"')) {
    html = html.replace('<section class="faq-section" id="preguntas-frecuentes">', relHtml + '\n  <section class="faq-section" id="preguntas-frecuentes">');
  } else if (html.includes('</main>')) {
    html = html.replace('</main>', relHtml + '\n  </main>');
  } else if (html.includes('<footer')) {
    html = html.replace('<footer', relHtml + '\n  <footer');
  } else {
    html = html.replace('</body>', relHtml + '\n</body>');
  }

  fs.writeFileSync(articlePath, html, 'utf8');
  console.log(`  ✓ ${slug}`);
}

console.log('Agregando artículos relacionados...\n');
Object.entries(RELATED).forEach(([slug, related]) => processArticleSafe(slug, related));
console.log('\nListo.');
