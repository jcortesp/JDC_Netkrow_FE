import React from 'react';
import { Container, Heading, Text } from '@chakra-ui/react';

export default function Home() {
  return (
    <Container maxW="container.md" py={10}>
      <Heading as="h1" size="xl" mb={4}>Bienvenido a NetKrow</Heading>
      <Text fontSize="lg">
        Encuentra y contrata a los mejores especialistas para tus proyectos.
      </Text>
    </Container>
  );
}
