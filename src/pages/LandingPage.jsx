// src/pages/LandingPage.jsx
import React from 'react';
import { Box, Typography, Button } from '@mui/material';
import { useNavigate } from 'react-router-dom';

function LandingPage() {
  const navigate = useNavigate();

  const handleEnter = () => {
    navigate('/medical-login');
  };

  return (
    <Box
      sx={{
        minHeight: '100vh',
        backgroundImage: 'url("https://medicalmuneras.com/wp-content/uploads/2023/04/Imagen-1_auto_x2-scaled.jpg")',
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        // Se añade un overlay para mejorar la legibilidad (opcional)
        backgroundColor: 'rgba(0,0,0,0.4)',
        backgroundBlendMode: 'overlay'
      }}
    >
      <Box
        sx={{
          p: 4,
          backgroundColor: 'rgba(255,255,255,0.85)', // Fondo blanco con transparencia
          borderRadius: 2,
          textAlign: 'center',
          boxShadow: 3,
          // Para centrar el cuadro hacia la parte izquierda (ajusta según necesites)
          maxWidth: '400px',
          marginLeft: { xs: 0, md: '-10%' }
        }}
      >
        <Typography variant="h4" gutterBottom>
          Bienvenido a Muneras Medical
        </Typography>
        <Button variant="contained" color="primary" onClick={handleEnter} sx={{ mt: 2 }}>
          Entrar a Muneras Medical
        </Button>
      </Box>
    </Box>
  );
}

export default LandingPage;
