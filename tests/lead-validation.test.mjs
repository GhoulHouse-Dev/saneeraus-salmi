import test from 'node:test';
import assert from 'node:assert/strict';
import { validateLead } from '../lib/lead-validation.js';

test('accepts a valid quick-form lead', () => {
  const result = validateLead({
    source: 'hero',
    name: 'Matti Meikäläinen',
    phone: '+358 40 123 4567',
    service: 'aha-kartoitus'
  });
  assert.equal(result.ok, true);
});

test('main form requires consent', () => {
  const result = validateLead({
    source: 'main',
    name: 'Matti Meikäläinen',
    phone: '0401234567',
    service: 'vesivahinko',
    property: 'omakotitalo',
    urgency: 'pian'
  });
  assert.equal(result.ok, false);
  assert.ok(result.errors.consent);
});

test('rejects invalid service and phone', () => {
  const result = validateLead({
    source: 'hero',
    name: 'Matti',
    phone: '123',
    service: 'fake-service'
  });
  assert.equal(result.ok, false);
  assert.ok(result.errors.phone);
  assert.ok(result.errors.service);
});

test('honeypot rejects likely spam', () => {
  const result = validateLead({
    source: 'hero',
    name: 'Bot Bot',
    phone: '0401234567',
    service: 'saneeraus',
    company: 'spam inc'
  });
  assert.equal(result.ok, false);
  assert.ok(result.errors.spam);
});
