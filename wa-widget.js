/* WhatsApp Widget con filtro de preguntas — AI Company CO */
(function () {
  const WA_NUMBER = '573212674754';

  const SERVICES = [
    { value: 'automatización de procesos empresariales', label: '⚙️ Automatizar procesos' },
    { value: 'WhatsApp Business automatizado', label: '💬 WhatsApp Automático' },
    { value: 'marketing digital y pauta', label: '📈 Marketing Digital / Pauta' },
    { value: 'chatbot con IA', label: '🤖 Chatbot con IA' },
    { value: 'diseño de página web o app', label: '🌐 Página Web / App' },
    { value: 'asistente de IA personalizado', label: '✨ Asistente de IA' },
    { value: 'otra consulta', label: '❓ Otra consulta' },
  ];

  const SIZES = [
    { value: 'una empresa pequeña (1-10 personas)', label: 'Pequeña (1-10 personas)' },
    { value: 'una empresa mediana (11-50 personas)', label: 'Mediana (11-50 personas)' },
    { value: 'una empresa grande (+50 personas)', label: 'Grande (+50 personas)' },
  ];

  const CSS = `
    #wa-fab {
      position: fixed; bottom: 28px; right: 28px; z-index: 9000;
      width: 58px; height: 58px; border-radius: 50%;
      background: #25D366; box-shadow: 0 4px 20px rgba(37,211,102,0.5);
      display: flex; align-items: center; justify-content: center;
      cursor: pointer; transition: transform 0.25s, box-shadow 0.25s;
      border: none; outline: none;
    }
    #wa-fab:hover { transform: scale(1.1); box-shadow: 0 6px 28px rgba(37,211,102,0.65); }
    #wa-fab svg { width: 32px; height: 32px; }
    #wa-pulse {
      position: absolute; top: -4px; right: -4px;
      width: 14px; height: 14px; border-radius: 50%;
      background: #ff4444;
      animation: waPulse 2s ease-in-out infinite;
    }
    @keyframes waPulse { 0%,100%{transform:scale(1);opacity:1} 50%{transform:scale(1.4);opacity:0.7} }
    #wa-popup {
      position: fixed; bottom: 100px; right: 28px; z-index: 9001;
      width: 320px; background: #0D0D14;
      border: 1px solid rgba(90,0,184,0.35);
      border-radius: 16px; overflow: hidden;
      box-shadow: 0 20px 60px rgba(0,0,0,0.6);
      transform: translateY(20px) scale(0.95);
      opacity: 0; pointer-events: none;
      transition: all 0.3s cubic-bezier(0.34,1.56,0.64,1);
      font-family: 'DM Sans', sans-serif;
    }
    #wa-popup.open { transform: translateY(0) scale(1); opacity: 1; pointer-events: all; }
    .wa-header {
      background: linear-gradient(135deg, #5A00B8, #25D366);
      padding: 1rem 1.2rem; display: flex; align-items: center; gap: 10px;
    }
    .wa-avatar {
      width: 40px; height: 40px; border-radius: 50%;
      background: rgba(255,255,255,0.2);
      display: flex; align-items: center; justify-content: center;
      font-size: 1.2rem; flex-shrink: 0;
    }
    .wa-header-text { flex: 1; }
    .wa-header-name { font-size: 0.88rem; font-weight: 600; color: #fff; }
    .wa-header-status { font-size: 0.72rem; color: rgba(255,255,255,0.75); }
    .wa-status-dot { display:inline-block; width:6px; height:6px; background:#4dff91; border-radius:50%; margin-right:4px; }
    .wa-close {
      background: none; border: none; color: rgba(255,255,255,0.7);
      cursor: pointer; font-size: 1.2rem; padding: 4px; line-height: 1;
      transition: color 0.2s;
    }
    .wa-close:hover { color: #fff; }
    .wa-body { padding: 1.2rem; }
    .wa-bubble {
      background: #1c1c28; border-radius: 12px 12px 12px 2px;
      padding: 0.75rem 1rem; margin-bottom: 1rem;
      font-size: 0.85rem; color: #e8e9f0; line-height: 1.55;
    }
    .wa-label {
      font-size: 0.72rem; color: #9B5FFF; font-weight: 600;
      letter-spacing: 0.1em; text-transform: uppercase; margin-bottom: 0.5rem;
    }
    .wa-options { display: flex; flex-direction: column; gap: 6px; margin-bottom: 1rem; }
    .wa-option {
      background: #16161f; border: 1px solid rgba(255,255,255,0.08);
      border-radius: 8px; padding: 0.6rem 0.9rem;
      font-size: 0.82rem; color: #b0b3bf; cursor: pointer;
      transition: all 0.2s; text-align: left;
    }
    .wa-option:hover, .wa-option.selected {
      border-color: rgba(90,0,184,0.6); color: #fff;
      background: rgba(90,0,184,0.15);
    }
    .wa-step { display: none; }
    .wa-step.active { display: block; }
    .wa-btn-wa {
      width: 100%; background: #25D366; color: #fff;
      border: none; border-radius: 8px; padding: 0.85rem;
      font-family: 'DM Sans', sans-serif; font-size: 0.88rem; font-weight: 600;
      cursor: pointer; display: flex; align-items: center; justify-content: center;
      gap: 8px; transition: all 0.25s; letter-spacing: 0.03em;
    }
    .wa-btn-wa:hover { background: #1ebe5d; transform: translateY(-1px); }
    .wa-btn-wa:disabled { background: #333; cursor: not-allowed; transform: none; }
    .wa-footer { padding: 0 1.2rem 1rem; }
    @media (max-width: 400px) {
      #wa-popup { width: calc(100vw - 20px); right: 10px; }
      #wa-fab { bottom: 16px; right: 16px; }
    }
  `;

  function buildHTML() {
    const serviceOpts = SERVICES.map(s =>
      `<button class="wa-option" data-step="1" data-val="${s.value}">${s.label}</button>`
    ).join('');
    const sizeOpts = SIZES.map(s =>
      `<button class="wa-option" data-step="2" data-val="${s.value}">${s.label}</button>`
    ).join('');

    return `
      <button id="wa-fab" aria-label="Escríbenos por WhatsApp">
        <svg viewBox="0 0 24 24" fill="white" xmlns="http://www.w3.org/2000/svg">
          <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
        </svg>
        <span id="wa-pulse"></span>
      </button>

      <div id="wa-popup">
        <div class="wa-header">
          <div class="wa-avatar">🤖</div>
          <div class="wa-header-text">
            <div class="wa-header-name">AI Company CO</div>
            <div class="wa-header-status"><span class="wa-status-dot"></span>En línea ahora</div>
          </div>
          <button class="wa-close" id="wa-close-btn">✕</button>
        </div>
        <div class="wa-body">
          <div class="wa-bubble">¡Hola! 👋 Cuéntanos qué necesitas y te conectamos con el experto indicado.</div>

          <div class="wa-step active" id="wa-step-1">
            <div class="wa-label">¿Qué te interesa?</div>
            <div class="wa-options">${serviceOpts}</div>
          </div>

          <div class="wa-step" id="wa-step-2">
            <div class="wa-label">¿Cómo es tu empresa?</div>
            <div class="wa-options">${sizeOpts}</div>
          </div>

          <div class="wa-step" id="wa-step-3">
            <div class="wa-bubble" id="wa-confirm-msg" style="background:rgba(37,211,102,0.1);border:1px solid rgba(37,211,102,0.3);">
              ✅ Perfecto. Te conectamos ahora por WhatsApp.
            </div>
          </div>
        </div>
        <div class="wa-footer">
          <button class="wa-btn-wa" id="wa-send-btn" disabled>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="white"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/></svg>
            Selecciona una opción
          </button>
        </div>
      </div>
    `;
  }

  function init() {
    const style = document.createElement('style');
    style.textContent = CSS;
    document.head.appendChild(style);

    const wrap = document.createElement('div');
    wrap.innerHTML = buildHTML();
    document.body.appendChild(wrap);

    let selectedService = '';
    let selectedSize = '';
    let currentStep = 1;

    const popup = document.getElementById('wa-popup');
    const fab = document.getElementById('wa-fab');
    const closeBtn = document.getElementById('wa-close-btn');
    const sendBtn = document.getElementById('wa-send-btn');

    fab.addEventListener('click', () => popup.classList.toggle('open'));
    closeBtn.addEventListener('click', () => popup.classList.remove('open'));

    document.addEventListener('click', function(e) {
      const opt = e.target.closest('.wa-option');
      if (!opt) return;
      const step = parseInt(opt.dataset.step);
      const val = opt.dataset.val;

      opt.closest('.wa-options').querySelectorAll('.wa-option').forEach(o => o.classList.remove('selected'));
      opt.classList.add('selected');

      if (step === 1) {
        selectedService = val;
        setTimeout(() => {
          document.getElementById('wa-step-1').classList.remove('active');
          document.getElementById('wa-step-2').classList.add('active');
          currentStep = 2;
        }, 300);
      } else if (step === 2) {
        selectedSize = val;
        const msg = document.getElementById('wa-confirm-msg');
        msg.textContent = `✅ Listo. Te conectamos con nuestro experto en ${selectedService}.`;
        setTimeout(() => {
          document.getElementById('wa-step-2').classList.remove('active');
          document.getElementById('wa-step-3').classList.add('active');
          sendBtn.disabled = false;
          sendBtn.textContent = '💬 Abrir WhatsApp ahora';
          currentStep = 3;
        }, 300);
      }
    });

    sendBtn.addEventListener('click', () => {
      if (!selectedService) return;
      const text = encodeURIComponent(
        `Hola AI Company CO! 👋\n\nMe interesa: *${selectedService}*\nEmpresa: ${selectedSize || 'no especificado'}\n\n¿Me pueden dar más información?`
      );
      window.open(`https://wa.me/${WA_NUMBER}?text=${text}`, '_blank');
    });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
