#!/usr/bin/env node
/**
 * Template-based blog generator for aicompanyco.com
 * Generates full HTML articles from blog-topics.json using predefined templates.
 * Zero AI API calls — all content from code templates.
 */

const fs   = require('fs');
const path = require('path');
const https = require('https');

const ROOT           = path.resolve(__dirname, '..');
const TOPICS_FILE    = path.join(__dirname, 'blog-topics.json');
const BLOG_DIR       = path.join(ROOT, 'blog');
const SITEMAP_MAIN   = path.join(ROOT, 'sitemap-main.xml');
const SITEMAP_SEO    = path.join(ROOT, 'sitemap-seo.xml');

// ─── helpers ──────────────────────────────────────────────────────────────────

function getTodayISO() { return new Date().toISOString().split('T')[0]; }

function monthName(dateStr) {
  const months = ['Enero','Febrero','Marzo','Abril','Mayo','Junio','Julio','Agosto','Septiembre','Octubre','Noviembre','Diciembre'];
  const d = new Date(dateStr + 'T12:00:00');
  return `${months[d.getMonth()]} ${d.getDate()}, ${d.getFullYear()}`;
}

function getPublishedSlugs() {
  if (!fs.existsSync(BLOG_DIR)) return new Set();
  return new Set(
    fs.readdirSync(BLOG_DIR).filter(d => fs.existsSync(path.join(BLOG_DIR, d, 'index.html')))
  );
}

// ─── Precios y datos por servicio ─────────────────────────────────────────────

const SERVICIOS = {
  'chatbot-ia': {
    nombre: 'Chatbot con IA',
    emoji: '🤖',
    desc: 'un chatbot con inteligencia artificial que atiende clientes automáticamente',
    precios: [
      { plan: 'Básico', precio: '$1.500.000', detalle: 'chatbot con respuestas predefinidas y flujos automáticos' },
      { plan: 'Profesional', precio: '$2.800.000', detalle: 'IA avanzada, integración WhatsApp y CRM, reportes' },
      { plan: 'Empresarial', precio: '$4.500.000+', detalle: 'solución a medida, múltiples canales, soporte prioritario' },
    ],
    beneficio: 'reducción del 70% en tiempo de respuesta al cliente',
    stat: 'El 67% de los consumidores prefieren chatbots para resolver dudas simples (Salesforce 2025)',
    cta: 'Ver Servicio de Chatbot IA',
    link: '../../servicios/chatbot-ia/',
  },
  'whatsapp-automatico': {
    nombre: 'WhatsApp Automático',
    emoji: '💬',
    desc: 'automatización de WhatsApp Business para atender y convertir clientes 24/7',
    precios: [
      { plan: 'Starter', precio: '$1.200.000', detalle: 'respuestas automáticas, catálogo, hasta 500 mensajes/mes' },
      { plan: 'Business', precio: '$2.200.000', detalle: 'flujos inteligentes, integración pagos, hasta 2.000 mensajes/mes' },
      { plan: 'Enterprise', precio: '$3.800.000+', detalle: 'volumen ilimitado, multi-agente, IA conversacional' },
    ],
    beneficio: 'aumento del 40% en tasa de conversión de leads',
    stat: 'Colombia tiene más de 35 millones de usuarios activos en WhatsApp (Meta 2025)',
    cta: 'Ver WhatsApp Automático',
    link: '../../servicios/whatsapp-automatico/',
  },
  'paginas-web': {
    nombre: 'Páginas Web',
    emoji: '🌐',
    desc: 'páginas web profesionales optimizadas para SEO y conversión de clientes',
    precios: [
      { plan: 'Landing', precio: '$1.800.000', detalle: 'página de presentación, formulario de contacto, SEO básico' },
      { plan: 'Corporativa', precio: '$3.200.000', detalle: 'sitio completo con blog, SEO avanzado, diseño a medida' },
      { plan: 'E-commerce', precio: '$5.500.000+', detalle: 'tienda online completa, pasarela de pagos, inventario' },
    ],
    beneficio: '3x más solicitudes de clientes vs. presencia solo en redes',
    stat: 'El 75% de los colombianos juzga la credibilidad de un negocio por su página web (IAB Colombia 2025)',
    cta: 'Ver Servicio de Páginas Web',
    link: '../../servicios/paginas-web/',
  },
  'marketing-digital': {
    nombre: 'Marketing Digital',
    emoji: '📈',
    desc: 'estrategias de marketing digital en Google, Meta y redes sociales para generar clientes',
    precios: [
      { plan: 'Básico', precio: '$1.500.000/mes', detalle: 'gestión de 1 canal, pauta desde $500.000, reportes mensuales' },
      { plan: 'Growth', precio: '$2.800.000/mes', detalle: 'Google + Meta, pauta desde $1.500.000, optimización continua' },
      { plan: 'Full Stack', precio: '$4.500.000+/mes', detalle: 'todos los canales, estrategia integral, equipo dedicado' },
    ],
    beneficio: 'ROI promedio de 4x en campañas de Google Ads para pymes colombianas',
    stat: 'El costo por clic en Google Colombia es 60% más económico que en México o España (Google Ads 2025)',
    cta: 'Ver Marketing Digital',
    link: '../../servicios/marketing-digital/',
  },
  'apps-empresariales': {
    nombre: 'Apps Empresariales',
    emoji: '📱',
    desc: 'aplicaciones y sistemas de gestión a medida para optimizar operaciones del negocio',
    precios: [
      { plan: 'Sistema Básico', precio: '$3.500.000', detalle: 'módulos de inventario o ventas, usuarios ilimitados' },
      { plan: 'App Completa', precio: '$6.500.000', detalle: 'sistema integral, app móvil, reportes en tiempo real' },
      { plan: 'Solución Enterprise', precio: '$12.000.000+', detalle: 'desarrollo a medida, integraciones, soporte 24/7' },
    ],
    beneficio: 'reducción del 50% en tiempo de gestión operativa',
    stat: 'Las pymes colombianas que digitalizan sus operaciones crecen 2.3x más rápido (MinTIC 2025)',
    cta: 'Ver Apps Empresariales',
    link: '../../servicios/apps-empresariales/',
  },
  'asistente-ia': {
    nombre: 'Asistente IA',
    emoji: '⚡',
    desc: 'implementación de inteligencia artificial y automatización de procesos para tu negocio',
    precios: [
      { plan: 'Automatización Básica', precio: '$1.800.000', detalle: '2-3 flujos automatizados, integración con herramientas existentes' },
      { plan: 'IA Integrada', precio: '$3.500.000', detalle: 'asistente IA personalizado, 5+ automatizaciones, dashboard' },
      { plan: 'Transformación Digital', precio: '$7.000.000+', detalle: 'consultoría + implementación completa, formación del equipo' },
    ],
    beneficio: 'ahorro de 15 horas semanales en tareas repetitivas',
    stat: 'Las empresas que usan IA en Colombia reportan una reducción del 35% en costos operativos (ANDI 2025)',
    cta: 'Ver Asistente IA',
    link: '../../servicios/asistente-ia/',
  },
};

