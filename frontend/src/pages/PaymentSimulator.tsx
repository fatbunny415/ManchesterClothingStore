import React, { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { orderService } from '../api/services';
import { formatCOP } from '../utils/formatCurrency';
import { CreditCard, Lock, CheckCircle2, Loader2, AlertCircle, ArrowRight } from 'lucide-react';
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

const PaymentSimulator: React.FC = () => {
  const { orderId } = useParams<{ orderId: string }>();
  const navigate = useNavigate();
  
  const [order, setOrder] = useState<OrderDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [confirming, setConfirming] = useState(false);
  const [showDetails, setShowDetails] = useState(false);

  // Formulario simulado
  const [cardNumber, setCardNumber] = useState('4111111111111111');
  const [cardName, setCardName] = useState('MANCHESTER USER');
  const [expiry, setExpiry] = useState('12/28');
  const [cvv, setCvv] = useState('123');

  useEffect(() => {
    const fetchOrder = async () => {
      try {
        if (!orderId) return;
        const data = await orderService.getById(orderId);
        setOrder(data);
      } catch (error) {
        console.error('Error fetching order:', error);
        toast.error('No pudimos cargar los detalles del pedido');
      } finally {
        setLoading(false);
      }
    };

    fetchOrder();
  }, [orderId]);

  const handleConfirmPayment = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validar campos
    if (!cardNumber || !cardName || !expiry || !cvv) {
      toast.error('Por favor completa todos los campos');
      return;
    }

    setConfirming(true);
    try {
      // Simular delay de procesamiento de pago
      await new Promise(resolve => setTimeout(resolve, 2000));

      // Llamar al endpoint de confirmación
      const response = await orderService.confirmPayment(orderId!, 'SimulatedPayment');

      // Mostrar toast de éxito
      toast.success('¡Pago confirmado exitosamente! 🎉', {
        icon: '✨',
        style: {
          background: '#D4AF37',
          color: '#000',
          fontWeight: 'bold',
          letterSpacing: '0.1em'
        }
      });

      // Redirigir a confirmación
      setTimeout(() => {
        navigate(`/order-confirmation/${orderId}`);
      }, 500);
    } catch (error) {
      console.error('Error confirming payment:', error);
      toast.error('Error al procesar el pago. Intenta de nuevo.');
    } finally {
      setConfirming(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-[70vh] flex flex-col items-center justify-center bg-manchester-black">
        <Loader2 className="w-10 h-10 text-manchester-gold animate-spin mb-4" />
        <p className="text-white/50 text-xs tracking-widest font-bold uppercase">
          Cargando detalles del pedido...
        </p>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-24 text-center bg-manchester-black min-h-screen">
        <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
        <h2 className="text-3xl font-bold mb-4 text-white">Pedido no encontrado</h2>
        <p className="text-white/60 mb-8">No pudimos cargar los detalles de tu pedido.</p>
        <Link to="/shop" className="btn-primary inline-flex items-center gap-2">
          Volver a la tienda
        </Link>
      </div>
    );
  }

  const itemsTotal = order?.items?.reduce((sum, item) => sum + (item.quantity * item.unitPrice), 0) || 0;

  return (
    <div className="pt-32 pb-16 bg-manchester-black min-h-screen">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Header */}
        <div className="mb-12">
          <h1 className="text-5xl font-bold tracking-tighter mb-4 flex items-center gap-3">
            <CreditCard className="w-10 h-10 text-manchester-gold" />
            SIMULADOR DE PAGO
          </h1>
          <p className="text-white/50 text-sm tracking-wide uppercase">
            Confirma tu pago para proceder con el pedido
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Main: Formulario de pago */}
          <div className="lg:col-span-2">
            <div className="bg-manchester-dark/50 border border-white/5 rounded-3xl p-8">
              <h2 className="text-2xl font-bold mb-8 flex items-center gap-2">
                <Lock className="w-5 h-5 text-manchester-gold" />
                Detalles de Pago
              </h2>

              <form onSubmit={handleConfirmPayment} className="space-y-6">
                {/* Card Number */}
                <div>
                  <label className="block text-xs font-bold tracking-widest uppercase text-white/60 mb-2">
                    Número de Tarjeta
                  </label>
                  <input
                    type="text"
                    maxLength={19}
                    value={cardNumber}
                    onChange={(e) => setCardNumber(e.target.value.replace(/\s/g, ''))}
                    placeholder="4111 1111 1111 1111"
                    className="w-full bg-manchester-black/50 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-white/30 focus:border-manchester-gold focus:outline-none transition-colors"
                  />
                  <p className="text-[10px] text-white/40 mt-2">💡 Números de prueba: 4111 1111 1111 1111</p>
                </div>

                {/* Card Name */}
                <div>
                  <label className="block text-xs font-bold tracking-widest uppercase text-white/60 mb-2">
                    Titular de la Tarjeta
                  </label>
                  <input
                    type="text"
                    value={cardName}
                    onChange={(e) => setCardName(e.target.value.toUpperCase())}
                    placeholder="MANCHESTER USER"
                    className="w-full bg-manchester-black/50 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-white/30 focus:border-manchester-gold focus:outline-none transition-colors uppercase"
                  />
                </div>

                {/* Expiry & CVV */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold tracking-widest uppercase text-white/60 mb-2">
                      Vencimiento (MM/YY)
                    </label>
                    <input
                      type="text"
                      maxLength={5}
                      value={expiry}
                      onChange={(e) => setExpiry(e.target.value)}
                      placeholder="12/28"
                      className="w-full bg-manchester-black/50 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-white/30 focus:border-manchester-gold focus:outline-none transition-colors"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold tracking-widest uppercase text-white/60 mb-2">
                      CVV
                    </label>
                    <input
                      type="text"
                      maxLength={4}
                      value={cvv}
                      onChange={(e) => setCvv(e.target.value)}
                      placeholder="123"
                      className="w-full bg-manchester-black/50 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-white/30 focus:border-manchester-gold focus:outline-none transition-colors"
                    />
                  </div>
                </div>

                {/* Security Badge */}
                <div className="bg-green-500/10 border border-green-500/20 rounded-xl p-4 flex items-center gap-3">
                  <CheckCircle2 className="w-5 h-5 text-green-500 flex-shrink-0" />
                  <div>
                    <p className="text-xs font-bold text-green-500 uppercase tracking-widest">Conexión Segura</p>
                    <p className="text-[10px] text-green-500/70">Tus datos están protegidos con encriptación SSL 256-bit</p>
                  </div>
                </div>

                {/* Submit Button */}
                <button
                  type="submit"
                  disabled={confirming}
                  className="w-full btn-blue py-5 font-bold tracking-[0.2em] text-sm flex items-center justify-center gap-2 disabled:opacity-50 mt-8"
                >
                  {confirming ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      PROCESANDO PAGO...
                    </>
                  ) : (
                    <>
                      CONFIRMAR PAGO {formatCOP(order.totalAmount)}
                      <ArrowRight className="w-4 h-4" />
                    </>
                  )}
                </button>

                <p className="text-center text-[10px] text-white/30 font-bold tracking-widest uppercase">
                  Pagos Seguros Manchester • Simulado para Demo
                </p>
              </form>
            </div>
          </div>

          {/* Sidebar: Resumen de Orden */}
          <div className="lg:col-span-1">
            <div className="bg-manchester-dark/50 border border-white/5 rounded-3xl p-6 sticky top-32">
              <h3 className="text-lg font-bold mb-6 uppercase tracking-tighter">Resumen del Pedido</h3>

              {/* Order Info */}
              <div className="space-y-4 pb-6 border-b border-white/5">
                <div className="flex justify-between text-xs">
                  <span className="text-white/40 uppercase tracking-widest">ID Pedido</span>
                  <span className="font-mono text-white/80">{order.id.substring(0, 8)}</span>
                </div>
                <div className="flex justify-between text-xs">
                  <span className="text-white/40 uppercase tracking-widest">Fecha</span>
                  <span className="text-white/80">{new Date(order.createdAt).toLocaleDateString()}</span>
                </div>
              </div>

              {/* Items Preview */}
              <div className="mb-6">
                <button
                  type="button"
                  onClick={() => setShowDetails(!showDetails)}
                  className="text-xs font-bold tracking-widest uppercase text-manchester-gold hover:text-white transition-colors w-full text-left pb-2 border-b border-white/5"
                >
                  {showDetails ? '▼' : '▶'} Ver {order.items?.length || 0} artículos
                </button>
                {showDetails && (
                  <div className="mt-4 space-y-3">
                    {order.items?.map((item, idx) => (
                      <div key={item.productId + '-' + idx} className="text-[10px] flex justify-between">
                        <span className="text-white/60 truncate w-24">{item.productName}</span>
                        <span className="text-white/80">{item.quantity} x {formatCOP(item.unitPrice)}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Totals */}
              <div className="space-y-2 pb-6 border-b border-white/5">
                <div className="flex justify-between text-xs text-white/40 font-bold tracking-widest uppercase">
                  <span>Subtotal</span>
                  <span className="text-white">{formatCOP(itemsTotal)}</span>
                </div>
                <div className="flex justify-between text-xs text-white/40 font-bold tracking-widest uppercase">
                  <span>Envío</span>
                  <span className="text-white">Gratis</span>
                </div>
              </div>

              {/* Total */}
              <div className="flex justify-between items-center">
                <span className="text-white/40 uppercase tracking-widest text-xs font-bold">Total</span>
                <span className="text-2xl font-bold text-manchester-gold">{formatCOP(order.totalAmount)}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Info Box */}
        <div className="mt-12 bg-blue-500/5 border border-blue-500/20 rounded-3xl p-6">
          <h4 className="font-bold text-white mb-2 flex items-center gap-2 text-sm">
            ℹ️ INFORMACIÓN IMPORTANTE
          </h4>
          <p className="text-xs text-white/60 leading-relaxed">
            Este es un <strong>simulador de pago</strong> para propósitos de demostración. No realiza transacciones reales. 
            Los datos que ingreses quedarán almacenados en nuestro sistema de demostración únicamente. 
            Una vez confirmes el pago, tu pedido será marcado como "Pagado" y podrá ser gestionado en el panel de administración.
          </p>
        </div>
      </div>
    </div>
  );
};

export default PaymentSimulator;
