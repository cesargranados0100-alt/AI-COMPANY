#!/usr/bin/env node
// ══════════════════════════════════════════════════════════════════════════════
// generate.js — SEO Programático para AI Company
// Uso: node generate.js
// Genera ~162 páginas en /servicios/[servicio]/en-[ciudad]/ y
//                         /servicios/[servicio]/para-[negocio]/
// ══════════════════════════════════════════════════════════════════════════════

const fs   = require('fs');
const path = require('path');

const SITE_URL   = 'https://aicompanyco.com';
const WA_LINK    = 'https://wa.me/573212674754?text=Hola%2C%20quiero%20un%20diagn%C3%B3stico%20gratuito%20para%20mi%20negocio.';
const LOGO_DEPTH = (depth) => '../'.repeat(depth) + 'logo.png';
const CSS_DEPTH  = (depth) => '../'.repeat(depth) + 'shared.css';

// ── SERVICIOS ─────────────────────────────────────────────────────────────────
const servicios = [
  {
    slug: 'marketing-digital',
    nombre: 'Marketing Digital',
    descripcionCorta: 'Pauta en Google, Facebook, Instagram y TikTok que trae clientes reales a tu negocio',
    descripcionLarga: 'Creamos y gestionamos campañas de publicidad pagada en las plataformas donde están tus clientes. Cada peso invertido está optimizado con IA para traer resultados medibles desde la primera semana.',
    beneficios: [
      'Campañas en Google Ads, Meta Ads y TikTok Ads',
      'Segmentación por ciudad, edad e intereses específicos',
      'Reportes semanales con resultados reales',
      'Optimización continua con inteligencia artificial',
    ],
    proceso: [
      ['Diagnóstico gratuito', 'Analizamos tu negocio, competencia y audiencia ideal en tu ciudad.'],
      ['Estrategia personalizada', 'Diseñamos el plan de medios para tu sector y presupuesto.'],
      ['Lanzamiento en 7 días', 'Activamos las campañas y generamos resultados desde la primera semana.'],
      ['Optimización mensual', 'Ajustamos con datos reales para mejorar el retorno mes a mes.'],
    ],
    painPoints: {
      default:           'pierden clientes porque no tienen presencia digital activa',
      ferreterias:       'dependen del voz a voz mientras la competencia atrae clientes por internet',
      restaurantes:      'tienen mesas vacías que la publicidad correcta en redes podría llenar',
      clinicas:          'sus pacientes no los encuentran cuando buscan especialistas en Google',
      constructoras:     'pierden proyectos porque no aparecen ante compradores que buscan online',
      tiendas:           'ven cómo las grandes superficies capturan clientes con publicidad digital',
      gimnasios:         'pierden socios ante competidores que aparecen primero en Instagram',
      inmobiliarias:     'sus propiedades tardan más en venderse por falta de visibilidad digital',
      talleres:          'no aparecen cuando alguien busca taller mecánico cerca de ellos',
      colegios:          'no llegan a los papás que buscan opciones de matrícula en Google',
      hoteles:           'pierden reservas ante plataformas de terceros por falta de presencia propia',
      droguerias:        'no capturan clientes que buscan productos cerca de su ubicación',
      peluquerias:       'dependen del Instagram personal cuando podrían tener clientes desde Google',
      'agencias-de-viajes': 'pierden viajeros que reservan en plataformas digitales sin buscarlos',
      juridicos:         'no aparecen cuando alguien necesita urgente un abogado en su ciudad',
      supermercados:     'no capturan búsquedas de clientes nuevos que llegan al barrio',
    },
  },
  {
    slug: 'paginas-web',
    nombre: 'Páginas Web',
    descripcionCorta: 'Sitios web profesionales que posicionan en Google y convierten visitas en clientes',
    descripcionLarga: 'Diseñamos y desarrollamos páginas web a medida, optimizadas para aparecer en Google cuando tus clientes buscan lo que ofreces en tu ciudad. Entrega en menos de 15 días.',
    beneficios: [
      'Diseño profesional adaptado a tu marca y sector',
      'SEO técnico optimizado desde el primer día',
      'Velocidad máxima (Core Web Vitals perfectos)',
      'Botón WhatsApp, formularios y chat integrados',
    ],
    proceso: [
      ['Diseño a medida', 'Creamos el diseño basado en tu marca, sector y lo que buscan tus clientes.'],
      ['Desarrollo SEO', 'Programamos con las mejores prácticas de velocidad y posicionamiento.'],
      ['Contenido optimizado', 'Redactamos textos que posicionan para las búsquedas de tu sector.'],
      ['Entrega en 15 días', 'Tu web publicada y funcionando en menos de dos semanas.'],
    ],
    painPoints: {
      default:           'no existen en internet y pierden clientes que buscan en Google todos los días',
      ferreterias:       'no tienen web mientras sus competidores sí aparecen primero en Google',
      restaurantes:      'no aparecen cuando alguien busca dónde comer cerca en Google Maps',
      clinicas:          'pacientes no los encuentran en línea y van donde la competencia',
      constructoras:     'no muestran sus proyectos online y pierden licitaciones importantes',
      tiendas:           'no tienen dónde mostrar su catálogo a clientes potenciales',
      gimnasios:         'no tienen página para mostrar planes, instalaciones y horarios',
      inmobiliarias:     'no tienen portal propio y pagan comisiones a portales de terceros',
      talleres:          'no tienen presencia web para capturar clientes que buscan taller en Google',
      colegios:          'no tienen sitio donde los padres vean programas y soliciten matrícula',
      hoteles:           'no tienen reservas directas y ceden comisión a plataformas externas',
      droguerias:        'no pueden mostrar disponibilidad de productos ni tomar pedidos en línea',
      peluquerias:       'no tienen citas online y dependen del WhatsApp manual',
      'agencias-de-viajes': 'no muestran sus paquetes online y pierden reservas valiosas',
      juridicos:         'no tienen presencia profesional en línea para captar nuevos casos',
      supermercados:     'no tienen catálogo digital ni sistema de pedidos a domicilio propio',
    },
  },
  {
    slug: 'whatsapp-automatico',
    nombre: 'WhatsApp Automático',
    descripcionCorta: 'Atención al cliente 24/7 por WhatsApp sin contratar más personal',
    descripcionLarga: 'Automatizamos tu WhatsApp Business para que responda preguntas frecuentes, tome pedidos y agende citas de forma automática, las 24 horas del día, los 7 días de la semana.',
    beneficios: [
      'Respuestas automáticas 24/7 sin personal adicional',
      'Toma de pedidos y reservas completamente automática',
      'Integración con catálogo de productos y servicios',
      'Transferencia a humano cuando sea necesario',
    ],
    proceso: [
      ['Mapeo de flujos', 'Identificamos las preguntas frecuentes y los flujos de venta de tu negocio.'],
      ['Configuración del bot', 'Programamos el asistente con el tono y la información de tu empresa.'],
      ['Pruebas y ajustes', 'Probamos todos los escenarios antes de activarlo con clientes reales.'],
      ['Activación y monitoreo', 'Lo activamos y monitoreamos los primeros días para optimizar respuestas.'],
    ],
    painPoints: {
      default:           'pierden clientes por no responder WhatsApp fuera del horario laboral',
      ferreterias:       'pierden ventas porque no responden consultas de precios y stock en la noche',
      restaurantes:      'pierden reservas y pedidos que llegan cuando el personal está ocupado',
      clinicas:          'pierden citas porque no responden WhatsApp durante las horas de consulta',
      constructoras:     'no atienden solicitudes de cotización fuera del horario laboral',
      tiendas:           'pierden ventas nocturnas por falta de atención inmediata en WhatsApp',
      gimnasios:         'no responden consultas de membresías fuera del horario del gimnasio',
      inmobiliarias:     'pierden interesados que preguntan por propiedades y no reciben respuesta rápida',
      talleres:          'no pueden atender solicitudes de cotización y citas mientras trabajan',
      colegios:          'no responden consultas de padres fuera del horario administrativo',
      hoteles:           'pierden reservas por no responder consultas inmediatas de disponibilidad',
      droguerias:        'no confirman disponibilidad de medicamentos ni toman pedidos automáticamente',
      peluquerias:       'toman citas manualmente cuando podrían automatizarlo por completo',
      'agencias-de-viajes': 'no responden consultas cuando los viajeros están planeando su viaje',
      juridicos:         'no capturan consultas urgentes que llegan fuera del horario de oficina',
      supermercados:     'no confirman disponibilidad de productos ni toman pedidos automáticamente',
    },
  },
  {
    slug: 'chatbot-ia',
    nombre: 'Chatbot con IA',
    descripcionCorta: 'Asistente inteligente en tu web o WhatsApp que vende y atiende solo',
    descripcionLarga: 'Desarrollamos chatbots con inteligencia artificial entrenados con el conocimiento real de tu negocio. Responden preguntas complejas, califican leads y ayudan a cerrar ventas automáticamente.',
    beneficios: [
      'IA entrenada con la información real de tu negocio',
      'Responde preguntas complejas de forma natural',
      'Califica prospectos y agenda reuniones solo',
      'Aprende y mejora con cada conversación',
    ],
    proceso: [
      ['Entrenamiento', 'Cargamos el conocimiento de tu negocio: productos, precios, políticas, FAQ.'],
      ['Personalización', 'El chatbot habla con el tono de tu marca y maneja los flujos de tu negocio.'],
      ['Integración', 'Lo instalamos en tu web, WhatsApp o en ambos canales simultáneamente.'],
      ['Mejora continua', 'Analizamos las conversaciones y mejoramos la IA cada mes.'],
    ],
    painPoints: {
      default:           'necesitan atender más clientes sin aumentar el equipo ni los costos',
      ferreterias:       'necesitan asesorar sobre materiales y precios sin tener vendedor disponible siempre',
      restaurantes:      'necesitan atender consultas del menú, horarios y reservas sin ocupar al personal',
      clinicas:          'necesitan pre-calificar pacientes y agendar citas sin saturar la recepción',
      constructoras:     'necesitan atender consultas técnicas y de precios fuera del horario laboral',
      tiendas:           'necesitan asesorar clientes sobre productos sin personal extra',
      gimnasios:         'necesitan responder sobre planes, horarios e instructores automáticamente',
      inmobiliarias:     'necesitan calificar compradores y arrendatarios antes de asignar un asesor',
      talleres:          'necesitan cotizar servicios básicos automáticamente sin interrumpir al mecánico',
      colegios:          'necesitan responder sobre admisión y pensiones sin saturar secretaría',
      hoteles:           'necesitan confirmar disponibilidad, precios y servicios las 24 horas',
      droguerias:        'necesitan verificar disponibilidad de medicamentos y tomar pedidos solos',
      peluquerias:       'necesitan gestionar citas, precios y disponibilidad de forma autónoma',
      'agencias-de-viajes': 'necesitan asesorar sobre destinos y paquetes sin disponibilidad de agente',
      juridicos:         'necesitan calificar casos y capturar datos de clientes automáticamente',
      supermercados:     'necesitan atender consultas de disponibilidad y promociones las 24 horas',
    },
  },
  {
    slug: 'asistente-ia',
    nombre: 'Asistente de IA',
    descripcionCorta: 'Sistema inteligente que gestiona clientes, pedidos y procesos internos de tu empresa',
    descripcionLarga: 'Construimos asistentes de inteligencia artificial personalizados que se integran a tus procesos: gestión de clientes, seguimiento de pedidos, reportes automáticos y mucho más.',
    beneficios: [
      'Automatiza tareas repetitivas que consume tiempo a tu equipo',
      'Integración con tus sistemas y herramientas actuales',
      'Reportes e insights automáticos del negocio',
      'Escala a medida que crece tu empresa',
    ],
    proceso: [
      ['Análisis de procesos', 'Identificamos qué tareas consumen más tiempo y se pueden automatizar.'],
      ['Diseño del asistente', 'Construimos el flujo de trabajo inteligente a medida de tus operaciones.'],
      ['Integración', 'Conectamos el asistente con WhatsApp, correo, CRM y más herramientas.'],
      ['Entrega y capacitación', 'Tu equipo aprende a sacarle el máximo provecho desde el primer día.'],
    ],
    painPoints: {
      default:           'pierden horas en tareas manuales y repetitivas que la IA puede hacer sola',
      ferreterias:       'pierden tiempo cotizando, buscando stock y haciendo seguimiento manual de pedidos',
      restaurantes:      'gastan horas en pedidos manuales, inventarios y reportes que la IA puede hacer',
      clinicas:          'pierden tiempo en gestión de historias clínicas, citas y seguimiento de pacientes',
      constructoras:     'necesitan automatizar seguimiento de obras, materiales y cronogramas de entrega',
      tiendas:           'pierden tiempo en inventario, pedidos a proveedores y reportes de ventas diarios',
      gimnasios:         'pierden horas gestionando membresías, asistencias y pagos de forma manual',
      inmobiliarias:     'necesitan automatizar seguimiento de prospectos, visitas y documentos',
      talleres:          'pierden tiempo en órdenes de trabajo, inventario de repuestos y citas',
      colegios:          'necesitan automatizar matrículas, pagos de pensiones y comunicados a padres',
      hoteles:           'pierden tiempo gestionando check-ins, reservas y comunicaciones con huéspedes',
      droguerias:        'necesitan automatizar pedidos a proveedores, inventario y facturación',
      peluquerias:       'pierden tiempo en citas, recordatorios y pagos de forma completamente manual',
      'agencias-de-viajes': 'necesitan automatizar cotizaciones, seguimiento y gestión de reservas',
      juridicos:         'pierden tiempo en gestión de casos, documentos y seguimiento de clientes',
      supermercados:     'necesitan automatizar control de inventario, pedidos y reportes de ventas',
    },
  },
  {
    slug: 'apps-empresariales',
    nombre: 'Apps Empresariales',
    descripcionCorta: 'Aplicaciones móviles y web a la medida para gestionar tu empresa desde cualquier lugar',
    descripcionLarga: 'Desarrollamos aplicaciones móviles y web personalizadas que resuelven los problemas específicos de tu empresa: gestión de pedidos, control de inventario, atención al cliente y más.',
    beneficios: [
      'App móvil iOS y Android o aplicación web a medida',
      'Diseño UX pensado para tu equipo y tus clientes',
      'Integración con sistemas y APIs existentes',
      'Soporte y actualizaciones continuas incluidas',
    ],
    proceso: [
      ['Definición de requerimientos', 'Entendemos exactamente qué debe hacer la app y cómo la usará tu equipo.'],
      ['Diseño UX/UI', 'Prototipamos la interfaz para que sea intuitiva y eficiente desde el primer uso.'],
      ['Desarrollo ágil', 'Construimos en sprints cortos para que veas avances cada semana.'],
      ['Lanzamiento y soporte', 'Publicamos en App Store y Google Play con soporte post-lanzamiento.'],
    ],
    painPoints: {
      default:           'manejan sus operaciones con herramientas genéricas que no se adaptan a su negocio',
      ferreterias:       'manejan inventario y pedidos en Excel cuando podrían tener una app a medida',
      restaurantes:      'no tienen app propia de pedidos y pagan comisiones a plataformas de domicilios',
      clinicas:          'no tienen app para citas, historias clínicas y seguimiento de pacientes',
      constructoras:     'controlan obras con hojas de cálculo cuando podrían tener una app de gestión',
      tiendas:           'no tienen app de catálogo y pedidos para sus clientes frecuentes',
      gimnasios:         'no tienen app para que socios controlen asistencias, rutinas y pagos',
      inmobiliarias:     'no tienen plataforma propia para publicar y gestionar propiedades',
      talleres:          'no tienen app para órdenes de trabajo, diagnósticos y comunicación con clientes',
      colegios:          'no tienen app para comunicados, notas y pagos entre colegio y familias',
      hoteles:           'no tienen app de check-in digital y solicitudes de servicio para huéspedes',
      droguerias:        'no tienen app de pedidos a domicilio ni control de inventario en tiempo real',
      peluquerias:       'no tienen app de reservas, historial de clientes y fidelización',
      'agencias-de-viajes': 'no tienen plataforma propia para cotizar y gestionar reservas',
      juridicos:         'no tienen sistema de gestión de casos, documentos y clientes',
      supermercados:     'no tienen app de domicilios propia ni sistema de puntos y fidelización',
    },
  },
];