// ─── Casos de uso por industria ───────────────────────────────────────────────

const CASOS_INDUSTRIA = {
  restaurantes: [
    'Recibir pedidos por WhatsApp con menú interactivo y confirmación automática',
    'Gestionar reservas de mesa sin intermediarios ni llamadas perdidas',
    'Enviar promociones del día a clientes frecuentes con un clic',
  ],
  hoteles: [
    'Gestionar reservas directas sin pagar comisiones a OTAs como Booking',
    'Responder consultas de disponibilidad y tarifas las 24 horas',
    'Enviar check-in online y instrucciones de llegada automáticamente',
  ],
  clinicas: [
    'Confirmar y recordar citas médicas reduciendo no-shows en un 60%',
    'Responder preguntas frecuentes sobre servicios y precios sin ocupar recepción',
    'Gestionar autorizaciones y documentos de pacientes digitalmente',
  ],
  inmobiliarias: [
    'Calificar compradores automáticamente antes de agendar visitas',
    'Enviar fichas de inmuebles por WhatsApp según las preferencias del lead',
    'Hacer seguimiento automático a prospectos que no han respondido',
  ],
  colegios: [
    'Responder consultas de padres sobre matrículas, horarios y tarifas',
    'Enviar circulares, notas y comunicados masivos por WhatsApp',
    'Automatizar el proceso de inscripción con formularios digitales',
  ],
  talleres: [
    'Recibir solicitudes de cita para diagnóstico sin llamadas',
    'Enviar cotizaciones automáticas con fotos del vehículo',
    'Notificar al cliente cuando su vehículo esté listo para recoger',
  ],
  barberias: [
    'Permitir reservar cita con barbero preferido desde WhatsApp',
    'Recordar citas automáticamente y reducir ausencias',
    'Fidelizar clientes con promociones personalizadas',
  ],
  ferreterias: [
    'Consultar disponibilidad de productos por WhatsApp o chat web',
    'Generar cotizaciones automáticas para proyectos de construcción',
    'Controlar inventario con alertas de stock mínimo en tiempo real',
  ],
  gimnasios: [
    'Gestionar renovaciones de membresía con cobros automáticos por Nequi o PSE',
    'Recordar clases y actividades del día a los miembros',
    'Automatizar seguimiento a clientes inactivos para retenerlos',
  ],
  veterinarias: [
    'Agendar citas de vacunación y control con recordatorios automáticos',
    'Enviar historial médico digital de mascotas a sus dueños',
    'Notificar cuando lleguen medicamentos o accesorios solicitados',
  ],
  odontologia: [
    'Confirmar citas con 24 horas de anticipación para reducir cancelaciones',
    'Enviar instrucciones post-tratamiento automáticamente por WhatsApp',
    'Gestionar planes de pago y recordatorios de cuotas',
  ],
  droguerias: [
    'Recibir pedidos con fórmula médica por WhatsApp y confirmar disponibilidad',
    'Notificar cuando estén listos los medicamentos para recoger o domicilio',
    'Gestionar programa de fidelización con descuentos automáticos',
  ],
  ecommerce: [
    'Responder consultas de productos, tallas y disponibilidad al instante',
    'Automatizar seguimiento de envíos y notificaciones de entrega',
    'Recuperar carritos abandonados con mensajes personalizados',
  ],
  'clinicas-estetica': [
    'Gestionar agenda de procedimientos con recordatorios pre y post tratamiento',
    'Enviar recomendaciones de cuidado personalizadas después de cada sesión',
    'Atraer nuevos clientes con campañas de temporada en Meta e Instagram',
  ],
  juridicos: [
    'Calificar consultas jurídicas antes de agendar cita con el abogado',
    'Automatizar seguimiento de casos y documentos pendientes',
    'Enviar actualizaciones del proceso judicial a los clientes',
  ],
  constructoras: [
    'Gestionar solicitudes de cotización de proyectos desde la web o WhatsApp',
    'Automatizar el seguimiento de obras con reportes de avance al cliente',
    'Coordinar proveedores y contratistas con flujos de aprobación digital',
  ],
  supermercados: [
    'Gestionar pedidos de domicilio por WhatsApp con catálogo digital',
    'Enviar ofertas de la semana segmentadas por historial de compras',
    'Automatizar programa de puntos y descuentos para clientes frecuentes',
  ],
  peluquerias: [
    'Reservar cita con estilista preferido desde el celular sin llamar',
    'Recordar citas y enviar confirmación automática con la dirección',
    'Fidelizar clientes con descuento en la siguiente visita por referidos',
  ],
  agencias_de_viajes: [
    'Cotizar paquetes turísticos automáticamente según destino y presupuesto',
    'Enviar recordatorios de documentos y preparativos antes del viaje',
    'Hacer seguimiento a leads que consultaron pero no compraron',
  ],
  spa: [
    'Gestionar reservas de tratamientos con pago anticipado en línea',
    'Enviar recordatorios y recomendaciones de preparación antes de la cita',
    'Automatizar programa de membresías y paquetes mensuales',
  ],
  transporte: [
    'Recibir solicitudes de transporte y cotizar automáticamente por WhatsApp',
    'Enviar notificaciones de despacho y seguimiento de carga en tiempo real',
    'Gestionar flota y asignación de conductores con sistema centralizado',
  ],
  tiendas: [
    'Controlar inventario con alertas automáticas de productos por agotarse',
    'Gestionar ventas con sistema POS integrado a contabilidad',
    'Enviar reportes diarios de ventas al dueño automáticamente',
  ],
};

