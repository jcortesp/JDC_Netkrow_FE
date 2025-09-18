import React, { useState, useEffect, useCallback } from 'react';
import {
  Container,
  Box,
  Typography,
  TextField,
  Button,
  MenuItem,
  Grid,
  Stack,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
  InputAdornment,
  Alert,
  Chip,
  Divider,
  IconButton,
  Tooltip,
  LinearProgress,
  CircularProgress,
} from '@mui/material';
import axiosClient from '../api/axiosClient';
import { useLocation } from 'react-router-dom';
import DoNotDisturbOnIcon from '@mui/icons-material/DoNotDisturbOn';
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';
import ReceiptLongIcon from '@mui/icons-material/ReceiptLong';
import LocalAtmIcon from '@mui/icons-material/LocalAtm';
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutline';

export default function SearchRemission() {
  const location = useLocation();
  const initialId = location.state?.remissionId || '';

  // Remisión
  const [remissionId, setRemissionId] = useState(initialId);
  const [remissionData, setRemissionData] = useState(null);
  const [loading, setLoading] = useState(false);

  // Equipos (registros técnicos)
  const [records, setRecords] = useState([]);

  // Mensajes
  const [message, setMessage] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  // Entrega (saldo)
  const [deliveryMethod, setDeliveryMethod] = useState('');
  const [originalHasGarantia, setOriginalHasGarantia] = useState(false);
  const [isDelivering, setIsDelivering] = useState(false); // ⟵ NUEVO

  // Dialogs: baja global
  const [openDropDialog, setOpenDropDialog] = useState(false);
  const [openRevisionDialog, setOpenRevisionDialog] = useState(false);
  const [revisionValueInput, setRevisionValueInput] = useState('');

  // Dialogs: baja por equipo
  const [openDropDialogRec, setOpenDropDialogRec] = useState(false);
  const [openRevisionDialogRec, setOpenRevisionDialogRec] = useState(false);
  const [selectedRecordId, setSelectedRecordId] = useState(null);
  const [revisionValueInputRec, setRevisionValueInputRec] = useState('');

  const formatMoney = (val) =>
    val == null
      ? ''
      : new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP' }).format(val);

  const fetchById = useCallback(async (id) => {
    setMessage('');
    setErrorMsg('');
    setRemissionData(null);
    setRecords([]);
    setOriginalHasGarantia(false);
    if (!id) return;

    setLoading(true);
    try {
      const { data } = await axiosClient.get(`/remissions/${id}`);
      setRemissionData(data);

      // cargar equipos
      try {
        const res = await axiosClient.get(`/remissions/${id}/technical-records`);
        setRecords(res.data || []);
      } catch (e) {
        setRecords([]);
      }

      // verificar garantía (solo para remisión original)
      if (!id.endsWith('-G')) {
        try {
          await axiosClient.get(`/remissions/${id}-G`);
          setOriginalHasGarantia(true);
        } catch {
          setOriginalHasGarantia(false);
        }
      }
    } catch (err) {
      const status = err.response?.status;
      if (status === 400 || status === 404) {
        setErrorMsg('No se encontró la remisión');
      } else {
        setErrorMsg('Error al comunicar con el servidor');
      }
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (initialId) fetchById(initialId);
  }, [initialId, fetchById]);

  const handleSearch = async (e) => {
    e?.preventDefault();
    await fetchById(remissionId);
  };

  // ───────────────────────────────
  // Entrega / Estados de remisión
  // ───────────────────────────────
  const handleDeliver = async (e) => {
    if (e?.currentTarget) e.currentTarget.blur(); // evita warning aria-hidden
    if (isDelivering) return;
    setIsDelivering(true);
    setMessage('');
    setErrorMsg('');
    try {
      const { data } = await axiosClient.put(
        `/remissions/deliver/${remissionData.remissionId}`,
        { metodoSaldo: deliveryMethod }
      );
      setRemissionData(data);
      setMessage('Remisión entregada correctamente.');
    } catch (e2) {
      const msg =
        e2?.response?.data?.message ||
        e2?.message ||
        'Error al entregar remisión';
      setErrorMsg(msg);
    } finally {
      setIsDelivering(false);
    }
  };

  // ───────────────────────────────
  // Baja global (remisión completa)
  // ───────────────────────────────
  const handleSelectDrop = (choice, e) => {
    if (e?.currentTarget) e.currentTarget.blur(); // evita warning aria-hidden
    setOpenDropDialog(false);
    setMessage('');
    setErrorMsg('');
    if (choice) {
      setRevisionValueInput('');
      setOpenRevisionDialog(true);
    } else {
      performDrop(false, null);
    }
  };

  const performDrop = async (cobrarRevision, revisionValue) => {
    setMessage('');
    setErrorMsg('');
    try {
      const { data } = await axiosClient.put(
        `/remissions/${remissionData.remissionId}/dar-baja`,
        { cobrarRevision, revisionValue }
      );
      setRemissionData(data);
      setMessage(
        cobrarRevision
          ? 'Remisión dada de baja con cobro de revisión.'
          : 'Remisión dada de baja sin cobro.'
      );
      await fetchById(data.remissionId);
    } catch (e) {
      const msg =
        e?.response?.data?.message ||
        e?.message ||
        'Error al dar de baja la remisión';
      setErrorMsg(msg);
    }
  };

  const handleConfirmRevision = () => {
    const parsed = parseFloat(String(revisionValueInput).replace(',', '.'));
    if (isNaN(parsed) || parsed < 0) {
      setErrorMsg('Valor de revisión inválido');
      return;
    }
    setOpenRevisionDialog(false);
    performDrop(true, parsed);
  };

  // ───────────────────────────────
  // Garantía
  // ───────────────────────────────
  const handleGarantia = async () => {
    setMessage('');
    setErrorMsg('');
    try {
      const { data } = await axiosClient.put(
        `/remissions/${remissionData.remissionId}/garantia`
      );
      setRemissionId(data.remissionId);
      setOriginalHasGarantia(true);
      await fetchById(data.remissionId);
    } catch (e) {
      const msg = e?.response?.data?.message || e?.message || 'Error al ingresar garantía';
      setErrorMsg(msg);
    }
  };

  const handleSacarGarantia = async () => {
    setMessage('');
    setErrorMsg('');
    try {
      const { data } = await axiosClient.put(
        `/remissions/${remissionData.remissionId}/garantia/sacar`
      );
      setRemissionData(data);
      setMessage('Garantía cerrada exitosamente.');
    } catch (e) {
      const msg = e?.response?.data?.message || e?.message || 'Error al cerrar garantía';
      setErrorMsg(msg);
    }
  };

  // ───────────────────────────────
  // Baja por equipo (registro técnico)
  // ───────────────────────────────
  const handleEquipOpenDrop = (recordId, e) => {
    if (e?.currentTarget) e.currentTarget.blur(); // evita warning aria-hidden
    setSelectedRecordId(recordId);
    setMessage('');
    setErrorMsg('');
    setOpenDropDialogRec(true);
  };

  const handleEquipSelectDrop = (choice, e) => {
    if (e?.currentTarget) e.currentTarget.blur(); // evita warning aria-hidden
    setOpenDropDialogRec(false);
    if (choice) {
      setRevisionValueInputRec('');
      setOpenRevisionDialogRec(true);
    } else {
      performDropRecord(false, null);
    }
  };

  const performDropRecord = async (cobrarRevision, revisionValue) => {
    if (!selectedRecordId || !remissionData) return;
    setMessage('');
    setErrorMsg('');
    try {
      await axiosClient.put(
        `/remissions/${remissionData.remissionId}/technical-records/${selectedRecordId}/drop`,
        { cobrarRevision, revisionValue }
      );
      await fetchById(remissionData.remissionId);
      setMessage(
        cobrarRevision
          ? 'Equipo dado de baja con cobro de revisión.'
          : 'Equipo dado de baja sin cobro.'
      );
    } catch (e) {
      const msg =
        e?.response?.data?.message ||
        e?.message ||
        'Error al dar de baja el equipo';
      setErrorMsg(msg);
    } finally {
      setSelectedRecordId(null);
    }
  };

  const handleConfirmRevisionRec = () => {
    const parsed = parseFloat(String(revisionValueInputRec).replace(',', '.'));
    if (isNaN(parsed) || parsed < 0) {
      setErrorMsg('Valor de revisión inválido');
      return;
    }
    setOpenRevisionDialogRec(false);
    performDropRecord(true, parsed);
  };

  // ───────────────────────────────
  // Render
  // ───────────────────────────────
  return (
    <Box
      sx={{
        minHeight: '100vh',
        backgroundImage:
          'url("https://medicalmuneras.com/wp-content/uploads/2023/04/Imagen-1_auto_x2-scaled.jpg")',
        backgroundSize: 'cover',
        backgroundRepeat: 'no-repeat',
        backgroundPosition: 'center',
        p: 4,
      }}
    >
      <Container
        maxWidth="md"
        sx={{ backgroundColor: 'rgba(255,255,255,0.9)', p: 3, borderRadius: 2 }}
      >
        <Typography variant="h5" align="center" gutterBottom>
          Entrega de equipo
        </Typography>

        <Box
          component="form"
          onSubmit={handleSearch}
          sx={{ display: 'flex', gap: 2, alignItems: 'center', mb: 2 }}
        >
          <TextField
            label="ID de Remisión"
            value={remissionId}
            onChange={(e) => setRemissionId(e.target.value)}
            fullWidth
            required
          />
          <Button type="submit" variant="contained" startIcon={<ReceiptLongIcon />}>
            Buscar
          </Button>
        </Box>

        {loading && <LinearProgress sx={{ mb: 2 }} />}

        {!!errorMsg && (
          <Alert severity="error" onClose={() => setErrorMsg('')} sx={{ mb: 2 }}>
            {errorMsg}
          </Alert>
        )}
        {!!message && (
          <Alert severity="success" onClose={() => setMessage('')} sx={{ mb: 2 }}>
            {message}
          </Alert>
        )}

        {remissionData && (
          <>
            <Box sx={{ textAlign: 'center', mt: 1, mb: 2 }}>
              <Typography
                sx={{
                  fontWeight: 'bold',
                  color: remissionData.fechaSalida ? 'green' : 'red',
                  textTransform: 'uppercase',
                }}
              >
                {remissionData.remissionId.endsWith('-G')
                  ? remissionData.fechaSalida
                    ? 'GARANTÍA ENTREGADA'
                    : 'GARANTÍA PENDIENTE'
                  : remissionData.fechaSalida
                    ? 'ENTREGADO'
                    : 'PENDIENTE'}
              </Typography>
            </Box>

            <Grid container spacing={1} sx={{ mt: 1 }}>
              <Grid item xs={4}>
                <strong>ID:</strong>
              </Grid>
              <Grid item xs={8}>
                {remissionData.remissionId}
              </Grid>
              <Grid item xs={4}>
                <strong>Fecha ingreso:</strong>
              </Grid>
              <Grid item xs={8}>
                {new Date(remissionData.createdAt).toLocaleString()}
              </Grid>

              {!remissionData.remissionId.endsWith('-G') && (
                <>
                  <Grid item xs={4}>
                    <strong>Total:</strong>
                  </Grid>
                  <Grid item xs={8}>
                    {formatMoney(remissionData.totalValue)}
                  </Grid>
                  <Grid item xs={4}>
                    <strong>Abono:</strong>
                  </Grid>
                  <Grid item xs={8}>
                    {formatMoney(remissionData.depositValue)}
                  </Grid>
                  <Grid item xs={4}>
                    <strong>Método abono:</strong>
                  </Grid>
                  <Grid item xs={8}>
                    {remissionData.metodoAbono || 'N/A'}
                  </Grid>
                  <Grid item xs={4}>
                    <strong>Saldo:</strong>
                  </Grid>
                  <Grid item xs={8}>
                    {formatMoney(remissionData.saldo)}
                  </Grid>
                  {remissionData.fechaSalida && (
                    <>
                      <Grid item xs={4}>
                        <strong>Método pago saldo:</strong>
                      </Grid>
                      <Grid item xs={8}>
                        {remissionData.metodoSaldo}
                      </Grid>
                      <Grid item xs={4}>
                        <strong>Fecha salida:</strong>
                      </Grid>
                      <Grid item xs={8}>
                        {new Date(remissionData.fechaSalida).toLocaleString()}
                      </Grid>
                    </>
                  )}
                </>
              )}

              {remissionData.remissionId.endsWith('-G') && remissionData.fechaSalida && (
                <>
                  <Grid item xs={4}>
                    <strong>Fecha salida:</strong>
                  </Grid>
                  <Grid item xs={8}>
                    {new Date(remissionData.fechaSalida).toLocaleString()}
                  </Grid>
                </>
              )}
            </Grid>

            {/* Lista de equipos */}
            {!remissionData.remissionId.endsWith('-G') && (
              <>
                <Divider sx={{ my: 2 }} />
                <Typography variant="h6" gutterBottom>
                  Equipos en la remisión
                </Typography>

                {records.length === 0 && (
                  <Typography color="text.secondary" sx={{ mb: 1 }}>
                    No hay equipos registrados para esta remisión.
                  </Typography>
                )}

                <Stack spacing={1}>
                  {records.map((r) => {
                    const isBaja = !!r.dadoBaja;
                    return (
                      <Box
                        key={r.id}
                        sx={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: 1,
                          p: 1.5,
                          border: '1px solid #e0e0e0',
                          borderRadius: 1,
                          bgcolor: isBaja ? 'rgba(255,0,0,0.03)' : 'rgba(0,128,0,0.03)',
                        }}
                      >
                        <Box sx={{ flex: 1, minWidth: 0 }}>
                          <Typography sx={{ fontWeight: 600 }}>
                            {r.equipo} {r.marca ? `— ${r.marca}` : ''}
                          </Typography>
                          <Typography variant="body2" color="text.secondary">
                            Valor: {formatMoney(r.valor)} {r.serial ? ` | Serial: ${r.serial}` : ''}
                          </Typography>
                          {isBaja ? (
                            <Stack direction="row" spacing={1} alignItems="center" sx={{ mt: 0.5 }}>
                              <Chip
                                size="small"
                                color="error"
                                icon={<DoNotDisturbOnIcon />}
                                label="Dado de baja"
                              />
                              <Typography variant="body2" color="text.secondary">
                                {r.fechaBaja
                                  ? `(${new Date(r.fechaBaja).toLocaleString()})`
                                  : ''}
                                {typeof r.revisionValor === 'number'
                                  ? ` — Revisión: ${formatMoney(r.revisionValor)}`
                                  : ''}
                              </Typography>
                            </Stack>
                          ) : (
                            <Chip
                              size="small"
                              color="success"
                              icon={<CheckCircleOutlineIcon />}
                              label="Activo"
                              sx={{ mt: 0.5 }}
                            />
                          )}
                        </Box>

                        {!isBaja && !remissionData.fechaSalida && (
                          <Tooltip title="Dar de baja este equipo">
                            <IconButton
                              color="error"
                              onClick={(e) => {
                                if (e?.currentTarget) e.currentTarget.blur();
                                setSelectedRecordId(r.id);
                                setOpenDropDialogRec(true);
                              }}
                              size="small"
                            >
                              <DeleteOutlineIcon />
                            </IconButton>
                          </Tooltip>
                        )}
                      </Box>
                    );
                  })}
                </Stack>
              </>
            )}

            {/* Acciones principales */}
            <Stack spacing={2} sx={{ mt: 3 }}>
              {!remissionData.fechaSalida && !remissionData.remissionId.endsWith('-G') && (
                <>
                  <TextField
                    select
                    label="Método de pago del saldo"
                    value={deliveryMethod}
                    onChange={(e) => setDeliveryMethod(e.target.value)}
                    fullWidth
                    required
                    disabled={isDelivering} // ⟵ bloquea mientras entrega
                  >
                    <MenuItem value="Efectivo">Efectivo</MenuItem>
                    <MenuItem value="Tarjeta">Tarjeta</MenuItem>
                    <MenuItem value="Transferencia">Transferencia</MenuItem>
                  </TextField>
                  <Button
                    variant="contained"
                    onClick={handleDeliver}
                    startIcon={isDelivering ? <CircularProgress size={18} /> : <LocalAtmIcon />}
                    disabled={isDelivering} // ⟵ bloquea doble click
                  >
                    {isDelivering ? 'Procesando…' : 'SACAR REMISION (todos los equipos)'}
                  </Button>
                  <Button
                    variant="outlined"
                    color="error"
                    onClick={(e) => {
                      if (isDelivering) return; // evita acciones mientras entrega
                      if (e?.currentTarget) e.currentTarget.blur();
                      setOpenDropDialog(true);
                    }}
                  >
                    Dar de baja remisión completa
                  </Button>
                </>
              )}

              {!remissionData.remissionId.endsWith('-G') &&
                remissionData.fechaSalida &&
                !originalHasGarantia && (
                  <Button variant="outlined" color="secondary" onClick={handleGarantia}>
                    Ingresar garantía
                  </Button>
                )}

              {originalHasGarantia && !remissionData.remissionId.endsWith('-G') && (
                <Button
                  variant="contained"
                  onClick={() => {
                    const idG = `${remissionData.remissionId}-G`;
                    setRemissionId(idG);
                    fetchById(idG);
                  }}
                >
                  Ir a garantía
                </Button>
              )}

              {remissionData.remissionId.endsWith('-G') && !remissionData.fechaSalida && (
                <Button variant="outlined" color="error" onClick={handleSacarGarantia}>
                  Sacar garantía
                </Button>
              )}

              {remissionData.remissionId.endsWith('-G') && (
                <Button
                  variant="contained"
                  onClick={() => {
                    const originalId = remissionData.remissionId.replace(/-G$/, '');
                    setRemissionId(originalId);
                    fetchById(originalId);
                  }}
                >
                  Ir a remisión
                </Button>
              )}
            </Stack>
          </>
        )}
      </Container>

      {/* Dialog baja global */}
      <Dialog
        open={openDropDialog}
        onClose={() => setOpenDropDialog(false)}
        keepMounted
        disableRestoreFocus
      >
        <DialogTitle>¿Cómo deseas dar de baja la remisión?</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Elige si deseas cobrar por la revisión o dar de baja sin cobro. (La suma total se
            recalculará automáticamente).
          </DialogContentText>
        </DialogContent>
        <DialogActions sx={{ flexDirection: 'column', gap: 1, p: 2 }}>
          <Button
            variant="contained"
            fullWidth
            onClick={(e) => handleSelectDrop(true, e)}
          >
            Cobrar revisión
          </Button>
          <Button
            variant="outlined"
            fullWidth
            color="secondary"
            onClick={(e) => handleSelectDrop(false, e)}
          >
            Sin cobro
          </Button>
          <Button fullWidth onClick={() => setOpenDropDialog(false)}>
            Cancelar
          </Button>
        </DialogActions>
      </Dialog>

      {/* Dialog monto revisión (global) */}
      <Dialog
        open={openRevisionDialog}
        onClose={() => setOpenRevisionDialog(false)}
        keepMounted
        disableRestoreFocus
      >
        <DialogTitle>Ingresa el valor de la revisión</DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            margin="dense"
            label="Monto de revisión"
            type="text"
            inputProps={{ inputMode: 'decimal' }}
            fullWidth
            variant="outlined"
            value={revisionValueInput}
            onChange={(e) => setRevisionValueInput(e.target.value)}
            InputProps={{ startAdornment: <InputAdornment position="start">COP</InputAdornment> }}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenRevisionDialog(false)}>Cancelar</Button>
          <Button variant="contained" onClick={handleConfirmRevision}>
            Confirmar
          </Button>
        </DialogActions>
      </Dialog>

      {/* Dialog baja por equipo */}
      <Dialog
        open={openDropDialogRec}
        onClose={() => setOpenDropDialogRec(false)}
        keepMounted
        disableRestoreFocus
      >
        <DialogTitle>¿Cómo deseas dar de baja este equipo?</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Puedes dar de baja sin cobro (se resta el valor del equipo del total), o cobrar una
            revisión (se suma ese monto y se resta el valor restante del equipo del total).
          </DialogContentText>
        </DialogContent>
        <DialogActions sx={{ flexDirection: 'column', gap: 1, p: 2 }}>
          <Button
            variant="contained"
            fullWidth
            onClick={(e) => handleEquipSelectDrop(true, e)}
          >
            Cobrar revisión
          </Button>
          <Button
            variant="outlined"
            fullWidth
            color="secondary"
            onClick={(e) => handleEquipSelectDrop(false, e)}
          >
            Sin cobro
          </Button>
          <Button fullWidth onClick={() => setOpenDropDialogRec(false)}>Cancelar</Button>
        </DialogActions>
      </Dialog>

      {/* Dialog monto revisión (equipo) */}
      <Dialog
        open={openRevisionDialogRec}
        onClose={() => setOpenRevisionDialogRec(false)}
        keepMounted
        disableRestoreFocus
      >
        <DialogTitle>Ingresa el valor de la revisión (equipo)</DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            margin="dense"
            label="Monto de revisión"
            type="text"
            inputProps={{ inputMode: 'decimal' }}
            fullWidth
            variant="outlined"
            value={revisionValueInputRec}
            onChange={(e) => setRevisionValueInputRec(e.target.value)}
            InputProps={{ startAdornment: <InputAdornment position="start">COP</InputAdornment> }}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenRevisionDialogRec(false)}>Cancelar</Button>
          <Button variant="contained" onClick={handleConfirmRevisionRec}>
            Confirmar
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
