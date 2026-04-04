import React, { useEffect, useState } from 'react';
import { adminOrderService } from '../../api/adminServices';
import type { AdminOrder } from '../../types';
import toast from 'react-hot-toast';
import SellerOrdersKanban from './SellerOrdersKanban';

const SellerOrders: React.FC = () => {
  const [orders, setOrders] = useState<AdminOrder[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchOrders = async () => {
    try {
      setLoading(true);
      const data = await adminOrderService.getAll();
      setOrders(data);
    } catch (error) {
      console.error(error);
      toast.error('Error al cargar órdenes.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  const handleStatusChange = async (orderId: string, newStatus: number): Promise<boolean> => {
    try {
      await adminOrderService.updateStatus(orderId, newStatus);
      toast.success('Estado actualizado correctamente.');
      return true;
    } catch (error) {
      console.error(error);
      toast.error('No se pudo actualizar el estado.');
      // Refetch orders behind the scenes to fix optimistic UI
      fetchOrders();
      return false;
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center h-64 opacity-50">
        <div className="w-12 h-12 border-4 border-cyan-400 border-t-transparent rounded-full animate-spin"></div>
        <p className="mt-4 text-cyan-400 text-xs font-bold tracking-widest uppercase">Cargando tablero...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-serif font-bold text-white tracking-tight">Gestión de Pedidos</h1>
        <p className="text-white/60 text-sm mt-1">
          Arrastra las tarjetas para cambiar su estado. Los cambios se guardan automáticamente.
        </p>
      </div>
      
      {/* Kanban Board Container */}
      <div className="mt-6">
        <SellerOrdersKanban orders={orders} onStatusChange={handleStatusChange} />
      </div>
    </div>
  );
};

export default SellerOrders;
