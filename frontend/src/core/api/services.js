/**
 * API Services - TiendaUniversitaria
 * 
 * Servicios específicos para cada dominio de negocio
 * Trazabilidad directa con especificaciones SDD
 * 
 * Spec-Kit Metadata:
 * @spec Spec-001: Auth services
 * @spec Spec-002: Catalog services
 * @spec Spec-005: Orders services
 * @spec Spec-007: Cart services (futuro)
 * @spec Spec-006: Payments services (futuro)
 */

import apiClient from './apiClient';

// ============================================================================
// AUTH SERVICES - Spec-001 / Spec-003
// ============================================================================

export const authService = {
  /**
   * Spec-001: Registro de usuario con consentimiento LOPDP
   * POST /api/v1/usuarios/registro/
   */
  register: async (userData) => {
    const response = await apiClient.post('/usuarios/registro/', userData);
    return response.data;
  },

  /**
   * Spec-003: Obtener JWT token
   * POST /api/v1/token/
   */
  login: async (username, password) => {
    const response = await apiClient.post('/auth/login/', {
      email: username,
      password,
    });
    // Convert access_token to access so it's compatible with standard simplejwt response
    return {
      ...response.data,
      access: response.data.access_token,
      refresh: response.data.refresh_token,
    };
  },

  /**
   * Spec-003: Refresh JWT token
   * POST /api/v1/token/refresh/
   */
  refreshToken: async (refresh) => {
    const response = await apiClient.post('/token/refresh/', { refresh });
    return response.data;
  },

  logout: async () => {
    const response = await apiClient.post('/logout/');
    return response.data;
  },

  /**
   * Actualizar Perfil de Usuario
   * PUT /api/v1/usuarios/me/
   */
  updateProfile: async (userData) => {
    const response = await apiClient.put('/usuarios/me/', userData);
    return response.data;
  },
};

// ============================================================================
// CATALOG SERVICES - Spec-002 / Spec-004
// ============================================================================

export const catalogService = {
  /**
   * Spec-002: Listar productos con filtros
   * GET /api/v1/productos/
   * 
   * Parámetros:
   * - search: búsqueda por nombre
   * - categoria: filtro por categoría
   * - ordering: ordenamiento (precio, nombre, stock)
   * - limit: productos por página
   * - offset: paginación
   */
  listProducts: async (params = {}) => {
    const response = await apiClient.get('/productos/', { params });
    return response.data;
  },

  /**
   * Spec-004: Obtener detalle de producto
   * GET /api/v1/productos/{id}/
   */
  getProduct: async (id) => {
    const response = await apiClient.get(`/productos/${id}/`);
    return response.data;
  },

  /**
   * Spec-004: Crear producto (solo admin)
   * POST /api/v1/productos/
   */
  createProduct: async (data) => {
    const response = await apiClient.post('/productos/', data);
    return response.data;
  },

  /**
   * Spec-004: Actualizar producto (solo admin)
   * PUT /api/v1/productos/{id}/
   */
  updateProduct: async (id, data) => {
    const response = await apiClient.put(`/productos/${id}/`, data);
    return response.data;
  },

  /**
   * Spec-004: Eliminar producto (solo admin)
   * DELETE /api/v1/productos/{id}/
   */
  deleteProduct: async (id) => {
    const response = await apiClient.delete(`/productos/${id}/`);
    return response.data;
  },
};

// ============================================================================
// PAYMENTS SERVICES - Spec-006
// ============================================================================

export const paymentService = {
  /**
   * Spec-006: Prepara el Checkout (Stripe Elements)
   * POST /api/v1/pagos/crear-payment-intent/
   */
  createPaymentIntent: async (pedidoId) => {
    const response = await apiClient.post('/pagos/crear-payment-intent/', {
      pedido_id: pedidoId
    });
    return response.data;
  }
};

// ============================================================================
// ORDERS SERVICES - Spec-005
// ============================================================================

