// src/pages/VolumeReportPage.jsx

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

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  CartesianGrid,
  ResponsiveContainer
} from 'recharts';

// =======================================
// Helpers para meses
// =======================================
const MESES = [
  "Ene", "Feb", "Mar", "Abr", "May", "Jun",
  "Jul", "Ago", "Sep", "Oct", "Nov", "Dic"
];

const formatMonthLabel = (year, month) =>
  `${MESES[month - 1]} ${year}`;

// =======================================
// COMPONENTE PRINCIPAL
// =======================================
export default function VolumeReportPage() {
  const [from, setFrom] = useState('');
  const [to, setTo] = useState('');
  const [periodType, setPeriodType] = useState('custom');
  const [selectedDate, setSelectedDate] = useState('');
  const [selectedWeek, setSelectedWeek] = useState('');
  const [selectedMonth, setSelectedMonth] = useState('');

  const [summary, setSummary] = useState(null);
  const [monthly, setMonthly] = useState(null);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // ====================================
  // Helpers
  // ====================================
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

  // ====================================
  // Calcular rango
  // ====================================
  const computeRange = () => {
    if (periodType === 'custom') {
      if (!from || !to) throw new Error("Debes seleccionar las fechas");
      if (new Date(from) > new Date(to))
        throw new Error("Desde no puede ser mayor que Hasta");
      return { fromFinal: from, toFinal: to };
    }

    if (periodType === 'day') {
      if (!selectedDate) throw new Error("Selecciona una fecha");
      return {
        fromFinal: `${selectedDate}T00:01`,
        toFinal: `${selectedDate}T23:59`,
      };
    }

    if (periodType === 'week') {
      const monday = getMondayFromWeekString(selectedWeek);
      if (!monday) throw new Error("Semana inválida");

      const sunday = new Date(monday);
      sunday.setDate(monday.getDate() + 6);

      return {
        fromFinal: `${formatYYYYMMDD(monday)}T00:01`,
        toFinal: `${formatYYYYMMDD(sunday)}T23:59`,
      };
    }

    if (periodType === 'month') {
      const [yearStr, monthStr] = selectedMonth.split("-");
      const year = parseInt(yearStr, 10);
      const monthNum = parseInt(monthStr, 10);

      const firstDay = new Date(year, monthNum - 1, 1);
      const lastDay = new Date(year, monthNum, 0);

      return {
        fromFinal: `${formatYYYYMMDD(firstDay)}T00:01`,
        toFinal: `${formatYYYYMMDD(lastDay)}T23:59`,
      };
    }

    return { fromFinal: from, toFinal: to };
  };

  // ====================================
  // GENERAR REPORTE
  // ====================================
  const handleGenerate = async () => {
    setLoading(true);
    setError("");

    try {
      const { fromFinal, toFinal } = computeRange();
      const params = { from: fromFinal, to: toFinal };

      const respSummary = await axiosClient.get(
        "/reports/remissions/summary",
        { params }
      );
      setSummary(respSummary.data);

      const respMonthly = await axiosClient.get(
        "/reports/remissions/monthly"
      );

      const remMapped = respMonthly.data.remisiones.map((m) => ({
        mes: formatMonthLabel(m.year, m.month),
        ingresos: m.ingresosRemisiones,
        ticket: m.ticketPromedio,
      }));

      const salesMapped = respMonthly.data.ventas.map((m) => ({
        mes: formatMonthLabel(m.year, m.month),
        ingresos: m.ingresosVentas,
        ticket: m.ticketPromedio,
      }));

      const globalMapped = respMonthly.data.global.map((m) => ({
        mes: formatMonthLabel(m.year, m.month),
        ingresoNeto: m.ingresoNeto,
      }));

      setMonthly({
        remisiones: remMapped,
        ventas: salesMapped,
        global: globalMapped,
      });
    } catch (e) {
      console.error(e);
      setError("Error generando el reporte");
      setSummary(null);
      setMonthly(null);
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (value) =>
    new Intl.NumberFormat("es-CO", {
      style: "currency",
      currency: "COP",
    }).format(value || 0);

  // ====================================
  // RENDER
  // ====================================
  return (
    <Container maxWidth="lg" sx={{ mt: 4, pb: 6 }}>
      <Typography variant="h4" gutterBottom>
        Reporte de KPIs (Remisiones & Ventas)
      </Typography>

      {/* FILTROS */}
      <Stack
        direction={{ xs: "column", sm: "row" }}
        spacing={2}
        sx={{ mb: 2 }}
      >
        <TextField
          select
          label="Periodo"
          value={periodType}
          onChange={(e) => setPeriodType(e.target.value)}
          SelectProps={{ native: true }}
          fullWidth
          InputLabelProps={{ shrink: true }}
          sx={{ background: "white", borderRadius: 1 }}
        >
          <option value="custom">Personalizado</option>
          <option value="day">Día</option>
          <option value="week">Semana</option>
          <option value="month">Mes</option>
        </TextField>

        {periodType === "custom" && (
          <>
            <TextField
              label="Desde"
              type="datetime-local"
              fullWidth
              value={from}
              onChange={(e) => setFrom(e.target.value)}
              InputLabelProps={{ shrink: true }}
              sx={{ background: "white", borderRadius: 1 }}
              inputProps={{ style: { padding: "10px" } }}
            />
            <TextField
              label="Hasta"
              type="datetime-local"
              fullWidth
              value={to}
              onChange={(e) => setTo(e.target.value)}
              InputLabelProps={{ shrink: true }}
              sx={{ background: "white", borderRadius: 1 }}
              inputProps={{ style: { padding: "10px" } }}
            />
          </>
        )}

        {periodType === "day" && (
          <TextField
            label="Fecha"
            type="date"
            fullWidth
            value={selectedDate}
            onChange={(e) => setSelectedDate(e.target.value)}
            InputLabelProps={{ shrink: true }}
            sx={{ background: "white", borderRadius: 1 }}
          />
        )}

        {periodType === "week" && (
          <TextField
            label="Semana"
            type="week"
            fullWidth
            value={selectedWeek}
            onChange={(e) => setSelectedWeek(e.target.value)}
            InputLabelProps={{ shrink: true }}
            sx={{ background: "white", borderRadius: 1 }}
          />
        )}

        {periodType === "month" && (
          <TextField
            label="Mes"
            type="month"
            fullWidth
            value={selectedMonth}
            onChange={(e) => setSelectedMonth(e.target.value)}
            InputLabelProps={{ shrink: true }}
            sx={{ background: "white", borderRadius: 1 }}
          />
        )}

        <Button
          variant="contained"
          size="large"
          onClick={handleGenerate}
          disabled={loading}
          sx={{
            minWidth: 150,
            fontWeight: "bold",
            px: 3,
            height: "56px", // alinea con los TextField
          }}
        >
          {loading ? "Generando…" : "GENERAR"}
        </Button>
      </Stack>

      {error && <Typography color="error">{error}</Typography>}

      {/* ===================== REMISIONES ===================== */}
      {summary && (
        <Box>
          <Typography variant="h5" sx={{ mt: 4, mb: 2 }}>
            Remisiones
          </Typography>

          <Grid container spacing={2}>
            <Grid item xs={12} sm={6} md={3}>
              <Card><CardContent>
                <Typography variant="subtitle2">Total remisiones</Typography>
                <Typography variant="h6">
                  {summary.remisiones.totalRemisiones}
                </Typography>
              </CardContent></Card>
            </Grid>

            <Grid item xs={12} sm={6} md={3}>
              <Card><CardContent>
                <Typography variant="subtitle2">Equipos totales</Typography>
                <Typography variant="h6">
                  {summary.remisiones.totalEquipos}
                </Typography>
              </CardContent></Card>
            </Grid>

            <Grid item xs={12} sm={6} md={3}>
              <Card><CardContent>
                <Typography variant="subtitle2">Ingresos remisiones</Typography>
                <Typography variant="h6">
                  {formatCurrency(
                    summary.remisiones.totalValorRemisiones
                  )}
                </Typography>
              </CardContent></Card>
            </Grid>

            <Grid item xs={12} sm={6} md={3}>
              <Card><CardContent>
                <Typography variant="subtitle2">
                  Ticket promedio
                </Typography>
                <Typography variant="h6">
                  {formatCurrency(
                    summary.remisiones.ticketPromedioRemision
                  )}
                </Typography>
              </CardContent></Card>
            </Grid>
          </Grid>

          {/* GRÁFICOS REMISIONES */}
          {monthly && (
            <Box sx={{ mt: 3 }}>
              <Typography variant="h6" sx={{ mb: 1 }}>
                Ingresos por remisiones (últimos 12 meses)
              </Typography>

              <Box sx={{ background: "white", p: 2, borderRadius: 2 }}>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={monthly.remisiones}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="mes" />
                    <YAxis />
                    <Tooltip formatter={(v) => formatCurrency(v)} />
                    <Legend />
                    <Bar dataKey="ingresos" fill="#1976d2" />
                  </BarChart>
                </ResponsiveContainer>
              </Box>

              <Typography variant="h6" sx={{ mt: 4, mb: 1 }}>
                Ticket promedio por remisión (últimos 12 meses)
              </Typography>

              <Box sx={{ background: "white", p: 2, borderRadius: 2 }}>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={monthly.remisiones}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="mes" />
                    <YAxis />
                    <Tooltip formatter={(v) => formatCurrency(v)} />
                    <Legend />
                    <Bar dataKey="ticket" fill="#9c27b0" />
                  </BarChart>
                </ResponsiveContainer>
              </Box>
            </Box>
          )}

          {/* ===================== VENTAS ===================== */}
          <Typography variant="h5" sx={{ mt: 6, mb: 2 }}>
            Ventas
          </Typography>

          <Grid container spacing={2}>
            <Grid item xs={12} sm={6} md={3}>
              <Card><CardContent>
                <Typography variant="subtitle2">Transacciones</Typography>
                <Typography variant="h6">
                  {summary.ventas.totalTransacciones}
                </Typography>
              </CardContent></Card>
            </Grid>

            <Grid item xs={12} sm={6} md={3}>
              <Card><CardContent>
                <Typography variant="subtitle2">Unidades totales</Typography>
                <Typography variant="h6">
                  {summary.ventas.productosTotales}
                </Typography>
              </CardContent></Card>
            </Grid>

            <Grid item xs={12} sm={6} md={3}>
              <Card><CardContent>
                <Typography variant="subtitle2">Ingresos ventas</Typography>
                <Typography variant="h6">
                  {formatCurrency(summary.ventas.totalVentas)}
                </Typography>
              </CardContent></Card>
            </Grid>

            <Grid item xs={12} sm={6} md={3}>
              <Card><CardContent>
                <Typography variant="subtitle2">
                  Ticket promedio
                </Typography>
                <Typography variant="h6">
                  {formatCurrency(summary.ventas.ticketPromedioVenta)}
                </Typography>
              </CardContent></Card>
            </Grid>
          </Grid>

          {/* GRÁFICOS VENTAS */}
          {monthly && (
            <Box sx={{ mt: 3 }}>
              <Typography variant="h6" sx={{ mb: 1 }}>
                Ingresos por ventas (últimos 12 meses)
              </Typography>

              <Box sx={{ background: "white", p: 2, borderRadius: 2 }}>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={monthly.ventas}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="mes" />
                    <YAxis />
                    <Tooltip formatter={(v) => formatCurrency(v)} />
                    <Legend />
                    <Bar dataKey="ingresos" fill="#2e7d32" />
                  </BarChart>
                </ResponsiveContainer>
              </Box>

              <Typography variant="h6" sx={{ mt: 4, mb: 1 }}>
                Ticket promedio por venta (últimos 12 meses)
              </Typography>

              <Box sx={{ background: "white", p: 2, borderRadius: 2 }}>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={monthly.ventas}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="mes" />
                    <YAxis />
                    <Tooltip formatter={(v) => formatCurrency(v)} />
                    <Legend />
                    <Bar dataKey="ticket" fill="#ff9800" />
                  </BarChart>
                </ResponsiveContainer>
              </Box>
            </Box>
          )}

          {/* ===================== GLOBAL ===================== */}
          <Typography variant="h5" sx={{ mt: 6, mb: 2 }}>
            Global
          </Typography>

          <Grid container spacing={2}>
            <Grid item xs={12} sm={6} md={4}>
              <Card><CardContent>
                <Typography variant="subtitle2">Ingresos totales</Typography>
                <Typography variant="h6">
                  {formatCurrency(summary.global.ingresosTotales)}
                </Typography>
              </CardContent></Card>
            </Grid>

            <Grid item xs={12} sm={6} md={4}>
              <Card><CardContent>
                <Typography variant="subtitle2">Gastos</Typography>
                <Typography variant="h6">
                  {formatCurrency(summary.global.totalGastos)}
                </Typography>
              </CardContent></Card>
            </Grid>

            <Grid item xs={12} sm={6} md={4}>
              <Card sx={{ bgcolor: "success.main", color: "white" }}>
                <CardContent>
                  <Typography variant="subtitle2">Ingreso neto</Typography>
                  <Typography variant="h6">
                    {formatCurrency(summary.global.ingresoNeto)}
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
          </Grid>

          {/* GRÁFICO GLOBAL */}
          {monthly && (
            <Box sx={{ mt: 3 }}>
              <Typography variant="h6" sx={{ mb: 1 }}>
                Ingreso real neto (últimos 12 meses)
              </Typography>

              <Box sx={{ background: "white", p: 2, borderRadius: 2 }}>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={monthly.global}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="mes" />
                    <YAxis />
                    <Tooltip formatter={(v) => formatCurrency(v)} />
                    <Legend />
                    <Bar dataKey="ingresoNeto" fill="#512da8" />
                  </BarChart>
                </ResponsiveContainer>
              </Box>
            </Box>
          )}
        </Box>
      )}
    </Container>
  );
}
