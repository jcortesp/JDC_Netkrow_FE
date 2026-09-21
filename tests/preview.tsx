// Local UI fixture. All API calls use simulated data; no real records or messages.
import React from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { Alert, CssBaseline } from '@mui/material';
import axiosClient from '../src/api/axiosClient';
import MedicalNavbar from '../src/components/MedicalNavbar';
import ServicioTecnico from '../src/pages/ServicioTecnico';
import WhatsAppRecordatorios from '../src/pages/WhatsAppRecordatorios';
import ServicioTecnicoResumen from '../src/pages/ServicioTecnicoResumen';

const readyAt = new Date(Date.now() - 16 * 86400000).toISOString().slice(0, -1);
const remission = { id: 1, remissionId: 'PRUEBA-1', celular: '', totalValue: 30000, depositValue: 30000, saldo: 0, fechaSalida: null };
const records = [
  { id: 1, equipo: 'Tensiometro digital', marca: 'Prueba A', serial: 'LOCAL-1', valor: 15000, brazalete: 'OK', pilas: 'OK', revision: 'Ok', mantenimiento: 'Ok', limpieza: 'Ok', calibracion: 'Ok', notasDiagnostico: '', readyAt: null, dadoBaja: false },
  { id: 2, equipo: 'Nebulizador', marca: 'Prueba B', serial: 'LOCAL-2', valor: 15000, brazalete: 'OK', pilas: 'N/A', revision: 'Ok', mantenimiento: 'Ok', limpieza: 'Ok', calibracion: 'Ok', notasDiagnostico: '', readyAt, dadoBaja: false },
];
const reminders = [{recordId: 2, remissionId: 'PRUEBA-1', equipo: 'Nebulizador', marca: 'Prueba B', serial: 'LOCAL-2', readyAt, daysReady: 16}];
const expenses = [
  {id: 1, description: 'Transporte de prueba', amount: 12000.50, paymentMethod: 'Efectivo', expenseDate: '2026-09-18T15:00:00'},
  {id: 2, description: 'Insumos de prueba', amount: 8000.25, paymentMethod: 'Tarjeta', expenseDate: '2026-09-19T23:59:59'},
];
axiosClient.defaults.adapter = async config => {
  const path = config.url || '';
  let data: unknown;
  if (path === '/expenses/summary') {
    const selected = expenses.filter(e => (!config.params?.from || e.expenseDate.slice(0,10) >= config.params.from)
      && (!config.params?.to || e.expenseDate.slice(0,10) <= config.params.to));
    data = {expenses: selected, total: selected.reduce((sum,e) => sum + e.amount, 0)};
  } else if (path === '/remissions/whatsapp/equipment-reminders') {
    data = remission.fechaSalida ? [] : reminders;
  } else if (path.includes('/deliver/')) {
    remission.fechaSalida = new Date().toISOString(); data = remission;
  } else if (path.endsWith('/ready')) {
    const id = Number(path.split('/').at(-2));
    const record = records.find(r => r.id === id);
    record.readyAt ||= new Date().toISOString().slice(0,-1); data = record;
  } else if (path.endsWith('/whatsapp/reminder')) {
    const id = Number(path.split('/').at(-3));
    const index = reminders.findIndex(r => r.recordId === id);
    if (index >= 0) reminders.splice(index,1); data = {};
  } else if (path.endsWith('/technical-records')) {
    data = records;
  } else if (config.method === 'put' && path.includes('/technical-records/')) {
    const record = records.find(r => r.id === Number(path.split('/').at(-1)));
    Object.assign(record, JSON.parse(config.data)); data = record;
  } else if (path === '/remissions/PRUEBA-1') {
    data = remission;
  } else {
    throw new Error('Ruta no disponible en la vista de prueba: ' + path);
  }
  return {config, data: JSON.parse(JSON.stringify(data)), status: 200, statusText: 'OK', headers: {}};
};
createRoot(document.getElementById('root')!).render(<BrowserRouter><CssBaseline />
  <Alert severity="warning">PRUEBA LOCAL · Datos simulados. Busca la remisión PRUEBA-1. No enviar mensajes reales.</Alert>
  <MedicalNavbar />
  <Routes>
    <Route path="/recordatorios-whatsapp" element={<WhatsAppRecordatorios />} />
    <Route path="/servicio-tecnico-resumen" element={<ServicioTecnicoResumen />} />
    <Route path="*" element={<ServicioTecnico />} />
  </Routes>
</BrowserRouter>);
