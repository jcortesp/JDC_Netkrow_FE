import { Link as RouterLink, useParams } from 'react-router-dom';
import { Button, Container, Paper, Stack, Typography } from '@mui/material';

export default function SpecialistDetails() {
  const { id } = useParams<{ id: string }>();

  return (
    <Container maxWidth="md" sx={{ py: { xs: 5, md: 7 } }}>
      <Paper
        elevation={0}
        sx={{
          p: { xs: 3, md: 4 },
          borderRadius: 3,
          background: 'linear-gradient(145deg, #ffffff 0%, #f4faff 100%)',
        }}
      >
        <Typography variant="h5" sx={{ mb: 1.5 }}>
          Detalles del Especialista
        </Typography>
        <Typography sx={{ mb: 3 }}>
          Aqui se mostraran los detalles del especialista con ID: <strong>{id}</strong>
        </Typography>

        <Stack direction="row" spacing={1.5}>
          <Button component={RouterLink} to="/search-specialists" variant="outlined">
            Volver al listado
          </Button>
          <Button component={RouterLink} to="/create-booking" variant="contained">
            Crear reserva
          </Button>
        </Stack>
      </Paper>
    </Container>
  );
}
