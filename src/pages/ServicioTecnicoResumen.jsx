import React, { useEffect, useState } from 'react';
import {
  Alert,
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  Container,
  Grid,
  Stack,
  TextField,
  Typography,
} from '@mui/material';
import PendingActionsOutlinedIcon from '@mui/icons-material/PendingActionsOutlined';
import AssignmentTurnedInOutlinedIcon from '@mui/icons-material/AssignmentTurnedInOutlined';
import ReportProblemOutlinedIcon from '@mui/icons-material/ReportProblemOutlined';
import axiosClient from '../api/axiosClient';
import { useLocation } from 'react-router-dom';

const formatMoney = (value) =>
  new Intl.NumberFormat('es-CO', {
    style: 'currency',
    currency: 'COP',
    maximumFractionDigits: 0,
  }).format(value || 0);

const formatDateTime = (value) => {
  if (!value) return 'Pendiente';
  return new Intl.DateTimeFormat('es-CO', {
    dateStyle: 'medium',
    timeStyle: 'short',
  }).format(new Date(value));
};

const normalizeState = (value) => {
  if (!value) return { label: 'Sin validar', color: 'default' };
  if (String(value).toLowerCase() === 'ok') {
    return { label: 'Ok', color: 'success' };
  }
  return { label: value, color: 'warning' };
};

const getRecordStatus = (record) => {
  if (record.dadoBaja) {
    return {
      label: 'Dado de baja',
      color: 'error',
      icon: <ReportProblemOutlinedIcon fontSize="small" />,
    };
  }

  const checkpoints = [
    record.revision,
    record.mantenimiento,
    record.limpieza,
    record.calibracion,
  ];

  const ready = checkpoints.every((item) => String(item || '').toLowerCase() === 'ok');

  return ready
    ? {
        label: 'Listo',
        color: 'success',
        icon: <AssignmentTurnedInOutlinedIcon fontSize="small" />,
      }
    : {
        label: 'En proceso',
        color: 'warning',
        icon: <PendingActionsOutlinedIcon fontSize="small" />,
      };
};

