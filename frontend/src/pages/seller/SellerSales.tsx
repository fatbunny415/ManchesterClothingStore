import React, { useEffect, useState } from 'react';
import { Truck, CheckCheck, Loader2, Info } from 'lucide-react';
import { adminOrderService } from '../../api/adminServices';
import type { AdminOrder } from '../../types';
import { formatCOP } from '../../utils/formatCurrency';
import toast from 'react-hot-toast';

const SellerSales: React.FC = () => {
  const [sales, setSales] = useState<AdminOrder[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchSales = async () => {
      try {
        setLoading(true);
        const data = await adminOrderService.getAll();
        // Filtramos solo pedidos enviados (4) o entregados (5)
        const dispatchedOrders = data.filter((order) => order.status === '4' || order.status === '5');
        // Ordenamos por fecha de más reciente a más antigua
        dispatchedOrders.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
        setSales(dispatchedOrders);
      } catch (error) {
        console.error(error);
        toast.error('Error al cargar historial de ventas.');
      } finally {
        setLoading(false);
      }
    };

    fetchSales();
  }, []);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[50vh] opacity-50">
        <Loader2 className="w-12 h-12 text-cyan-400 animate-spin" />
        <p className="mt-4 text-cyan-400 text-xs font-bold tracking-widest uppercase">Cargando ventas...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-serif font-bold text-white tracking-tight">Historial de Ventas</h1>
        <p className="text-white/60 text-sm mt-1">
          Aquí se reflejan las compras que ya fueron despachadas (Enviadas o Entregadas).
        </p>
      </div>

      <div className="bg-manchester-dark border border-white/5 rounded-2xl overflow-hidden mt-6">
        {sales.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-center px-4">
            <div className="w-16 h-16 bg-white/5 rounded-full flex items-center justify-center mb-6 border border-white/10">
              <Info className="w-6 h-6 text-cyan-400/50" />
            </div>
            <h3 className="text-xl font-serif font-bold text-white mb-2">Sin ventas registradas</h3>
            <p className="text-white/40 text-sm max-w-sm">
              En el momento no se han hecho ventas o despachos bajo tu gestión.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm whitespace-nowrap">
              <thead className="bg-white/5 border-b border-white/10 font-sans text-xs uppercase tracking-widest text-white/50">
                <tr>
                  <th className="px-6 py-4 font-semibold">ID Pedido</th>
                  <th className="px-6 py-4 font-semibold">Fecha</th>
                  <th className="px-6 py-4 font-semibold">Cliente</th>
                  <th className="px-6 py-4 font-semibold">Estado</th>
                  <th className="px-6 py-4 font-semibold text-right">Total</th>
                  <th className="px-6 py-4 font-semibold">Detalle de Artículos</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {sales.map((order) => (
                  <tr key={order.id} className="hover:bg-white/[0.02] transition-colors">
                    <td className="px-6 py-4 font-mono text-xs text-white/60">
                      {order.id.slice(0, 8)}...
                    </td>
                    <td className="px-6 py-4 text-white/80">
                      {new Date(order.createdAt).toLocaleDateString('es-CO')}
                    </td>
                    <td className="px-6 py-4">
                      <div className="font-bold text-white">{order.customerName}</div>
                      <div className="text-xs text-white/40">{order.customerEmail}</div>
                    </td>
                    <td className="px-6 py-4">
                      {order.status === '5' ? (
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold tracking-widest uppercase bg-emerald-500/10 text-emerald-500 border border-emerald-500/20">
                          <CheckCheck className="w-3 h-3" /> Entregado
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold tracking-widest uppercase bg-purple-500/10 text-purple-500 border border-purple-500/20">
                          <Truck className="w-3 h-3" /> Enviado
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4 text-right font-bold text-white text-base">
                      {formatCOP(order.totalAmount)}
                    </td>
                    <td className="px-6 py-4 text-xs text-white/60">
                      <div className="flex flex-col gap-1 max-w-[200px]">
                        {order.items.map((item, i) => (
                          <div key={i} className="truncate" title={item.productName}>
                            {item.quantity}x {item.productName}
                          </div>
                        ))}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default SellerSales;
