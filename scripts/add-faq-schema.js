#!/usr/bin/env node
/**
 * Adds FAQ schema (JSON-LD) + visible FAQ accordion to all blog articles.
 * FAQs target real questions people search on Google about each topic.
 * Run once: node scripts/add-faq-schema.js
 */

const fs = require('fs');
const path = require('path');

const BLOG_DIR = path.resolve(__dirname, '..', 'blog');

const FAQS = {
  'cuanto-cuesta-chatbot-ia-colombia': [
    { q: '¿Cuánto cuesta un chatbot con IA en Colombia?', a: 'El precio varía según la complejidad: un chatbot básico de respuestas fijas cuesta entre $800.000 y $2.000.000 COP. Un chatbot con IA que entiende lenguaje natural y se integra con WhatsApp o tu CRM va de $3.000.000 a $8.000.000 COP. Las soluciones enterprise con IA avanzada pueden superar $15.000.000 COP.' },
    { q: '¿Qué diferencia hay entre un chatbot básico y uno con IA?', a: 'Un chatbot básico sigue árboles de decisión fijos y solo responde opciones predefinidas. Un chatbot con IA entiende lenguaje natural, aprende de cada conversación, puede detectar la intención del cliente y dar respuestas personalizadas aunque el usuario no escriba exactamente como se programó.' },
    { q: '¿Cuánto tiempo tarda implementar un chatbot?', a: 'Un chatbot básico puede estar listo en 1-2 semanas. Un chatbot con IA integrado a WhatsApp Business y CRM tarda entre 3 y 6 semanas. El tiempo depende principalmente de las integraciones requeridas y la cantidad de flujos de conversación a programar.' },
    { q: '¿Vale la pena invertir en chatbot con IA para mi empresa?', a: 'Sí, especialmente si atiendes más de 50 conversaciones diarias. Las empresas colombianas reportan reducción del 60-70% en tiempo de atención al cliente y aumento del 30% en conversiones al implementar chatbots con IA. El retorno de inversión suele verse en los primeros 3-4 meses.' },
  ],
  'marketing-digital-restaurantes-colombia': [
    { q: '¿Cuánto cuesta el marketing digital para un restaurante en Colombia?', a: 'Un plan básico de redes sociales + pauta cuesta entre $800.000 y $2.500.000 COP mensuales. Un plan completo con gestión de redes, Google Ads, SEO local y email marketing va de $3.000.000 a $6.000.000 COP por mes. Muchos restaurantes empiezan con $500.000 en pauta y escalan según resultados.' },
    { q: '¿Qué redes sociales funcionan mejor para restaurantes en Colombia?', a: 'Instagram es la red más efectiva para restaurantes: el 78% de los colombianos busca comida en Instagram antes de salir. TikTok es la de mayor crecimiento, especialmente para restaurantes que quieren llegar a menores de 35 años. Facebook sigue siendo útil para audiencias mayores de 40 y para anuncios segmentados por zona.' },
    { q: '¿Cuánto tiempo tarda ver resultados con marketing digital?', a: 'Las campañas de pauta (Instagram Ads, Google Ads) generan resultados en 7-15 días. El posicionamiento orgánico en Google Maps tarda 2-3 meses. El SEO de la página web puede tardar 4-6 meses. Lo más rápido para un restaurante es combinar pauta digital + optimización de Google Business Profile.' },
    { q: '¿Cómo puede un restaurante conseguir más domicilios con marketing digital?', a: 'La estrategia más efectiva combina tres canales: WhatsApp Business automatizado para pedidos directos (sin comisión de Rappi), pauta en Instagram segmentada por radio de 3-5 km, y Google Business Profile optimizado para aparecer cuando buscan "domicilios cerca de mí". Restaurantes en Bogotá y Medellín reportan hasta 40% más pedidos directos con esta combinación.' },
  ],
  'pagina-web-clinica-colombia': [
    { q: '¿Cuánto cuesta hacer una página web para una clínica en Colombia?', a: 'Una página web profesional para clínica o consultorio en Colombia cuesta entre $2.500.000 y $8.000.000 COP incluyendo diseño, desarrollo y primer año de hosting. Las plataformas como WordPress con temas médicos pueden costar desde $800.000, pero carecen de personalización y velocidad. Una solución a medida con sistema de citas online parte de $4.000.000 COP.' },
    { q: '¿Qué debe tener la página web de una clínica para conseguir pacientes?', a: 'Los elementos esenciales son: sistema de agendamiento de citas online (reduce llamadas en 50%), perfil detallado de cada médico con foto y especialidad, certificaciones y acreditaciones visibles, mapa y horarios claros, y testimonios de pacientes. También es crucial el certificado SSL (https) y cumplimiento con la Ley 1581 de protección de datos de Colombia.' },
    { q: '¿Cómo puede una clínica aparecer en Google cuando buscan médicos?', a: 'La estrategia más efectiva combina Google Business Profile optimizado (para aparecer en Maps), SEO local con keywords como "médico especialista en [ciudad]", y blog médico con artículos sobre los servicios que ofrece. Las clínicas que optimizan estos tres canales consiguen entre 3 y 8 nuevos pacientes por mes solo por búsquedas orgánicas.' },
    { q: '¿La página web de una clínica necesita cumplir requisitos legales especiales?', a: 'Sí. En Colombia, las páginas web de clínicas deben incluir: política de privacidad y tratamiento de datos personales (Ley 1581/2012), habeas data, y no pueden mostrar precios de procedimientos médicos según la Circular 047 de la Superintendencia de Salud. También deben evitar promesas de resultados garantizados en salud.' },
  ],
  'automatizacion-procesos-constructoras-colombia': [
    { q: '¿Qué procesos de una constructora se pueden automatizar?', a: 'Los procesos más automatizables son: cotizaciones y presupuestos (reducen tiempo de respuesta de días a minutos), seguimiento de obra con reportes automáticos, gestión de proveedores y pedidos de materiales, facturación electrónica, nómina y control de asistencia de obreros. También es muy valioso automatizar el seguimiento de cartera y pagos de clientes.' },
    { q: '¿Cuánto puede ahorrar una constructora con automatización?', a: 'Las constructoras colombianas que implementan automatización reportan ahorros del 25-40% en costos administrativos. El mayor ahorro viene del control de inventario de materiales (reduce desperdicio 15-20%), la reducción de trabajo manual en cotizaciones (ahorra 2-3 horas diarias), y la automatización de cobros que reduce cartera vencida hasta en 35%.' },
    { q: '¿Cuánto cuesta implementar automatización en una constructora?', a: 'Un sistema básico de automatización para constructora mediana en Colombia cuesta entre $8.000.000 y $20.000.000 COP en implementación. Las soluciones más completas con integración a SAP o sistemas contables pueden llegar a $50.000.000 COP. El retorno de inversión promedio es de 8-14 meses.' },
    { q: '¿Qué software usan las constructoras más exitosas en Colombia?', a: 'Las grandes constructoras colombianas usan SAP o sistemas ERP completos. Las medianas tienden a implementar soluciones específicas para construcción como Procore, Buildertrend, o desarrollos a medida. Lo más importante no es el software sino que esté integrado: contabilidad, obra, cartera y proveedores en un solo sistema.' },
  ],
  'whatsapp-business-hoteles-colombia': [
    { q: '¿Cómo puede un hotel usar WhatsApp Business para recibir más reservas?', a: 'Un hotel puede configurar WhatsApp Business API para responder consultas de precios automáticamente, enviar disponibilidad en tiempo real, procesar pre-reservas y cobrar pagos por link. Los hoteles colombianos que automatizan WhatsApp reportan aumento del 25-35% en reservas directas, evitando la comisión del 15-20% de Booking.com o Airbnb.' },
    { q: '¿Cuánto cuesta automatizar WhatsApp para un hotel en Colombia?', a: 'Un sistema de WhatsApp automatizado para hotel cuesta entre $2.500.000 y $6.000.000 COP en implementación más $500.000-$1.500.000 mensuales de operación. La API oficial de WhatsApp Business cobra aproximadamente $60-$80 COP por mensaje de conversación iniciada. Para un hotel con 50 conversaciones diarias el costo mensual de mensajes es de $90.000-$120.000 COP.' },
    { q: '¿Qué mensajes automáticos debe tener un hotel en WhatsApp?', a: 'Los mensajes más efectivos son: confirmación de reserva con detalles e indicaciones, check-in express (enviar habitación y contraseña Wi-Fi), recordatorio 24 horas antes de llegada, mensaje de bienvenida al hacer check-in, y encuesta de satisfacción al salir. Estos 5 mensajes automáticos mejoran la reseña promedio en Google en 0.3-0.7 puntos.' },
    { q: '¿WhatsApp automático puede reemplazar a un recepcionista en un hotel?', a: 'No completamente, pero sí puede manejar el 70-80% de las consultas rutinarias: preguntas de precios, disponibilidad, servicios y acceso. El recepcionista puede concentrarse en la atención personalizada y casos especiales. Esto permite que hoteles boutique operen con menos personal sin sacrificar calidad de servicio.' },
  ],
  'app-movil-supermercado-colombia': [
    { q: '¿Cuánto cuesta desarrollar una app para supermercado en Colombia?', a: 'Una app básica de domicilios para supermercado cuesta entre $15.000.000 y $35.000.000 COP para iOS y Android. Una app completa con catálogo, pagos en línea, programas de fidelización y seguimiento de pedido en tiempo real puede llegar a $60.000.000-$100.000.000 COP. Las soluciones white-label (personalizar una plataforma existente) pueden costar desde $5.000.000 COP.' },
    { q: '¿Vale la pena tener app propia o es mejor usar Rappi o Domicilios.com?', a: 'Depende del volumen de pedidos. Con menos de 200 pedidos diarios, las plataformas de domicilios son más económicas pese a la comisión del 25-30%. Con más de 200 pedidos diarios, la app propia se paga sola en 8-12 meses. La app propia también permite construir base de datos de clientes, lanzar promociones propias y evitar dependencia de terceros.' },
    { q: '¿Qué funciones debe tener la app de un supermercado colombiano?', a: 'Las funciones esenciales son: catálogo con fotos y precios actualizados en tiempo real, carrito de compras, múltiples métodos de pago (PSE, Nequi, Daviplata, tarjeta), selección de franja horaria de entrega, seguimiento del pedido en mapa, y programa de puntos o cashback. La función más valorada por usuarios colombianos es el pago con Nequi o Daviplata.' },
    { q: '¿Cuánto tiempo tarda desarrollar la app de un supermercado?', a: 'Una app básica tarda entre 3 y 5 meses en desarrollo. Una app completa con todas las integraciones (POS, inventario, pasarelas de pago) puede tardar 6-9 meses. Es importante incluir 1-2 meses de pruebas con usuarios reales antes del lanzamiento oficial para identificar problemas de usabilidad.' },
  ],
  'automatizar-whatsapp-ferreterias-colombia': [
    { q: '¿Cómo puede una ferretería automatizar sus pedidos por WhatsApp?', a: 'Una ferretería puede configurar WhatsApp Business API para recibir pedidos automáticamente: el cliente escribe el producto, el bot consulta el inventario en tiempo real, confirma precio y disponibilidad, y genera la orden. También puede enviar catálogos PDF automáticamente y hacer seguimiento del pedido. Ferreterías en Colombia con este sistema atienden pedidos a cualquier hora sin personal adicional.' },
    { q: '¿Cuánto cuesta un sistema de pedidos por WhatsApp para ferretería?', a: 'Un sistema de WhatsApp automatizado para ferretería en Colombia cuesta entre $3.000.000 y $8.000.000 COP en implementación inicial, más $500.000-$1.200.000 COP mensuales. El costo depende principalmente de si se integra con el sistema de inventario existente. La mayoría de ferreterías recuperan la inversión en 4-6 meses por aumento de pedidos y reducción de llamadas.' },
    { q: '¿WhatsApp automático funciona para ferreterías con miles de referencias?', a: 'Sí, siempre que el sistema esté integrado con el inventario. El bot puede buscar productos por nombre, código o categoría y mostrar disponibilidad en tiempo real. Para catálogos muy grandes, se usan menús por categoría (tornillería, eléctrico, plomería) que el cliente navega desde WhatsApp. Esta navegación reduce el tiempo de pedido de 10 minutos a 2-3 minutos.' },
    { q: '¿Necesito cambiar mi número de WhatsApp para automatizarlo?', a: 'No necesariamente. Con WhatsApp Business API oficial puedes mantener tu número actual (si es una línea móvil o fija). Sin embargo, si ya lo usas en la app normal de WhatsApp Business, hay un proceso de migración. Lo importante es que el número quede registrado en Meta Business Suite. Este proceso tarda entre 3 y 7 días hábiles.' },
  ],
  'chatbot-ia-clinicas-colombia': [
    { q: '¿Qué puede hacer un chatbot con IA en una clínica u odontología?', a: 'Un chatbot con IA puede agendar, confirmar y cancelar citas automáticamente (reduciendo no-shows hasta 40%), responder preguntas sobre servicios, tarifas y ubicación, enviar recordatorios de cita, recopilar síntomas iniciales del paciente antes de la consulta, y gestionar autorizaciones de seguros. Todo esto sin intervención humana y disponible las 24 horas.' },
    { q: '¿Es seguro usar chatbots con información médica de pacientes?', a: 'Sí, siempre que el sistema cumpla con la Ley 1581 de Protección de Datos de Colombia y la Resolución 1995 de 1999 sobre historias clínicas. Los datos deben almacenarse en servidores con cifrado y los pacientes deben autorizar explícitamente el tratamiento de sus datos. Un chatbot bien implementado puede ser más seguro que el manejo manual de datos.' },
    { q: '¿Cuánto cuesta un chatbot para clínica o consultorio en Colombia?', a: 'Un chatbot básico para agendamiento en clínica cuesta entre $2.000.000 y $5.000.000 COP. Un sistema completo con IA, integración a software médico (historia clínica electrónica), WhatsApp y confirmaciones automáticas va de $6.000.000 a $15.000.000 COP. El costo mensual de operación es entre $400.000 y $1.500.000 COP.' },
    { q: '¿Puede un chatbot reemplazar a la recepcionista de una clínica?', a: 'Puede manejar el 65-75% de las tareas administrativas de recepción: agendamiento, recordatorios, información general y cobros. La recepcionista humana sigue siendo necesaria para situaciones complejas, urgencias y la atención presencial cálida que esperan los pacientes. La combinación chatbot + recepcionista es más eficiente que cualquiera de los dos solos.' },
  ],
  'como-automatizar-whatsapp-business-colombia': [
    { q: '¿Qué diferencia hay entre WhatsApp Business y WhatsApp Business API?', a: 'WhatsApp Business es la app gratuita para pequeños negocios con respuestas automáticas básicas y catálogo. WhatsApp Business API es la versión para empresas que permite automatización avanzada, chatbots con IA, envío masivo de mensajes, integración con CRM y atención multi-agente. La API requiere aprobación de Meta y tiene costo según el volumen de mensajes.' },
    { q: '¿Cuánto cuesta la API de WhatsApp Business en Colombia?', a: 'Meta cobra por conversación, no por mensaje individual. Las conversaciones de servicio (cliente inicia) cuestan aproximadamente $70-$85 COP cada una. Las conversaciones de marketing (empresa inicia) cuestan entre $120 y $180 COP. Para una empresa con 100 conversaciones diarias, el costo mensual de WhatsApp API es de $210.000-$510.000 COP más el costo del software proveedor.' },
    { q: '¿Puedo automatizar WhatsApp sin perder mi número actual?', a: 'Sí, puedes migrar tu número actual de WhatsApp Business a la API oficial. El proceso requiere: que el número no esté activo en WhatsApp personal, verificación de la empresa en Meta Business Suite, y un período de migración de 3-7 días. Durante la migración, el número no puede recibir llamadas de WhatsApp, solo mensajes.' },
    { q: '¿Qué tipo de mensajes se pueden automatizar en WhatsApp Business?', a: 'Se pueden automatizar: respuestas a preguntas frecuentes (precios, horarios, ubicación), confirmaciones de pedido o reserva, recordatorios de cita o pago, seguimiento de envío, encuestas de satisfacción post-compra, y campañas de re-engagement. Los mensajes de marketing masivo requieren plantillas aprobadas previamente por Meta.' },
  ],
  'facturacion-electronica-automatica-colombia': [
    { q: '¿Es obligatoria la facturación electrónica para todos los negocios en Colombia?', a: 'Sí, desde 2023 la DIAN exige facturación electrónica para todos los contribuyentes inscritos en el régimen ordinario. Los pequeños negocios del régimen simple tienen plazos diferenciados. Quien factura sin el sistema electrónico puede enfrentar sanciones desde 1 UVT ($47.065 en 2026) por cada factura emitida incorrectamente.' },
    { q: '¿Cuánto cuesta un software de facturación electrónica en Colombia?', a: 'Los planes básicos para emprendedores cuestan entre $30.000 y $80.000 COP mensuales (Siigo, Alegra, Factúralos). Para medianas empresas con inventario y contabilidad integrada, los planes van de $150.000 a $500.000 COP mensuales. Las soluciones enterprise como SAP Business One para Colombia pueden costar $2.000.000-$5.000.000 COP mensuales.' },
    { q: '¿Cómo se conecta el software de facturación con la DIAN?', a: 'El software debe estar habilitado por la DIAN como proveedor tecnológico autorizado. Al emitir una factura, el sistema la envía automáticamente a la DIAN en formato XML con firma digital, recibe la respuesta de validación (en segundos) y solo entonces puede enviarse al cliente. Todo este proceso es transparente para el usuario.' },
    { q: '¿Puedo automatizar facturas recurrentes para clientes fijos?', a: 'Sí. Los mejores sistemas de facturación electrónica permiten programar facturas recurrentes mensuales, quincenales o anuales que se generan y envían automáticamente a la DIAN y al cliente. Esto es especialmente útil para arriendos, suscripciones, servicios fijos y contratos de mantenimiento. Ahorra 2-4 horas semanales de trabajo administrativo.' },
  ],
  'marketing-digital-gimnasios-colombia': [
    { q: '¿Cuánto cuesta el marketing digital para un gimnasio en Colombia?', a: 'Un plan de marketing digital básico para gimnasio (redes sociales + pauta local) cuesta entre $1.200.000 y $3.000.000 COP mensuales. Un plan completo con Google Ads, Instagram Ads, email marketing y gestión de comunidad va de $3.500.000 a $7.000.000 COP. La inversión en pauta (no incluida en gestión) más efectiva para un gimnasio nuevo es $500.000-$1.500.000 COP mensuales.' },
    { q: '¿Qué redes sociales funcionan mejor para gimnasios en Colombia?', a: 'Instagram es la principal plataforma para gimnasios (transformaciones físicas, rutinas, motivación). TikTok tiene el mayor alcance orgánico para contenido de ejercicios. YouTube funciona bien para tutoriales largos y construcción de autoridad. Facebook sigue siendo útil para grupos de comunidad y anuncios segmentados por edad y zona. Los gimnasios más exitosos usan Instagram + TikTok como combinación principal.' },
    { q: '¿Cómo consigue miembros un gimnasio nuevo en Colombia?', a: 'La estrategia más efectiva para un gimnasio nuevo combina: mes de apertura con precios especiales promovidos en Instagram Ads (segmentado a 3-5 km), alianza con nutricionistas y fisioterapeutas locales para referencias cruzadas, Google Business Profile con fotos de las instalaciones, y referidos: cada miembro que trae un amigo recibe un mes gratis o descuento.' },
    { q: '¿Vale la pena Google Ads para un gimnasio?', a: 'Sí, especialmente para capturar intención de compra inmediata. Cuando alguien busca "gimnasio en [barrio/ciudad]" está listo para inscribirse. El costo por clic para "gimnasio" en Colombia varía entre $200 y $800 COP. Con una tasa de conversión del 5-8% y mensualidad promedio de $120.000 COP, el retorno de inversión de Google Ads para gimnasios suele ser positivo a partir del segundo mes.' },
  ],
  'cuanto-cuesta-pagina-web-restaurante-colombia': [
    { q: '¿Cuánto cuesta hacer una página web para un restaurante en Colombia?', a: 'Una página web básica para restaurante (menú, ubicación, contacto) cuesta entre $800.000 y $2.500.000 COP. Una web con pedidos en línea y pagos integrados va de $3.000.000 a $7.000.000 COP. La opción más completa con sistema de reservas, domicilios propios y programa de fidelización puede llegar a $12.000.000-$20.000.000 COP. El hosting y dominio añaden $500.000-$1.200.000 COP anuales.' },
    { q: '¿Qué debe tener la página web de un restaurante para conseguir clientes?', a: 'Los elementos esenciales son: menú digital con fotos de alta calidad, botón de pedido online o reserva, ubicación con mapa de Google integrado, horario actualizado, galería de fotos del ambiente, y testimonios/reseñas de Google. Igualmente importante: debe cargar en menos de 3 segundos en celular, ya que el 85% de las búsquedas de restaurantes en Colombia se hacen desde el móvil.' },
    { q: '¿Es mejor hacer la web de un restaurante en WordPress o con código propio?', a: 'WordPress con un tema de restaurantes es más económico ($800.000-$2.000.000 COP) y el dueño puede actualizarlo sin saber programar. El código propio es mejor para funcionalidades específicas como integración con sistema POS o app de domicilios propios. Para la mayoría de restaurantes en Colombia, WordPress con un plugin de menú y reservas es la solución más práctica.' },
    { q: '¿Cuánto tiempo tarda tener lista la web de un restaurante?', a: 'Una página web básica puede estar lista en 1-2 semanas si el cliente entrega el contenido (fotos, menú, textos) a tiempo. Una web con sistema de pedidos y pagos tarda 3-5 semanas. El cuello de botella más común es la entrega de fotos profesionales del menú, que pueden tardar 2-3 semanas en conseguirse. Planee este tiempo con anticipación.' },
  ],
  'sistema-gestion-talleres-mecanicos-colombia': [
    { q: '¿Qué incluye un sistema de gestión para talleres mecánicos?', a: 'Un sistema completo para taller incluye: agenda de citas con historial del vehículo, órdenes de trabajo digitales, control de inventario de repuestos con alertas de stock mínimo, cotizaciones y facturas electrónicas, seguimiento del estado de los vehículos por parte del cliente, y reportes de rentabilidad por servicio. También puede incluir recordatorios automáticos de mantenimiento por WhatsApp.' },
    { q: '¿Cuánto cuesta un software para taller mecánico en Colombia?', a: 'Los sistemas básicos para talleres pequeños cuestan entre $150.000 y $400.000 COP mensuales. Los sistemas completos con inventario, facturación electrónica y app para clientes van de $500.000 a $1.200.000 COP mensuales. También hay opciones de pago único desde $3.500.000 COP. La inversión se recupera en 3-6 meses por la reducción de errores y el aumento de eficiencia.' },
    { q: '¿Un sistema de gestión puede controlar el inventario de repuestos?', a: 'Sí, es una de las funciones más valiosas. El sistema lleva inventario en tiempo real, descontando repuestos al crear órdenes de trabajo, y enviando alertas cuando el stock baja del mínimo. Esto evita el problema más común en talleres colombianos: comprar repuestos que ya se tienen o no tener lo que se necesita cuando llega el cliente.' },
    { q: '¿Cuánto tiempo tarda implementar un sistema de gestión en un taller?', a: 'La implementación básica (instalación y datos iniciales) tarda 3-5 días hábiles. La capacitación del equipo toma 1-2 semanas hasta que todo funciona con fluidez. El mayor reto es digitalizar el inventario inicial de repuestos si no se tiene registro previo. Los talleres que ya llevan Excel suelen adaptarse en 2-3 semanas.' },
  ],
  'que-es-n8n-automatizacion-colombia': [
    { q: '¿Qué es n8n y para qué sirve en un negocio?', a: 'n8n es una plataforma de automatización de flujos de trabajo que conecta aplicaciones y servicios sin necesidad de programar. Permite automatizar tareas repetitivas como: enviar emails cuando alguien llena un formulario, actualizar hojas de Excel con datos de ventas, publicar en redes sociales automáticamente, o notificar por WhatsApp cuando llega un pedido. Es como un puente entre todas las herramientas de tu negocio.' },
    { q: '¿n8n es gratis o de pago?', a: 'n8n tiene versión de código abierto completamente gratuita que puedes instalar en tu propio servidor (costo de servidor: $50.000-$150.000 COP mensuales en DigitalOcean o Railway). La versión en la nube (n8n.io) tiene plan gratuito con 5.000 ejecuciones mensuales y planes de pago desde $20 USD/mes. Para negocios colombianos, la versión self-hosted es la más popular por el control de datos y costo.' },
    { q: '¿Necesito saber programar para usar n8n?', a: 'No necesariamente. n8n usa una interfaz visual de arrastrar y soltar para crear automatizaciones. Sin embargo, para automatizaciones avanzadas (transformar datos, condiciones complejas, llamadas a APIs) se necesitan conocimientos básicos de JavaScript y JSON. El 80% de los casos de uso de negocios se pueden resolver sin escribir código.' },
    { q: '¿Qué automatizaciones concretas puede hacer n8n para un negocio colombiano?', a: 'Casos reales: 1) Cuando llega un lead en el formulario web, crear contacto en CRM + enviar WhatsApp de bienvenida + notificar al equipo de ventas. 2) Cada vez que se registra una venta en Shopify, actualizar inventario en Excel y enviar factura por email. 3) Publicar automáticamente en Instagram y Facebook cuando se sube un post al blog. 4) Generar informe semanal de ventas y enviarlo por correo cada lunes.' },
  ],
};

