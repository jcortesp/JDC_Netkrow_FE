import { useContext } from 'react';
import { Navigate } from 'react-router-dom';
import { AuthContext } from '../contexts/AuthContext';
import type { ReactNode } from 'react';

interface ProtectedRouteProps {
  children: ReactNode;
}

function ProtectedRoute({ children }: ProtectedRouteProps) {
  const { user } = useContext(AuthContext);

  if (!user) {
    return <Navigate to="/" replace />;
  }

  return <>{children}</>;
}

export default ProtectedRoute;
