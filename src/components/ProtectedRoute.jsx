// src/components/ProtectedRoute.jsx
import React, { useContext } from 'react';
import { Navigate } from 'react-router-dom';
import { AuthContext } from '../contexts/AuthContext';

function ProtectedRoute({ children }) {
  const { user } = useContext(AuthContext);

  // Si no hay usuario, nos vamos a /login
  if (!user) {
    return <Navigate to="/login" replace />;
  }

  // Si sí hay usuario, devolvemos el componente hijo
  return children;
}

export default ProtectedRoute;
