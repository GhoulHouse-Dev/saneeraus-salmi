const SERVICE_VALUES = new Set([
  'aha-kartoitus',
  'asbestipurku',
  'rakennevaurio',
  'vesivahinko',
  'saneeraus',
  'en-osaa-sanoa'
]);

const PROPERTY_VALUES = new Set([
  'omakotitalo',
  'rivi-paritalo',
  'kerrostalo-asunto',
  'taloyhtio',
  'liiketila',
  'muu'
]);

const URGENCY_VALUES = new Set(['heti', 'pian', '1-4-vko', 'myohemmin']);

function normalize(value, maxLength = 300) {
  return String(value ?? '').trim().replace(/\s+/g, ' ').slice(0, maxLength);
}

function validPhone(phone) {
  const compact = phone.replace(/[\s().-]/g, '');
  return /^\+?[0-9]{7,15}$/.test(compact);
}

function validEmail(email) {
  return email === '' || /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

export function validateLead(input = {}) {
  const data = {
    source: normalize(input.source, 40) || 'main',
    name: normalize(input.name, 100),
    phone: normalize(input.phone, 40),
    email: normalize(input.email, 160),
    service: normalize(input.service, 50),
    property: normalize(input.property, 50),
    urgency: normalize(input.urgency, 30),
    city: normalize(input.city, 100),
    message: normalize(input.message, 1500),
    consent: input.consent === true || input.consent === 'true' || input.consent === 'on',
    company: normalize(input.company, 120)
  };

  const errors = {};
  if (data.company) errors.spam = 'Invalid submission.';
  if (data.name.length < 2) errors.name = 'Kirjoita nimi.';
  if (!validPhone(data.phone)) errors.phone = 'Tarkista puhelinnumero.';
  if (!SERVICE_VALUES.has(data.service)) errors.service = 'Valitse palvelu.';
  if (!validEmail(data.email)) errors.email = 'Tarkista sähköpostiosoite.';
  if (data.property && !PROPERTY_VALUES.has(data.property)) errors.property = 'Valitse kohde.';
  if (data.urgency && !URGENCY_VALUES.has(data.urgency)) errors.urgency = 'Valitse aikataulu.';
  if (data.source === 'main' && !data.consent) errors.consent = 'Hyväksy yhteydenotto tarjouspyynnön käsittelyä varten.';

  return { ok: Object.keys(errors).length === 0, data, errors };
}

export const labels = {
  service: {
    'aha-kartoitus': 'Asbesti- tai haitta-ainekartoitus',
    asbestipurku: 'Asbestipurku',
    rakennevaurio: 'Valesokkeli / rakennevaurio',
    vesivahinko: 'Kosteus- tai vesivahinko',
    saneeraus: 'Purku- tai saneeraustyö',
    'en-osaa-sanoa': 'En osaa sanoa'
  },
  property: {
    omakotitalo: 'Omakotitalo',
    'rivi-paritalo': 'Rivitalo / paritalo',
    'kerrostalo-asunto': 'Kerrostalo / asunto',
    taloyhtio: 'Taloyhtiö',
    liiketila: 'Liiketila / yrityskiinteistö',
    muu: 'Muu'
  },
  urgency: {
    heti: 'Heti / kiireellinen',
    pian: 'Mahdollisimman pian',
    '1-4-vko': '1–4 viikon sisällä',
    myohemmin: 'Myöhemmin / suunnitteluvaiheessa'
  }
};
