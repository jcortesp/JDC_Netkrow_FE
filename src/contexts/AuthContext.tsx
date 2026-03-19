import { createContext, useState, useEffect, ReactNode } from 'react';
import { jwtDecode } from 'jwt-decode';
import type { AuthUser } from '../types';

interface AuthContextValue {
  user: AuthUser | null;
  login: (token: string) => void;
  logout: () => void;
}

export const AuthContext = createContext<AuthContextValue>({
  user: null,
  login: () => {},
  logout: () => {},
});

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);

  const decodeToken = (token: string): AuthUser | null => {
    try {
      return jwtDecode<AuthUser>(token);
    } catch {
      return null;
    }
  };

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) return;
    const decoded = decodeToken(token);
    if (!decoded || decoded.exp * 1000 < Date.now()) {
      logout();
    } else {
      setUser(decoded);
    }
  }, []);

  const login = (token: string) => {
    localStorage.setItem('token', token);
    const decoded = decodeToken(token);
    setUser(decoded);
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
}

export default AuthProvider;
