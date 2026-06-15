import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Layout } from '../shared/components/Layout';

// Pages
import { LoginPage } from '../features/auth/pages/LoginPage';
import { RegisterPage } from '../features/auth/pages/RegisterPage';
import { CatalogPage } from '../features/catalog/pages/CatalogPage';
import { OrdersPage } from '../features/orders/pages/OrdersPage';
import { OrderDetailPage } from '../features/orders/pages/OrderDetailPage';

// Protected Route
const ProtectedRoute = ({ children }) => {
  const token = localStorage.getItem('jwt_token');
  return token ? children : <Navigate to="/login" />;
};

/**
 * App Component - TiendaUniversitaria
 * 
 * Rutas principales del aplicativo:
 * 
 * Públicas:
 * - /login (Spec-001/003)
 * - /registro (Spec-001)
 * - /catalogo (Spec-002/004)
 * 
 * Protegidas:
 * - /dashboard → /pedidos (Spec-005)
 * - /pedidos/:id (Spec-005)
 * - /carrito (Spec-007)
 * - /checkout (Spec-006)
 * 
 * Spec-Kit Metadata:
 * @spec Spec-001: User registration and LOPDP
 * @spec Spec-003: JWT authentication
 * @spec Spec-002: Product catalog
 * @spec Spec-005: Orders/Pedidos
 * @spec Spec-007: Shopping cart (future)
 * @spec Spec-006: Payments (future)
 */

import { CartProvider } from '../shared/context/CartContext';
import { ToastProvider } from '../shared/context/ToastContext';

export const App = () => {
  return (
    <Router>
      <ToastProvider>
        <CartProvider>
          <Routes>
        {/* Autenticación (Spec-001 / Spec-003) */}
        <Route path="/login" element={<LoginPage />} />
        <Route path="/registro" element={<RegisterPage />} />

        {/* Layout para páginas con Header/Footer */}
        <Route element={<Layout />}>
          {/* Catálogo (Spec-002 / Spec-004) */}
          <Route path="/catalogo" element={<CatalogPage />} />
          <Route path="/catalogo/:productId" element={<CatalogPage />} />

          {/* Órdenes/Pedidos (Spec-005) - Protegidas */}
          <Route
            path="/dashboard"
            element={
              <ProtectedRoute>
                <OrdersPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/pedidos"
            element={
              <ProtectedRoute>
                <OrdersPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/pedidos/:orderId"
            element={
              <ProtectedRoute>
                <OrderDetailPage />
              </ProtectedRoute>
            }
          />

          {/* Root redirect */}
          <Route path="/" element={<Navigate to="/catalogo" />} />
        </Route>
          </Routes>
        </CartProvider>
      </ToastProvider>
    </Router>
  );
};
