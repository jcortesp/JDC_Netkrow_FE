import React, { useEffect, useState } from 'react';
import {
  Box, Container, Typography, Stack, TextField, Button,
  Table, TableHead, TableRow, TableCell, TableBody, Paper, TableContainer,
  Alert, CircularProgress
} from '@mui/material';
import axiosClient from '../api/axiosClient';

export default function ProductsPage() {
  const [list, setList] = useState([]);
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState({
    category: '',
    type: '',
    name: '',
    price: '',
    code: '',
    brand: '',
    status: 'ACTIVE'
  });

  const load = async () => {
    setLoading(true);
    setError('');
    try {
      const resp = await axiosClient.get('/products');
      setList(Array.isArray(resp.data) ? resp.data : []);
    } catch (e) {
      setError(e.response?.data?.message || e.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  const onChange = (k, v) => {
    setForm(prev => ({ ...prev, [k]: v }));
    setError('');
    setSuccessMsg('');
  };

  const reset = () => {
    setEditingId(null);
    setForm({
      category: '',
      type: '',
      name: '',
      price: '',
      code: '',
      brand: '',
      status: 'ACTIVE'
    });
  };

  const submit = async () => {
    setSubmitting(true);
    setError('');
    setSuccessMsg('');
    try {
      const payload = {
        ...form,
        price: form.price === '' ? null : Number(form.price)
      };
      if (!payload.category || !payload.type || !payload.name || !payload.code || !payload.brand) {
        throw new Error('Completa categoría, tipo, producto, código y marca.');
      }
      if (editingId) {
        await axiosClient.put(`/products/${editingId}`, payload);
        setSuccessMsg('Producto actualizado correctamente.');
      } else {
        await axiosClient.post('/products', payload);
        setSuccessMsg('Producto creado correctamente.');
      }
      reset();
      await load();
    } catch (e) {
      setError(e.response?.data?.message || e.message || 'Error al guardar producto');
    } finally {
      setSubmitting(false);
    }
  };

  const startEdit = (p) => {
    setEditingId(p.productId);
    setForm({
      category: p.category ?? '',
      type: p.type ?? '',
      name: p.name ?? '',
      price: p.price ?? '',
      code: p.code ?? '',
      brand: p.brand ?? '',
      status: p.status ?? 'ACTIVE'
    });
    setError('');
    setSuccessMsg('');
  };

  const remove = async (id) => {
    if (!window.confirm('¿Eliminar producto?')) return;
    setSubmitting(true);
    setError('');
    setSuccessMsg('');
    try {
      await axiosClient.delete(`/products/${id}`);
      if (editingId === id) reset();
      await load();
      setSuccessMsg('Producto eliminado.');
    } catch (e) {
      setError(e.response?.data?.message || e.message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Box sx={{ minHeight: '100vh', py: 4, background: '#f5f5f5' }}>
      <Container maxWidth="md" sx={{ bgcolor: '#fff', p: 4, borderRadius: 2 }}>
        <Typography variant="h5" align="center" gutterBottom>
          Maestro de Productos
        </Typography>

        {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
        {successMsg && <Alert severity="success" sx={{ mb: 2 }}>{successMsg}</Alert>}

        <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} sx={{ mb: 2 }}>
          <TextField label="Categoría" value={form.category} onChange={e => onChange('category', e.target.value)} fullWidth />
          <TextField label="Tipo" value={form.type} onChange={e => onChange('type', e.target.value)} fullWidth />
        </Stack>

        <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} sx={{ mb: 2 }}>
          <TextField label="Producto" value={form.name} onChange={e => onChange('name', e.target.value)} fullWidth />
          <TextField label="Precio" type="number" value={form.price} onChange={e => onChange('price', e.target.value)} fullWidth />
        </Stack>

        <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} sx={{ mb: 2 }}>
          <TextField label="Código" value={form.code} onChange={e => onChange('code', e.target.value)} fullWidth />
          <TextField label="Marca" value={form.brand} onChange={e => onChange('brand', e.target.value)} fullWidth />
          <TextField label="Estado" value={form.status} onChange={e => onChange('status', e.target.value)} fullWidth />
        </Stack>

        <Stack direction="row" spacing={2} sx={{ mb: 3 }} justifyContent="flex-end">
          <Button variant="outlined" onClick={reset} disabled={submitting}>Limpiar</Button>
          <Button
            variant="contained"
            onClick={submit}
            disabled={submitting}
            startIcon={submitting ? <CircularProgress size={18} /> : null}
          >
            {editingId ? 'Actualizar' : 'Crear'}
          </Button>
        </Stack>

        <TableContainer component={Paper}>
          <Table size="small">
            <TableHead>
              <TableRow>
                <TableCell>ID</TableCell>
                <TableCell>Categoría</TableCell>
                <TableCell>Tipo</TableCell>
                <TableCell>Producto</TableCell>
                <TableCell>Código</TableCell>
                <TableCell>Marca</TableCell>
                <TableCell align="right">Precio</TableCell>
                <TableCell>Estado</TableCell>
                <TableCell align="right">Acciones</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {list.map(p => (
                <TableRow key={p.productId} hover>
                  <TableCell>{p.productId}</TableCell>
                  <TableCell>{p.category}</TableCell>
                  <TableCell>{p.type}</TableCell>
                  <TableCell>{p.name}</TableCell>
                  <TableCell>{p.code}</TableCell>
                  <TableCell>{p.brand}</TableCell>
                  <TableCell align="right">
                    {new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP' }).format(p.price || 0)}
                  </TableCell>
                  <TableCell>{p.status}</TableCell>
                  <TableCell align="right">
                    <Stack direction="row" spacing={1} justifyContent="flex-end">
                      <Button size="small" onClick={() => startEdit(p)}>Editar</Button>
                      <Button size="small" color="error" onClick={() => remove(p.productId)}>Eliminar</Button>
                    </Stack>
                  </TableCell>
                </TableRow>
              ))}
              {!loading && !list.length && (
                <TableRow><TableCell colSpan={9} align="center">Sin registros</TableCell></TableRow>
              )}
              {loading && (
                <TableRow><TableCell colSpan={9} align="center">Cargando…</TableCell></TableRow>
              )}
            </TableBody>
          </Table>
        </TableContainer>
      </Container>
    </Box>
  );
}