const DEFAULT_CASOS = [
  'Automatizar la atención al cliente y reducir tiempos de respuesta',
  'Capturar y calificar leads sin intervención manual',
  'Generar reportes y métricas del negocio en tiempo real',
];

// ─── FAQs por servicio ────────────────────────────────────────────────────────

const FAQS = {
  'chatbot-ia': [
    { q: '¿Cuánto tiempo tarda en implementarse un chatbot con IA?', a: 'Entre 1 y 3 semanas dependiendo de la complejidad. Un chatbot básico con flujos predefinidos puede estar listo en 5 días hábiles. Las soluciones con IA avanzada y múltiples integraciones toman 2-3 semanas.' },
    { q: '¿El chatbot funciona en WhatsApp, Instagram y la página web?', a: 'Sí. Nuestros chatbots se integran con WhatsApp Business, Instagram Direct, Messenger y como widget en tu página web. Todos desde un mismo panel de control.' },
    { q: '¿Qué pasa si el chatbot no sabe responder algo?', a: 'El sistema detecta preguntas fuera de su alcance y transfiere automáticamente a un agente humano por WhatsApp o correo. Ningún cliente queda sin respuesta.' },
    { q: '¿Necesito conocimientos técnicos para manejarlo?', a: 'No. El panel de administración es visual e intuitivo. Cualquier persona puede actualizar respuestas, ver conversaciones y revisar métricas sin saber programar.' },
  ],
  'whatsapp-automatico': [
    { q: '¿Necesito una cuenta de WhatsApp Business API?', a: 'Sí, se requiere la API oficial de Meta. Nosotros gestionamos todo el proceso de registro y verificación sin costo adicional. El proceso toma 3-5 días hábiles.' },
    { q: '¿Puedo enviar mensajes masivos a mis clientes?', a: 'Sí, mediante plantillas aprobadas por Meta. Puedes enviar promociones, recordatorios y notificaciones a toda tu base de clientes de forma legal y sin riesgo de bloqueo.' },
    { q: '¿Cuántos mensajes puedo enviar por mes?', a: 'Depende del plan. El plan Starter incluye 500 conversaciones/mes, Business hasta 2.000 y Enterprise es ilimitado. Una "conversación" es una ventana de 24 horas de intercambio.' },
    { q: '¿El sistema funciona cuando no estoy conectado?', a: 'Sí, ese es el punto principal. El sistema responde, agenda citas y procesa pedidos de forma autónoma las 24 horas, incluyendo noches, fines de semana y festivos.' },
  ],
  'paginas-web': [
    { q: '¿Cuánto tarda en estar lista mi página web?', a: 'Una landing page básica está lista en 5-7 días hábiles. Un sitio corporativo completo con blog toma 2-3 semanas. Un e-commerce con pasarela de pagos puede tomar 4-6 semanas.' },
    { q: '¿Incluye el hosting y dominio?', a: 'El primer año de hosting y dominio está incluido en todos los planes. A partir del segundo año, el costo de mantenimiento es de $350.000 a $600.000 anuales según el plan.' },
    { q: '¿La página queda bien en celular?', a: 'Sí, todas nuestras páginas son 100% responsivas (mobile-first). Google prioriza sitios optimizados para móvil y en Colombia el 78% del tráfico web viene de celular.' },
    { q: '¿Puedo actualizar el contenido yo mismo?', a: 'Depende del plan. Los sitios corporativos incluyen un panel de administración para que actualices textos, imágenes y artículos del blog sin conocimientos técnicos.' },
  ],
  'marketing-digital': [
    { q: '¿Cuánto debo invertir en pauta para ver resultados?', a: 'En Colombia, con $500.000 a $1.000.000 mensuales en pauta ya puedes obtener resultados medibles en Google Ads o Meta Ads para pymes locales. El presupuesto óptimo depende de tu industria y competencia.' },
    { q: '¿Cuándo empiezo a ver resultados?', a: 'Con pauta paga (Google Ads, Meta Ads) los resultados se ven desde la primera semana. Con SEO y contenido orgánico, los resultados significativos toman entre 3 y 6 meses.' },
    { q: '¿Incluye el manejo de redes sociales?', a: 'El plan Growth en adelante incluye gestión de redes. El plan Básico se enfoca solo en campañas de pauta. Si necesitas solo community management, tenemos paquetes específicos desde $900.000/mes.' },
    { q: '¿Cómo sé que la inversión está dando resultados?', a: 'Cada mes recibes un reporte detallado con métricas claras: costo por lead, conversiones, alcance, retorno sobre inversión (ROI). Todo medible y transparente.' },
  ],
  'apps-empresariales': [
    { q: '¿Cuánto tiempo tarda el desarrollo de una app o sistema?', a: 'Un sistema básico de gestión (inventario o ventas) toma 3-4 semanas. Una app móvil completa con backend toma 6-10 semanas. Proyectos enterprise pueden tomar 3-6 meses.' },
    { q: '¿La app funciona en Android e iOS?', a: 'Sí. Desarrollamos apps multiplataforma que funcionan en Android e iOS desde un solo código base, reduciendo costos y tiempos de desarrollo significativamente.' },
    { q: '¿Qué pasa si necesito cambios después de entregar?', a: 'Los primeros 30 días incluyen correcciones sin costo. Después, ofrecemos contratos de mantenimiento desde $400.000/mes que incluyen actualizaciones y soporte.' },
    { q: '¿Puedo integrar la app con mis herramientas actuales?', a: 'Sí. Integramos con sistemas contables (Siigo, Alegra), pasarelas de pago (PSE, Nequi, Daviplata), WhatsApp Business, Google Workspace y más.' },
  ],
  'asistente-ia': [
    { q: '¿Qué procesos se pueden automatizar con IA?', a: 'Los más comunes son: atención al cliente, agendamiento de citas, generación de cotizaciones, envío de facturas, recordatorios de cobro, reportes automáticos y clasificación de leads.' },
    { q: '¿Necesito cambiar mis herramientas actuales?', a: 'No necesariamente. La automatización se conecta con las herramientas que ya usas: WhatsApp, Gmail, Google Sheets, tu CRM o ERP actual. Trabajamos con lo que ya tienes.' },
    { q: '¿Cuánto tiempo tarda en verse el retorno de la inversión?', a: 'La mayoría de nuestros clientes recuperan la inversión en 2-4 meses gracias al ahorro en horas de trabajo manual y el aumento en conversión de clientes.' },
    { q: '¿Funciona para negocios pequeños o solo para grandes empresas?', a: 'Funciona especialmente bien para pymes de 2 a 50 empleados en Colombia. Es precisamente donde la automatización genera mayor impacto porque libera al dueño de tareas operativas.' },
  ],
};

