#!/usr/bin/env node
/**
 * News-driven blog generator for aicompanyco.com
 * Monitors AI news RSS feeds and generates blog posts using code templates.
 * Zero AI API calls — all content generated from predefined templates.
 * Run: node scripts/generate-news-blog.js
 */

const https   = require('https');
const fs      = require('fs');
const path    = require('path');

const ROOT            = path.resolve(__dirname, '..');
const BLOG_DIR        = path.join(ROOT, 'blog');
const PUBLISHED_FILE  = path.join(__dirname, 'published-news.json');
const SITEMAP_MAIN    = path.join(ROOT, 'sitemap-main.xml');
const SITEMAP_SEO     = path.join(ROOT, 'sitemap-seo.xml');

// ─── RSS Feeds de noticias de IA ─────────────────────────────────────────────
const FEEDS = [
  'https://news.google.com/rss/search?q=inteligencia+artificial+empresas+colombia&hl=es-419&gl=CO&ceid=CO:es-419',
  'https://news.google.com/rss/search?q=chatbot+ia+negocios+2025&hl=es-419&gl=CO&ceid=CO:es-419',
  'https://news.google.com/rss/search?q=automatizacion+inteligencia+artificial+pymes&hl=es-419&gl=CO&ceid=CO:es-419',
  'https://news.google.com/rss/search?q=openai+chatgpt+negocios&hl=es-419&gl=CO&ceid=CO:es-419',
  'https://news.google.com/rss/search?q=whatsapp+inteligencia+artificial+empresa&hl=es-419&gl=CO&ceid=CO:es-419',
];

// ─── helpers ──────────────────────────────────────────────────────────────────
function fetchText(url) {
  return new Promise((resolve, reject) => {
    https.get(url, { headers: { 'User-Agent': 'Mozilla/5.0 (compatible; NewsBot/1.0)' } }, res => {
      let d = '';
      res.on('data', c => d += c);
      res.on('end', () => resolve(d));
    }).on('error', reject);
  });
}

function slugify(text) {
  return text.toLowerCase()
    .replace(/[áàä]/g, 'a').replace(/[éèë]/g, 'e').replace(/[íìï]/g, 'i')
    .replace(/[óòö]/g, 'o').replace(/[úùü]/g, 'u').replace(/ñ/g, 'n')
    .replace(/[^a-z0-9\s-]/g, '').replace(/\s+/g, '-').replace(/-+/g, '-')
    .replace(/^-|-$/g, '').slice(0, 60);
}

function getTodayISO() { return new Date().toISOString().split('T')[0]; }

function monthName(dateStr) {
  const months = ['Enero','Febrero','Marzo','Abril','Mayo','Junio','Julio','Agosto','Septiembre','Octubre','Noviembre','Diciembre'];
  const d = new Date(dateStr);
  return `${months[d.getMonth()]} ${d.getDate()}, ${d.getFullYear()}`;
}

// ─── Parsear RSS XML ──────────────────────────────────────────────────────────
function parseRSS(xml) {
  const items = [];
  const itemRegex = /<item>([\s\S]*?)<\/item>/g;
  let match;
  while ((match = itemRegex.exec(xml)) !== null) {
    const block  = match[1];
    const title  = (block.match(/<title><!\[CDATA\[(.*?)\]\]><\/title>/) || block.match(/<title>(.*?)<\/title>/) || [])[1] || '';
    const desc   = (block.match(/<description><!\[CDATA\[(.*?)\]\]><\/description>/) || block.match(/<description>(.*?)<\/description>/) || [])[1] || '';
    const link   = (block.match(/<link>(.*?)<\/link>/) || [])[1] || '';
    const pubDate= (block.match(/<pubDate>(.*?)<\/pubDate>/) || [])[1] || '';
    if (title) items.push({
      title: title.replace(/<[^>]+>/g, '').trim(),
      desc:  desc.replace(/<[^>]+>/g, '').trim().slice(0, 300),
      link:  link.trim(),
      date:  pubDate ? new Date(pubDate).toISOString().split('T')[0] : getTodayISO(),
    });
  }
  return items;
}

// ─── Clasificar noticia ───────────────────────────────────────────────────────
function clasificar(item) {
  const txt = (item.title + ' ' + item.desc).toLowerCase();
  if (/chatbot|gpt|claude|gemini|llm|modelo de lenguaje|conversacion/.test(txt)) return 'chatbot';
  if (/whatsapp|telegram|mensajer|chat empresar/.test(txt)) return 'whatsapp-ia';
  if (/automatiz|workflow|proceso|rpa|n8n|zapier/.test(txt)) return 'automatizacion';
  if (/imagen|video|generati|dall|midjourney|sora|stable diffusion/.test(txt)) return 'ia-creativa';
  if (/voz|voice|audio|speech|text.to.speech|reconocimiento/.test(txt)) return 'ia-voz';
  if (/dato|analítica|predicti|machine learning|modelo predictivo/.test(txt)) return 'ia-datos';
  if (/marketing|publicidad|redes social|contenido|seo/.test(txt)) return 'ia-marketing';
  if (/robot|drone|automatico|maquina|cobos/.test(txt)) return 'robotica';
  return 'ia-general';
}

// ─── Extraer empresa/tecnología del título ────────────────────────────────────
function extraerTech(titulo) {
  const match = titulo.match(/^([^:,]+(?:IA|AI|GPT|LLM|Bot|Claude|Gemini|OpenAI|Meta AI|Mistral|Llama|n8n|Zapier|WhatsApp|ChatGPT)[^:,]*)/i);
  if (match) return match[1].trim();
  const words = titulo.split(' ').slice(0, 6).join(' ');
  return words;
}

