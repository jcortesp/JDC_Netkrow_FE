import { useState } from 'react';
import axiosClient from '../api/axiosClient';
import {
  Alert,
  Box,
  Button,
  Snackbar,
  Stack,
  TextField,
} from '@mui/material';

interface BookingLike {
  id: number;
  startTime: string;
  endTime: string;
}

interface Props {
  booking: BookingLike;
  onModificationSuccess: (booking: unknown) => void;
}

export default function BookingModifyForm({ booking, onModificationSuccess }: Props) {
  const [newStart, setNewStart] = useState(booking.startTime.slice(0,16));
  const [newEnd, setNewEnd] = useState(booking.endTime.slice(0,16));
  const [toast, setToast] = useState<{ open: boolean; message: string; severity: 'success' | 'error' }>({
    open: false,
    message: '',
    severity: 'success',
  });

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    try {
      const format = str => (str.length===16 ? str+':00' : str);
      const { data } = await axiosClient.put(`/bookings/${booking.id}/modify`, {
        newStartDateTime: format(newStart),
        newEndDateTime: format(newEnd)
      });
      onModificationSuccess(data);
      setToast({ open: true, message: 'Reserva modificada', severity: 'success' });
    } catch (err: unknown) {
      const e2 = err as { message?: string };
      setToast({ open: true, message: e2.message || 'Error al modificar reserva', severity: 'error' });
    }
  };

  return (
    <Box component="form" onSubmit={handleSubmit} sx={{ p: 2, border: '1px solid #ddd', borderRadius: 1 }}>
      <Stack spacing={3}>
        <TextField
          type="datetime-local"
          label="Nueva Fecha y Hora de Inicio"
          value={newStart}
          onChange={(e) => setNewStart(e.target.value)}
          InputLabelProps={{ shrink: true }}
          fullWidth
        />
        <TextField
          type="datetime-local"
          label="Nueva Fecha y Hora de Fin"
          value={newEnd}
          onChange={(e) => setNewEnd(e.target.value)}
          InputLabelProps={{ shrink: true }}
          fullWidth
        />
        <Button type="submit" variant="contained">Modificar Reserva</Button>
      </Stack>

      <Snackbar open={toast.open} autoHideDuration={2500} onClose={() => setToast((p) => ({ ...p, open: false }))}>
        <Alert onClose={() => setToast((p) => ({ ...p, open: false }))} severity={toast.severity} variant="filled">
          {toast.message}
        </Alert>
      </Snackbar>
    </Box>
  );
}
