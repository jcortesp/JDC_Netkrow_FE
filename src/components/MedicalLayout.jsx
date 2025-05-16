import React from 'react';
import { Outlet } from 'react-router-dom';
import MedicalNavbar from './MedicalNavbar';
import Footer from './Footer';

export default function MedicalLayout() {
  return (
    <>
      <MedicalNavbar />
      <Outlet />

      {/* Aquí se añade siempre el footer en la esquina inferior derecha */}
      <Footer />
    </>
  );
}
