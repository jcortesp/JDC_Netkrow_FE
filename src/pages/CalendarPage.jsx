import React, { useState, useEffect } from 'react';
import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import interactionPlugin from '@fullcalendar/interaction';
import axiosClient from '../api/axiosClient';
import { Container, Heading, useToast } from '@chakra-ui/react';

export default function CalendarPage() {
  const [events, setEvents] = useState([]);
  const toast = useToast();

  // Carga reservas
  const fetchEvents = async () => {
    try {
      const now = new Date();
      const year = now.getFullYear();
      const month = now.getMonth() + 1;
      const { data: bookings } = await axiosClient.get('/bookings/month', {
        params: { year, month }
      });
      setEvents(
        bookings.map(b => ({
          id: b.id,
          title: b.status,
          start: b.startTime,
          end: b.endTime,
          extendedProps: { clientId: b.clientId, specialistId: b.specialistId }
        }))
      );
    } catch (err) {
      toast({
        title: 'Error cargando calendario',
        description: err.message,
        status: 'error',
        isClosable: true
      });
    }
  };

  // NO retornes la promesa directamente
  useEffect(() => {
    fetchEvents();
  }, []);

  const handleEventClick = info => {
    const { id, title, start, end, extendedProps } = info.event;
    alert(
      `Reserva ${id}\n` +
      `Estado: ${title}\n` +
      `Inicio: ${start.toLocaleString()}\n` +
      `Fin: ${end.toLocaleString()}\n` +
      `Cliente: ${extendedProps.clientId}\n` +
      `Especialista: ${extendedProps.specialistId}`
    );
  };

  return (
    <Container maxW="container.lg" mt={8}>
      <Heading as="h2" size="lg" mb={4}>
        Calendario de Reservas
      </Heading>
      <FullCalendar
        plugins={[dayGridPlugin, interactionPlugin]}
        initialView="dayGridMonth"
        events={events}
        eventClick={handleEventClick}
        headerToolbar={{
          left: 'prev,next today',
          center: 'title',
          right: 'dayGridMonth,dayGridWeek,dayGridDay'
        }}
        height="auto"
      />
    </Container>
  );
}
