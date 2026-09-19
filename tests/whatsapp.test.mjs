import { test } from 'node:test';
import assert from 'node:assert/strict';
import { normalizePhone, buildWhatsAppWebUrl, navigateWhatsAppWindow, READY_MESSAGE, REMINDER_MESSAGE } from '../src/utils/whatsapp.ts';

test('normalizes Colombian phones and preserves international prefixes', () => {
  assert.equal(normalizePhone('300 123 4567'), '573001234567');
  assert.equal(normalizePhone('+57 (300) 123-4567'), '573001234567');
  assert.equal(normalizePhone('+1 212 555 1234'), '12125551234');
  assert.equal(normalizePhone(null), '');
});
test('encodes accents and real line breaks in desktop messages', () => {
  Object.defineProperty(globalThis, 'navigator', { value: { userAgent: 'Desktop' }, configurable: true });
  const message = READY_MESSAGE('R-1');
  const url = new URL(buildWhatsAppWebUrl(message, '3001234567'));
  assert.equal(url.hostname, 'web.whatsapp.com');
  assert.equal(url.searchParams.get('text'), message);
  assert.ok(message.includes('\nRemisión: R-1.'));
});
test('preserves mobile WhatsApp support', () => {
  Object.defineProperty(globalThis, 'navigator', { value: { userAgent: 'iPhone' }, configurable: true });
  assert.equal(new URL(buildWhatsAppWebUrl('Hola', '3001234567')).hostname, 'wa.me');
});
test('blocked popup raises an error instead of reporting success', () => {
  globalThis.window = { open: () => null };
  assert.throws(() => navigateWhatsAppWindow(null, 'Hola'), /ventanas emergentes/);
});
test('opens one navigable window and removes its opener', () => {
  const target = { opener: {}, location: { href: '' }, closed: false };
  let calls = 0;
  globalThis.window = { open: () => { calls++; return target; } };
  navigateWhatsAppWindow(null, 'Hola', '3001234567');
  assert.equal(calls, 1);
  assert.equal(target.opener, null);
  assert.equal(new URL(target.location.href).searchParams.get('text'), 'Hola');
});
test('reminder includes remission, elapsed days and equipment', () => {
  const message = REMINDER_MESSAGE({ remissionId: 'R-2', daysSinceLastNotification: 16, equipment: ['Tensiómetro'] });
  assert.match(message, /16 días/);
  assert.match(message, /Remisión: R-2/);
  assert.match(message, /Tensiómetro/);
});