// ─── Templates de contenido por categoría ────────────────────────────────────
const TEMPLATES = {

  chatbot: {
    slugSuffix: 'chatbot-ia-empresas-colombia',
    servicioLink: '../../servicios/chatbot-ia/',
    servicioNombre: 'Chatbot con IA',
    getTitle: (t) => `Nuevo Chatbot IA para Empresas en Colombia: ${t.split(' ').slice(0,5).join(' ')}`,
    getMetaDesc: (t, d) => `${t.slice(0,80)}. Descubre cómo los chatbots con IA están transformando restaurantes, clínicas y tiendas colombianas en 2026.`,
    getBody: (noticia, fecha) => `
<p>El mundo de la inteligencia artificial sigue evolucionando rápidamente. <strong>${noticia.title}</strong> es una de las novedades más relevantes para los empresarios colombianos que buscan automatizar su atención al cliente y mejorar la eficiencia de sus negocios.</p>

<p>Pero más allá de la noticia, la pregunta real es: <strong>¿cómo puede tu empresa en Colombia aprovechar esta tecnología hoy mismo?</strong> En AI Company CO trabajamos con pymes de Bogotá, Medellín, Cali y todo el país implementando chatbots con IA que funcionan en WhatsApp, Instagram y la página web.</p>

<h2>¿Qué son los chatbots con IA y por qué importan para tu negocio?</h2>
<p>Un chatbot con IA no es el viejo menú de opciones numeradas. Los modelos de lenguaje actuales entienden el español colombiano, interpretan preguntas complejas y dan respuestas personalizadas las 24 horas. La diferencia entre un chatbot básico y uno con IA puede significar la diferencia entre perder o cerrar una venta a las 11 pm.</p>

<p>En Colombia, el 78% de los consumidores espera respuesta en menos de 5 minutos cuando escribe a una empresa por WhatsApp. Sin automatización, eso es imposible de cumplir sin un equipo grande. Con un chatbot con IA, una sola persona puede gestionar cientos de conversaciones simultáneas.</p>

<h2>Casos de uso reales para empresas colombianas</h2>

<div class="use-case">
<h3>🍽️ Restaurantes y domicilios</h3>
<p>Un chatbot con IA puede tomar pedidos por WhatsApp, confirmar disponibilidad, calcular tiempos de entrega y enviar el link de pago — sin intervención humana. Restaurantes en Bogotá reportan hasta 35% más pedidos directos (sin comisión de Rappi) implementando este sistema.</p>
</div>

<div class="use-case">
<h3>🏥 Clínicas y consultorios</h3>
<p>El chatbot agenda citas, envía recordatorios 24 horas antes, recopila síntomas iniciales del paciente y confirma el seguro médico. Clínicas en Medellín han reducido el no-show (pacientes que no llegan) hasta en un 40% con recordatorios automáticos.</p>
</div>

<div class="use-case">
<h3>🔧 Ferreterías y tiendas distribuidoras</h3>
<p>Clientes que preguntan por disponibilidad y precio de productos a cualquier hora. El chatbot consulta el inventario en tiempo real, confirma si el producto está disponible y genera la orden. Ferreterías en Cali atienden 3 veces más consultas sin contratar personal adicional.</p>
</div>

<div class="callout">💡 <strong>Dato clave:</strong> Las empresas que implementan chatbots con IA en Colombia reportan en promedio una reducción del 65% en tiempo de respuesta al cliente y un aumento del 28% en conversiones dentro de los primeros 90 días.</div>

<h2>¿Cuánto cuesta implementar un chatbot con IA en Colombia?</h2>
<p>Los precios varían según la complejidad y las integraciones requeridas:</p>
<ul>
<li><strong>Chatbot básico (respuestas frecuentes + WhatsApp):</strong> $2.500.000 – $4.500.000 COP</li>
<li><strong>Chatbot con IA conversacional + CRM:</strong> $5.000.000 – $10.000.000 COP</li>
<li><strong>Sistema completo con inventario + pagos + multi-agente:</strong> $10.000.000 – $20.000.000 COP</li>
</ul>
<p>El mantenimiento mensual varía entre $400.000 y $1.200.000 COP dependiendo del volumen de conversaciones. La mayoría de empresas colombianas recuperan la inversión en 3 a 6 meses.</p>`,
    getFAQs: () => [
      { q: '¿Un chatbot con IA puede reemplazar a mi equipo de atención al cliente?', a: 'No completamente, pero puede manejar el 70-80% de las consultas rutinarias (precios, horarios, disponibilidad, seguimiento de pedidos) de forma automática. Tu equipo humano se concentra en los casos complejos y en cerrar ventas de alto valor.' },
      { q: '¿El chatbot funciona en WhatsApp Business?', a: 'Sí. Se conecta a WhatsApp Business API oficial (Meta), lo que permite respuestas automáticas, envío de catálogos, confirmaciones de pedido y seguimiento. Tu número actual puede migrar a la API sin perderlo.' },
      { q: '¿Cuánto tiempo tarda en estar listo el chatbot?', a: 'Un chatbot básico para WhatsApp puede estar funcional en 1-2 semanas. Un sistema con IA conversacional avanzada, integración a inventario y CRM tarda entre 3 y 6 semanas dependiendo de las integraciones.' },
      { q: '¿El chatbot puede hablar en español colombiano?', a: 'Sí. Los modelos actuales de IA entienden perfectamente el español colombiano incluyendo modismos, preguntas informales y diferentes formas de escribir. Se puede entrenar con ejemplos específicos de tu negocio y sector.' },
    ],
  },

  'whatsapp-ia': {
    slugSuffix: 'whatsapp-automatico-ia-colombia',
    servicioLink: '../../servicios/whatsapp-automatico/',
    servicioNombre: 'WhatsApp Automático',
    getTitle: (t) => `WhatsApp con IA para Negocios en Colombia: ${t.split(' ').slice(0,4).join(' ')}`,
    getMetaDesc: (t, d) => `Nueva tendencia en WhatsApp IA para empresas colombianas. Automatiza pedidos, citas y cobros sin perder el toque humano. Guía práctica 2026.`,
    getBody: (noticia, fecha) => `
<p>WhatsApp es el canal de comunicación número 1 en Colombia: más del 92% de los colombianos lo usa a diario para comunicarse con empresas, pedir domicilios y hacer preguntas de compra. La noticia reciente — <strong>${noticia.title}</strong> — confirma que WhatsApp con inteligencia artificial es la frontera donde los negocios más exitosos están ganando clientes.</p>

<p>La diferencia entre un negocio que responde WhatsApp manualmente y uno que lo tiene automatizado con IA es enorme: el primero pierde ventas fuera del horario laboral, el segundo las captura las 24 horas.</p>

<h2>¿Qué puede hacer WhatsApp con IA por tu empresa en Colombia?</h2>
<p>La API oficial de WhatsApp Business (Meta) combinada con inteligencia artificial permite automatizaciones que hace 3 años eran imposibles o costosísimas:</p>

<ul>
<li>✅ Responder preguntas de precio, disponibilidad y horarios automáticamente</li>
<li>✅ Recibir pedidos y generar confirmaciones con número de orden</li>
<li>✅ Agendar citas y enviar recordatorios</li>
<li>✅ Procesar pagos por link (PSE, Nequi, Daviplata)</li>
<li>✅ Hacer seguimiento a pedidos en tiempo real</li>
<li>✅ Enviar campañas de reactivación a clientes inactivos</li>
</ul>

<div class="use-case">
<h3>🏨 Hoteles y hospedajes</h3>
<p>El bot de WhatsApp responde preguntas de disponibilidad, envía tarifas con fotos de habitaciones, procesa la reserva y cobra el adelanto — todo automáticamente. Hoteles boutique en el Eje Cafetero reportan 30% más reservas directas evitando la comisión del 18% de Booking.com.</p>
</div>

<div class="use-case">
<h3>💊 Droguerías y farmacias</h3>
<p>Clientes que envían foto de la fórmula médica y reciben disponibilidad y precio en segundos. El sistema puede agendar el domicilio y cobrar con Nequi. Droguerías de barrio en Medellín atienden el doble de pedidos sin contratar más personal.</p>
</div>

<div class="use-case">
<h3>🏗️ Constructoras e inmobiliarias</h3>
<p>Prospectos que preguntan por proyectos reciben un catálogo digital automático con fotos, precios y ubicación. El bot califica el interés del lead y agenda la visita al proyecto — el vendedor humano solo interviene cuando el cliente está listo para comprar.</p>
</div>

<div class="callout">📊 <strong>Estadística Colombia 2026:</strong> Las empresas que automatizan WhatsApp con IA ven en promedio 45% más respuestas a sus mensajes y 32% menos abandono de conversaciones antes de la compra.</div>

<h2>Costos de WhatsApp automático con IA en Colombia</h2>
<p>Meta cobra por conversación (no por mensaje):</p>
<ul>
<li><strong>Conversaciones de servicio</strong> (cliente escribe primero): ~$70-$85 COP c/u</li>
<li><strong>Conversaciones de marketing</strong> (empresa escribe primero): ~$120-$180 COP c/u</li>
</ul>
<p>El costo del software de automatización varía:</p>
<ul>
<li><strong>Implementación inicial:</strong> $3.000.000 – $8.000.000 COP</li>
<li><strong>Mantenimiento mensual:</strong> $500.000 – $1.500.000 COP</li>
</ul>`,
    getFAQs: () => [
      { q: '¿Necesito cambiar mi número de WhatsApp para automatizarlo?', a: 'No necesariamente. Tu número actual puede migrarse a WhatsApp Business API siempre que sea un número móvil o fijo (no un número ya registrado en la app normal de WhatsApp). El proceso de migración tarda entre 3 y 7 días hábiles.' },
      { q: '¿WhatsApp automático puede enviar mensajes masivos?', a: 'Sí, pero solo con plantillas de mensaje aprobadas previamente por Meta. Los mensajes de servicio (respuestas a clientes que escribieron primero) son ilimitados y no necesitan plantilla. Las campañas de marketing masivo sí requieren aprobación.' },
      { q: '¿El bot puede procesar pagos por WhatsApp?', a: 'Sí, a través de links de pago generados automáticamente. El bot envía un link de Wompi, PayU o MercadoPago directamente en el chat. El cliente paga con PSE, Nequi, Daviplata o tarjeta sin salir de WhatsApp.' },
      { q: '¿Qué pasa si el cliente hace una pregunta que el bot no sabe responder?', a: 'El sistema transfiere automáticamente la conversación a un agente humano y le notifica. Tú defines cuáles preguntas activan la transferencia. El agente retoma la conversación desde el historial completo, el cliente no nota la diferencia.' },
    ],
  },

  automatizacion: {
    slugSuffix: 'automatizacion-ia-procesos-colombia',
    servicioLink: '../../servicios/asistente-ia/',
    servicioNombre: 'Asistente IA y Automatización',
    getTitle: (t) => `Automatización con IA en Colombia 2026: Cómo Aplicar ${t.split(' ').slice(0,4).join(' ')} a tu Empresa`,
    getMetaDesc: (t) => `La automatización con IA está cambiando cómo operan las empresas colombianas. Guía práctica con casos reales, precios en COP y cómo empezar esta semana.`,
    getBody: (noticia, fecha) => `
<p>La automatización inteligente está dejando de ser un lujo de las grandes corporaciones para convertirse en una ventaja competitiva accesible para cualquier pyme colombiana. La noticia más reciente del sector — <strong>${noticia.title}</strong> — confirma que la ola de automatización con IA está llegando a todos los sectores.</p>

<p>En Colombia, las empresas que ya automatizaron sus procesos operativos reportan ahorros de entre el 25% y el 40% en costos administrativos. Pero más importante aún: sus equipos humanos se dedican a lo que realmente importa — vender, innovar y atender bien a los clientes — mientras las máquinas hacen el trabajo repetitivo.</p>

<h2>¿Qué procesos se pueden automatizar con IA hoy en Colombia?</h2>
<p>La respuesta corta: casi todo lo que sea repetitivo, basado en reglas o que implique mover datos entre sistemas. Los casos más comunes en empresas colombianas son:</p>

<ul>
<li>📧 <strong>Seguimiento de clientes</strong>: emails y WhatsApp automáticos según el estado del cliente</li>
<li>🧾 <strong>Facturación electrónica</strong>: generación y envío automático a la DIAN</li>
<li>📦 <strong>Control de inventario</strong>: alertas cuando el stock baja del mínimo</li>
<li>💳 <strong>Cobros y cartera</strong>: recordatorios automáticos de pago por WhatsApp y email</li>
<li>📊 <strong>Reportes gerenciales</strong>: dashboards actualizados en tiempo real</li>
<li>🔔 <strong>Notificaciones de pedidos</strong>: estado del pedido al cliente automáticamente</li>
</ul>

<div class="use-case">
<h3>⚙️ Talleres mecánicos y servicios técnicos</h3>
<p>Desde que el cliente agenda hasta que recoge su vehículo, el proceso completo puede ser automático: confirmación de cita por WhatsApp, alerta cuando el diagnóstico está listo, cotización enviada por chat, cobro por link de pago, y encuesta de satisfacción post-servicio. Talleres en Bogotá han triplicado su capacidad de atención sin contratar más personal.</p>
</div>

<div class="use-case">
<h3>🏪 Tiendas y distribuidoras</h3>
<p>El sistema conecta la caja registradora con el inventario: cada venta descuenta automáticamente, genera la factura electrónica para la DIAN, y crea la alerta de reabastecimiento cuando el stock llega al mínimo. El dueño recibe un reporte diario por WhatsApp a las 8pm con el resumen del día.</p>
</div>

<div class="use-case">
<h3>💼 Agencias y empresas de servicios</h3>
<p>Cuando llega un nuevo lead del formulario web: se crea automáticamente en el CRM, se envía un WhatsApp de bienvenida al prospecto, se notifica al vendedor asignado, y se programa un seguimiento en 48 horas si no hubo respuesta. Todo sin que nadie toque un teclado.</p>
</div>

<div class="callout">🚀 <strong>ROI real en Colombia:</strong> Una empresa de servicios en Medellín automatizó sus cobros de cartera y redujo la cartera vencida en un 38% en el primer trimestre, recuperando $12.000.000 COP adicionales sin contratar un cobrador.</div>

<h2>¿Cuánto cuesta automatizar una empresa en Colombia?</h2>
<p>Depende del alcance y las integraciones:</p>
<ul>
<li><strong>Automatización básica</strong> (2-3 procesos, n8n o Zapier): $2.000.000 – $5.000.000 COP</li>
<li><strong>Automatización media</strong> (5-8 procesos + CRM): $6.000.000 – $15.000.000 COP</li>
<li><strong>Automatización completa</strong> (toda la operación conectada): $15.000.000 – $40.000.000 COP</li>
</ul>`,
    getFAQs: () => [
      { q: '¿Necesito saber programar para automatizar mi empresa?', a: 'No. Herramientas como n8n o Make (Integromat) tienen interfaces visuales que permiten conectar aplicaciones sin código. Para automatizaciones avanzadas o a medida, nuestro equipo lo implementa por ti y te entrega funcionando.' },
      { q: '¿La automatización puede integrarse con mis sistemas actuales (contabilidad, inventario)?', a: 'En la mayoría de casos, sí. Los sistemas más usados en Colombia (Siigo, Alegra, World Office, Zeus) tienen APIs o exportaciones que permiten integrarse. Si tu sistema es muy antiguo o no tiene API, usamos otras técnicas como RPA (automatización robótica de procesos).' },
      { q: '¿Qué pasa si el sistema automático falla?', a: 'Los sistemas bien implementados tienen alertas de fallo y fallback manual. Si un proceso automático falla, el sistema notifica al responsable por WhatsApp o email para intervención humana. El downtime promedio de estos sistemas es menor al 0.5% mensual.' },
      { q: '¿Cuánto tiempo ahorra la automatización al mes?', a: 'Varía por proceso, pero en promedio las empresas colombianas que automatizan reportan ahorro de 20-40 horas de trabajo manual al mes. Procesos como facturación electrónica, envío de reportes y recordatorios de cobro son los que más tiempo ahorran.' },
    ],
  },

  'ia-marketing': {
    slugSuffix: 'ia-marketing-digital-colombia',
    servicioLink: '../../servicios/marketing-digital/',
    servicioNombre: 'Marketing Digital con IA',
    getTitle: (t) => `IA para Marketing Digital en Colombia: Cómo ${t.split(' ').slice(0,5).join(' ')} Cambia las Reglas`,
    getMetaDesc: (t) => `La inteligencia artificial está transformando el marketing digital en Colombia. Descubre cómo usar IA para crear contenido, segmentar audiencias y multiplicar resultados con menos presupuesto.`,
    getBody: (noticia, fecha) => `
<p>El marketing digital en Colombia está viviendo una revolución silenciosa impulsada por la inteligencia artificial. La noticia que acaba de aparecer — <strong>${noticia.title}</strong> — es solo una muestra de la velocidad a la que está evolucionando este sector.</p>

<p>Para las pymes colombianas, esto representa una oportunidad única: nunca antes había sido tan accesible crear campañas de marketing que compitan con las grandes marcas. Con las herramientas correctas de IA, un restaurante de barrio puede tener un marketing digital tan efectivo como una cadena de comidas.</p>

<h2>¿Cómo está usando la IA el marketing digital en Colombia?</h2>
<p>Las agencias y empresas colombianas más avanzadas ya usan IA en estas áreas clave:</p>

<ul>
<li>🎨 <strong>Creación de contenido</strong>: textos, imágenes y videos generados o mejorados con IA</li>
<li>🎯 <strong>Segmentación de audiencias</strong>: IA que identifica quiénes tienen más probabilidad de comprar</li>
<li>📈 <strong>Optimización de pauta</strong>: algoritmos que ajustan automáticamente dónde y cuándo mostrar los anuncios</li>
<li>💬 <strong>Chatbots de ventas</strong>: que convierten visitas de redes sociales en clientes</li>
<li>📧 <strong>Email marketing personalizado</strong>: mensajes diferentes para cada segmento de cliente</li>
</ul>

<div class="use-case">
<h3>📸 Clínicas estéticas y spas</h3>
<p>IA que analiza qué tipo de contenido (antes/después, testimonios, educativo) genera más citas agendadas. Las campañas se optimizan automáticamente hacia el contenido ganador. Clínicas en Bogotá reportan reducción del 40% en costo por cliente con esta estrategia.</p>
</div>

<div class="use-case">
<h3>🏘️ Inmobiliarias y constructoras</h3>
<p>IA que identifica, dentro de los seguidores de Instagram y Facebook, cuáles tienen el perfil de potencial comprador (edad, ingresos, comportamiento). Las campañas se muestran solo a ellos, reduciendo el desperdicio de presupuesto hasta en un 60%.</p>
</div>

<div class="use-case">
<h3>🍕 Cadenas de comida y restaurantes</h3>
<p>Sistema que analiza en qué horas y días sube la demanda, lanza automáticamente promociones en esos momentos, y mide el impacto en pedidos. Un restaurante en Medellín aumentó sus domicilios del martes (el día más flojo) en un 45% usando este sistema.</p>
</div>

<div class="callout">📊 <strong>Colombia 2026:</strong> Las empresas que usan IA en sus campañas de marketing reportan en promedio un ROAS (retorno por cada peso invertido en pauta) 2.3 veces mayor que las que hacen marketing tradicional.</div>

<h2>¿Cuánto cuesta el marketing digital con IA en Colombia?</h2>
<ul>
<li><strong>Gestión básica de redes + pauta:</strong> $1.500.000 – $3.000.000 COP/mes</li>
<li><strong>Estrategia completa con IA + contenido + pauta:</strong> $4.000.000 – $8.000.000 COP/mes</li>
<li><strong>Inversión en pauta digital</strong> (no incluida en gestión): desde $500.000 COP/mes</li>
</ul>`,
    getFAQs: () => [
      { q: '¿Puedo hacer marketing digital con IA con poco presupuesto?', a: 'Sí. Con $500.000 COP/mes en pauta y las herramientas correctas de IA, un negocio local puede generar resultados medibles. La clave es segmentación geográfica muy precisa (radio de 3-5 km) y contenido generado con IA para bajar costos de producción.' },
      { q: '¿La IA puede crear el contenido visual de mis redes sociales?', a: 'Sí. Herramientas como Canva IA, Adobe Firefly o Midjourney pueden generar imágenes y videos a partir de una descripción. El contenido se revisa y aprueba antes de publicar. Esto reduce el costo de diseño hasta en un 70% comparado con contratar un diseñador.' },
      { q: '¿Cuánto tiempo tarda en verse resultados?', a: 'Las campañas de pauta (Instagram Ads, Google Ads) muestran resultados en 7-15 días. El crecimiento orgánico de redes sociales tarda 2-3 meses. Para SEO (posicionamiento en Google), el horizonte es 4-8 meses.' },
      { q: '¿AI Company CO maneja el marketing digital de empresas en toda Colombia?', a: 'Sí, trabajamos de forma 100% remota con empresas en Bogotá, Medellín, Cali, Barranquilla, Bucaramanga y cualquier ciudad de Colombia. Todas las reuniones y reportes se hacen por video llamada y WhatsApp.' },
    ],
  },

  'ia-general': {
    slugSuffix: 'ia-negocios-colombia-novedad',
    servicioLink: '../../servicios/asistente-ia/',
    servicioNombre: 'Soluciones de IA',
    getTitle: (t) => `${t.split(' ').slice(0,6).join(' ')}: Lo que Significa para los Negocios en Colombia`,
    getMetaDesc: (t) => `${t.slice(0,100)}. Analizamos cómo esta novedad de IA impacta a las empresas colombianas y cómo puedes aprovecharlo esta semana.`,
    getBody: (noticia, fecha) => `
<p>La inteligencia artificial no deja de sorprender. La más reciente noticia del sector — <strong>${noticia.title}</strong> — es otro recordatorio de que la transformación digital está ocurriendo más rápido de lo que muchos empresarios colombianos anticiparon.</p>

<p>Pero más allá del ruido mediático, la pregunta práctica es siempre la misma: <strong>¿cómo impacta esto a mi negocio en Colombia?</strong> En AI Company CO nos dedicamos exactamente a eso: traducir las novedades tecnológicas en soluciones concretas para restaurantes, clínicas, talleres, tiendas y empresas de servicios en todo el país.</p>

<h2>¿Por qué la IA importa para las empresas colombianas en 2026?</h2>
<p>Colombia tiene más de 2,5 millones de micro y pequeñas empresas. La gran mayoría sigue operando con procesos manuales que consumen tiempo, generan errores y limitan el crecimiento. La inteligencia artificial está cambiando esta ecuación de forma dramática:</p>

<ul>
<li>⚡ <strong>Velocidad</strong>: tareas que tomaban horas ahora toman segundos</li>
<li>💰 <strong>Costo</strong>: tecnología que antes era para grandes corporaciones ahora cuesta menos que un salario mínimo</li>
<li>🎯 <strong>Precisión</strong>: los sistemas de IA cometen menos errores que los humanos en tareas repetitivas</li>
<li>📈 <strong>Escalabilidad</strong>: un sistema de IA puede atender 10 o 10.000 clientes con el mismo costo</li>
</ul>

<div class="use-case">
<h3>🤖 Atención al cliente automatizada</h3>
<p>El primer punto de contacto con el cliente — WhatsApp, Instagram, página web — puede ser 100% automático con IA. El sistema responde preguntas, agenda citas, toma pedidos y escala al humano solo cuando es necesario. Empresas en toda Colombia están implementando esto con resultados medibles desde la primera semana.</p>
</div>

<div class="use-case">
<h3>📊 Análisis e inteligencia de negocio</h3>
<p>La IA puede analizar tus ventas, identificar qué productos tienen mejor margen, predecir cuándo un cliente va a recomprar, y alertarte cuando algo no va bien — todo en tiempo real. Lo que antes requería un analista de datos ahora lo hace un sistema automático a una fracción del costo.</p>
</div>

<div class="use-case">
<h3>🔄 Automatización de procesos internos</h3>
<p>Desde la facturación electrónica automática hasta los reportes diarios de ventas por WhatsApp, la IA puede conectar todos los sistemas de tu empresa y hacer que "hablen" entre sí sin intervención manual. Empresas de Bogotá y Medellín reportan ahorros de 30-40 horas semanales con estas automatizaciones.</p>
</div>

<div class="callout">🇨🇴 <strong>Colombia en números:</strong> Según el DANE, las empresas que adoptaron tecnologías digitales avanzadas en 2025 crecieron 2.4 veces más rápido que las que no lo hicieron. La IA es el próximo gran diferenciador.</div>

<h2>¿Cuánto cuesta implementar IA en una empresa colombiana?</h2>
<p>Dependiendo de la solución y el tamaño del negocio:</p>
<ul>
<li><strong>Soluciones básicas</strong> (chatbot o automatización simple): desde $2.000.000 COP</li>
<li><strong>Soluciones medianas</strong> (integración completa de canales): $5.000.000 – $15.000.000 COP</li>
<li><strong>Transformación digital completa</strong>: $15.000.000 – $60.000.000 COP</li>
</ul>
<p>El retorno de inversión promedio en empresas colombianas es de 8-14 meses. Después de ese punto, el sistema genera valor neto cada mes.</p>`,
    getFAQs: () => [
      { q: '¿Por dónde debe empezar una empresa colombiana que quiere usar IA?', a: 'El mejor punto de entrada es automatizar el proceso que más tiempo consume o que genera más errores. Para la mayoría de pymes colombianas, eso es la atención al cliente por WhatsApp. Es el cambio que se implementa más rápido y que genera resultados más visibles desde el primer mes.' },
      { q: '¿Necesito una empresa grande para poder usar IA?', a: 'No. Las soluciones de IA actuales son accesibles desde negocios unipersonales hasta empresas medianas. Un restaurante de barrio, un consultorio dental o una ferretería familiar pueden implementar sistemas de IA por menos de $3.000.000 COP y ver resultados en semanas.' },
      { q: '¿Qué tan difícil es aprender a usar los sistemas de IA?', a: 'Los sistemas que implementamos son intuitivos y no requieren conocimientos técnicos. Entregamos capacitación incluida y soporte continuo por WhatsApp. En promedio, los equipos de nuestros clientes dominan el sistema en 1-2 semanas.' },
      { q: '¿Cómo contacto a AI Company CO para empezar?', a: 'La forma más rápida es por WhatsApp al +57 321 267 4754. Respondemos en menos de 4 horas hábiles. La primera consulta es gratuita y sin compromiso — analizamos tu negocio y te decimos qué solución tiene más sentido para ti.' },
    ],
  },
};

