import React, { useState, useContext, useEffect } from 'react';
import {
  Container,
  Grid,
  Box,
  Typography,
  TextField,
  Button,
  Stack,
  Avatar,
  Divider
} from '@mui/material';
import axiosClient from '../api/axiosClient';
import { AuthContext } from '../contexts/AuthContext';
import { Formik, Form } from 'formik';
import * as Yup from 'yup';

// Esquema de validación para el formulario del perfil
const ProfileSchema = Yup.object().shape({
  headline: Yup.string().required('Requerido'),
  about: Yup.string().required('Requerido'),
  location: Yup.string().required('Requerido'),
  timezone: Yup.string().required('Requerido'),
  languages: Yup.string().required('Requerido'),
  skills: Yup.string().required('Requerido'),
  rate: Yup.number()
    .typeError('Debe ser un número')
    .required('Requerido')
    .min(0, 'Debe ser un número positivo'),
  education: Yup.string().required('Requerido'),
  experience: Yup.string().required('Requerido')
});

const Profile = () => {
  const { user } = useContext(AuthContext);
  const userId = user ? user.id : null;

  // Inicialmente se carga el perfil desde el backend
  const [profile, setProfile] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [message, setMessage] = useState('');

  // Cargar datos del perfil del especialista
  useEffect(() => {
    const fetchProfile = async () => {
      if (!userId) return;
      try {
        const response = await axiosClient.get('/specialists/profile', {
          headers: { userId }
        });
        const data = response.data;
        setProfile({
          headline: data.headline || '',
          about: data.bio || '',
          location: data.location || '',
          timezone: data.timezone || '',
          languages: data.languages || '',
          skills: data.skills ? data.skills.join(', ') : '',
          rate: data.ratePerHour ? data.ratePerHour.toString() : '',
          education: data.education || '',
          experience: data.experience || ''
        });
      } catch (error) {
        console.error('Error fetching profile:', error);
      }
    };
    fetchProfile();
  }, [userId]);

  const handleToggleEdit = () => {
    setIsEditing(!isEditing);
    setMessage('');
  };

  // Función para enviar la actualización del perfil
  const handleSubmitProfile = async (values, { setSubmitting }) => {
    try {
      const payload = {
        headline: values.headline,
        bio: values.about,
        location: values.location,
        timezone: values.timezone,
        languages: values.languages,
        education: values.education,
        experience: values.experience,
        skills: values.skills.split(',').map(skill => skill.trim()),
        ratePerHour: values.rate
      };
      const response = await axiosClient.post('/specialists/profile', payload, {
        headers: { userId }
      });
      setMessage('Perfil actualizado exitosamente');
      // Actualizamos el estado del perfil con la respuesta del backend
      setProfile({
        headline: response.data.headline || '',
        about: response.data.bio || '',
        location: response.data.location || '',
        timezone: response.data.timezone || '',
        languages: response.data.languages || '',
        skills: response.data.skills ? response.data.skills.join(', ') : '',
        rate: response.data.ratePerHour ? response.data.ratePerHour.toString() : '',
        education: response.data.education || '',
        experience: response.data.experience || ''
      });
      setIsEditing(false);
    } catch (error) {
      console.error('Error updating profile:', error);
      setMessage('Error al actualizar el perfil');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Container maxWidth="lg" sx={{ mt: 4 }}>
      <Typography variant="h4" gutterBottom>
        Mi Perfil
      </Typography>
      <Button variant="contained" onClick={handleToggleEdit} sx={{ mb: 2 }}>
        {isEditing ? 'Cancelar Edición' : 'Editar'}
      </Button>
      {message && <Typography variant="body2" color="primary">{message}</Typography>}
      {profile ? (
        <Grid container spacing={4}>
          {/* Columna izquierda: Datos Básicos y Avatar */}
          <Grid item xs={12} md={4}>
            <Box sx={{ textAlign: 'center' }}>
              <Avatar
                alt="Foto de perfil"
                src="https://via.placeholder.com/150"
                sx={{ width: 150, height: 150, margin: '0 auto' }}
              />
            </Box>
            {!isEditing && (
              <Stack spacing={2} sx={{ mt: 3 }}>
                <Typography variant="h6">{profile.headline}</Typography>
                <Typography variant="body1">{profile.location}</Typography>
                <Typography variant="body1">Tarifa: {profile.rate} USD/h</Typography>
              </Stack>
            )}
          </Grid>
          {/* Columna derecha: Detalles y Formulario de Edición */}
          <Grid item xs={12} md={8}>
            {isEditing ? (
              <Formik
                initialValues={{
                  headline: profile.headline,
                  about: profile.about,
                  location: profile.location,
                  timezone: profile.timezone,
                  languages: profile.languages,
                  skills: profile.skills,
                  rate: profile.rate,
                  education: profile.education,
                  experience: profile.experience
                }}
                validationSchema={ProfileSchema}
                onSubmit={handleSubmitProfile}
                enableReinitialize={true}
              >
                {({ errors, touched, isSubmitting, handleChange, handleBlur, values }) => (
                  <Form>
                    <Box sx={{ mb: 4 }}>
                      <Typography variant="h6" gutterBottom>
                        Acerca de mí
                      </Typography>
                      <TextField
                        fullWidth
                        label="Acerca de"
                        name="about"
                        value={values.about}
                        onChange={handleChange}
                        onBlur={handleBlur}
                        error={touched.about && Boolean(errors.about)}
                        helperText={touched.about && errors.about}
                        multiline
                        rows={4}
                        sx={{ mb: 2 }}
                      />
                    </Box>
                    <Divider sx={{ my: 3 }} />
                    <Box sx={{ mb: 4 }}>
                      <Typography variant="h6" gutterBottom>
                        Datos Básicos
                      </Typography>
                      <TextField
                        fullWidth
                        label="Titular / Headline"
                        name="headline"
                        value={values.headline}
                        onChange={handleChange}
                        onBlur={handleBlur}
                        error={touched.headline && Boolean(errors.headline)}
                        helperText={touched.headline && errors.headline}
                        sx={{ mb: 2 }}
                      />
                      <TextField
                        fullWidth
                        label="Ubicación"
                        name="location"
                        value={values.location}
                        onChange={handleChange}
                        onBlur={handleBlur}
                        error={touched.location && Boolean(errors.location)}
                        helperText={touched.location && errors.location}
                        sx={{ mb: 2 }}
                      />
                      <TextField
                        fullWidth
                        label="Timezone"
                        name="timezone"
                        value={values.timezone}
                        onChange={handleChange}
                        onBlur={handleBlur}
                        error={touched.timezone && Boolean(errors.timezone)}
                        helperText={touched.timezone && errors.timezone}
                        sx={{ mb: 2 }}
                      />
                      <TextField
                        fullWidth
                        label="Tarifa (USD/h)"
                        name="rate"
                        type="number"
                        value={values.rate}
                        onChange={handleChange}
                        onBlur={handleBlur}
                        error={touched.rate && Boolean(errors.rate)}
                        helperText={touched.rate && errors.rate}
                        sx={{ mb: 2 }}
                      />
                    </Box>
                    <Divider sx={{ my: 3 }} />
                    <Box sx={{ mb: 4 }}>
                      <Typography variant="h6" gutterBottom>
                        Otros Detalles
                      </Typography>
                      <TextField
                        fullWidth
                        label="Habilidades (separadas por comas)"
                        name="skills"
                        value={values.skills}
                        onChange={handleChange}
                        onBlur={handleBlur}
                        error={touched.skills && Boolean(errors.skills)}
                        helperText={touched.skills && errors.skills}
                        sx={{ mb: 2 }}
                      />
                      <TextField
                        fullWidth
                        label="Idiomas (separados por comas)"
                        name="languages"
                        value={values.languages}
                        onChange={handleChange}
                        onBlur={handleBlur}
                        error={touched.languages && Boolean(errors.languages)}
                        helperText={touched.languages && errors.languages}
                        sx={{ mb: 2 }}
                      />
                      <TextField
                        fullWidth
                        label="Educación"
                        name="education"
                        value={values.education}
                        onChange={handleChange}
                        onBlur={handleBlur}
                        error={touched.education && Boolean(errors.education)}
                        helperText={touched.education && errors.education}
                        multiline
                        rows={3}
                        sx={{ mb: 2 }}
                      />
                      <TextField
                        fullWidth
                        label="Experiencia"
                        name="experience"
                        value={values.experience}
                        onChange={handleChange}
                        onBlur={handleBlur}
                        error={touched.experience && Boolean(errors.experience)}
                        helperText={touched.experience && errors.experience}
                        multiline
                        rows={3}
                        sx={{ mb: 2 }}
                      />
                    </Box>
                    <Button variant="contained" color="primary" type="submit" disabled={isSubmitting}>
                      Guardar
                    </Button>
                  </Form>
                )}
              </Formik>
            ) : (
              <Box>
                <Typography variant="h6" gutterBottom>
                  Acerca de mí
                </Typography>
                <Typography variant="body1" sx={{ mb: 2 }}>{profile.about}</Typography>
                <Divider sx={{ my: 3 }} />
                <Typography variant="h6" gutterBottom>
                  Habilidades
                </Typography>
                <Typography variant="body1" sx={{ mb: 2 }}>{profile.skills}</Typography>
                <Divider sx={{ my: 3 }} />
                <Typography variant="h6" gutterBottom>
                  Idiomas
                </Typography>
                <Typography variant="body1" sx={{ mb: 2 }}>{profile.languages}</Typography>
                <Divider sx={{ my: 3 }} />
                <Typography variant="h6" gutterBottom>
                  Educación
                </Typography>
                <Typography variant="body1" sx={{ mb: 2 }}>{profile.education}</Typography>
                <Divider sx={{ my: 3 }} />
                <Typography variant="h6" gutterBottom>
                  Experiencia
                </Typography>
                <Typography variant="body1" sx={{ mb: 2 }}>{profile.experience}</Typography>
              </Box>
            )}
          </Grid>
        </Grid>
      ) : (
        <Typography>Cargando perfil...</Typography>
      )}
    </Container>
  );
};

export default Profile;
