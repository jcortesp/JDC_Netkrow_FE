import { useContext, useState } from 'react';
import axiosClient from '../api/axiosClient';
import { useNavigate } from 'react-router-dom';
import {
  Alert,
  Box,
  Button,
  Container,
  Snackbar,
  Stack,
  TextField,
  Typography,
} from '@mui/material';
import { AuthContext } from '../contexts/AuthContext';

export default function BookingForm() {
  const navigate = useNavigate();
  const { user } = useContext(AuthContext);
  const [values, setValues] = useState({ startDateTime: '', endDateTime: '', specialistId: '' });
  const [error, setError] = useState('');
  const [successOpen, setSuccessOpen] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setValues(v => ({ ...v, [e.target.name]: e.target.value }));
  };

  const addSeconds = str => (str.length === 16 ? str + ':00' : str);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    try {
      await axiosClient.post('/bookings', {
        clientId: user?.id,
        startDateTime: addSeconds(values.startDateTime),
        endDateTime: addSeconds(values.endDateTime),
        specialistId: Number(values.specialistId)
      });
      setSuccessOpen(true);
      navigate('/bookings');
    } catch (err: unknown) {
      const e = err as { response?: { data?: unknown } };
      setError(String(e.response?.data || 'Error al crear la reserva'));
    }
  };

  return (
    <Container maxWidth="sm" sx={{ mt: 6 }}>
      <Box sx={{ p: 3, bgcolor: '#fff', borderRadius: 2, boxShadow: 3 }}>
        <Typography variant="h5" sx={{ mb: 2, fontWeight: 700 }}>Crear Reserva</Typography>
        {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

        <Box component="form" onSubmit={handleSubmit}>
          <Stack spacing={2}>
            <TextField
              name="startDateTime"
              type="datetime-local"
              label="Fecha y hora de inicio"
              value={values.startDateTime}
              onChange={handleChange}
              required
              fullWidth
              InputLabelProps={{ shrink: true }}
            />
            <TextField
              name="endDateTime"
              type="datetime-local"
              label="Fecha y hora de fin"
              value={values.endDateTime}
              onChange={handleChange}
              required
              fullWidth
              InputLabelProps={{ shrink: true }}
            />
            <TextField
              name="specialistId"
              type="number"
              label="ID del Especialista"
              value={values.specialistId}
              onChange={handleChange}
              required
              fullWidth
            />
            <Button variant="contained" type="submit">Crear Reserva</Button>
          </Stack>
        </Box>
      </Box>

      <Snackbar
        open={successOpen}
        autoHideDuration={2500}
        onClose={() => setSuccessOpen(false)}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert onClose={() => setSuccessOpen(false)} severity="success" variant="filled">
          Reserva creada
        </Alert>
      </Snackbar>
    </Container>
  );
}
