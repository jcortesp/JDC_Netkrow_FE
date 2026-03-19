import { Fragment, useContext, useEffect, useState } from 'react';
import {
  Alert,
  Container,
  IconButton,
  Paper,
  Snackbar,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
} from '@mui/material';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import CancelIcon from '@mui/icons-material/Cancel';
import EditIcon from '@mui/icons-material/Edit';
import axiosClient from '../api/axiosClient';
import { AuthContext } from '../contexts/AuthContext';
import type { Booking } from '../types';
import BookingModifyForm from './BookingModifyForm';

export default function BookingList() {
  const { user } = useContext(AuthContext);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [editId, setEditId] = useState<number | null>(null);
  const [toast, setToast] = useState<{ open: boolean; message: string; severity: 'success' | 'error' }>({
    open: false,
    message: '',
    severity: 'success',
  });

  useEffect(() => {
    axiosClient.get('/bookings/all')
      .then((r) => setBookings(r.data as Booking[]))
      .catch((err: { message?: string }) => {
        setToast({ open: true, message: err.message || 'Error consultando reservas', severity: 'error' });
      });
  }, []);

  const updateStatus = (id: number, url: string, newStatus: string) => {
    axiosClient.post(url)
      .then(() => {
        setBookings((bs) => bs.map((b) => b.id === id ? { ...b, status: newStatus } : b));
        setToast({ open: true, message: `Reserva ${newStatus.toLowerCase()}`, severity: 'success' });
      })
      .catch((err: { message?: string }) => {
        setToast({ open: true, message: err.message || 'Error actualizando reserva', severity: 'error' });
      });
  };

  const onModified = (updated: unknown) => {
    const booking = updated as Booking;
    setBookings((bs) => bs.map((b) => b.id === booking.id ? booking : b));
    setEditId(null);
    setToast({ open: true, message: 'Reserva modificada', severity: 'success' });
  };

  return (
    <Container maxWidth="lg" sx={{ mt: 4 }}>
      <Typography variant="h5" sx={{ mb: 2, fontWeight: 700 }}>Lista de Reservas</Typography>

      <TableContainer component={Paper}>
        <Table size="small">
          <TableHead>
            <TableRow>
              {['ID', 'Cliente', 'Especialista', 'Inicio', 'Fin', 'Estado', 'Acciones'].map((h) => (
                <TableCell key={h}>{h}</TableCell>
              ))}
            </TableRow>
          </TableHead>
          <TableBody>
            {bookings.map((b) => (
              <Fragment key={b.id}>
                <TableRow>
                  <TableCell>{b.id}</TableCell>
                  <TableCell>{b.clientId}</TableCell>
                  <TableCell>{b.specialistId}</TableCell>
                  <TableCell>{new Date(b.startTime).toLocaleString()}</TableCell>
                  <TableCell>{new Date(b.endTime).toLocaleString()}</TableCell>
                  <TableCell>{b.status}</TableCell>
                  <TableCell>
                    {user?.roles?.includes('ROLE_SPECIALIST') && b.status === 'PENDING' && (
                      <IconButton
                        color="success"
                        size="small"
                        onClick={() => updateStatus(b.id, `/bookings/${b.id}/confirm`, 'CONFIRMED')}
                      >
                        <CheckCircleIcon fontSize="small" />
                      </IconButton>
                    )}
                    {b.status !== 'CANCELLED' && (
                      <IconButton
                        color="error"
                        size="small"
                        onClick={() => updateStatus(b.id, `/bookings/${b.id}/cancel`, 'CANCELLED')}
                      >
                        <CancelIcon fontSize="small" />
                      </IconButton>
                    )}
                    {b.status === 'PENDING' && (
                      <IconButton size="small" onClick={() => setEditId((id) => id === b.id ? null : b.id)}>
                        <EditIcon fontSize="small" />
                      </IconButton>
                    )}
                  </TableCell>
                </TableRow>

                {editId === b.id && (
                  <TableRow>
                    <TableCell colSpan={7}>
                      <BookingModifyForm booking={b} onModificationSuccess={onModified} />
                    </TableCell>
                  </TableRow>
                )}
              </Fragment>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      {bookings.length === 0 && <Typography sx={{ mt: 2 }}>No hay reservas.</Typography>}

      <Snackbar
        open={toast.open}
        autoHideDuration={2800}
        onClose={() => setToast((p) => ({ ...p, open: false }))}
      >
        <Alert onClose={() => setToast((p) => ({ ...p, open: false }))} severity={toast.severity} variant="filled">
          {toast.message}
        </Alert>
      </Snackbar>
    </Container>
  );
}
