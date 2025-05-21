// src/components/ProtectedRoute.jsx
import React, { useContext } from 'react';
import { Navigate } from 'react-router-dom';
import { AuthContext } from '../contexts/AuthContext';

function ProtectedRoute({ children }) {
  const { user } = useContext(AuthContext);

  // Si no hay usuario, redirige a la raíz
  if (!user) {
    return <Navigate to="/" replace />;
  }

  // Si hay usuario, renderiza el componente hijo
  return children;
}

export default ProtectedRoute;
