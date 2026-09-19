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
import WhatsAppConfirmation, { PendingWhatsApp } from '../components/WhatsAppConfirmation';
import {
  navigateWhatsAppWindow,
  REMINDER_MESSAGE,
} from '../utils/whatsapp';

interface WhatsAppReminder {
  remissionId: string;
  celular?: string | null;
  totalValue?: number | null;
  createdAt?: string | null;
  firstNotificationAt: string;
  lastReminderAt?: string | null;
  lastNotificationAt: string;
  daysSinceLastNotification: number;
  equipment: string[];
}

const formatDate = (value?: string | null) => {
  if (!value) return '-';
  return new Intl.DateTimeFormat('es-CO', {
    dateStyle: 'medium',
    timeStyle: 'short',
  }).format(new Date(/[zZ]|[+-]\d{2}:\d{2}$/.test(value) ? value : `${value}Z`));
};

const formatCurrency = (value?: number | null) => new Intl.NumberFormat('es-CO', {
  style: 'currency',
  currency: 'COP',
  maximumFractionDigits: 0,
}).format(value || 0);

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
      const { data } = await axiosClient.get<WhatsAppReminder[]>('/remissions/whatsapp/reminders');
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
      setPendingWhatsApp({ remissionId: reminder.remissionId, kind: 'reminder' });
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
          setReminders(current => current.filter(item => item.remissionId !== id));
          setSuccess('Recordatorio confirmado para la remisión ' + id + '.');
        }}
      />
      <Container maxWidth="xl">
        <Stack direction={{ xs: 'column', md: 'row' }} justifyContent="space-between" alignItems={{ md: 'center' }} spacing={2} sx={{ mb: 3 }}>
          <Box>
            <Typography variant="h4">Recordatorios de recogida</Typography>
            <Typography color="text.secondary" sx={{ mt: 0.5 }}>
              Remisiones listas que cumplen 15 días desde el último aviso por WhatsApp.
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
              <Typography color="text.secondary">Las remisiones reaparecerán cuando cumplan otros 15 días desde el último aviso.</Typography>
            </Box>
          ) : (
            <TableContainer>
              <Table sx={{ minWidth: 900 }}>
                <TableHead>
                  <TableRow>
                    <TableCell>Remisión</TableCell>
                    <TableCell>Equipos</TableCell>
                    <TableCell>Celular</TableCell>
                    <TableCell>Último aviso</TableCell>
                    <TableCell align="center">Días</TableCell>
                    <TableCell align="right">Acción</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {reminders.map((reminder) => (
                    <TableRow key={reminder.remissionId} hover>
                      <TableCell>
                        <Typography fontWeight={800}>{reminder.remissionId}</Typography>
                        <Typography variant="caption" color="text.secondary">{formatCurrency(reminder.totalValue)}</Typography>
                      </TableCell>
                      <TableCell>{reminder.equipment.length ? reminder.equipment.join(', ') : 'Sin equipos activos'}</TableCell>
                      <TableCell>{reminder.celular || <Chip label="Sin celular" size="small" color="warning" variant="outlined" />}</TableCell>
                      <TableCell>{formatDate(reminder.lastNotificationAt)}</TableCell>
                      <TableCell align="center"><Chip label={`${reminder.daysSinceLastNotification} días`} color="warning" /></TableCell>
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