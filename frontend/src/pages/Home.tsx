import React, { useEffect, useState } from 'react';
import { ArrowRight, Star, ShieldCheck, Truck } from 'lucide-react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { productService } from '../api/services';
import { Product } from '../types';
import ProductCard from '../components/ProductCard';

const Home = () => {
  const [featuredProducts, setFeaturedProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const data = await productService.getAll(undefined, undefined, true);
        setFeaturedProducts(data.slice(0, 4));
      } catch (error) {
        console.error("Error fetching featured products", error);
      } finally {
        setLoading(false);
      }
    };
    fetchProducts();
  }, []);

  return (
    <div className="overflow-x-hidden">
      {/* HERO SECTION */}
      <section className="relative h-screen flex items-center justify-center overflow-hidden">
        {/* Background Overlay */}
        <div className="absolute inset-0 bg-gradient-to-b from-manchester-black/60 via-manchester-black/40 to-manchester-black z-10"></div>
        
        {/* Hero Image */}
        <img 
          src="https://images.unsplash.com/photo-1490481651871-ab68de25d43d?q=80&w=2070&auto=format&fit=crop" 
          alt="Manchester Hero" 
          className="absolute inset-0 w-full h-full object-cover scale-105"
        />

        <div className="relative z-20 text-center px-4 max-w-4xl mx-auto">
          <motion.span 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-manchester-gold font-bold tracking-[0.5em] text-sm mb-6 block uppercase"
          >
            Nueva Colección 2026
          </motion.span>
          <motion.h1 
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="text-5xl md:text-8xl font-bold tracking-tighter mb-8 text-manchester-white leading-[0.9]"
          >
            ESENCIA <br /> <span className="text-transparent bg-clip-text bg-gradient-to-r from-manchester-white via-manchester-gold to-manchester-white">MANCHESTER</span>
          </motion.h1>
          <motion.p 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 1, delay: 0.5 }}
            className="text-white/60 text-lg md:text-xl font-light mb-12 max-w-2xl mx-auto leading-relaxed"
          >
            Descubre piezas atemporales diseñadas para quienes valoran la distinción, la calidad y el diseño minimalista de vanguardia.
          </motion.p>
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.8 }}
            className="flex flex-col sm:flex-row items-center justify-center gap-6"
          >
            <Link to="/shop" className="btn-blue px-10 py-4 text-sm tracking-widest flex items-center group">
              VER TIENDA <ArrowRight className="ml-2 w-4 h-4 transform group-hover:translate-x-1 transition-transform" />
            </Link>
            <Link to="/superior" className="btn-secondary px-10 py-4 text-sm tracking-widest">
              COLECCIÓN SUPERIOR
            </Link>
          </motion.div>
        </div>

        {/* Scroll Indicator */}
        <motion.div 
          animate={{ y: [0, 10, 0] }}
          transition={{ repeat: Infinity, duration: 2 }}
          className="absolute bottom-10 left-1/2 transform -translate-x-1/2 z-20 hidden md:block"
        >
          <div className="w-[1px] h-16 bg-gradient-to-b from-manchester-gold to-transparent"></div>
        </motion.div>
      </section>

      {/* CATEGORIES SECTION */}
      <section className="py-24 bg-manchester-black px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {[
            { title: 'SUPERIOR', img: 'https://images.unsplash.com/photo-1516259762381-22954d7d3ad2?q=80&w=2066&auto=format&fit=crop', link: '/superior' },
            { title: 'INFERIOR', img: 'https://images.unsplash.com/photo-1483985988355-763728e1935b?q=80&w=2070&auto=format&fit=crop', link: '/inferior' },
            { title: 'CALZADO', img: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?q=80&w=1999&auto=format&fit=crop', link: '/calzado' }
          ].map((cat, i) => (
            <motion.div 
              key={i}
              whileHover={{ scale: 0.98 }}
              className="relative h-[600px] rounded-3xl overflow-hidden group cursor-pointer"
            >
              <img src={cat.img} alt={cat.title} className="absolute inset-0 w-full h-full object-cover transition-transform duration-1000 group-hover:scale-110" />
              <div className="absolute inset-0 bg-manchester-black/40 group-hover:bg-manchester-black/20 transition-colors"></div>
              <div className="absolute bottom-10 left-10 z-20">
                <h3 className="text-3xl font-bold tracking-tighter mb-4">{cat.title}</h3>
                <Link to={cat.link} className="flex items-center text-manchester-blue text-xs font-bold tracking-[0.2em] group-hover:gap-4 transition-all">
                  COMPRAR AHORA <ArrowRight className="ml-2 w-4 h-4" />
                </Link>
              </div>
            </motion.div>
          ))}
        </div>
      </section>

      {/* FEATURED PRODUCTS */}
      <section className="py-24 bg-manchester-dark px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col md:flex-row justify-between items-end mb-16 gap-6">
            <div>
              <span className="text-manchester-gold font-bold tracking-widest text-xs uppercase mb-4 block">Seleccionados para ti</span>
              <h2 className="text-4xl md:text-5xl font-bold tracking-tighter">MÁS VENDIDOS</h2>
            </div>
            <Link to="/shop" className="text-white/50 hover:text-white transition-colors flex items-center text-sm font-medium tracking-widest border-b border-white/10 pb-2">
              VER TODOS <ArrowRight className="ml-2 w-4 h-4" />
            </Link>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {loading ? (
              [...Array(4)].map((_, i) => (
                <div key={i} className="animate-pulse bg-white/5 h-[400px] rounded-3xl"></div>
              ))
            ) : (
              featuredProducts.map(product => (
                <ProductCard key={product.id} product={product} />
              ))
            )}
          </div>
        </div>
      </section>

      {/* WHY MANCHESTER */}
      <section className="py-24 bg-manchester-black px-4 sm:px-6 lg:px-8 border-y border-white/5">
        <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-16 text-center">
          <div className="flex flex-col items-center">
            <div className="h-16 w-16 bg-white/5 rounded-full flex items-center justify-center mb-8">
              <ShieldCheck className="w-8 h-8 text-manchester-gold" />
            </div>
            <h4 className="text-xl font-bold mb-4">Garantía de Calidad</h4>
            <p className="text-white/40 text-sm leading-relaxed">Seleccionamos los mejores materiales del mundo para asegurar que cada prenda sea una inversión de por vida.</p>
          </div>
          <div className="flex flex-col items-center">
            <div className="h-16 w-16 bg-white/5 rounded-full flex items-center justify-center mb-8">
              <Truck className="w-8 h-8 text-manchester-gold" />
            </div>
            <h4 className="text-xl font-bold mb-4">Envío Global Premium</h4>
            <p className="text-white/40 text-sm leading-relaxed">Logística de clase mundial con seguimiento en tiempo real y empaque sustentable de lujo.</p>
          </div>
          <div className="flex flex-col items-center">
            <div className="h-16 w-16 bg-white/5 rounded-full flex items-center justify-center mb-8">
              <Star className="w-8 h-8 text-manchester-gold" />
            </div>
            <h4 className="text-xl font-bold mb-4">Soporte Exclusivo</h4>
            <p className="text-white/40 text-sm leading-relaxed">Asistencia personalizada 24/7 para nuestros miembros de la comunidad Manchester.</p>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Home;
