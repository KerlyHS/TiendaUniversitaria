import { createContext, useState, useEffect } from 'react';
import apiClient from '../../core/api/apiClient';

export const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // Load user profile if token exists
  useEffect(() => {
    const loadUser = async () => {
      const token = localStorage.getItem('jwt_token');
      if (token) {
        try {
          const res = await apiClient.get('/usuarios/me/');
          setUser(res.data);
          setIsAuthenticated(true);
        } catch (error) {
          console.error("Error loading user profile:", error);
          // If token is invalid/expired, log out
          localStorage.removeItem('jwt_token');
          localStorage.removeItem('jwt_refresh');
          setIsAuthenticated(false);
          setUser(null);
        }
      } else {
        setIsAuthenticated(false);
      }
      setIsLoading(false);
    };

    loadUser();
  }, []);

  const login = async (email, password) => {
    try {
      setIsLoading(true);
      const response = await apiClient.post('/auth/login/', { email, password });
      
      localStorage.setItem('jwt_token', response.data.access_token);
      localStorage.setItem('jwt_refresh', response.data.refresh_token);
      
      // Fetch user profile immediately
      const profileRes = await apiClient.get('/usuarios/me/');
      setUser(profileRes.data);
      setIsAuthenticated(true);
      
      return { success: true, user: profileRes.data };
    } catch (error) {
      return { success: false, error: error.response?.data?.detail || 'Credenciales inválidas' };
    } finally {
      setIsLoading(false);
    }
  };

  const logout = () => {
    localStorage.removeItem('jwt_token');
    localStorage.removeItem('jwt_refresh');
    setIsAuthenticated(false);
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, isAuthenticated, isLoading, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};
