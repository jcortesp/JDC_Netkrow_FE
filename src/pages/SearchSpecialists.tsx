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
import SpecialistList from '../components/SpecialistList';

interface Specialist {
  id: number;
  skills?: string[];
  ratePerHour?: number;
}

export default function SearchSpecialists() {
  const [skill, setSkill] = useState('');
  const [minRate, setMinRate] = useState('');
  const [maxRate, setMaxRate] = useState('');
  const [specialists, setSpecialists] = useState<Specialist[]>([]);
  const [toast, setToast] = useState<{ open: boolean; message: string }>({ open: false, message: '' });

  const handleSearch = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    try {
      const params = {
        ...(skill ? { skill } : {}),
        ...(minRate ? { minRate } : {}),
        ...(maxRate ? { maxRate } : {}),
      };
      const { data } = await axiosClient.get('/specialists/search', { params });
      setSpecialists(data as Specialist[]);
    } catch (err: unknown) {
      const e2 = err as { message?: string };
      setToast({ open: true, message: e2.message || 'Error buscando especialistas' });
    }
  };

  return (
    <Container maxWidth="md" sx={{ py: 4 }}>
      <Typography variant="h5" sx={{ mb: 2, fontWeight: 700 }}>Buscar Especialistas</Typography>
      <Box component="form" onSubmit={handleSearch} sx={{ mb: 3 }}>
        <Stack direction={{ xs: 'column', md: 'row' }} spacing={2}>
          <TextField label="Skill" value={skill} onChange={(e) => setSkill(e.target.value)} placeholder="Ej: Java" fullWidth />
          <TextField label="Tarifa Minima" type="number" value={minRate} onChange={(e) => setMinRate(e.target.value)} fullWidth />
          <TextField label="Tarifa Maxima" type="number" value={maxRate} onChange={(e) => setMaxRate(e.target.value)} fullWidth />
          <Button type="submit" variant="contained">Buscar</Button>
        </Stack>
      </Box>

      <Typography variant="h6" sx={{ mb: 1 }}>Resultados:</Typography>
      <SpecialistList specialists={specialists} />
      {specialists.length === 0 && <Typography sx={{ mt: 1 }}>No hay resultados.</Typography>}

      <Snackbar open={toast.open} autoHideDuration={3000} onClose={() => setToast({ open: false, message: '' })}>
        <Alert onClose={() => setToast({ open: false, message: '' })} severity="error" variant="filled">
          {toast.message}
        </Alert>
      </Snackbar>
    </Container>
  );
}
