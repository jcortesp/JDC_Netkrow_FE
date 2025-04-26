// src/components/BookingList.jsx
import React, { useState, useEffect, useContext } from 'react';
import axiosClient from '../api/axiosClient';
import { AuthContext } from '../contexts/AuthContext';
import {
  Container,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Button,
  Typography
} from '@mui/material';
import BookingModifyForm from './BookingModifyForm';

function BookingList() {
  const [bookings, setBookings] = useState([]);
  const [message, setMessage] = useState('');
  const [editingBookingId, setEditingBookingId] = useState(null);
  const { user } = useContext(AuthContext);

  useEffect(() => {
    const fetchBookings = async () => {
      try {
        const response = await axiosClient.get('/bookings/all');
        setBookings(response.data);
      } catch (error) {
        console.error('Error al obtener reservas:', error);
        setMessage(error.response?.data || 'Error al obtener reservas.');
      }
    };
    fetchBookings();
  }, []);

  const handleConfirm = async (bookingId) => {
    try {
      await axiosClient.post(`/bookings/${bookingId}/confirm`);
      setBookings((prev) =>
        prev.map((b) => (b.id === bookingId ? { ...b, status: 'CONFIRMED' } : b))
      );
      setMessage('Reserva confirmada exitosamente.');
    } catch (error) {
      console.error('Error al confirmar reserva:', error);
      setMessage(error.response?.data || 'Error al confirmar reserva.');
    }
  };

  const handleCancel = async (bookingId) => {
    try {
      await axiosClient.put(`/bookings/${bookingId}/cancel`);
      setBookings((prev) =>
        prev.map((b) => (b.id === bookingId ? { ...b, status: 'CANCELLED' } : b))
      );
      setMessage('Reserva cancelada exitosamente.');
    } catch (error) {
      console.error('Error al cancelar reserva:', error);
      setMessage(error.response?.data || 'Error al cancelar reserva.');
    }
  };

  const handleModificationSuccess = (updatedBooking) => {
    setBookings((prev) =>
      prev.map((b) => (b.id === updatedBooking.id ? updatedBooking : b))
    );
    setEditingBookingId(null);
    setMessage('Reserva modificada exitosamente.');
  };

  return (
    <Container maxWidth="md" sx={{ mt: 4 }}>
      <Typography variant="h5" gutterBottom>
        Lista de Reservas
      </Typography>

      {message && (
        <Typography variant="body2" color="error" sx={{ mb: 2 }}>
          {message}
        </Typography>
      )}

      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>ID</TableCell>
              <TableCell>Cliente ID</TableCell>
              <TableCell>Especialista ID</TableCell>
              <TableCell>Inicio</TableCell>
              <TableCell>Fin</TableCell>
              <TableCell>Estado</TableCell>
              <TableCell>Acciones</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {bookings.map((booking) => (
              <React.Fragment key={booking.id}>
                <TableRow>
                  <TableCell>{booking.id}</TableCell>
                  <TableCell>{booking.clientId}</TableCell>
                  <TableCell>{booking.specialistId}</TableCell>
                  <TableCell>
                    {booking.startTime ? new Date(booking.startTime).toLocaleString() : '---'}
                  </TableCell>
                  <TableCell>
                    {booking.endTime ? new Date(booking.endTime).toLocaleString() : '---'}
                  </TableCell>
                  <TableCell>{booking.status}</TableCell>
                  <TableCell>
                    {user?.roles?.includes('ROLE_SPECIALIST') && booking.status === 'PENDING' && (
                      <Button variant="outlined" onClick={() => handleConfirm(booking.id)} sx={{ mr: 1 }}>
                        Confirmar
                      </Button>
                    )}
                    {booking.status !== 'CANCELLED' && (
                      <Button variant="outlined" color="error" onClick={() => handleCancel(booking.id)} sx={{ mr: 1 }}>
                        Cancelar
                      </Button>
                    )}
                    {booking.status === 'PENDING' && (
                      <Button
                        variant="outlined"
                        onClick={() =>
                          setEditingBookingId(editingBookingId === booking.id ? null : booking.id)
                        }
                      >
                        {editingBookingId === booking.id ? 'Cerrar Modificación' : 'Modificar'}
                      </Button>
                    )}
                  </TableCell>
                </TableRow>
                {editingBookingId === booking.id && (
                  <TableRow>
                    <TableCell colSpan={7}>
                      <BookingModifyForm booking={booking} onModificationSuccess={handleModificationSuccess} />
                    </TableCell>
                  </TableRow>
                )}
              </React.Fragment>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    </Container>
  );
}

export default BookingList;