// ── CIUDADES ──────────────────────────────────────────────────────────────────
const ciudades = [
  { slug: 'bogota',          nombre: 'Bogotá',        depto: 'Cundinamarca',       poblacion: '8 millones de personas',    negocios: 'más de 400.000 empresas registradas' },
  { slug: 'medellin',        nombre: 'Medellín',       depto: 'Antioquia',          poblacion: '2,7 millones de personas',  negocios: 'más de 120.000 empresas registradas' },
  { slug: 'cali',            nombre: 'Cali',           depto: 'Valle del Cauca',    poblacion: '2,2 millones de personas',  negocios: 'más de 90.000 empresas registradas' },
  { slug: 'barranquilla',    nombre: 'Barranquilla',   depto: 'Atlántico',          poblacion: '1,3 millones de personas',  negocios: 'más de 60.000 empresas registradas' },
  { slug: 'bucaramanga',     nombre: 'Bucaramanga',    depto: 'Santander',          poblacion: '600.000 personas',          negocios: 'más de 40.000 empresas registradas' },
  { slug: 'cartagena',       nombre: 'Cartagena',      depto: 'Bolívar',            poblacion: '1 millón de personas',      negocios: 'más de 35.000 empresas registradas' },
  { slug: 'cucuta',          nombre: 'Cúcuta',         depto: 'Norte de Santander', poblacion: '750.000 personas',          negocios: 'más de 30.000 empresas registradas' },
  { slug: 'pereira',         nombre: 'Pereira',        depto: 'Risaralda',          poblacion: '480.000 personas',          negocios: 'más de 28.000 empresas registradas' },
  { slug: 'manizales',       nombre: 'Manizales',      depto: 'Caldas',             poblacion: '430.000 personas',          negocios: 'más de 22.000 empresas registradas' },
  { slug: 'santa-marta',     nombre: 'Santa Marta',    depto: 'Magdalena',          poblacion: '530.000 personas',          negocios: 'más de 20.000 empresas registradas' },
  { slug: 'ibague',          nombre: 'Ibagué',         depto: 'Tolima',             poblacion: '580.000 personas',          negocios: 'más de 25.000 empresas registradas' },
  { slug: 'villavicencio',   nombre: 'Villavicencio',  depto: 'Meta',               poblacion: '560.000 personas',          negocios: 'más de 22.000 empresas registradas' },
];

