import React, { useState, useEffect } from 'react';
import {
  Container,
  Box,
  Typography,
  TextField,
  Button,
  MenuItem
} from '@mui/material';
import { useLocation } from 'react-router-dom';
import axiosClient from '../api/axiosClient';

export default function ServicioTecnico() {
  const location = useLocation();
  const prefilled = location.state?.remissionId || '';

  const initialForm = {
    remissionId: '',
    equipo: '',
    marca: '',
    serial: '',
    brazalete: '',
    pilas: '',
    revision: '',
    mantenimiento: '',
    limpieza: '',
    calibracion: '',
    notasDiagnostico: ''
  };

  const [form, setForm] = useState({ ...initialForm, remissionId: prefilled });
  const [found, setFound] = useState(false);
  const [readOnly, setReadOnly] = useState(false);

  useEffect(() => {
    if (prefilled) fetchRemision(prefilled);
    // eslint-disable-next-line
  }, []);

  const fetchRemision = async (id) => {
    try {
      const { data } = await axiosClient.get(`/remissions/${id}`);
      setForm({
        remissionId: data.remissionId || '',
        equipo: data.equipo || '',
        marca: data.marca || '',
        serial: data.serial || '',
        brazalete: data.brazalete || '',
        pilas: data.pilas || '',
        revision: data.revision || '',
        mantenimiento: data.mantenimiento || '',
        limpieza: data.limpieza || '',
        calibracion: data.calibracion || '',
        notasDiagnostico: data.notasDiagnostico || ''
      });
      setFound(true);
      if (data.fechaSalida) {
        setReadOnly(true);
        alert('Esta remisión ya fue entregada. No puede modificar datos técnicos.');
      } else {
        setReadOnly(false);
      }
    } catch {
      setFound(false);
      alert('No se encontró la remisión');
    }
  };

  const handleSearch = () => {
    if (!form.remissionId) return alert('Ingresa ID de remisión');
    fetchRemision(form.remissionId);
  };

  const handleChange = e => {
    const { name, value } = e.target;
    setForm(f => ({ ...f, [name]: value }));
  };

  const handleSubmit = async e => {
    e.preventDefault();
    try {
      await axiosClient.put(
        `/remissions/${form.remissionId}/technical`,
        {
          equipo: form.equipo,
          marca: form.marca,
          serial: form.serial,
          brazalete: form.brazalete,
          pilas: form.pilas,
          revision: form.revision,
          mantenimiento: form.mantenimiento,
          limpieza: form.limpieza,
          calibracion: form.calibracion,
          notasDiagnostico: form.notasDiagnostico
        }
      );
      alert('Información técnica guardada');
      setForm({ ...initialForm, remissionId: '' });
      setFound(false);
      setReadOnly(false);
    } catch {
      alert('Error al guardar');
    }
  };

  const borderStyle = val => ({
    '& .MuiOutlinedInput-root fieldset': {
      borderColor: val ? 'green' : 'darkgoldenrod'
    },
    '& .MuiOutlinedInput-root.Mui-focused fieldset': {
      borderColor: val ? 'green' : 'darkgoldenrod'
    }
  });

  return (
    <Box
      sx={{
        minHeight: '100vh',
        backgroundImage:
          'url("https://medicalmuneras.com/wp-content/uploads/2023/04/Imagen-1_auto_x2-scaled.jpg")',
        backgroundSize: 'cover',
        backgroundRepeat: 'no-repeat',
        backgroundPosition: 'center',
        py: 4,
        px: 2
      }}
    >
      <Container
        maxWidth="sm"
        sx={{ backgroundColor: 'rgba(255,255,255,0.8)', p: 3, borderRadius: 2 }}
      >
        <Typography variant="h5" align="center" gutterBottom>
          Servicio Técnico
        </Typography>

        <Box sx={{ display: 'flex', gap: 2, mb: 2 }}>
          <TextField
            label="Remisión"
            name="remissionId"
            value={form.remissionId}
            onChange={handleChange}
            fullWidth
            InputLabelProps={{ shrink: true }}
          />
          <Button variant="outlined" onClick={handleSearch}>
            Buscar
          </Button>
        </Box>

        {found && (
          <Box
            component="form"
            onSubmit={handleSubmit}
            sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}
          >
            {/* Datos generales */}
            <TextField
              select
              label="Equipo"
              name="equipo"
              value={form.equipo}
              onChange={handleChange}
              fullWidth
              disabled={readOnly}
              sx={borderStyle(form.equipo)}
              InputLabelProps={{ shrink: true }}
            >
              {[
                'Tensiometro digital',
                'Tensiometro analogico',
                'Tensiometro de muñeca',
                'Bascula digital',
                'Bascula analogica',
                'Glucometro',
                'Nebulizador',
                'Termometro',
                'Termohidrometro',
                'Oximetro',
                'Concentrado de Oxigeno',
                'TEMS',
                'Otro'
              ].map(opt => (
                <MenuItem key={opt} value={opt}>{opt}</MenuItem>
              ))}
            </TextField>

            <TextField
              label="Marca"
              name="marca"
              value={form.marca}
              onChange={handleChange}
              fullWidth
              disabled={readOnly}
              sx={borderStyle(form.marca)}
              InputLabelProps={{ shrink: true }}
            />
            <TextField
              label="Serial"
              name="serial"
              value={form.serial}
              onChange={handleChange}
              fullWidth
              disabled={readOnly}
              sx={borderStyle(form.serial)}
              InputLabelProps={{ shrink: true }}
            />

            {/* Sección Diagnóstico */}
            <Typography variant="h6" sx={{ mt: 2 }}>
              Diagnóstico
            </Typography>
            <Box sx={{ border: '1px solid rgba(0,0,0,0.23)', borderRadius: 1, p: 2, display: 'flex', flexDirection: 'column', gap: 2 }}>
              <TextField
                select
                label="Brazalete"
                name="brazalete"
                value={form.brazalete}
                onChange={handleChange}
                fullWidth
                disabled={readOnly}
                sx={borderStyle(form.brazalete)}
                InputLabelProps={{ shrink: true }}
              >
                {['OK', 'Fuga', 'Desgaste', 'N/A'].map(v => (
                  <MenuItem key={v} value={v}>{v}</MenuItem>
                ))}
              </TextField>
              <TextField
                select
                label="Pilas"
                name="pilas"
                value={form.pilas}
                onChange={handleChange}
                fullWidth
                disabled={readOnly}
                sx={borderStyle(form.pilas)}
                InputLabelProps={{ shrink: true }}
              >
                {['Cambio', 'Recargable', 'Carbon', 'Adaptador OK', 'Adaptador dañado', 'N/A'].map(v => (
                  <MenuItem key={v} value={v}>{v}</MenuItem>
                ))}
              </TextField>
              <TextField
                select
                label="Revisión"
                name="revision"
                value={form.revision}
                onChange={handleChange}
                fullWidth
                disabled={readOnly}
                sx={borderStyle(form.revision)}
                InputLabelProps={{ shrink: true }}
              >
                {['Ok', 'Pendiente'].map(v => (
                  <MenuItem key={v} value={v}>{v}</MenuItem>
                ))}
              </TextField>
              <TextField
                select
                label="Mantenimiento"
                name="mantenimiento"
                value={form.mantenimiento}
                onChange={handleChange}
                fullWidth
                disabled={readOnly}
                sx={borderStyle(form.mantenimiento)}
                InputLabelProps={{ shrink: true }}
              >
                {['Ok', 'Pendiente'].map(v => (
                  <MenuItem key={v} value={v}>{v}</MenuItem>
                ))}
              </TextField>
              <TextField
                select
                label="Limpieza"
                name="limpieza"
                value={form.limpieza}
                onChange={handleChange}
                fullWidth
                disabled={readOnly}
                sx={borderStyle(form.limpieza)}
                InputLabelProps={{ shrink: true }}
              >
                {['Ok', 'Pendiente'].map(v => (
                  <MenuItem key={v} value={v}>{v}</MenuItem>
                ))}
              </TextField>
              <TextField
                select
                label="Calibración"
                name="calibracion"
                value={form.calibracion}
                onChange={handleChange}
                fullWidth
                disabled={readOnly}
                sx={borderStyle(form.calibracion)}
                InputLabelProps={{ shrink: true }}
              >
                {['Ok', 'Pendiente'].map(v => (
                  <MenuItem key={v} value={v}>{v}</MenuItem>
                ))}
              </TextField>
              <TextField
                label="Notas Diagnóstico"
                name="notasDiagnostico"
                value={form.notasDiagnostico}
                onChange={handleChange}
                fullWidth
                multiline
                rows={3}
                disabled={readOnly}
                inputProps={{ maxLength: 100 }}
                sx={borderStyle(form.notasDiagnostico)}
                InputLabelProps={{ shrink: true }}
              />
            </Box>

            {!readOnly && (
              <Button type="submit" variant="contained" fullWidth sx={{ mt: 2 }}>
                Enviar información técnica
              </Button>
            )}
          </Box>
        )}
      </Container>
    </Box>
  );
}
