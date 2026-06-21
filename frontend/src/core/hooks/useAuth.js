import { useContext } from 'react';
import { AuthContext } from '../../shared/context/AuthContext';

/**
 * Custom hook para autenticación
 * Usa AuthContext subyacente para estado global
 */
export const useAuth = () => {
  const context = useContext(AuthContext);
  
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  
  return context;
};
