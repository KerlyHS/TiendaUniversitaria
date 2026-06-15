import { useState } from 'react';

/**
 * Custom hook para autenticación
 * @spec Spec-001: User registration and LOPDP
 * @spec Spec-003: JWT authentication
 */
export const useAuth = () => {
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  const login = async (email, password) => {
    setIsLoading(true);
    try {
      const response = await fetch('/api/token/', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username: email, password }),
      });
      const data = await response.json();
      localStorage.setItem('jwt_token', data.access);
      localStorage.setItem('jwt_refresh', data.refresh);
      setUser({ email });
      return { success: true };
    } catch (error) {
      return { success: false, error: error.message };
    } finally {
      setIsLoading(false);
    }
  };

  const register = async (email, password, nombre_completo, consentimiento_lopdp) => {
    setIsLoading(true);
    try {
      const response = await fetch('/api/usuarios/registro/', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password, nombre_completo, consentimiento_lopdp }),
      });
      const data = await response.json();
      localStorage.setItem('jwt_token', data.access);
      localStorage.setItem('jwt_refresh', data.refresh);
      setUser({ email });
      return { success: true };
    } catch (error) {
      return { success: false, error: error.message };
    } finally {
      setIsLoading(false);
    }
  };

  const logout = () => {
    localStorage.removeItem('jwt_token');
    localStorage.removeItem('jwt_refresh');
    setUser(null);
  };

  return {
    user,
    isAuthenticated: !!localStorage.getItem('jwt_token'),
    isLoading,
    login,
    register,
    logout,
  };
};
