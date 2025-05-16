import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';
import MedicalLayout from './components/MedicalLayout'; // incluye MedicalNavbar y <Outlet />
import Login from './pages/Login';
import Register from './pages/Register';
import LandingPage from './pages/LandingPage';
import MedicalLogin from './pages/MedicalLogin';
import Remisiones from './pages/Remisiones';
import ServicioTecnico from './pages/ServicioTecnico';
import SearchRemission from './pages/SearchRemission';
import CalendarPage from './pages/CalendarPage';
import ProtectedRoute from './components/ProtectedRoute';
import VolumeReportPage from './pages/VolumeReportPage';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Rutas públicas */}
        <Route path="/" element={<LandingPage />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/medical-login" element={<MedicalLogin />} />

        {/* Muneras Medical: usa MedicalNavbar */}
        <Route element={<ProtectedRoute><MedicalLayout /></ProtectedRoute>}>
          <Route path="/remisiones" element={<Remisiones />} />
          <Route path="/entrega-equipo" element={<SearchRemission />} />
          <Route path="/servicio-tecnico" element={<ServicioTecnico />} />
          <Route path="/reports/volume" element={<VolumeReportPage />} />
        </Route>

        {/* Rutas protegidas con Navbar general */}
        <Route element={<ProtectedRoute><Navbar /></ProtectedRoute>}>
          <Route path="/calendar" element={<CalendarPage />} />
          {/* …otras rutas… */}
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;