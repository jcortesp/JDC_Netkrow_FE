// src/components/MedicalLayout.jsx
import React from 'react';
import { Outlet } from 'react-router-dom';
import MedicalNavbar from './MedicalNavbar';

function MedicalLayout() {
  return (
    <>
      <MedicalNavbar />
      <Outlet />
    </>
  );
}

export default MedicalLayout;
