import { useState, useContext, useEffect } from 'react';
import axiosClient from '../api/axiosClient';
import axios from 'axios';
import { AuthContext } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import {
  Container,
  Box,
  Typography,
  TextField,
  Button,
  Stack,
  CircularProgress,
} from '@mui/material';

export default function MedicalLogin() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [message, setMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [warmingUp, setWarmingUp] = useState(false);

  const { login } = useContext(AuthContext);
  const navigate = useNavigate();

  // Pre-calentamiento: despierta el backend en cuanto carga la pantalla de login,
  // para que cuando el usuario presione "Ingresar" el servidor ya esté listo.
  useEffect(() => {
    axiosClient.get('/health').catch(() => {});
  }, []);

  const getLoginErrorMessage = (error: unknown): string => {
    if (!axios.isAxiosError(error)) {
      return 'Error al iniciar sesión';
    }

    const status = error.response?.status;
    const data = error.response?.data as { message?: string; error?: string } | undefined;

    if (status === 401) {
      return data?.message || data?.error || 'Credenciales inválidas';
    }

    if (!error.response) {
      return 'Servidor no disponible temporalmente. Intenta de nuevo en unos segundos.';
    }

    if (status && status >= 500) {
      return 'El servidor está respondiendo con error. Vuelve a intentar en unos segundos.';
    }

    return data?.message || data?.error || 'Error al iniciar sesión';
  };

  const shouldRetryLogin = (error: unknown, attempt: number): boolean => {
    if (attempt > 1 || !axios.isAxiosError(error)) {
      return false;
    }
    // Solo reintento si no hubo respuesta (cold-start / timeout).
    // Los errores 5xx son fallos reales del servidor, no de arranque.
    return !error.response;
  };

  const handleLogin = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (isLoading) return;
    setIsLoading(true);
    setMessage('');

    try {
      const normalizedEmail = email.trim().toLowerCase();
      let response;

      try {
        response = await axiosClient.post('/auth/login', { email: normalizedEmail, password });
      } catch (firstError: unknown) {
        if (shouldRetryLogin(firstError, 1)) {
          // El servidor estaba dormido (cold-start de Render). Espera 12 s para que despierte
          // y muestra un aviso claro al usuario en lugar de fallar en silencio.
          setWarmingUp(true);
          await new Promise((resolve) => setTimeout(resolve, 12000));
          setWarmingUp(false);
          response = await axiosClient.post('/auth/login', { email: normalizedEmail, password });
        } else {
          throw firstError;
        }
      }

      const { token } = response.data as { token: string };
      login(token);
      navigate('/remisiones');
    } catch (error: unknown) {
      setMessage(getLoginErrorMessage(error));
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Box
      sx={{
        minHeight: '100vh',
        backgroundImage: 'url("https://medicalmuneras.com/wp-content/uploads/2023/04/Imagen-1_auto_x2-scaled.jpg")',
        backgroundSize: 'cover',
        backgroundRepeat: 'no-repeat',
        backgroundPosition: 'center'
      }}
    >
      <Container
        maxWidth="xs"
        sx={{
          position: 'absolute',
          top: '50%',
          left: '25%',
          transform: 'translate(-50%, -50%)'
        }}
      >
        <Box
          sx={{
            p: 3,
            backgroundColor: 'rgba(255,255,255,0.75)',
            border: '1px solid #ccc',
            borderRadius: 2,
            boxShadow: 3
          }}
        >
          <Typography variant="h5" mb={2} align="center">
            Iniciar Sesión
          </Typography>
          <Stack component="form" onSubmit={handleLogin} spacing={2}>
            <TextField type="email" label="Email" value={email} onChange={(e) => setEmail(e.target.value)} required />
            <TextField type="password" label="Password" value={password} onChange={(e) => setPassword(e.target.value)} required />
            {message && (
              <Typography color="error" variant="body2">{message}</Typography>
            )}
            <Button type="submit" variant="contained" disabled={isLoading} fullWidth>
              {isLoading ? (
                <Stack direction="row" alignItems="center" spacing={1}>
                  <CircularProgress size={20} color="inherit" />
                  {warmingUp && (
                    <Typography variant="caption" sx={{ color: 'inherit' }}>
                      Iniciando servidor...
                    </Typography>
                  )}
                </Stack>
              ) : 'Ingresar'}
            </Button>
          </Stack>
        </Box>
      </Container>
    </Box>
  );
}