// ── TIPOS DE NEGOCIO ──────────────────────────────────────────────────────────
const negocios = [
  { slug: 'ferreterias',        nombre: 'Ferreterías',             singular: 'ferretería',        articulo: 'tu' },
  { slug: 'restaurantes',       nombre: 'Restaurantes',            singular: 'restaurante',       articulo: 'tu' },
  { slug: 'clinicas',           nombre: 'Clínicas y Consultorios', singular: 'clínica',           articulo: 'tu' },
  { slug: 'constructoras',      nombre: 'Constructoras',           singular: 'constructora',      articulo: 'tu' },
  { slug: 'tiendas',            nombre: 'Tiendas y Comercios',     singular: 'tienda',            articulo: 'tu' },
  { slug: 'gimnasios',          nombre: 'Gimnasios',               singular: 'gimnasio',          articulo: 'tu' },
  { slug: 'inmobiliarias',      nombre: 'Inmobiliarias',           singular: 'inmobiliaria',      articulo: 'tu' },
  { slug: 'talleres',           nombre: 'Talleres Automotrices',   singular: 'taller',            articulo: 'tu' },
  { slug: 'colegios',           nombre: 'Colegios y Academias',    singular: 'colegio',           articulo: 'tu' },
  { slug: 'hoteles',            nombre: 'Hoteles',                 singular: 'hotel',             articulo: 'tu' },
  { slug: 'droguerias',         nombre: 'Droguerías',              singular: 'droguería',         articulo: 'tu' },
  { slug: 'peluquerias',        nombre: 'Peluquerías',             singular: 'peluquería',        articulo: 'tu' },
  { slug: 'agencias-de-viajes', nombre: 'Agencias de Viajes',     singular: 'agencia de viajes', articulo: 'tu' },
  { slug: 'juridicos',          nombre: 'Servicios Jurídicos',     singular: 'firma jurídica',    articulo: 'tu' },
  { slug: 'supermercados',      nombre: 'Supermercados',           singular: 'supermercado',      articulo: 'tu' },
];