// Categorías que usan el template de ia-general como fallback
['ia-creativa', 'ia-voz', 'ia-datos', 'robotica'].forEach(cat => {
  TEMPLATES[cat] = TEMPLATES['ia-general'];
});

// ─── Generar HTML del artículo ────────────────────────────────────────────────
function generarHTML(noticia, slug, dateStr, tpl) {
  const titulo = tpl.getTitle(noticia.title);
  const metaDesc = tpl.getMetaDesc(noticia.title, dateStr);
  const canonicalUrl = `https://aicompanyco.com/blog/${slug}/`;
  const waText = encodeURIComponent(`Hola, leí el artículo sobre "${noticia.title}" y quiero más información.`);
  const waLink = `https://wa.me/573212674754?text=${waText}`;
  const faqs = tpl.getFAQs();
  const body = tpl.getBody(noticia, dateStr);

  const faqSchema = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: faqs.map(f => ({
      '@type': 'Question',
      name: f.q,
      acceptedAnswer: { '@type': 'Answer', text: f.a },
    })),
  };

  const articleSchema = {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: titulo,
    description: metaDesc,
    image: { '@type': 'ImageObject', url: 'https://aicompanyco.com/logo.png', width: 400, height: 400 },
    datePublished: dateStr,
    dateModified: dateStr,
    url: canonicalUrl,
    author: { '@type': 'Organization', name: 'AI Company CO', url: 'https://aicompanyco.com' },
    publisher: {
      '@type': 'Organization',
      name: 'AI Company CO',
      url: 'https://aicompanyco.com',
      logo: { '@type': 'ImageObject', url: 'https://aicompanyco.com/logo.png' },
    },
  };

  const faqHtml = faqs.map(f => `
    <details class="faq-item">
      <summary class="faq-q">${f.q}<span class="faq-icon">+</span></summary>
      <p class="faq-a">${f.a}</p>
    </details>`).join('');

  return `<!DOCTYPE html>
<html lang="es-CO">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>${titulo.slice(0, 65)} | AI Company CO</title>
  <meta name="description" content="${metaDesc}" />
  <link rel="canonical" href="${canonicalUrl}" />
  <link rel="icon" href="../../logo.png" type="image/png" />
  <link rel="preconnect" href="https://fonts.googleapis.com" />
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
  <link href="https://fonts.googleapis.com/css2?family=Orbitron:wght@400;700;900&family=DM+Sans:wght@300;400;500;600;700&display=swap" rel="stylesheet" />
  <meta property="og:type" content="article" />
  <meta property="og:title" content="${titulo}" />
  <meta property="og:description" content="${metaDesc}" />
  <meta property="og:url" content="${canonicalUrl}" />
  <meta property="og:image" content="https://aicompanyco.com/logo.png" />
  <meta property="og:locale" content="es_CO" />
  <meta name="twitter:card" content="summary_large_image" />
  <script type="application/ld+json">${JSON.stringify(articleSchema)}</script>
  <script type="application/ld+json">${JSON.stringify(faqSchema)}</script>
  <style>
    :root { --purple-dark:#5A00B8; --purple-light:#9B5FFF; --bg:#0D0D14; --bg2:#12121C; --text:#E8E8F0; --text-muted:#8A8D99; }
    *,*::before,*::after { box-sizing:border-box; margin:0; padding:0; }
    body { background:var(--bg); color:var(--text); font-family:'DM Sans',sans-serif; line-height:1.75; }
    a { color:var(--purple-light); }
    nav { display:flex; justify-content:space-between; align-items:center; padding:1rem 2rem; border-bottom:1px solid #1E1E2E; position:sticky; top:0; background:var(--bg); z-index:100; }
    .nav-logo { font-family:'Orbitron',sans-serif; font-weight:700; font-size:1.1rem; color:var(--text); text-decoration:none; }
    .nav-btn { background:var(--purple-dark); color:#fff; padding:.5rem 1.2rem; border-radius:6px; font-size:.85rem; text-decoration:none; }
    .container { max-width:760px; margin:0 auto; padding:0 1.5rem; }
    .breadcrumb { font-size:.8rem; color:var(--text-muted); padding:1.2rem 0; }
    .breadcrumb a { color:var(--text-muted); text-decoration:none; }
    .hero { padding:2.5rem 0 1.5rem; }
    .post-category { display:inline-block; background:rgba(155,95,255,.15); border:1px solid rgba(155,95,255,.4); color:var(--purple-light); padding:.25rem .9rem; border-radius:99px; font-size:.78rem; margin-bottom:1rem; }
    .hero h1 { font-family:'Orbitron',sans-serif; font-size:clamp(1.5rem,3.5vw,2.2rem); font-weight:900; line-height:1.2; margin-bottom:1rem; }
    .post-meta { font-size:.82rem; color:var(--text-muted); margin-bottom:1.5rem; }
    .news-callout { background:#1a1a2e; border:1px solid rgba(155,95,255,.3); border-left:3px solid var(--purple-light); border-radius:8px; padding:1rem 1.2rem; margin-bottom:2rem; font-size:.9rem; color:var(--text-muted); }
    .news-callout strong { color:var(--purple-light); }
    .article-body h2 { font-family:'Orbitron',sans-serif; font-size:1.2rem; font-weight:700; margin:2rem 0 .75rem; color:var(--text); }
    .article-body h3 { font-size:1rem; font-weight:700; margin:1.5rem 0 .5rem; color:var(--purple-light); }
    .article-body p { margin-bottom:1rem; color:#C8C8D8; }
    .article-body ul { margin:.5rem 0 1.2rem 1.2rem; color:#C8C8D8; }
    .article-body li { margin-bottom:.4rem; }
    .article-body strong { color:var(--text); }
    .use-case { background:var(--bg2); border:1px solid #1E1E2E; border-radius:12px; padding:1.25rem 1.5rem; margin:1.25rem 0; }
    .use-case h3 { margin:0 0 .5rem; font-size:.95rem; }
    .callout { background:rgba(155,95,255,.1); border:1px solid rgba(155,95,255,.25); border-radius:10px; padding:1rem 1.25rem; margin:1.5rem 0; font-size:.92rem; }
    .cta-inline { background:linear-gradient(135deg,rgba(90,0,184,.3),rgba(155,95,255,.15)); border:1px solid rgba(155,95,255,.3); border-radius:14px; padding:2rem; text-align:center; margin:2rem 0; }
    .cta-inline p { color:var(--text-muted); margin-bottom:1rem; }
    .btn-wa { display:inline-flex; align-items:center; gap:.5rem; background:#25D366; color:#fff; padding:.8rem 1.8rem; border-radius:8px; text-decoration:none; font-weight:700; font-size:.95rem; }
    .faq-section { margin:2.5rem 0; padding:1.75rem; background:var(--bg2); border-radius:14px; border:1px solid rgba(90,0,184,.2); }
    .faq-title { color:var(--purple-light); font-family:'Orbitron',sans-serif; font-size:1.2rem; margin-bottom:1.2rem; }
    .faq-item { background:var(--bg); border-radius:9px; border:1px solid rgba(155,95,255,.15); margin-bottom:.6rem; overflow:hidden; }
    .faq-item[open] { border-color:rgba(155,95,255,.4); }
    .faq-q { display:flex; justify-content:space-between; align-items:center; padding:.9rem 1.1rem; color:var(--text); font-weight:600; cursor:pointer; list-style:none; font-size:.93rem; gap:1rem; }
    .faq-q::-webkit-details-marker { display:none; }
    .faq-icon { color:var(--purple-light); font-size:1.3rem; flex-shrink:0; transition:transform .2s; }
    .faq-item[open] .faq-icon { transform:rotate(45deg); }
    .faq-a { padding:0 1.1rem .9rem; color:var(--text-muted); line-height:1.7; font-size:.9rem; margin:0; }
    footer { text-align:center; padding:2rem; color:var(--text-muted); font-size:.82rem; border-top:1px solid #1E1E2E; }
    footer a { color:var(--text-muted); }
  </style>
</head>
<body>

<nav>
  <a href="../../" class="nav-logo">AI Company CO</a>
  <a href="../../#contacto" class="nav-btn">Hablemos →</a>
</nav>

<main>
  <div class="container">
    <div class="breadcrumb">
      <a href="../../">Inicio</a> / <a href="../">Blog</a> / <span>${titulo.slice(0, 50)}...</span>
    </div>

    <article class="hero">
      <span class="post-category">🔴 Novedad IA · Colombia</span>
      <h1>${titulo}</h1>
      <div class="post-meta">Por AI Company CO · ${monthName(dateStr)} · 6 minutos de lectura</div>

      <div class="news-callout">
        📰 <strong>Noticia que origina este artículo:</strong> ${noticia.title}
        ${noticia.desc ? `<br><span style="font-size:.85rem;opacity:.8">${noticia.desc.slice(0, 200)}...</span>` : ''}
      </div>
    </article>

    <div class="article-body">
      ${body}

      <div class="cta-inline">
        <h3 style="margin-bottom:.5rem;font-family:'Orbitron',sans-serif;font-size:1.1rem;">¿Quieres implementar esto en tu empresa?</h3>
        <p>Nuestro equipo analiza tu negocio y te dice exactamente qué solución de IA tiene más sentido para ti. Primera consulta gratis.</p>
        <a href="${waLink}" target="_blank" class="btn-wa">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/></svg>
          Hablar por WhatsApp
        </a>
      </div>

      <section class="faq-section" id="preguntas-frecuentes">
        <h2 class="faq-title">Preguntas Frecuentes</h2>
        ${faqHtml}
      </section>
    </div>
  </div>
</main>

<footer>
  <p>© 2026 AI Company CO · <a href="../../">Inicio</a> · <a href="../../blog/">Blog</a> · <a href="${tpl.servicioLink}">${tpl.servicioNombre}</a> · <a href="../../#contacto">Contacto</a></p>
  <p style="margin-top:.4rem">Soacha, Cundinamarca, Colombia · +57 321 267 4754</p>
</footer>

</body>
</html>`;
}