function buildFAQSchema(faqs) {
  return {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: faqs.map(({ q, a }) => ({
      '@type': 'Question',
      name: q,
      acceptedAnswer: { '@type': 'Answer', text: a },
    })),
  };
}

function buildFAQHtml(faqs) {
  const items = faqs.map(({ q, a }) => `
    <details class="faq-item">
      <summary class="faq-q">${q}<span class="faq-icon">+</span></summary>
      <p class="faq-a">${a}</p>
    </details>`).join('');

  return `
  <section class="faq-section" id="preguntas-frecuentes">
    <h2 class="faq-title">Preguntas Frecuentes</h2>
    ${items}
  </section>`;
}

const FAQ_CSS = `
    .faq-section { margin: 3rem 0; padding: 2rem; background: #12121C; border-radius: 16px; border: 1px solid rgba(90,0,184,0.2); }
    .faq-title { color: #9B5FFF; font-size: 1.6rem; margin-bottom: 1.5rem; font-family: 'Orbitron', sans-serif; }
    .faq-item { margin-bottom: 0.75rem; background: #0D0D14; border-radius: 10px; border: 1px solid rgba(155,95,255,0.15); overflow: hidden; }
    .faq-item[open] { border-color: rgba(155,95,255,0.4); }
    .faq-q { display: flex; justify-content: space-between; align-items: center; padding: 1rem 1.25rem; color: #E8E8F0; font-weight: 600; cursor: pointer; list-style: none; font-size: 0.97rem; gap: 1rem; }
    .faq-q::-webkit-details-marker { display: none; }
    .faq-icon { color: #9B5FFF; font-size: 1.4rem; flex-shrink: 0; transition: transform 0.2s; }
    .faq-item[open] .faq-icon { transform: rotate(45deg); }
    .faq-a { padding: 0 1.25rem 1rem; color: #8A8D99; line-height: 1.7; font-size: 0.94rem; margin: 0; }`;