// ═══════════════════════════════════════════════════════════════════════════════
// HELPERS
// ═══════════════════════════════════════════════════════════════════════════════

function mkdirp(dirPath) {
  fs.mkdirSync(dirPath, { recursive: true });
}

function slugify(str) {
  return str.toLowerCase()
    .normalize('NFD').replace(/[̀-ͯ]/g, '')
    .replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');
}

function getPainPoint(servicio, negocioSlug) {
  return servicio.painPoints[negocioSlug] || servicio.painPoints['default'];
}

// ═══════════════════════════════════════════════════════════════════════════════
// PLANTILLA HTML
// ═══════════════════════════════════════════════════════════════════════════════

function buildPage({ titulo, descripcion, canonical, h1, subtitulo, intro, servicio, breadcrumbs, faqItems, cssPath, logoPath, depth }) {
  const beneficiosHtml = servicio.beneficios.map(b =>
    `<div class="seo-benefit"><span class="seo-check">✓</span><span>${b}</span></div>`
  ).join('\n          ');

  const procesoHtml = servicio.proceso.map(([t, d], i) =>
    `<div class="seo-step">
            <div class="seo-step-num">${String(i+1).padStart(2,'0')}</div>
            <div><strong>${t}</strong><p>${d}</p></div>
          </div>`
  ).join('\n          ');

  const faqHtml = faqItems.map(([q, a]) =>
    `<div class="seo-faq-item">
            <button class="seo-faq-q" onclick="this.parentElement.classList.toggle('open')">${q}<span class="seo-faq-icon">+</span></button>
            <div class="seo-faq-a"><p>${a}</p></div>
          </div>`
  ).join('\n          ');

  const breadcrumbHtml = breadcrumbs.map((b, i) =>
    i === breadcrumbs.length - 1
      ? `<span>${b.nombre}</span>`
      : `<a href="${'../'.repeat(depth - i - 1) || '/'}">` + (b.nombre) + `</a> <span class="sep">›</span> `
  ).join('');

  const schemaFaq = JSON.stringify({
    "@context": "https://schema.org",
    "@type": "FAQPage",
    "mainEntity": faqItems.map(([q, a]) => ({
      "@type": "Question",
      "name": q,
      "acceptedAnswer": { "@type": "Answer", "text": a }
    }))
  }, null, 2);

  const schemaBreadcrumb = JSON.stringify({
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    "itemListElement": breadcrumbs.map((b, i) => ({
      "@type": "ListItem",
      "position": i + 1,
      "name": b.nombre,
      "item": b.url
    }))
  }, null, 2);

  return `<!DOCTYPE html>
<html lang="es-CO">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>${titulo}</title>
<meta name="description" content="${descripcion}" />
<link rel="canonical" href="${canonical}" />
<meta property="og:type" content="website" />
<meta property="og:title" content="${titulo}" />
<meta property="og:description" content="${descripcion}" />
<meta property="og:url" content="${canonical}" />
<meta property="og:image" content="${SITE_URL}/og-image.jpg" />
<meta property="og:locale" content="es_CO" />
<meta property="og:site_name" content="AI Company CO" />
<script type="application/ld+json">${schemaBreadcrumb}</script>
<script type="application/ld+json">${schemaFaq}</script>
<link rel="icon" type="image/png" href="${logoPath}" />
<link rel="stylesheet" href="${cssPath}" />
<link href="https://fonts.googleapis.com/css2?family=Orbitron:wght@400;700;800&family=DM+Sans:wght@300;400;500&display=swap" rel="stylesheet">
<style>
.seo-benefits { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; margin: 24px 0; }
.seo-benefit { display: flex; align-items: flex-start; gap: 10px; background: rgba(90,0,184,.08); border: 1px solid rgba(90,0,184,.2); border-radius: 8px; padding: 14px; font-size: .9rem; }
.seo-check { color: #9B5FFF; font-weight: 700; flex-shrink: 0; }
.seo-steps { display: grid; grid-template-columns: 1fr 1fr; gap: 16px; margin: 24px 0; }
.seo-step { display: flex; gap: 16px; align-items: flex-start; background: #16161f; border-radius: 10px; padding: 20px; }
.seo-step-num { font-family: 'Orbitron', monospace; font-size: 1.4rem; color: #5A00B8; font-weight: 800; flex-shrink: 0; line-height: 1; }
.seo-step strong { display: block; color: #fff; font-size: .92rem; margin-bottom: 4px; }
.seo-step p { color: #8A8D99; font-size: .83rem; margin: 0; }
.seo-section { padding: 64px 5%; }
.seo-section-title { font-family: 'Orbitron', monospace; font-size: 1.5rem; color: #fff; margin-bottom: 12px; }
.seo-section-sub { color: #8A8D99; font-size: .95rem; margin-bottom: 32px; max-width: 640px; }
.seo-cta-box { background: linear-gradient(135deg, #5A00B8 0%, #7B2FE0 100%); border-radius: 16px; padding: 48px; text-align: center; }
.seo-cta-box h2 { font-family: 'Orbitron', monospace; color: #fff; font-size: 1.6rem; margin-bottom: 12px; }
.seo-cta-box p { color: rgba(255,255,255,.8); margin-bottom: 28px; font-size: .95rem; }
.seo-btn { display: inline-block; background: #fff; color: #5A00B8; font-weight: 700; padding: 14px 32px; border-radius: 6px; text-decoration: none; font-size: .95rem; transition: transform .2s; }
.seo-btn:hover { transform: translateY(-2px); }
.seo-btn-ghost { display: inline-block; border: 1px solid rgba(255,255,255,.4); color: #fff; font-weight: 500; padding: 13px 28px; border-radius: 6px; text-decoration: none; font-size: .88rem; margin-left: 12px; transition: background .2s; }
.seo-btn-ghost:hover { background: rgba(255,255,255,.1); }
.seo-faq { max-width: 720px; }
.seo-faq-item { border-bottom: 1px solid rgba(255,255,255,.07); overflow: hidden; }
.seo-faq-q { width: 100%; background: none; border: none; color: #e8e9f0; font-family: 'DM Sans', sans-serif; font-size: .95rem; padding: 18px 0; text-align: left; cursor: pointer; display: flex; justify-content: space-between; align-items: center; gap: 16px; }
.seo-faq-q:hover { color: #9B5FFF; }
.seo-faq-icon { font-size: 1.4rem; color: #5A00B8; flex-shrink: 0; transition: transform .3s; }
.seo-faq-item.open .seo-faq-icon { transform: rotate(45deg); }
.seo-faq-a { max-height: 0; overflow: hidden; transition: max-height .35s ease; }
.seo-faq-item.open .seo-faq-a { max-height: 300px; }
.seo-faq-a p { color: #8A8D99; font-size: .88rem; padding-bottom: 18px; margin: 0; }
.seo-intro-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 48px; align-items: start; }
.seo-intro-text { color: #b0b3bf; font-size: .95rem; line-height: 1.8; }
.seo-intro-text p { margin-bottom: 16px; }
.seo-stat { background: #16161f; border-radius: 12px; padding: 24px; border: 1px solid rgba(90,0,184,.2); margin-bottom: 16px; }
.seo-stat strong { display: block; font-family: 'Orbitron', monospace; font-size: 1.6rem; color: #9B5FFF; margin-bottom: 4px; }
.seo-stat span { font-size: .82rem; color: #8A8D99; }
.sep { color: #5A00B8; margin: 0 4px; }
@media (max-width: 768px) {
  .seo-benefits, .seo-steps, .seo-intro-grid { grid-template-columns: 1fr; }
  .seo-cta-box { padding: 32px 20px; }
  .seo-cta-box h2 { font-size: 1.2rem; }
  .seo-btn-ghost { margin-left: 0; margin-top: 10px; display: block; text-align: center; }
}
</style>
</head>
<body>

<!-- NAV -->
<nav class="s-nav">
  <a href="${'../'.repeat(depth)}" class="s-nav-logo" aria-label="AI Company CO">
    <img src="${logoPath}" alt="AI Company CO" width="40" height="40" />
    <span>
      <span class="s-nav-brand">AI COMPANY</span>
      <span class="s-nav-sub">Automatización · IA · Crecimiento</span>
    </span>
  </a>
  <ul class="s-nav-links">
    <li><a href="${'../'.repeat(depth)}#servicios">Servicios</a></li>
    <li><a href="${'../'.repeat(depth)}blog/">Blog</a></li>
    <li><a href="${'../'.repeat(depth)}#casos">Casos de éxito</a></li>
    <li><a href="${'../'.repeat(depth)}#faq">FAQ</a></li>
  </ul>
  <a href="${WA_LINK}" target="_blank" class="s-nav-cta">Hablar con un asesor →</a>
</nav>

<!-- BREADCRUMB -->
<div class="s-breadcrumb">
  ${breadcrumbHtml}
</div>

<!-- HERO -->
<section class="s-hero">
  <h1 style="font-family:'Orbitron',monospace;font-size:clamp(1.5rem,3.5vw,2.6rem);color:#fff;font-weight:800;line-height:1.2;max-width:780px;margin-bottom:18px;">${h1}</h1>
  <p style="font-size:1.05rem;color:#b0b3bf;max-width:640px;margin-bottom:32px;">${subtitulo}</p>
  <div style="display:flex;gap:14px;flex-wrap:wrap;">
    <a href="${WA_LINK}" target="_blank" class="seo-btn" style="background:var(--purple-l,#7B2FE0);color:#fff;">Diagnóstico gratuito →</a>
    <a href="${'../'.repeat(depth)}#casos" class="seo-btn-ghost">Ver casos de éxito</a>
  </div>
</section>

<!-- INTRO -->
<section class="seo-section" style="background:#111118;">
  <div class="seo-intro-grid">
    <div class="seo-intro-text">
      ${intro}
    </div>
    <div>
      <div class="seo-stat"><strong>+97</strong><span>leads generados solo en la primera semana con nuestro sistema</span></div>
      <div class="seo-stat"><strong>15 días</strong><span>tiempo promedio de entrega de nuestros proyectos</span></div>
      <div class="seo-stat"><strong>24/7</strong><span>automatizaciones trabajando para tu negocio sin parar</span></div>
    </div>
  </div>
</section>

<!-- BENEFICIOS -->
<section class="seo-section">
  <p class="seo-section-title">¿Por qué AI Company?</p>
  <p class="seo-section-sub">${servicio.descripcionLarga}</p>
  <div class="seo-benefits">
    ${beneficiosHtml}
  </div>
</section>

<!-- PROCESO -->
<section class="seo-section" style="background:#111118;">
  <p class="seo-section-title">Cómo trabajamos</p>
  <p class="seo-section-sub">Un proceso claro, resultados desde la primera semana.</p>
  <div class="seo-steps">
    ${procesoHtml}
  </div>
</section>

<!-- FAQ -->
<section class="seo-section">
  <p class="seo-section-title">Preguntas frecuentes</p>
  <div class="seo-faq">
    ${faqHtml}
  </div>
</section>

<!-- CTA FINAL -->
<section class="seo-section">
  <div class="seo-cta-box">
    <h2>¿Listo para hacer crecer ${h1.toLowerCase().includes('para ') ? h1.split('para ')[1].split(' en ')[0] : 'tu negocio'}?</h2>
    <p>Diagnóstico gratuito de 30 minutos sin compromiso. Analizamos tu negocio y te decimos exactamente qué necesitas.</p>
    <a href="${WA_LINK}" target="_blank" class="seo-btn">Quiero mi diagnóstico gratis →</a>
    <a href="mailto:agencia@aicompanyco.com" class="seo-btn-ghost">Escribir por correo</a>
  </div>
</section>

<!-- FOOTER -->
<footer style="background:#0a0a10;padding:48px 5% 24px;border-top:1px solid rgba(90,0,184,.15);">
  <div style="display:grid;grid-template-columns:2fr 1fr 1fr;gap:40px;margin-bottom:40px;">
    <div>
      <a href="${'../'.repeat(depth)}" class="s-nav-logo" style="text-decoration:none;display:inline-flex;margin-bottom:14px;">
        <img src="${logoPath}" alt="AI Company CO" width="36" height="36" />
        <span style="margin-left:10px;">
          <span class="s-nav-brand">AI COMPANY CO</span>
          <span class="s-nav-sub">Marketing · Automatización · Crecimiento</span>
        </span>
      </a>
      <p style="color:#8A8D99;font-size:.82rem;max-width:320px;line-height:1.6;">Agencia colombiana de marketing digital, inteligencia artificial y sistemas empresariales a la medida. Soacha, Cundinamarca.</p>
    </div>
    <div>
      <div style="font-size:.75rem;color:#5A00B8;font-weight:700;letter-spacing:.1em;text-transform:uppercase;margin-bottom:12px;">Servicios</div>
      <ul style="list-style:none;padding:0;">
        ${servicios.map(s => `<li style="margin-bottom:6px;"><a href="${'../'.repeat(depth)}servicios/${s.slug}/" style="color:#8A8D99;text-decoration:none;font-size:.83rem;">${s.nombre}</a></li>`).join('\n        ')}
      </ul>
    </div>
    <div>
      <div style="font-size:.75rem;color:#5A00B8;font-weight:700;letter-spacing:.1em;text-transform:uppercase;margin-bottom:12px;">Contacto</div>
      <ul style="list-style:none;padding:0;">
        <li style="margin-bottom:6px;"><a href="mailto:agencia@aicompanyco.com" style="color:#8A8D99;text-decoration:none;font-size:.83rem;">agencia@aicompanyco.com</a></li>
        <li style="margin-bottom:6px;"><a href="${WA_LINK}" style="color:#8A8D99;text-decoration:none;font-size:.83rem;">+57 321 267 4754</a></li>
        <li style="color:#8A8D99;font-size:.83rem;">Soacha, Cundinamarca, Colombia</li>
      </ul>
    </div>
  </div>
  <div style="border-top:1px solid rgba(255,255,255,.06);padding-top:20px;font-size:.75rem;color:#8A8D99;">
    © 2026 AI Company. Todos los derechos reservados.
  </div>
</footer>

<!-- WA WIDGET -->
<script>
(function(){
  var btn = document.createElement('a');
  btn.href = '${WA_LINK}';
  btn.target = '_blank';
  btn.setAttribute('aria-label', 'Hablar por WhatsApp');
  btn.style.cssText = 'position:fixed;bottom:24px;right:24px;width:56px;height:56px;background:#25D366;border-radius:50%;display:flex;align-items:center;justify-content:center;box-shadow:0 4px 16px rgba(37,211,102,.4);z-index:9999;text-decoration:none;';
  btn.innerHTML = '<svg width="28" height="28" viewBox="0 0 24 24" fill="white"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/></svg>';
  document.body.appendChild(btn);
})();
</script>

</body>
</html>`;
}

