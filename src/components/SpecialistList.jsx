import React from 'react';
import { Link } from 'react-router-dom';
import {
  Box,
  Card,
  CardContent,
  CardActions,
  Typography,
  Button
} from '@mui/material';

function SpecialistList({ specialists }) {
  if (specialists.length === 0) {
    return <p>No se encontraron especialistas con los criterios dados.</p>;
  }

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
      {specialists.map((sp) => (
        <Card key={sp.id} variant="outlined">
          <CardContent>
            <Typography variant="subtitle1">
              <strong>ID:</strong> {sp.id}
            </Typography>
            <Typography variant="body2">
              <strong>Skills:</strong> {sp.skills?.join(', ')}
            </Typography>
            <Typography variant="body2">
              <strong>Tarifa por Hora:</strong> ${sp.ratePerHour}
            </Typography>
          </CardContent>
          <CardActions>
            <Button
              size="small"
              component={Link}
              to={`/specialists/${sp.id}`}
            >
              Ver Detalles
            </Button>
          </CardActions>
        </Card>
      ))}
    </Box>
  );
}

export default SpecialistList;