// ─── Actualizar sitemaps ───────────────────────────────────────────────────────
function actualizarSitemap(slug, dateStr) {
  const url   = `https://aicompanyco.com/blog/${slug}/`;
  const entry = `  <url>\n    <loc>${url}</loc>\n    <lastmod>${dateStr}</lastmod>\n    <changefreq>weekly</changefreq>\n    <priority>0.75</priority>\n  </url>`;

  [SITEMAP_SEO, SITEMAP_MAIN].forEach(file => {
    if (!fs.existsSync(file)) return;
    let xml = fs.readFileSync(file, 'utf8');
    if (!xml.includes(url)) {
      xml = xml.replace('</urlset>', `${entry}\n</urlset>`);
      fs.writeFileSync(file, xml, 'utf8');
    }
  });
}

// ─── Google Indexing ─────────────────────────────────────────────────────────
async function pingGoogle(slug) {
  const blogUrl    = `https://aicompanyco.com/blog/${slug}/`;
  const sitemapUrl = 'https://aicompanyco.com/sitemap-main.xml';

  // Ping 1: sitemap
  try {
    await fetchText(`https://www.google.com/ping?sitemap=${encodeURIComponent(sitemapUrl)}`);
    console.log('  → Google sitemap ping OK');
  } catch (e) {
    console.log(`  → Sitemap ping falló: ${e.message}`);
  }

  // Ping 2: Indexing API directa (gratis, requiere GOOGLE_INDEXING_KEY)
  const key = process.env.GOOGLE_INDEXING_KEY;
  if (!key) { console.log('  → Sin GOOGLE_INDEXING_KEY, se omite Indexing API'); return; }
  try {
    const creds = JSON.parse(key);
    const token = await getGoogleToken(creds);
    await notifyGoogleIndexing(blogUrl, token);
    console.log(`  → Google Indexing API: URL notificada directamente`);
  } catch (e) {
    console.log(`  → Indexing API falló: ${e.message}`);
  }
}

