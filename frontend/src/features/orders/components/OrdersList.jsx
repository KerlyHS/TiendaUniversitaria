import { useOrders } from '../../../core/hooks/useAPI';
import { OrderStatusBadge } from './OrderStatusBadge';
import { Link } from 'react-router-dom';

/**
 * OrdersList Component - TiendaUniversitaria
 * 
 * Spec-005: Sistema de Órdenes/Pedidos
 * 
 * Features:
 * - GET /api/v1/pedidos/ (auto-filtrado por usuario)
 * - Tabla de órdenes con estados
 * - Máquina de estados: RECIBIDO → PREPARACION → LISTO → ENTREGADO
 * - Filtrado por estado
 * - Link a detalles de orden
 * 
 * Spec-Kit Metadata:
 * @spec Spec-005: List orders with status machine
 * @spec Spec-005: RECIBIDO, PREPARACION, LISTO, ENTREGADO, CANCELADO
 */

export const OrdersList = () => {
  const [statusFilter, setStatusFilter] = React.useState('');
  const filters = statusFilter ? { estado: statusFilter } : {};
  const { orders, loading, error, pagination } = useOrders(filters);

  return (
    <section className="orders-section" aria-labelledby="orders-title">
      <h2 id="orders-title">Mis Pedidos</h2>

      {/* Filtros por estado (Spec-005: Máquina de estados) */}
      <div className="orders-filters">
        <label htmlFor="status-filter" className="sr-only">
          Filtrar por estado
        </label>
        <select
          id="status-filter"
          className="filter-select"
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          aria-label="Filtrar pedidos por estado"
        >
          <option value="">Todos los estados</option>
          <option value="RECIBIDO">Recibido</option>
          <option value="PREPARACION">En Preparación</option>
          <option value="LISTO">Listo para recoger</option>
          <option value="ENTREGADO">Entregado</option>
          <option value="CANCELADO">Cancelado</option>
        </select>
      </div>

      {/* Loading State */}
      {loading && (
        <div className="loading-spinner" aria-live="polite">
          <p>Cargando tus pedidos...</p>
        </div>
      )}

      {/* Error State */}
      {error && (
        <div className="alert alert-error" role="alert">
          Error al cargar pedidos: {error}
        </div>
      )}

      {/* Orders Table (Spec-005: GET /api/v1/pedidos/) */}
      {!loading && !error && (
        <>
          {orders.length > 0 ? (
            <div className="orders-table-container">
              <table className="orders-table" aria-label="Tabla de mis pedidos">
                <thead>
                  <tr>
                    <th scope="col" className="col-numero">
                      Nro. Pedido
                    </th>
                    <th scope="col" className="col-fecha">
                      Fecha
                    </th>
                    <th scope="col" className="col-items">
                      Productos
                    </th>
                    <th scope="col" className="col-total">
                      Total
                    </th>
                    <th scope="col" className="col-estado">
                      Estado
                    </th>
                    <th scope="col" className="col-acciones">
                      Acciones
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {orders.map((order) => (
                    <tr key={order.id} aria-label={`Pedido ${order.numero_pedido}`}>
                      <td className="col-numero">
                        <strong>{order.numero_pedido}</strong>
                      </td>
                      <td className="col-fecha">
                        {new Date(order.fecha_creacion).toLocaleDateString('es-EC')}
                      </td>
                      <td className="col-items">
                        {order.detalles?.length || 0} artículo(s)
                      </td>
                      <td className="col-total">
                        ${parseFloat(order.total).toFixed(2)}
                      </td>
                      <td className="col-estado">
                        <OrderStatusBadge estado={order.estado} />
                      </td>
                      <td className="col-acciones">
                        <Link
                          to={`/pedidos/${order.id}`}
                          className="btn btn-small btn-outline"
                          aria-label={`Ver detalles del pedido ${order.numero_pedido}`}
                        >
                          Ver Detalles
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="empty-state">
              <p>No tienes pedidos aún.</p>
              <Link to="/catalogo" className="btn btn-primary">
                Empezar a comprar
              </Link>
            </div>
          )}
        </>
      )}
    </section>
  );
};

// Hook para obtener lista de órdenes
import React from 'react';
