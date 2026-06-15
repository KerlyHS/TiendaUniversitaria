import React from 'react';
import ReactDOM from 'react-dom/client';
import { App } from './app/App';
import './app/index.css';

/**
 * Main Entry Point - TiendaUniversitaria Frontend
 * 
 * Inicializa la aplicación React
 * - AuthProvider para manejo de autenticación
 * - Router para navegación
 * - Estilos globales
 */

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
