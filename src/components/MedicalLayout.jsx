import React from 'react';
import { Outlet } from 'react-router-dom';
import MedicalNavbar from './MedicalNavbar';
import Footer from './Footer';

export default function MedicalLayout() {
  return (
    <>
      <MedicalNavbar />

      {/* Outlet para las páginas médicas */}
      <Outlet />

      {/* Footer siempre visible en esquina inferior derecha */}
      <Footer />
    </>
  );
}
