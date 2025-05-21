// src/pages/Remisiones.jsx
import React, { useState } from 'react';
import {
  Container,
  Box,
  Typography,
  TextField,
  Button,
  MenuItem,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
  Alert
} from '@mui/material';
import axiosClient from '../api/axiosClient';
import { useNavigate } from 'react-router-dom';

export default function Remisiones() {
  const initialForm = {
    remissionId: '',
    totalValue: '',
    depositValue: '',
    depositMethod: ''
  };

  const [formValues, setFormValues] = useState(initialForm);
  const [openModal, setOpenModal] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormValues({ ...formValues, [e.target.name]: e.target.value });
    setErrorMsg('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await axiosClient.post('/remissions', formValues);
      setOpenModal(true);
    } catch (error) {
      // Extraemos el mensaje del JSON { message: "..." }
      const msg =
        error.response?.data?.message ||
        'Error al ingresar remisión';
      setErrorMsg(msg);
    }
  };

  const handleIngrInfoTecnica = () => {
    setOpenModal(false);
    navigate('/servicio-tecnico', {
      state: { remissionId: formValues.remissionId }
    });
    setFormValues(initialForm);
  };
  const handleIngrDespues = () => {
    setOpenModal(false);
    setFormValues(initialForm);
  };

  return (
    <Box
      sx={{
        minHeight: '100vh',
        backgroundImage:
          'url("https://medicalmuneras.com/wp-content/uploads/2023/04/Imagen-1_auto_x2-scaled.jpg")',
        backgroundSize: 'cover',
        backgroundRepeat: 'no-repeat',
        backgroundPosition: 'center',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        p: 4
      }}
    >
      <Container
        maxWidth="sm"
        sx={{ backgroundColor: 'rgba(255,255,255,0.8)', p: 3, borderRadius: 2 }}
      >
        <Typography variant="h5" align="center" gutterBottom>
          Ingresar Remisión
        </Typography>

        {errorMsg && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {errorMsg}
          </Alert>
        )}

        <Box
          component="form"
          onSubmit={handleSubmit}
          sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}
        >
          <TextField
            label="ID de remisión"
            name="remissionId"
            value={formValues.remissionId}
            onChange={handleChange}
            fullWidth
            required
          />
          <TextField
            label="Valor Total (COP)"
            name="totalValue"
            type="number"
            value={formValues.totalValue}
            onChange={handleChange}
            fullWidth
            required
          />
          <TextField
            label="Valor Abono (COP)"
            name="depositValue"
            type="number"
            value={formValues.depositValue}
            onChange={handleChange}
            fullWidth
            required
          />
          <TextField
            select
            label="Método Abono"
            name="depositMethod"
            value={formValues.depositMethod}
            onChange={handleChange}
            fullWidth
            required
          >
            <MenuItem value="Efectivo">Efectivo</MenuItem>
            <MenuItem value="Tarjeta">Tarjeta</MenuItem>
            <MenuItem value="Transferencia">Transferencia</MenuItem>
          </TextField>
          <Button type="submit" variant="contained" fullWidth>
            Ingresar
          </Button>
        </Box>
      </Container>

      <Dialog open={openModal} onClose={handleIngrDespues}>
        <DialogTitle>Remisión ingresada</DialogTitle>
        <DialogContent>
          <DialogContentText>
            ¿Desea ingresar información técnica ahora?
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleIngrDespues}>Ingresar Después</Button>
          <Button onClick={handleIngrInfoTecnica} variant="contained">
            Ingresar información técnica
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
