import React from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Typography
} from '@mui/material';

export default function TechnicalRecordList({ records }) {
  if (!records.length) {
    return (
      <Typography>No hay registros de servicio técnico.</Typography>
    );
  }

  return (
    <TableContainer component={Paper} sx={{ mt: 3 }}>
      <Table>
        <TableHead>
          <TableRow>
            <TableCell>Fecha</TableCell>
            <TableCell>Equipo</TableCell>
            <TableCell>Marca</TableCell>
            <TableCell>Serial</TableCell>
            <TableCell>Brazalete</TableCell>
            <TableCell>Pilas</TableCell>
            <TableCell>Revisión</TableCell>
            <TableCell>Mantenimiento</TableCell>
            <TableCell>Limpieza</TableCell>
            <TableCell>Calibración</TableCell>
            <TableCell>Notas</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {records.map(r => (
            <TableRow key={r.id}>
              <TableCell>
                {new Date(r.createdAt).toLocaleString()}
              </TableCell>
              <TableCell>{r.equipo}</TableCell>
              <TableCell>{r.marca}</TableCell>
              <TableCell>{r.serial}</TableCell>
              <TableCell>{r.brazalete}</TableCell>
              <TableCell>{r.pilas}</TableCell>
              <TableCell>{r.revision}</TableCell>
              <TableCell>{r.mantenimiento}</TableCell>
              <TableCell>{r.limpieza}</TableCell>
              <TableCell>{r.calibracion}</TableCell>
              <TableCell>{r.notasDiagnostico}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </TableContainer>
  );
}
