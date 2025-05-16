// src/pages/EquipmentDelivery.jsx

import React, { useState } from 'react';
import {
  Box,
  Container,
  Typography,
  TextField,
  Button,
  MenuItem,
  Alert,
  Checkbox,
  FormControlLabel
} from '@mui/material';
import axiosClient from '../api/axiosClient';

export default function EquipmentDelivery() {
  const [remissionId, setRemissionId] = useState('');
  const [remissionData, setRemissionData] = useState(null);
  const [message, setMessage] = useState('');
  const [severity, setSeverity] = useState('success');
  const [deliveryMethod, setDeliveryMethod] = useState('');
  const [isGarantia, setIsGarantia] = useState(false);

  const formatMoney = (value) => {
    if (value == null) return '';
    return new Intl.NumberFormat('es-CO', {
      style: 'currency',
      currency: 'COP'
    }).format(value);
  };

  const handleSearch = async (e) => {
    e.preventDefault();
    setMessage('');
    try {
      const { data } = await axiosClient.get(`/remissions/${remissionId}`);
      setRemissionData(data);
    } catch (err) {
      setSeverity('error');
      setMessage(
        err.response?.status === 404
          ? 'No se encontró la remisión'
          : 'Error al comunicar con el servidor'
      );
      setRemissionData(null);
    }
  };

  const handleDeliverOrGarantia = async () => {
    setMessage('');
    try {
      let data;
      if (isGarantia) {
        // Ingreso de garantía
        ({ data } = await axiosClient.put(
          `/remissions/${remissionData.remissionId}/garantia`
        ));
        setMessage('Garantía ingresada correctamente.');
      } else {
        // Entrega de equipo
        ({ data } = await axiosClient.put(
          `/remissions/deliver/${remissionData.remissionId}`,
          { metodoSaldo: deliveryMethod }
        ));
        setMessage('Equipo entregado correctamente.');
      }
      setSeverity('success');
      setRemissionData(data);
      // Si acabas de ingresar garantía, actualiza el ID en el input
      if (isGarantia) {
        setRemissionId(data.remissionId);
      }
    } catch (err) {
      setSeverity('error');
      const errMsg = err.response?.data?.message || '';
      setMessage(
        isGarantia
          ? errMsg || 'Error al ingresar garantía.'
          : errMsg || 'Error al entregar equipo.'
      );
    }
  };

  return (
    <Box sx={{ minHeight: '100vh', py: 4, background: '#f5f5f5' }}>
      <Container maxWidth="sm" sx={{ bgcolor: '#fff', p: 4, borderRadius: 2 }}>
        <Typography variant="h5" align="center" gutterBottom>
          Entrega de equipo / Garantía
        </Typography>

        {message && (
          <Alert severity={severity} sx={{ mb: 2 }}>
            {message}
          </Alert>
        )}

        <Box
          component="form"
          onSubmit={handleSearch}
          sx={{ display: 'flex', flexDirection: 'column', gap: 2, mb: 3 }}
        >
          <TextField
            label="ID de Remisión"
            value={remissionId}
            onChange={e => setRemissionId(e.target.value)}
            fullWidth
            required
          />
          <Button type="submit" variant="contained" fullWidth>
            Buscar remisión
          </Button>
        </Box>

        {remissionData && (
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            <Typography><strong>ID:</strong> {remissionData.remissionId}</Typography>
            <Typography>
              <strong>Total:</strong> {formatMoney(remissionData.totalValue)}
            </Typography>
            <Typography>
              <strong>Abono:</strong> {formatMoney(remissionData.depositValue)}
            </Typography>
            <Typography>
              <strong>Método de abono:</strong> {remissionData.metodoAbono || 'N/A'}
            </Typography>
            <Typography
              sx={{
                fontWeight: 'bold',
                color: remissionData.fechaSalida ? 'green' : 'red'
              }}
            >
              <strong>Saldo:</strong> {formatMoney(remissionData.saldo)}
            </Typography>

            {remissionData.fechaSalida && (
              <>
                <Typography>
                  <strong>Método de pago del saldo:</strong> {remissionData.metodoSaldo}
                </Typography>
                <Typography>
                  <strong>Fecha de salida:</strong>{' '}
                  {new Date(remissionData.fechaSalida).toLocaleString()}
                </Typography>
              </>
            )}

            {!remissionData.fechaSalida && (
              <>
                <FormControlLabel
                  control={
                    <Checkbox
                      checked={isGarantia}
                      onChange={e => setIsGarantia(e.target.checked)}
                    />
                  }
                  label="Ingresar como garantía"
                />

                {!isGarantia && (
                  <TextField
                    select
                    label="Método de pago del saldo"
                    value={deliveryMethod}
                    onChange={e => setDeliveryMethod(e.target.value)}
                    fullWidth
                    required
                  >
                    <MenuItem value="Efectivo">Efectivo</MenuItem>
                    <MenuItem value="Tarjeta">Tarjeta</MenuItem>
                    <MenuItem value="Transferencia">Transferencia</MenuItem>
                  </TextField>
                )}

                <Button
                  variant="contained"
                  onClick={handleDeliverOrGarantia}
                  fullWidth
                >
                  {isGarantia ? 'Ingresar garantía' : 'Sacar equipo'}
                </Button>
              </>
            )}
          </Box>
        )}
      </Container>
    </Box>
  );
}
