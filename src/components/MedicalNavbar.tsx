import { useState } from 'react';
import {
  AppBar,
  Toolbar,
  Button,
  Box,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  MenuItem,
  Alert,
  Snackbar,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Chip,
  CircularProgress,
} from '@mui/material';
import { Link } from 'react-router-dom';
import axiosClient from '../api/axiosClient';
import logo from '../assets/Muneras_logo4.png';

export default function MedicalNavbar() {
  const [openExpense, setOpenExpense] = useState(false);
  const [openExpenseList, setOpenExpenseList] = useState(false);
  const [description, setDescription] = useState('');
  const [amount, setAmount] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('Efectivo');
  const [expenseDate, setExpenseDate] = useState('');
  const [saving, setSaving] = useState(false);
  const [loadingExpenses, setLoadingExpenses] = useState(false);
  const [expenses, setExpenses] = useState([]);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });

  const formatCurrency = (value) =>
    new Intl.NumberFormat('es-CO', {
      style: 'currency',
      currency: 'COP',
    }).format(value || 0);

  const formatDateTime = (value) => {
    if (!value) return '-';
    return new Intl.DateTimeFormat('es-CO', {
      dateStyle: 'medium',
      timeStyle: 'short',
    }).format(new Date(value));
  };

  const getExpensesRange = () => {
    const now = new Date();
    const from = new Date();
    from.setFullYear(now.getFullYear() - 1);

    const toIso = now.toISOString().slice(0, 19);
    const fromIso = from.toISOString().slice(0, 19);

    return { fromIso, toIso };
  };

  const fetchExpenses = async () => {
    setLoadingExpenses(true);
    try {
      const { fromIso, toIso } = getExpensesRange();
      const res = await axiosClient.get('/expenses', {
        params: {
          from: fromIso,
          to: toIso,
        },
      });
      setExpenses(res.data || []);
    } catch (e) {
      console.error(e);
      setSnackbar({
        open: true,
        message: 'No fue posible cargar la lista de gastos.',
        severity: 'error',
      });
      setExpenses([]);
    } finally {
      setLoadingExpenses(false);
    }
  };

  // Inicializar fecha por defecto cuando se abre el diálogo
  const handleOpenExpense = () => {
    const now = new Date();
    const pad = (n) => String(n).padStart(2, '0');
    const yyyy = now.getFullYear();
    const mm = pad(now.getMonth() + 1);
    const dd = pad(now.getDate());
    const hh = pad(now.getHours());
    const mi = pad(now.getMinutes());
    setExpenseDate(`${yyyy}-${mm}-${dd}T${hh}:${mi}`);
    setOpenExpense(true);
  };

  const handleCloseExpense = () => {
    if (saving) return;
    setOpenExpense(false);
  };

  const handleOpenExpenseList = async () => {
    setOpenExpenseList(true);
    await fetchExpenses();
  };

  const handleSaveExpense = async () => {
    if (!description.trim() || !amount || !paymentMethod || !expenseDate) {
      setSnackbar({
        open: true,
        message: 'Por favor completa todos los campos del gasto.',
        severity: 'error',
      });
      return;
    }

    const value = Number(amount);
    if (Number.isNaN(value) || value <= 0) {
      setSnackbar({
        open: true,
        message: 'El valor del gasto debe ser un número mayor que cero.',
        severity: 'error',
      });
      return;
    }

    setSaving(true);
    try {
      // Aseguramos formato ISO completo con segundos
      const expenseDateIso = expenseDate.length === 16
        ? `${expenseDate}:00`
        : expenseDate;

      await axiosClient.post('/expenses', {
        description: description.trim(),
        amount: value,
        paymentMethod,
        expenseDate: expenseDateIso,
      });

      setSnackbar({
        open: true,
        message: 'Gasto registrado correctamente.',
        severity: 'success',
      });

      setDescription('');
      setAmount('');
      setPaymentMethod('Efectivo');
      setOpenExpense(false);
      if (openExpenseList) {
        await fetchExpenses();
      }
    } catch (e) {
      console.error(e);
      setSnackbar({
        open: true,
        message: 'Error al registrar el gasto.',
        severity: 'error',
      });
    } finally {
      setSaving(false);
    }
  };

  return (
    <>
      <AppBar position="static" sx={{ mb: 2 }}>
        <Toolbar sx={{ py: 0.5 }}>
          <Box
            sx={{
              display: 'flex',
              alignItems: 'center',
              flexGrow: 1,
              gap: 1,
              flexWrap: 'wrap',
            }}
          >
            {/* Navegación existente */}
            <Button component={Link} to="/remisiones" color="inherit">
              Ingresar remisión
            </Button>
            <Button component={Link} to="/entrega-equipo" color="inherit">
              BUSCAR/ENTREGAR
            </Button>
            <Button component={Link} to="/servicio-tecnico" color="inherit">
              Servicio Técnico
            </Button>
            <Button component={Link} to="/servicio-tecnico-resumen" color="inherit">
              Resumen Técnico
            </Button>
            <Button component={Link} to="/reports/volume" color="inherit">
              Reporte Volumen
            </Button>

            {/* Nuevas opciones */}
            <Button component={Link} to="/products" color="inherit">
              Productos
            </Button>
            <Button component={Link} to="/sales" color="inherit">
              Ventas
            </Button>

            {/* 🆕 Botón de Gasto (abre diálogo) */}
            <Button
              variant="contained"
              onClick={handleOpenExpense}
              sx={{
                ml: { xs: 0, sm: 2 },
                bgcolor: '#0ea5e9',
                color: '#ffffff',
                '&:hover': { bgcolor: '#0284c7' },
              }}
            >
              Registrar gasto
            </Button>
          </Box>
        </Toolbar>
      </AppBar>

      {/* Logo fijo en esquina inferior izquierda */}
      <Box
        component="img"
        src={logo}
        alt="Muneras Logo"
        sx={{
          position: 'fixed',
          bottom: 0,
          left: 0,
          height: { xs: 44, sm: 80 },
          zIndex: (theme) => theme.zIndex.appBar - 1,
        }}
      />

      {/* Diálogo para registrar gasto */}
      <Dialog open={openExpense} onClose={handleCloseExpense} fullWidth maxWidth="sm">
        <DialogTitle>Registrar gasto</DialogTitle>
        <DialogContent sx={{ pt: 2 }}>
          <TextField
            label="Descripción"
            fullWidth
            margin="normal"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
          />
          <TextField
            label="Valor (COP)"
            type="number"
            fullWidth
            margin="normal"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
          />
          <TextField
            label="Fecha del gasto"
            type="datetime-local"
            fullWidth
            margin="normal"
            InputLabelProps={{ shrink: true }}
            value={expenseDate}
            onChange={(e) => setExpenseDate(e.target.value)}
          />
          <TextField
            select
            label="Método de pago"
            fullWidth
            margin="normal"
            value={paymentMethod}
            onChange={(e) => setPaymentMethod(e.target.value)}
          >
            <MenuItem value="Efectivo">Efectivo</MenuItem>
            <MenuItem value="Tarjeta">Tarjeta</MenuItem>
            <MenuItem value="Transferencia">Transferencia</MenuItem>
          </TextField>
          <Alert severity="info" sx={{ mt: 2 }}>
            Estos gastos serán tenidos en cuenta en el reporte como &quot;Total gastos&quot;
            y para calcular el &quot;Ingreso real neto&quot;.
          </Alert>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleOpenExpenseList} disabled={saving}>
            Ver gastos
          </Button>
          <Button onClick={handleCloseExpense} disabled={saving}>
            Cancelar
          </Button>
          <Button
            variant="contained"
            onClick={handleSaveExpense}
            disabled={saving}
          >
            {saving ? 'Guardando…' : 'Guardar'}
          </Button>
        </DialogActions>
      </Dialog>

      <Dialog
        open={openExpenseList}
        onClose={() => setOpenExpenseList(false)}
        fullWidth
        maxWidth="md"
      >
        <DialogTitle>Detalle de gastos</DialogTitle>
        <DialogContent sx={{ pt: 1 }}>
          {loadingExpenses ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', py: 5 }}>
              <CircularProgress size={30} />
            </Box>
          ) : (
            <TableContainer component={Paper} sx={{ borderRadius: 2 }}>
              <Table size="small">
                <TableHead>
                  <TableRow>
                    <TableCell>Fecha</TableCell>
                    <TableCell>Descripción</TableCell>
                    <TableCell>Método de pago</TableCell>
                    <TableCell align="right">Valor</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {expenses.length > 0 ? (
                    expenses.map((expense) => (
                      <TableRow key={expense.id} hover>
                        <TableCell>{formatDateTime(expense.expenseDate)}</TableCell>
                        <TableCell>{expense.description}</TableCell>
                        <TableCell>
                          <Chip
                            label={expense.paymentMethod || 'Sin definir'}
                            size="small"
                            variant="outlined"
                          />
                        </TableCell>
                        <TableCell align="right">
                          {formatCurrency(expense.amount)}
                        </TableCell>
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell colSpan={4} align="center">
                        No hay gastos registrados en el periodo consultado.
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </TableContainer>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={fetchExpenses} disabled={loadingExpenses}>
            Actualizar
          </Button>
          <Button variant="contained" onClick={() => setOpenExpenseList(false)}>
            Cerrar
          </Button>
        </DialogActions>
      </Dialog>

      <Snackbar
        open={snackbar.open}
        autoHideDuration={4000}
        onClose={() => setSnackbar((s) => ({ ...s, open: false }))}
        anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
      >
        <Alert
          onClose={() => setSnackbar((s) => ({ ...s, open: false }))}
          severity={snackbar.severity}
          sx={{ width: '100%' }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </>
  );
}
