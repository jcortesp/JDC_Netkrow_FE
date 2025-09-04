// src/pages/MedicalLogin.jsx
import React, { useState, useContext } from 'react';
import axiosClient from '../api/axiosClient';
import { AuthContext } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import {
  Container,
  Box,
  Typography,
  TextField,
  Button,
  Stack
} from '@mui/material';

function MedicalLogin() {
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
      // Redirigimos a la página de remisiones
      navigate('/remisiones');
    } catch (error) {
      console.error('Error al iniciar sesión:', error);
      setMessage(error.response?.data?.message || 'Error al iniciar sesión');
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
          left: '25%', // para alinear hacia la izquierda
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
            <Button type="submit" variant="contained" fullWidth>
              Iniciar Sesión
            </Button>
          </Stack>
        </Box>
      </Container>
    </Box>
  );
}

export default MedicalLogin;

