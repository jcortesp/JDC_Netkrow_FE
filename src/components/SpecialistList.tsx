import { Link as RouterLink } from 'react-router-dom';
import {
  Button,
  Card,
  CardActions,
  CardContent,
  Grid,
  Typography,
} from '@mui/material';

interface Specialist {
  id: number;
  skills?: string[];
  ratePerHour?: number;
}

export default function SpecialistList({ specialists }: { specialists: Specialist[] }) {
  if (!specialists.length) {
    return <Typography>No se encontraron especialistas.</Typography>;
  }

  return (
    <Grid container spacing={2}>
      {specialists.map((sp) => (
        <Grid key={sp.id} size={{ xs: 12, md: 6 }}>
          <Card variant="outlined">
            <CardContent>
              <Typography variant="h6" sx={{ mb: 1 }}>ID: {sp.id}</Typography>
              <Typography><strong>Skills:</strong> {sp.skills?.join(', ')}</Typography>
              <Typography sx={{ mt: 1 }}><strong>Tarifa:</strong> ${sp.ratePerHour}</Typography>
            </CardContent>
            <CardActions>
              <Button component={RouterLink} to={`/specialists/${sp.id}`} variant="contained" size="small">
                Ver Detalles
              </Button>
            </CardActions>
          </Card>
        </Grid>
      ))}
    </Grid>
  );
}