// ═══════════════════════════════════════════════════════════════════════════════
// GENERADORES DE PÁGINAS
// ═══════════════════════════════════════════════════════════════════════════════

// TIPO 1: /servicios/[servicio]/en-[ciudad]/
function generarPaginaServicioCiudad(servicio, ciudad) {
  const urlPath   = `servicios/${servicio.slug}/en-${ciudad.slug}`;
  const canonical = `${SITE_URL}/${urlPath}/`;
  const depth     = 3; // servicios / slug / en-ciudad

  const titulo = `${servicio.nombre} en ${ciudad.nombre} | AI Company`;
  const descripcion = `${servicio.descripcionCorta} para empresas en ${ciudad.nombre}, ${ciudad.depto}. Diagnóstico gratuito sin compromiso.`;
  const h1 = `${servicio.nombre} en ${ciudad.nombre}`;
  const subtitulo = `${servicio.descripcionCorta}. Atendemos empresas en ${ciudad.nombre} y todo ${ciudad.depto}.`;

  const intro = `
    <p>En ${ciudad.nombre} hay ${ciudad.negocios}. Con ${ciudad.poblacion} como mercado potencial, las empresas que <strong>no tienen presencia digital activa</strong> están perdiendo clientes todos los días.</p>
    <p>En AI Company llevamos ${servicio.nombre.toLowerCase()} a negocios de ${ciudad.nombre} con resultados medibles desde la primera semana. Sin contratos largos, sin pagos adelantados innecesarios.</p>
    <p>Nuestro equipo en Soacha, Cundinamarca <strong>atiende empresas en toda Colombia</strong> de forma remota y presencial cuando es necesario.</p>
  `;

  const faqItems = [
    [
      `¿Ofrecen ${servicio.nombre.toLowerCase()} para empresas pequeñas en ${ciudad.nombre}?`,
      `Sí. La mayoría de nuestros clientes son pymes y negocios locales. Tenemos soluciones que se adaptan a distintos presupuestos y sectores en ${ciudad.nombre} y ${ciudad.depto}.`
    ],
    [
      `¿Cuánto tiempo tarda ver resultados?`,
      `Dependiendo del servicio, los primeros resultados se ven entre 7 y 30 días. En marketing digital las campañas se activan en la primera semana. Una página web se entrega en 15 días.`
    ],
    [
      `¿Tienen clientes actuales en ${ciudad.nombre}?`,
      `Sí, trabajamos con negocios en ${ciudad.nombre} y en las principales ciudades de Colombia. Podemos compartirte casos de éxito de tu sector en tu primera llamada.`
    ],
    [
      `¿Puedo empezar con un solo servicio y agregar más después?`,
      `Perfectamente. Muchos clientes empiezan con una página web o con publicidad en redes y después agregan WhatsApp automático o chatbot de IA a medida que crecen.`
    ],
    [
      `¿El diagnóstico inicial tiene algún costo?`,
      `No. El diagnóstico de 30 minutos es completamente gratuito y sin compromiso. Al final te damos un plan de acción concreto, lo contrates con nosotros o no.`
    ],
  ];

  const breadcrumbs = [
    { nombre: 'AI Company', url: SITE_URL },
    { nombre: 'Servicios', url: `${SITE_URL}/servicios/` },
    { nombre: servicio.nombre, url: `${SITE_URL}/servicios/${servicio.slug}/` },
    { nombre: `en ${ciudad.nombre}`, url: canonical },
  ];

  return buildPage({
    titulo, descripcion, canonical, h1, subtitulo, intro, servicio,
    breadcrumbs, faqItems,
    cssPath: CSS_DEPTH(depth),
    logoPath: LOGO_DEPTH(depth),
    depth,
  });
}

