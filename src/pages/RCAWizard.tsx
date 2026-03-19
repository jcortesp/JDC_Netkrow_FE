import { useState } from 'react';
import {
  Alert,
  Box,
  Button,
  Container,
  Snackbar,
  Stack,
  TextField,
  Typography,
} from '@mui/material';
import axiosClient from '../api/axiosClient';
import JourneyGraph from '../components/JourneyGraph';
import type { RCABacktraceResponse, RCARouteNode } from '../types';

export default function RCAWizard() {
  const [chainInput, setChainInput] = useState('');
  const [chainLoading, setChainLoading] = useState(false);
  const [routes, setRoutes] = useState<RCARouteNode[][]>([]);
  const [chainError, setChainError] = useState('');
  const [toast, setToast] = useState<{ open: boolean; message: string; severity: 'success' | 'error' | 'info' }>({
    open: false,
    message: '',
    severity: 'info',
  });

  const handleChain = async () => {
    setChainError('');
    setRoutes([]);
    if (!chainInput.trim()) {
      setChainError('Ingrese la cadena a buscar.');
      return;
    }

    setChainLoading(true);
    try {
      const { data } = await axiosClient.post('/rca/backtrace', { search: chainInput });
      const payload = data as RCABacktraceResponse;
      setRoutes(Array.isArray(payload.routes) ? payload.routes : []);
      if (!payload.routes || payload.routes.length === 0) {
        setToast({ open: true, message: 'No se encontraron rutas padres ni transactions.', severity: 'info' });
      }
    } catch {
      setChainError('Error en la busqueda de rutas. Revisa la conexion.');
      setToast({ open: true, message: 'Error en busqueda encadenada', severity: 'error' });
    } finally {
      setChainLoading(false);
    }
  };

  return (
    <Container maxWidth="xl" sx={{ py: 4 }}>
      <Typography variant="h4" sx={{ mb: 3, fontWeight: 700 }}>RCA Wizard (Sterling OMS)</Typography>

      <Box sx={{ p: 2, border: '1px solid #ddd', borderRadius: 2, bgcolor: '#fafafa' }}>
        <Typography variant="h6" sx={{ mb: 1 }}>Buscar todas las rutas padres (journey backwards)</Typography>
        <Stack spacing={2}>
          <TextField
            placeholder="adidasLAM_ReturnUpdateSvc"
            value={chainInput}
            onChange={(e) => setChainInput(e.target.value)}
            size="small"
          />
          <Button variant="contained" onClick={handleChain} disabled={chainLoading}>
            {chainLoading ? 'Buscando...' : 'Buscar rutas padres'}
          </Button>

          {chainError && (
            <Alert severity="error">{chainError}</Alert>
          )}

          {routes.length > 0 && (
            <Box sx={{ mt: 2 }}>
              <Typography variant="subtitle1" sx={{ mb: 1, fontWeight: 700 }}>Rutas encontradas (journey visual):</Typography>
              <JourneyGraph routes={routes} />
            </Box>
          )}
        </Stack>
      </Box>

      <Snackbar
        open={toast.open}
        autoHideDuration={3000}
        onClose={() => setToast((p) => ({ ...p, open: false }))}
      >
        <Alert onClose={() => setToast((p) => ({ ...p, open: false }))} severity={toast.severity} variant="filled">
          {toast.message}
        </Alert>
      </Snackbar>
    </Container>
  );
}
