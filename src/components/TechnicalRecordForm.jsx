import React from 'react';
import {
  Box,
  TextField,
  Button,
  MenuItem,
  Typography,
  Stack
} from '@mui/material';

export default function TechnicalRecordForm({
  form,
  onChange,
  onSubmit,
  readOnly = false,
  error = ''
}) {
  const borderStyle = val => ({
    '& .MuiOutlinedInput-root fieldset': {
      borderColor: val ? 'green' : 'darkgoldenrod'
    },
    '& .MuiOutlinedInput-root.Mui-focused fieldset': {
      borderColor: val ? 'green' : 'darkgoldenrod'
    }
  });

  const errorText = typeof error === 'string'
    ? error
    : error?.message || JSON.stringify(error);

  return (
    <Box component="form" onSubmit={onSubmit} sx={{ mt: 2, mb: 2 }}>
      <Typography variant="h6" gutterBottom>
        Información Técnica
      </Typography>

      {errorText && (
        <Typography color="error" gutterBottom>
          {errorText}
        </Typography>
      )}

      <Stack direction="column" spacing={2}>
        {/* Equipo */}
        <TextField
          select
          label="Equipo"
          name="equipo"
          value={form.equipo}
          onChange={onChange}
          fullWidth
          disabled={readOnly}
          sx={borderStyle(form.equipo)}
          InputLabelProps={{ shrink: true }}
        >
          {[
            'Tensiometro digital',
            'Tensiometro analogico',
            'Tensiometro de muñeca',
            'Bascula digital',
            'Bascula analogica',
            'Glucometro',
            'Nebulizador',
            'Termometro',
            'Termohidrometro',
            'Oximetro',
            'Concentrado de Oxigeno',
            'TEMS',
            'Otro'
          ].map(opt => (
            <MenuItem key={opt} value={opt}>
              {opt}
            </MenuItem>
          ))}
        </TextField>

        {/* Valor (COP) - NUEVO */}
        <TextField
          label="Valor (COP)"
          name="valor"
          type="number"
          inputProps={{ step: '0.01', min: '0' }}
          value={form.valor ?? ''}
          onChange={onChange}
          fullWidth
          disabled={readOnly}
          sx={borderStyle(form.valor ?? '')}
          InputLabelProps={{ shrink: true }}
        />

        {/* Marca */}
        <TextField
          label="Marca"
          name="marca"
          value={form.marca}
          onChange={onChange}
          fullWidth
          disabled={readOnly}
          sx={borderStyle(form.marca)}
          InputLabelProps={{ shrink: true }}
        />

        {/* Serial */}
        <TextField
          label="Serial"
          name="serial"
          value={form.serial}
          onChange={onChange}
          fullWidth
          disabled={readOnly}
          sx={borderStyle(form.serial)}
          InputLabelProps={{ shrink: true }}
        />

        <Typography variant="subtitle1">Diagnóstico</Typography>

        {/* Brazalete */}
        <TextField
          select
          label="Brazalete"
          name="brazalete"
          value={form.brazalete}
          onChange={onChange}
          fullWidth
          disabled={readOnly}
          sx={borderStyle(form.brazalete)}
          InputLabelProps={{ shrink: true }}
        >
          {['OK', 'Fuga', 'Desgaste', 'N/A'].map(v => (
            <MenuItem key={v} value={v}>
              {v}
            </MenuItem>
          ))}
        </TextField>

        {/* Pilas */}
        <TextField
          select
          label="Pilas"
          name="pilas"
          value={form.pilas}
          onChange={onChange}
          fullWidth
          disabled={readOnly}
          sx={borderStyle(form.pilas)}
          InputLabelProps={{ shrink: true }}
        >
          {[
            'OK',
            'Cambio',
            'Recargable',
            'Carbon',
            'Adaptador OK',
            'Adaptador dañado',
            'N/A'
          ].map(v => (
            <MenuItem key={v} value={v}>
              {v}
            </MenuItem>
          ))}
        </TextField>

        {/* Revisión, mantenimiento, limpieza, calibración */}
        {['revision','mantenimiento','limpieza','calibracion'].map(field => (
          <TextField
            key={field}
            select
            label={field.charAt(0).toUpperCase() + field.slice(1)}
            name={field}
            value={form[field]}
            onChange={onChange}
            fullWidth
            disabled={readOnly}
            sx={borderStyle(form[field])}
            InputLabelProps={{ shrink: true }}
          >
            {['Ok', 'Pendiente'].map(v => (
              <MenuItem key={v} value={v}>
                {v}
              </MenuItem>
            ))}
          </TextField>
        ))}

        {/* Notas */}
        <TextField
          label="Notas Diagnóstico"
          name="notasDiagnostico"
          value={form.notasDiagnostico}
          onChange={onChange}
          fullWidth
          multiline
          rows={3}
          disabled={readOnly}
          inputProps={{ maxLength: 100 }}
          sx={borderStyle(form.notasDiagnostico)}
          InputLabelProps={{ shrink: true }}
        />

        {!readOnly && (
          <Button type="submit" variant="contained">
            Guardar
          </Button>
        )}
      </Stack>
    </Box>
  );
}
