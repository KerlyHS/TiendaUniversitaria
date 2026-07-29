/**
 * OrderStatusBadge Component - TiendaUniversitaria
 * 
 * Spec-005: Máquina de estados visual
 * 
 * Estados:
 * - RECIBIDO: Amarillo (pendiente)
 * - PREPARACION: Naranja (en proceso)
 * - LISTO: Verde (completado)
 * - ENTREGADO: Índigo (entregado)
 * - CANCELADO: Rojo (cancelado)
 * 
 * Spec-Kit Metadata:
 * @spec Spec-005: Order state machine visualization
 */

export const OrderStatusBadge = ({ estado }) => {
  const statusMap = {
    RECIBIDO: {
      label: 'Recibido',
      className: 'status-recibido',
      icon: '📋',
    },
    PENDIENTE_RETIRO: {
      label: 'Pendiente a Retirar',
      className: 'status-listo', // Reutilizamos estilo verde o podemos agregar uno nuevo
      icon: '🛍️',
    },
    PREPARACION: {
      label: 'En Preparación',
      className: 'status-preparacion',
      icon: '⚙️',
    },
    LISTO: {
      label: 'Listo',
      className: 'status-listo',
      icon: '✓',
    },
    ENTREGADO: {
      label: 'Entregado',
      className: 'status-entregado',
      icon: '🎉',
    },
    CANCELADO: {
      label: 'Cancelado',
      className: 'status-cancelado',
      icon: '❌',
    },
  };

  const status = statusMap[estado] || {
    label: estado,
    className: 'status-default',
    icon: '❓',
  };

  return (
    <span
      className={`badge ${status.className}`}
      aria-label={`Estado: ${status.label}`}
      title={`Estado: ${status.label}`}
    >
      {status.icon} {status.label}
    </span>
  );
};
