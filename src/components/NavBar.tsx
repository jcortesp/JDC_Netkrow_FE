import { useContext, useState } from 'react';
import { Link as RouterLink, Outlet, useNavigate } from 'react-router-dom';
import {
  AppBar,
  Avatar,
  Badge,
  Box,
  Button,
  IconButton,
  InputAdornment,
  Menu,
  MenuItem,
  TextField,
  Toolbar,
} from '@mui/material';
import MenuIcon from '@mui/icons-material/Menu';
import SearchIcon from '@mui/icons-material/Search';
import MailIcon from '@mui/icons-material/Mail';
import NotificationsIcon from '@mui/icons-material/Notifications';
import { AuthContext } from '../contexts/AuthContext';

export default function NavBar() {
  const { logout } = useContext(AuthContext);
  const navigate = useNavigate();
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <>
      <AppBar position="static" sx={{ mb: 2 }}>
        <Toolbar sx={{ gap: 1.5, flexWrap: 'wrap' }}>
          <IconButton color="inherit" edge="start">
            <MenuIcon />
          </IconButton>

          <Box sx={{ fontWeight: 800, letterSpacing: 0.2 }}>NetKrow</Box>

          <TextField
            size="small"
            placeholder="Buscar..."
            sx={{ bgcolor: '#fff', borderRadius: 1.5, minWidth: 220 }}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon fontSize="small" />
                </InputAdornment>
              ),
            }}
          />

          <Button color="inherit" component={RouterLink} to="/search-specialists">Buscar Especialistas</Button>
          <Button color="inherit" component={RouterLink} to="/create-booking">Crear Reserva</Button>
          <Button color="inherit" component={RouterLink} to="/bookings">Ver Reservas</Button>
          <Button color="inherit" component={RouterLink} to="/calendar">Calendario</Button>
          <Button variant="contained" color="warning" component={RouterLink} to="/rca-wizard">RCA Wizard</Button>

          <Box sx={{ ml: 'auto', display: 'flex', alignItems: 'center', gap: 1 }}>
            <IconButton color="inherit">
              <Badge badgeContent={4} color="error"><MailIcon /></Badge>
            </IconButton>
            <IconButton color="inherit">
              <Badge badgeContent={17} color="error"><NotificationsIcon /></Badge>
            </IconButton>
            <IconButton color="inherit" onClick={(e) => setAnchorEl(e.currentTarget)}>
              <Avatar sx={{ width: 28, height: 28 }} />
            </IconButton>
            <Button color="inherit" onClick={handleLogout}>Cerrar Sesion</Button>
          </Box>
        </Toolbar>
      </AppBar>

      <Menu anchorEl={anchorEl} open={Boolean(anchorEl)} onClose={() => setAnchorEl(null)}>
        <MenuItem component={RouterLink} to="/profile" onClick={() => setAnchorEl(null)}>Mi Perfil</MenuItem>
      </Menu>

      <Outlet />
    </>
  );
}
