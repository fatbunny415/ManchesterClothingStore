import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { orderService } from '../api/services';
import { formatCOP } from '../utils/formatCurrency';
import { CheckCircle2, Copy, FileText, ArrowLeft, Package, Clock, Truck, CheckCheck, MapPin } from 'lucide-react';
import toast from 'react-hot-toast';

interface OrderDetail {
  id: string;
  status: string;
  totalAmount: number;
  createdAt: string;
  items: Array<{
    productId: string;
    productName: string;
    productImageUrl: string;
    quantity: number;
    unitPrice: number;
    lineTotal: number;
  }>;
}

const ORDER_STATUS_MAP: Record<string, { label: string, icon: any, color: string }> = {
  '1': { label: 'Pendiente', icon: Clock, color: 'text-yellow-500' },
  '2': { label: 'Pagado', icon: CheckCircle2, color: 'text-blue-500' },
  '3': { label: 'En Preparación', icon: Package, color: 'text-orange-500' },
  '4': { label: 'Enviado', icon: Truck, color: 'text-purple-500' },
  '5': { label: 'Entregado', icon: CheckCheck, color: 'text-emerald-500' },
  '6': { label: 'Cancelado', icon: CheckCircle2, color: 'text-red-500' }, // Reusing an icon for ban/cancelled usually
};

