import { cn } from './Button';

export const StatusBadge = ({ status, className }) => {
  // Mapping de estados según los mockups y requerimientos
  const statusConfig = {
    'PENDIENTE': 'bg-gray-100 text-gray-800 border border-gray-200',
    'PAGADO': 'bg-green-100/50 text-primary border border-primary/20', // Tinted badge (aprox 15% opacity effect via Tailwind opacity utilities)
    'RECIBIDO': 'bg-green-100/50 text-primary border border-primary/20',
    'ENVIADO': 'bg-green-100/50 text-primary border border-primary/20',
    'EN PREPARACIÓN': 'bg-blue-100/50 text-blue-800 border border-blue-200',
    'ENTREGADO': 'bg-purple-100/50 text-purple-800 border border-purple-200',
    'CANCELADO': 'bg-red-100/50 text-danger border border-danger/20',
    'PENDIENTE_RETIRO': 'bg-yellow-100/50 text-yellow-800 border border-yellow-200',
  };

  const normalizedStatus = status?.toUpperCase() || 'PENDIENTE';
  const config = statusConfig[normalizedStatus] || statusConfig['PENDIENTE'];
  const displayStatus = normalizedStatus === 'PENDIENTE_RETIRO' ? 'PENDIENTE A RETIRAR' : status;

  return (
    <span className={cn("inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold", config, className)}>
      {displayStatus}
    </span>
  );
};
