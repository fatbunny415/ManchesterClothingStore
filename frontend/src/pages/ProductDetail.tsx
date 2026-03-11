import React, { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { ShoppingCart, ArrowLeft, ShieldCheck, Truck, RotateCcw, Loader2, Star, Check } from 'lucide-react';
import { productService } from '../api/services';
import { Product } from '../types';
import { useCartStore } from '../store/useCartStore';
import { motion } from 'framer-motion';

const ProductDetail = () => {
  const { id } = useParams<{ id: string }>();
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [adding, setAdding] = useState(false);
  const [added, setAdded] = useState(false);

  const addItem = useCartStore(state => state.addItem);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchProduct = async () => {
      if (!id) return;
      try {
        const data = await productService.getById(id);
        setProduct(data);
      } catch (error) {
        console.error("Error fetching product", error);
      } finally {
        setLoading(false);
      }
    };
    fetchProduct();
  }, [id]);

  const handleAddToCart = () => {
    if (!product) return;
    setAdding(true);
    addItem(product);
    
    setTimeout(() => {
      setAdding(false);
      setAdded(true);
      setTimeout(() => setAdded(false), 2000);
    }, 600);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-manchester-black">
        <Loader2 className="w-10 h-10 text-manchester-gold animate-spin" />
      </div>
    );
  }

  if (!product) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-manchester-black text-center px-4">
        <h2 className="text-3xl font-bold mb-4">PRODUCTO NO ENCONTRADO</h2>
        <Link to="/shop" className="btn-gold">VOLVER A LA TIENDA</Link>
      </div>
    );
  }

  return (
    <div className="pt-32 pb-24 bg-manchester-black min-h-screen">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <Link to="/shop" className="inline-flex items-center text-white/40 hover:text-white mb-12 transition-colors text-xs font-bold tracking-widest uppercase">
          <ArrowLeft className="w-4 h-4 mr-2" /> VOLVER AL CATÁLOGO
        </Link>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16">
          {/* Product Image */}
          <motion.div 
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="relative rounded-3xl overflow-hidden bg-manchester-dark aspect-square lg:aspect-[4/5]"
          >
            <img 
              src={product.imageUrl || 'https://images.unsplash.com/photo-1552374196-1ab2a1c593e8?q=80&w=1000&auto=format&fit=crop'} 
              alt={product.name} 
              className="w-full h-full object-cover"
            />
          </motion.div>

          {/* Product Info */}
          <motion.div 
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="flex flex-col"
          >
            <div className="mb-8">
              <span className="text-manchester-gold font-bold tracking-[0.3em] text-[10px] uppercase mb-4 block">
                {product.category}
              </span>
              <h1 className="text-4xl md:text-5xl font-bold tracking-tighter mb-4">{product.name}</h1>
              <div className="flex items-center space-x-4 mb-6">
                <span className="text-3xl font-bold text-manchester-white">${product.price.toLocaleString()}</span>
                {product.stock > 0 ? (
                  <span className="bg-green-500/10 text-green-500 text-[10px] font-bold px-3 py-1 rounded-full uppercase tracking-widest">
                    EN STOCK
                  </span>
                ) : (
                  <span className="bg-red-500/10 text-red-500 text-[10px] font-bold px-3 py-1 rounded-full uppercase tracking-widest">
                    AGOTADO
                  </span>
                )}
              </div>
              <p className="text-white/50 leading-relaxed text-lg font-light italic">
                "{product.description}"
              </p>
            </div>

            <div className="space-y-8 mb-12">
              <div className="bg-manchester-dark/50 p-6 rounded-2xl border border-white/5">
                <h4 className="text-xs font-bold tracking-widest text-manchester-gold uppercase mb-4 flex items-center">
                  <Star className="w-4 h-4 mr-2" /> DETALLES DEL PRODUCTO
                </h4>
                <p className="text-white/40 text-sm leading-relaxed">
                  Esta pieza ha sido diseñada con un enfoque en la durabilidad y la elegancia. Fabricada con materiales premium seleccionados para ofrecer una experiencia de uso inigualable.
                </p>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="flex items-center text-xs text-white/50 tracking-widest font-medium">
                  <ShieldCheck className="w-5 h-5 mr-3 text-manchester-gold" /> AUTENTICIDAD MANCHESTER
                </div>
                <div className="flex items-center text-xs text-white/50 tracking-widest font-medium">
                  <Truck className="w-5 h-5 mr-3 text-manchester-gold" /> ENVÍO EXPRESS GLOBAL
                </div>
              </div>
            </div>

            <button 
              onClick={handleAddToCart}
              disabled={product.stock <= 0 || adding || !product.isActive}
              className={`w-full py-5 rounded-full font-bold tracking-[0.2em] text-sm flex items-center justify-center transition-all duration-300 ${
                added 
                  ? 'bg-green-500 text-white' 
                  : (product.stock <= 0 || !product.isActive)
                    ? 'bg-white/5 text-white/20 cursor-not-allowed'
                //   ? 'bg-white/5 text-white/20 cursor-not-allowed'
                //   : 'bg-manchester-white text-manchester-black hover:bg-manchester-blue hover:text-manchester-white shadow-xl shadow-manchester-blue/10'
                // : 'bg-manchester-white text-manchester-black hover:bg-manchester-blue hover:text-manchester-white shadow-xl shadow-manchester-blue/10'
                : 'bg-manchester-white text-manchester-black hover:bg-manchester-blue hover:text-manchester-white shadow-xl shadow-manchester-blue/10'
              }`}
            >
              {adding ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : added ? (
                <><Check className="w-5 h-5 mr-2" /> AÑADIDO A LA CESTA</>
              ) : (product.stock <= 0 || !product.isActive) ? (
                'PRODUCTO AGOTADO'
              ) : (
                <><ShoppingCart className="w-5 h-5 mr-2" /> AÑADIR A LA CESTA</>
              )}
            </button>
            
            <p className="text-center text-white/20 text-[10px] uppercase font-bold tracking-widest mt-6">
              IVA Incluido • Devoluciones gratuitas en 30 días
            </p>
          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default ProductDetail;