export default function ServicioTecnicoResumen() {
  const location = useLocation();
  const initialId = location.state?.remissionId || '';

  const [remissionId, setRemissionId] = useState(initialId);
  const [remissionData, setRemissionData] = useState(null);
  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const fetchSummary = async (id) => {
    if (!id) return;

    setLoading(true);
    setError('');
    try {
      const { data } = await axiosClient.get(`/remissions/${id}`);
      const technicalRes = await axiosClient.get(`/remissions/${id}/technical-records`);
      setRemissionData(data);
      setRecords(technicalRes.data || []);
    } catch (e) {
      setRemissionData(null);
      setRecords([]);
      const status = e.response?.status;
      if (status === 400 || status === 404) {
        setError('No se encontró la remisión solicitada.');
      } else {
        setError('No fue posible cargar el resumen técnico.');
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (initialId) {
      fetchSummary(initialId);
    }
  }, [initialId]);

  const activeRecords = records.filter((record) => !record.dadoBaja);
  const readyCount = activeRecords.filter((record) => getRecordStatus(record).label === 'Listo').length;
  const saldoPagar =
    remissionData?.saldo ??
    ((remissionData?.totalValue || 0) - (remissionData?.depositValue || 0));

  return (
    <Box sx={{ py: 5 }}>
      <Container maxWidth="lg">
        <Box
          sx={{
            p: { xs: 2.5, md: 3 },
            borderRadius: 3,
            background: '#ffffff',
            mb: 4,
            border: '1px solid rgba(148, 163, 184, 0.20)',
            boxShadow: '0 10px 24px rgba(15, 23, 42, 0.08)',
          }}
        >
          <Typography variant="h6" sx={{ fontWeight: 700, mb: 1.5 }}>
            Consultar remisión
          </Typography>

          <Stack
            component="form"
            direction={{ xs: 'column', sm: 'row' }}
            spacing={2}
            onSubmit={(e) => {
              e.preventDefault();
              fetchSummary(remissionId);
            }}
          >
            <TextField
              label="Código de remisión"
              value={remissionId}
              onChange={(e) => setRemissionId(e.target.value)}
              fullWidth
              InputLabelProps={{ shrink: true }}
              sx={{
                background: '#ffffff',
                borderRadius: 2,
              }}
            />
            <Button
              type="submit"
              variant="contained"
              disabled={loading}
              sx={{
                minWidth: 170,
                fontWeight: 700,
              }}
            >
              {loading ? 'Consultando...' : 'Ver resumen'}
            </Button>
          </Stack>
        </Box>

        {error && (
          <Alert severity="error" sx={{ mb: 3, borderRadius: 3 }}>
            {error}
          </Alert>
        )}

        {remissionData && (
          <>
            <Card
              sx={{
                mb: 3,
                borderRadius: 4,
                boxShadow: '0 14px 36px rgba(15, 23, 42, 0.10)',
                border: '1px solid rgba(148, 163, 184, 0.20)',
              }}
            >
              <CardContent sx={{ p: { xs: 2.2, md: 2.8 } }}>
                <Typography variant="h5" sx={{ fontWeight: 800, mb: 1 }}>
                  Equipos y estado del servicio
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                  Remisión {remissionData.remissionId} con el resumen de avance técnico y estado de pago.
                </Typography>
                <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
                  <Chip label={`Equipos: ${records.length}`} color="primary" variant="outlined" />
                  <Chip label={`Equipos listos: ${readyCount}`} color="success" variant="outlined" />
                  <Chip label={`Abono: ${formatMoney(remissionData.depositValue)}`} color="info" variant="outlined" />
                  <Chip label={`Saldo a pagar: ${formatMoney(saldoPagar)}`} color="warning" variant="filled" />
                </Stack>
              </CardContent>
            </Card>

            <Grid container spacing={3}>
              {records.length > 0 ? (
                records.map((record) => {
                  const status = getRecordStatus(record);
                  const revisionState = normalizeState(record.revision);
                  const mantenimientoState = normalizeState(record.mantenimiento);
                  const limpiezaState = normalizeState(record.limpieza);
                  const calibracionState = normalizeState(record.calibracion);

                  return (
                    <Grid item xs={12} md={6} lg={4} key={record.id}>
                      <Card
                        sx={{
                          height: '100%',
                          borderRadius: 4,
                          border: '1px solid rgba(148, 163, 184, 0.18)',
                          boxShadow: '0 12px 32px rgba(15, 23, 42, 0.08)',
                          overflow: 'hidden',
                        }}
                      >
                        <Box
                          sx={{
                            px: 2.5,
                            py: 2,
                            background: status.color === 'success'
                              ? 'linear-gradient(135deg, #dcfce7 0%, #f0fdf4 100%)'
                              : status.color === 'error'
                                ? 'linear-gradient(135deg, #fee2e2 0%, #fff1f2 100%)'
                                : 'linear-gradient(135deg, #fef3c7 0%, #fff7ed 100%)',
                          }}
                        >
                          <Stack direction="row" justifyContent="space-between" alignItems="center" spacing={2}>
                            <Box>
                              <Typography variant="overline" sx={{ opacity: 0.7 }}>
                                Equipo
                              </Typography>
                              <Typography variant="h6" sx={{ fontWeight: 800, lineHeight: 1.2 }}>
                                {record.equipo || 'Sin definir'}
                              </Typography>
                              <Typography variant="body2" color="text.secondary">
                                {record.marca || 'Marca no registrada'}
                              </Typography>
                            </Box>
                            <Chip
                              icon={status.icon}
                              label={status.label}
                              color={status.color}
                              variant={status.color === 'warning' ? 'outlined' : 'filled'}
                            />
                          </Stack>
                        </Box>

                        <CardContent sx={{ p: 2.5 }}>
                          <Stack spacing={2}>
                            <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
                              <Chip label={`Serial: ${record.serial || 'No registrado'}`} variant="outlined" size="small" />
                              <Chip label={`Valor: ${formatMoney(record.valor)}`} variant="outlined" size="small" />
                              {record.brazalete && <Chip label={`Brazalete: ${record.brazalete}`} size="small" />}
                              {record.pilas && <Chip label={`Pilas: ${record.pilas}`} size="small" />}
                            </Stack>

                            <Box>
                              <Typography variant="subtitle2" sx={{ fontWeight: 700, mb: 1 }}>
                                Progreso técnico
                              </Typography>
                              <Grid container spacing={1}>
                                <Grid item xs={6}>
                                  <Chip fullWidth label={`Revisión: ${revisionState.label}`} color={revisionState.color} size="small" />
                                </Grid>
                                <Grid item xs={6}>
                                  <Chip fullWidth label={`Mantenimiento: ${mantenimientoState.label}`} color={mantenimientoState.color} size="small" />
                                </Grid>
                                <Grid item xs={6}>
                                  <Chip fullWidth label={`Limpieza: ${limpiezaState.label}`} color={limpiezaState.color} size="small" />
                                </Grid>
                                <Grid item xs={6}>
                                  <Chip fullWidth label={`Calibración: ${calibracionState.label}`} color={calibracionState.color} size="small" />
                                </Grid>
                              </Grid>
                            </Box>

                            {record.notasDiagnostico && (
                              <Box
                                sx={{
                                  p: 1.5,
                                  borderRadius: 3,
                                  backgroundColor: '#f8fafc',
                                  border: '1px solid #e2e8f0',
                                }}
                              >
                                <Typography variant="subtitle2" sx={{ fontWeight: 700, mb: 0.5 }}>
                                  Resumen técnico
                                </Typography>
                                <Typography variant="body2" color="text.secondary">
                                  {record.notasDiagnostico}
                                </Typography>
                              </Box>
                            )}

                            {record.dadoBaja && (
                              <Alert severity="warning" sx={{ borderRadius: 3 }}>
                                Este equipo fue dado de baja{record.fechaBaja ? ` el ${formatDateTime(record.fechaBaja)}` : ''}.
                                {typeof record.revisionValor === 'number' ? ` Revisión cobrada: ${formatMoney(record.revisionValor)}.` : ''}
                              </Alert>
                            )}
                          </Stack>
                        </CardContent>
                      </Card>
                    </Grid>
                  );
                })
              ) : (
                <Grid item xs={12}>
                  <Alert severity="info" sx={{ borderRadius: 3 }}>
                    Esta remisión aún no tiene equipos cargados en servicio técnico.
                  </Alert>
                </Grid>
              )}
            </Grid>
          </>
        )}
      </Container>
    </Box>
  );
}