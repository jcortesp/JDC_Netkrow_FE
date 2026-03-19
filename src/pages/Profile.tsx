import { useContext, useEffect, useState } from 'react';
import { Field, Form, Formik } from 'formik';
import * as Yup from 'yup';
import {
  Box,
  Button,
  Container,
  Grid,
  Stack,
  TextField,
  Typography,
} from '@mui/material';
import axiosClient from '../api/axiosClient';
import { AuthContext } from '../contexts/AuthContext';

const ProfileSchema = Yup.object().shape({
  about: Yup.string().required('Requerido'),
  headline: Yup.string().required('Requerido'),
  location: Yup.string().required('Requerido'),
  timezone: Yup.string().required('Requerido'),
  languages: Yup.string().required('Requerido'),
  skills: Yup.string().required('Requerido'),
  rate: Yup.number().min(0, 'Positivo').required('Requerido'),
  education: Yup.string().required('Requerido'),
  experience: Yup.string().required('Requerido'),
});

interface ProfileForm {
  about: string;
  headline: string;
  location: string;
  timezone: string;
  languages: string;
  skills: string;
  rate: number;
  education: string;
  experience: string;
}

export default function Profile() {
  const { user } = useContext(AuthContext);
  const [profile, setProfile] = useState<ProfileForm | null>(null);
  const [editing, setEditing] = useState(false);

  useEffect(() => {
    axiosClient.get('/specialists/profile', { headers: { userId: user?.id } })
      .then((r) => {
        const d = r.data as Record<string, unknown>;
        setProfile({
          headline: String(d.headline || ''),
          about: String(d.bio || ''),
          location: String(d.location || ''),
          timezone: String(d.timezone || ''),
          languages: Array.isArray(d.languages) ? d.languages.join(', ') : String(d.languages || ''),
          skills: Array.isArray(d.skills) ? d.skills.join(', ') : String(d.skills || ''),
          rate: Number(d.ratePerHour || 0),
          education: String(d.education || ''),
          experience: String(d.experience || ''),
        });
      })
      .catch(() => setProfile(null));
  }, [user?.id]);

  const submit = (vals: ProfileForm, done: () => void) => {
    const payload = {
      ...vals,
      skills: vals.skills.split(',').map((s) => s.trim()),
      ratePerHour: vals.rate,
    };

    axiosClient.post('/specialists/profile', payload, { headers: { userId: user?.id } })
      .then((r) => {
        const d = r.data as Record<string, unknown>;
        setProfile({
          headline: String(d.headline || ''),
          about: String(d.bio || ''),
          location: String(d.location || ''),
          timezone: String(d.timezone || ''),
          languages: Array.isArray(d.languages) ? d.languages.join(', ') : String(d.languages || ''),
          skills: Array.isArray(d.skills) ? d.skills.join(', ') : String(d.skills || ''),
          rate: Number(d.ratePerHour || 0),
          education: String(d.education || ''),
          experience: String(d.experience || ''),
        });
        setEditing(false);
      })
      .finally(done);
  };

  if (!profile) {
    return (
      <Container maxWidth="md" sx={{ py: 4 }}>
        <Typography>Cargando perfil...</Typography>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Typography variant="h5" sx={{ mb: 2, fontWeight: 700 }}>Mi Perfil</Typography>
      <Button variant="outlined" sx={{ mb: 2 }} onClick={() => setEditing((e) => !e)}>
        {editing ? 'Cancelar' : 'Editar'}
      </Button>

      {editing ? (
        <Formik
          initialValues={profile}
          validationSchema={ProfileSchema}
          enableReinitialize
          onSubmit={(vals, actions) => submit(vals, () => actions.setSubmitting(false))}
        >
          {({ isSubmitting }) => (
            <Form>
              <Stack spacing={2}>
                <Field name="about">{({ field }: { field: Record<string, unknown> }) => <TextField {...field} label="Acerca de mi" multiline rows={3} fullWidth />}</Field>
                <Grid container spacing={2}>
                  {['headline', 'location', 'timezone', 'rate'].map((fieldName) => (
                    <Grid size={{ xs: 12, md: 6 }} key={fieldName}>
                      <Field name={fieldName}>
                        {({ field }: { field: Record<string, unknown> }) => (
                          <TextField
                            {...field}
                            fullWidth
                            label={fieldName === 'rate' ? 'Tarifa (USD/h)' : fieldName}
                            type={fieldName === 'rate' ? 'number' : 'text'}
                          />
                        )}
                      </Field>
                    </Grid>
                  ))}
                </Grid>
                <Field name="skills">{({ field }: { field: Record<string, unknown> }) => <TextField {...field} label="Habilidades (comas)" fullWidth />}</Field>
                <Field name="languages">{({ field }: { field: Record<string, unknown> }) => <TextField {...field} label="Idiomas (comas)" fullWidth />}</Field>
                <Field name="education">{({ field }: { field: Record<string, unknown> }) => <TextField {...field} label="Educacion" multiline rows={2} fullWidth />}</Field>
                <Field name="experience">{({ field }: { field: Record<string, unknown> }) => <TextField {...field} label="Experiencia" multiline rows={2} fullWidth />}</Field>
                <Button type="submit" variant="contained" disabled={isSubmitting}>Guardar</Button>
              </Stack>
            </Form>
          )}
        </Formik>
      ) : (
        <Box>
          <Typography sx={{ fontWeight: 700 }}>{profile.headline}</Typography>
          <Typography>Ubicacion: {profile.location}</Typography>
          <Typography>Tarifa: ${profile.rate}/h</Typography>
          <Typography sx={{ mt: 2 }}>{profile.about}</Typography>
          <Typography sx={{ mt: 2 }}><strong>Habilidades:</strong> {profile.skills}</Typography>
          <Typography><strong>Idiomas:</strong> {profile.languages}</Typography>
          <Typography sx={{ mt: 2 }}><strong>Educacion:</strong> {profile.education}</Typography>
          <Typography><strong>Experiencia:</strong> {profile.experience}</Typography>
        </Box>
      )}
    </Container>
  );
}
