import React, { useState } from 'react';
import axiosClient from '../api/axiosClient';
import {
  Box,
  FormControl,
  FormLabel,
  Input,
  Button,
  Text,
  Stack,
  useToast
} from '@chakra-ui/react';

export default function BookingModifyForm({ booking, onModificationSuccess }) {
  const toast = useToast();
  const [newStart, setNewStart] = useState(booking.startTime.slice(0,16));
  const [newEnd, setNewEnd] = useState(booking.endTime.slice(0,16));

  const handleSubmit = async e => {
    e.preventDefault();
    try {
      const format = str => (str.length===16 ? str+':00' : str);
      const { data } = await axiosClient.put(`/bookings/${booking.id}/modify`, {
        newStartDateTime: format(newStart),
        newEndDateTime: format(newEnd)
      });
      onModificationSuccess(data);
      toast({ title:'Modificado', status:'success' });
    } catch (err) {
      toast({ title:'Error', status:'error', description: err.message });
    }
  };

  return (
    <Box as="form" onSubmit={handleSubmit} p={4} borderWidth="1px" rounded="md">
      <Stack spacing={3}>
        <FormControl>
          <FormLabel>Nueva Fecha y Hora de Inicio</FormLabel>
          <Input
            type="datetime-local"
            value={newStart}
            onChange={e=>setNewStart(e.target.value)}
          />
        </FormControl>
        <FormControl>
          <FormLabel>Nueva Fecha y Hora de Fin</FormLabel>
          <Input
            type="datetime-local"
            value={newEnd}
            onChange={e=>setNewEnd(e.target.value)}
          />
        </FormControl>
        <Button type="submit" colorScheme="teal">Modificar Reserva</Button>
      </Stack>
    </Box>
  );
}