// ─── Generador de HTML ────────────────────────────────────────────────────────

function buildHTML(topic, dateStr) {
  const servicio  = SERVICIOS[topic.servicio] || SERVICIOS['asistente-ia'];
  const casos     = CASOS_INDUSTRIA[topic.industria] || DEFAULT_CASOS;
  const faqs      = FAQS[topic.servicio] || FAQS['asistente-ia'];
  const fecha     = monthName(dateStr);
  const waText    = encodeURIComponent(`Hola, leí sobre ${topic.keyword} y quiero más información.`);
  const waLink    = `https://wa.me/573212674754?text=${waText}`;

  const industriaNombre = topic.industria
    ? topic.industria.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase())
    : 'tu sector';

  // Descripción meta
  const metaDesc = `${topic.titulo.slice(0, 90)} en Colombia. Guía práctica con precios en COP, casos de uso reales y cómo implementarlo. AI Company CO.`;

  // Schema Article
  const schemaArticle = JSON.stringify({
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: topic.titulo,
    description: metaDesc,
    author: { '@type': 'Organization', name: 'AI Company CO', url: 'https://aicompanyco.com' },
    publisher: {
      '@type': 'Organization', name: 'AI Company CO',
      logo: { '@type': 'ImageObject', url: 'https://aicompanyco.com/logo.png', width: 400, height: 400 }
    },
    image: { '@type': 'ImageObject', url: 'https://aicompanyco.com/logo.png', width: 400, height: 400 },
    datePublished: dateStr,
    dateModified: dateStr,
    mainEntityOfPage: { '@type': 'WebPage', '@id': `https://aicompanyco.com/blog/${topic.slug}/` },
  }, null, 2);

  // Schema FAQPage
  const schemaFAQ = JSON.stringify({
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: faqs.map(f => ({
      '@type': 'Question',
      name: f.q,
      acceptedAnswer: { '@type': 'Answer', text: f.a }
    }))
  }, null, 2);

  // Tabla de precios
  const preciosHTML = servicio.precios.map(p => `
      <div class="precio-card">
        <div class="precio-plan">${p.plan}</div>
        <div class="precio-valor">${p.precio}</div>
        <div class="precio-detalle">${p.detalle}</div>
      </div>`).join('');

  // Casos de uso
  const casosHTML = casos.map(c => `<li>${c}</li>`).join('\n          ');

  // FAQs accordion
  const faqsHTML = faqs.map(f => `
      <details class="faq-item">
        <summary>${f.q}</summary>
        <p>${f.a}</p>
      </details>`).join('');

  // FAQs schema visible (texto para FAQ section)
  return `<!DOCTYPE html>
<html lang="es-CO">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${topic.titulo} | AI Company CO</title>
  <meta name="description" content="${metaDesc}">
  <link rel="canonical" href="https://aicompanyco.com/blog/${topic.slug}/">
  <link rel="icon" href="../../logo.png">
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link href="https://fonts.googleapis.com/css2?family=Orbitron:wght@700&family=DM+Sans:wght@400;500;600&display=swap" rel="stylesheet">
  <script type="application/ld+json">${schemaArticle}</script>
  <script type="application/ld+json">${schemaFAQ}</script>
  <style>
    :root{--purple-dark:#5A00B8;--purple-light:#9B5FFF;--bg:#0D0D14;--bg2:#12121C;--text:#E8E8F0;--text-muted:#8A8D99;}
    *{box-sizing:border-box;margin:0;padding:0;}
    body{font-family:'DM Sans',sans-serif;background:var(--bg);color:var(--text);line-height:1.7;}
    a{color:var(--purple-light);text-decoration:none;}
    nav{position:fixed;top:0;left:0;right:0;background:rgba(13,13,20,.95);backdrop-filter:blur(10px);z-index:100;padding:1rem 2rem;display:flex;justify-content:space-between;align-items:center;border-bottom:1px solid rgba(155,95,255,.15);}
    .nav-brand{font-family:'Orbitron',sans-serif;font-size:1rem;color:var(--purple-light);}
    .btn-nav{background:var(--purple-dark);color:#fff;padding:.5rem 1.2rem;border-radius:6px;font-size:.85rem;font-weight:600;}
    .btn-nav:hover{background:var(--purple-light);}
    .container{max-width:760px;margin:0 auto;padding:0 1.5rem;}
    .hero{padding:7rem 0 3rem;border-bottom:1px solid rgba(155,95,255,.1);}
    .breadcrumb{font-size:.8rem;color:var(--text-muted);margin-bottom:1.2rem;}
    .breadcrumb a{color:var(--text-muted);}
    .breadcrumb a:hover{color:var(--purple-light);}
    .post-category{display:inline-block;background:rgba(90,0,184,.2);color:var(--purple-light);padding:.3rem .8rem;border-radius:20px;font-size:.8rem;font-weight:600;margin-bottom:1rem;}
    h1{font-family:'Orbitron',sans-serif;font-size:clamp(1.4rem,3vw,2rem);line-height:1.3;margin-bottom:1rem;color:#fff;}
    .post-meta{font-size:.85rem;color:var(--text-muted);}
    .article-body{padding:2.5rem 0;}
    .article-body h2{font-family:'Orbitron',sans-serif;font-size:1.15rem;color:var(--purple-light);margin:2.5rem 0 1rem;}
    .article-body h3{font-size:1rem;font-weight:600;color:#fff;margin:1.5rem 0 .6rem;}
    .article-body p{margin-bottom:1rem;color:var(--text);}
    .article-body ul,.article-body ol{margin:1rem 0 1rem 1.5rem;}
    .article-body li{margin-bottom:.5rem;}
    .callout{background:rgba(90,0,184,.15);border-left:3px solid var(--purple-dark);border-radius:8px;padding:1.2rem 1.5rem;margin:2rem 0;}
    .callout p{margin:0;font-style:italic;}
    .cta-inline{background:linear-gradient(135deg,rgba(90,0,184,.3),rgba(155,95,255,.15));border:1px solid rgba(155,95,255,.3);border-radius:12px;padding:2rem;margin:2.5rem 0;text-align:center;}
    .cta-inline h3{font-family:'Orbitron',sans-serif;font-size:1rem;margin-bottom:.8rem;color:#fff;}
    .cta-inline p{color:var(--text-muted);font-size:.9rem;margin-bottom:1.2rem;}
    .btn-wa{display:inline-flex;align-items:center;gap:.5rem;background:#25D366;color:#fff;padding:.75rem 1.8rem;border-radius:8px;font-weight:700;font-size:.95rem;}
    .btn-wa:hover{background:#1ebe5d;color:#fff;}
    .precios-grid{display:grid;grid-template-columns:repeat(auto-fit,minmax(200px,1fr));gap:1rem;margin:1.5rem 0;}
    .precio-card{background:var(--bg2);border:1px solid rgba(155,95,255,.2);border-radius:10px;padding:1.2rem;text-align:center;}
    .precio-plan{font-weight:700;color:var(--purple-light);margin-bottom:.4rem;}
    .precio-valor{font-family:'Orbitron',sans-serif;font-size:1.2rem;color:#fff;margin-bottom:.4rem;}
    .precio-detalle{font-size:.8rem;color:var(--text-muted);}
    .faq-item{border:1px solid rgba(155,95,255,.2);border-radius:8px;margin-bottom:.8rem;overflow:hidden;}
    .faq-item summary{padding:1rem 1.2rem;font-weight:600;cursor:pointer;list-style:none;display:flex;justify-content:space-between;align-items:center;}
    .faq-item summary::-webkit-details-marker{display:none;}
    .faq-item summary::after{content:'+';color:var(--purple-light);font-size:1.3rem;}
    .faq-item[open] summary::after{content:'−';}
    .faq-item p{padding:.2rem 1.2rem 1rem;color:var(--text-muted);font-size:.92rem;}
    footer{background:var(--bg2);border-top:1px solid rgba(155,95,255,.1);padding:2.5rem 0;margin-top:3rem;}
    .footer-links{display:flex;flex-wrap:wrap;gap:1.5rem;justify-content:center;margin-bottom:1rem;}
    .footer-links a{color:var(--text-muted);font-size:.85rem;}
    .footer-copy{text-align:center;color:var(--text-muted);font-size:.8rem;}
    @media(max-width:600px){nav{padding:.8rem 1rem;} .hero{padding:6rem 0 2rem;}}
  </style>
</head>
<body>
  <nav>
    <a href="../../index_con_logo.html" class="nav-brand">AI Company CO</a>
    <a href="../../index_con_logo.html#contacto" class="btn-nav">Hablemos →</a>
  </nav>

  <div class="container">
    <div class="hero">
      <div class="breadcrumb">
        <a href="../../index_con_logo.html">Inicio</a> /
        <a href="../../blog/">Blog</a> /
        <span>${topic.titulo.slice(0, 50)}${topic.titulo.length > 50 ? '...' : ''}</span>
      </div>
      <span class="post-category">${topic.categoria}</span>
      <h1>${topic.titulo}</h1>
      <p class="post-meta">Por AI Company CO · ${fecha} · 5 minutos de lectura</p>
    </div>

    <div class="article-body">

      <p>Si tienes un negocio de <strong>${industriaNombre}</strong> en Colombia y quieres implementar <strong>${topic.keyword}</strong>, esta guía es para ti. Te explicamos qué es, cuánto cuesta y cómo funciona con ejemplos reales del mercado colombiano.</p>

      <h2>¿Qué es ${servicio.nombre} y por qué lo necesita tu negocio?</h2>

      <p>En términos simples, es <strong>${servicio.desc}</strong>. Para un negocio de ${industriaNombre} en Colombia, esto se traduce en clientes mejor atendidos, procesos más eficientes y más tiempo para que el dueño se enfoque en lo que importa: crecer.</p>

      <p>Hoy en día, los negocios que no digitalizan sus operaciones pierden clientes frente a competidores que sí lo hacen. La buena noticia es que implementar tecnología ya no requiere grandes presupuestos ni conocimientos técnicos avanzados.</p>

      <div class="callout">
        <p>📊 <strong>Dato clave:</strong> ${servicio.stat}</p>
      </div>

      <h2>Casos de uso para negocios de ${industriaNombre}</h2>

      <p>Estos son los usos más frecuentes que implementamos para negocios como el tuyo en Colombia:</p>

      <ul>
          ${casosHTML}
      </ul>

      <div class="cta-inline">
        <h3>¿Quieres implementarlo en tu negocio?</h3>
        <p>Cuéntanos cómo funciona tu negocio y te explicamos exactamente cómo lo haríamos.</p>
        <a href="${waLink}" class="btn-wa" target="_blank" rel="noopener">
          💬 Hablar por WhatsApp
        </a>
      </div>

      <h2>¿Cuánto cuesta implementar ${servicio.nombre} en Colombia?</h2>

      <p>Los precios varían según la complejidad del proyecto. Estos son nuestros planes en AI Company CO:</p>

      <div class="precios-grid">${preciosHTML}
      </div>

      <p>Los precios incluyen configuración, capacitación al equipo y soporte por 30 días. No cobramos comisiones ni suscripciones obligatorias en los planes de pago único.</p>

      <div class="callout">
        <p>💡 <strong>Retorno de inversión:</strong> Nuestros clientes reportan ${servicio.beneficio} después de los primeros 60 días de implementación.</p>
      </div>

      <h2>¿Cómo funciona el proceso de implementación?</h2>

      <p>En AI Company CO seguimos un proceso de 4 pasos:</p>

      <ol>
        <li><strong>Diagnóstico gratuito:</strong> Analizamos tu negocio y te decimos exactamente qué necesitas (sin compromisos).</li>
        <li><strong>Propuesta a medida:</strong> Diseñamos la solución específica para tu industria y presupuesto.</li>
        <li><strong>Implementación rápida:</strong> Configuramos todo en 1-3 semanas según la complejidad.</li>
        <li><strong>Capacitación y soporte:</strong> Entrenamos a tu equipo y resolvemos dudas durante el primer mes.</li>
      </ol>

      <div class="cta-inline">
        <h3>Solicita tu diagnóstico gratuito</h3>
        <p>Sin costo, sin compromiso. Te decimos qué puedes automatizar y cuánto ahorrarías.</p>
        <a href="${waLink}" class="btn-wa" target="_blank" rel="noopener">
          💬 Solicitar diagnóstico gratis
        </a>
      </div>

      <h2>Preguntas frecuentes</h2>
      ${faqsHTML}

    </div>
  </div>

  <footer>
    <div class="container">
      <div class="footer-links">
        <a href="../../index_con_logo.html">Inicio</a>
        <a href="${servicio.link}">${servicio.nombre}</a>
        <a href="../../blog/">Blog</a>
        <a href="../../index_con_logo.html#contacto">Contacto</a>
      </div>
      <p class="footer-copy">© 2026 AI Company CO · Soacha, Cundinamarca, Colombia · NIT 901.234.567-8</p>
    </div>
  </footer>
</body>
</html>`;
}

