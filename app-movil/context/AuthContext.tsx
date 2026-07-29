import React, { createContext, useContext, useState, useEffect } from 'react';
import { Platform } from 'react-native';
import AsyncStorageOriginal from '@react-native-async-storage/async-storage';

// Wrapper seguro de AsyncStorage con caídas a localStorage (Web) y memoria para evitar errores de módulos nativos
const memoryStorage: Record<string, string> = {};

const AsyncStorage = {
  getItem: async (key: string): Promise<string | null> => {
    try {
      if (Platform.OS === 'web') {
        return typeof window !== 'undefined' ? window.localStorage.getItem(key) : null;
      }
      return await AsyncStorageOriginal.getItem(key);
    } catch (e) {
      console.warn('SafeStorage: Fallback en getItem', e);
      if (typeof window !== 'undefined' && window.localStorage) {
        return window.localStorage.getItem(key);
      }
      return memoryStorage[key] || null;
    }
  },
  setItem: async (key: string, value: string): Promise<void> => {
    try {
      if (Platform.OS === 'web') {
        if (typeof window !== 'undefined') window.localStorage.setItem(key, value);
        return;
      }
      await AsyncStorageOriginal.setItem(key, value);
    } catch (e) {
      console.warn('SafeStorage: Fallback en setItem', e);
      if (typeof window !== 'undefined' && window.localStorage) {
        window.localStorage.setItem(key, value);
      } else {
        memoryStorage[key] = value;
      }
    }
  },
  removeItem: async (key: string): Promise<void> => {
    try {
      if (Platform.OS === 'web') {
        if (typeof window !== 'undefined') window.localStorage.removeItem(key);
        return;
      }
      await AsyncStorageOriginal.removeItem(key);
    } catch (e) {
      console.warn('SafeStorage: Fallback en removeItem', e);
      if (typeof window !== 'undefined' && window.localStorage) {
        window.localStorage.removeItem(key);
      } else {
        delete memoryStorage[key];
      }
    }
  }
};

import { handleAppError } from '../utils/errorHelper';

import Constants from 'expo-constants';

// URL base dinámica del API. En desarrollo, detecta dinámicamente la IP del host de Metro 
// para permitir conectarse al backend local desde dispositivos físicos usando Expo Go.
const getApiUrl = () => {
  const hostUri = Constants.expoConfig?.hostUri;
  if (hostUri) {
    const hostIp = hostUri.split(':')[0];
    return `http://${hostIp}:8000/api/v1`;
  }
  return Platform.OS === 'android' 
    ? 'http://10.0.2.2:8000/api/v1' 
    : 'http://localhost:8000/api/v1';
};

export const API_URL = getApiUrl();

export interface User {
  id: number;
  email: string;
  nombre_completo: string;
  rol: string;
  is_universidad: boolean;
  identificacion: string;
  telefono: string;
  direccion: string;
  comunidad_rol?: string;
  consentimiento_lopdp?: boolean;
}

interface AuthContextType {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
  login: (email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  register: (payload: any) => Promise<{ success: boolean; error?: string }>;
  logout: () => Promise<void>;
  updateUserProfileState: (updatedUser: User) => void;
  apiFetch: (endpoint: string, options?: RequestInit) => Promise<Response>;
}

export const AuthContext = createContext<AuthContextType | null>(null);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Verificar la sesión almacenada al iniciar la aplicación
  useEffect(() => {
    const loadSession = async () => {
      try {
        const storedToken = await AsyncStorage.getItem('user_token');
        const storedUser = await AsyncStorage.getItem('user_data');

        if (storedToken && storedUser) {
          setToken(storedToken);
          const parsedUser = JSON.parse(storedUser);
          setUser(parsedUser);
          setIsAuthenticated(true);
          
          // Intentar verificar y refrescar los datos desde el servidor en segundo plano
          fetchFreshProfile(storedToken);
        }
      } catch (err) {
        console.error('Error cargando sesión móvil:', err);
      } finally {
        setIsLoading(false);
      }
    };

    loadSession();
  }, []);

  // Obtiene los datos actualizados del perfil desde el servidor
  const fetchFreshProfile = async (authToken: string) => {
    try {
      const response = await fetch(`${API_URL}/usuarios/me/`, {
        headers: {
          'Authorization': `Bearer ${authToken}`,
          'Content-Type': 'application/json',
        }
      });

      if (response.ok) {
        const freshUser = await response.json();
        await AsyncStorage.setItem('user_data', JSON.stringify(freshUser));
        setUser(freshUser);
      } else if (response.status === 401) {
        // El token expiró o ya no es válido
        console.log('Sesión expirada. Limpiando credenciales...');
        await handleLogoutSession();
      }
    } catch (err) {
      console.error('Error al actualizar perfil desde el servidor:', err);
    }
  };

