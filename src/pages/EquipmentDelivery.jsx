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
  const [isSubmitting, setIsSubmitting] = useState(false);

  const formatMoney = (value) => {
    if (value == null) return '';
    return new Intl.NumberFormat('es-CO', {
      style: 'currency',
      currency: 'COP'
    }).format(value);
  };

  const calcSaldo = (r) => {
    if (!r) return 0;
    if (typeof r.saldo === 'number') return r.saldo;
    const tv = typeof r.totalValue === 'number' ? r.totalValue : Number(r.totalValue || 0);
    const dv = typeof r.depositValue === 'number' ? r.depositValue : Number(r.depositValue || 0);
    const s  = tv - dv;
    return isNaN(s) ? 0 : s;
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
          : (err.response?.data?.message || 'Error al comunicar con el servidor')
      );
      setRemissionData(null);
    }
  };

  const handleDeliverOrGarantia = async () => {
    if (!remissionData) return;
    setMessage('');
    setIsSubmitting(true);
    try {
      let resp;
      if (isGarantia) {
        resp = await axiosClient.put(
          `/remissions/${remissionData.remissionId}/garantia`
        );
        setMessage('Garantía ingresada correctamente.');
      } else {
        const saldo = calcSaldo(remissionData);
        if (saldo > 0 && !deliveryMethod) {
          setSeverity('error');
          setMessage('Debe seleccionar el método de pago del saldo.');
          setIsSubmitting(false);
          return;
        }
        resp = await axiosClient.put(
          `/remissions/deliver/${remissionData.remissionId}`,
          { metodoSaldo: deliveryMethod || null }
        );
        setMessage('Equipo entregado correctamente.');
      }
      setSeverity('success');
      setRemissionData(resp.data);
      if (isGarantia && resp.data?.remissionId) {
        setRemissionId(resp.data.remissionId);
      }
    } catch (err) {
      setSeverity('error');
      const errMsg = err.response?.data?.message || err.message || '';
      setMessage(
        isGarantia
          ? (errMsg || 'Error al ingresar garantía.')
          : (errMsg || 'Error al entregar equipo.')
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const saldo = calcSaldo(remissionData);
  const requiresPayment = !isGarantia && !remissionData?.fechaSalida && saldo > 0;

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
          <Button type="submit" variant="contained" fullWidth disabled={isSubmitting}>
            {isSubmitting ? 'Buscando…' : 'Buscar remisión'}
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
                color: remissionData.fechaSalida ? 'green' : (saldo > 0 ? 'red' : 'inherit')
              }}
            >
              <strong>Saldo:</strong> {formatMoney(saldo)}
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

                {requiresPayment && (
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
                  disabled={isSubmitting || (requiresPayment && !deliveryMethod)}
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
