import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';

import Navbar from './components/Navbar';
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
import CalendarPage from './pages/CalendarPage';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Rutas públicas */}
        <Route path="/" element={<LandingPage />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/medical-login" element={<MedicalLogin />} />

        {/* Rutas médicas: siempre con MedicalNavbar, logo y footer */}
        <Route
          element={
            <ProtectedRoute>
              <MedicalLayout />
            </ProtectedRoute>
          }
        >
          <Route path="/remisiones" element={<Remisiones />} />
          <Route path="/entrega-equipo" element={<SearchRemission />} />
          <Route path="/servicio-tecnico" element={<ServicioTecnico />} />
          <Route path="/reports/volume" element={<VolumeReportPage />} />
          {/* Puedes añadir aquí más rutas que deban llevar este layout */}
        </Route>

        {/* Rutas protegidas con Navbar general (y sin MedicalNavbar) */}
        <Route
          element={
            <ProtectedRoute>
              <Navbar />
            </ProtectedRoute>
          }
        >
          <Route path="/calendar" element={<CalendarPage />} />
          {/* …otras rutas… */}
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;