// TIPO 2: /servicios/[servicio]/para-[negocio]/
function generarPaginaServicioNegocio(servicio, negocio) {
  const urlPath   = `servicios/${servicio.slug}/para-${negocio.slug}`;
  const canonical = `${SITE_URL}/${urlPath}/`;
  const depth     = 3;

  const painPoint = getPainPoint(servicio, negocio.slug);
  const titulo = `${servicio.nombre} para ${negocio.nombre} | AI Company Colombia`;
  const descripcion = `${servicio.nombre} especializado para ${negocio.nombre} en Colombia. ${servicio.descripcionCorta}. Diagnóstico gratuito.`;
  const h1 = `${servicio.nombre} para ${negocio.nombre}`;
  const subtitulo = `Soluciones de ${servicio.nombre.toLowerCase()} diseñadas específicamente para ${negocio.nombre.toLowerCase()} en Colombia.`;

  const intro = `
    <p>La mayoría de ${negocio.nombre.toLowerCase()} en Colombia ${painPoint}. Eso representa oportunidades que se están perdiendo todos los días.</p>
    <p>En AI Company desarrollamos soluciones de <strong>${servicio.nombre.toLowerCase()}</strong> pensadas específicamente para el sector de ${negocio.nombre.toLowerCase()}. No es un paquete genérico — es una estrategia construida para ${negocio.articulo} ${negocio.singular}.</p>
    <p>Nuestro caso de éxito con <strong>Maderas Montoya</strong> demuestra que cualquier negocio, sin importar el sector, puede <strong>automatizarse, posicionarse y crecer</strong> con las herramientas correctas.</p>
  `;

  const faqItems = [
    [
      `¿Han trabajado antes con ${negocio.nombre.toLowerCase()}?`,
      `Sí. Tenemos experiencia en múltiples sectores incluyendo ${negocio.nombre.toLowerCase()}. El diagnóstico inicial incluye un análisis de tu competencia directa y lo que están haciendo digitalmente.`
    ],
    [
      `¿Qué diferencia a AI Company de otras agencias?`,
      `Combinamos marketing digital, inteligencia artificial y sistemas a la medida en una sola empresa. No tercerizamos — todo lo hacemos internamente con nuestro equipo.`
    ],
    [
      `¿Cuánto tiempo toma implementar ${servicio.nombre.toLowerCase()} para ${negocio.articulo} ${negocio.singular}?`,
      `Entre 7 y 15 días dependiendo del alcance. Empezamos con un diagnóstico gratuito para definir el plan de trabajo exacto para tu negocio.`
    ],
    [
      `¿El ${servicio.nombre.toLowerCase()} funciona para ${negocio.singular} pequeño?`,
      `Sí. Tenemos soluciones para negocios de todos los tamaños. El presupuesto y alcance se define después del diagnóstico gratuito según tus metas específicas.`
    ],
    [
      `¿Tienen contratos de permanencia?`,
      `No manejamos contratos de largo plazo obligatorios. La mayoría de clientes continúan porque ven resultados, no porque estén atados.`
    ],
  ];

  const breadcrumbs = [
    { nombre: 'AI Company', url: SITE_URL },
    { nombre: 'Servicios', url: `${SITE_URL}/servicios/` },
    { nombre: servicio.nombre, url: `${SITE_URL}/servicios/${servicio.slug}/` },
    { nombre: `para ${negocio.nombre}`, url: canonical },
  ];

  return buildPage({
    titulo, descripcion, canonical, h1, subtitulo, intro, servicio,
    breadcrumbs, faqItems,
    cssPath: CSS_DEPTH(depth),
    logoPath: LOGO_DEPTH(depth),
    depth,
  });
}

