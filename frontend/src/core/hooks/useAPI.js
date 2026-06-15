/**
 * Custom Hooks - TiendaUniversitaria
 * 
 * Hooks reutilizables para consumir datos de las especificaciones
 * Vinculación directa con servicios API
 * 
 * Spec-Kit Metadata:
 * @spec Spec-002: useProducts, useProduct
 * @spec Spec-005: useOrders, useOrderDetail
 * @spec Spec-007: useCart
 * @spec Spec-006: usePayment
 */

import { useState, useEffect, useCallback } from 'react';
import { catalogService, ordersService, cartService, paymentsService } from '../api/services';

/**
 * Hook: Listar Productos con Filtros
 * Spec-002: GET /api/v1/productos/
 * 
 * Soporta:
 * - Búsqueda por nombre
 * - Filtro por categoría
 * - Ordenamiento
 * - Paginación
 */
export const useProducts = (filters = {}) => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [pagination, setPagination] = useState({ count: 0, next: null, previous: null });

  const fetchProducts = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const data = await catalogService.listProducts(filters);
      setProducts(data.results || data);
      
      if (data.count !== undefined) {
        setPagination({
          count: data.count,
          next: data.next,
          previous: data.previous,
        });
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [filters]);

  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  return { products, loading, error, pagination, refetch: fetchProducts };
};

/**
 * Hook: Obtener Detalle de Producto
 * Spec-004: GET /api/v1/productos/{id}/
 */
export const useProduct = (productId) => {
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!productId) return;

    const fetchProduct = async () => {
      setLoading(true);
      setError(null);

      try {
        const data = await catalogService.getProduct(productId);
        setProduct(data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchProduct();
  }, [productId]);

  return { product, loading, error };
};

/**
 * Hook: Listar Órdenes del Usuario
 * Spec-005: GET /api/v1/pedidos/
 * 
 * Auto-filtrado:
 * - Usuarios normales ven solo sus órdenes
 * - Admin ve todas las órdenes
 */
export const useOrders = (filters = {}) => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [pagination, setPagination] = useState({ count: 0 });

  const fetchOrders = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const data = await ordersService.listOrders(filters);
      setOrders(data.results || data);
      
      if (data.count !== undefined) {
        setPagination({ count: data.count });
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [filters]);

  useEffect(() => {
    fetchOrders();
  }, [fetchOrders]);

  return { orders, loading, error, pagination, refetch: fetchOrders };
};

/**
 * Hook: Detalle de Orden
 * Spec-005: GET /api/v1/pedidos/{id}/
 * 
 * Retorna:
 * - numero_pedido: P-YYYYMMDD-XXX
 * - estado (máquina): RECIBIDO → PREPARACION → LISTO → ENTREGADO
 * - detalles con productos
 * - totales (subtotal + impuesto)
 */
export const useOrderDetail = (orderId) => {
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!orderId) return;

    const fetchOrder = async () => {
      setLoading(true);
      setError(null);

      try {
        const data = await ordersService.getOrder(orderId);
        setOrder(data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchOrder();
  }, [orderId]);

  return { order, loading, error };
};

/**
 * Hook: Crear Orden
 * Spec-005: POST /api/v1/pedidos/
 * 
 * Validaciones en backend:
 * - Stock suficiente (transacción atómica)
 * - Producto activo
 * - Cantidad > 0
 * 
 * Retorna:
 * - numero_pedido: Identificador único
 */
export const useCreateOrder = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [newOrder, setNewOrder] = useState(null);

  const createOrder = useCallback(async (detalles, tipo_entrega) => {
    setLoading(true);
    setError(null);

    try {
      const data = await ordersService.createOrder({
        detalles,
        tipo_entrega,
      });
      setNewOrder(data);
      return { success: true, data };
    } catch (err) {
      setError(err.message);
      return { success: false, error: err.message };
    } finally {
      setLoading(false);
    }
  }, []);

  return { createOrder, loading, error, newOrder };
};

/**
 * Hook: Actualizar Estado de Orden (Máquina de Estados)
 * Spec-005: PUT /api/v1/pedidos/{id}/
 * 
 * Máquina de Estados:
 * - RECIBIDO → PREPARACION | CANCELADO
 * - PREPARACION → LISTO | CANCELADO
 * - LISTO → ENTREGADO | CANCELADO
 * - ENTREGADO → CANCELADO
 * - CANCELADO → (final)
 * 
 * Efecto secundario:
 * - CANCELADO libera stock automáticamente
 */
export const useUpdateOrderStatus = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const updateStatus = useCallback(async (orderId, newStatus) => {
    setLoading(true);
    setError(null);

    try {
      const data = await ordersService.updateOrderStatus(orderId, newStatus);
      return { success: true, data };
    } catch (err) {
      setError(err.message);
      return { success: false, error: err.message };
    } finally {
      setLoading(false);
    }
  }, []);

  return { updateStatus, loading, error };
};

/**
 * Hook: Carrito (Spec-007 - Futuro)
 * GET /api/v1/carrito/
 */
export const useCart = () => {
  const [cart, setCart] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchCart = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const data = await cartService.getCart();
      setCart(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchCart();
  }, [fetchCart]);

  return { cart, loading, error, refetch: fetchCart };
};

/**
 * Hook: Preparar Checkout (Spec-006 - Futuro)
 * POST /api/v1/pagos/preparar-checkout/
 */
export const usePrepareCheckout = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [checkout, setCheckout] = useState(null);

  const prepare = useCallback(async (pedido_id, monto) => {
    setLoading(true);
    setError(null);

    try {
      const data = await paymentsService.prepareCheckout(pedido_id, monto);
      setCheckout(data);
      return { success: true, data };
    } catch (err) {
      setError(err.message);
      return { success: false, error: err.message };
    } finally {
      setLoading(false);
    }
  }, []);

  return { prepare, loading, error, checkout };
};
