import React from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import { Box, Typography } from '@mui/material';
import MedicalNavbar from './MedicalNavbar';

function MedicalLayout() {
  const { pathname } = useLocation();

  return (
    <>
      <MedicalNavbar />
      <Outlet />

      {/* Footer fijo en tus dos páginas clave */}
      {['/entrega-equipo', '/servicio-tecnico'].includes(pathname) && (
        <Box sx={{ mt: 4, pb: 2 }}>
          <Typography
            variant="body1"
            fontWeight="bold"
            align="center"
          >
            Powered by<br />
            NetKrow - Connecting dots
          </Typography>
        </Box>
      )}
    </>
  );
}

export default MedicalLayout;
