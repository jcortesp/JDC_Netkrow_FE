import React, { useMemo, useState } from 'react';
import {
  Container,
  Box,
  Typography,
  TextField,
  Button,
  MenuItem,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
  Alert,
  Stack,
  IconButton,
  CircularProgress,
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import axiosClient from '../api/axiosClient';
import { useNavigate } from 'react-router-dom';

// UUID v4 simple (suficiente para idempotencia en app)
function uuidv4() {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, c => {
    const r = (Math.random() * 16) | 0;
    const v = c === 'x' ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
}

const EQUIPO_OPTS = [
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
];

export default function Remisiones() {
  const initialForm = {
    remissionId: '',
    totalValue: '',         // se muestra como solo lectura
    depositValue: '',
    depositMethod: ''
  };

  const [formValues, setFormValues] = useState(initialForm);
  const [equipos, setEquipos] = useState([{ equipo: '', valor: '' }]); // al menos uno
  const [openModal, setOpenModal] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const navigate = useNavigate();

  const totalCalculado = useMemo(() => {
    return equipos.reduce((acc, it) => {
      const v = parseFloat(String(it.valor).replace(',', '.'));
      return acc + (isNaN(v) ? 0 : v);
    }, 0);
  }, [equipos]);

  const handleChangeForm = (e) => {
    setFormValues({ ...formValues, [e.target.name]: e.target.value });
    setErrorMsg('');
  };

  const handleChangeEquipo = (idx, name, value) => {
    setEquipos(prev => prev.map((e,i) => i === idx ? { ...e, [name]: value } : e));
  };

  const addEquipo = () => {
    setEquipos(prev => [...prev, { equipo: '', valor: '' }]);
  };

  const validarEquipos = () => {
    if (equipos.length === 0) return 'Debe ingresar al menos un equipo';
    for (const e of equipos) {
      if (!e.equipo) return 'Seleccione el tipo de equipo';
      const v = parseFloat(String(e.valor).replace(',', '.'));
      if (isNaN(v) || v < 0) return 'Ingrese un valor válido (>= 0) para cada equipo';
    }
    return '';
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (isSubmitting) return;

    setIsSubmitting(true);
    setErrorMsg('');

    // Validaciones front rápidas
    if (!formValues.remissionId?.trim()) {
      setErrorMsg('Ingrese el ID de remisión.');
      setIsSubmitting(false);
      return;
    }
    const errEq = validarEquipos();
    if (errEq) {
      setErrorMsg(errEq);
      setIsSubmitting(false);
      return;
    }
    const abono = parseFloat(String(formValues.depositValue).replace(',', '.'));
    if (isNaN(abono) || abono < 0) {
      setErrorMsg('Ingrese un valor de abono válido (>= 0).');
      setIsSubmitting(false);
      return;
    }
    if (!formValues.depositMethod) {
      setErrorMsg('Seleccione un método de abono.');
      setIsSubmitting(false);
      return;
    }

    try {
      // 1) Crear remisión con total calculado
      const payloadRem = {
        remissionId: formValues.remissionId,
        totalValue: totalCalculado,
        depositValue: abono,
        metodoAbono: formValues.depositMethod, // si tu backend espera depositMethod, cambia aquí
        depositMethod: formValues.depositMethod // por compat — ignora si backend no lo usa
      };

      await axiosClient.post(
        '/remissions',
        payloadRem,
        { headers: { 'Idempotency-Key': uuidv4() } }
      );

      // 2) Crear registros técnicos (equipo + valor) contra el remissionId ingresado
      const remId = formValues.remissionId.trim();

      // Secuencial para simplificar manejo de errores y garantizar orden
      for (const eItem of equipos) {
        const valorNum = parseFloat(String(eItem.valor).replace(',', '.')) || 0;
        const body = {
          equipo: eItem.equipo,
          valor: valorNum
        };
        await axiosClient.post(`/remissions/${encodeURIComponent(remId)}/technical-records`, body);
      }

      // 3) Abrir modal de “ingresar info técnica”
      setOpenModal(true);

      // IMPORTANTE: devolvemos aquí para evitar ejecutar reset en un finally antes de mostrar modal
      setIsSubmitting(false);
      return;
    } catch (error) {
      const msg =
        error?.response?.data?.message ||
        error?.message ||
        'Error al ingresar remisión';
      setErrorMsg(msg);
    } finally {
      // Si no hicimos el return anterior (hubo error), aseguramos desbloqueo:
      setIsSubmitting(false);
    }
  };

  const handleIngrInfoTecnica = () => {
    setOpenModal(false);
    const remId = formValues.remissionId;
    // Reseteamos el formulario para la próxima, pero después de navegar
    navigate('/servicio-tecnico', { state: { remissionId: remId } });
    setFormValues(initialForm);
    setEquipos([{ equipo: '', valor: '' }]);
  };

  const handleIngrDespues = () => {
    setOpenModal(false);
    setFormValues(initialForm);
    setEquipos([{ equipo: '', valor: '' }]);
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
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        p: 4
      }}
    >
      <Container
        maxWidth="sm"
        sx={{ backgroundColor: 'rgba(255,255,255,0.8)', p: 3, borderRadius: 2 }}
      >
        <Typography variant="h5" align="center" gutterBottom>
          Ingresar Remisión
        </Typography>

        {errorMsg && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {errorMsg}
          </Alert>
        )}

        <Box
          component="form"
          onSubmit={handleSubmit}
          sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}
        >
          <TextField
            label="ID de remisión"
            name="remissionId"
            value={formValues.remissionId}
            onChange={handleChangeForm}
            fullWidth
            required
          />

          {/* Lista dinámica de equipos */}
          <Typography variant="subtitle1" sx={{ mt: 1 }}>
            Equipos de la remisión
          </Typography>

          {equipos.map((e, idx) => (
            <Stack key={idx} direction="row" gap={2}>
              <TextField
                select
                label={`Equipo #${idx + 1}`}
                value={e.equipo}
                onChange={(ev) => handleChangeEquipo(idx, 'equipo', ev.target.value)}
                fullWidth
                required
                InputLabelProps={{ shrink: true }}
              >
                {EQUIPO_OPTS.map(opt => (
                  <MenuItem key={opt} value={opt}>{opt}</MenuItem>
                ))}
              </TextField>

              <TextField
                label="Valor (COP)"
                type="number"
                inputProps={{ step: '0.01', min: '0' }}
                value={e.valor}
                onChange={(ev) => handleChangeEquipo(idx, 'valor', ev.target.value)}
                fullWidth
                required
                InputLabelProps={{ shrink: true }}
              />
            </Stack>
          ))}

          <Stack direction="row" justifyContent="flex-end">
            <IconButton onClick={addEquipo} title="Agregar equipo" disabled={isSubmitting}>
              <AddIcon />
            </IconButton>
          </Stack>

          {/* Total solo lectura */}
          <TextField
            label="Valor Total (COP)"
            name="totalValue"
            type="number"
            value={totalCalculado}
            fullWidth
            InputProps={{ readOnly: true }}
            helperText="Se calcula automáticamente sumando los valores de los equipos"
          />

          {/* Abono y método */}
          <TextField
            label="Valor Abono (COP)"
            name="depositValue"
            type="number"
            value={formValues.depositValue}
            onChange={handleChangeForm}
            fullWidth
            required
          />
          <TextField
            select
            label="Método Abono"
            name="depositMethod"
            value={formValues.depositMethod}
            onChange={handleChangeForm}
            fullWidth
            required
          >
            <MenuItem value="Efectivo">Efectivo</MenuItem>
            <MenuItem value="Tarjeta">Tarjeta</MenuItem>
            <MenuItem value="Transferencia">Transferencia</MenuItem>
          </TextField>

          <Button
            type="submit"
            variant="contained"
            fullWidth
            disabled={isSubmitting}
            startIcon={isSubmitting ? <CircularProgress size={18} /> : null}
          >
            {isSubmitting ? 'Ingresando…' : 'Ingresar'}
          </Button>
        </Box>
      </Container>

      <Dialog open={openModal} onClose={handleIngrDespues}>
        <DialogTitle>Remisión ingresada</DialogTitle>
        <DialogContent>
          <DialogContentText>
            ¿Desea ingresar información técnica ahora?
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleIngrDespues} disabled={isSubmitting}>
            Ingresar Después
          </Button>
          <Button onClick={handleIngrInfoTecnica} variant="contained" disabled={isSubmitting}>
            Ingresar información técnica
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
