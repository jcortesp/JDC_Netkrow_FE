import React, { useState, useContext } from 'react';
import axiosClient from '../api/axiosClient';
import { AuthContext } from '../contexts/AuthContext';
import { useNavigate, Link } from 'react-router-dom';

import {
  Container,
  Box,
  Typography,
  TextField,
  Button,
  Stack
} from '@mui/material';

function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [message, setMessage] = useState('');

  const { login } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      const response = await axiosClient.post('/auth/login', { email, password });
      const { token } = response.data;
      login(token);
      setMessage('Login exitoso');
      navigate('/search-specialists');
    } catch (error) {
      console.error('Error al iniciar sesión:', error);
      setMessage(error.response?.data?.message || 'Error al iniciar sesión');
    }
  };

  return (
    <Box
      sx={{
        minHeight: '100vh',
        backgroundImage:
          'url("https://images.wallpaperscraft.com/image/single/crow_bird_beak_272944_1920x1080.jpg")',
        backgroundSize: 'cover',
        backgroundRepeat: 'no-repeat',
        backgroundPosition: 'center',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center'
      }}
    >
      <Container maxWidth="xs">
        <Box
          sx={{
            p: 3,
            backgroundColor: 'rgba(255, 255, 255, 0.9)',
            border: '1px solid #ccc',
            borderRadius: 2
          }}
        >
          <Typography variant="h5" mb={2}>
            Iniciar Sesión
          </Typography>
          <Stack
            component="form"
            onSubmit={handleLogin}
            spacing={2}
          >
            <TextField
              type="email"
              label="Email"
              variant="outlined"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              fullWidth
            />
            <TextField
              type="password"
              label="Contraseña"
              variant="outlined"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              fullWidth
            />

            {message && (
              <Typography variant="body2" color="error">
                {message}
              </Typography>
            )}

            <Button type="submit" variant="contained">
              Iniciar Sesión
            </Button>
          </Stack>

          <Typography variant="body2" mt={2}>
            ¿No tienes una cuenta? <Link to="/register">Regístrate aquí</Link>
          </Typography>
        </Box>
      </Container>
    </Box>
  );
}

export default Login;