async function getGoogleToken(creds) {
  const { createSign } = require('crypto');
  const now     = Math.floor(Date.now() / 1000);
  const header  = Buffer.from(JSON.stringify({ alg: 'RS256', typ: 'JWT' })).toString('base64url');
  const payload = Buffer.from(JSON.stringify({
    iss: creds.client_email,
    scope: 'https://www.googleapis.com/auth/indexing',
    aud: 'https://oauth2.googleapis.com/token',
    exp: now + 3600,
    iat: now,
  })).toString('base64url');
  const sign = createSign('RSA-SHA256');
  sign.update(`${header}.${payload}`);
  const jwt  = `${header}.${payload}.${sign.sign(creds.private_key, 'base64url')}`;
  const body = `grant_type=urn%3Aietf%3Aparams%3Aoauth%3Agrant-type%3Ajwt-bearer&assertion=${jwt}`;
  const raw  = await new Promise((resolve, reject) => {
    const req = https.request('https://oauth2.googleapis.com/token', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded', 'Content-Length': Buffer.byteLength(body) },
    }, res => { let d = ''; res.on('data', c => d += c); res.on('end', () => resolve(d)); });
    req.on('error', reject); req.write(body); req.end();
  });
  const data = JSON.parse(raw);
  if (!data.access_token) throw new Error(data.error_description || 'Sin token');
  return data.access_token;
}

