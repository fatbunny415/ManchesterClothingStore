import React, { useState } from 'react';
import { adminOrderService } from '../../api/adminServices';
import { Package, Clock, Truck, Loader2, CheckCircle2 } from 'lucide-react';
import type { AdminOrder } from '../../types';
import toast from 'react-hot-toast';
import { formatCOP } from '../../utils/formatCurrency';

interface SellerOrdersKanbanProps {
  orders: AdminOrder[];
  onOrderUpdated: () => void;
}

const SellerOrdersKanban: React.FC<SellerOrdersKanbanProps> = ({ orders, onOrderUpdated }) => {
  const [processingId, setProcessingId] = useState<string | null>(null);

  const handleDispatch = async (orderId: string) => {
    try {
      setProcessingId(orderId);
      // Status 3 is "Enviado" (Completed)
      await adminOrderService.updateStatus(orderId, 3);
      onOrderUpdated();
    } catch (err) {
      console.error("Error al despachar el pedido:", err);
      toast.error("Hubo un error al marcar el pedido como enviado.");
    } finally {
      setProcessingId(null);
    }
  };

  const pendingOrders = orders.filter(o => o.status === '1');
  const dispatchingOrders = orders.filter(o => o.status === '2');
  const sentOrders = orders.filter(o => o.status === '3');

  const Column = ({ title, icon: Icon, colorClass, items, isDispatchable = false }: any) => (
    <div className="flex flex-col h-full bg-[#111] border border-white/5 rounded-2xl overflow-hidden flex-1 min-w-[300px]">
      <div className={`p-4 border-b border-white/5 flex items-center justify-between ${colorClass}`}>
        <div className="flex items-center gap-2">
          <Icon className="w-5 h-5" />
          <h3 className="font-bold tracking-widest uppercase text-sm">{title}</h3>
        </div>
        <span className="bg-black/50 text-white text-xs font-bold px-2.5 py-1 rounded-full">
          {items.length}
        </span>
      </div>
      
      <div className="p-4 flex-1 overflow-y-auto space-y-4 custom-scrollbar">
        {items.length === 0 ? (
          <div className="h-32 flex items-center justify-center border border-dashed border-white/10 rounded-xl">
            <span className="text-white/30 text-xs uppercase tracking-widest">Sin órdenes</span>
          </div>
        ) : (
          items.map((order: AdminOrder) => (
            <div key={order.id} className="bg-white/5 border border-white/10 rounded-xl p-4 hover:border-white/20 transition-colors">
              <div className="flex justify-between items-start mb-3">
                <div>
                  <span className="text-[10px] text-white/50 tracking-widest uppercase block mb-1">
                    {new Date(order.createdAt).toLocaleDateString()}
                  </span>
                  <p className="text-sm font-medium text-white">#{order.id.substring(0, 8)}</p>
                </div>
                <div className="text-right">
                  <span className="text-manchester-gold font-bold text-sm block">
                    {formatCOP(order.totalAmount)}
                  </span>
                  <span className="text-[10px] text-white/40 uppercase tracking-wider">
                    {order.items.reduce((acc, i) => acc + i.quantity, 0)} items
                  </span>
                </div>
              </div>

              <div className="mb-4">
                <p className="text-xs text-white/80 font-medium">{order.customerName}</p>
                <p className="text-[10px] text-white/40">{order.customerEmail}</p>
              </div>

              <div className="space-y-2 mb-4 bg-black/30 p-2 rounded-lg">
                {order.items.map(item => (
                  <div key={item.productId} className="flex justify-between text-xs">
                    <span className="text-white/70 truncate pr-2">
                      <span className="text-manchester-gold mr-1">{item.quantity}x</span> 
                      {item.productName}
                    </span>
                  </div>
                ))}
              </div>

              {isDispatchable && (
                <button
                  onClick={() => handleDispatch(order.id)}
                  disabled={processingId === order.id}
                  className="w-full py-2 bg-manchester-gold/10 hover:bg-manchester-gold text-manchester-gold hover:text-black font-bold uppercase tracking-widest text-[10px] rounded-lg transition-all flex items-center justify-center gap-2"
                >
                  {processingId === order.id ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <>
                      <CheckCircle2 className="w-4 h-4" /> Activar Despacho
                    </>
                  )}
                </button>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );

  return (
    <div className="flex gap-6 overflow-x-auto pb-4 h-[calc(100vh-200px)] items-start">
      <Column 
        title="En Proceso (Validando)" 
        icon={Clock} 
        colorClass="text-yellow-500 bg-yellow-500/5" 
        items={pendingOrders} 
      />
      <Column 
        title="En Despacho (Armado)" 
        icon={Package} 
        colorClass="text-blue-500 bg-blue-500/5" 
        items={dispatchingOrders} 
        isDispatchable={true}
      />
      <Column 
        title="Enviado" 
        icon={Truck} 
        colorClass="text-green-500 bg-green-500/5" 
        items={sentOrders} 
      />
    </div>
  );
};

export default SellerOrdersKanban;
