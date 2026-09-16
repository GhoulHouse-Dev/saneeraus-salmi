import { labels, validateLead } from '../lib/lead-validation.js';

const LEAD_TO_EMAIL = process.env.LEAD_TO_EMAIL || 'toimisto@saneerauspalvelusalmi.fi';
const LEAD_FROM_EMAIL = process.env.LEAD_FROM_EMAIL || 'Saneerauspalvelu Salmi <leads@ghoulhouse.fi>';

function escapeHtml(value = '') {
  return String(value)
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#039;');
}

function json(res, status, body) {
  res.statusCode = status;
  res.setHeader('Content-Type', 'application/json; charset=utf-8');
  res.setHeader('Cache-Control', 'no-store');
  res.end(JSON.stringify(body));
}

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return json(res, 405, { ok: false, error: 'Method not allowed' });
  }

  const contentType = req.headers['content-type'] || '';
  if (!contentType.includes('application/json')) {
    return json(res, 415, { ok: false, error: 'Unsupported media type' });
  }

  const { ok, data, errors } = validateLead(req.body || {});
  if (!ok) return json(res, 400, { ok: false, errors });

  if (!process.env.RESEND_API_KEY) {
    console.error('Lead form configuration missing: RESEND_API_KEY');
    return json(res, 503, {
      ok: false,
      error: 'Yhteydenottolomake ei ole juuri nyt käytettävissä. Soita numeroon 045 7830 5122.'
    });
  }

  const service = labels.service[data.service] || data.service;
  const property = labels.property[data.property] || 'Ei ilmoitettu';
  const urgency = labels.urgency[data.urgency] || 'Ei ilmoitettu';
  const subject = `Uusi tarjouspyyntö: ${service} — ${data.name}`;

  const html = `
    <div style="font-family:Arial,sans-serif;color:#1E293B;line-height:1.55">
      <h2>Uusi tarjouspyyntö verkkosivulta</h2>
      <p><strong>Palvelu:</strong> ${escapeHtml(service)}</p>
      <p><strong>Nimi:</strong> ${escapeHtml(data.name)}</p>
      <p><strong>Puhelin:</strong> ${escapeHtml(data.phone)}</p>
      <p><strong>Sähköposti:</strong> ${escapeHtml(data.email || 'Ei ilmoitettu')}</p>
      <p><strong>Kohde:</strong> ${escapeHtml(property)}</p>
      <p><strong>Paikkakunta:</strong> ${escapeHtml(data.city || 'Ei ilmoitettu')}</p>
      <p><strong>Aikataulu:</strong> ${escapeHtml(urgency)}</p>
      <p><strong>Kuvaus:</strong><br>${escapeHtml(data.message || 'Ei kuvausta')}</p>
      <hr>
      <p style="font-size:12px;color:#64748B">Lähde: ${escapeHtml(data.source)} · saneeraus-salmi lead landing page</p>
    </div>`;

  const text = [
    'Uusi tarjouspyyntö verkkosivulta',
    `Palvelu: ${service}`,
    `Nimi: ${data.name}`,
    `Puhelin: ${data.phone}`,
    `Sähköposti: ${data.email || 'Ei ilmoitettu'}`,
    `Kohde: ${property}`,
    `Paikkakunta: ${data.city || 'Ei ilmoitettu'}`,
    `Aikataulu: ${urgency}`,
    `Kuvaus: ${data.message || 'Ei kuvausta'}`,
    `Lähde: ${data.source}`
  ].join('\n');

  try {
    const response = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${process.env.RESEND_API_KEY}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        from: LEAD_FROM_EMAIL,
        to: [LEAD_TO_EMAIL],
        subject,
        html,
        text,
        reply_to: data.email || undefined
      })
    });

    if (!response.ok) {
      const detail = await response.text();
      console.error('Resend error', response.status, detail);
      return json(res, 502, {
        ok: false,
        error: 'Tarjouspyynnön lähetys epäonnistui. Soita numeroon 045 7830 5122.'
      });
    }

    return json(res, 200, { ok: true });
  } catch (error) {
    console.error('Lead submission error', error);
    return json(res, 500, {
      ok: false,
      error: 'Tarjouspyynnön lähetys epäonnistui. Soita numeroon 045 7830 5122.'
    });
  }
}
