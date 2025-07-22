import React from 'react';
import { useParams } from 'react-router-dom';
import { Container, Heading, Text } from '@chakra-ui/react';

export default function SpecialistDetails() {
  const { id } = useParams();
  return (
    <Container maxW="container.md" py={8}>
      <Heading size="lg" mb={4}>Detalles del Especialista</Heading>
      <Text>Aquí se mostrarán los detalles del especialista con ID: <strong>{id}</strong></Text>
    </Container>
  );
}
