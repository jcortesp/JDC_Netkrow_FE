import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { ThemeProvider, createTheme, CssBaseline } from '@mui/material';

import NavBar from './components/NavBar';
import MedicalLayout from './components/MedicalLayout';
import ProtectedRoute from './components/ProtectedRoute';

import LandingPage from './pages/LandingPage';
import Login from './pages/Login';
import Register from './pages/Register';
import MedicalLogin from './pages/MedicalLogin';

import Remisiones from './pages/Remisiones';
import SearchRemission from './pages/SearchRemission';
import ServicioTecnico from './pages/ServicioTecnico';
import VolumeReportPage from './pages/VolumeReportPage';

import SearchSpecialists from './pages/SearchSpecialists';
import BookingForm from './components/BookingForm';
import BookingList from './components/BookingList';
import SpecialistDetails from './pages/SpecialistDetails';
import CalendarPage from './pages/CalendarPage';


import RCAWizard from './pages/RCAWizard';

const theme = createTheme({});

function App() {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <BrowserRouter>
        <Routes>
          {/* Públicas */}
          <Route path="/" element={<LandingPage />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/medical-login" element={<MedicalLogin />} />

          {/* Médicas protegidas */}
          <Route element={
            <ProtectedRoute>
              <MedicalLayout />
            </ProtectedRoute>
          }>
            <Route path="/remisiones" element={<Remisiones />} />
            <Route path="/entrega-equipo" element={<SearchRemission />} />
            <Route path="/servicio-tecnico" element={<ServicioTecnico />} />
            <Route path="/reports/volume" element={<VolumeReportPage />} />
          </Route>

          {/* Flujo de especialistas */}
          <Route element={
            <ProtectedRoute>
              <NavBar />
            </ProtectedRoute>
          }>
            <Route path="/search-specialists" element={<SearchSpecialists />} />
            <Route path="/create-booking"    element={<BookingForm />} />
            <Route path="/bookings"          element={<BookingList />} />
            <Route path="/specialists/:id"   element={<SpecialistDetails />} />
            <Route path="/calendar"          element={<CalendarPage />} />
            <Route path="/rca-wizard"        element={<RCAWizard />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </ThemeProvider>
  );
}

export default App;
