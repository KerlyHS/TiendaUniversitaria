import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Layout } from '../shared/components/Layout';

// Pages
import { LoginPage } from '../features/auth/pages/LoginPage';
import { RegisterPage } from '../features/auth/pages/RegisterPage';
import { CatalogPage } from '../features/catalog/pages/CatalogPage';
import { ProductDetailPage } from '../features/catalog/pages/ProductDetailPage';
import { OrdersPage } from '../features/orders/pages/OrdersPage';
import { OrderDetailPage } from '../features/orders/pages/OrderDetailPage';
import { CheckoutPage } from '../features/cart/pages/CheckoutPage';
import { CheckoutSuccessPage } from '../features/orders/pages/CheckoutSuccessPage';
import { CheckoutCancelPage } from '../features/orders/pages/CheckoutCancelPage';
import { InventoryAdminPage } from '../features/admin/pages/InventoryAdminPage';
import { DashboardAdminPage } from '../features/admin/pages/DashboardAdminPage';
import { CajaAdminPage } from '../features/admin/pages/CajaAdminPage';
import { VentasAdminPage } from '../features/admin/pages/VentasAdminPage';
import { AdminLayout } from '../features/admin/layouts/AdminLayout';

// Protected Route
const ProtectedRoute = ({ children }) => {
  const token = sessionStorage.getItem('jwt_token');
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
import { AuthProvider } from '../shared/context/AuthContext';

export const App = () => {
  return (
    <Router>
      <AuthProvider>
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
          <Route path="/producto/:id" element={<ProductDetailPage />} />

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
          <Route
            path="/checkout"
            element={
              <ProtectedRoute>
                <CheckoutPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/pagos/exito"
            element={
              <ProtectedRoute>
                <CheckoutSuccessPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/pagos/cancelado"
            element={
              <ProtectedRoute>
                <CheckoutCancelPage />
              </ProtectedRoute>
            }
          />
          
          {/* Root redirect */}
          <Route path="/" element={<Navigate to="/catalogo" />} />
        </Route>

        {/* Admin Panel */}
        <Route path="/admin" element={
          <ProtectedRoute>
            <AdminLayout />
          </ProtectedRoute>
        }>
          <Route path="dashboard" element={<DashboardAdminPage />} />
          <Route path="inventario" element={<InventoryAdminPage />} />
          {/* Fallback temporales */}
          <Route path="ventas" element={<VentasAdminPage />} />
          <Route path="caja" element={<CajaAdminPage />} />
          <Route path="configuracion" element={<div className="p-8">Módulo de Configuración en construcción</div>} />
          <Route index element={<Navigate to="/admin/dashboard" replace />} />
        </Route>
          </Routes>
        </CartProvider>
      </ToastProvider>
      </AuthProvider>
    </Router>
  );
};