  // Función para cerrar sesión limpiando el almacenamiento y estado local
  const handleLogoutSession = async () => {
    try {
      const refreshToken = await AsyncStorage.getItem('user_refresh');
      if (refreshToken) {
        // Opcional: Llamar al endpoint de logout del backend
        await fetch(`${API_URL}/auth/logout/`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ refresh: refreshToken })
        }).catch(err => console.log('Error notificando logout al backend:', err));
      }
    } catch (err) {
      console.log('Error en logout:', err);
    } finally {
      await AsyncStorage.removeItem('user_token');
      await AsyncStorage.removeItem('user_refresh');
      await AsyncStorage.removeItem('user_data');
      setToken(null);
      setUser(null);
      setIsAuthenticated(false);
    }
  };

  const login = async (email: string, password: string) => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await fetch(`${API_URL}/auth/login/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (response.ok && data.status === 'success') {
        const authToken = data.access_token;
        const refreshToken = data.refresh_token;

        // Guardamos los tokens iniciales
        await AsyncStorage.setItem('user_token', authToken);
        await AsyncStorage.setItem('user_refresh', refreshToken);
        setToken(authToken);

        // Obtenemos los datos completos del perfil del usuario
        const profileRes = await fetch(`${API_URL}/usuarios/me/`, {
          headers: {
            'Authorization': `Bearer ${authToken}`,
            'Content-Type': 'application/json',
          }
        });

        let fullUser: User = data.user;
        if (profileRes.ok) {
          fullUser = await profileRes.json();
        }

        await AsyncStorage.setItem('user_data', JSON.stringify(fullUser));
        setUser(fullUser);
        setIsAuthenticated(true);
        return { success: true };
      } else {
        const errorMsg = data.message || (data.errors && Object.values(data.errors).flat().join(' ')) || 'Credenciales inválidas.';
        const friendlyMsg = handleAppError({ message: errorMsg, status: response.status }, 'login');
        setError(friendlyMsg);
        return { success: false, error: friendlyMsg };
      }
    } catch (err) {
      const friendlyMsg = handleAppError(err, 'login');
      setError(friendlyMsg);
      return { success: false, error: friendlyMsg };
    } finally {
      setIsLoading(false);
    }
  };

  const register = async (payload: any) => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await fetch(`${API_URL}/usuarios/registro/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      const data = await response.json();

      if (response.ok || response.status === 201) {
        // Auto-login después del registro exitoso
        return await login(payload.email, payload.password);
      } else {
        let errorMsg = 'No se pudo completar el registro.';
        if (data.email) errorMsg = `Correo: ${data.email[0]}`;
        else if (data.identificacion) errorMsg = `Identificación: ${data.identificacion[0]}`;
        else if (data.errors) {
          errorMsg = Object.values(data.errors).flat().join(' ');
        } else if (data.detail) errorMsg = data.detail;
        
        const friendlyMsg = handleAppError({ message: errorMsg, status: response.status }, 'register');
        setError(friendlyMsg);
        return { success: false, error: friendlyMsg };
      }
    } catch (err) {
      const friendlyMsg = handleAppError(err, 'register');
      setError(friendlyMsg);
      return { success: false, error: friendlyMsg };
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async () => {
    setIsLoading(true);
    await handleLogoutSession();
    setIsLoading(false);
  };

  const updateUserProfileState = (updatedUser: User) => {
    setUser(updatedUser);
    AsyncStorage.setItem('user_data', JSON.stringify(updatedUser)).catch(err => 
      console.error('Error guardando perfil actualizado localmente:', err)
    );
  };

  // Envoltura HTTP para adjuntar tokens automáticamente
  const apiFetch = async (endpoint: string, options: RequestInit = {}) => {
    const headers = new Headers(options.headers || {});
    
    if (token) {
      headers.set('Authorization', `Bearer ${token}`);
    }
    if (!headers.has('Content-Type') && !(options.body instanceof FormData)) {
      headers.set('Content-Type', 'application/json');
    }

    const config = {
      ...options,
      headers,
    };

    const formattedEndpoint = endpoint.startsWith('/') ? endpoint : `/${endpoint}`;
    return fetch(`${API_URL}${formattedEndpoint}`, config);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isAuthenticated,
        isLoading,
        error,
        login,
        register,
        logout,
        updateUserProfileState,
        apiFetch,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth debe ser utilizado dentro de un AuthProvider');
  }
  return context;
};
