const config = window.SALMI_SITE_CONFIG || {};

function loadAnalytics() {
  if (config.ga4Id) {
    window.dataLayer = window.dataLayer || [];
    window.gtag = function gtag(){ dataLayer.push(arguments); };
    gtag('js', new Date());
    gtag('config', config.ga4Id, { anonymize_ip: true });
    const script = document.createElement('script');
    script.async = true;
    script.src = `https://www.googletagmanager.com/gtag/js?id=${encodeURIComponent(config.ga4Id)}`;
    document.head.appendChild(script);
  }

  if (config.metaPixelId) {
    !function(f,b,e,v,n,t,s){if(f.fbq)return;n=f.fbq=function(){n.callMethod?
    n.callMethod.apply(n,arguments):n.queue.push(arguments)};if(!f._fbq)f._fbq=n;
    n.push=n;n.loaded=!0;n.version='2.0';n.queue=[];t=b.createElement(e);t.async=!0;
    t.src=v;s=b.getElementsByTagName(e)[0];s.parentNode.insertBefore(t,s)}(window, document,'script','https://connect.facebook.net/en_US/fbevents.js');
    fbq('init', config.metaPixelId);
    fbq('track', 'PageView');
  }
}

function track(name, params = {}) {
  window.dataLayer = window.dataLayer || [];
  window.dataLayer.push({ event: name, ...params });
  if (window.gtag) gtag('event', name, params);
}

function trackMeta(event, params = {}) {
  if (window.fbq) fbq('track', event, params);
}

loadAnalytics();

const serviceLabels = {
  'aha-kartoitus': 'Asbesti- tai haitta-ainekartoitus',
  asbestipurku: 'Asbestipurku',
  rakennevaurio: 'Valesokkeli / rakennevaurio',
  vesivahinko: 'Kosteus- tai vesivahinko',
  saneeraus: 'Purku- tai saneeraustyö',
  'en-osaa-sanoa': 'En osaa sanoa'
};

function setStatus(element, message, type = '') {
  element.textContent = message;
  element.className = `form-status ${type}`.trim();
}

async function postLead(payload) {
  const response = await fetch('/api/lead', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload)
  });
  const body = await response.json().catch(() => ({}));
  if (!response.ok) throw new Error(body.error || 'Lähetys epäonnistui.');
  return body;
}

function serialize(form) {
  const data = Object.fromEntries(new FormData(form).entries());
  data.consent = form.querySelector('[name="consent"]')?.checked || false;
  return data;
}

function bindLeadForm(form) {
  const status = form.querySelector('.form-status');
  const submit = form.querySelector('button[type="submit"]');
  let started = false;

  form.addEventListener('input', () => {
    if (!started) {
      started = true;
      track('lead_form_start', { form: form.dataset.form || 'unknown' });
    }
  }, { once: true });

  form.addEventListener('submit', async (event) => {
    event.preventDefault();
    if (!form.reportValidity()) return;

    const payload = serialize(form);
    submit.disabled = true;
    submit.dataset.original = submit.textContent;
    submit.textContent = 'Lähetetään…';
    setStatus(status, '');

    try {
      await postLead(payload);
      track('lead_submit', { service: payload.service, form: payload.source });
      trackMeta('Lead', { content_name: serviceLabels[payload.service] || payload.service });
      form.reset();
      setStatus(status, 'Kiitos — tarjouspyyntö vastaanotettu. Otamme yhteyttä mahdollisimman pian.', 'success');
      status.focus?.();
    } catch (error) {
      setStatus(status, `${error.message} Voit myös soittaa: 045 7830 5122.`, 'error');
    } finally {
      submit.disabled = false;
      submit.textContent = submit.dataset.original || 'Lähetä';
    }
  });
}

document.querySelectorAll('form[data-lead-form]').forEach(bindLeadForm);

document.querySelectorAll('a[href^="tel:"]').forEach((link) => {
  link.addEventListener('click', () => {
    track('contact_phone_click');
    trackMeta('Contact');
  });
});

const wizard = document.querySelector('[data-wizard]');
if (wizard) {
  const steps = [...wizard.querySelectorAll('.wizard-step')];
  const progress = wizard.querySelector('.progress-bar > span');
  let current = 0;

  function showStep(index) {
    current = Math.max(0, Math.min(index, steps.length - 1));
    steps.forEach((step, i) => {
      step.hidden = i !== current;
      step.setAttribute('aria-hidden', String(i !== current));
    });
    progress.style.width = `${((current + 1) / steps.length) * 100}%`;
    wizard.querySelector('.step-count').textContent = `Vaihe ${current + 1} / ${steps.length}`;
    steps[current].querySelector('input, select, textarea, button')?.focus({ preventScroll: true });
    track('lead_form_step', { step: current + 1 });
  }

  wizard.addEventListener('click', (event) => {
    const next = event.target.closest('[data-next]');
    const back = event.target.closest('[data-back]');
    if (back) return showStep(current - 1);
    if (!next) return;

    const required = [...steps[current].querySelectorAll('[required]')];
    const valid = required.every((field) => field.reportValidity());
    if (valid) showStep(current + 1);
  });

  showStep(0);
}

document.querySelectorAll('a[href^="#"]').forEach((link) => {
  link.addEventListener('click', (event) => {
    const id = link.getAttribute('href');
    if (id === '#') return;
    const target = document.querySelector(id);
    if (!target) return;
    event.preventDefault();
    target.scrollIntoView({ behavior: 'smooth', block: 'start' });
    history.replaceState(null, '', id);
  });
});