function processArticle(slug, faqs) {
  const articlePath = path.join(BLOG_DIR, slug, 'index.html');
  if (!fs.existsSync(articlePath)) {
    console.log(`  SKIP ${slug} (no existe)`);
    return;
  }

  let html = fs.readFileSync(articlePath, 'utf8');

  if (html.includes('"FAQPage"')) {
    console.log(`  SKIP ${slug} (ya tiene FAQ schema)`);
    return;
  }

  // 1. Add FAQ schema JSON-LD before </head>
  const schemaJson = JSON.stringify(buildFAQSchema(faqs), null, 2);
  const schemaTag = `  <script type="application/ld+json">\n  ${schemaJson}\n  </script>\n`;
  html = html.replace('</head>', schemaTag + '</head>');

  // 2. Add FAQ CSS inside existing <style> block
  html = html.replace(/(<style[^>]*>)/, `$1${FAQ_CSS}`);

  // 3. Add visible FAQ section before </main> or before <footer
  const faqHtml = buildFAQHtml(faqs);
  if (html.includes('</main>')) {
    html = html.replace('</main>', faqHtml + '\n  </main>');
  } else if (html.includes('<footer')) {
    html = html.replace('<footer', faqHtml + '\n  <footer');
  } else {
    html = html.replace('</body>', faqHtml + '\n</body>');
  }

  fs.writeFileSync(articlePath, html, 'utf8');
  console.log(`  ✓ ${slug}`);
}

// ─── main ────────────────────────────────────────────────────────────────────

const slugs = Object.keys(FAQS);
console.log(`Procesando ${slugs.length} artículos...\n`);
slugs.forEach(slug => processArticle(slug, FAQS[slug]));
console.log('\nListo. FAQ schema agregado a todos los artículos.');