const OrderConfirmation: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [order, setOrder] = useState<OrderDetail | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchOrder = async () => {
      try {
        if (!id) return;
        const data = await orderService.getById(id);
        setOrder(data);
      } catch (error) {
        console.error("Error fetching order:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchOrder();
  }, [id]);

  const copyOrderId = () => {
    if (order?.id) {
      navigator.clipboard.writeText(order.id);
      toast.success('ID de pedido copiado');
    }
  };

  if (loading) {
    return (
      <div className="min-h-[70vh] flex flex-col items-center justify-center">
        <div className="w-12 h-12 border-4 border-manchester-gold border-t-transparent rounded-full animate-spin"></div>
        <p className="mt-4 text-manchester-gold text-xs font-bold tracking-widest uppercase">Cargando pedido...</p>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24 text-center">
        <h2 className="text-3xl font-serif mb-4 text-white">Pedido no encontrado</h2>
        <p className="text-white/60 mb-8 max-w-md mx-auto">No pudimos encontrar los detalles del pedido solicitado. Verifique el enlace o contacte a soporte si el problema persiste.</p>
        <Link to="/shop" className="btn-primary inline-flex items-center gap-2">
          Volver a la tienda
        </Link>
      </div>
    );
  }

  const StatusIcon = ORDER_STATUS_MAP[order.status]?.icon || Clock;
  const statusColor = ORDER_STATUS_MAP[order.status]?.color || 'text-white/50';

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
      
      {/* HEADER: Thank You */}
      <div className="text-center mb-12">
        <div className="w-20 h-20 bg-manchester-gold/10 rounded-full flex items-center justify-center mx-auto mb-6">
          <CheckCircle2 className="w-10 h-10 text-manchester-gold" />
        </div>
        <h1 className="text-4xl md:text-5xl font-serif font-bold text-white mb-4 tracking-tight">¡Gracias por tu compra!</h1>
        <p className="text-white/60 text-lg">Tu pedido ha sido registrado correctamente y lo estamos preparando.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        
        {/* Main Content: Order details & Items */}
        <div className="md:col-span-2 space-y-6">
          
          {/* Order Info Card */}
          <div className="card-premium p-6 sm:p-8 relative overflow-hidden group">
            {/* Background Accent */}
            <div className="absolute top-0 right-0 w-32 h-32 bg-manchester-gold/5 rounded-bl-full -mr-8 -mt-8 transition-transform group-hover:scale-110"></div>
            
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8 relative z-10">
              <div>
                <span className="text-[10px] text-manchester-gold tracking-[0.2em] font-bold uppercase block mb-2">
                  Detalles del Pedido
                </span>
                <div className="flex items-center gap-3">
                  <h2 className="text-xl sm:text-2xl font-medium text-white break-all">#{order.id.split('-')[0]}...</h2>
                  <button 
                    onClick={copyOrderId}
                    className="p-1.5 bg-white/5 hover:bg-manchester-gold/20 text-white/40 hover:text-manchester-gold transition-colors rounded-lg flex-shrink-0"
                    title="Copiar ID completo"
                  >
                    <Copy className="w-4 h-4" />
                  </button>
                </div>
              </div>

              <div className={`px-4 py-2 bg-white/5 border border-white/10 rounded-full flex items-center gap-2 ${statusColor}`}>
                <StatusIcon className="w-4 h-4" />
                <span className="text-xs font-bold uppercase tracking-widest">{ORDER_STATUS_MAP[order.status]?.label || 'Desconocido'}</span>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-6 relative z-10">
              <div>
                <p className="text-[10px] text-white/40 uppercase tracking-wider mb-1">Fecha de Compra</p>
                <p className="text-sm text-white font-medium">{new Date(order.createdAt).toLocaleString()}</p>
              </div>
              <div>
                <p className="text-[10px] text-white/40 uppercase tracking-wider mb-1">Total</p>
                <p className="text-lg text-manchester-gold font-bold">{formatCOP(order.totalAmount)}</p>
              </div>
            </div>
          </div>

          {/* Items List */}
          <div className="card-premium p-6 sm:p-8">
            <h3 className="text-sm font-bold tracking-widest text-white/50 uppercase mb-6 flex items-center gap-2">
              <Package className="w-4 h-4" /> Artículos ({order.items.reduce((acc, i) => acc + i.quantity, 0)})
            </h3>
            
            <div className="space-y-4">
              {order.items.map((item) => (
                <div key={item.productId} className="flex items-center gap-4 p-4 rounded-xl border border-white/5 bg-white/[0.02]">
                  <div className="w-16 h-16 sm:w-20 sm:h-20 bg-black/50 rounded-lg overflow-hidden flex-shrink-0 border border-white/10">
                    {item.productImageUrl ? (
                      <img src={item.productImageUrl} alt={item.productName} className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <Package className="w-6 h-6 text-white/20" />
                      </div>
                    )}
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <h4 className="text-sm sm:text-base font-semibold text-white truncate">{item.productName}</h4>
                    <p className="text-xs text-white/50 mt-1">
                      {item.quantity} x {formatCOP(item.unitPrice)}
                    </p>
                  </div>
                  
                  <div className="text-right">
                    <p className="text-sm sm:text-base font-bold text-manchester-gold">
                      {formatCOP(item.lineTotal)}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>

        </div>

        {/* Sidebar: Next steps / Info */}
        <div className="space-y-6">
          <div className="card-premium p-6">
            <h3 className="text-sm font-bold tracking-widest text-white/50 uppercase mb-4 flex items-center gap-2">
              <FileText className="w-4 h-4" /> ¿Qué Sigue?
            </h3>
            <ul className="space-y-4 text-sm text-white/70">
              <li className="flex items-start gap-3">
                <div className="w-6 h-6 rounded-full bg-manchester-gold/10 flex items-center justify-center flex-shrink-0 mt-0.5">
                  <span className="text-manchester-gold font-bold text-xs">1</span>
                </div>
                <p>Verificaremos tu pago a la mayor brevedad posible.</p>
              </li>
              <li className="flex items-start gap-3">
                <div className="w-6 h-6 rounded-full bg-manchester-gold/10 flex items-center justify-center flex-shrink-0 mt-0.5">
                  <span className="text-manchester-gold font-bold text-xs">2</span>
                </div>
                <p>Comenzaremos a preparar tus prendas exclusivas con mucho cuidado.</p>
              </li>
              <li className="flex items-start gap-3">
                <div className="w-6 h-6 rounded-full bg-manchester-gold/10 flex items-center justify-center flex-shrink-0 mt-0.5">
                  <span className="text-manchester-gold font-bold text-xs">3</span>
                </div>
                <p>Recibirás un correo cuando el paquete se entregue a la transportadora.</p>
              </li>
            </ul>
          </div>
          
          <Link to="/orders" className="btn-secondary w-full flex items-center justify-center gap-2 opacity-80 hover:opacity-100">
            Ver mis pedidos <ArrowLeft className="w-4 h-4 rotate-180" />
          </Link>
        </div>

      </div>
    </div>
  );
};

export default OrderConfirmation;
