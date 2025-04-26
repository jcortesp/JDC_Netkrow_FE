// src/components/BookingModifyForm.jsx
import React, { useState } from 'react';
import { Box, TextField, Button, Typography } from '@mui/material';
import axiosClient from '../api/axiosClient';

const BookingModifyForm = ({ booking, onModificationSuccess }) => {
  // Inicializa los valores de fecha/hora usando los datos de la reserva (se truncan a 16 caracteres para el input)
  const [newStart, setNewStart] = useState(booking.startTime.substring(0, 16));
  const [newEnd, setNewEnd] = useState(booking.endTime.substring(0, 16));
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      // Si el valor viene sin segundos (16 caracteres), se añade ":00"
      const formatDate = (dateStr) => dateStr.length === 16 ? dateStr + ":00" : dateStr;
      const payload = {
        newStartDateTime: formatDate(newStart),
        newEndDateTime: formatDate(newEnd)
      };
      const response = await axiosClient.put(`/bookings/${booking.id}/modify`, payload);
      onModificationSuccess(response.data);
    } catch (err) {
      setError(err.response?.data || 'Error al modificar la reserva');
    }
  };

  return (
    <Box component="form" onSubmit={handleSubmit} sx={{ mt: 2, p: 2, border: '1px solid #ccc', borderRadius: 2 }}>
      <Typography variant="h6">Modificar Reserva</Typography>
      {error && <Typography color="error">{error}</Typography>}
      <TextField
        label="Nueva Fecha y Hora de Inicio"
        type="datetime-local"
        value={newStart}
        onChange={(e) => setNewStart(e.target.value)}
        fullWidth
        sx={{ mt: 1 }}
        InputLabelProps={{ shrink: true }}
      />
      <TextField
        label="Nueva Fecha y Hora de Fin"
        type="datetime-local"
        value={newEnd}
        onChange={(e) => setNewEnd(e.target.value)}
        fullWidth
        sx={{ mt: 1 }}
        InputLabelProps={{ shrink: true }}
      />
      <Button type="submit" variant="contained" sx={{ mt: 2 }}>
        Modificar Reserva
      </Button>
    </Box>
  );
};

export default BookingModifyForm;
