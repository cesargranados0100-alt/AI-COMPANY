#!/usr/bin/env node
/**
 * Automated blog post generator for aicompanyco.com
 * Reads topics from blog-topics.json, picks next unpublished topic,
 * fetches Google News for context, generates full HTML via Claude API,
 * saves the post and updates the sitemap.
 */

const fs = require('fs');
const path = require('path');
const https = require('https');
const { execSync } = require('child_process');

const Anthropic = require('@anthropic-ai/sdk');

const ROOT = path.resolve(__dirname, '..');
const TOPICS_FILE = path.join(__dirname, 'blog-topics.json');
const BLOG_DIR = path.join(ROOT, 'blog');
const SITEMAP_SEO  = path.join(ROOT, 'sitemap-seo.xml');
const SITEMAP_MAIN = path.join(ROOT, 'sitemap-main.xml');

// ─── helpers ────────────────────────────────────────────────────────────────

function fetchUrl(url) {
  return new Promise((resolve, reject) => {
    https.get(url, { headers: { 'User-Agent': 'Mozilla/5.0 (compatible; BlogBot/1.0)' } }, (res) => {
      let data = '';
      res.on('data', (chunk) => (data += chunk));
      res.on('end', () => resolve(data));
    }).on('error', reject);
  });
}

async function fetchGoogleNews(keyword) {
  try {
    const q = encodeURIComponent(`${keyword} Colombia 2026`);
    const url = `https://news.google.com/rss/search?q=${q}&hl=es-419&gl=CO&ceid=CO:es-419`;
    const xml = await fetchUrl(url);
    const items = [];
    const itemRegex = /<item>([\s\S]*?)<\/item>/g;
    let match;
    while ((match = itemRegex.exec(xml)) !== null && items.length < 5) {
      const titleMatch = match[1].match(/<title><!\[CDATA\[(.*?)\]\]><\/title>/);
      const descMatch = match[1].match(/<description><!\[CDATA\[(.*?)\]\]><\/description>/);
      if (titleMatch) {
        items.push({
          title: titleMatch[1],
          description: descMatch ? descMatch[1].replace(/<[^>]+>/g, '').slice(0, 200) : '',
        });
      }
    }
    return items;
  } catch {
    return [];
  }
}

function getPublishedSlugs() {
  if (!fs.existsSync(BLOG_DIR)) return new Set();
  return new Set(
    fs.readdirSync(BLOG_DIR).filter((d) =>
      fs.existsSync(path.join(BLOG_DIR, d, 'index.html'))
    )
  );
}

function getTodayISO() {
  return new Date().toISOString().split('T')[0];
}

function monthName(dateStr) {
  const months = ['Enero','Febrero','Marzo','Abril','Mayo','Junio','Julio','Agosto','Septiembre','Octubre','Noviembre','Diciembre'];
  const d = new Date(dateStr);
  return `${months[d.getMonth()]} ${d.getDate()}, ${d.getFullYear()}`;
}

const SERVICIO_EMOJI = {
  'chatbot-ia': '🤖',
  'whatsapp-automatico': '💬',
  'paginas-web': '🌐',
  'marketing-digital': '📈',
  'apps-empresariales': '📱',
  'asistente-ia': '⚡',
};

function updateBlogIndex(topic, dateStr) {
  const indexPath = path.join(BLOG_DIR, 'index.html');
  if (!fs.existsSync(indexPath)) return;

  let html = fs.readFileSync(indexPath, 'utf8');

  // Don't add duplicate
  if (html.includes(`href="${topic.slug}/"`)) return;

  const emoji = SERVICIO_EMOJI[topic.servicio] || '📄';
  const fecha = monthName(dateStr);

  const card = `
      <article class="post-card">
        <div class="post-thumb">${emoji}</div>
        <div class="post-card-body">
          <span class="post-category">${topic.categoria}</span>
          <h2><a href="${topic.slug}/" style="color:#fff;">${topic.titulo}</a></h2>
          <p>Guía práctica sobre ${topic.keyword} para empresas colombianas. Publicado por AI Company CO.</p>
          <div class="post-meta">
            <span>${fecha}</span>
            <a href="${topic.slug}/" class="read-link">Leer guía →</a>
          </div>
        </div>
      </article>`;

  // Insert at the top of the posts grid
  html = html.replace('<div class="posts-grid">', `<div class="posts-grid">${card}`);
  fs.writeFileSync(indexPath, html, 'utf8');
  console.log('Blog index updated');
}

// ─── sitemap updater ─────────────────────────────────────────────────────────