// ═══════════════════════════════════════════════════════════════════════════════
// SITEMAP
// ═══════════════════════════════════════════════════════════════════════════════

function generarSitemap(urls) {
  const hoy = new Date().toISOString().split('T')[0];
  const items = urls.map(u => `  <url>\n    <loc>${u}</loc>\n    <lastmod>${hoy}</lastmod>\n    <changefreq>monthly</changefreq>\n    <priority>0.7</priority>\n  </url>`).join('\n');
  return `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${items}\n</urlset>`;
}

// ═══════════════════════════════════════════════════════════════════════════════
// MAIN
// ═══════════════════════════════════════════════════════════════════════════════

let totalPages = 0;
const sitemapUrls = [];

console.log('\n🚀 Iniciando generación de páginas SEO...\n');

// Tipo 1: Servicio + Ciudad
for (const servicio of servicios) {
  for (const ciudad of ciudades) {
    const dirPath  = path.join('servicios', servicio.slug, `en-${ciudad.slug}`);
    const filePath = path.join(dirPath, 'index.html');
    mkdirp(dirPath);
    fs.writeFileSync(filePath, generarPaginaServicioCiudad(servicio, ciudad), 'utf8');
    sitemapUrls.push(`${SITE_URL}/servicios/${servicio.slug}/en-${ciudad.slug}/`);
    totalPages++;
  }
}
console.log(`✅ ${servicios.length * ciudades.length} páginas servicio+ciudad generadas`);

