import { useState, useContext } from 'react';
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
import type { AlertColor } from '@mui/material';
import axiosClient from '../api/axiosClient';
import { Link, useNavigate } from 'react-router-dom';
import { AuthContext } from '../contexts/AuthContext';

interface ToastState {
  open: boolean;
  message: string;
  severity: AlertColor;
}

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [toast, setToast] = useState<ToastState>({
    open: false,
    message: '',
    severity: 'success',
  });
  const { login } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    try {
      const { data } = await axiosClient.post('/auth/login', { email, password });
      login(data.token);
      setToast({ open: true, message: 'Login exitoso', severity: 'success' });
      navigate('/search-specialists');
    } catch (err: unknown) {
      const axiosErr = err as { response?: { data?: { message?: string } }; message?: string };
      setToast({
        open: true,
        message: axiosErr.response?.data?.message || axiosErr.message || 'Error al iniciar sesion',
        severity: 'error',
      });
    }
  };

  return (
    <Box
      sx={{
        minHeight: '100vh',
        backgroundImage: 'url("https://images.wallpaperscraft.com/image/single/crow_bird_beak_272944_1920x1080.jpg")',
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        p: 2,
      }}
    >
      <Container maxWidth="sm">
        <Box sx={{ p: 4, borderRadius: 2, bgcolor: 'rgba(255,255,255,0.92)', boxShadow: 3 }}>
          <Typography variant="h5" sx={{ mb: 3, textAlign: 'center', fontWeight: 700 }}>
            Iniciar Sesion
          </Typography>

          <Box component="form" onSubmit={handleSubmit}>
            <Stack spacing={2}>
              <TextField
                type="email"
                label="Email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="tu@correo.com"
                required
                fullWidth
              />
              <TextField
                type="password"
                label="Contrasena"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                fullWidth
              />
              <Button type="submit" variant="contained" fullWidth>
                Entrar
              </Button>
              <Typography variant="body2" sx={{ textAlign: 'center' }}>
                No tienes cuenta?{' '}
                <Link to="/register">Registrate</Link>
              </Typography>
            </Stack>
          </Box>
        </Box>
      </Container>

      <Snackbar
        open={toast.open}
        autoHideDuration={3500}
        onClose={() => setToast((prev) => ({ ...prev, open: false }))}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert
          onClose={() => setToast((prev) => ({ ...prev, open: false }))}
          severity={toast.severity}
          variant="filled"
          sx={{ width: '100%' }}
        >
          {toast.message}
        </Alert>
      </Snackbar>
    </Box>
  );
}