function updateSitemap(slug, dateStr) {
  const url   = `https://aicompanyco.com/blog/${slug}/`;
  const entry = `  <url>\n    <loc>${url}</loc>\n    <lastmod>${dateStr}</lastmod>\n    <changefreq>monthly</changefreq>\n    <priority>0.75</priority>\n  </url>`;

  // ── sitemap-seo.xml ──────────────────────────────────────────────────────
  if (!fs.existsSync(SITEMAP_SEO)) {
    fs.writeFileSync(SITEMAP_SEO,
      `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${entry}\n</urlset>`,
      'utf8');
  } else {
    let s = fs.readFileSync(SITEMAP_SEO, 'utf8');
    if (!s.includes(url)) {
      s = s.replace('</urlset>', `${entry}\n</urlset>`);
      fs.writeFileSync(SITEMAP_SEO, s, 'utf8');
    }
  }

  // ── sitemap-main.xml (el que Google usa para indexar el blog) ────────────
  if (fs.existsSync(SITEMAP_MAIN)) {
    let s = fs.readFileSync(SITEMAP_MAIN, 'utf8');
    if (!s.includes(url)) {
      s = s.replace('</urlset>', `${entry}\n</urlset>`);
      fs.writeFileSync(SITEMAP_MAIN, s, 'utf8');
      console.log(`  → sitemap-main.xml actualizado con ${url}`);
    }
  }
}

// ─── Google Indexing ping ────────────────────────────────────────────────────

async function pingGoogle(slug) {
  const blogUrl = `https://aicompanyco.com/blog/${slug}/`;
  const sitemapUrl = 'https://aicompanyco.com/sitemap.xml';

  // Ping 1: notificar sitemap actualizado
  try {
    await fetchUrl(`https://www.google.com/ping?sitemap=${encodeURIComponent(sitemapUrl)}`);
    console.log(`  → Google sitemap ping OK`);
  } catch (e) {
    console.log(`  → Google sitemap ping falló: ${e.message}`);
  }

  // Ping 2: Google Indexing API (si hay credenciales configuradas)
  const indexingKey = process.env.GOOGLE_INDEXING_KEY;
  if (indexingKey) {
    try {
      const creds = JSON.parse(indexingKey);
      const token = await getGoogleToken(creds);
      await notifyGoogleIndexing(blogUrl, token);
      console.log(`  → Google Indexing API: ${blogUrl} notificada`);
    } catch (e) {
      console.log(`  → Google Indexing API falló: ${e.message}`);
    }
  }
}

async function getGoogleToken(creds) {
  const now = Math.floor(Date.now() / 1000);
  const header = Buffer.from(JSON.stringify({ alg: 'RS256', typ: 'JWT' })).toString('base64url');
  const payload = Buffer.from(JSON.stringify({
    iss: creds.client_email,
    scope: 'https://www.googleapis.com/auth/indexing',
    aud: 'https://oauth2.googleapis.com/token',
    exp: now + 3600,
    iat: now,
  })).toString('base64url');

  const { createSign } = require('crypto');
  const sign = createSign('RSA-SHA256');
  sign.update(`${header}.${payload}`);
  const sig = sign.sign(creds.private_key, 'base64url');
  const jwt = `${header}.${payload}.${sig}`;

  const body = `grant_type=urn%3Aietf%3Aparams%3Aoauth%3Agrant-type%3Ajwt-bearer&assertion=${jwt}`;
  const res = await fetchUrl('https://oauth2.googleapis.com/token', {
    method: 'POST', body, contentType: 'application/x-www-form-urlencoded'
  });
  const data = JSON.parse(res);
  if (!data.access_token) throw new Error(data.error_description || 'No token');
  return data.access_token;
}

async function notifyGoogleIndexing(url, token) {
  return new Promise((resolve, reject) => {
    const body = JSON.stringify({ url, type: 'URL_UPDATED' });
    const req = require('https').request({
      hostname: 'indexing.googleapis.com',
      path: '/v3/urlNotifications:publish',
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(body),
      }
    }, (res) => {
      let d = '';
      res.on('data', c => d += c);
      res.on('end', () => {
        const json = JSON.parse(d || '{}');
        if (res.statusCode !== 200) reject(new Error(json.error?.message || d));
        else resolve(json);
      });
    });
    req.on('error', reject);
    req.write(body);
    req.end();
  });
}