// Tipo 2: Servicio + Negocio
for (const servicio of servicios) {
  for (const negocio of negocios) {
    const dirPath  = path.join('servicios', servicio.slug, `para-${negocio.slug}`);
    const filePath = path.join(dirPath, 'index.html');
    mkdirp(dirPath);
    fs.writeFileSync(filePath, generarPaginaServicioNegocio(servicio, negocio), 'utf8');
    sitemapUrls.push(`${SITE_URL}/servicios/${servicio.slug}/para-${negocio.slug}/`);
    totalPages++;
  }
}
console.log(`✅ ${servicios.length * negocios.length} páginas servicio+negocio generadas`);

// Sitemap parcial de páginas generadas
const sitemapPath = path.join('sitemap-seo.xml');
fs.writeFileSync(sitemapPath, generarSitemap(sitemapUrls), 'utf8');
console.log(`✅ sitemap-seo.xml generado con ${sitemapUrls.length} URLs`);

console.log(`\n✨ Total: ${totalPages} páginas generadas`);
console.log(`📁 Carpeta de salida: servicios/`);
console.log(`🗺️  Sitemap: sitemap-seo.xml`);
console.log(`\n→ Agrega sitemap-seo.xml a tu sitemap.xml principal con:\n   <sitemap><loc>${SITE_URL}/sitemap-seo.xml</loc></sitemap>\n`);
