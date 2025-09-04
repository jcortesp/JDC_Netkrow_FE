import React from 'react';
import { Link as RouterLink } from 'react-router-dom';
import {
  Box,
  SimpleGrid,
  Card,
  CardHeader,
  CardBody,
  Heading,
  Text,
  Button
} from '@chakra-ui/react';

export default function SpecialistList({ specialists }) {
  if (!specialists.length) {
    return <Text>No se encontraron especialistas.</Text>;
  }
  return (
    <SimpleGrid columns={{ base: 1, md: 2 }} spacing={4}>
      {specialists.map(sp => (
        <Card key={sp.id} borderWidth="1px">
          <CardHeader>
            <Heading size="sm">ID: {sp.id}</Heading>
          </CardHeader>
          <CardBody>
            <Text><strong>Skills:</strong> {sp.skills?.join(', ')}</Text>
            <Text mt={2}><strong>Tarifa:</strong> ${sp.ratePerHour}</Text>
            <Button
              mt={4}
              size="sm"
              as={RouterLink}
              to={`/specialists/${sp.id}`}
            >
              Ver Detalles
            </Button>
          </CardBody>
        </Card>
      ))}
    </SimpleGrid>
  );
}