// ─── IndexNow ────────────────────────────────────────────────────────────────
async function pingIndexNow(url) {
  const key  = 'a7f3c9e2b8d1f4e6a2c5b9d3e7f1a4c8';
  const body = JSON.stringify({ host: 'aicompanyco.com', key, urlList: [url] });
  return new Promise((resolve) => {
    const req = require('https').request({
      hostname: 'api.indexnow.org', path: '/indexnow', method: 'POST',
      headers: { 'Content-Type': 'application/json; charset=utf-8', 'Content-Length': Buffer.byteLength(body) },
    }, res => { res.resume(); console.log(`  → IndexNow: ${res.statusCode}`); resolve(); });
    req.on('error', e => { console.log(`  → IndexNow error: ${e.message}`); resolve(); });
    req.write(body); req.end();
  });
}

// ─── HTML builder (used as fallback structure context for Claude) ────────────

function buildSystemPrompt() {
  return `Eres un redactor SEO experto para aicompanyco.com, una agencia de tecnología e inteligencia artificial en Colombia.

CONTEXTO DE LA EMPRESA:
- Nombre: AI Company CO
- Servicios: Chatbot con IA, WhatsApp Automático, Páginas Web, Marketing Digital, Apps Empresariales, Asistente IA
- Ubicación: Soacha, Cundinamarca, Colombia
- Teléfono WhatsApp: +57 321 267 4754
- URL: https://aicompanyco.com
- Autor schema: César Granados

ESTILO DE ESCRITURA:
- Directo, práctico, enfocado en resultados reales para empresas colombianas
- Incluir datos concretos, precios en COP, ejemplos locales
- Sin fluff corporativo, sin clichés vacíos
- Párrafos cortos, lectores en pantalla móvil

FORMATO DE SALIDA:
Devuelve SOLO el HTML completo del artículo. Sin explicaciones adicionales, sin markdown, sin bloques de código.
El HTML debe comenzar con <!DOCTYPE html> y terminar con </html>.`;
}

function buildUserPrompt(topic, newsItems, dateStr) {
  const newsContext = newsItems.length > 0
    ? `\n\nNOTICIAS RECIENTES RELEVANTES (úsalas para añadir frescura y contexto actual):\n${newsItems.map((n, i) => `${i + 1}. ${n.title}\n   ${n.description}`).join('\n\n')}`
    : '';

  const serviceLinks = {
    'chatbot-ia': '../../servicios/chatbot-ia/',
    'whatsapp-automatico': '../../servicios/whatsapp-automatico/',
    'paginas-web': '../../servicios/paginas-web/',
    'marketing-digital': '../../servicios/marketing-digital/',
    'apps-empresariales': '../../servicios/apps-empresariales/',
    'asistente-ia': '../../servicios/asistente-ia/',
  };
  const serviceLink = serviceLinks[topic.servicio] || '../../index_con_logo.html#servicios';
  const serviceName = {
    'chatbot-ia': 'Chatbot con IA',
    'whatsapp-automatico': 'WhatsApp Automático',
    'paginas-web': 'Páginas Web',
    'marketing-digital': 'Marketing Digital',
    'apps-empresariales': 'Apps Empresariales',
    'asistente-ia': 'Asistente IA',
  }[topic.servicio] || 'Nuestro Servicio';

  const waText = encodeURIComponent(`Hola, leí el artículo sobre ${topic.keyword} y quiero más información.`);
  const waLink = `https://wa.me/573212674754?text=${waText}`;

  return `Escribe un artículo de blog SEO completo en HTML para el siguiente tema:

TÍTULO: ${topic.titulo}
KEYWORD PRINCIPAL: ${topic.keyword}
CATEGORÍA: ${topic.categoria}
INDUSTRIA OBJETIVO: ${topic.industria || 'general Colombia'}
SERVICIO RELACIONADO: ${serviceName}
FECHA DE PUBLICACIÓN: ${dateStr}${newsContext}

ESTRUCTURA REQUERIDA DEL HTML:
- DOCTYPE html, lang="es-CO"
- Meta charset, viewport, title (con "| AI Company CO"), meta description única (150-160 chars)
- Canonical: https://aicompanyco.com/blog/${topic.slug}/
- Favicon: ../../logo.png
- Google Fonts: Orbitron + DM Sans (igual que el sitio)
- Schema.org Article JSON-LD con datePublished="${dateStr}", dateModified="${dateStr}", author Organization "AI Company CO". OBLIGATORIO incluir campo "image": {"@type":"ImageObject","url":"https://aicompanyco.com/logo.png","width":400,"height":400} dentro del schema Article.
- Schema.org FAQPage JSON-LD adicional (segundo bloque <script type="application/ld+json">) con las mismas 4 preguntas frecuentes del artículo en formato {"@context":"https://schema.org","@type":"FAQPage","mainEntity":[{"@type":"Question","name":"¿Pregunta?","acceptedAnswer":{"@type":"Answer","text":"Respuesta."}},...]}.
- CSS inline con estas variables: --purple-dark:#5A00B8; --purple-light:#9B5FFF; --bg:#0D0D14; --bg2:#12121C; --text:#E8E8F0; --text-muted:#8A8D99;
- Clases CSS iguales al sitio: .container (max-width:760px), .hero, .post-category, .post-meta, .article-body, .callout, .cta-inline, .btn-wa, .breadcrumb, .use-case (opcional)
- NAV fijo con link a ../../index_con_logo.html y botón "Hablemos →" a ../../index_con_logo.html#contacto
- BREADCRUMB: Inicio / Blog / [título corto]
- HERO con .post-category, h1 con el título, .post-meta con "Por AI Company CO · ${monthName(dateStr)} · X minutos de lectura"

CONTENIDO DEL ARTÍCULO (mínimo 800 palabras):
1. Párrafo de apertura: problema real que enfrenta la industria objetivo en Colombia hoy
2. Sección principal con h2: qué es la solución / cómo funciona
3. Casos de uso o ejemplos concretos (usar .use-case o lista)
4. CTA inline en medio del artículo (usar .cta-inline + .btn-wa con link: ${waLink})
5. Sección de costos/inversión con cifras en COP realistas para Colombia
6. .callout con dato estadístico o ROI concreto
7. Sección "Preguntas frecuentes" (mínimo 3 Q&A)
8. CTA final (.cta-inline)

FOOTER:
- Link a ../../index_con_logo.html
- Links internos: ${serviceLink} (${serviceName}), ../../blog/ (Blog), ../../index_con_logo.html#contacto (Contacto)
- Copyright: © 2026 AI Company CO · Soacha, Cundinamarca, Colombia

IMPORTANTE:
- Rutas relativas: logo ../../logo.png, nav links ../../...
- No uses imágenes externas (solo el logo local)
- El artículo debe ser ÚNICO, con datos reales de Colombia, no solo variables intercambiadas
- Asegúrate de que el HTML esté completo y bien formado`;
}

