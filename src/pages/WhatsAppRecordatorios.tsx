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
  daysReady: number;
  reminderDay: number;
}

export default function WhatsAppRecordatorios() {
  const [reminders, setReminders] = useState<WhatsAppReminder[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

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
    try {
      navigateWhatsAppWindow(null, REMINDER_MESSAGE(reminder), reminder.celular);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'No fue posible abrir WhatsApp.');
    }
  };

  return (
    <Box sx={{ minHeight: 'calc(100vh - 80px)', py: { xs: 3, md: 5 }, background: 'linear-gradient(135deg, #f4f8fb 0%, #e6f3f1 100%)' }}>
      <Container maxWidth="xl">
        <Stack direction={{ xs: 'column', md: 'row' }} justifyContent="space-between" alignItems={{ md: 'center' }} spacing={2} sx={{ mb: 3 }}>
          <Box>
            <Typography variant="h4">Recordatorios de recogida</Typography>
            <Typography color="text.secondary" sx={{ mt: 0.5 }}>
              Equipos con 15 días o más listos para entrega y cuya remisión aún no ha sido entregada.
            </Typography>
          </Box>
          <Stack direction="row" spacing={1}>
            <Button variant="outlined" startIcon={<RefreshIcon />} onClick={loadReminders} disabled={loading}>
              Actualizar
            </Button>
          </Stack>
        </Stack>

        <Alert severity="info" sx={{ mb: 2 }}>
          El reporte incluye automáticamente los equipos que continúan en estado Listo. El ciclo avanza a 15, 30, 45 días y así sucesivamente hasta que se entregue la remisión.
        </Alert>
        {error && <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError('')}>{error}</Alert>}

        <Paper sx={{ overflow: 'hidden' }}>
          {loading ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}><CircularProgress /></Box>
          ) : reminders.length === 0 ? (
            <Box sx={{ py: 8, px: 3, textAlign: 'center' }}>
              <WhatsAppIcon color="success" sx={{ fontSize: 42, mb: 1 }} />
              <Typography variant="h6">No hay recordatorios pendientes</Typography>
              <Typography color="text.secondary">Los equipos aparecerán automáticamente al cumplir 15 días en estado Listo.</Typography>
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
                    <TableCell align="center">Días listo</TableCell>
                    <TableCell align="center">Ciclo</TableCell>
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
                      <TableCell align="center"><Chip label={`${reminder.daysReady} días`} color="warning" /></TableCell>
                      <TableCell align="center"><Chip label={`Recordatorio ${reminder.reminderDay} días`} variant="outlined" /></TableCell>
                      <TableCell align="right">
                        <Button
                          variant="contained"
                          color="success"
                          startIcon={<WhatsAppIcon />}
                          onClick={() => handleSendOne(reminder)}
                        >
                          Abrir recordatorio
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
