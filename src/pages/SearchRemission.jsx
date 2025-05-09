// src/components/SearchRemission.jsx
import React, { useState, useEffect, useCallback } from 'react';
import {
  Container,
  Box,
  Typography,
  TextField,
  Button,
  MenuItem,
  Grid,
  Stack,
  Dialog,
  DialogTitle,
  DialogActions
} from '@mui/material';
import { useLocation } from 'react-router-dom';
import axiosClient from '../api/axiosClient';

export default function SearchRemission() {
  const location = useLocation();
  const initialId = location.state?.remissionId || '';
  const [remissionId, setRemissionId] = useState(initialId);
  const [remissionData, setRemissionData] = useState(null);
  const [message, setMessage] = useState('');
  const [deliveryMethod, setDeliveryMethod] = useState('');
  const [originalHasGarantia, setOriginalHasGarantia] = useState(false);
  const [openDropDialog, setOpenDropDialog] = useState(false);

  const formatMoney = val =>
    val == null
      ? ''
      : new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP' }).format(val);

  const fetchById = useCallback(async (id) => {
    setMessage('');
    setOriginalHasGarantia(false);
    try {
      const { data } = await axiosClient.get(`/remissions/${id}`);
      setRemissionData(data);
      if (!id.endsWith('-G')) {
        try {
          await axiosClient.get(`/remissions/${id}-G`);
          setOriginalHasGarantia(true);
        } catch {}
      }
    } catch (err) {
      setRemissionData(null);
      setMessage(
        err.response?.status === 404
          ? 'No se encontró la remisión'
          : 'Error al comunicar con el servidor'
      );
    }
  }, []);

  useEffect(() => {
    if (initialId) fetchById(initialId);
  }, [initialId, fetchById]);

  const handleSearch = e => {
    e?.preventDefault();
    fetchById(remissionId);
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

  const confirmDrop = async (cobrarRevision) => {
    setOpenDropDialog(false);
    try {
      const { data } = await axiosClient.put(
        `/remissions/${remissionData.remissionId}/dar-baja`,
        { cobrarRevision }
      );
      setRemissionData(data);
      setMessage(
        cobrarRevision
          ? 'Remisión dada de baja con cobro de revisión.'
          : 'Remisión dada de baja sin cobro.'
      );
    } catch (e) {
      setMessage(e.response?.data || 'Error al dar de baja la remisión');
    }
  };

  const handleGarantia = async () => {
    try {
      await axiosClient.put(`/remissions/${remissionData.remissionId}/garantia`);
      const idG = `${remissionData.remissionId}-G`;
      setRemissionId(idG);
      setOriginalHasGarantia(true);
      await fetchById(idG);
      setMessage('');
    } catch (e) {
      setMessage(e.response?.data || 'Error al ingresar garantía');
    }
  };

  const handleSacarGarantia = async () => {
    try {
      const { data } = await axiosClient.put(
        `/remissions/${remissionData.remissionId}/garantia/sacar`
      );
      setRemissionData(data);
      setMessage('Garantía cerrada exitosamente.');
    } catch {
      setMessage('Error al cerrar garantía');
    }
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
        p: 4
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
            onChange={e => setRemissionId(e.target.value)}
            fullWidth
            required
          />
          <Button type="submit" variant="contained" fullWidth>
            Buscar remisión
          </Button>
        </Box>

        {message && (
          <Typography color="error" align="center" sx={{ mt: 2 }}>
            {message}
          </Typography>
        )}

        {remissionData && (
          <>
            {/* Estado */}
            <Box sx={{ textAlign: 'center', mt: 2 }}>
              <Typography
                sx={{
                  fontWeight: 'bold',
                  color: remissionData.fechaSalida ? 'green' : 'red',
                  textTransform: 'uppercase'
                }}
              >
                {remissionData.remissionId.endsWith('-G')
                  ? (remissionData.fechaSalida ? 'GARANTÍA ENTREGADA' : 'GARANTÍA PENDIENTE')
                  : (remissionData.fechaSalida ? 'ENTREGADO' : 'PENDIENTE')}
              </Typography>
            </Box>

            {/* Datos */}
            <Grid container spacing={1} sx={{ mt: 2 }}>
              <Grid item xs={4}><strong>ID:</strong></Grid>
              <Grid item xs={8}>{remissionData.remissionId}</Grid>

              <Grid item xs={4}><strong>Fecha ingreso:</strong></Grid>
              <Grid item xs={8}>
                {new Date(remissionData.createdAt).toLocaleString()}
              </Grid>

              {!remissionData.remissionId.endsWith('-G') && (
                <>
                  <Grid item xs={4}><strong>Total:</strong></Grid>
                  <Grid item xs={8}>{formatMoney(remissionData.totalValue)}</Grid>

                  <Grid item xs={4}><strong>Abono:</strong></Grid>
                  <Grid item xs={8}>{formatMoney(remissionData.depositValue)}</Grid>

                  <Grid item xs={4}><strong>Método abono:</strong></Grid>
                  <Grid item xs={8}>{remissionData.metodoAbono || 'N/A'}</Grid>

                  <Grid item xs={4}><strong>Saldo:</strong></Grid>
                  <Grid item xs={8}>{formatMoney(remissionData.saldo)}</Grid>

                  {remissionData.fechaSalida && (
                    <>
                      <Grid item xs={4}><strong>Método pago saldo:</strong></Grid>
                      <Grid item xs={8}>{remissionData.metodoSaldo}</Grid>

                      <Grid item xs={4}><strong>Fecha salida:</strong></Grid>
                      <Grid item xs={8}>
                        {new Date(remissionData.fechaSalida).toLocaleString()}
                      </Grid>
                    </>
                  )}
                </>
              )}

              {remissionData.remissionId.endsWith('-G') && remissionData.fechaSalida && (
                <>
                  <Grid item xs={4}><strong>Fecha salida:</strong></Grid>
                  <Grid item xs={8}>
                    {new Date(remissionData.fechaSalida).toLocaleString()}
                  </Grid>
                </>
              )}
            </Grid>

            {/* Acciones */}
            <Stack spacing={2} sx={{ mt: 3 }}>
              {!remissionData.fechaSalida && !remissionData.remissionId.endsWith('-G') && (
                <>
                  {/* Sacar equipo */}
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
                  <Button variant="contained" onClick={handleDeliver}>
                    Sacar equipo
                  </Button>

                  {/* Dar de baja */}
                  <Button
                    variant="outlined"
                    color="error"
                    onClick={() => setOpenDropDialog(true)}
                  >
                    Dar de baja
                  </Button>
                </>
              )}

              {/* Ingresar garantía */}
              {!remissionData.remissionId.endsWith('-G') &&
                remissionData.fechaSalida &&
                !originalHasGarantia && (
                  <Button variant="outlined" color="secondary" onClick={handleGarantia}>
                    Ingresar garantía
                  </Button>
                )}

              {/* Ir a garantía existente */}
              {originalHasGarantia && !remissionData.remissionId.endsWith('-G') && (
                <Button
                  variant="contained"
                  onClick={() => {
                    const idG = `${remissionData.remissionId}-G`;
                    setRemissionId(idG);
                    fetchById(idG);
                  }}
                >
                  Ir a garantía
                </Button>
              )}

              {/* Sacar garantía (-G) */}
              {remissionData.remissionId.endsWith('-G') && !remissionData.fechaSalida && (
                <Button variant="outlined" color="error" onClick={handleSacarGarantia}>
                  Sacar garantía
                </Button>
              )}
            </Stack>
          </>
        )}
      </Container>

      {/* Diálogo de tipo de baja */}
      <Dialog
        open={openDropDialog}
        onClose={() => setOpenDropDialog(false)}
      >
        <DialogTitle>¿Cómo deseas dar de baja?</DialogTitle>
        <DialogActions>
          <Button onClick={() => confirmDrop(true)}>Cobrar revisión</Button>
          <Button onClick={() => confirmDrop(false)}>Sin cobro</Button>
          <Button onClick={() => setOpenDropDialog(false)}>Cancelar</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
