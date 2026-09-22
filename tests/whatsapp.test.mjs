import { test } from 'node:test';
import assert from 'node:assert/strict';
import { normalizePhone, buildWhatsAppWebUrl, navigateWhatsAppWindow, SERVICE_MESSAGE, REMINDER_MESSAGE } from '../src/utils/whatsapp.ts';

test('normalizes Colombian phones and preserves international prefixes', () => {
  assert.equal(normalizePhone('300 123 4567'), '573001234567');
  assert.equal(normalizePhone('+57 (300) 123-4567'), '573001234567');
  assert.equal(normalizePhone('+1 212 555 1234'), '12125551234');
  assert.equal(normalizePhone(null), '');
});
test('encodes accents and real line breaks in desktop messages', () => {
  Object.defineProperty(globalThis, 'navigator', { value: { userAgent: 'Desktop' }, configurable: true });
  const message = SERVICE_MESSAGE({ equipo: 'Tensiómetro' }, 'R-1', true);
  const url = new URL(buildWhatsAppWebUrl(message, '3001234567'));
  assert.equal(url.hostname, 'web.whatsapp.com');
  assert.equal(url.searchParams.get('text'), message);
  assert.ok(message.includes('\nRemisión: R-1'));
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
  const message = REMINDER_MESSAGE({ remissionId: 'R-2', daysReady: 16, equipo: 'Tensiómetro', serial: 'ABC-1' });
  assert.match(message, /16 días/);
  assert.match(message, /Remisión: R-2/);
  assert.match(message, /Tensiómetro/);
  assert.match(message, /Serial: ABC-1/);
  assert.match(message, /domicilio con un costo adicional/);
  assert.doesNotMatch(message, /desde el último aviso/);
});
test('ready service message clearly says the equipment can be collected', () => {
  const message = SERVICE_MESSAGE({ equipo: 'Tensiómetro', marca: 'Omron', serial: 'ABC-1', brazalete: 'OK', pilas: 'OK', revision: 'OK' }, 'R-2', true);
  assert.match(message, /equipo está listo para recoger/);
  assert.match(message, /Estos son los datos del servicio/);
  assert.match(message, /Remisión: R-2/);
  assert.match(message, /Equipo: Tensiómetro/);
  assert.match(message, /Puedes pasar a recogerlo/);
});
test('bracelet leak message requests authorization and states the replacement price', () => {
  const message = SERVICE_MESSAGE({ equipo: 'Tensiómetro', brazalete: 'Fuga', pilas: 'OK' }, 'R-4', true);
  assert.match(message, /presenta una fuga/);
  assert.match(message, /no se puede parchar ni reparar/);
  assert.match(message, /\$50\.000/);
  assert.match(message, /autorización/);
  assert.doesNotMatch(message, /presenta desgaste/);
});
test('bracelet wear message is differentiated from a leak', () => {
  const message = SERVICE_MESSAGE({ equipo: 'Tensiómetro', brazalete: 'Desgaste', pilas: 'OK' }, 'R-5', true);
  assert.match(message, /presenta desgaste/);
  assert.doesNotMatch(message, /presenta una fuga/);
});
test('battery change message says the equipment is ready and batteries must be changed', () => {
  const message = SERVICE_MESSAGE({ equipo: 'Tensiómetro', brazalete: 'OK', pilas: 'Cambio' }, 'R-6', true);
  assert.match(message, /equipo está listo para recoger/);
  assert.match(message, /requiere cambio de pilas/);
  assert.doesNotMatch(message, /\$50\.000/);
});
test('mixed message includes both bracelet replacement and battery change', () => {
  const message = SERVICE_MESSAGE({ equipo: 'Tensiómetro', brazalete: 'Fuga', pilas: 'Cambio' }, 'R-7', true);
  assert.match(message, /presenta una fuga/);
  assert.match(message, /\$50\.000/);
  assert.match(message, /requiere cambio de pilas/);
});
test('in-service updates do not claim the equipment is ready', () => {
  const message = SERVICE_MESSAGE({ equipo: 'Tensiómetro' }, 'R-3', false);
  assert.match(message, /Estado actual: En servicio/);
  assert.doesNotMatch(message, /está listo para recoger/);
});
