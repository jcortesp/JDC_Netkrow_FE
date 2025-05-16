import React, { useState, useEffect } from 'react';
import {
  Container,
  Typography,
  TextField,
  Button,
  Stack,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Alert,
  Box
} from '@mui/material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import axiosClient from '../api/axiosClient';
import { useLocation } from 'react-router-dom';
import TechnicalRecordForm from '../components/TechnicalRecordForm';

export default function ServicioTecnico() {
  const location = useLocation();
  const initialId = location.state?.remissionId || '';

  const [remissionId, setRemissionId] = useState(initialId);
  const [remisionData, setRemisionData] = useState(null);
  const [records, setRecords] = useState([]);
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [expanded, setExpanded] = useState(false);
  const [newMode, setNewMode] = useState(false);

  const initialRecord = {
    equipo: '', marca: '', serial: '', brazalete: '',
    pilas: '', revision: '', mantenimiento: '',
    limpieza: '', calibracion: '', notasDiagnostico: ''
  };
  const [newRecord, setNewRecord] = useState(initialRecord);

  const fetchRemision = async (id) => {
    try {
      const { data } = await axiosClient.get(`/remissions/${id}`);
      setRemisionData(data);
      const res = await axiosClient.get(`/remissions/${id}/technical-records`);
      setRecords(res.data);
      setError('');
      setSuccessMsg('');
      setExpanded(false);
    } catch (e) {
      const status = e.response?.status;
      setRemisionData(null);
      setRecords([]);
      if (status === 400 || status === 404) {
        setError('No se encontró la remisión');
      } else {
        setError('Error al comunicar con el servidor');
      }
    }
  };

  useEffect(() => {
    if (initialId) {
      fetchRemision(initialId).then(() => {
        setNewMode(true);
        setNewRecord(initialRecord);
      });
    }
  }, [initialId]);

  const handleCreate = async (form) => {
    try {
      await axiosClient.post(`/remissions/${remissionId}/technical-records`, form);
      await fetchRemision(remissionId);
      setSuccessMsg('Guardado con éxito');
      setNewMode(false);
    } catch {
      setError('Error al guardar');
    }
  };

  const handleUpdate = async (recordId, form) => {
    try {
      await axiosClient.put(`/remissions/${remissionId}/technical-records/${recordId}`, form);
      await fetchRemision(remissionId);
      setSuccessMsg('Guardado con éxito');
      setExpanded(false);
    } catch {
      setError('Error al guardar');
    }
  };

  const readOnly = Boolean(remisionData?.fechaSalida);

  return (
    <Box
      sx={{
        minHeight: '100vh',
        backgroundImage:
          'url("https://medicalmuneras.com/wp-content/uploads/2023/04/Imagen-1_auto_x2-scaled.jpg")',
        backgroundSize: 'cover',
        backgroundRepeat: 'no-repeat',
        backgroundPosition: 'center',
        p: 4
      }}
    >
      <Container maxWidth="sm" sx={{ backgroundColor: 'rgba(255,255,255,0.8)', p: 3, borderRadius: 2 }}>
        <Typography variant="h5" align="center" gutterBottom>
          Servicio Técnico
        </Typography>

        <Stack direction="row" gap={2} mb={2}>
          <TextField
            label="Código de remisión"
            value={remissionId}
            onChange={e => setRemissionId(e.target.value)}
            fullWidth
            InputLabelProps={{ shrink: true }}
          />
          <Button variant="contained" onClick={() => fetchRemision(remissionId)}>
            Buscar
          </Button>
        </Stack>

        {error && (
          <Alert severity="error" onClose={() => setError('')} sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}
        {successMsg && (
          <Alert severity="success" onClose={() => setSuccessMsg('')} sx={{ mb: 2 }}>
            {successMsg}
          </Alert>
        )}

        {remisionData && (
          <>
            <Typography variant="h6" align="center" gutterBottom sx={{ fontWeight: 'bold' }}>
              Equipos disponibles
            </Typography>

            {records.map(rec => (
              <Accordion
                key={rec.id}
                expanded={expanded === rec.id}
                onChange={(_, isExpanded) => {
                  setExpanded(isExpanded ? rec.id : false);
                  setError('');
                  setSuccessMsg('');
                }}
              >
                <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                  {rec.equipo} — {rec.marca}
                </AccordionSummary>
                <AccordionDetails>
                  <TechnicalRecordForm
                    form={rec}
                    onChange={e => {
                      const { name, value } = e.target;
                      setRecords(rs =>
                        rs.map(r => (r.id === rec.id ? { ...r, [name]: value } : r))
                      );
                    }}
                    onSubmit={e => {
                      e.preventDefault();
                      handleUpdate(rec.id, rec);
                    }}
                    error={error}
                    readOnly={readOnly}
                  />
                </AccordionDetails>
              </Accordion>
            ))}

            {!readOnly && !newMode && (
              <Button
                variant="contained"
                fullWidth
                sx={{ mt: 2 }}
                onClick={() => {
                  setNewMode(true);
                  setError('');
                  setSuccessMsg('');
                  setNewRecord(initialRecord);
                }}
              >
                + Agregar Servicio Técnico
              </Button>
            )}

            {!readOnly && newMode && (
              <>
                <TechnicalRecordForm
                  form={newRecord}
                  onChange={e => {
                    const { name, value } = e.target;
                    setNewRecord(nr => ({ ...nr, [name]: value }));
                  }}
                  onSubmit={e => {
                    e.preventDefault();
                    handleCreate(newRecord);
                  }}
                  error={error}
                  readOnly={false}
                />

                <Stack direction="row" gap={2} mt={1}>
                  <Button
                    variant="outlined"
                    fullWidth
                    onClick={() => {
                      setNewMode(false);
                      setError('');
                    }}
                  >
                    Cancelar
                  </Button>
                </Stack>
              </>
            )}
          </>
        )}
      </Container>
    </Box>
  );
}

