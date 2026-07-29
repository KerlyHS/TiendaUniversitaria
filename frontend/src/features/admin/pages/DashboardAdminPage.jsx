import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { TrendingUp, ShoppingBag, DollarSign, AlertTriangle } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import apiClient from '../../../core/api/apiClient';
import { useToast } from '../../../shared/context/ToastContext';
import { useAuth } from '../../../core/hooks/useAuth';

export const DashboardAdminPage = () => {
  const [stats, setStats] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const { addToast } = useToast();
  const navigate = useNavigate();
  const { user } = useAuth();

  useEffect(() => {
    if (user?.rol === 'CAJERO') {
      navigate('/admin/caja', { replace: true });
      return;
    }

    const fetchStats = async () => {
      try {
        const response = await apiClient.get('/dashboard/stats/');
        setStats(response.data);
      } catch (error) {
        console.error('Error fetching dashboard stats:', error);
        addToast({ title: 'Error', message: 'No se pudieron cargar las estadísticas', type: 'error' });
      } finally {
        setIsLoading(false);
      }
    };
    fetchStats();
  }, [addToast]);

  if (isLoading) {
    return (
      <div className="flex-grow flex items-center justify-center h-full p-8">
        <div className="text-on-surface-variant animate-pulse">Cargando panel de control...</div>
      </div>
    );
  }

  if (!stats) return null;

  const { kpis, grafico_ventas, reporte_diario, alertas_stock, ordenes_recientes } = stats;

  return (
    <div className="p-6 lg:p-8 flex flex-col gap-6">
      
      {/* Top Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-surface border border-outline-variant rounded-2xl p-6 shadow-sm">
          <div className="flex justify-between items-start mb-4">
            <span className="text-label-md font-bold text-on-surface-variant uppercase tracking-wider">Ventas Totales Mes</span>
            <div className="w-8 h-8 rounded bg-[#006633]/10 text-[#006633] flex items-center justify-center">
              <TrendingUp size={18} />
            </div>
          </div>
          <h3 className="text-display-sm text-[#006633] font-bold mb-2">${kpis.ventas_mes.toFixed(2)}</h3>
          <p className="text-label-sm text-on-surface-variant flex gap-1 items-center">
            <span className="text-[#006633] font-bold">↑ 15%</span> vs mes anterior
          </p>
        </div>

        <div className="bg-surface border border-outline-variant rounded-2xl p-6 shadow-sm">
          <div className="flex justify-between items-start mb-4">
            <span className="text-label-md font-bold text-on-surface-variant uppercase tracking-wider">Ticket Promedio</span>
            <div className="w-8 h-8 rounded bg-[#006633]/10 text-[#006633] flex items-center justify-center">
              <DollarSign size={18} />
            </div>
          </div>
          <h3 className="text-display-sm text-[#006633] font-bold mb-2">${kpis.ticket_promedio.toFixed(2)}</h3>
          <p className="text-label-sm text-on-surface-variant flex gap-1 items-center">
            <span className="text-[#006633] font-bold">↑ 3%</span> vs mes anterior
          </p>
        </div>

        <div className="bg-surface border border-outline-variant rounded-2xl p-6 shadow-sm">
          <div className="flex justify-between items-start mb-4">
            <span className="text-label-md font-bold text-on-surface-variant uppercase tracking-wider">Órdenes Hoy</span>
            <div className="w-8 h-8 rounded bg-[#006633]/10 text-[#006633] flex items-center justify-center">
              <ShoppingBag size={18} />
            </div>
          </div>
          <h3 className="text-display-sm text-on-surface font-bold mb-2">{kpis.ordenes_hoy}</h3>
          <p className="text-label-sm text-on-surface-variant">
            {kpis.pendientes_empaque} pendientes de empaque
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Main Chart */}
        <div className="lg:col-span-2 bg-surface border border-outline-variant rounded-2xl p-6 shadow-sm flex flex-col">
          <h3 className="text-title-md font-bold text-on-surface mb-6">Estadísticas de Venta (Mensual)</h3>
          <div className="flex-grow w-full h-[300px] bg-surface-container-lowest rounded-xl p-4">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={grafico_ventas} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E0E2E0" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#444746', fontSize: 12 }} dy={10} />
                <YAxis axisLine={false} tickLine={false} tick={{ fill: '#444746', fontSize: 12 }} tickFormatter={(value) => `$${value}`} />
                <Tooltip cursor={{ fill: '#F0F1F0' }} contentStyle={{ borderRadius: '8px', border: '1px solid #C4C7C5' }} />
                <Bar dataKey="ventas" radius={[4, 4, 0, 0]}>
                  {grafico_ventas.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={index === grafico_ventas.length - 1 ? '#006633' : '#A3C2B3'} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Reporte Diario */}
        <div className="bg-surface border border-outline-variant rounded-2xl p-6 shadow-sm flex flex-col">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-title-md font-bold text-on-surface">Reporte Diario</h3>
          </div>
          
          <div className="bg-surface-container-low rounded-xl p-4 mb-6">
            <p className="text-label-sm text-on-surface-variant mb-1">Ventas de Hoy</p>
            <p className="text-headline-md font-bold text-primary">${reporte_diario.ventas_hoy.toFixed(2)}</p>
          </div>

          <div className="flex flex-col gap-3 mb-6">
            <div className="flex justify-between items-center text-body-sm">
              <span className="text-on-surface-variant">Órdenes de Hoy</span>
              <span className="text-[#006633] font-bold">{reporte_diario.ordenes_hoy}</span>
            </div>
            <div className="flex justify-between items-center text-body-sm">
              <span className="text-on-surface-variant">Pedidos Pendientes</span>
              <span className="text-error font-bold">{reporte_diario.pendientes_hoy}</span>
            </div>
          </div>
        </div>

      </div>

      {/* Bottom Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Alertas Stock */}
        <div className="bg-error/5 border border-error/20 rounded-2xl p-6 flex flex-col gap-4">
          <div className="flex items-center gap-2 text-error font-bold mb-2">
            <AlertTriangle size={20} />
            <h3 className="text-title-md">Alertas de Stock</h3>
          </div>
          
          <div className="flex flex-col gap-3">
            {alertas_stock.length === 0 ? (
              <p className="text-body-sm text-on-surface-variant">No hay alertas de stock.</p>
            ) : (
              alertas_stock.map((item) => {
                const handleReponer = () => {
                  navigate('/admin/inventario', { 
                    state: { 
                      searchProductCode: item.codigo, 
                      searchProductName: item.nombre 
                    } 
                  });
                };
                
                return (
                  <div key={item.id} className="bg-white rounded-xl p-3 flex items-center justify-between border border-error/10 shadow-sm">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-surface-container rounded flex items-center justify-center overflow-hidden">
                        {item.imagen ? (
                          <img src={item.imagen} alt={item.nombre} className="w-full h-full object-cover" />
                        ) : (
                          <div className="text-outline">📦</div>
                        )}
                      </div>
                      <div>
                        <h4 className="text-body-sm font-bold text-on-surface line-clamp-1">{item.nombre}</h4>
                        <p className="text-label-sm text-error font-bold">Quedan {item.stock} u.</p>
                      </div>
                    </div>
                    <button 
                      onClick={handleReponer}
                      className="text-label-sm font-bold text-primary hover:text-primary-container px-2"
                    >
                      Reponer
                    </button>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Recent Orders */}
        <div className="lg:col-span-2 bg-surface border border-outline-variant rounded-2xl p-6 shadow-sm flex flex-col">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-title-md font-bold text-on-surface">Órdenes Recientes</h3>
            <button className="text-label-sm font-bold text-primary hover:underline">Ver todas</button>
          </div>
          
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="border-b border-outline-variant text-label-sm text-on-surface-variant">
                  <th className="pb-3 font-normal">ID</th>
                  <th className="pb-3 font-normal">Cliente</th>
                  <th className="pb-3 font-normal">Monto</th>
                  <th className="pb-3 font-normal">Fecha</th>
                  <th className="pb-3 font-normal">Estado</th>
                </tr>
              </thead>
              <tbody className="text-body-sm text-on-surface">
                {ordenes_recientes.length === 0 ? (
                  <tr>
                    <td colSpan="5" className="py-8 text-center text-on-surface-variant">No hay órdenes recientes.</td>
                  </tr>
                ) : (
                  ordenes_recientes.map((orden) => (
                    <tr key={orden.id} className="border-b border-outline-variant/50 last:border-0 hover:bg-surface-container-lowest transition-colors">
                      <td className="py-3 font-bold">#{orden.id}</td>
                      <td className="py-3">{orden.cliente}</td>
                      <td className="py-3 font-bold">${orden.monto.toFixed(2)}</td>
                      <td className="py-3 text-on-surface-variant">{orden.fecha}</td>
                      <td className="py-3">
                        <span className={`px-2 py-1 rounded text-xs font-bold ${
                          orden.estado === 'PAGADO' || orden.estado === 'ENTREGADO' || orden.estado === 'LISTO' ? 'bg-[#006633]/10 text-[#006633]' : 
                          orden.estado === 'CANCELADO' ? 'bg-error/10 text-error' : 
                          orden.estado === 'PENDIENTE_RETIRO' ? 'bg-[#008080]/10 text-[#008080]' :
                          'bg-primary/10 text-primary'
                        }`}>
                          {orden.estado}
                        </span>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

      </div>
    </div>
  );
};