// ─── main ────────────────────────────────────────────────────────────────────

async function main() {
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    console.error('ERROR: ANTHROPIC_API_KEY not set');
    process.exit(1);
  }

  const topics = JSON.parse(fs.readFileSync(TOPICS_FILE, 'utf8'));
  const published = getPublishedSlugs();

  const pending = topics.filter((t) => !published.has(t.slug));
  if (pending.length === 0) {
    console.log('All topics already published. Nothing to do.');
    return;
  }

  // pick the first unpublished topic (ordered list = editorial calendar)
  const topic = pending[0];
  console.log(`\nGenerating: ${topic.titulo}`);
  console.log(`Slug: ${topic.slug}`);

  // fetch news for freshness context
  console.log('Fetching Google News...');
  const newsItems = await fetchGoogleNews(topic.keyword);
  console.log(`Found ${newsItems.length} news items`);

  // call Claude API
  const client = new Anthropic({ apiKey });
  const dateStr = getTodayISO();

  console.log('Calling Claude API...');
  const message = await client.messages.create({
    model: 'claude-sonnet-4-6',
    max_tokens: 8192,
    system: buildSystemPrompt(),
    messages: [{ role: 'user', content: buildUserPrompt(topic, newsItems, dateStr) }],
  });

  const html = message.content[0].text.trim();

  if (!html.includes('<!DOCTYPE html>') && !html.includes('<!doctype html>')) {
    console.error('ERROR: Claude did not return valid HTML');
    console.error(html.slice(0, 500));
    process.exit(1);
  }

  // save file
  const outDir = path.join(BLOG_DIR, topic.slug);
  fs.mkdirSync(outDir, { recursive: true });
  const outFile = path.join(outDir, 'index.html');
  fs.writeFileSync(outFile, html, 'utf8');
  console.log(`Saved: blog/${topic.slug}/index.html`);

  // update sitemaps (seo + main)
  updateSitemap(topic.slug, dateStr);
  console.log('Sitemaps updated');

  // update blog index
  updateBlogIndex(topic, dateStr);

  // notify Google + IndexNow
  await pingGoogle(topic.slug);
  await pingIndexNow(`https://aicompanyco.com/blog/${topic.slug}/`);

  // print summary for CI log
  console.log(`\n✓ Published: ${topic.titulo}`);
  console.log(`  URL: https://aicompanyco.com/blog/${topic.slug}/`);
  console.log(`  Date: ${dateStr}`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
