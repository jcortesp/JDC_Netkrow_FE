import React, { useState } from 'react';
import axiosClient from '../api/axiosClient';
import SpecialistList from '../components/SpecialistList';
import {
  Container,
  Box,
  Typography,
  TextField,
  Button
} from '@mui/material';

function SearchSpecialists() {
  const [skill, setSkill] = useState('');
  const [minRate, setMinRate] = useState('');
  const [maxRate, setMaxRate] = useState('');
  const [specialists, setSpecialists] = useState([]);
  const [message, setMessage] = useState('');

  const handleSearch = async (e) => {
    e.preventDefault();
    try {
      const params = {};
      if (skill) params.skill = skill;
      if (minRate) params.minRate = minRate;
      if (maxRate) params.maxRate = maxRate;

      const response = await axiosClient.get('/specialists/search', { params });
      setSpecialists(response.data);
      setMessage('');
    } catch (error) {
      console.error('Error al buscar especialistas:', error);
      setMessage(error.response?.data?.message || 'Error al buscar especialistas');
    }
  };

  return (
    <Container maxWidth="md" sx={{ mt: 4 }}>
      <Typography variant="h5" mb={2}>
        Buscar Especialistas
      </Typography>

      <Box
        component="form"
        onSubmit={handleSearch}
        sx={{ display: 'flex', gap: 2, flexWrap: 'wrap', mb: 2 }}
      >
        <TextField
          label="Skill"
          value={skill}
          onChange={(e) => setSkill(e.target.value)}
          placeholder="Ej: Java, Diseño..."
        />
        <TextField
          label="Tarifa Mínima"
          type="number"
          value={minRate}
          onChange={(e) => setMinRate(e.target.value)}
          placeholder="Ej: 30"
        />
        <TextField
          label="Tarifa Máxima"
          type="number"
          value={maxRate}
          onChange={(e) => setMaxRate(e.target.value)}
          placeholder="Ej: 100"
        />
        <Button type="submit" variant="contained">
          Buscar
        </Button>
      </Box>

      {message && (
        <Typography variant="body2" color="error" sx={{ mb: 2 }}>
          {message}
        </Typography>
      )}

      <Typography variant="h6" mb={1}>
        Resultados:
      </Typography>
      <SpecialistList specialists={specialists} />
    </Container>
  );
}

export default SearchSpecialists;
