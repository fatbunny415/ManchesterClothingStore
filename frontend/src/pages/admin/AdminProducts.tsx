import React, { useEffect, useState } from 'react';
import { adminProductService } from '../../api/adminServices';
import { AdminTable } from '../../components/admin/ui/AdminTable';
import AdminModal from '../../components/admin/ui/AdminModal';
import ConfirmDialog from '../../components/admin/ui/ConfirmDialog';
import { AdminFormField } from '../../components/admin/ui/AdminFormField';
import StatusBadge from '../../components/admin/ui/StatusBadge';
import { Plus, Edit2, Trash2, DatabaseZap, ImageIcon, Loader2 } from 'lucide-react';
import type { Product, CreateProductData } from '../../types';
import toast from 'react-hot-toast';
import { formatCOP } from '../../utils/formatCurrency';

const defaultForm: CreateProductData = {
  name: '',
  description: '',
  price: 0,
  stock: 0,
  category: 'Camisetas',
  imageUrl: '',
  isActive: true,
};

const AdminProducts: React.FC = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  
  // States for Modals
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState<CreateProductData>(defaultForm);
  const [editingId, setEditingId] = useState<string | null>(null);
  
  // State for Deletion
  const [deleteData, setDeleteData] = useState<{ isOpen: boolean; id: string; name: string }>({
    isOpen: false,
    id: '',
    name: ''
  });

  const loadProducts = async () => {
    try {
      setLoading(true);
      const data = await adminProductService.getAll();
      setProducts(data);
    } catch (err) {
      console.error("Error cargando productos:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadProducts();
  }, []);

  // --- CRUD OPERATIONS ---
  const handleOpenCreate = () => {
    setEditingId(null);
    setFormData(defaultForm);
    setIsModalOpen(true);
  };

  const handleOpenEdit = (product: Product) => {
    setEditingId(product.id);
    setFormData({
      name: product.name,
      description: product.description,
      price: product.price,
      stock: product.stock,
      category: product.category || 'Camisetas',
      imageUrl: product.imageUrl || '',
      isActive: product.isActive,
    });
    setIsModalOpen(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || formData.price < 0 || formData.stock < 0) return;
    
    try {
      setSaving(true);
      if (editingId) {
        // Edit mode
        await adminProductService.update(editingId, formData);
      } else {
        // Create mode
        await adminProductService.create(formData);
      }
      setIsModalOpen(false);
      await loadProducts();
    } catch (err) {
      console.error("Error guardando producto:", err);
      toast.error("Hubo un error al guardar o verificar el producto.");
    } finally {
      setSaving(false);
    }
  };

  const confirmDelete = (product: Product) => {
    setDeleteData({ isOpen: true, id: product.id, name: product.name });
  };

  const executeDelete = async () => {
    try {
      setSaving(true);
      await adminProductService.delete(deleteData.id);
      setDeleteData({ isOpen: false, id: '', name: '' });
      await loadProducts();
    } catch (err) {
      console.error("Error al eliminar:", err);
      toast.error("Error eliminando el producto. Podría estar asociado a una orden.");
    } finally {
      setSaving(false);
    }
  };

  const handleSeed = async () => {
    if(!confirm("¿Deseas insertar los datos de prueba masivos del backend?")) return;
    try {
      setLoading(true);
      await adminProductService.seed();
      await loadProducts();
    } catch (err) {
      console.error("Error al hacer seed:", err);
    }
  };

  // --- TABLE COLUMNS ---
  const columns = [
    { 
      header: 'Producto', 
      accessor: (p: Product) => (
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-white/5 flex items-center justify-center overflow-hidden shrink-0 border border-white/10">
            {p.imageUrl ? (
              <img src={p.imageUrl} alt={p.name} className="w-full h-full object-cover" />
            ) : (
              <ImageIcon className="w-4 h-4 text-white/20" />
            )}
          </div>
          <div>
            <p className="font-bold text-white text-sm">{p.name}</p>
            <p className="text-[10px] text-white/40 uppercase tracking-widest">{p.category}</p>
          </div>
        </div>
      ) 
    },
    { 
      header: 'Precio', 
      accessor: (p: Product) => <span className="font-bold text-red-500">{formatCOP(p.price)}</span>
    },
    { 
      header: 'Stock', 
      accessor: (p: Product) => (
        <span className={`font-medium ${p.stock <= 5 ? 'text-red-400' : 'text-white/70'}`}>
          {p.stock} uds
        </span>
      )
    },
    { 
      header: 'Estado', 
      accessor: (p: Product) => (
        <StatusBadge status={p.isActive ? "1" : "4"} overrideText={p.isActive ? 'Activo' : 'Inactivo'} />
      ) 
    },
    { 
      header: 'Acciones', 
      className: 'text-right',
      accessor: (p: Product) => (
        <div className="flex items-center justify-end gap-2">
          <button 
            type="button"
            onClick={() => handleOpenEdit(p)}
            className="p-2 bg-white/5 hover:bg-red-500/20 text-white/60 hover:text-red-500 transition-colors rounded-lg"
          >
            <Edit2 className="w-4 h-4" />
          </button>
          <button 
            type="button"
            onClick={() => confirmDelete(p)}
            className="p-2 bg-white/5 hover:bg-red-500/20 text-white/60 hover:text-red-400 transition-colors rounded-lg"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      ) 
    },
  ];

  return (
    <div className="admin-page-enter space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-serif font-bold tracking-tight mb-1">Inventario</h1>
          <p className="text-sm text-white/40">Gestiona los productos de tu e-commerce</p>
        </div>
        
        <div className="flex items-center gap-3">
          <button 
            onClick={handleSeed}
            className="btn-gold !bg-[#111] !border-white/10 !text-white hover:!border-white/30 hidden sm:flex items-center gap-2 px-4 py-2 text-xs"
          >
            <DatabaseZap className="w-4 h-4" /> Autollenar (Seed)
          </button>
          <button 
            onClick={handleOpenCreate}
            className="btn-gold flex items-center gap-2 px-5 py-2"
          >
            <Plus className="w-5 h-5" /> Nuevo Producto
          </button>
        </div>
      </div>

      <AdminTable 
        data={products} 
        columns={columns} 
        keyExtractor={(p) => p.id} 
        loading={loading}
        emptyMessage="No tienes productos registrados en tu inventario."
      />

      {/* CRUD MODAL */}
      <AdminModal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
        title={editingId ? 'Editar Producto' : 'Crear Producto Nuevo'}
      >
        <form onSubmit={handleSave} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <AdminFormField 
              label="Nombre del Producto" 
              value={formData.name} 
              onChange={e => setFormData({...formData, name: e.target.value})} 
              required 
              placeholder="Ej. Sudadera Black Edition"
              className="sm:col-span-2 mb-0"
              maxLength={110}
            />
            
            <AdminFormField 
              label="Precio (COP)" 
              type="number" 
              step="0.01"
              value={formData.price} 
              onChange={e => setFormData({...formData, price: parseFloat(e.target.value)})} 
              required 
              className="mb-0"
            />

            <AdminFormField 
              label="Stock" 
              type="number" 
              value={formData.stock} 
              onChange={e => setFormData({...formData, stock: parseInt(e.target.value)})} 
              required 
              className="mb-0"
            />

            <AdminFormField 
              label="Categoría" 
              type="select" 
              value={formData.category} 
              onChange={e => setFormData({...formData, category: e.target.value})} 
              options={[
                { value: 'Camisetas', label: 'Superior - Camisetas' },
                { value: 'Chaquetas', label: 'Superior - Chaquetas' },
                { value: 'Buzos', label: 'Superior - Buzos' },
                { value: 'Camisas', label: 'Superior - Camisas' },
                { value: 'Polos', label: 'Superior - Polos' },
                { value: 'Pantalones', label: 'Inferior - Pantalones' },
                { value: 'Jeans', label: 'Inferior - Jeans' },
                { value: 'Shorts', label: 'Inferior - Shorts' },
                { value: 'Sudaderas', label: 'Inferior - Sudaderas' },
                { value: 'Deportiva', label: 'Inferior - Deportiva' },
                { value: 'Relojes', label: 'Accesorios - Relojes' },
                { value: 'Gafas', label: 'Accesorios - Gafas' },
                { value: 'Cinturones', label: 'Accesorios - Cinturones' },
                { value: 'Gorras', label: 'Accesorios - Gorras' },
                { value: 'Bufandas', label: 'Accesorios - Bufandas' },
              ]}
              className="mb-0 sm:col-span-2"
            />

            <AdminFormField 
              label="URL de Imagen " 
              value={formData.imageUrl} 
              onChange={e => setFormData({...formData, imageUrl: e.target.value})} 
              placeholder="https://..."
              className="mb-0 sm:col-span-2"
            />

            <AdminFormField 
              label="Descripción" 
              type="textarea" 
              value={formData.description} 
              onChange={e => setFormData({...formData, description: e.target.value})} 
              className="mb-0 sm:col-span-2"
              maxLength={1500}
            />

            <label className="flex items-center gap-3 sm:col-span-2 p-4 bg-white/5 rounded-xl border border-white/10 cursor-pointer hover:bg-white/10 transition-colors">
              <input 
                type="checkbox" 
                checked={formData.isActive}
                onChange={e => setFormData({...formData, isActive: e.target.checked})}
                className="w-5 h-5 rounded border-white/20 text-red-500 focus:ring-red-500 focus:ring-offset-[#111] bg-[#222]"
              />
              <div className="flex flex-col">
                <span className="text-sm font-bold text-white">Producto Activo</span>
                <span className="text-[10px] text-white/40">Si se desactiva, los clientes no podrán verlo en la tienda principal ni comprarlo.</span>
              </div>
            </label>
          </div>

          <div className="flex justify-end gap-3 mt-8 pt-6 border-t border-white/10">
            <button 
              type="button"
              disabled={saving}
              className="admin-btn admin-btn--secondary" 
              onClick={() => setIsModalOpen(false)}
            >
              Cancelar
            </button>
            <button 
              type="submit"
              disabled={saving}
              className="admin-btn admin-btn--primary min-w-[120px] justify-center" 
            >
              {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : (editingId ? 'Guardar Cambios' : 'Crear Producto')}
            </button>
          </div>
        </form>
      </AdminModal>

      {/* CONFIRM DELETE MODAL */}
      <ConfirmDialog 
        isOpen={deleteData.isOpen}
        onClose={() => setDeleteData({ isOpen: false, id: '', name: '' })}
        onConfirm={executeDelete}
        loading={saving}
        title="Eliminar Producto"
        message={`¿Estás completamente seguro de que quieres eliminar el producto "${deleteData.name}"? Esta acción será irreversible y borrará el elemento permanentemente del inventario.`}
        confirmText="Sí, eliminar"
      />
    </div>
  );
};

export default AdminProducts;
