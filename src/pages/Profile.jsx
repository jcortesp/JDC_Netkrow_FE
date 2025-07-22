import React, { useState, useEffect, useContext } from 'react';
import axiosClient from '../api/axiosClient';
import { AuthContext } from '../contexts/AuthContext';
import {
  Container,
  Heading,
  Button,
  Text,
  Box,
  SimpleGrid,
  FormControl,
  FormLabel,
  Input,
  Textarea,
  Stack,
  useToast,
  Avatar
} from '@chakra-ui/react';
import { Formik, Form, Field } from 'formik';
import * as Yup from 'yup';

const ProfileSchema = Yup.object().shape({
  about: Yup.string().required('Requerido'),
  headline: Yup.string().required('Requerido'),
  location: Yup.string().required('Requerido'),
  timezone: Yup.string().required('Requerido'),
  languages: Yup.string().required('Requerido'),
  skills: Yup.string().required('Requerido'),
  rate: Yup.number().min(0,'Positivo').required('Requerido'),
  education: Yup.string().required('Requerido'),
  experience: Yup.string().required('Requerido')
});

export default function Profile() {
  const { user } = useContext(AuthContext);
  const toast = useToast();
  const [profile, setProfile] = useState(null);
  const [editing, setEditing] = useState(false);

  useEffect(() => {
    axiosClient.get('/specialists/profile',{ headers:{ userId:user.id } })
      .then(r => {
        const d=r.data;
        setProfile({
          headline:d.headline, about:d.bio,
          location:d.location, timezone:d.timezone,
          languages:d.languages, skills:d.skills.join(', '),
          rate:d.ratePerHour, education:d.education,
          experience:d.experience
        });
      });
  }, [user.id]);

  const toggle = () => setEditing(e=>!e);

  const submit = (vals, actions) => {
    const payload = {
      ...vals,
      skills: vals.skills.split(',').map(s=>s.trim()),
      ratePerHour: vals.rate
    };
    axiosClient.post('/specialists/profile', payload, { headers:{ userId:user.id } })
      .then(r => {
        toast({ title:'Perfil actualizado', status:'success' });
        setProfile({ ...r.data, about:r.data.bio });
        setEditing(false);
      })
      .catch(() => toast({ title:'Error', status:'error' }))
      .finally(()=>actions.setSubmitting(false));
  };

  if(!profile) return <Text>Cargando perfil…</Text>;

  return (
    <Container maxW="container.lg" py={8}>
      <Heading size="lg" mb={4}>Mi Perfil</Heading>
      <Button mb={4} onClick={toggle}>
        {editing? 'Cancelar':'Editar'}
      </Button>
      {editing ? (
        <Formik
          initialValues={profile}
          validationSchema={ProfileSchema}
          onSubmit={submit}
          enableReinitialize
        >
          {({ errors, touched, isSubmitting }) => (
            <Form>
              <Stack spacing={4}>
                <FormControl isInvalid={errors.about && touched.about}>
                  <FormLabel>Acerca de mí</FormLabel>
                  <Field as={Textarea} name="about" rows={4}/>
                </FormControl>
                <SimpleGrid columns={{base:1,md:2}} spacing={4}>
                  {['headline','location','timezone','rate'].map(field=>(
                    <FormControl key={field} isInvalid={errors[field] && touched[field]}>
                      <FormLabel>
                        {field==='rate'? 'Tarifa (USD/h)' : field.charAt(0).toUpperCase()+field.slice(1)}
                      </FormLabel>
                      <Field
                        as={field==='about'? Textarea : Input}
                        name={field}
                        type={field==='rate'? 'number':'text'}
                      />
                    </FormControl>
                  ))}
                </SimpleGrid>
                <FormControl isInvalid={errors.skills && touched.skills}>
                  <FormLabel>Habilidades (comas)</FormLabel>
                  <Field as={Input} name="skills" />
                </FormControl>
                <FormControl isInvalid={errors.languages && touched.languages}>
                  <FormLabel>Idiomas (comas)</FormLabel>
                  <Field as={Input} name="languages" />
                </FormControl>
                <FormControl isInvalid={errors.education && touched.education}>
                  <FormLabel>Educación</FormLabel>
                  <Field as={Textarea} name="education" rows={2}/>
                </FormControl>
                <FormControl isInvalid={errors.experience && touched.experience}>
                  <FormLabel>Experiencia</FormLabel>
                  <Field as={Textarea} name="experience" rows={2}/>
                </FormControl>
                <Button type="submit" colorScheme="teal" isLoading={isSubmitting}>
                  Guardar
                </Button>
              </Stack>
            </Form>
          )}
        </Formik>
      ) : (
        <Box>
          <Avatar size="xl" mb={4} />
          <Text fontWeight="bold">{profile.headline}</Text>
          <Text>Ubicación: {profile.location}</Text>
          <Text>Tarifa: ${profile.rate}/h</Text>
          <Text mt={4}>{profile.about}</Text>
          <Text mt={4}><strong>Habilidades:</strong> {profile.skills}</Text>
          <Text><strong>Idiomas:</strong> {profile.languages}</Text>
          <Text mt={4}><strong>Educación:</strong> {profile.education}</Text>
          <Text><strong>Experiencia:</strong> {profile.experience}</Text>
        </Box>
      )}
    </Container>
  );
}
