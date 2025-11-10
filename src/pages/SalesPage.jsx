import React, { useEffect, useMemo, useState } from 'react';
import {
  Box,
  Container,
  Typography,
  Stack,
  TextField,
  Button,
  MenuItem,
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
  Paper,
  TableContainer,
  Alert,
  CircularProgress,
  IconButton,
} from '@mui/material';
import Autocomplete from '@mui/material/Autocomplete';
import AddIcon from '@mui/icons-material/Add';
import axiosClient from '../api/axiosClient';

export default function SalesPage() {
  const [products, setProducts] = useState([]);
  const [list, setList] = useState([]);

  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  // Mostrar / ocultar historial de ventas
  const [showSalesTable, setShowSalesTable] = useState(false);

  // Cabecera compartida
  const [header, setHeader] = useState({
    saleDate: '',          // automática
    remisionVenta: '',
    transactionType: 'Venta',
    channel: 'Tienda',
    paymentMethod: 'Efectivo',
    returnDate: '',        // solo aplica si es Alquiler
  });

  // Detalle: múltiples líneas
  const [items, setItems] = useState([
    { productId: '', unitQty: 1, price: 0 },
  ]);

  // ==== Carga inicial ====

  const loadProducts = async () => {
    try {
      const resp = await axiosClient.get('/products');
      setProducts(Array.isArray(resp.data) ? resp.data : []);
    } catch (e) {
      setError(e.response?.data?.message || e.message);
    }
  };

  const loadSales = async () => {
    setLoading(true);
    setError('');
    try {
      const resp = await axiosClient.get('/sales');
      setList(Array.isArray(resp.data) ? resp.data : []);
    } catch (e) {
      setError(e.response?.data?.message || e.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadProducts();
    loadSales();

    // Fecha automática (local) al cargar la página
    const todayStr = new Date().toISOString().slice(0, 10);
    setHeader(prev => ({ ...prev, saleDate: todayStr }));
  }, []);

  // ==== Helpers ====

  const onHeaderChange = (field, value) => {
    // saleDate no se puede editar
    if (field === 'saleDate') return;

    // si cambia tipo y pasa de Alquiler a Venta, limpiamos returnDate
    if (field === 'transactionType') {
      setHeader(prev => ({
        ...prev,
        transactionType: value,
        returnDate: value === 'Alquiler' ? prev.returnDate : '',
      }));
      setError('');
      setSuccessMsg('');
      return;
    }

    setHeader(prev => ({ ...prev, [field]: value }));
    setError('');
    setSuccessMsg('');
  };

  const onItemChange = (idx, field, value) => {
    setItems(prev =>
      prev.map((it, i) => {
        if (i !== idx) return it;

        if (field === 'productId') {
          const prod = products.find(p => String(p.productId) === String(value));
          return {
            ...it,
            productId: value,
            price: prod?.price ?? 0,
          };
        }

        if (field === 'unitQty') {
          const qty = Number(value) || 0;
          return { ...it, unitQty: qty };
        }

        if (field === 'price') {
          return { ...it, price: Number(value) || 0 };
        }

        return { ...it, [field]: value };
      })
    );
    setError('');
    setSuccessMsg('');
  };

  const addItem = () => {
    setItems(prev => [...prev, { productId: '', unitQty: 1, price: 0 }]);
  };

  const removeItem = (idx) => {
    setItems(prev => prev.filter((_, i) => i !== idx));
  };

  const lineTotal = (item) => {
    const qty = Number(item.unitQty) || 0;
    const price = Number(item.price) || 0;
    return qty * price;
  };

  const totalGeneral = useMemo(
    () => items.reduce((acc, it) => acc + lineTotal(it), 0),
    [items]
  );

  const getProductLabel = (id) => {
    const p = products.find(pp => String(pp.productId) === String(id));
    return p ? `${p.name} (${p.category})` : id;
  };

  // ==== Submit ====

  const submit = async () => {
    setSubmitting(true);
    setError('');
    setSuccessMsg('');

    try {
      // Fecha automática en el momento del registro
      const todayStr = new Date().toISOString().slice(0, 10);

      if (!todayStr) {
        throw new Error('No se pudo determinar la fecha actual.');
      }

      if (!header.remisionVenta || !header.remisionVenta.trim()) {
        throw new Error('La remisión es obligatoria.');
      }

      if (!['Venta', 'Alquiler'].includes(header.transactionType)) {
        throw new Error('Tipo de transacción inválido. Debe ser Venta o Alquiler.');
      }

      if (!header.channel) {
        throw new Error('Selecciona el canal.');
      }

      if (!header.paymentMethod) {
        throw new Error('Selecciona la forma de pago.');
      }

      // Validación específica para Alquiler
      if (header.transactionType === 'Alquiler') {
        if (!header.returnDate) {
          throw new Error('Selecciona la fecha de devolución para el alquiler.');
        }
        if (header.returnDate < todayStr) {
          throw new Error('La fecha de devolución no puede ser anterior a la fecha actual.');
        }
      }

      if (!items.length) throw new Error('Agrega al menos un producto.');

      for (const it of items) {
        if (!it.productId) {
          throw new Error('Todas las líneas deben tener un producto seleccionado.');
        }
        const qty = Number(it.unitQty);
        if (!qty || qty <= 0) {
          throw new Error('La cantidad debe ser mayor a 0 en todas las líneas.');
        }
        const prod = products.find(p => String(p.productId) === String(it.productId));
        const price = Number(it.price || prod?.price || 0);
        if (!price || price < 0) {
          throw new Error('Cada producto debe tener un precio válido.');
        }
      }

      // Crear una venta por cada línea
      for (const it of items) {
        const prod = products.find(p => String(p.productId) === String(it.productId));
        const price = Number(it.price || prod?.price || 0);
        const qty = Number(it.unitQty) || 0;
        const value = qty * price;

        const payload = {
          saleDate: todayStr,
          remisionVenta: header.remisionVenta.trim(),
          transactionType: header.transactionType,
          productId: Number(it.productId),
          channel: header.channel,
          unitQty: qty,
          saleValue: value,
          paymentMethod: header.paymentMethod,
        };

        // Si es alquiler, adjuntamos la fecha de devolución para que el BE pueda usarla cuando se extienda el modelo
        if (header.transactionType === 'Alquiler') {
          payload.returnDate = header.returnDate;
        }

        await axiosClient.post('/sales', payload);
      }

      setSuccessMsg('Ventas registradas correctamente.');
      await loadSales();

      // Reset parcial: mantener fecha automática, reset remisión, tipo y detalle
      const newToday = new Date().toISOString().slice(0, 10);
      setItems([{ productId: '', unitQty: 1, price: 0 }]);
      setHeader({
        saleDate: newToday,
        remisionVenta: '',
        transactionType: 'Venta',
        channel: 'Tienda',
        paymentMethod: 'Efectivo',
        returnDate: '',
      });
    } catch (e) {
      setError(e.response?.data?.message || e.message || 'Error al registrar ventas');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Box sx={{ minHeight: '100vh', py: 4, background: '#f5f5f5' }}>
      <Container maxWidth="md" sx={{ bgcolor: '#fff', p: 4, borderRadius: 2 }}>
        <Typography variant="h5" align="center" gutterBottom>
          Registro de Ventas
        </Typography>

        {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
        {successMsg && <Alert severity="success" sx={{ mb: 2 }}>{successMsg}</Alert>}

        {/* Cabecera */}
        <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} sx={{ mb: 2 }}>
          <TextField
            label="Fecha (automática)"
            type="date"
            value={header.saleDate}
            InputLabelProps={{ shrink: true }}
            fullWidth
            InputProps={{ readOnly: true }}
          />
          <TextField
            label="Remisión"
            value={header.remisionVenta}
            onChange={e => onHeaderChange('remisionVenta', e.target.value)}
            fullWidth
            required
          />
          <TextField
            label="Tipo de transacción"
            select
            value={header.transactionType}
            onChange={e => onHeaderChange('transactionType', e.target.value)}
            fullWidth
          >
            <MenuItem value="Venta">Venta</MenuItem>
            <MenuItem value="Alquiler">Alquiler</MenuItem>
          </TextField>
        </Stack>

        {/* Campo adicional solo para Alquiler */}
        {header.transactionType === 'Alquiler' && (
          <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} sx={{ mb: 2 }}>
            <TextField
              label="Fecha de devolución"
              type="date"
              value={header.returnDate}
              onChange={e => onHeaderChange('returnDate', e.target.value)}
              InputLabelProps={{ shrink: true }}
              fullWidth
              required
            />
          </Stack>
        )}

        <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} sx={{ mb: 2 }}>
          <TextField
            label="Canal"
            select
            value={header.channel}
            onChange={e => onHeaderChange('channel', e.target.value)}
            fullWidth
          >
            <MenuItem value="Tienda">Tienda</MenuItem>
            <MenuItem value="Online">Online</MenuItem>
            <MenuItem value="WhatsApp">WhatsApp</MenuItem>
            <MenuItem value="Otro">Otro</MenuItem>
          </TextField>
          <TextField
            label="Forma de pago"
            select
            value={header.paymentMethod}
            onChange={e => onHeaderChange('paymentMethod', e.target.value)}
            fullWidth
          >
            <MenuItem value="Efectivo">Efectivo</MenuItem>
            <MenuItem value="Tarjeta">Tarjeta</MenuItem>
            <MenuItem value="Transferencia">Transferencia</MenuItem>
            <MenuItem value="Nequi">Nequi</MenuItem>
            <MenuItem value="Daviplata">Daviplata</MenuItem>
          </TextField>
        </Stack>

        {/* Detalle con Autocomplete */}
        <Typography variant="subtitle1" sx={{ mb: 1 }}>
          Productos de la venta
        </Typography>

        {items.map((it, idx) => {
          const selectedProduct =
            products.find(p => String(p.productId) === String(it.productId)) || null;

          return (
            <Stack
              key={idx}
              direction={{ xs: 'column', md: 'row' }}
              spacing={2}
              sx={{ mb: 1 }}
            >
              <Autocomplete
                options={products}
                value={selectedProduct}
                onChange={(_, newValue) =>
                  onItemChange(idx, 'productId', newValue ? newValue.productId : '')
                }
                getOptionLabel={(option) =>
                  option && typeof option === 'object'
                    ? `${option.name} — ${option.category} — ${new Intl.NumberFormat(
                        'es-CO',
                        { style: 'currency', currency: 'COP' }
                      ).format(option.price || 0)}`
                    : ''
                }
                renderInput={(params) => (
                  <TextField
                    {...params}
                    label={`Producto #${idx + 1}`}
                    fullWidth
                  />
                )}
                isOptionEqualToValue={(opt, val) =>
                  opt.productId === val.productId
                }
                fullWidth
              />

              <TextField
                label="Unidades"
                type="number"
                value={it.unitQty}
                onChange={e => onItemChange(idx, 'unitQty', e.target.value)}
                fullWidth
                inputProps={{ min: 1 }}
              />

              <TextField
                label="Precio unitario (COP)"
                type="number"
                value={it.price}
                onChange={e => onItemChange(idx, 'price', e.target.value)}
                fullWidth
              />

              <TextField
                label="Subtotal (COP)"
                value={lineTotal(it)}
                fullWidth
                InputProps={{ readOnly: true }}
              />

              {items.length > 1 && (
                <Button
                  color="error"
                  onClick={() => removeItem(idx)}
                  sx={{ whiteSpace: 'nowrap' }}
                >
                  Quitar
                </Button>
              )}
            </Stack>
          );
        })}

        <Stack direction="row" justifyContent="flex-end" sx={{ mb: 2 }}>
          <IconButton
            onClick={addItem}
            disabled={submitting}
            title="Agregar producto"
          >
            <AddIcon />
          </IconButton>
        </Stack>

        {/* Total general */}
        <TextField
          label="Total general (COP)"
          fullWidth
          margin="normal"
          value={new Intl.NumberFormat('es-CO', {
            style: 'currency',
            currency: 'COP',
          }).format(totalGeneral || 0)}
          InputProps={{ readOnly: true }}
        />

        <Stack direction="row" justifyContent="flex-end" sx={{ mb: 3 }}>
          <Button
            variant="contained"
            onClick={submit}
            disabled={submitting || !header.saleDate}
            startIcon={submitting ? <CircularProgress size={18} /> : null}
          >
            Guardar ventas
          </Button>
        </Stack>

        {/* Historial de ventas colapsable */}
        <Box sx={{ mt: 2 }}>
          <Stack
            direction="row"
            alignItems="center"
            justifyContent="space-between"
            sx={{ mb: showSalesTable ? 1 : 0 }}
          >
            <Typography variant="h6">
              Historial de ventas
            </Typography>
            <Button
              size="small"
              onClick={() => setShowSalesTable(v => !v)}
            >
              {showSalesTable ? 'Ocultar' : 'Mostrar'}
            </Button>
          </Stack>

          {showSalesTable && (
            <TableContainer component={Paper}>
              <Table size="small">
                <TableHead>
                  <TableRow>
                    <TableCell>Fecha</TableCell>
                    <TableCell>Producto</TableCell>
                    <TableCell>Transacción</TableCell>
                    <TableCell>Canal</TableCell>
                    <TableCell align="right">Unidades</TableCell>
                    <TableCell align="right">Valor Venta</TableCell>
                    <TableCell>Pago</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {list.map(s => (
                    <TableRow key={s.saleId}>
                      <TableCell>{s.saleDate}</TableCell>
                      <TableCell>{getProductLabel(s.productId)}</TableCell>
                      <TableCell>{s.transactionType}</TableCell>
                      <TableCell>{s.channel}</TableCell>
                      <TableCell align="right">{s.unitQty}</TableCell>
                      <TableCell align="right">
                        {new Intl.NumberFormat('es-CO', {
                          style: 'currency',
                          currency: 'COP',
                        }).format(s.saleValue || 0)}
                      </TableCell>
                      <TableCell>{s.paymentMethod}</TableCell>
                    </TableRow>
                  ))}
                  {!loading && !list.length && (
                    <TableRow>
                      <TableCell colSpan={7} align="center">
                        Sin registros
                      </TableCell>
                    </TableRow>
                  )}
                  {loading && (
                    <TableRow>
                      <TableCell colSpan={7} align="center">
                        Cargando…
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </TableContainer>
          )}
        </Box>
      </Container>
    </Box>
  );
}
