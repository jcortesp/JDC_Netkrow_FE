// src/contexts/AuthContext.jsx
import React, { createContext, useState, useEffect } from 'react';
import jwtDecode from 'jwt-decode';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);

  // Función para extraer el userId del token
  const getUserIdFromToken = (token) => {
    try {
      const decoded = jwtDecode(token);
      if (decoded && decoded.id) {
        return decoded.id;
      }
      console.error("El token no contiene la claim 'id'");
      return null;
    } catch (error) {
      console.error("Error decodificando el token para obtener el id:", error);
      return null;
    }
  };

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      try {
        const decoded = jwtDecode(token);
        if (decoded.exp * 1000 < Date.now()) {
          logout();
        } else {
          const userId = getUserIdFromToken(token);
          setUser({ ...decoded, id: userId });
        }
      } catch (error) {
        console.error('Error decodificando token:', error);
        logout();
      }
    }
  }, []);

  const login = (token) => {
    localStorage.setItem('token', token);
    try {
      const decoded = jwtDecode(token);
      const userId = getUserIdFromToken(token);
      setUser({ ...decoded, id: userId });
    } catch (error) {
      console.error('Error decodificando token en login:', error);
      setUser(null);
    }
  };

  const logout = () => {
    localStorage.removeItem('token');
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export default AuthProvider;
