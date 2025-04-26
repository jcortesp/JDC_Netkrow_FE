// src/pages/SpecialistDetails.jsx
import React from 'react';
import { useParams } from 'react-router-dom';

function SpecialistDetails() {
  const { id } = useParams();

  return (
    <div>
      <h2>Detalles del Especialista</h2>
      <p>Aquí se mostrarán los detalles del especialista con ID: {id}</p>
    </div>
  );
}

export default SpecialistDetails;
