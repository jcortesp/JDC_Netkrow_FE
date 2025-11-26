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
} from '@mui/material';
import { Link } from 'react-router-dom';
import axiosClient from '../api/axiosClient';
import logo from '../assets/Muneras_logo4.png';

export default function MedicalNavbar() {
  const [openExpense, setOpenExpense] = useState(false);
  const [description, setDescription] = useState('');
  const [amount, setAmount] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('Efectivo');
  const [expenseDate, setExpenseDate] = useState('');
  const [saving, setSaving] = useState(false);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });

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
      <AppBar position="static">
        <Toolbar>
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
              color="secondary"
              variant="contained"
              onClick={handleOpenExpense}
              sx={{ ml: { xs: 0, sm: 2 } }}
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
          height: 80,
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
