// src/pages/Register.jsx
import React from 'react';
import { Formik } from 'formik';
import * as Yup from 'yup';
import axiosClient from '../api/axiosClient';
import { useNavigate, Link } from 'react-router-dom';
import {
  Container,
  Box,
  Typography,
  TextField,
  Button,
  MenuItem,
  Stack
} from '@mui/material';

function Register() {
  const navigate = useNavigate();

  const initialValues = {
    name: '',
    email: '',
    password: '',
    role: 'ROLE_CLIENT'  // Valor por defecto; el usuario podrá cambiarlo a ROLE_SPECIALIST
  };

  const validationSchema = Yup.object({
    name: Yup.string().required('Requerido'),
    email: Yup.string().email('Email inválido').required('Requerido'),
    password: Yup.string()
      .min(6, 'Debe tener al menos 6 caracteres')
      .required('Requerido')
    // Se asume que el rol se envía correctamente y no requiere validación adicional
  });

  const onSubmit = async (values, { setSubmitting, setFieldError }) => {
    try {
      // Enviar el objeto con name, email, password y role
      await axiosClient.post('/auth/register', values);
      navigate('/login');
    } catch (error) {
      setFieldError('email', error.response?.data || 'Error al registrar');
    }
    setSubmitting(false);
  };

  return (
    <Container maxWidth="xs" sx={{ mt: 5 }}>
      <Box
        sx={{
          p: 3,
          backgroundColor: '#fff',
          border: '1px solid #ccc',
          borderRadius: 2
        }}
      >
        <Typography variant="h5" mb={2}>
          Registro
        </Typography>
        <Formik
          initialValues={initialValues}
          validationSchema={validationSchema}
          onSubmit={onSubmit}
        >
          {({ errors, touched, isSubmitting, handleChange, handleBlur, values, handleSubmit }) => (
            <form onSubmit={handleSubmit}>
              <Stack spacing={2}>
                <TextField
                  name="name"
                  label="Nombre"
                  variant="outlined"
                  onChange={handleChange}
                  onBlur={handleBlur}
                  value={values.name}
                  error={touched.name && Boolean(errors.name)}
                  helperText={touched.name && errors.name}
                  fullWidth
                />
                <TextField
                  name="email"
                  label="Email"
                  variant="outlined"
                  onChange={handleChange}
                  onBlur={handleBlur}
                  value={values.email}
                  error={touched.email && Boolean(errors.email)}
                  helperText={touched.email && errors.email}
                  fullWidth
                />
                <TextField
                  name="password"
                  label="Contraseña"
                  type="password"
                  variant="outlined"
                  onChange={handleChange}
                  onBlur={handleBlur}
                  value={values.password}
                  error={touched.password && Boolean(errors.password)}
                  helperText={touched.password && errors.password}
                  fullWidth
                />
                <TextField
                  select
                  name="role"
                  label="Rol"
                  variant="outlined"
                  value={values.role}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  fullWidth
                >
                  <MenuItem value="ROLE_CLIENT">Cliente</MenuItem>
                  <MenuItem value="ROLE_SPECIALIST">Especialista</MenuItem>
                </TextField>
                <Button type="submit" variant="contained" disabled={isSubmitting}>
                  Registrarse
                </Button>
              </Stack>
            </form>
          )}
        </Formik>
        <Typography variant="body2" mt={2}>
          ¿Ya tienes una cuenta? <Link to="/login">Inicia sesión aquí</Link>
        </Typography>
      </Box>
    </Container>
  );
}

export default Register;
