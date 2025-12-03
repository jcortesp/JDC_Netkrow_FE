import React from 'react';
import { Outlet } from 'react-router-dom';
import MedicalNavbar from './MedicalNavbar';
import Footer from './Footer';
import { Box } from '@mui/material';

export default function MedicalLayout() {
  return (
    <Box
      sx={{
        minHeight: '100vh',
        backgroundImage:
          'url("https://medicalmuneras.com/wp-content/uploads/2023/04/Imagen-1_auto_x2-scaled.jpg")',
        backgroundSize: 'cover',
        backgroundRepeat: 'no-repeat',
        backgroundPosition: 'center',
        backgroundAttachment: 'fixed',
        display: 'flex',
        flexDirection: 'column',
      }}
    >
      <MedicalNavbar />

      {/* Contenido dinámico de cada página */}
      <Box sx={{ flex: 1 }}>
        <Outlet />
      </Box>

      {/* Footer fijo */}
      <Footer />
    </Box>
  );
}
