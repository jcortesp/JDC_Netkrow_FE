import React, { useState, useEffect } from 'react';
import {
  Container, Box, Typography,
  TextField, Button, Stack,
  TableContainer, Paper,
  Table, TableHead, TableRow,
  TableCell, TableBody
} from '@mui/material';
import axiosClient from '../api/axiosClient';
import {
  LineChart, Line, XAxis, YAxis,
  CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer,
  PieChart, Pie, Cell, Legend
} from 'recharts';

export default function VolumeReportPage() {
  const [from, setFrom] = useState('');
  const [to, setTo] = useState('');
  const [equipo, setEquipo] = useState('');
  const [estado, setEstado] = useState('');
  const [equiposList, setEquiposList] = useState([]);
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Colores basados en la NavBar
  const COLORS = [
    '#1976d2', '#dc004e', '#2e7d32',
    '#ed6c02', '#0288d1', '#9c27b0',
    '#d32f2f', '#02897b'
  ];

  useEffect(() => {
    axiosClient.get('/reports/remissions/equipos')
      .then(res => setEquiposList(res.data))
      .catch(() => {});
  }, []);

  const handleGenerate = async () => {
    setLoading(true);
    setError('');
    try {
      const params = { from, to };
      if (equipo) params.equipo = equipo;
      if (estado) params.estado = estado;
      const resp = await axiosClient.get('/reports/remissions/volume', { params });
      setData(resp.data);
    } catch (e) {
      setError(e.response?.data?.message || 'Error generando reporte');
    } finally {
      setLoading(false);
    }
  };

  // Sumas totales
  const totalRemisionesSum = data.reduce((sum, d) => sum + d.totalRemisiones, 0);
  const totalValorSum     = data.reduce((sum, d) => sum + d.totalValor, 0);

  // Datos para pie charts
  const valorByEquipo = data.reduce((acc, d) => {
    acc[d.equipo] = (acc[d.equipo] || 0) + d.totalValor;
    return acc;
  }, {});
  const pieDataEquipo = Object.entries(valorByEquipo)
    .map(([name, value]) => ({ name, value }));

  const valorByEstado = data.reduce((acc, d) => {
    acc[d.estado] = (acc[d.estado] || 0) + d.totalValor;
    return acc;
  }, {});
  const pieDataEstado = Object.entries(valorByEstado)
    .map(([name, value]) => ({ name, value }));

  const exportCsv = () => {
    if (!data.length) return;

    const equipoLabel = equipo || 'Ninguno';
    const estadoLabel = estado || 'Ninguno';

    const now = new Date();
    const pad = n => String(n).padStart(2, '0');
    const filename = `Reporte_Volumen_${now.getFullYear()}_${pad(now.getMonth()+1)}_${pad(now.getDate())}_${pad(now.getHours())}_${pad(now.getMinutes())}_${pad(now.getSeconds())}.csv`;

    const metaLines = [
      `Rango desde: ${from}`,
      `Rango hasta: ${to}`,
      `Filtro Equipo: ${equipoLabel}`,
      `Filtro Estado: ${estadoLabel}`,
      ''
    ].join('\n') + '\n';

    const header = 'Fecha,Equipo,Estado,Total remisiones,Total Valor\n';

    const rows = data.map(d => {
      const fecha = d.fecha || '';
      const eq     = d.equipo || '';
      const est    = d.estado || '';
      const tr     = d.totalRemisiones;
      const tvStr  = `$${Math.round(d.totalValor)}`; // sin comas
      return [fecha, eq, est, tr, tvStr].join(',');
    }).join('\n') + '\n';

    const totalRow = [
      'Totales', '', '',
      totalRemisionesSum,
      `$${Math.round(totalValorSum)}`
    ].join(',') + '\n';

    const csvContent = metaLines + header + rows + totalRow;
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url  = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href     = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    // Añadido padding-bottom para que al hacer scroll los diagramas no queden tapados
    <Container
      maxWidth="lg"
      sx={{
        mt: 4,
        pb: theme => `calc(${theme.spacing(4)} + 80px)`
      }}
    >
      <Typography variant="h4" gutterBottom>
        Reporte de Volumen de Remisiones
      </Typography>

      <Stack
        direction={{ xs: 'column', sm: 'row' }}
        spacing={2}
        sx={{ mb: 2 }}
        alignItems="center"
      >
        <TextField
          label="Desde"
          type="datetime-local"
          value={from}
          onChange={e => setFrom(e.target.value)}
          InputLabelProps={{ shrink: true }}
          fullWidth
        />
        <TextField
          label="Hasta"
          type="datetime-local"
          value={to}
          onChange={e => setTo(e.target.value)}
          InputLabelProps={{ shrink: true }}
          fullWidth
        />
        <TextField
          select
          label="Equipo"
          value={equipo}
          onChange={e => setEquipo(e.target.value)}
          SelectProps={{ native: true }}
          InputLabelProps={{ shrink: true }}
          fullWidth
        >
          <option value="">Todos</option>
          {equiposList.map(eq => (
            <option key={eq} value={eq}>{eq}</option>
          ))}
        </TextField>
        <TextField
          select
          label="Estado"
          value={estado}
          onChange={e => setEstado(e.target.value)}
          SelectProps={{ native: true }}
          InputLabelProps={{ shrink: true }}
          fullWidth
        >
          <option value="">Todos</option>
          <option value="Entregado">Entregado</option>
          <option value="Pendiente">Pendiente</option>
        </TextField>
        <Button
          variant="contained"
          onClick={handleGenerate}
          disabled={loading}
          size="large"
          sx={{ minWidth: 120 }}
        >
          Generar
        </Button>
        <Button
          variant="outlined"
          onClick={exportCsv}
          disabled={!data.length}
          size="large"
          sx={{ minWidth: 120 }}
        >
          Exportar CSV
        </Button>
      </Stack>

      {error && <Typography color="error">{error}</Typography>}

      {data.length > 0 && (
        <>
          {/* Línea */}
          <Box sx={{ width: '100%', height: 300 }}>
            <ResponsiveContainer>
              <LineChart
                data={data}
                margin={{ top: 20, right: 30, left: 0, bottom: 0 }}
              >
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="fecha" />
                <YAxis />
                <RechartsTooltip />
                <Line
                  type="monotone"
                  dataKey="totalRemisiones"
                  stroke="#1976d2"
                  name="Total remisiones"
                />
              </LineChart>
            </ResponsiveContainer>
          </Box>

          {/* Tabla */}
          <TableContainer component={Paper} sx={{ mt: 3 }}>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Fecha</TableCell>
                  <TableCell>Equipo</TableCell>
                  <TableCell>Estado</TableCell>
                  <TableCell align="right">Total remisiones</TableCell>
                  <TableCell align="right">Total Valor</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {data.map(row => (
                  <TableRow key={`${row.fecha}-${row.equipo}-${row.estado}`}>
                    <TableCell>{row.fecha}</TableCell>
                    <TableCell>{row.equipo}</TableCell>
                    <TableCell>{row.estado}</TableCell>
                    <TableCell align="right">
                      {row.totalRemisiones.toLocaleString('es-CO')}
                    </TableCell>
                    <TableCell align="right">
                      {new Intl.NumberFormat('es-CO', {
                        style: 'currency',
                        currency: 'COP'
                      }).format(row.totalValor)}
                    </TableCell>
                  </TableRow>
                ))}
                <TableRow>
                  <TableCell><strong>Totales</strong></TableCell>
                  <TableCell /><TableCell />
                  <TableCell align="right">
                    <strong>{totalRemisionesSum.toLocaleString('es-CO')}</strong>
                  </TableCell>
                  <TableCell align="right">
                    <strong>{new Intl.NumberFormat('es-CO', {
                      style: 'currency',
                      currency: 'COP'
                    }).format(totalValorSum)}</strong>
                  </TableCell>
                </TableRow>
              </TableBody>
            </Table>
          </TableContainer>

          {/* Pasteles */}
          <Box sx={{ display: 'flex', justifyContent: 'space-around', mt: 4 }}>
            <Box sx={{ width: '45%', height: 300 }}>
              <Typography align="center" gutterBottom>
                Participación por Equipo (Valor)
              </Typography>
              <ResponsiveContainer>
                <PieChart>
                  <Pie
                    data={pieDataEquipo}
                    dataKey="value"
                    nameKey="name"
                    outerRadius={100}
                    label={({ percent }) => `${(percent * 100).toFixed(0)}%`}
                  >
                    {pieDataEquipo.map((_, index) => (
                      <Cell
                        key={`cell-equipo-${index}`}
                        fill={COLORS[index % COLORS.length]}
                      />
                    ))}
                  </Pie>
                  <RechartsTooltip formatter={value =>
                    `$${Math.round(value)}`
                  }/>
                  <Legend verticalAlign="bottom" height={36} />
                </PieChart>
              </ResponsiveContainer>
            </Box>
            <Box sx={{ width: '45%', height: 300 }}>
              <Typography align="center" gutterBottom>
                Participación por Estado (Valor)
              </Typography>
              <ResponsiveContainer>
                <PieChart>
                  <Pie
                    data={pieDataEstado}
                    dataKey="value"
                    nameKey="name"
                    outerRadius={100}
                    label={({ percent }) => `${(percent * 100).toFixed(0)}%`}
                  >
                    {pieDataEstado.map((_, index) => (
                      <Cell
                        key={`cell-estado-${index}`}
                        fill={COLORS[index % COLORS.length]}
                      />
                    ))}
                  </Pie>
                  <RechartsTooltip formatter={value =>
                    `$${Math.round(value)}`
                  }/>
                  <Legend verticalAlign="bottom" height={36} />
                </PieChart>
              </ResponsiveContainer>
            </Box>
          </Box>
        </>
      )}
    </Container>
  );
}
