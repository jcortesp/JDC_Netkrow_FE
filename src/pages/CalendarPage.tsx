import { useEffect, useState } from 'react';
import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import interactionPlugin from '@fullcalendar/interaction';
import {
  Alert,
  Container,
  Snackbar,
  Typography,
} from '@mui/material';
import axiosClient from '../api/axiosClient';

interface BookingEvent {
  id: number;
  status: string;
  startTime: string;
  endTime: string;
  clientId: number;
  specialistId: number;
}

export default function CalendarPage() {
  const [events, setEvents] = useState<Array<Record<string, unknown>>>([]);
  const [toast, setToast] = useState<{ open: boolean; message: string }>({ open: false, message: '' });

  const fetchEvents = async () => {
    try {
      const now = new Date();
      const year = now.getFullYear();
      const month = now.getMonth() + 1;
      const { data } = await axiosClient.get('/bookings/month', { params: { year, month } });
      const bookings = data as BookingEvent[];
      setEvents(
        bookings.map((b) => ({
          id: b.id,
          title: b.status,
          start: b.startTime,
          end: b.endTime,
          extendedProps: { clientId: b.clientId, specialistId: b.specialistId },
        }))
      );
    } catch (err: unknown) {
      const e = err as { message?: string };
      setToast({ open: true, message: e.message || 'Error cargando calendario' });
    }
  };

  useEffect(() => {
    fetchEvents();
  }, []);

  const handleEventClick = (info: { event: { id: string; title: string; start: Date; end: Date; extendedProps: { clientId: number; specialistId: number } } }) => {
    const { id, title, start, end, extendedProps } = info.event;
    alert(
      `Reserva ${id}\n` +
      `Estado: ${title}\n` +
      `Inicio: ${start?.toLocaleString()}\n` +
      `Fin: ${end?.toLocaleString()}\n` +
      `Cliente: ${extendedProps.clientId}\n` +
      `Especialista: ${extendedProps.specialistId}`
    );
  };

  return (
    <Container maxWidth="lg" sx={{ mt: 4 }}>
      <Typography variant="h5" sx={{ mb: 2, fontWeight: 700 }}>
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
          right: 'dayGridMonth,dayGridWeek,dayGridDay',
        }}
        height="auto"
      />

      <Snackbar open={toast.open} autoHideDuration={3000} onClose={() => setToast({ open: false, message: '' })}>
        <Alert onClose={() => setToast({ open: false, message: '' })} severity="error" variant="filled">
          {toast.message}
        </Alert>
      </Snackbar>
    </Container>
  );
}