async function notifyGoogleIndexing(url, token) {
  const body = JSON.stringify({ url, type: 'URL_UPDATED' });
  return new Promise((resolve, reject) => {
    const req = https.request({
      hostname: 'indexing.googleapis.com',
      path: '/v3/urlNotifications:publish',
      method: 'POST',
      headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json', 'Content-Length': Buffer.byteLength(body) },
    }, res => {
      let d = ''; res.on('data', c => d += c);
      res.on('end', () => {
        const json = JSON.parse(d || '{}');
        if (res.statusCode !== 200) reject(new Error(json.error?.message || d));
        else resolve(json);
      });
    });
    req.on('error', reject); req.write(body); req.end();
  });
}

// ─── Main ─────────────────────────────────────────────────────────────────────
async function main() {
  // Cargar publicados
  const published = fs.existsSync(PUBLISHED_FILE)
    ? JSON.parse(fs.readFileSync(PUBLISHED_FILE, 'utf8'))
    : [];
  const publishedLinks = new Set(published.map(p => p.link));
  const publishedSlugs = new Set(
    fs.existsSync(BLOG_DIR)
      ? fs.readdirSync(BLOG_DIR).filter(d => fs.existsSync(path.join(BLOG_DIR, d, 'index.html')))
      : []
  );

  // Recolectar noticias de todos los feeds
  let allItems = [];
  for (const feedUrl of FEEDS) {
    try {
      console.log(`Fetching: ${feedUrl.split('?')[0]}`);
      const xml = await fetchText(feedUrl);
      const items = parseRSS(xml);
      allItems = allItems.concat(items);
    } catch (e) {
      console.warn(`  Feed error: ${e.message}`);
    }
  }

  // Deduplicar y filtrar ya publicadas
  const seen = new Set();
  const nuevas = allItems.filter(item => {
    if (!item.title || seen.has(item.link)) return false;
    seen.add(item.link);
    return !publishedLinks.has(item.link);
  });

  if (nuevas.length === 0) {
    console.log('No hay noticias nuevas. Nada que publicar.');
    return;
  }

  // Tomar la primera noticia relevante
  const noticia = nuevas[0];
  const categoria = clasificar(noticia);
  const tpl = TEMPLATES[categoria] || TEMPLATES['ia-general'];
  const dateStr = getTodayISO();

  // Generar slug único
  const baseSlug = slugify(noticia.title.split(' ').slice(0, 6).join(' ')) + '-colombia';
  let slug = baseSlug;
  let counter = 1;
  while (publishedSlugs.has(slug)) { slug = `${baseSlug}-${counter++}`; }

  console.log(`\nGenerando artículo: "${noticia.title.slice(0, 60)}..."`);
  console.log(`  Categoría: ${categoria}`);
  console.log(`  Slug: ${slug}`);

  // Generar HTML
  const html = generarHTML(noticia, slug, dateStr, tpl);

  // Guardar artículo
  const dir = path.join(BLOG_DIR, slug);
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
  fs.writeFileSync(path.join(dir, 'index.html'), html, 'utf8');
  console.log(`  ✓ Guardado en blog/${slug}/index.html`);

  // Actualizar sitemaps
  actualizarSitemap(slug, dateStr);
  console.log(`  ✓ Sitemaps actualizados`);

  // Registrar como publicada
  published.push({ link: noticia.link, title: noticia.title, slug, date: dateStr });
  fs.writeFileSync(PUBLISHED_FILE, JSON.stringify(published, null, 2), 'utf8');
  console.log(`  ✓ Registrado en published-news.json`);

  // Notificar a Google (sitemap ping + Indexing API)
  await pingGoogle(slug);

  console.log(`\n✅ Artículo publicado: https://aicompanyco.com/blog/${slug}/`);

  // Output para GitHub Actions
  const outFile = process.env.GITHUB_OUTPUT;
  if (outFile) {
    fs.appendFileSync(outFile, `new_post=true\n`);
    fs.appendFileSync(outFile, `slug=${slug}\n`);
  }
}

main().catch(e => { console.error('Error:', e.message); process.exit(1); });
