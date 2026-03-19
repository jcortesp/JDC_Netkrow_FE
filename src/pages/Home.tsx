import { Button, Container, Paper, Stack, Typography } from '@mui/material';
import { Link as RouterLink } from 'react-router-dom';

export default function Home() {
  return (
    <Container maxWidth="md" sx={{ py: { xs: 5, md: 8 } }}>
      <Paper
        elevation={0}
        sx={{
          p: { xs: 3, md: 4 },
          borderRadius: 3,
          background: 'linear-gradient(145deg, #ffffff 0%, #f3f9ff 100%)',
        }}
      >
        <Typography variant="h4" sx={{ mb: 1 }}>
          Bienvenido a NetKrow
        </Typography>
        <Typography sx={{ mb: 3 }}>
          Encuentra y contrata a los mejores especialistas para tus proyectos.
        </Typography>

        <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1.5}>
          <Button component={RouterLink} to="/search-specialists" variant="contained">
            Buscar especialistas
          </Button>
          <Button component={RouterLink} to="/bookings" variant="outlined">
            Ver reservas
          </Button>
        </Stack>
      </Paper>
    </Container>
  );
}
