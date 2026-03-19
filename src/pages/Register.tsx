import { useState } from 'react';
import { Formik, Form, Field, FieldProps } from 'formik';
import * as Yup from 'yup';
import axiosClient from '../api/axiosClient';
import { Link, useNavigate } from 'react-router-dom';
import {
  Alert,
  Box,
  Button,
  Container,
  FormControl,
  InputLabel,
  MenuItem,
  Select,
  Snackbar,
  Stack,
  TextField,
  Typography,
} from '@mui/material';
import type { AlertColor } from '@mui/material';

const RegisterSchema = Yup.object().shape({
  name: Yup.string().required('Requerido'),
  email: Yup.string().email('Invalido').required('Requerido'),
  password: Yup.string().min(6, 'Min 6 chars').required('Requerido'),
});

interface RegisterValues {
  name: string;
  email: string;
  password: string;
  role: string;
}

interface ToastState {
  open: boolean;
  message: string;
  severity: AlertColor;
}

export default function Register() {
  const navigate = useNavigate();
  const [toast, setToast] = useState<ToastState>({
    open: false,
    message: '',
    severity: 'success',
  });

  return (
    <Container maxWidth="sm" sx={{ mt: 6 }}>
      <Box sx={{ p: 4, bgcolor: '#fff', borderRadius: 2, boxShadow: 3 }}>
        <Typography variant="h5" sx={{ mb: 2, fontWeight: 700 }}>Registro</Typography>
        <Formik<RegisterValues>
          initialValues={{ name: '', email: '', password: '', role: 'ROLE_CLIENT' }}
          validationSchema={RegisterSchema}
          onSubmit={async (vals, actions) => {
            try {
              await axiosClient.post('/auth/register', vals);
              setToast({ open: true, message: 'Registrado correctamente', severity: 'success' });
              navigate('/login');
            } catch (err: unknown) {
              const e = err as { message?: string; response?: { data?: { message?: string } } };
              setToast({
                open: true,
                message: e.response?.data?.message || e.message || 'Error al registrarse',
                severity: 'error',
              });
            } finally {
              actions.setSubmitting(false);
            }
          }}
        >
          {({ errors, touched, isSubmitting }) => (
            <Form>
              <Stack spacing={2}>
                <Field name="name">
                  {({ field }: FieldProps) => (
                    <TextField
                      {...field}
                      label="Nombre"
                      fullWidth
                      error={!!(errors.name && touched.name)}
                      helperText={touched.name && errors.name ? String(errors.name) : ''}
                    />
                  )}
                </Field>

                <Field name="email">
                  {({ field }: FieldProps) => (
                    <TextField
                      {...field}
                      label="Email"
                      type="email"
                      fullWidth
                      error={!!(errors.email && touched.email)}
                      helperText={touched.email && errors.email ? String(errors.email) : ''}
                    />
                  )}
                </Field>

                <Field name="password">
                  {({ field }: FieldProps) => (
                    <TextField
                      {...field}
                      label="Contrasena"
                      type="password"
                      fullWidth
                      error={!!(errors.password && touched.password)}
                      helperText={touched.password && errors.password ? String(errors.password) : ''}
                    />
                  )}
                </Field>

                <Field name="role">
                  {({ field }: FieldProps) => (
                    <FormControl fullWidth>
                      <InputLabel id="role-label">Rol</InputLabel>
                      <Select {...field} labelId="role-label" label="Rol">
                        <MenuItem value="ROLE_CLIENT">Cliente</MenuItem>
                        <MenuItem value="ROLE_SPECIALIST">Especialista</MenuItem>
                      </Select>
                    </FormControl>
                  )}
                </Field>

                <Button type="submit" variant="contained" disabled={isSubmitting}>
                  {isSubmitting ? 'Registrando...' : 'Registrarse'}
                </Button>
              </Stack>
            </Form>
          )}
        </Formik>

        <Typography variant="body2" sx={{ mt: 2 }}>
          Ya tienes cuenta? <Link to="/login">Inicia sesion aqui</Link>
        </Typography>
      </Box>

      <Snackbar
        open={toast.open}
        autoHideDuration={3500}
        onClose={() => setToast((prev) => ({ ...prev, open: false }))}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert
          onClose={() => setToast((prev) => ({ ...prev, open: false }))}
          severity={toast.severity}
          variant="filled"
          sx={{ width: '100%' }}
        >
          {toast.message}
        </Alert>
      </Snackbar>
    </Container>
  );
}
