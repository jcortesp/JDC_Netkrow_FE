import React, { useState } from 'react';
import axiosClient from '../api/axiosClient';
import {
  Container,
  Heading,
  Box,
  Button,
  Stack,
  Input,
  useToast,
  Alert,
  AlertIcon,
} from '@chakra-ui/react';
import JourneyGraph from '../components/JourneyGraph';

export default function RCAWizard() {
  const [chainInput, setChainInput] = useState('');
  const [chainLoading, setChainLoading] = useState(false);
  const [routes, setRoutes] = useState([]);
  const [chainError, setChainError] = useState(null);
  const [results, setResults] = useState(null);

  const toast = useToast();

  const handleChain = async () => {
    setChainError(null);
    setRoutes([]);
    setResults(null);
    if (!chainInput || !chainInput.trim()) {
      setChainError("Ingrese la cadena a buscar.");
      return;
    }
    setChainLoading(true);
    try {
      const { data } = await axiosClient.post('/rca/backtrace', { search: chainInput });
      setRoutes(Array.isArray(data.routes) ? data.routes : []);
      setResults(data);
      if (!data || !data.routes || data.routes.length === 0) {
        toast({ title: "No se encontraron rutas padres ni transactions.", status: "info" });
      }
    } catch (err) {
      setChainError("Error en la búsqueda de rutas. Revisa la conexión.");
      toast({ title: "Error en búsqueda encadenada", status: "error" });
    }
    setChainLoading(false);
  };

  function renderAllRoutesGraph() {
    if (!routes || routes.length === 0) return null;
    return (
      <Box mt={5}>
        <Heading size="sm" mb={2}>Rutas encontradas (journey visual):</Heading>
        <JourneyGraph routes={routes} />
      </Box>
    );
  }

  return (
    <Container maxW="6xl" py={8}>
      <Heading mb={6}>RCA Wizard (Sterling OMS)</Heading>
      <Box mt={10} p={4} borderWidth={1} borderRadius="md" bg="gray.50">
        <Heading size="sm" mb={2}>Buscar todas las rutas padres (journey backwards)</Heading>
        <Stack spacing={3}>
          <Input
            placeholder="adidasLAM_ReturnUpdateSvc"
            value={chainInput}
            onChange={e => setChainInput(e.target.value)}
            fontSize="sm"
          />
          <Button
            colorScheme="blue"
            onClick={handleChain}
            isLoading={chainLoading}
          >
            Buscar rutas padres
          </Button>
          {chainError && (
            <Alert status="error" fontSize="sm">
              <AlertIcon />
              {chainError}
            </Alert>
          )}
          {renderAllRoutesGraph()}
        </Stack>
      </Box>
    </Container>
  );
}
