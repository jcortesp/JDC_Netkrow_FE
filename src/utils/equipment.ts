export interface EquipmentState {
  dadoBaja?: boolean;
  readyAt?: string | null;
  brazalete?: string;
  pilas?: string;
  revision?: string;
  mantenimiento?: string;
  limpieza?: string;
  calibracion?: string;
}
export interface RemissionState { fechaSalida?: string | null; metodoSaldo?: string | null }

export function equipmentStatus(record: EquipmentState, remission?: RemissionState | null) {
  if (record.dadoBaja || (remission?.fechaSalida && remission.metodoSaldo === 'Baja')) return 'BAJA';
  if (remission?.fechaSalida) return 'ENTREGADO';
  return record.readyAt ? 'LISTO' : 'EN_SERVICIO';
}

const normalizedState = (value?: string) => String(value || '').trim().toUpperCase();

export function readyValidationIssues(record: EquipmentState) {
  const issues: string[] = [];
  if (!['OK', 'CAMBIO', 'NA', 'N/A'].includes(normalizedState(record.pilas))) issues.push('Pilas debe estar en OK, Cambio o N/A');
  if (normalizedState(record.revision) !== 'OK') issues.push('Revisión debe estar en OK');
  if (normalizedState(record.mantenimiento) !== 'OK') issues.push('Mantenimiento debe estar en OK');
  if (normalizedState(record.limpieza) !== 'OK') issues.push('Limpieza debe estar en OK');
  if (normalizedState(record.calibracion) !== 'OK') issues.push('Calibración debe estar en OK');
  return issues;
}

export function canMarkReady(record: EquipmentState, remission?: RemissionState | null, dirty = false) {
  return !dirty && equipmentStatus(record, remission) === 'EN_SERVICIO'
    && readyValidationIssues(record).length === 0;
}
export function formatUtcDate(value?: string | null) {
  if (!value) return '-';
  return new Intl.DateTimeFormat('es-CO', { dateStyle: 'medium', timeStyle: 'short' })
    .format(new Date(/[zZ]|[+-]\d{2}:\d{2}$/.test(value) ? value : value + 'Z'));
}
export const equipmentStatusLabel = { EN_SERVICIO: 'En servicio', LISTO: 'Listo para entrega', ENTREGADO: 'Entregado', BAJA: 'Dado de baja' };
