import { useState, useEffect } from 'react';
import apiClient from '../../../core/api/apiClient';
import { useToast } from '../../../shared/context/ToastContext';

export const VentasAdminPage = () => {
  const [ventas, setVentas] = useState([]);
  const [loading, setLoading] = useState(true);
  const { addToast } = useToast();

  const showToast = (msg, type) => {
    addToast({ title: msg, type: type });
  };

  useEffect(() => {
    cargarVentas();
  }, []);

  const cargarVentas = async () => {
    try {
      setLoading(true);
      const data = await apiClient.get('/ventas/');
      setVentas(data);
    } catch (error) {
      showToast('Error al cargar historial de ventas', 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-8">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-on-surface">Movimientos de Caja</h1>
          <p className="text-on-surface-variant text-sm mt-1">Historial de todas las ventas procesadas por cajeros</p>
        </div>
        <button 
          onClick={cargarVentas}
          className="flex items-center gap-2 bg-surface hover:bg-surface-container border border-outline-variant px-4 py-2 rounded-lg text-on-surface text-sm font-bold transition-colors"
        >
          <span className="material-symbols-outlined text-sm">refresh</span>
          Actualizar
        </button>
      </div>

      <div className="bg-surface border border-outline-variant rounded-xl overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-surface-container-lowest text-on-surface-variant font-bold border-b border-outline-variant">
              <tr>
                <th className="px-6 py-4">ID / Pedido</th>
                <th className="px-6 py-4">Fecha</th>
                <th className="px-6 py-4">Cajero</th>
                <th className="px-6 py-4">Método Pago</th>
                <th className="px-6 py-4 text-right">Total</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-outline-variant">
              {loading ? (
                <tr>
                  <td colSpan="5" className="px-6 py-8 text-center text-on-surface-variant">
                    <div className="flex justify-center items-center gap-2">
                      <span className="material-symbols-outlined animate-spin">progress_activity</span>
                      Cargando ventas...
                    </div>
                  </td>
                </tr>
              ) : ventas.length === 0 ? (
                <tr>
                  <td colSpan="5" className="px-6 py-8 text-center text-on-surface-variant">
                    No hay ventas registradas aún.
                  </td>
                </tr>
              ) : (
                ventas.map((venta) => (
                  <tr key={venta.id} className="hover:bg-surface-container-lowest transition-colors">
                    <td className="px-6 py-4 font-bold text-on-surface">#{venta.pedido}</td>
                    <td className="px-6 py-4 text-on-surface-variant">
                      {new Date(venta.fecha).toLocaleString()}
                    </td>
                    <td className="px-6 py-4">
                      <span className="bg-primary/10 text-primary px-2 py-1 rounded-md text-xs font-bold">
                        Cajero ID: {venta.cajero}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`px-2 py-1 rounded-full text-xs font-bold ${venta.metodo_pago === 'EFECTIVO' ? 'bg-secondary-container text-on-secondary-container' : 'bg-tertiary-container text-on-tertiary-container'}`}>
                        {venta.metodo_pago}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right font-bold text-primary">
                      ${Number(venta.subtotal).toFixed(2)}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
