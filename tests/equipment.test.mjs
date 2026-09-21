import { test } from 'node:test';
import assert from 'node:assert/strict';
import { equipmentStatus, canMarkReady, readyValidationIssues } from '../src/utils/equipment.ts';
const complete={ brazalete: 'OK', pilas: 'N/A', revision: ' Ok ', mantenimiento: 'OK', limpieza: 'ok', calibracion: 'Ok' };
test('complete diagnosis remains in service until explicitly marked ready', () => {
  assert.equal(equipmentStatus(complete), 'EN_SERVICIO');
  assert.equal(canMarkReady(complete), true);
});
test('unsaved or incomplete diagnosis cannot be marked ready', () => {
  assert.equal(canMarkReady(complete, null, true), false);
  assert.equal(canMarkReady({...complete, revision: 'Pendiente'}), false);
});
test('bracelet must be OK and batteries accept OK, NA or N/A', () => {
  assert.equal(canMarkReady({...complete, brazalete: 'N/A'}), false);
  assert.equal(canMarkReady({...complete, pilas: 'OK'}), true);
  assert.equal(canMarkReady({...complete, pilas: 'NA'}), true);
  assert.equal(canMarkReady({...complete, pilas: 'N/A'}), true);
  assert.deepEqual(readyValidationIssues({...complete, pilas: 'Pendiente'}), ['Pilas debe estar en OK o N/A']);
});
test('ready equipment stays locked even when every diagnosis is OK', () => {
  const ready={...complete,readyAt:'2026-09-19T12:00:00'};
  assert.equal(equipmentStatus(ready), 'LISTO');
  assert.equal(canMarkReady(ready), false);
});
test('delivery of the remission overrides every equipment readiness', () => {
  const remission={fechaSalida:'2026-09-19T13:00:00'};
  assert.equal(equipmentStatus(complete,remission),'ENTREGADO');
  assert.equal(equipmentStatus({...complete,readyAt:'2026-09-19T12:00:00'},remission),'ENTREGADO');
  assert.equal(canMarkReady(complete,remission),false);
});
test('drop is terminal and takes precedence over delivery', () => {
  assert.equal(equipmentStatus({dadoBaja:true},{fechaSalida:'2026-09-19T13:00:00'}),'BAJA');
  assert.equal(equipmentStatus(complete,{fechaSalida:'2026-09-19T13:00:00',metodoSaldo:'Baja'}),'BAJA');
  assert.equal(canMarkReady({...complete,dadoBaja:true}),false);
});
