import React, { useState, useContext } from 'react';
import {
  Box,
  Flex,
  Heading,
  FormControl,
  FormLabel,
  Input,
  Button,
  Text,
  useToast,
  Stack
} from '@chakra-ui/react';
import { AuthContext } from '../contexts/AuthContext';
import axiosClient from '../api/axiosClient';
import { useNavigate, Link as RouterLink } from 'react-router-dom';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const { login } = useContext(AuthContext);
  const navigate = useNavigate();
  const toast = useToast();

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const { data } = await axiosClient.post('/auth/login', { email, password });
      login(data.token);
      toast({
        title: '¡Login exitoso!',
        status: 'success',
        duration: 2000,
        isClosable: true
      });
      navigate('/search-specialists');
    } catch (err) {
      toast({
        title: 'Error al iniciar sesión',
        description: err.response?.data?.message || err.message,
        status: 'error',
        duration: 4000,
        isClosable: true
      });
    }
  };

  return (
    <Flex
      minH="100vh"
      bgImage="url('https://images.wallpaperscraft.com/image/single/crow_bird_beak_272944_1920x1080.jpg')"
      bgSize="cover"
      bgPos="center"
      align="center"
      justify="center"
    >
      <Box bg="whiteAlpha.900" p={8} rounded="md" shadow="md" w="full" maxW="sm">
        <Heading mb={6} textAlign="center" size="lg">
          Iniciar Sesión
        </Heading>
        <form onSubmit={handleSubmit}>
          <Stack spacing={4}>
            <FormControl id="email" isRequired>
              <FormLabel>Email</FormLabel>
              <Input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="tu@correo.com"
              />
            </FormControl>
            <FormControl id="password" isRequired>
              <FormLabel>Contraseña</FormLabel>
              <Input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
              />
            </FormControl>
            <Button colorScheme="teal" type="submit" width="full">
              Entrar
            </Button>
          </Stack>
        </form>
        <Text mt={4} textAlign="center" fontSize="sm">
          ¿No tienes cuenta?{' '}
          <Button
            as={RouterLink}
            to="/register"
            variant="link"
            colorScheme="teal"
            pl={1}
          >
            Regístrate
          </Button>
        </Text>
      </Box>
    </Flex>
  );
}
