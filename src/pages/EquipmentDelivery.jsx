// src/pages/EquipmentDelivery.jsx
import React, { useState } from 'react';
import {
  Container,
  Box,
  Typography,
  TextField,
  Button,
  MenuItem
} from '@mui/material';
import axiosClient from '../api/axiosClient';

export default function EquipmentDelivery() {
  const [remissionId, setRemissionId] = useState('');
  const [remissionData, setRemissionData] = useState(null);
  const [message, setMessage] = useState('');
  const [deliveryMethod, setDeliveryMethod] = useState('');

  const formatMoney = (value) => {
    if (value == null) return '';
    return new Intl.NumberFormat('es-CO', {
      style: 'currency',
      currency: 'COP'
    }).format(value);
  };

  const handleSearch = async (e) => {
    e.preventDefault();
    try {
      const response = await axiosClient.get(`/remissions/${remissionId}`);
      setRemissionData(response.data);
      setMessage('');
    } catch {
      setRemissionData(null);
      setMessage('No se encontró la remisión');
    }
  };

  const handleDeliver = async () => {
    try {
      const { data } = await axiosClient.put(
        `/remissions/deliver/${remissionData.remissionId}`,
        { metodoSaldo: deliveryMethod }
      );
      setRemissionData(data);
      setMessage('Equipo entregado correctamente.');
    } catch {
      setMessage('Error al entregar equipo');
    }
  };

  return (
    <Box
      sx={{
        minHeight: '100vh',
        backgroundImage: 'url("https://medicalmuneras.com/wp-content/uploads/2023/04/Imagen-1_auto_x2-scaled.jpg")',
        backgroundSize: 'cover',
        backgroundRepeat: 'no-repeat',
        backgroundPosition: 'center',
        py: 4,
        px: 2
      }}
    >
      <Container
        maxWidth="sm"
        sx={{ backgroundColor: 'rgba(255,255,255,0.8)', p: 3, borderRadius: 2 }}
      >
        <Typography variant="h5" align="center" gutterBottom>
          Entrega de equipo
        </Typography>
        <Box
          component="form"
          onSubmit={handleSearch}
          sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}
        >
          <TextField
            label="ID de Remisión"
            value={remissionId}
            onChange={(e) => setRemissionId(e.target.value)}
            fullWidth
            required
          />
          <Button type="submit" variant="contained" fullWidth>
            Buscar remisión
          </Button>
        </Box>

        {message && (
          <Typography
            variant="body2"
            color="error"
            align="center"
            sx={{ mt: 2 }}
          >
            {message}
          </Typography>
        )}

        {remissionData && (
          <Box sx={{ mt: 3 }}>
            <Typography variant="h6">Detalles de la Remisión</Typography>
            <Typography>ID: {remissionData.remissionId}</Typography>
            <Typography>Total: {formatMoney(remissionData.totalValue)}</Typography>
            <Typography>
              Fecha de Ingreso:{' '}
              {new Date(remissionData.createdAt).toLocaleString()}
            </Typography>
            <Typography>
              Abono: {formatMoney(remissionData.depositValue)}
            </Typography>
            <Typography>
              Método de abono:{' '}
              {remissionData.metodoAbono || 'N/A'}
            </Typography>
            <Typography
              sx={{
                color: remissionData.fechaSalida ? 'green' : 'red',
                fontWeight: 'bold'
              }}
            >
              Saldo: {formatMoney(remissionData.saldo)}
            </Typography>

            {!remissionData.fechaSalida ? (
              <>
                <TextField
                  select
                  label="Método de pago del saldo"
                  value={deliveryMethod}
                  onChange={(e) => setDeliveryMethod(e.target.value)}
                  fullWidth
                  required
                  sx={{ mt: 2 }}
                >
                  <MenuItem value="Efectivo">Efectivo</MenuItem>
                  <MenuItem value="Tarjeta">Tarjeta</MenuItem>
                  <MenuItem value="Transferencia">Transferencia</MenuItem>
                </TextField>
                <Button
                  onClick={handleDeliver}
                  variant="contained"
                  fullWidth
                  sx={{ mt: 2 }}
                >
                  Sacar equipo
                </Button>
              </>
            ) : (
              <>
                <Typography>
                  Método de pago del saldo:{' '}
                  {remissionData.metodoSaldo}
                </Typography>
                <Typography>
                  Fecha de Salida:{' '}
                  {new Date(remissionData.fechaSalida).toLocaleString()}
                </Typography>
              </>
            )}
          </Box>
        )}
      </Container>
    </Box>
  );
}
