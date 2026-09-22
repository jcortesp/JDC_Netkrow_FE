interface ServiceMessageRecord {
  equipo?: string | null;
  marca?: string | null;
  serial?: string | null;
  brazalete?: string | null;
  pilas?: string | null;
  revision?: string | null;
  mantenimiento?: string | null;
  limpieza?: string | null;
  calibracion?: string | null;
  notasDiagnostico?: string | null;
}

const normalizedState = (value?: string | null) => String(value || '').trim().toUpperCase();

const serviceDetails = (record: ServiceMessageRecord, remissionId: string) => [
  'Estos son los datos del servicio:',
  `Remisión: ${remissionId || '-'}`,
  `Equipo: ${record.equipo || '-'}`,
  `Marca: ${record.marca || '-'}`,
  `Serial: ${record.serial || '-'}`,
  `Brazalete: ${record.brazalete || '-'}`,
  `Pilas: ${record.pilas || '-'}`,
  `Revisión: ${record.revision || '-'}`,
  `Mantenimiento: ${record.mantenimiento || '-'}`,
  `Limpieza: ${record.limpieza || '-'}`,
  `Calibración: ${record.calibracion || '-'}`,
  `Notas: ${record.notasDiagnostico || '-'}`,
];

export const SERVICE_MESSAGE = (record: ServiceMessageRecord, remissionId: string, ready: boolean) => {
  const braceletState = normalizedState(record.brazalete);
  const hasBraceletIssue = braceletState === 'FUGA' || braceletState === 'DESGASTE';
  const needsBatteryChange = normalizedState(record.pilas) === 'CAMBIO';

  if (hasBraceletIssue) {
    const issue = braceletState === 'FUGA' ? 'una fuga' : 'desgaste';
    return [
      'Hola, te compartimos una actualización del servicio técnico de tu equipo.',
      `El brazalete actual presenta ${issue} que impide repararlo de forma segura. Por tu seguridad médica, este componente no se puede parchar ni reparar.`,
      'El brazalete nuevo tiene un costo adicional de $50.000.',
      ...(needsBatteryChange ? ['Además, el equipo requiere cambio de pilas.'] : []),
      'Quedamos atentos a tu autorización para proceder con el cambio del brazalete.',
      '',
      ...serviceDetails(record, remissionId),
    ].join('\n');
  }

  if (needsBatteryChange) {
    return [
      'Hola, te informamos que tu equipo está listo para recoger.',
      'Ten en cuenta que el equipo requiere cambio de pilas.',
      '',
      ...serviceDetails(record, remissionId),
      'Puedes pasar a recogerlo. Gracias.',
    ].join('\n');
  }

  return [
    ready
      ? 'Hola, te informamos que tu equipo está listo para recoger.'
      : 'Hola, te compartimos una actualización del servicio técnico de tu equipo.',
    ready ? '' : 'Estado actual: En servicio.',
    ...serviceDetails(record, remissionId),
    ready ? 'Puedes pasar a recogerlo. Gracias.' : '',
  ].filter(Boolean).join('\n');
};

export const REMINDER_MESSAGE = (record: {
  remissionId: string;
  daysReady: number;
  equipo: string;
  marca?: string | null;
  serial?: string | null;
}) => [
  'Hola, te recordamos que tu equipo está listo para recoger y continúa pendiente de entrega.',
  `Han transcurrido ${record.daysReady} días desde que quedó listo.`,
  'Por favor, pasa a recogerlo, ya que pronto será enviado a la bodega central.',
  'Si prefieres, podemos hacer el domicilio con un costo adicional. Confírmanos si te interesa.',
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