export const ordersService = {
  /**
   * Spec-005: Listar órdenes del usuario actual
   * GET /api/v1/pedidos/
   * 
   * Auto-filtrado por usuario (GET devuelve solo órdenes del usuario logueado)
   * Admin ve todas las órdenes
   */
  listOrders: async (params = {}) => {
    const response = await apiClient.get('/pedidos/', { params });
    return response.data;
  },

  /**
   * Spec-005: Obtener detalle de orden
   * GET /api/v1/pedidos/{id}/
   * 
   * Retorna:
   * - numero_pedido: P-YYYYMMDD-XXX
   * - estado: RECIBIDO, PREPARACION, LISTO, ENTREGADO, CANCELADO
   * - detalles: items de la orden
   * - subtotal, impuesto, total
   */
  getOrder: async (id) => {
    const response = await apiClient.get(`/pedidos/${id}/`);
    return response.data;
  },

  /**
   * Spec-005: Crear nueva orden
   * POST /api/v1/pedidos/
   * 
   * Body:
   * {
   *   "detalles": [
   *     { "producto_id": 1, "cantidad": 2 },
   *     { "producto_id": 3, "cantidad": 1 }
   *   ],
   *   "tipo_entrega": "TIENDA" | "DOMICILIO"
   * }
   * 
   * Validaciones en backend:
   * - Stock suficiente (atómico)
   * - Producto activo
   * - Cantidad > 0
   */
  createOrder: async (data) => {
    const response = await apiClient.post('/pedidos/', data);
    return response.data;
  },

  /**
   * Spec-005: Actualizar estado de orden
   * PUT /api/v1/pedidos/{id}/
   * 
   * Body:
   * { "estado": "PREPARACION" | "LISTO" | "CANCELADO" }
   * 
   * Máquina de Estados:
   * - RECIBIDO → PREPARACION | CANCELADO
   * - PREPARACION → LISTO | CANCELADO
   * - LISTO → ENTREGADO | CANCELADO
   * - ENTREGADO → CANCELADO
   * - CANCELADO → (final, sin transiciones)
   * 
   * Efectos:
   * - CANCELADO libera stock automáticamente
   */
  updateOrderStatus: async (id, estado) => {
    const response = await apiClient.put(`/pedidos/${id}/`, { estado });
    return response.data;
  },
};

// ============================================================================
// CART SERVICES - Spec-007 (Futuro)
// ============================================================================

export const cartService = {
  /**
   * Spec-007: Obtener carrito del usuario
   * GET /api/v1/carrito/
   */
  getCart: async () => {
    const response = await apiClient.get('/carrito/');
    return response.data;
  },

  /**
   * Spec-007: Agregar item al carrito
   * POST /api/v1/carrito/items/
   */
  addToCart: async (producto_id, cantidad) => {
    const response = await apiClient.post('/carrito/items/', {
      producto_id,
      cantidad,
    });
    return response.data;
  },

  /**
   * Spec-007: Actualizar cantidad de item
   * PUT /api/v1/carrito/items/{id}/
   */
  updateCartItem: async (item_id, cantidad) => {
    const response = await apiClient.put(`/carrito/items/${item_id}/`, {
      cantidad,
    });
    return response.data;
  },

  /**
   * Spec-007: Remover item del carrito
   * DELETE /api/v1/carrito/items/{id}/
   */
  removeCartItem: async (item_id) => {
    const response = await apiClient.delete(`/carrito/items/${item_id}/`);
    return response.data;
  },

  /**
   * Spec-007: Checkout (convertir carrito a pedido)
   * POST /api/v1/carrito/checkout/
   */
  checkout: async () => {
    const response = await apiClient.post('/carrito/checkout/');
    return response.data;
  },
};

// ============================================================================
// PAYMENTS SERVICES - Spec-006 (Futuro)
// ============================================================================

export const paymentsService = {
  /**
   * Spec-006: Preparar checkout con CopyAndPay
   * POST /api/v1/pagos/preparar-checkout/
   */
  prepareCheckout: async (pedido_id, monto, moneda = 'USD') => {
    const response = await apiClient.post('/pagos/preparar-checkout/', {
      pedido_id,
      monto,
      moneda,
    });
    return response.data;
  },

  /**
   * Spec-006: Confirmar pago después de transacción
   * GET /api/v1/pagos/confirmar/?resourcePath=...
   */
  confirmPayment: async (checkout_id) => {
    const response = await apiClient.get(
      `/pagos/confirmar/?resourcePath=/v1/checkouts/${checkout_id}/payment`
    );
    return response.data;
  },
};
