import React, { useState, useEffect, useContext } from 'react';
import axiosClient from '../api/axiosClient';
import { AuthContext } from '../contexts/AuthContext';
import {
  Container,
  Heading,
  Text,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  TableContainer,
  Button,
  useToast,
  Box
} from '@chakra-ui/react';
import BookingModifyForm from './BookingModifyForm';

export default function BookingList() {
  const { user } = useContext(AuthContext);
  const toast = useToast();
  const [bookings, setBookings] = useState([]);
  const [editId, setEditId] = useState(null);

  useEffect(() => {
    axiosClient.get('/bookings/all')
      .then(r => setBookings(r.data))
      .catch(err => toast({ title: 'Error fetching', status: 'error', description: err.message }));
  }, []);

  const updateStatus = (id, url, newStatus) => {
    axiosClient.post(url)
      .then(() => {
        setBookings(bs => bs.map(b => b.id === id ? { ...b, status: newStatus } : b));
        toast({ title: `Reserva ${newStatus.toLowerCase()}`, status: 'success' });
      })
      .catch(err => toast({ title: 'Error', status: 'error', description: err.message }));
  };

  const onModified = updated => {
    setBookings(bs => bs.map(b => b.id === updated.id ? updated : b));
    setEditId(null);
    toast({ title: 'Reserva modificada', status: 'success' });
  };

  return (
    <Container maxW="container.md" mt={8}>
      <Heading size="lg" mb={4}>Lista de Reservas</Heading>
      <TableContainer mb={4}>
        <Table variant="simple">
          <Thead>
            <Tr>
              {['ID','Cliente','Especialista','Inicio','Fin','Estado','Acciones'].map(h => <Th key={h}>{h}</Th>)}
            </Tr>
          </Thead>
          <Tbody>
            {bookings.map(b => (
              <React.Fragment key={b.id}>
                <Tr>
                  <Td>{b.id}</Td>
                  <Td>{b.clientId}</Td>
                  <Td>{b.specialistId}</Td>
                  <Td>{new Date(b.startTime).toLocaleString()}</Td>
                  <Td>{new Date(b.endTime).toLocaleString()}</Td>
                  <Td>{b.status}</Td>
                  <Td>
                    {user?.roles?.includes('ROLE_SPECIALIST') && b.status === 'PENDING' && (
                      <Button size="sm" mr={2}
                        onClick={()=>updateStatus(b.id,`/bookings/${b.id}/confirm`,'CONFIRMED')}>
                        Confirmar
                      </Button>
                    )}
                    {b.status !== 'CANCELLED' && (
                      <Button size="sm" colorScheme="red" mr={2}
                        onClick={()=>updateStatus(b.id,`/bookings/${b.id}/cancel`,'CANCELLED')}>
                        Cancelar
                      </Button>
                    )}
                    {b.status==='PENDING' && (
                      <Button size="sm"
                        onClick={()=> setEditId(id => id===b.id? null: b.id)}>
                        {editId===b.id? 'Cerrar':'Modificar'}
                      </Button>
                    )}
                  </Td>
                </Tr>
                {editId===b.id && (
                  <Tr>
                    <Td colSpan={7}>
                      <BookingModifyForm booking={b} onModificationSuccess={onModified}/>
                    </Td>
                  </Tr>
                )}
              </React.Fragment>
            ))}
          </Tbody>
        </Table>
      </TableContainer>
      {bookings.length===0 && <Text>No hay reservas.</Text>}
    </Container>
  );
}
