import React, { useState } from 'react';
import axiosClient from '../api/axiosClient';
import SpecialistList from '../components/SpecialistList';
import {
  Container,
  Heading,
  Box,
  Stack,
  FormControl,
  FormLabel,
  Input,
  NumberInput,
  NumberInputField,
  Button,
  Text,
  useToast
} from '@chakra-ui/react';

export default function SearchSpecialists() {
  const toast = useToast();
  const [skill, setSkill] = useState('');
  const [minRate, setMinRate] = useState('');
  const [maxRate, setMaxRate] = useState('');
  const [specialists, setSpecialists] = useState([]);

  const handleSearch = async e => {
    e.preventDefault();
    try {
      const params = { ...(skill && { skill }), ...(minRate && { minRate }), ...(maxRate && { maxRate }) };
      const { data } = await axiosClient.get('/specialists/search', { params });
      setSpecialists(data);
    } catch (err) {
      toast({ title:'Error buscando', status:'error', description: err.message });
    }
  };

  return (
    <Container maxW="container.md" py={8}>
      <Heading size="lg" mb={4}>Buscar Especialistas</Heading>
      <Box as="form" onSubmit={handleSearch} mb={6}>
        <Stack direction={{ base:'column', md:'row' }} spacing={4}>
          <FormControl>
            <FormLabel>Skill</FormLabel>
            <Input value={skill} onChange={e=>setSkill(e.target.value)} placeholder="Ej: Java" />
          </FormControl>
          <FormControl>
            <FormLabel>Tarifa Mínima</FormLabel>
            <NumberInput value={minRate} onChange={v=>setMinRate(v)}>
              <NumberInputField placeholder="30" />
            </NumberInput>
          </FormControl>
          <FormControl>
            <FormLabel>Tarifa Máxima</FormLabel>
            <NumberInput value={maxRate} onChange={v=>setMaxRate(v)}>
              <NumberInputField placeholder="100" />
            </NumberInput>
          </FormControl>
          <Button colorScheme="teal" type="submit" alignSelf="end">
            Buscar
          </Button>
        </Stack>
      </Box>
      <Heading size="md" mb={2}>Resultados:</Heading>
      <SpecialistList specialists={specialists} />
      {specialists.length===0 && <Text>No hay resultados.</Text>}
    </Container>
  );
}
