import { useParams } from 'react-router-dom';
import { useOrderDetail } from '../../../core/hooks/useAPI';
import { OrderStatusBadge } from './OrderStatusBadge';

/**
 * OrderDetail Component - TiendaUniversitaria
 * 
 * Spec-005: Detalle de Orden/Pedido
 * 
 * Features:
 * - GET /api/v1/pedidos/{id}/
 * - Mostrar numero_pedido (P-YYYYMMDD-XXX)
 * - Tabla de detalles con productos
 * - Cálculo de totales (subtotal + impuesto)
 * - Máquina de estados
 * - Historial de cambios (futuro)
 * 
 * Spec-Kit Metadata:
 * @spec Spec-005: Order detail with state machine
 * @spec Spec-004: Product detail in order items
 */

export const OrderDetail = () => {
  const { orderId } = useParams();
  const { order, loading, error } = useOrderDetail(orderId);

  if (loading) {
    return <div className="loading-spinner"><p>Cargando detalles del pedido...</p></div>;
  }

  if (error) {
    return <div className="alert alert-error" role="alert">Error: {error}</div>;
  }

  if (!order) {
    return <div className="empty-state"><p>No se encontró el pedido.</p></div>;
  }

  return (
    <section className="order-detail-section" aria-labelledby="order-title">
      <header className="order-detail-header">
        <h1 id="order-title">Pedido {order.numero_pedido}</h1>
        <p className="order-date">
          Realizado el {new Date(order.fecha_creacion).toLocaleDateString('es-EC')}
        </p>
      </header>

      {/* Estado Actual (Spec-005: Máquina de estados) */}
      <div className="order-status-section">
        <h2>Estado del Pedido</h2>
        <OrderStatusBadge estado={order.estado} />
      </div>

      {/* Tabla de Detalles (Spec-005: GET /api/v1/pedidos/{id}/) */}
      <section className="order-items-section" aria-labelledby="items-title">
        <h2 id="items-title">Artículos del Pedido</h2>

        <div className="items-table-container">
          <table className="items-table" aria-label="Artículos del pedido">
            <thead>
              <tr>
                <th scope="col">Producto</th>
                <th scope="col">Cantidad</th>
                <th scope="col">Precio Unitario</th>
                <th scope="col">Subtotal</th>
              </tr>
            </thead>
            <tbody>
              {order.detalles?.map((item, index) => (
                <tr key={index}>
                  <td>
                    <strong>{item.nombre_producto}</strong>
                    <br />
                    <small>SKU: {item.sku || 'N/A'}</small>
                  </td>
                  <td className="text-center">{item.cantidad}</td>
                  <td>${parseFloat(item.precio_unitario).toFixed(2)}</td>
                  <td>${parseFloat(item.subtotal).toFixed(2)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      {/* Resumen de Totales (Spec-005: Cálculo de impuestos) */}
      <section className="order-summary-section" aria-labelledby="summary-title">
        <h2 id="summary-title">Resumen del Pedido</h2>

        <div className="summary-details">
          <div className="summary-row">
            <span className="label">Subtotal:</span>
            <span className="value">${parseFloat(order.subtotal).toFixed(2)}</span>
          </div>
          <div className="summary-row">
            <span className="label">Impuesto (IVA 12%):</span>
            <span className="value">${parseFloat(order.impuesto).toFixed(2)}</span>
          </div>
          <div className="summary-row total">
            <span className="label">TOTAL:</span>
            <span className="value">${parseFloat(order.total).toFixed(2)}</span>
          </div>
        </div>
      </section>

      {/* Información Adicional */}
      <section className="order-info-section">
        <h2>Información del Pedido</h2>

        <div className="info-details">
          <div className="info-row">
            <span className="label">Tipo de Entrega:</span>
            <span className="value">
              {order.tipo_entrega === 'TIENDA'
                ? '🏪 Retiro en Tienda'
                : '🚚 Envío a Domicilio'}
            </span>
          </div>
          <div className="info-row">
            <span className="label">Estado Actual:</span>
            <span className="value">
              <OrderStatusBadge estado={order.estado} />
            </span>
          </div>
          {order.observaciones && (
            <div className="info-row">
              <span className="label">Observaciones:</span>
              <span className="value">{order.observaciones}</span>
            </div>
          )}
        </div>
      </section>
    </section>
  );
};
