// src/pages/CalendarPage.jsx
import React, { useState, useEffect } from 'react';
import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import interactionPlugin from '@fullcalendar/interaction';
import axiosClient from '../api/axiosClient';
import { Container, Typography } from '@mui/material';

const CalendarPage = () => {
  const [events, setEvents] = useState([]);

  // Función para cargar reservas y convertirlas en eventos para FullCalendar
  const fetchEvents = async () => {
    try {
      // Obtenemos el mes actual
      const now = new Date();
      const year = now.getFullYear();
      const month = now.getMonth() + 1; // backend espera mes en 1-indexado
      const response = await axiosClient.get('/bookings/month', {
        params: { year, month }
      });
      const bookings = response.data;
      // Convertir cada reserva en un objeto de evento
      const fcEvents = bookings.map(booking => ({
        id: booking.id,
        title: booking.status,
        start: booking.startTime,
        end: booking.endTime,
        extendedProps: {
          clientId: booking.clientId,
          specialistId: booking.specialistId
        }
      }));
      setEvents(fcEvents);
    } catch (error) {
      console.error('Error fetching events:', error);
    }
  };

  useEffect(() => {
    fetchEvents();
  }, []);

  // Ejemplo de interacción: mostrar detalles al hacer clic en un evento
  const handleEventClick = (clickInfo) => {
    const { title, start, end, extendedProps } = clickInfo.event;
    alert(`Reserva ${clickInfo.event.id}\nEstado: ${title}\nInicio: ${start.toLocaleString()}\nFin: ${end.toLocaleString()}\nCliente: ${extendedProps.clientId}\nEspecialista: ${extendedProps.specialistId}`);
    // Aquí podrías abrir un modal para editar o ver más detalles.
  };

  return (
    <Container maxWidth="lg" sx={{ mt: 4 }}>
      <Typography variant="h5" gutterBottom>
        Calendario de Reservas
      </Typography>
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
};

export default CalendarPage;
