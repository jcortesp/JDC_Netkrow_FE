import React from 'react';
import { Formik, Form, Field } from 'formik';
import * as Yup from 'yup';
import axiosClient from '../api/axiosClient';
import { useNavigate } from 'react-router-dom';
import {
  Container,
  Box,
  Stack,
  FormControl,
  FormLabel,
  Input,
  Select,
  Button,
  Heading,
  Text,
  useToast,
  Link
} from '@chakra-ui/react';

const RegisterSchema = Yup.object().shape({
  name: Yup.string().required('Requerido'),
  email: Yup.string().email('Inválido').required('Requerido'),
  password: Yup.string().min(6,'Mín 6 chars').required('Requerido')
});

export default function Register() {
  const navigate = useNavigate();
  const toast = useToast();

  return (
    <Container maxW="sm" mt={10}>
      <Box p={6} bg="white" rounded="md" shadow="md">
        <Heading size="md" mb={4}>Registro</Heading>
        <Formik
          initialValues={{ name:'', email:'', password:'', role:'ROLE_CLIENT' }}
          validationSchema={RegisterSchema}
          onSubmit={async (vals, actions) => {
            try {
              await axiosClient.post('/auth/register', vals);
              toast({ title:'Registrado', status:'success' });
              navigate('/login');
            } catch (err) {
              toast({ title:'Error', status:'error', description: err.message });
            } finally {
              actions.setSubmitting(false);
            }
          }}
        >
          {({ errors, touched, isSubmitting }) => (
            <Form>
              <Stack spacing={4}>
                <FormControl isInvalid={errors.name && touched.name}>
                  <FormLabel>Nombre</FormLabel>
                  <Field as={Input} name="name" />
                </FormControl>
                <FormControl isInvalid={errors.email && touched.email}>
                  <FormLabel>Email</FormLabel>
                  <Field as={Input} name="email" />
                </FormControl>
                <FormControl isInvalid={errors.password && touched.password}>
                  <FormLabel>Contraseña</FormLabel>
                  <Field as={Input} name="password" type="password" />
                </FormControl>
                <FormControl>
                  <FormLabel>Rol</FormLabel>
                  <Field as={Select} name="role">
                    <option value="ROLE_CLIENT">Cliente</option>
                    <option value="ROLE_SPECIALIST">Especialista</option>
                  </Field>
                </FormControl>
                <Button type="submit" colorScheme="teal" isLoading={isSubmitting}>
                  Registrarse
                </Button>
              </Stack>
            </Form>
          )}
        </Formik>
        <Text mt={4}>
          ¿Ya tienes cuenta?{' '}
          <Link color="teal.500" href="/login">Inicia sesión aquí</Link>
        </Text>
      </Box>
    </Container>
  );
}
