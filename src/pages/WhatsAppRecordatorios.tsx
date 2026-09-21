import { useCallback, useEffect, useState } from 'react';
import {
  Alert,
  Box,
  Button,
  Chip,
  CircularProgress,
  Container,
  Paper,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
} from '@mui/material';
import RefreshIcon from '@mui/icons-material/Refresh';
import WhatsAppIcon from '@mui/icons-material/WhatsApp';
import axiosClient from '../api/axiosClient';
import { formatUtcDate } from '../utils/equipment';
import WhatsAppConfirmation, { PendingWhatsApp } from '../components/WhatsAppConfirmation';
import {
  navigateWhatsAppWindow,
  REMINDER_MESSAGE,
} from '../utils/whatsapp';

interface WhatsAppReminder {
  recordId: number;
  remissionId: string;
  celular?: string | null;
  equipo: string;
  marca?: string | null;
  serial?: string | null;
  readyAt: string;
  lastReminderAt?: string | null;
  daysReady: number;
}

export default function WhatsAppRecordatorios() {
  const [reminders, setReminders] = useState<WhatsAppReminder[]>([]);
  const [loading, setLoading] = useState(true);
  const [pendingWhatsApp, setPendingWhatsApp] = useState<PendingWhatsApp | null>(null);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const loadReminders = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const { data } = await axiosClient.get<WhatsAppReminder[]>('/remissions/whatsapp/equipment-reminders');
      setReminders(data || []);
    } catch (requestError) {
      console.error(requestError);
      setError('No fue posible consultar las remisiones pendientes de recordatorio.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadReminders();
  }, [loadReminders]);

  const handleSendOne = (reminder: WhatsAppReminder) => {
    setError('');
    setSuccess('');
    try {
      navigateWhatsAppWindow(null, REMINDER_MESSAGE(reminder), reminder.celular);
      setPendingWhatsApp({ remissionId: reminder.remissionId, recordId: reminder.recordId, equipo: reminder.equipo });
    } catch (e) {
      setError(e instanceof Error ? e.message : 'No fue posible abrir WhatsApp.');
    }
  };

  return (
    <Box sx={{ minHeight: 'calc(100vh - 80px)', py: { xs: 3, md: 5 }, background: 'linear-gradient(135deg, #f4f8fb 0%, #e6f3f1 100%)' }}>
      <WhatsAppConfirmation
        pending={pendingWhatsApp}
        onClose={() => setPendingWhatsApp(null)}
        onConfirmed={(id) => {
          setReminders(current => current.filter(item => item.recordId !== id));
          setSuccess('Recordatorio del equipo confirmado.');
        }}
      />
      <Container maxWidth="xl">
        <Stack direction={{ xs: 'column', md: 'row' }} justifyContent="space-between" alignItems={{ md: 'center' }} spacing={2} sx={{ mb: 3 }}>
          <Box>
            <Typography variant="h4">Recordatorios de recogida</Typography>
            <Typography color="text.secondary" sx={{ mt: 0.5 }}>
              Equipos con 15 días o más listos para entrega y cuya remisión aún no ha sido entregada.
            </Typography>
          </Box>
          <Stack direction="row" spacing={1}>
            <Button variant="outlined" startIcon={<RefreshIcon />} onClick={loadReminders} disabled={loading || Boolean(pendingWhatsApp)}>
              Actualizar
            </Button>
          </Stack>
        </Stack>

        <Alert severity="info" sx={{ mb: 2 }}>
          Cada acción abre el chat con el mensaje listo en WhatsApp Web. Pulsa &quot;Enviar&quot; y luego confirma aquí con &quot;Ya lo envié&quot;.
        </Alert>
        {error && <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError('')}>{error}</Alert>}
        {success && <Alert severity="success" sx={{ mb: 2 }} onClose={() => setSuccess('')}>{success}</Alert>}

        <Paper sx={{ overflow: 'hidden' }}>
          {loading ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}><CircularProgress /></Box>
          ) : reminders.length === 0 ? (
            <Box sx={{ py: 8, px: 3, textAlign: 'center' }}>
              <WhatsAppIcon color="success" sx={{ fontSize: 42, mb: 1 }} />
              <Typography variant="h6">No hay recordatorios pendientes</Typography>
              <Typography color="text.secondary">Los equipos reaparecen 15 días después de su último recordatorio si la remisión sigue pendiente.</Typography>
            </Box>
          ) : (
            <TableContainer>
              <Table sx={{ minWidth: 900 }}>
                <TableHead>
                  <TableRow>
                    <TableCell>Remisión</TableCell>
                    <TableCell>Equipo</TableCell>
                    <TableCell>Celular</TableCell>
                    <TableCell>Listo desde</TableCell>
                    <TableCell>Último recordatorio</TableCell>
                    <TableCell align="center">Días listo</TableCell>
                    <TableCell align="right">Acción</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {reminders.map((reminder) => (
                    <TableRow key={reminder.recordId} hover>
                      <TableCell>
                        <Typography fontWeight={800}>{reminder.remissionId}</Typography>
                      </TableCell>
                      <TableCell>{reminder.equipo}<Typography variant="caption" display="block">{reminder.marca || "Sin marca"} · Serial: {reminder.serial || "Sin serial"}</Typography></TableCell>
                      <TableCell>{reminder.celular || <Chip label="Sin celular" size="small" color="warning" variant="outlined" />}</TableCell>
                      <TableCell>{formatUtcDate(reminder.readyAt)}</TableCell>
                      <TableCell>{formatUtcDate(reminder.lastReminderAt)}</TableCell>
                      <TableCell align="center"><Chip label={`${reminder.daysReady} días`} color="warning" /></TableCell>
                      <TableCell align="right">
                        <Button
                          variant="contained"
                          color="success"
                          startIcon={<WhatsAppIcon />}
                          onClick={() => handleSendOne(reminder)}
                          disabled={Boolean(pendingWhatsApp)}
                        >
                          Recordar
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          )}
        </Paper>
      </Container>
    </Box>
  );
}
