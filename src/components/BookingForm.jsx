import React, { useState, useContext } from 'react';
import axiosClient from '../api/axiosClient';
import { useNavigate } from 'react-router-dom';
import {
  Container,
  Box,
  Stack,
  FormControl,
  FormLabel,
  Input,
  Button,
  Heading,
  Text,
  useToast
} from '@chakra-ui/react';
import { AuthContext } from '../contexts/AuthContext';

export default function BookingForm() {
  const navigate = useNavigate();
  const { user } = useContext(AuthContext);
  const toast = useToast();
  const [values, setValues] = useState({ startDateTime: '', endDateTime: '', specialistId: '' });
  const [error, setError] = useState('');

  const handleChange = e => {
    setValues(v => ({ ...v, [e.target.name]: e.target.value }));
  };

  const addSeconds = str => (str.length === 16 ? str + ':00' : str);

  const handleSubmit = async e => {
    e.preventDefault();
    try {
      await axiosClient.post('/bookings', {
        clientId: user.id,
        startDateTime: addSeconds(values.startDateTime),
        endDateTime: addSeconds(values.endDateTime),
        specialistId: Number(values.specialistId)
      });
      toast({ title: 'Reserva creada', status: 'success', isClosable: true });
      navigate('/bookings');
    } catch (err) {
      setError(err.response?.data || 'Error al crear la reserva');
    }
  };

  return (
    <Container maxW="sm" mt={10}>
      <Box p={6} bg="white" rounded="md" shadow="md">
        <Heading size="md" mb={4}>Crear Reserva</Heading>
        {error && <Text color="red.500" mb={3}>{error}</Text>}
        <form onSubmit={handleSubmit}>
          <Stack spacing={4}>
            <FormControl isRequired>
              <FormLabel>Fecha y hora de inicio</FormLabel>
              <Input
                name="startDateTime"
                type="datetime-local"
                value={values.startDateTime}
                onChange={handleChange}
              />
            </FormControl>
            <FormControl isRequired>
              <FormLabel>Fecha y hora de fin</FormLabel>
              <Input
                name="endDateTime"
                type="datetime-local"
                value={values.endDateTime}
                onChange={handleChange}
              />
            </FormControl>
            <FormControl isRequired>
              <FormLabel>ID del Especialista</FormLabel>
              <Input
                name="specialistId"
                type="number"
                value={values.specialistId}
                onChange={handleChange}
              />
            </FormControl>
            <Button colorScheme="teal" type="submit">Crear Reserva</Button>
          </Stack>
        </form>
      </Box>
    </Container>
  );
}
