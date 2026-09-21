export const READY_MESSAGE = (remissionId: string) => [
  'Hola. Tu equipo ya está listo para recoger.',
  `Remisión: ${remissionId || '-'}.`,
  'Por favor, pasa a retirarlo.',
].join('\n');

export const REMINDER_MESSAGE = (record: {
  remissionId: string;
  daysReady: number;
  equipo: string;
  marca?: string | null;
  serial?: string | null;
}) => [
  'Hola. Te recordamos que tu equipo sigue pendiente de recogida.',
  `El equipo lleva ${record.daysReady} días listo para entrega.`,
  'Por favor, pasa a retirarlo, ya que pronto será enviado a la bodega central.',
  `Remisión: ${record.remissionId || '-'}.`,
  `Equipo: ${record.equipo}.`,
  record.marca ? `Marca: ${record.marca}.` : '',
  record.serial ? `Serial: ${record.serial}.` : '',
].filter(Boolean).join('\n');

export function normalizePhone(phone?: string | null) {
  if (!phone) return '';
  const digits = phone.replace(/\D/g, '');
  if (!digits) return '';
  return digits.length === 10 ? `57${digits}` : digits;
}

export function buildWhatsAppWebUrl(message: string, phone?: string | null) {
  const normalizedPhone = normalizePhone(phone);
  const encodedMessage = encodeURIComponent(message);
  const mobile = /Android|iPhone|iPad|iPod/i.test(navigator.userAgent);
  if (mobile) return `https://wa.me/${normalizedPhone}?text=${encodedMessage}`;
  return normalizedPhone
    ? `https://web.whatsapp.com/send?phone=${normalizedPhone}&text=${encodedMessage}`
    : `https://web.whatsapp.com/send?text=${encodedMessage}`;
}

export function prepareWhatsAppWindow() {
  const target = window.open('about:blank', '_blank');
  if (target) target.opener = null;
  return target;
}

export function navigateWhatsAppWindow(
  target: Window | null,
  message: string,
  phone?: string | null,
) {
  const destination = target && !target.closed ? target : prepareWhatsAppWindow();
  if (!destination) throw new Error('Permite las ventanas emergentes para abrir WhatsApp. No se registró ningún envío.');
  destination.location.href = buildWhatsAppWebUrl(message, phone);
}
