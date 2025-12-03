import { useState } from 'react';
import {
  Container,
  Box,
  Typography,
  TextField,
  Button,
  Stack,
  Grid,
  Card,
  CardContent,
} from '@mui/material';
import axiosClient from '../api/axiosClient';

export default function VolumeReportPage() {
  const [from, setFrom] = useState('');
  const [to, setTo] = useState('');
  const [periodType, setPeriodType] = useState('custom');
  const [selectedDate, setSelectedDate] = useState('');
  const [selectedWeek, setSelectedWeek] = useState('');
  const [selectedMonth, setSelectedMonth] = useState('');

  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const pad = (n) => String(n).padStart(2, '0');
  const formatYYYYMMDD = (d) =>
    `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;

  const getMondayFromWeekString = (weekStr) => {
    if (!weekStr || !weekStr.includes('-W')) return null;
    const [yearStr, weekPart] = weekStr.split('-W');
    const year = parseInt(yearStr, 10);
    const week = parseInt(weekPart, 10);

    const simple = new Date(year, 0, 1 + (week - 1) * 7);
    const dayOfWeek = simple.getDay();
    const monday = new Date(simple);
    const diff = dayOfWeek === 0 ? -6 : 1 - dayOfWeek;
    monday.setDate(simple.getDate() + diff);
    monday.setHours(0, 0, 0, 0);
    return monday;
  };

  const computeRange = () => {
    if (periodType === 'custom') {
      if (!from || !to) {
        throw new Error('Debes seleccionar "Desde" y "Hasta" en modo Personalizado.');
      }
      if (new Date(from) > new Date(to)) {
        throw new Error('"Desde" no puede ser mayor que "Hasta".');
      }
      return { fromFinal: from, toFinal: to };
    }

    if (periodType === 'day') {
      if (!selectedDate) throw new Error('Selecciona una fecha (Día).');
      const fromFinal = `${selectedDate}T00:01`;
      const toFinal = `${selectedDate}T23:59`;
      return { fromFinal, toFinal };
    }

    if (periodType === 'week') {
      if (!selectedWeek) throw new Error('Selecciona una semana.');
      const monday = getMondayFromWeekString(selectedWeek);
      if (!monday) throw new Error('Semana inválida.');

      const sunday = new Date(monday);
      sunday.setDate(monday.getDate() + 6);

      const fromFinal = `${formatYYYYMMDD(monday)}T00:01`;
      const toFinal = `${formatYYYYMMDD(sunday)}T23:59`;
      return { fromFinal, toFinal };
    }

    if (periodType === 'month') {
      if (!selectedMonth) throw new Error('Selecciona un mes.');
      const [yearStr, monthStr] = selectedMonth.split('-');
      const year = parseInt(yearStr, 10);
      const monthNum = parseInt(monthStr, 10);

      const firstDay = new Date(year, monthNum - 1, 1);
      const lastDay = new Date(year, monthNum, 0);

      const fromFinal = `${formatYYYYMMDD(firstDay)}T00:01`;
      const toFinal = `${formatYYYYMMDD(lastDay)}T23:59`;
      return { fromFinal, toFinal };
    }

    return { fromFinal: from, toFinal: to };
  };

  const handleGenerate = async () => {
    setLoading(true);
    setError('');
    try {
      const { fromFinal, toFinal } = computeRange();
      setFrom(fromFinal);
      setTo(toFinal);

      const params = { from: fromFinal, to: toFinal };

      // Llamamos al endpoint único de KPIs
      const respSummary = await axiosClient.get('/reports/remissions/summary', {
        params,
      });
      setSummary(respSummary.data);
    } catch (e) {
      console.error(e);
      setError(
        e.response?.data?.message || e.message || 'Error generando reporte de KPIs'
      );
      setSummary(null);
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (value) =>
    new Intl.NumberFormat('es-CO', {
      style: 'currency',
      currency: 'COP',
    }).format(value || 0);

  return (
    <Container
      maxWidth="lg"
      sx={{
        mt: 4,
        pb: (theme) => `calc(${theme.spacing(4)} + 80px)`,
      }}
    >
      <Typography variant="h4" gutterBottom>
        Reporte de KPIs (Remisiones &amp; Ventas)
      </Typography>

      {/* Filtros de fecha */}
      <Stack
        direction={{ xs: 'column', sm: 'row' }}
        spacing={2}
        sx={{ mb: 2 }}
        alignItems="center"
      >
        <TextField
          select
          label="Periodo"
          value={periodType}
          onChange={(e) => setPeriodType(e.target.value)}
          SelectProps={{ native: true }}
          InputLabelProps={{ shrink: true }}
          fullWidth
        >
          <option value="custom">Personalizado</option>
          <option value="day">Día</option>
          <option value="week">Semana</option>
          <option value="month">Mes</option>
        </TextField>

        {periodType === 'custom' && (
          <>
            <TextField
              label="Desde"
              type="datetime-local"
              value={from}
              onChange={(e) => setFrom(e.target.value)}
              InputLabelProps={{ shrink: true }}
              fullWidth
            />
            <TextField
              label="Hasta"
              type="datetime-local"
              value={to}
              onChange={(e) => setTo(e.target.value)}
              InputLabelProps={{ shrink: true }}
              fullWidth
            />
          </>
        )}

        {periodType === 'day' && (
          <TextField
            label="Fecha"
            type="date"
            value={selectedDate}
            onChange={(e) => setSelectedDate(e.target.value)}
            InputLabelProps={{ shrink: true }}
            fullWidth
          />
        )}

        {periodType === 'week' && (
          <TextField
            label="Semana"
            type="week"
            value={selectedWeek}
            onChange={(e) => setSelectedWeek(e.target.value)}
            InputLabelProps={{ shrink: true }}
            fullWidth
          />
        )}

        {periodType === 'month' && (
          <TextField
            label="Mes"
            type="month"
            value={selectedMonth}
            onChange={(e) => setSelectedMonth(e.target.value)}
            InputLabelProps={{ shrink: true }}
            fullWidth
          />
        )}

        <Button
          variant="contained"
          onClick={handleGenerate}
          disabled={loading}
          size="large"
          sx={{ minWidth: 120 }}
        >
          {loading ? 'Generando…' : 'Generar'}
        </Button>
      </Stack>

      {error && (
        <Typography color="error" sx={{ mb: 2 }}>
          {error}
        </Typography>
      )}

      {/* KPIs */}
      {summary && (
        <Box sx={{ mt: 3 }}>
          {/* Sección Remisiones */}
          <Typography variant="h5" gutterBottom>
            Remisiones
          </Typography>
          <Grid container spacing={2} sx={{ mb: 4 }}>
            <Grid item xs={12} sm={6} md={3}>
              <Card>
                <CardContent>
                  <Typography variant="subtitle2">
                    Número de remisiones
                  </Typography>
                  <Typography variant="h6">
                    {summary.remisiones?.totalRemisiones ?? 0}
                  </Typography>
                </CardContent>
              </Card>
            </Grid>

            <Grid item xs={12} sm={6} md={3}>
              <Card>
                <CardContent>
                  <Typography variant="subtitle2">Equipos totales</Typography>
                  <Typography variant="h6">
                    {summary.remisiones?.totalEquipos ?? 0}
                  </Typography>
                </CardContent>
              </Card>
            </Grid>

            <Grid item xs={12} sm={6} md={3}>
              <Card>
                <CardContent>
                  <Typography variant="subtitle2">
                    Ingresos por remisiones
                  </Typography>
                  <Typography variant="h6">
                    {formatCurrency(
                      summary.remisiones?.totalValorRemisiones ?? 0
                    )}
                  </Typography>
                </CardContent>
              </Card>
            </Grid>

            <Grid item xs={12} sm={6} md={3}>
              <Card>
                <CardContent>
                  <Typography variant="subtitle2">
                    Ticket promedio por remisión
                  </Typography>
                  <Typography variant="h6">
                    {formatCurrency(
                      summary.remisiones?.ticketPromedioRemision ?? 0
                    )}
                  </Typography>
                </CardContent>
              </Card>
            </Grid>

            <Grid item xs={12} sm={6} md={3}>
              <Card>
                <CardContent>
                  <Typography variant="subtitle2">
                    Unidades promedio por remisión
                  </Typography>
                  <Typography variant="h6">
                    {summary.remisiones?.unidadesPromedioPorRemision?.toFixed
                      ? summary.remisiones.unidadesPromedioPorRemision.toFixed(2)
                      : summary.remisiones?.unidadesPromedioPorRemision ?? 0}
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
          </Grid>

          {/* Sección Ventas */}
          <Typography variant="h5" gutterBottom>
            Ventas
          </Typography>
          <Grid container spacing={2} sx={{ mb: 4 }}>
            <Grid item xs={12} sm={6} md={3}>
              <Card>
                <CardContent>
                  <Typography variant="subtitle2">
                    Número de transacciones
                  </Typography>
                  <Typography variant="h6">
                    {summary.ventas?.totalTransacciones ?? 0}
                  </Typography>
                </CardContent>
              </Card>
            </Grid>

            <Grid item xs={12} sm={6} md={3}>
              <Card>
                <CardContent>
                  <Typography variant="subtitle2">
                    Productos totales (unidades)
                  </Typography>
                  <Typography variant="h6">
                    {summary.ventas?.productosTotales ?? 0}
                  </Typography>
                </CardContent>
              </Card>
            </Grid>

            <Grid item xs={12} sm={6} md={3}>
              <Card>
                <CardContent>
                  <Typography variant="subtitle2">
                    Ingresos por ventas
                  </Typography>
                  <Typography variant="h6">
                    {formatCurrency(summary.ventas?.totalVentas ?? 0)}
                  </Typography>
                </CardContent>
              </Card>
            </Grid>

            <Grid item xs={12} sm={6} md={3}>
              <Card>
                <CardContent>
                  <Typography variant="subtitle2">
                    Ticket promedio por venta
                  </Typography>
                  <Typography variant="h6">
                    {formatCurrency(
                      summary.ventas?.ticketPromedioVenta ?? 0
                    )}
                  </Typography>
                </CardContent>
              </Card>
            </Grid>

            <Grid item xs={12} sm={6} md={3}>
              <Card>
                <CardContent>
                  <Typography variant="subtitle2">
                    Unidades promedio por venta
                  </Typography>
                  <Typography variant="h6">
                    {summary.ventas?.unidadesPromedioPorVenta?.toFixed
                      ? summary.ventas.unidadesPromedioPorVenta.toFixed(2)
                      : summary.ventas?.unidadesPromedioPorVenta ?? 0}
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
          </Grid>

          {/* Sección Global */}
          <Typography variant="h5" gutterBottom>
            Global
          </Typography>
          <Grid container spacing={2}>
            <Grid item xs={12} sm={6} md={4}>
              <Card>
                <CardContent>
                  <Typography variant="subtitle2">Ingresos totales</Typography>
                  <Typography variant="h6">
                    {formatCurrency(summary.global?.ingresosTotales ?? 0)}
                  </Typography>
                </CardContent>
              </Card>
            </Grid>

            <Grid item xs={12} sm={6} md={4}>
              <Card>
                <CardContent>
                  <Typography variant="subtitle2">Total gastos</Typography>
                  <Typography variant="h6">
                    {formatCurrency(summary.global?.totalGastos ?? 0)}
                  </Typography>
                </CardContent>
              </Card>
            </Grid>

            <Grid item xs={12} sm={6} md={4}>
              <Card sx={{ bgcolor: 'success.main', color: 'common.white' }}>
                <CardContent>
                  <Typography variant="subtitle2">
                    Ingreso real neto
                  </Typography>
                  <Typography variant="h6">
                    {formatCurrency(summary.global?.ingresoNeto ?? 0)}
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
          </Grid>
        </Box>
      )}
    </Container>
  );
}
