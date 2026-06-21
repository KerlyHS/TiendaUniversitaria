import { useState } from 'react';
import { useLocation, useNavigate, Link } from 'react-router-dom';
import { Package, User, LogOut, Edit2 } from 'lucide-react';
import { StatusBadge } from '../../../shared/components/UI/StatusBadge';
import { useAuth } from '../../../core/hooks/useAuth';

// Mock Data
const mockOrders = [
  { id: 'P-20240520-001', fecha: '20 May, 2024', total: 45.50, estado: 'EN PREPARACIÓN' },
  { id: 'P-20240415-089', fecha: '15 Abr, 2024', total: 32.00, estado: 'ENTREGADO' },
];

const mockTransactions = [
  { id: 'P-20240310-042', fecha: '10 Mar, 2024', total: 15.00, estado: 'ENTREGADO' },
  { id: 'P-20240228-115', fecha: '28 Feb, 2024', total: 85.00, estado: 'CANCELADO' },
];

export const OrdersPage = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  
  const [activeTab, setActiveTab] = useState(
    location.pathname.includes('pedidos') ? 'pedidos' : 'informacion'
  );

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div className="min-h-screen bg-surface-light flex flex-col md:flex-row w-full max-w-[1440px] mx-auto">
      
      {/* Sidebar Navigation */}
      <aside className="w-full md:w-64 bg-white border-r border-gray-200 p-6 flex flex-col gap-8">
        <div>
          <h2 className="text-sm font-bold text-secondary uppercase tracking-wider mb-4">Mi Cuenta</h2>
          <nav className="flex flex-col gap-2">
            <button 
              onClick={() => setActiveTab('informacion')}
              className={`flex items-center gap-3 px-3 py-2 font-medium rounded-soft transition-colors text-left ${
                activeTab === 'informacion' ? 'bg-primary/10 text-primary' : 'text-gray-600 hover:bg-gray-50 hover:text-secondary'
              }`}
            >
              <User size={18} />
              Mi Información
            </button>
            <button 
              onClick={() => setActiveTab('pedidos')}
              className={`flex items-center gap-3 px-3 py-2 font-medium rounded-soft transition-colors text-left ${
                activeTab === 'pedidos' ? 'bg-primary/10 text-primary' : 'text-gray-600 hover:bg-gray-50 hover:text-secondary'
              }`}
            >
              <Package size={18} />
              Mis Pedidos
            </button>
          </nav>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 p-6 md:p-12">
        {/* Header with Title and Logout */}
        <div className="flex justify-between items-start mb-8">
          <div>
            <h1 className="text-headline-lg font-bold text-secondary mb-2">
              {activeTab === 'informacion' ? 'Información Personal' : 'Mis Pedidos'}
            </h1>
            <p className="text-gray-500">
              {activeTab === 'informacion' 
                ? 'Gestiona tus datos personales y de contacto.' 
                : 'Revisa el historial y estado de tus compras.'}
            </p>
          </div>
          <button 
            onClick={handleLogout}
            className="flex items-center gap-2 px-4 py-2 text-danger hover:bg-red-50 font-medium rounded-soft border border-danger/20 transition-colors"
          >
            <LogOut size={18} />
            Cerrar Sesión
          </button>
        </div>

        {/* Tab Content */}
        {activeTab === 'informacion' ? (
          <div className="bg-white p-8 rounded-lg border border-gray-200 shadow-sm relative">
            <button className="absolute top-8 right-8 flex items-center gap-2 px-4 py-2 text-primary font-medium border border-primary/30 rounded-soft hover:bg-primary/5 transition-colors">
              <Edit2 size={16} />
              Editar
            </button>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mt-4">
              <div>
                <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">Nombre Completo</p>
                <p className="text-secondary font-medium text-lg">{user?.nombre_completo || 'Usuario Estudiante'}</p>
              </div>
              <div>
                <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">Identificación</p>
                <p className="text-secondary font-medium text-lg">{user?.identificacion || 'No registrada'}</p>
              </div>
              <div>
                <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">Correo Electrónico</p>
                <p className="text-secondary font-medium text-lg">{user?.email}</p>
              </div>
              <div>
                <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">Rol / Tipo</p>
                <span className="inline-block bg-primary/10 text-primary px-3 py-1 rounded-full text-sm font-medium capitalize">
                  {user?.rol?.toLowerCase() || 'Cliente'}
                </span>
              </div>
            </div>

            <div className="mt-12 pt-8 border-t border-gray-100">
              <h3 className="text-title-md font-bold text-secondary mb-4">Seguridad</h3>
              <button className="text-primary font-medium hover:underline">Cambiar contraseña</button>
            </div>
          </div>
        ) : (
          <>
            {/* Stepper / Active Orders */}
            <section className="mb-12">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-title-md font-semibold text-secondary">Compras Recientes</h2>
                <Link to="/historial" className="text-sm font-medium text-primary hover:text-primary-dark">Ver todo el historial</Link>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {mockOrders.map(order => (
                  <div key={order.id} className="bg-white p-5 rounded-lg border border-gray-200 shadow-level-1">
                    <div className="flex justify-between items-start mb-4">
                      <span className="text-xs font-semibold text-gray-500">{order.id}</span>
                      <StatusBadge status={order.estado} />
                    </div>
                    <h3 className="font-semibold text-secondary mb-1">Kit Universitario UNL</h3>
                    <p className="text-sm text-gray-500 mb-4">1 x Chompa Oficial, 1 x Cuaderno</p>
                    <div className="flex justify-between items-center pt-4 border-t border-gray-100">
                      <span className="text-sm text-gray-500">{order.fecha}</span>
                      <span className="font-bold text-primary">${order.total.toFixed(2)}</span>
                    </div>
                  </div>
                ))}
              </div>
            </section>

            {/* Data Table */}
            <section>
              <div className="bg-white rounded-lg border border-gray-200 shadow-level-1 overflow-hidden">
                <div className="p-4 border-b border-gray-200 bg-gray-50 flex justify-between items-center">
                  <h2 className="text-base font-semibold text-secondary">Historial de Transacciones</h2>
                  <select className="text-sm border border-gray-300 rounded px-2 py-1 bg-white">
                    <option>Últimos 30 días</option>
                    <option>Últimos 6 meses</option>
                  </select>
                </div>
                
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-sm">
                    <thead className="bg-gray-50/50 text-gray-500 border-b border-gray-200">
                      <tr>
                        <th className="font-medium p-4">ORDEN</th>
                        <th className="font-medium p-4">FECHA</th>
                        <th className="font-medium p-4">ESTADO</th>
                        <th className="font-medium p-4">TOTAL</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                      {mockTransactions.map(tx => (
                        <tr key={tx.id} className="hover:bg-gray-50/50 transition-colors">
                          <td className="p-4 font-medium text-primary">{tx.id}</td>
                          <td className="p-4 text-gray-600">{tx.fecha}</td>
                          <td className="p-4"><StatusBadge status={tx.estado} /></td>
                          <td className="p-4 font-semibold text-secondary">${tx.total.toFixed(2)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </section>
          </>
        )}
      </main>
    </div>
  );
};
