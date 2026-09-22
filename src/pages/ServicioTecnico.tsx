import React, { useState, useEffect } from 'react';
import {
  Container,
  Typography,
  TextField,
  Button,
  Stack,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Alert,
  Box
} from '@mui/material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import axiosClient from '../api/axiosClient';
import { useLocation } from 'react-router-dom';
import TechnicalRecordForm from '../components/TechnicalRecordForm';
import { equipmentStatus, equipmentStatusLabel, formatUtcDate, readyValidationIssues } from '../utils/equipment';
import {
  navigateWhatsAppWindow,
  SERVICE_MESSAGE,
} from '../utils/whatsapp';

const initialRecord = {
    equipo: '', valor: '', marca: '', serial: '', brazalete: '',
    pilas: '', revision: '', mantenimiento: '',
    limpieza: '', calibracion: '', notasDiagnostico: ''
  };

export default function ServicioTecnico() {
  const location = useLocation();
  const initialId = location.state?.remissionId || '';

  const [remissionId, setRemissionId] = useState(initialId);
  const [remisionData, setRemisionData] = useState(null);
  const [records, setRecords] = useState([]);
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [expanded, setExpanded] = useState(false);
  const [newMode, setNewMode] = useState(false);
  const [dirtyRecords, setDirtyRecords] = useState<Set<number>>(new Set());
  const [busy, setBusy] = useState(false);

  const [newRecord, setNewRecord] = useState(initialRecord);

  const fetchRemision = async (rawId) => {
    const id = (rawId ?? '').trim();
    setBusy(true);
    try {
      const { data } = await axiosClient.get(`/remissions/${encodeURIComponent(id)}`);
      const res = await axiosClient.get(`/remissions/${encodeURIComponent(id)}/technical-records`);
      setRemisionData(data);
      setRecords(res.data);
      setDirtyRecords(new Set());
      setNewMode(false);
      setError('');
      setSuccessMsg('');
      setExpanded(false);
    } catch (e) {
      const status = e.response?.status;
      setRemisionData(null);
      setRecords([]);
      if (status === 400 || status === 404) {
        setError('No se encontró la remisión');
      } else {
        setError('Error al comunicar con el servidor');
      }
    } finally {
      setBusy(false);
    }
  };

  useEffect(() => {
    if (initialId) {
      // Antes abría automáticamente el formulario de nuevo equipo.
      // Ahora SOLO cargamos datos y dejamos la opción para que el usuario decida agregar.
      fetchRemision(initialId).then(() => {
        setNewMode(false);           // <── clave para no abrir el form
        setNewRecord(initialRecord);
      });
    }
  }, [initialId]);

  const handleCreate = async (form) => {
    if (busy) return;
    setBusy(true);
    try {
      // Normalizamos valor a número
      const payload = { ...form, valor: form.valor === '' ? 0 : Number(form.valor) };
      const { data } = await axiosClient.post(`/remissions/${encodeURIComponent(remisionData.remissionId)}/technical-records`, payload);
      setRecords(current => [...current, data]);
      setSuccessMsg('Guardado con éxito');
      setNewMode(false);
    } catch {
      setError('Error al guardar');
    } finally {
      setBusy(false);
    }
  };

  const handleUpdate = async (recordId, form) => {
    if (busy) return;
    setBusy(true);
    try {
      const payload = { ...form, valor: form.valor === '' ? 0 : Number(form.valor) };
      const { data } = await axiosClient.put(
        `/remissions/${encodeURIComponent(remisionData.remissionId)}/technical-records/${recordId}`, payload);
      setRecords(current => current.map(record => record.id === recordId ? data : record));
      setDirtyRecords(current => { const next = new Set(current); next.delete(recordId); return next; });
      setSuccessMsg('Guardado con éxito');
      setError('');
    } catch (e) {
      setError(e.response?.data?.message || 'Error al guardar');
    } finally {
      setBusy(false);
    }
  };

  const handleMarkReady = async (record) => {
    if (busy || equipmentStatus(record, remisionData) !== 'EN_SERVICIO') return;
    if (dirtyRecords.has(record.id)) {
      setError('Guarda los cambios del equipo antes de marcarlo como listo para entrega.');
      return;
    }
    const issues = readyValidationIssues(record);
    if (issues.length > 0) {
      setError(`No se puede pasar a listo hasta que estos campos estén en el estado correcto: ${issues.join('; ')}.`);
      return;
    }
    setBusy(true);
    setError('');
    try {
      const { data } = await axiosClient.post(
        `/remissions/${encodeURIComponent(remisionData.remissionId)}/technical-records/${record.id}/ready`);
      setRecords(current => current.map(item => item.id === record.id ? data : item));
      setSuccessMsg('Equipo listo para entrega. Sus campos quedaron bloqueados; el recordatorio estará disponible en 15 días.');
    } catch (e) {
      setError(e.response?.data?.message || 'No fue posible marcar el equipo como listo');
    } finally {
      setBusy(false);
    }
  };

  const handleSendWhatsApp = (record) => {
    const loadedId = remisionData?.remissionId;
    if (!loadedId) return;
    const ready = equipmentStatus(record, remisionData) === 'LISTO';
    const message = SERVICE_MESSAGE(record, loadedId, ready);

    try {
      navigateWhatsAppWindow(null, message, remisionData?.celular);
    } catch (e) {
      setError(e.message);
    }
  };

  const readOnly = Boolean(remisionData?.fechaSalida);

  return (
    <Box
      sx={{
        minHeight: '100vh',
        backgroundImage:
          'url("https://medicalmuneras.com/wp-content/uploads/2023/04/Imagen-1_auto_x2-scaled.jpg")',
        backgroundSize: 'cover',
        backgroundRepeat: 'no-repeat',
        backgroundPosition: 'center',
        p: 4
      }}
    >
      <Container maxWidth="sm" sx={{ backgroundColor: 'rgba(255,255,255,0.8)', p: 3, borderRadius: 2 }}>
        <Typography variant="h5" align="center" gutterBottom>
          Servicio Técnico
        </Typography>

        <Stack direction="row" gap={2} mb={2}>
          <TextField
            label="Código de remisión"
            value={remissionId}
            onChange={e => setRemissionId(e.target.value)}
            disabled={busy}
            fullWidth
            InputLabelProps={{ shrink: true }}
          />
          <Button variant="contained" disabled={busy} onClick={() => fetchRemision(remissionId)}>
            Buscar
          </Button>
        </Stack>

        {error && (
          <Alert severity="error" onClose={() => setError('')} sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}
        {successMsg && (
          <Alert severity="success" onClose={() => setSuccessMsg('')} sx={{ mb: 2 }}>
            {successMsg}
          </Alert>
        )}

        {remisionData && (
          <>
            <Typography variant="h6" align="center" gutterBottom sx={{ fontWeight: 'bold' }}>
              Equipos disponibles
            </Typography>

            {records.map(rec => (
              <Accordion
                key={rec.id}
                expanded={expanded === rec.id}
                onChange={(_, isExpanded) => {
                  setExpanded(isExpanded ? rec.id : false);
                  setError('');
                  setSuccessMsg('');
                }}
              >
                <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                  {rec.equipo} — {rec.marca} {typeof rec.valor !== 'undefined' ? `— ${rec.valor}` : ''} · {equipmentStatusLabel[equipmentStatus(rec, remisionData)]}
                </AccordionSummary>
                <AccordionDetails>
                  <Alert severity={equipmentStatus(rec, remisionData) === 'EN_SERVICIO' ? 'info' : 'success'} sx={{ mb: 2 }}>
                    {equipmentStatusLabel[equipmentStatus(rec, remisionData)]}
                    {rec.readyAt && ` · Listo desde: ${formatUtcDate(rec.readyAt)}`}
                  </Alert>
                  {equipmentStatus(rec, remisionData) === 'EN_SERVICIO' && (
                    <Typography variant="body2" sx={{ mb: 2 }}>
                      Para marcar listo: Revisión, Mantenimiento, Limpieza y Calibración deben estar en OK; Pilas puede estar en OK, Cambio o N/A y Brazalete puede estar en cualquier estado. Al hacerlo, los campos quedarán bloqueados.
                      {dirtyRecords.has(rec.id) && ' Hay cambios sin guardar.'}
                    </Typography>
                  )}
                  <TechnicalRecordForm
                    form={{ ...rec, valor: rec.valor ?? '' }}
                    onChange={e => {
                      const { name, value } = e.target;
                      setDirtyRecords(current => new Set(current).add(rec.id));
                      setRecords(rs =>
                        rs.map(r => (r.id === rec.id ? { ...r, [name]: value } : r))
                      );
                    }}
                    onSubmit={e => {
                      e.preventDefault();
                      handleUpdate(rec.id, rec);
                    }}
                    onSendWhatsApp={handleSendWhatsApp}
                    whatsappLabel={equipmentStatus(rec, remisionData) === 'LISTO'
                      ? 'Enviar aviso de equipo listo por WhatsApp'
                      : 'Enviar estado por WhatsApp'}
                    error={error}
                    readOnly={busy || equipmentStatus(rec, remisionData) !== 'EN_SERVICIO'}
                    onMarkReady={() => handleMarkReady(rec)}
                    readyDisabled={busy || equipmentStatus(rec, remisionData) !== 'EN_SERVICIO'}
                    readyLabel="Listo para entrega"
                  />
                </AccordionDetails>
              </Accordion>
            ))}

            {!readOnly && !newMode && (
              <Button
                variant="contained"
                fullWidth
                sx={{ mt: 2 }}
                disabled={busy}
                onClick={() => {
                  setNewMode(true);
                  setError('');
                  setSuccessMsg('');
                  setNewRecord(initialRecord);
                }}
              >
                + Agregar Servicio Técnico
              </Button>
            )}

            {!readOnly && newMode && (
              <>
                <TechnicalRecordForm
                  form={newRecord}
                  onChange={e => {
                    const { name, value } = e.target;
                    setNewRecord(nr => ({ ...nr, [name]: value }));
                  }}
                  onSubmit={e => {
                    e.preventDefault();
                    handleCreate(newRecord);
                  }}
                  onSendWhatsApp={handleSendWhatsApp}
                  whatsappLabel="Enviar estado por WhatsApp"
                  error={error}
                  readOnly={busy}
                />

                <Stack direction="row" gap={2} mt={1}>
                  <Button
                    variant="outlined"
                    fullWidth
                    onClick={() => {
                      setNewMode(false);
                      setError('');
                    }}
                  >
                    Cancelar
                  </Button>
                </Stack>
              </>
            )}
          </>
        )}
      </Container>
    </Box>
  );
}
