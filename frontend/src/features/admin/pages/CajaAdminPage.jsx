import { useState, useEffect } from 'react';
import { catalogService } from '../../../core/api/services';
import apiClient from '../../../core/api/apiClient';
import { useToast } from '../../../shared/context/ToastContext';
import { getProductDisplayPrice } from '../../../shared/utils/priceHelper';
import { useOrders } from '../../../core/hooks/useAPI';
import { ordersService } from '../../../core/api/services';

export const CajaAdminPage = () => {
  const [productos, setProductos] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [carrito, setCarrito] = useState([]);
  const [metodoPago, setMetodoPago] = useState('EFECTIVO');
  
  // Cliente State
  const [cliente, setCliente] = useState(null); // null significa Consumidor Final
  const [clienteSearch, setClienteSearch] = useState('');
  const [clientesEncontrados, setClientesEncontrados] = useState([]);
  
  // Nuevo Cliente Modal State
  const [showNuevoCliente, setShowNuevoCliente] = useState(false);
  const [nuevoCliente, setNuevoCliente] = useState({
    nombre_completo: '',
    identificacion: '',
    email: '',
    telefono: '',
    direccion: ''
  });

  // Pedidos Online State
  const [activeTab, setActiveTab] = useState('CAJA');
  const { orders: pedidosOnline, loading: loadingPedidos, refetch: refetchPedidos } = useOrders({ estado: 'PENDIENTE_RETIRO' });
  const [showDespachoModal, setShowDespachoModal] = useState(false);
  const [pedidoADespachar, setPedidoADespachar] = useState(null);

  const { addToast } = useToast();

  const showToast = (msg, type) => {
    addToast({ title: msg, type: type });
  };

  useEffect(() => {
    cargarProductos();
  }, []);

  const cargarProductos = async () => {
    try {
      const data = await catalogService.listProducts();
      setProductos(data.results || data);
    } catch (error) {
      showToast('Error al cargar productos', 'error');
    }
  };

  const buscarClientes = async (q) => {
    setClienteSearch(q);
    if (q.length < 3) {
      setClientesEncontrados([]);
      return;
    }
    try {
      const response = await apiClient.get(`/cajas/clientes/?q=${q}`);
      setClientesEncontrados(response.data || response);
    } catch (error) {
      console.error(error);
    }
  };

  const seleccionarCliente = (c) => {
    setCliente(c);
    setClienteSearch('');
    setClientesEncontrados([]);
  };

  const crearClienteManual = async (e) => {
    e.preventDefault();
    if (!nuevoCliente.nombre_completo) {
      showToast("El nombre completo es obligatorio", "error");
      return;
    }
    
    try {
      const response = await apiClient.post('/cajas/clientes/', nuevoCliente);
      const data = response.data || response;
      showToast('Cliente creado exitosamente', 'success');
      setCliente(data);
      setShowNuevoCliente(false);
      setNuevoCliente({ nombre_completo: '', identificacion: '', email: '', telefono: '', direccion: '' });
    } catch (error) {
      const errorMsg = error.response?.data?.detail || error.detail || 'Error al crear cliente';
      showToast(errorMsg, 'error');
    }
  };

  const getCashierProductInfo = (product) => {
    const FOOD_CATEGORIES = ['AGRICOLA', 'HORTALIZAS', 'FRUTAS', 'CARNES', 'LACTEOS', 'BEBIDAS'];
    const esPesable = FOOD_CATEGORIES.includes(product.categoria);
    
    let precio = Number(product.precio);
    let unidad = '';
    let variacionId = null;

    if (esPesable && product.variaciones && product.variaciones.length > 0) {
      // Prioridad: buscar una variación de Libra/Lb
      const libraVar = product.variaciones.find(v => 
        v.nombre.toLowerCase().includes('libra') || 
        v.nombre.toLowerCase().includes('lb')
      );
      if (libraVar) {
        precio = Number(libraVar.precio_fijo ?? product.precio);
        unidad = 'Lb';
        variacionId = libraVar.id;
      } else {
        // Fallback a la primera variación
        const firstVar = product.variaciones[0];
        precio = Number(firstVar.precio_fijo ?? product.precio);
        unidad = firstVar.nombre;
        variacionId = firstVar.id;
      }
    }
    
    return { esPesable, precio, unidad, variacionId };
  };

  const agregarAlCarrito = (prod) => {
    if (prod.stock <= 0) {
      showToast('No hay stock de este producto', 'warning');
      return;
    }
    
    const { esPesable, precio, unidad, variacionId } = getCashierProductInfo(prod);
    
    setCarrito(prev => {
      const exist = prev.find(item => item.producto_id === prod.id);
      if (exist) {
        if (esPesable) {
          const nuevaCantidad = Number(exist.cantidad) + 1;
          if (nuevaCantidad > prod.stock) {
            showToast('Stock máximo alcanzado para este producto', 'warning');
            return prev;
          }
          return prev.map(item => item.producto_id === prod.id ? { ...item, cantidad: nuevaCantidad, subtotal: Number((nuevaCantidad * item.precio).toFixed(2)) } : item);
        } else {
          if (exist.cantidad >= prod.stock) {
            showToast('Stock máximo alcanzado para este producto', 'warning');
            return prev;
          }
          return prev.map(item => item.producto_id === prod.id ? { ...item, cantidad: item.cantidad + 1, subtotal: (item.cantidad + 1) * item.precio } : item);
        }
      }
      return [...prev, {
        producto_id: prod.id,
        nombre: prod.nombre + (unidad ? ` (${unidad})` : ''),
        precio: precio,
        cantidad: 1,
        subtotal: precio,
        max_stock: prod.stock,
        esPesable,
        unidad,
        variacionId
      }];
    });
  };

  const removerDelCarrito = (id) => {
    setCarrito(prev => prev.filter(item => item.producto_id !== id));
  };

  const cambiarCantidad = (id, delta) => {
    setCarrito(prev => prev.map(item => {
      if (item.producto_id === id) {
        const nuevaCantidad = item.cantidad + delta;
        if (nuevaCantidad > 0 && nuevaCantidad <= item.max_stock) {
          return { ...item, cantidad: nuevaCantidad, subtotal: nuevaCantidad * item.precio };
        }
      }
      return item;
    }));
  };

  const procesarVenta = async () => {
    if (carrito.length === 0) {
      showToast('El carrito está vacío', 'error');
      return;
    }
    if (metodoPago !== 'EFECTIVO' && !cliente) {
      showToast('Para pagos con tarjeta o transferencia DEBE seleccionar un cliente registrado.', 'error');
      return;
    }

    try {
      const payload = {
        cliente_id: cliente ? cliente.id : null,
        metodo_pago: metodoPago,
        detalles: carrito.map(c => ({ producto_id: c.producto_id, cantidad: Number(c.cantidad) || 1 }))
      };
      
      const response = await apiClient.post('/cajas/procesar-venta/', payload);
      const resData = response.data || response;
      
      showToast(`Venta procesada con éxito (Pedido: ${resData.numero_pedido})`, 'success');
      setCarrito([]);
      setCliente(null);
      cargarProductos(); // Actualizar el stock
      
      // Abrir PDF de comprobante
      try {
        const pdfRes = await apiClient.get(`/cajas/comprobante/${resData.pedido_id}/pdf/`, { responseType: 'blob' });
        const pdfData = pdfRes.data || pdfRes;
        const file = new Blob([pdfData], { type: 'application/pdf' });
        const fileURL = URL.createObjectURL(file);
        window.open(fileURL, '_blank');
      } catch (e) {
        showToast("Error al generar o descargar el PDF de la factura", "error");
      }
      
    } catch (error) {
      const errorMsg = error.response?.data?.detail || error.detail || 'Error al procesar la venta';
      showToast(errorMsg, 'error');
    }
  };

  const handleDespachar = async () => {
    if (!pedidoADespachar) return;
    try {
      await ordersService.updateOrderStatus(pedidoADespachar.id, 'ENTREGADO');
      showToast('Pedido despachado y entregado', 'success');
      setShowDespachoModal(false);
      setPedidoADespachar(null);
      refetchPedidos();
    } catch (error) {
      showToast('Error al despachar el pedido', 'error');
    }
  };

  const productosFiltrados = productos.filter(p => p.nombre.toLowerCase().includes(searchTerm.toLowerCase()) || p.codigo?.toLowerCase().includes(searchTerm.toLowerCase()));
  const total = carrito.reduce((sum, item) => sum + item.subtotal, 0);

  return (
    <div className="flex h-full flex-col p-6 gap-4">
      {/* TABS */}
      <div className="flex border-b border-outline-variant">
        <button 
          onClick={() => setActiveTab('CAJA')}
          className={`px-6 py-3 font-bold text-sm border-b-2 transition-colors ${activeTab === 'CAJA' ? 'border-primary text-primary' : 'border-transparent text-on-surface-variant hover:text-on-surface'}`}
        >
          Mostrador (Caja)
        </button>
        <button 
          onClick={() => setActiveTab('ONLINE')}
          className={`px-6 py-3 font-bold text-sm border-b-2 flex items-center gap-2 transition-colors ${activeTab === 'ONLINE' ? 'border-primary text-primary' : 'border-transparent text-on-surface-variant hover:text-on-surface'}`}
        >
          Pedidos en Línea
          {pedidosOnline?.length > 0 && (
            <span className="bg-error text-white text-xs px-2 py-0.5 rounded-full shadow-sm">{pedidosOnline.length}</span>
          )}
        </button>
      </div>

      {activeTab === 'CAJA' ? (
        <div className="flex h-full flex-col md:flex-row gap-6 flex-1 overflow-hidden">
          {/* Modal Nuevo Cliente */}
          {showNuevoCliente && (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
              <div className="bg-surface rounded-xl shadow-lg w-full max-w-md overflow-hidden">
                <div className="p-4 border-b border-outline-variant flex justify-between items-center bg-surface-container-low">
                  <h3 className="font-bold text-lg text-on-surface">Registrar Nuevo Cliente</h3>
                  <button onClick={() => setShowNuevoCliente(false)} className="text-on-surface-variant hover:text-error">
                    <span className="material-symbols-outlined">close</span>
                  </button>
                </div>
                <form onSubmit={crearClienteManual} className="p-4 flex flex-col gap-3">
                  <div>
                    <label className="block text-xs font-bold text-on-surface-variant mb-1">Nombre Completo *</label>
                    <input 
                      type="text" required
                      value={nuevoCliente.nombre_completo}
                      onChange={e => setNuevoCliente({...nuevoCliente, nombre_completo: e.target.value})}
                      className="w-full px-3 py-2 bg-white border border-outline-variant rounded-lg focus:ring-primary outline-none"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-bold text-on-surface-variant mb-1">Identificación (CI/RUC)</label>
                      <input 
                        type="text" 
                        value={nuevoCliente.identificacion}
                        onChange={e => setNuevoCliente({...nuevoCliente, identificacion: e.target.value})}
                        className="w-full px-3 py-2 bg-white border border-outline-variant rounded-lg focus:ring-primary outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-on-surface-variant mb-1">Teléfono</label>
                      <input 
                        type="text" 
                        value={nuevoCliente.telefono}
                        onChange={e => setNuevoCliente({...nuevoCliente, telefono: e.target.value})}
                        className="w-full px-3 py-2 bg-white border border-outline-variant rounded-lg focus:ring-primary outline-none"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-on-surface-variant mb-1">Correo Electrónico</label>
                    <input 
                      type="email" 
                      value={nuevoCliente.email}
                      placeholder="Se generará uno si se deja vacío"
                      onChange={e => setNuevoCliente({...nuevoCliente, email: e.target.value})}
                      className="w-full px-3 py-2 bg-white border border-outline-variant rounded-lg focus:ring-primary outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-on-surface-variant mb-1">Dirección</label>
                    <input 
                      type="text" 
                      value={nuevoCliente.direccion}
                      onChange={e => setNuevoCliente({...nuevoCliente, direccion: e.target.value})}
                      className="w-full px-3 py-2 bg-white border border-outline-variant rounded-lg focus:ring-primary outline-none"
                    />
                  </div>
                  <button type="submit" className="mt-2 w-full bg-primary text-on-primary py-2 rounded-lg font-bold hover:bg-primary-container">
                    Guardar y Seleccionar
                  </button>
                </form>
              </div>
            </div>
          )}

          {/* Panel Izquierdo: Productos */}
          <div className="flex-1 flex flex-col bg-surface rounded-xl border border-outline-variant shadow-sm overflow-hidden h-full min-h-[500px]">
            <div className="p-4 border-b border-outline-variant bg-surface-container-low">
              <h2 className="text-lg font-bold text-on-surface mb-4">Productos</h2>
              <div className="relative">
                <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant">search</span>
                <input 
                  type="text" 
                  placeholder="Buscar por código o nombre..." 
                  className="w-full pl-10 pr-4 py-2 bg-white border border-outline-variant rounded-lg focus:ring-2 focus:ring-primary outline-none"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
            </div>
            <div className="flex-1 overflow-y-auto p-4">
              <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-4">
                {productosFiltrados.map(prod => {
                  const display = getProductDisplayPrice(prod);
                  return (
                    <div 
                      key={prod.id} 
                      onClick={() => agregarAlCarrito(prod)}
                      className={`border rounded-lg p-3 cursor-pointer transition-all flex flex-col ${prod.stock > 0 ? 'hover:border-primary hover:shadow-md bg-white border-outline-variant' : 'bg-surface-container-low border-outline-variant opacity-50 cursor-not-allowed'}`}
                    >
                      <div className="text-xs text-on-surface-variant mb-1">{prod.codigo}</div>
                      <div className="font-bold text-sm text-on-surface line-clamp-2 h-10 flex-1">{prod.nombre}</div>
                      <div className="flex justify-between items-center mt-3">
                        <span className="font-bold text-primary">
                          ${display.precio.toFixed(2)}{display.unidad ? ` / ${display.unidad}` : ''}
                        </span>
                        <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold ${prod.stock > 0 ? 'bg-secondary-container text-on-secondary-container' : 'bg-error-container text-on-error-container'}`}>
                          STOCK: {prod.stock}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Panel Derecho: Carrito / Checkout */}
          <div className="w-full md:w-96 flex flex-col bg-surface rounded-xl border border-outline-variant shadow-sm overflow-hidden h-full">
            <div className="p-4 border-b border-outline-variant bg-surface-container-low">
              <h2 className="text-lg font-bold text-on-surface">Carrito de Caja</h2>
            </div>
            
            {/* Cliente */}
            <div className="p-4 border-b border-outline-variant flex flex-col gap-2 bg-white">
              <div className="flex justify-between items-center">
                <label className="block text-xs font-bold text-on-surface-variant">CLIENTE</label>
                {!cliente && (
                  <button onClick={() => setShowNuevoCliente(true)} className="text-xs text-primary font-bold hover:underline flex items-center gap-1">
                    <span className="material-symbols-outlined text-[14px]">person_add</span> Nuevo
                  </button>
                )}
              </div>
              
              {cliente ? (
                <div className="flex justify-between items-center bg-primary/10 text-primary-fixed-dim px-3 py-2 rounded-lg">
                  <div className="flex flex-col">
                    <span className="font-bold text-sm">{cliente.nombre_completo}</span>
                    <span className="text-xs">{cliente.identificacion || cliente.email}</span>
                  </div>
                  <button onClick={() => setCliente(null)} className="p-1 hover:bg-primary/20 rounded-full">
                    <span className="material-symbols-outlined text-sm">close</span>
                  </button>
                </div>
              ) : (
                <div className="relative">
                  <input 
                    type="text" 
                    placeholder="Buscar cliente para factura..." 
                    className="w-full px-3 py-2 bg-white border border-outline-variant rounded-lg focus:ring-2 focus:ring-primary outline-none text-sm"
                    value={clienteSearch}
                    onChange={(e) => buscarClientes(e.target.value)}
                  />
                  {clientesEncontrados.length > 0 && (
                    <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-outline-variant shadow-lg rounded-lg max-h-48 overflow-y-auto z-10">
                      {clientesEncontrados.map(c => (
                        <div key={c.id} onClick={() => seleccionarCliente(c)} className="p-2 border-b border-outline-variant/30 hover:bg-surface-container-low cursor-pointer flex flex-col">
                          <span className="font-bold text-sm text-on-surface">{c.nombre_completo}</span>
                          <span className="text-xs text-on-surface-variant">{c.identificacion || c.email}</span>
                        </div>
                      ))}
                    </div>
                  )}
                  <div className="mt-2 text-xs text-on-surface-variant flex items-center gap-1">
                    <span className="material-symbols-outlined text-sm">info</span>
                    Si no busca, se facturará como Consumidor Final.
                  </div>
                </div>
              )}
            </div>

            {/* Lista de Items */}
            <div className="flex-1 overflow-y-auto p-4 flex flex-col gap-3 bg-white">
              {carrito.length === 0 ? (
                <div className="text-center text-on-surface-variant text-sm mt-10">No hay productos en el carrito</div>
              ) : (
                carrito.map(item => (
                  <div key={item.producto_id} className="flex flex-col p-3 border border-outline-variant rounded-lg bg-white">
                    <div className="flex justify-between items-start mb-2">
                      <span className="font-bold text-sm text-on-surface flex-1">{item.nombre}</span>
                      <button onClick={() => removerDelCarrito(item.producto_id)} className="text-error hover:bg-error/10 p-1 rounded">
                        <span className="material-symbols-outlined text-sm">delete</span>
                      </button>
                    </div>
                    <div className="flex justify-between items-center">
                      <div className="flex items-center gap-2">
                        {item.esPesable ? (
                          <div className="flex items-center gap-1">
                            <input
                              type="number"
                              step="0.01"
                              min="0.01"
                              max={item.max_stock}
                              value={item.cantidad}
                              onChange={(e) => {
                                const val = parseFloat(e.target.value);
                                if (!isNaN(val) && val > 0 && val <= item.max_stock) {
                                  setCarrito(prev => prev.map(c => c.producto_id === item.producto_id ? { ...c, cantidad: val, subtotal: Number((val * c.precio).toFixed(2)) } : c));
                                } else if (e.target.value === '') {
                                  setCarrito(prev => prev.map(c => c.producto_id === item.producto_id ? { ...c, cantidad: '', subtotal: 0 } : c));
                                }
                              }}
                              onBlur={(e) => {
                                const val = parseFloat(e.target.value);
                                if (isNaN(val) || val <= 0) {
                                  setCarrito(prev => prev.map(c => c.producto_id === item.producto_id ? { ...c, cantidad: 1, subtotal: c.precio } : c));
                                }
                              }}
                              className="w-20 px-2 py-1 border border-outline-variant rounded bg-white text-sm font-bold text-center outline-none focus:border-primary"
                            />
                            <span className="text-xs text-on-surface-variant font-bold">{item.unidad}</span>
                          </div>
                        ) : (
                          <div className="flex items-center gap-2 bg-surface-container rounded-lg px-2 py-1">
                            <button onClick={() => cambiarCantidad(item.producto_id, -1)} className="hover:text-primary"><span className="material-symbols-outlined text-sm">remove</span></button>
                            <span className="text-sm font-bold w-6 text-center">{item.cantidad}</span>
                            <button onClick={() => cambiarCantidad(item.producto_id, 1)} className="hover:text-primary"><span className="material-symbols-outlined text-sm">add</span></button>
                          </div>
                        )}
                      </div>
                      <span className="font-bold text-primary">${Number(item.subtotal).toFixed(2)}</span>
                    </div>
                  </div>
                ))
              )}
            </div>

            {/* Resumen y Pago */}
            <div className="p-4 border-t border-outline-variant bg-surface-container-lowest">
              <div className="flex justify-between items-center mb-4">
                <span className="text-sm text-on-surface-variant font-bold">Total a Cobrar</span>
                <span className="text-2xl font-bold text-on-surface">${total.toFixed(2)}</span>
              </div>
              
              <div className="mb-4">
                <label className="block text-xs font-bold text-on-surface-variant mb-2">MÉTODO DE PAGO</label>
                <div className="grid grid-cols-2 gap-2">
                  {['EFECTIVO', 'TRANSFERENCIA', 'DEBITO', 'CREDITO'].map(metodo => (
                    <button
                      key={metodo}
                      onClick={() => setMetodoPago(metodo)}
                      className={`py-2 text-xs font-bold rounded-lg border transition-colors ${metodoPago === metodo ? 'bg-primary text-on-primary border-primary' : 'bg-white text-on-surface-variant border-outline-variant hover:bg-surface-container-low'}`}
                    >
                      {metodo}
                    </button>
                  ))}
                </div>
              </div>

              <button 
                onClick={procesarVenta}
                disabled={carrito.length === 0}
                className="w-full bg-primary hover:bg-primary-container text-on-primary font-bold py-3 rounded-xl transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                <span className="material-symbols-outlined">payments</span>
                Procesar Venta
              </button>
            </div>
          </div>
        </div>
      ) : (
        <div className="flex-1 bg-surface rounded-xl border border-outline-variant shadow-sm overflow-hidden flex flex-col p-6">
          <h2 className="text-xl font-bold text-on-surface mb-6 flex items-center gap-2">
            <span className="material-symbols-outlined text-primary">local_shipping</span>
            Pedidos Pendientes de Entrega
          </h2>
          
          {loadingPedidos ? (
            <div className="flex-1 flex items-center justify-center text-on-surface-variant">Cargando pedidos en línea...</div>
          ) : pedidosOnline && pedidosOnline.length > 0 ? (
            <div className="grid grid-cols-1 xl:grid-cols-2 gap-4 overflow-y-auto pb-6">
              {pedidosOnline.map((order) => (
                <div key={order.id} className="bg-white border border-outline-variant rounded-xl p-5 shadow-sm flex flex-col justify-between hover:shadow-md transition-shadow">
                  <div>
                    <div className="flex justify-between items-start mb-3">
                      <div>
                        <span className="text-xs font-bold bg-yellow-100 text-yellow-800 px-2 py-1 rounded-md mb-2 inline-block">PENDIENTE A RETIRAR</span>
                        <h3 className="font-bold text-primary text-lg">{order.numero_pedido}</h3>
                        <span className="text-xs text-on-surface-variant">{order.fecha_creacion ? new Date(order.fecha_creacion).toLocaleString() : ''}</span>
                      </div>
                      <div className="text-right">
                        <span className="text-xl font-bold text-on-surface">${Number(order.total).toFixed(2)}</span>
                      </div>
                    </div>
                    
                    <div className="bg-surface-container-lowest p-3 rounded-lg mb-4 border border-outline-variant/50">
                      <h4 className="text-xs font-bold text-on-surface-variant mb-1">CLIENTE</h4>
                      <p className="font-bold text-on-surface">{order.cliente?.nombre_completo || 'Cliente Registrado'}</p>
                      <p className="text-sm text-on-surface-variant">CI/RUC: {order.cliente?.identificacion || 'N/A'}</p>
                    </div>

                    <div className="mb-4">
                      <h4 className="text-xs font-bold text-on-surface-variant mb-2">DETALLE DEL PEDIDO</h4>
                      <ul className="text-sm flex flex-col gap-1 max-h-24 overflow-y-auto">
                        {order.detalles && order.detalles.map(d => (
                          <li key={d.id} className="flex justify-between border-b border-outline-variant/30 pb-1">
                            <span className="text-on-surface">{d.cantidad}x {d.producto_nombre}</span>
                            <span className="text-on-surface-variant font-bold">${Number(d.subtotal).toFixed(2)}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                  
                  <button 
                    onClick={() => {
                      setPedidoADespachar(order);
                      setShowDespachoModal(true);
                    }}
                    className="w-full bg-green-600 hover:bg-green-700 text-white font-bold py-3 rounded-lg flex items-center justify-center gap-2 transition-colors mt-auto shadow-sm"
                  >
                    <span className="material-symbols-outlined">check_circle</span>
                    Despachar Pedido
                  </button>
                </div>
              ))}
            </div>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center text-on-surface-variant">
              <span className="material-symbols-outlined text-6xl opacity-20 mb-4">inventory_2</span>
              <p className="text-lg">No hay pedidos en línea pendientes por despachar.</p>
            </div>
          )}
        </div>
      )}

      {/* Modal Despacho Confirmación */}
      {showDespachoModal && pedidoADespachar && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/60 p-4">
          <div className="bg-surface rounded-xl shadow-2xl w-full max-w-md overflow-hidden text-center p-8 border border-outline-variant">
            <span className="material-symbols-outlined text-6xl text-green-500 mb-4">verified</span>
            <h3 className="font-bold text-xl text-on-surface mb-2">Confirmar Despacho</h3>
            <p className="text-on-surface-variant mb-6">
              ¿Confirmas que el pedido <strong>{pedidoADespachar.numero_pedido}</strong> ha sido despachado y entregado al cliente?
            </p>
            
            <div className="flex flex-col gap-3">
              <button 
                onClick={handleDespachar}
                className="w-full bg-green-600 hover:bg-green-700 text-white font-bold py-3 rounded-lg shadow-sm transition-colors text-lg"
              >
                Pedido despachado y entregado
              </button>
              <button 
                onClick={() => {
                  setShowDespachoModal(false);
                  setPedidoADespachar(null);
                }}
                className="w-full bg-surface-container-high hover:bg-surface-container-highest text-on-surface font-bold py-3 rounded-lg transition-colors"
              >
                Cancelar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
