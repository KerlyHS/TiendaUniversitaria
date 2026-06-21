import { useState, useEffect, useRef } from 'react';
import { Plus, Edit2, Trash2, X, Image as ImageIcon } from 'lucide-react';
import apiClient from '../../../core/api/apiClient';
import { useToast } from '../../../shared/context/ToastContext';

export const InventoryAdminPage = () => {
  const { addToast } = useToast();
  const [products, setProducts] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  
  // State for the Form Modal
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const fileInputRef = useRef(null);

  const [formData, setFormData] = useState({
    nombre: '',
    codigo: '',
    descripcion: '',
    precio: '',
    stock: '',
    categoria: 'SOUVENIR',
    medida: 'UNIDAD',
    fecha_llegada: '',
    fecha_caducidad: '',
    is_activo: true,
    aplica_impuesto: true,
  });
  const [selectedFile, setSelectedFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);

  const fetchProducts = async () => {
    try {
      setIsLoading(true);
      const res = await apiClient.get('/productos/');
      // Manejar la paginación de DRF si existe
      setProducts(res.data.results || res.data);
    } catch (error) {
      console.error("Error fetching products", error);
      addToast({ title: 'Error', message: 'No se pudieron cargar los productos.', type: 'error' });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setSelectedFile(file);
      setPreviewUrl(URL.createObjectURL(file));
    }
  };

  const openNewForm = () => {
    setEditingId(null);
    setFormData({
      nombre: '', codigo: '', descripcion: '', precio: '', stock: '',
      categoria: 'SOUVENIR', medida: 'UNIDAD', fecha_llegada: '', fecha_caducidad: '',
      is_activo: true, aplica_impuesto: true,
    });
    setSelectedFile(null);
    setPreviewUrl(null);
    setIsFormOpen(true);
  };

  const openEditForm = (product) => {
    setEditingId(product.id);
    setFormData({
      nombre: product.nombre,
      codigo: product.codigo || '',
      descripcion: product.descripcion,
      precio: product.precio,
      stock: product.stock,
      categoria: product.categoria || 'SOUVENIR',
      medida: product.medida || 'UNIDAD',
      fecha_llegada: product.fecha_llegada || '',
      fecha_caducidad: product.fecha_caducidad || '',
      is_activo: product.is_activo,
      aplica_impuesto: product.aplica_impuesto,
    });
    setSelectedFile(null);
    setPreviewUrl(product.imagen || null);
    setIsFormOpen(true);
  };

  const handleDelete = async (id) => {
    if (!window.confirm('¿Estás seguro de que deseas eliminar este producto?')) return;
    try {
      await apiClient.delete(`/productos/${id}/`);
      addToast({ title: 'Eliminado', message: 'Producto eliminado correctamente.' });
      fetchProducts();
    } catch (error) {
      addToast({ title: 'Error', message: 'No se pudo eliminar el producto.', type: 'error' });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Create FormData because we might send a file
    const data = new FormData();
    Object.keys(formData).forEach(key => {
      if (formData[key] !== null && formData[key] !== '') {
        data.append(key, formData[key]);
      }
    });
    
    if (selectedFile) {
      data.append('imagen', selectedFile);
    }

    try {
      if (editingId) {
        await apiClient.patch(`/productos/${editingId}/`, data, {
          headers: { 'Content-Type': 'multipart/form-data' }
        });
        addToast({ title: 'Actualizado', message: 'Producto actualizado con éxito.' });
      } else {
        await apiClient.post('/productos/', data, {
          headers: { 'Content-Type': 'multipart/form-data' }
        });
        addToast({ title: 'Creado', message: 'Producto creado con éxito.' });
      }
      setIsFormOpen(false);
      fetchProducts();
    } catch (error) {
      console.error(error.response?.data);
      addToast({ title: 'Error', message: 'Revisa los datos e intenta de nuevo.', type: 'error' });
    }
  };

  return (
    <div className="flex-grow w-full p-6 lg:p-8 flex flex-col relative h-full">
      
      <div className="flex justify-between items-center mb-8">
        <h1 className="font-display-sm text-[28px] text-on-surface font-bold">Gestión de Inventario</h1>
        <button 
          onClick={openNewForm}
          className="bg-primary text-on-primary px-4 py-2 rounded-DEFAULT font-title-sm flex items-center gap-2 hover:bg-primary-container hover:text-on-primary-container transition-colors shadow-sm"
        >
          <Plus size={18} /> Nuevo Producto
        </button>
      </div>

      {/* Table Section */}
      <div className="bg-surface border border-outline-variant rounded-xl overflow-hidden shadow-sm flex-grow">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-surface-container-low border-b border-outline-variant text-label-lg text-on-surface-variant">
                <th className="p-4">Imagen</th>
                <th className="p-4">Producto</th>
                <th className="p-4">Precio</th>
                <th className="p-4">Stock</th>
                <th className="p-4">Fechas</th>
                <th className="p-4">Estado</th>
                <th className="p-4 text-right">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {isLoading ? (
                <tr>
                  <td colSpan="7" className="p-8 text-center text-on-surface-variant">Cargando productos...</td>
                </tr>
              ) : products.length === 0 ? (
                <tr>
                  <td colSpan="7" className="p-8 text-center text-on-surface-variant">No hay productos registrados.</td>
                </tr>
              ) : (
                products.map(p => (
                  <tr key={p.id} className="border-b border-outline-variant/50 hover:bg-surface-container-lowest transition-colors">
                    <td className="p-4">
                      <div className="w-12 h-12 bg-surface-container rounded flex items-center justify-center overflow-hidden">
                        {p.imagen ? <img src={p.imagen} alt={p.nombre} className="w-full h-full object-cover" /> : <ImageIcon size={20} className="text-outline" />}
                      </div>
                    </td>
                    <td className="p-4">
                      <div className="font-title-sm text-on-surface font-bold">{p.nombre}</div>
                      <div className="text-body-sm text-on-surface-variant">{p.codigo || 'Sin código'}</div>
                    </td>
                    <td className="p-4 font-body-md">${parseFloat(p.precio).toFixed(2)}</td>
                    <td className="p-4">
                      <span className={`px-2 py-1 rounded text-xs font-bold ${p.stock > 5 ? 'bg-[#006633]/10 text-[#006633]' : p.stock > 0 ? 'bg-yellow-500/10 text-yellow-700' : 'bg-error/10 text-error'}`}>
                        {p.stock} un.
                      </span>
                    </td>
                    <td className="p-4 text-body-sm text-on-surface-variant">
                      {p.fecha_llegada && <div>Ing: {p.fecha_llegada}</div>}
                      {p.fecha_caducidad && <div>Cad: <span className={new Date(p.fecha_caducidad) < new Date() ? 'text-error font-bold' : ''}>{p.fecha_caducidad}</span></div>}
                    </td>
                    <td className="p-4">
                      {p.is_activo ? (
                        <span className="text-xs bg-primary/10 text-primary px-2 py-1 rounded font-bold">Activo</span>
                      ) : (
                        <span className="text-xs bg-outline/10 text-outline px-2 py-1 rounded">Inactivo</span>
                      )}
                    </td>
                    <td className="p-4 text-right">
                      <div className="flex justify-end gap-2">
                        <button onClick={() => openEditForm(p)} className="p-2 text-primary hover:bg-primary/10 rounded-full transition-colors"><Edit2 size={16} /></button>
                        <button onClick={() => handleDelete(p.id)} className="p-2 text-error hover:bg-error/10 rounded-full transition-colors"><Trash2 size={16} /></button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Slide-over Form / Modal */}
      {isFormOpen && (
        <div className="fixed inset-0 z-[100] flex justify-end">
          <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={() => setIsFormOpen(false)}></div>
          <div className="relative w-full max-w-md bg-surface h-full shadow-2xl flex flex-col animate-in slide-in-from-right duration-300">
            <div className="flex justify-between items-center p-6 border-b border-outline-variant bg-surface-container-lowest">
              <h2 className="font-title-lg font-bold text-on-surface">{editingId ? 'Editar Producto' : 'Nuevo Producto'}</h2>
              <button onClick={() => setIsFormOpen(false)} className="p-2 hover:bg-surface-container rounded-full"><X size={20} /></button>
            </div>
            
            <form onSubmit={handleSubmit} className="flex-grow overflow-y-auto p-6 flex flex-col gap-5">
              
              {/* Image Upload */}
              <div className="flex flex-col gap-2">
                <label className="font-title-sm text-on-surface">Foto del Producto</label>
                <div 
                  className="w-full h-40 border-2 border-dashed border-outline-variant rounded-xl flex flex-col items-center justify-center cursor-pointer hover:border-primary hover:bg-primary/5 transition-colors overflow-hidden relative"
                  onClick={() => fileInputRef.current?.click()}
                >
                  {previewUrl ? (
                    <img src={previewUrl} alt="Preview" className="w-full h-full object-contain" />
                  ) : (
                    <>
                      <ImageIcon size={32} className="text-outline mb-2" />
                      <span className="text-body-sm text-on-surface-variant">Haz clic para subir imagen</span>
                    </>
                  )}
                </div>
                <input type="file" accept="image/*" ref={fileInputRef} onChange={handleFileChange} className="hidden" />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="flex flex-col gap-1">
                  <label className="text-label-md text-on-surface-variant">Código</label>
                  <input name="codigo" value={formData.codigo} onChange={handleInputChange} className="px-3 py-2 border border-outline rounded bg-surface focus:border-primary outline-none" />
                </div>
                <div className="flex flex-col gap-1">
                  <label className="text-label-md text-on-surface-variant">Categoría</label>
                  <select name="categoria" value={formData.categoria} onChange={handleInputChange} className="px-3 py-2 border border-outline rounded bg-surface focus:border-primary outline-none">
                    <option value="AGRICOLA">Agrícola (Alimentos)</option>
                    <option value="INSTITUCIONAL">Institucional</option>
                    <option value="SOUVENIR">Souvenir</option>
                    <option value="TEXTIL">Textil</option>
                    <option value="ACADEMICO">Académico</option>
                  </select>
                </div>
              </div>

              <div className="flex flex-col gap-1">
                <label className="text-label-md text-on-surface-variant">Nombre *</label>
                <input required name="nombre" value={formData.nombre} onChange={handleInputChange} className="px-3 py-2 border border-outline rounded bg-surface focus:border-primary outline-none" />
              </div>

              <div className="flex flex-col gap-1">
                <label className="text-label-md text-on-surface-variant">Descripción</label>
                <textarea rows="4" name="descripcion" value={formData.descripcion} onChange={handleInputChange} className="px-3 py-2 border border-outline rounded bg-surface focus:border-primary outline-none resize-none" placeholder="Usa saltos de línea y viñetas (•) para la vista de detalle..."></textarea>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="flex flex-col gap-1">
                  <label className="text-label-md text-on-surface-variant">Precio ($) *</label>
                  <input required type="number" step="0.01" min="0" name="precio" value={formData.precio} onChange={handleInputChange} className="px-3 py-2 border border-outline rounded bg-surface focus:border-primary outline-none" />
                </div>
                <div className="flex flex-col gap-1">
                  <label className="text-label-md text-on-surface-variant">Stock Inicial *</label>
                  <input required type="number" min="0" name="stock" value={formData.stock} onChange={handleInputChange} className="px-3 py-2 border border-outline rounded bg-surface focus:border-primary outline-none" />
                </div>
              </div>

              {/* Fechas para Alimentos */}
              <div className="grid grid-cols-2 gap-4 p-4 bg-surface-container-low rounded-lg border border-outline-variant">
                <div className="flex flex-col gap-1">
                  <label className="text-label-md text-on-surface-variant">Llegada</label>
                  <input type="date" name="fecha_llegada" value={formData.fecha_llegada} onChange={handleInputChange} className="px-2 py-1 border border-outline rounded bg-surface text-sm" />
                </div>
                <div className="flex flex-col gap-1">
                  <label className="text-label-md text-error font-bold">Caducidad</label>
                  <input type="date" name="fecha_caducidad" value={formData.fecha_caducidad} onChange={handleInputChange} className="px-2 py-1 border border-error rounded bg-error/5 text-sm" />
                </div>
                <p className="col-span-2 text-xs text-on-surface-variant mt-1">Requerido solo para productos agrícolas/perecederos.</p>
              </div>

              <div className="flex gap-6 mt-2">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input type="checkbox" name="is_activo" checked={formData.is_activo} onChange={handleInputChange} className="accent-primary w-4 h-4" />
                  <span className="text-body-sm">Producto Activo</span>
                </label>
              </div>

            </form>
            
            <div className="p-6 border-t border-outline-variant bg-surface-container-lowest flex gap-4">
              <button onClick={() => setIsFormOpen(false)} className="flex-1 py-2 border border-outline text-on-surface rounded font-title-sm hover:bg-surface-container-low">Cancelar</button>
              <button onClick={handleSubmit} className="flex-1 py-2 bg-[#006633] text-white rounded font-title-sm hover:bg-[#005522] shadow-sm">Guardar</button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
