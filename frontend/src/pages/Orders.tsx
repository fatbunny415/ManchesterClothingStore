import React, { useEffect, useState } from 'react';
import { orderService } from '../api/services';
import { Order, OrderItem, getOrderStatusLabel } from '../types';
import { Loader2, Package, Calendar, CreditCard, ChevronRight } from 'lucide-react';
import { motion } from 'framer-motion';
import { formatCOP } from '../utils/formatCurrency';
import { Link } from 'react-router-dom';

const Orders = () => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const data = await orderService.getMyOrders();
        setOrders(data);
      } catch (error) {
        console.error('Error fetching orders:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchOrders();
  }, []);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-40 bg-manchester-black min-h-screen">
        <Loader2 className="w-10 h-10 text-manchester-gold animate-spin mb-4" />
        <span className="text-white/50 text-xs tracking-widest font-bold uppercase">Cargando tu historial...</span>
      </div>
    );
  }

  return (
    <div className="pt-32 pb-24 bg-manchester-black min-h-screen">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-12">
          <h1 className="text-5xl font-bold tracking-tighter mb-4">MIS PEDIDOS</h1>
          <p className="text-white/50 text-sm tracking-wide uppercase">Historial de tus compras exclusivas en Manchester.</p>
        </div>

        {orders.length === 0 ? (
          <div className="text-center py-20 border border-dashed border-white/10 rounded-3xl">
            <Package className="w-12 h-12 text-white/10 mx-auto mb-4" />
            <h3 className="text-xl font-bold mb-2 uppercase tracking-widest">AÚN NO TIENES PEDIDOS</h3>
            <p className="text-white/50 text-sm mb-8">Tus compras aparecerán aquí una vez que realices tu primer pedido.</p>
            <a href="/shop" className="btn-primary py-3 px-8 text-xs tracking-[0.2em]">IR A LA TIENDA</a>
          </div>
        ) : (
          <div className="space-y-6">
            {orders.map((order) => (
              <motion.div 
                key={order.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-manchester-dark/30 border border-white/5 rounded-3xl p-6 md:p-8 hover:border-manchester-gold/30 transition-all group"
              >
                <div className="flex flex-col md:flex-row justify-between gap-6 mb-8">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-2xl bg-manchester-gold/10 flex items-center justify-center text-manchester-gold">
                      <Package className="w-6 h-6" />
                    </div>
                    <div>
                      <p className="text-[10px] text-white/40 font-bold tracking-widest uppercase mb-1">Orden ID</p>
                      <p className="text-sm font-mono text-white/80">{order.id.split('-')[0].toUpperCase()}</p>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-8">
                    <div>
                      <p className="text-[10px] text-white/40 font-bold tracking-widest uppercase mb-1 flex items-center gap-1">
                        <Calendar className="w-3 h-3" /> FECHA
                      </p>
                      <p className="text-sm text-white/80">{new Date(order.createdAt).toLocaleDateString()}</p>
                    </div>
                    <div>
                      <p className="text-[10px] text-white/40 font-bold tracking-widest uppercase mb-1 flex items-center gap-1">
                        <CreditCard className="w-3 h-3" /> TOTAL
                      </p>
                      <p className="text-sm font-bold text-manchester-gold">{formatCOP(order.totalAmount)}</p>
                    </div>
                    <div className="hidden md:flex flex-col items-end gap-2">
                      <span className="inline-block px-3 py-1 rounded-full bg-white/5 text-[9px] font-bold tracking-widest text-white/60 border border-white/10 uppercase">
                        {getOrderStatusLabel(order.status)}
                      </span>
                      <Link 
                        to={`/order-confirmation/${order.id}`} 
                        className="text-[10px] text-manchester-gold hover:text-white font-bold tracking-widest uppercase flex items-center gap-1 mt-1 transition-colors"
                      >
                        Ver Recibo <ChevronRight className="w-3 h-3" />
                      </Link>
                    </div>
                  </div>
                </div>

                <div className="space-y-4 border-t border-white/5 pt-6">
                  {order.items.map((item: OrderItem, idx: number) => (
                    <div key={item.productId + '-' + idx} className="flex items-center justify-between group/item">
                      <div className="flex items-center gap-4">
                        <div className="w-10 h-10 rounded-lg bg-white/5 overflow-hidden border border-white/10">
                          {item.productImageUrl ? (
                            <img src={item.productImageUrl} alt={item.productName || 'Producto'} className="w-full h-full object-cover" />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center text-white/10">
                              <Package className="w-4 h-4" />
                            </div>
                          )}
                        </div>
                        <div>
                          <p className="text-xs font-bold tracking-wide uppercase">{item.productName || 'Producto'}</p>
                          <p className="text-[10px] text-white/40 tracking-widest">{item.quantity} x {formatCOP(item.unitPrice)}</p>
                        </div>
                      </div>
                      <p className="text-xs font-mono text-white/60">{formatCOP(item.quantity * item.unitPrice)}</p>
                    </div>
                  ))}
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Orders;
