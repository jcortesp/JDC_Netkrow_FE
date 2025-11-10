// src/components/NavBar.jsx
import React from 'react';
import { Link as RouterLink, useNavigate, Outlet } from 'react-router-dom';
import {
  Box,
  Flex,
  IconButton,
  InputGroup,
  InputLeftElement,
  Input,
  Button,
  Avatar,
  Menu,
  MenuButton,
  MenuList,
  MenuItem,
  Badge,
  useColorModeValue,
} from '@chakra-ui/react';
import {
  HamburgerIcon,
  SearchIcon,
  BellIcon,
  EmailIcon,
} from '@chakra-ui/icons';
import { AuthContext } from '../contexts/AuthContext';

export default function NavBar() {
  const { user, logout } = React.useContext(AuthContext);
  const navigate = useNavigate();
  const bg = useColorModeValue('blue.600', 'blue.800');
  const color = useColorModeValue('white', 'whiteAlpha.900');

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <>
      <Box bg={bg} color={color} px={4} py={2} shadow="md">
        <Flex align="center" maxW="container.xl" mx="auto">
          <IconButton
            aria-label="Open menu"
            icon={<HamburgerIcon />}
            variant="ghost"
            color={color}
            mr={4}
          />

          <Box fontWeight="bold" fontSize="lg">
            NetKrow
          </Box>

          <InputGroup maxW="300px" mx={6}>
            <InputLeftElement pointerEvents="none">
              <SearchIcon />
            </InputLeftElement>
            <Input
              placeholder="Buscar…"
              bg={useColorModeValue('white', 'gray.700')}
              color={useColorModeValue('gray.800', 'white')}
            />
          </InputGroup>

          <Flex flex="1" justify="flex-end" align="center" gap={4}>
            <Button as={RouterLink} to="/search-specialists" variant="link" color={color}>
              Buscar Especialistas
            </Button>
            <Button as={RouterLink} to="/create-booking" variant="link" color={color}>
              Crear Reserva
            </Button>
            <Button as={RouterLink} to="/bookings" variant="link" color={color}>
              Ver Reservas
            </Button>
            <Button as={RouterLink} to="/calendar" variant="link" color={color}>
              Calendario
            </Button>

            {/* ---- ACCESO DIRECTO AL RCA Wizard ---- */}
            <Button as={RouterLink} to="/rca-wizard" variant="solid" colorScheme="orange">
              RCA Wizard
            </Button>
            {/* -------------------------------------- */}

            <Button onClick={handleLogout} variant="link" color={color}>
              Cerrar Sesión
            </Button>

            {/* Icono de correo con badge correcto */}
            <Box position="relative">
              <IconButton
                aria-label="Correo"
                icon={<EmailIcon />}
                variant="ghost"
                color={color}
              />
              <Badge
                colorScheme="red"
                borderRadius="full"
                position="absolute"
                top="-2px"
                right="-2px"
              >
                4
              </Badge>
            </Box>

            {/* Icono de notificaciones con badge correcto */}
            <Box position="relative">
              <IconButton
                aria-label="Notificaciones"
                icon={<BellIcon />}
                variant="ghost"
                color={color}
              />
              <Badge
                colorScheme="red"
                borderRadius="full"
                position="absolute"
                top="-2px"
                right="-2px"
              >
                17
              </Badge>
            </Box>

            <Menu>
              <MenuButton as={IconButton} icon={<Avatar size="sm" />} />
              <MenuList>
                <MenuItem as={RouterLink} to="/profile">
                  Mi Perfil
                </MenuItem>
              </MenuList>
            </Menu>
          </Flex>
        </Flex>
      </Box>

      {/* Aquí se renderiza la ruta hija */}
      <Outlet />
    </>
  );
}