// ─── Sitemap ──────────────────────────────────────────────────────────────────

function updateSitemap(slug, dateStr) {
  const url   = `https://aicompanyco.com/blog/${slug}/`;
  const entry = `  <url>\n    <loc>${url}</loc>\n    <lastmod>${dateStr}</lastmod>\n    <changefreq>monthly</changefreq>\n    <priority>0.75</priority>\n  </url>`;

  for (const sitemapPath of [SITEMAP_SEO, SITEMAP_MAIN]) {
    if (!fs.existsSync(sitemapPath)) {
      fs.writeFileSync(sitemapPath,
        `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${entry}\n</urlset>`, 'utf8');
    } else {
      let s = fs.readFileSync(sitemapPath, 'utf8');
      if (!s.includes(url)) {
        s = s.replace('</urlset>', `${entry}\n</urlset>`);
        fs.writeFileSync(sitemapPath, s, 'utf8');
      }
    }
  }
}

// ─── Blog index ───────────────────────────────────────────────────────────────

const SERVICIO_EMOJI = { 'chatbot-ia':'🤖','whatsapp-automatico':'💬','paginas-web':'🌐','marketing-digital':'📈','apps-empresariales':'📱','asistente-ia':'⚡' };

function updateBlogIndex(topic, dateStr) {
  const indexPath = path.join(BLOG_DIR, 'index.html');
  if (!fs.existsSync(indexPath)) return;
  let html = fs.readFileSync(indexPath, 'utf8');
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
          <div class="post-meta"><span>${fecha}</span><a href="${topic.slug}/" class="read-link">Leer guía →</a></div>
        </div>
      </article>`;
  html = html.replace('<div class="posts-grid">', `<div class="posts-grid">${card}`);
  fs.writeFileSync(indexPath, html, 'utf8');
}

// ─── IndexNow ────────────────────────────────────────────────────────────────

function pingIndexNow(url) {
  const key  = 'a7f3c9e2b8d1f4e6a2c5b9d3e7f1a4c8';
  const body = JSON.stringify({ host: 'aicompanyco.com', key, urlList: [url] });
  return new Promise(resolve => {
    const req = https.request({
      hostname: 'api.indexnow.org', path: '/indexnow', method: 'POST',
      headers: { 'Content-Type': 'application/json; charset=utf-8', 'Content-Length': Buffer.byteLength(body) },
    }, res => { res.resume(); console.log(`  → IndexNow: ${res.statusCode}`); resolve(); });
    req.on('error', () => resolve());
    req.write(body); req.end();
  });
}

// ─── main ────────────────────────────────────────────────────────────────────

async function main() {
  const topics   = JSON.parse(fs.readFileSync(TOPICS_FILE, 'utf8'));
  const published = getPublishedSlugs();
  const pending  = topics.filter(t => !published.has(t.slug));

  if (pending.length === 0) {
    console.log('Todos los temas ya están publicados.');
    return;
  }

  const topic   = pending[0];
  const dateStr = getTodayISO();

  console.log(`\nGenerando (sin tokens): ${topic.titulo}`);
  console.log(`Slug: ${topic.slug}`);

  const html = buildHTML(topic, dateStr);

  const outDir = path.join(BLOG_DIR, topic.slug);
  fs.mkdirSync(outDir, { recursive: true });
  fs.writeFileSync(path.join(outDir, 'index.html'), html, 'utf8');
  console.log(`✅ Guardado: blog/${topic.slug}/index.html`);

  updateSitemap(topic.slug, dateStr);
  updateBlogIndex(topic, dateStr);
  await pingIndexNow(`https://aicompanyco.com/blog/${topic.slug}/`);

  console.log(`\n✓ Publicado: ${topic.titulo}`);
  console.log(`  URL: https://aicompanyco.com/blog/${topic.slug}/`);

  // Output para GitHub Actions
  const outFile = process.env.GITHUB_OUTPUT;
  if (outFile) {
    fs.appendFileSync(outFile, `new_post=true\n`);
    fs.appendFileSync(outFile, `slug=${topic.slug}\n`);
    fs.appendFileSync(outFile, `titulo=${topic.titulo.replace(/\n/g, ' ')}\n`);
  }
}

main().catch(e => { console.error('Error:', e.message); process.exit(1); });
