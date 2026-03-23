import React from 'react';
import { X, Minus, Plus, ShoppingBag, Trash2, ArrowRight, Loader2 } from 'lucide-react';
import { useCartStore } from '../store/useCartStore';
import { useAuthStore } from '../store/useAuthStore';
import { useNavigate } from 'react-router-dom';
import { orderService } from '../api/services';
import { motion, AnimatePresence } from 'framer-motion';
import toast from 'react-hot-toast';

interface CartProps {
  isOpen: boolean;
  onClose: () => void;
}

const Cart: React.FC<CartProps> = ({ isOpen, onClose }) => {
  const { items, removeItem, updateQuantity, totalPrice, totalItems, clearCart } = useCartStore();
  const { isAuthenticated } = useAuthStore();
  const navigate = useNavigate();
  const [isCheckingOut, setIsCheckingOut] = React.useState(false);

  const handleCheckout = async () => {
    if (!isAuthenticated) {
      onClose();
      navigate('/login');
      return;
    }

    setIsCheckingOut(true);
    try {
      await orderService.createOrder();
      await clearCart();
      onClose();
      toast.success('PEDIDO PROCESADO EXITOSAMENTE', { 
        icon: '✨',
        style: {
          background: '#D4AF37',
          color: '#000',
          fontWeight: 'bold',
          letterSpacing: '0.1em'
        }
      });
      navigate('/orders');
    } catch (error) {
      console.error('Error during checkout:', error);
      toast.error('Error al procesar el pedido. Por favor intenta de nuevo.');
    } finally {
      setIsCheckingOut(false);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-manchester-black/80 backdrop-blur-sm z-[100]"
          />

          {/* Drawer */}
          <motion.div
            role="dialog"
            aria-modal="true"
            aria-labelledby="cart-title"
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            className="fixed right-0 top-0 h-full w-full max-w-md bg-manchester-dark shadow-2xl z-[101] flex flex-col"
          >
            {/* Header */}
            <div className="p-6 border-b border-white/5 flex justify-between items-center">
              <div>
                <h2 id="cart-title" className="text-xl font-bold tracking-tighter">CESTA DE COMPRA</h2>
                <p className="text-[10px] text-white/30 uppercase tracking-[0.2em] mt-1 font-bold">
                   {totalItems()} ARTÍCULOS SELECCIONADOS
                </p>
              </div>
              <button onClick={onClose} aria-label="Cerrar Carrito" className="p-2 hover:bg-white/5 rounded-full transition-colors">
                <X className="w-6 h-6" />
              </button>
            </div>

            {/* Items List */}
            <div className="flex-grow overflow-y-auto p-6 space-y-6">
              {items.length > 0 ? (
                items.map((item) => (
                  <div key={item.id} className="flex space-x-4 group">
                    <div className="h-24 w-20 bg-manchester-black rounded-lg overflow-hidden shrink-0 border border-white/5">
                      <img src={item.imageUrl || 'https://images.unsplash.com/photo-1552374196-1ab2a1c593e8?q=80&w=1000&auto=format&fit=crop'} alt={item.name} className="w-full h-full object-cover" />
                    </div>
                    <div className="flex-grow">
                      <div className="flex justify-between mb-1">
                        <h4 className="font-bold text-sm tracking-tight group-hover:text-manchester-gold transition-colors">{item.name}</h4>
                        <button onClick={() => removeItem(item.id)} aria-label={`Eliminar ${item.name} del carrito`} className="text-white/20 hover:text-red-500 transition-colors">
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                      <p className="text-[10px] text-white/30 uppercase tracking-widest mb-3 font-bold">{item.category}</p>
                      
                      <div className="flex justify-between items-center">
                        <div className="flex items-center space-x-3 bg-manchester-black rounded-full px-3 py-1 border border-white/5">
                          <button onClick={() => updateQuantity(item.id, item.quantity - 1)} aria-label={`Disminuir cantidad de ${item.name}`} className="text-white/40 hover:text-white transition-colors">
                            <Minus className="w-3 h-3" />
                          </button>
                          <span className="text-xs font-bold w-4 text-center">{item.quantity}</span>
                          <button 
                            onClick={() => {
                              if (item.quantity >= item.stock) {
                                toast.error(`Stock máximo (${item.stock}) alcanzado para este producto`, {
                                  style: { background: '#222', color: '#fff', fontSize: '12px' }
                                });
                              } else {
                                updateQuantity(item.id, item.quantity + 1);
                              }
                            }} 
                            aria-label={`Aumentar cantidad de ${item.name}`}
                            className={`transition-colors ${item.quantity >= item.stock ? 'text-white/10 cursor-not-allowed' : 'text-white/40 hover:text-white'}`}
                          >
                            <Plus className="w-3 h-3" />
                          </button>
                        </div>
                        <span className="font-bold text-sm">${(item.price * item.quantity).toLocaleString()}</span>
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="h-full flex flex-col items-center justify-center text-center">
                  <div className="w-16 h-16 bg-white/5 rounded-full flex items-center justify-center mb-6">
                    <ShoppingBag className="w-8 h-8 text-white/20" />
                  </div>
                  <h3 className="text-lg font-bold mb-2 uppercase tracking-tighter">Tu cesta está vacía</h3>
                  <p className="text-white/30 text-xs max-w-[200px] leading-relaxed italic">Tu selección Manchester aparecerá aquí. Empieza a comprar hoy.</p>
                  <button onClick={onClose} className="btn-gold mt-8 w-full text-xs tracking-widest py-3">EXPLORAR TIENDA</button>
                </div>
              )}
            </div>

            {/* Footer / Summary */}
            {items.length > 0 && (
              <div className="p-8 border-t border-white/5 bg-manchester-black/50 space-y-6">
                <div className="space-y-2">
                  <div className="flex justify-between text-xs text-white/40 font-bold tracking-widest uppercase">
                    <span>Subtotal</span>
                    <span className="text-white">${totalPrice().toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between text-xs text-white/40 font-bold tracking-widest uppercase">
                    <span>Envío</span>
                    <span className="text-white">Gratis</span>
                  </div>
                  <div className="flex justify-between pt-4 text-xl font-bold tracking-tighter">
                    <span>TOTAL</span>
                    <span className="text-manchester-gold">${totalPrice().toLocaleString()}</span>
                  </div>
                </div>
                
                <button 
                  onClick={handleCheckout}
                  disabled={isCheckingOut}
                  className="btn-blue w-full py-5 font-bold tracking-[0.2em] text-sm flex items-center justify-center group disabled:opacity-50"
                >
                  {isCheckingOut ? (
                    <Loader2 className="w-4 h-4 animate-spin mr-2" />
                  ) : null}
                  {isAuthenticated ? 'FINALIZAR PEDIDO' : 'INICIAR SESIÓN PARA COMPRAR'} 
                  {!isCheckingOut && <ArrowRight className="ml-2 w-4 h-4 group-hover:translate-x-1 transition-transform" />}
                </button>
                <p className="text-center text-[10px] text-white/20 font-bold tracking-widest uppercase">Pagos Seguros Manchester • IVA Incluido</p>
              </div>
            )}
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

export default Cart;
