import { useState, useContext } from 'react';
import axiosClient from '../api/axiosClient';
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

  const { login } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleLogin = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (isLoading) return;
    setIsLoading(true);
    setMessage('');

    try {
      const response = await axiosClient.post('/auth/login', { email, password });
      const { token } = response.data as { token: string };
      login(token);
      navigate('/remisiones');
    } catch (error: unknown) {
      const axiosErr = error as { response?: { data?: { message?: string } } };
      setMessage(axiosErr.response?.data?.message || 'Error al iniciar sesión');
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
              {isLoading ? <CircularProgress size={24} color="inherit" /> : 'Ingresar'}
            </Button>
          </Stack>
        </Box>
      </Container>
    </Box>
  );
}
