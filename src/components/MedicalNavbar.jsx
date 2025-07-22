import React from 'react';
import { AppBar, Toolbar, Button, Box } from '@mui/material';
import { Link } from 'react-router-dom';
import logo from '../assets/Muneras_logo4.png';

export default function MedicalNavbar() {
  return (
    <>
      <AppBar position="static">
        <Toolbar>
          <Box sx={{ display: 'flex', alignItems: 'center', flexGrow: 1, gap: 1 }}>
            <Button component={Link} to="/remisiones" color="inherit">
              Ingresar remisión
            </Button>
            <Button component={Link} to="/entrega-equipo" color="inherit">
              BUSCAR/ENTREGAR
            </Button>
            <Button component={Link} to="/servicio-tecnico" color="inherit">
              Servicio Técnico
            </Button>
            <Button component={Link} to="/reports/volume" color="inherit">
              Reporte Volumen
            </Button>
          </Box>
        </Toolbar>
      </AppBar>

      {/* Logo fijo en esquina inferior izquierda */}
      <Box
        component="img"
        src={logo}
        alt="Muneras Logo"
        sx={{
          position: 'fixed',
          bottom: 0,
          left: 0,
          height: 80,
          zIndex: (theme) => theme.zIndex.appBar - 1,
        }}
      />
    </>
  );
}
