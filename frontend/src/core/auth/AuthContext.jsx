import { createContext, useContext, useState, useEffect } from 'react';
import axios from 'axios';

/**
 * AuthContext - TiendaUniversitaria
 * 
 * Context global para manejar estado de autenticación JWT
 * Referencia: Spec-001 (User Registration) / Spec-003 (JWT Auth)
 * 
 * Spec-Kit Metadata:
 * @spec Spec-001: Registro de usuario con consentimiento LOPDP
 * @spec Spec-003: Autenticación JWT con refresh automático
 */

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  // Verificar sesión al montar
  useEffect(() => {
    const token = localStorage.getItem('jwt_token');
    const email = localStorage.getItem('user_email');
    
    if (token && email) {
      setUser({ email });
      setIsAuthenticated(true);
    }
    setIsLoading(false);
  }, []);

  /**
   * Login - POST /api/v1/token/
   * Spec-003: Autenticación JWT
   */
  const login = async (email, password) => {
    setIsLoading(true);
    setError(null);
    
    try {
      const response = await axios.post('/api/token/', {
        username: email,
        password,
      });

      const { access, refresh } = response.data;
      localStorage.setItem('jwt_token', access);
      localStorage.setItem('jwt_refresh', refresh);
      localStorage.setItem('user_email', email);

      setUser({ email });
      setIsAuthenticated(true);
      
      return { success: true };
    } catch (err) {
      const message = err.response?.data?.detail || 'Credenciales inválidas';
      setError(message);
      return { success: false, error: message };
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * Register - POST /api/v1/usuarios/registro/
   * Spec-001: Registro con consentimiento LOPDP
   */
  const register = async (email, password, nombre_completo, consentimiento_lopdp) => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await axios.post('/api/usuarios/registro/', {
        email,
        password,
        nombre_completo,
        consentimiento_lopdp,
      });

      // Auto-login después del registro
      return await login(email, password);
    } catch (err) {
      const message = err.response?.data?.detail || 'Error en el registro';
      setError(message);
      return { success: false, error: message };
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * Logout - POST /api/v1/logout/
   * Spec-003: Logout con blacklist de token
   */
  const logout = async () => {
    try {
      await axios.post('/api/logout/', {}, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('jwt_token')}`,
        },
      });
    } catch (err) {
      console.error('Logout error:', err);
    } finally {
      localStorage.removeItem('jwt_token');
      localStorage.removeItem('jwt_refresh');
      localStorage.removeItem('user_email');
      setUser(null);
      setIsAuthenticated(false);
    }
  };

  /**
   * Refresh Token - POST /api/v1/token/refresh/
   * Spec-003: Refresh automático (7 días)
   */
  const refreshToken = async () => {
    const refresh = localStorage.getItem('jwt_refresh');
    if (!refresh) return false;

    try {
      const response = await axios.post('/api/token/refresh/', {
        refresh,
      });

      localStorage.setItem('jwt_token', response.data.access);
      return true;
    } catch (err) {
      // Si el refresh falla, logout
      await logout();
      return false;
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated,
        isLoading,
        error,
        login,
        register,
        logout,
        refreshToken,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth debe usarse dentro de AuthProvider');
  }
  return context;
};
