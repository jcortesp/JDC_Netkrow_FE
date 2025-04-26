import React, { useState, useContext } from 'react';
import axiosClient from '../api/axiosClient';
import { useNavigate } from 'react-router-dom';
import { Container, Box, TextField, Button, Typography, Stack } from '@mui/material';
import { AuthContext } from '../contexts/AuthContext';

function BookingForm() {
  const navigate = useNavigate();
  const { user } = useContext(AuthContext); // Se obtiene el usuario autenticado
  const [formValues, setFormValues] = useState({
    startDateTime: '',
    endDateTime: '',
    specialistId: ''
  });
  const [error, setError] = useState(null);

  const handleChange = (e) => {
    setFormValues({ ...formValues, [e.target.name]: e.target.value });
  };

  // Si el valor viene sin segundos (16 caracteres), se le añade ":00"
  const addSecondsIfMissing = (datetimeStr) => {
    if (datetimeStr && datetimeStr.length === 16) {
      return datetimeStr + ":00";
    }
    return datetimeStr;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const payload = {
      clientId: user?.id,  // Se agrega el clientId del usuario autenticado
      startDateTime: addSecondsIfMissing(formValues.startDateTime),
      endDateTime: addSecondsIfMissing(formValues.endDateTime),
      specialistId: parseInt(formValues.specialistId, 10)
    };

    try {
      await axiosClient.post('/bookings', payload);
      navigate('/bookings');
    } catch (err) {
      setError(err.response?.data || 'Error al crear la reserva');
    }
  };

  return (
    <Container maxWidth="sm" sx={{ mt: 5 }}>
      <Box
        component="form"
        onSubmit={handleSubmit}
        sx={{ p: 3, backgroundColor: '#fff', border: '1px solid #ccc', borderRadius: 2 }}
      >
        <Typography variant="h5" mb={2}>
          Crear Reserva
        </Typography>
        {error && (
          <Typography color="error" mb={2}>
            {error}
          </Typography>
        )}
        <Stack spacing={2}>
          <TextField
            name="startDateTime"
            label="Fecha y hora de inicio"
            type="datetime-local"
            InputLabelProps={{ shrink: true }}
            value={formValues.startDateTime}
            onChange={handleChange}
            fullWidth
          />
          <TextField
            name="endDateTime"
            label="Fecha y hora de fin"
            type="datetime-local"
            InputLabelProps={{ shrink: true }}
            value={formValues.endDateTime}
            onChange={handleChange}
            fullWidth
          />
          <TextField
            name="specialistId"
            label="ID del Especialista"
            type="number"
            value={formValues.specialistId}
            onChange={handleChange}
            fullWidth
          />
          <Button type="submit" variant="contained">
            Crear Reserva
          </Button>
        </Stack>
      </Box>
    </Container>
  );
}

export default BookingForm;
