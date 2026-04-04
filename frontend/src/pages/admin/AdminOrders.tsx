import React, { useEffect, useState } from 'react';
import { adminOrderService } from '../../api/adminServices';
import { AdminTable } from '../../components/admin/ui/AdminTable';
import AdminModal from '../../components/admin/ui/AdminModal';
import { AdminFormField } from '../../components/admin/ui/AdminFormField';
import StatusBadge from '../../components/admin/ui/StatusBadge';
import { Edit2, Loader2, RefreshCw } from 'lucide-react';
import type { AdminOrder } from '../../types';
import { useAuthStore } from '../../store/useAuthStore';
import toast from 'react-hot-toast';
import { formatCOP } from '../../utils/formatCurrency';

const AdminOrders: React.FC = () => {
  const [orders, setOrders] = useState<AdminOrder[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const { user } = useAuthStore();
  
  // Modals
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState<AdminOrder | null>(null);
  const [newStatus, setNewStatus] = useState<string>('');

  const loadOrders = async () => {
    try {
      setLoading(true);
      const data = await adminOrderService.getAll();
      // Mostramos las órdenes más recientes arriba
      const sorted = data.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
      setOrders(sorted);
    } catch (err) {
      console.error("Error cargando pedidos:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadOrders();
  }, []);

  const handleOpenEdit = (order: AdminOrder) => {
    setSelectedOrder(order);
    setNewStatus(order.status);
    setIsModalOpen(true);
  };

  const handleSaveStatus = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedOrder) return;
    
    try {
      setSaving(true);
      await adminOrderService.updateStatus(selectedOrder.id, parseInt(newStatus));
      setIsModalOpen(false);
      await loadOrders();
    } catch (err) {
      console.error("Error cambiando estado:", err);
      toast.error("Hubo un error al actualizar el pedido.");
    } finally {
      setSaving(false);
    }
  };

  const columns = [
    { 
      header: 'ID / Fecha', 
      accessor: (o: AdminOrder) => (
        <div>
          <p className="text-white font-medium text-sm">#{o.id.substring(0, 8)}</p>
          <p className="text-[10px] text-white/40 tracking-wider uppercase mt-0.5">
            {new Date(o.createdAt).toLocaleDateString()}
          </p>
        </div>
      ) 
    },
    { 
      header: 'Cliente', 
      accessor: (o: AdminOrder) => (
        <div>
          <p className="text-white font-medium text-sm">{o.customerName}</p>
          <p className="text-[10px] text-white/40 mt-0.5">{o.customerEmail}</p>
        </div>
      )
    },
    { 
      header: 'Total', 
      accessor: (o: AdminOrder) => <span className="font-bold text-red-500">{formatCOP(o.totalAmount)}</span>
    },
    { 
      header: 'Estado Actual', 
      accessor: (o: AdminOrder) => <StatusBadge status={o.status} />
    },
    { 
      header: 'Acciones', 
      className: 'text-right',
      accessor: (o: AdminOrder) => (
        <button 
          type="button"
          onClick={() => handleOpenEdit(o)}
          className="p-2 bg-white/5 hover:bg-red-500/20 text-white/60 hover:text-red-500 transition-colors rounded-lg inline-flex"
        >
          <Edit2 className="w-4 h-4" />
        </button>
      ) 
    },
  ];

  return (
    <div className="admin-page-enter space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-serif font-bold tracking-tight mb-1">Pedidos</h1>
          <p className="text-sm text-white/40">Gestiona las compras de tus clientes</p>
        </div>
        
        <button 
          type="button"
          onClick={loadOrders}
          className="btn-gold !bg-[#111] !border-white/10 !text-white hover:!border-white/30 hidden sm:flex items-center gap-2 px-4 py-2 text-xs"
        >
          <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} /> Actualizar
        </button>
      </div>

        <AdminTable 
          data={orders} 
          columns={columns} 
          keyExtractor={(o) => o.id} 
          loading={loading}
          emptyMessage="No hay pedidos registrados en el sistema."
        />

      {/* UPDATE STATUS MODAL */}
      <AdminModal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
        title="Actualizar Estado del Pedido"
      >
        {selectedOrder && (
          <form onSubmit={handleSaveStatus} className="space-y-4">
            
            <div className="bg-white/5 border border-white/10 p-4 rounded-xl mb-6 flex flex-col gap-1">
              <span className="text-[10px] uppercase tracking-widest text-white/40 font-bold">Cliente</span>
              <span className="text-sm text-white font-medium">{selectedOrder.customerName} ({selectedOrder.customerEmail})</span>
            </div>

            <AdminFormField 
              label="Nuevo Estado" 
              type="select" 
              value={newStatus} 
              onChange={e => setNewStatus(e.target.value)} 
              options={[
                { value: '1', label: 'Pendiente' },
                { value: '2', label: 'En Proceso' },
                { value: '3', label: 'Completado' },
                { value: '4', label: 'Cancelado' },
              ]}
              required 
            />

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
                {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Guardar Cambio'}
              </button>
            </div>
          </form>
        )}
      </AdminModal>
    </div>
  );
};

export default AdminOrders;
