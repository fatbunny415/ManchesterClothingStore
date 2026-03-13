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

      {/* ══════════════════════════════════════
          HERO SECTION
      ══════════════════════════════════════ */}
      <section className="relative h-screen flex items-center justify-center overflow-hidden">

        {/* Overlay negro profundo — 55% */}
        <div className="absolute inset-0 bg-gradient-to-b from-manchester-black/70 via-manchester-black/45 to-manchester-black z-10" />

        {/* Hero Image con zoom lento */}
        <img
          src="https://images.unsplash.com/photo-1490481651871-ab68de25d43d?q=80&w=2070&auto=format&fit=crop"
          alt="Manchester Hero"
          className="hero-img absolute inset-0 w-full h-full object-cover"
        />

        {/* Hero Content */}
        <div className="relative z-20 text-center px-4 max-w-4xl mx-auto">

          {/* Etiqueta de colección */}
          <motion.span
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.9, ease: "easeOut" }}
            className="inline-flex items-center gap-3 text-manchester-gold font-sans font-medium tracking-[0.35em] text-xs mb-8 uppercase"
          >
            <span className="w-8 h-[1px] bg-manchester-gold/60 inline-block" />
            Nueva Colección 2026
            <span className="w-8 h-[1px] bg-manchester-gold/60 inline-block" />
          </motion.span>

          {/* Título serif premium */}
          <motion.h1
            initial={{ opacity: 0, y: 36 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.9, delay: 0.2, ease: "easeOut" }}
            className="font-serif text-6xl md:text-9xl font-bold leading-[1.1] mb-8 text-manchester-white pr-4"
          >
            Esencia<br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-manchester-white via-manchester-gold to-manchester-white italic pb-2 inline-block pr-6">
              Manchester
            </span>
          </motion.h1>

          {/* Subtítulo */}
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 1.1, delay: 0.5 }}
            className="font-sans text-white/55 text-base md:text-lg font-light mb-14 max-w-xl mx-auto leading-relaxed tracking-wide"
          >
            Piezas atemporales diseñadas para quienes valoran la distinción,
            la calidad y el diseño minimalista de vanguardia.
          </motion.p>

          {/* CTAs */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.9, delay: 0.8 }}
            className="flex flex-col sm:flex-row items-center justify-center gap-5"
          >
            {/* Botón principal — ahora outline blanco */}
            <Link
              to="/shop"
              className="btn-secondary px-10 py-4 text-xs tracking-[0.2em] flex items-center gap-3 group"
            >
              Mi tienda
              <ArrowRight className="w-4 h-4 transform group-hover:translate-x-1 transition-transform" />
            </Link>

            {/* Botón secundario — ahora dorado */}
            <Link
              to="/register"
              className="btn-primary px-10 py-4 text-xs tracking-[0.2em] shadow-lg shadow-manchester-gold/20"
            >
              Registro
            </Link>
          </motion.div>
        </div>

        {/* Scroll Indicator — línea animada */}
        <motion.div
          animate={{ y: [0, 12, 0] }}
          transition={{ repeat: Infinity, duration: 2.4, ease: "easeInOut" }}
          className="absolute bottom-10 left-1/2 -translate-x-1/2 z-20 hidden md:flex flex-col items-center gap-2"
        >
          <span className="font-sans text-[10px] tracking-[0.3em] text-white/30 uppercase">Scroll</span>
          <div className="w-[1px] h-14 bg-gradient-to-b from-manchester-gold to-transparent" />
        </motion.div>
      </section>

      {/* ══════════════════════════════════════
          CATEGORIES SECTION
      ══════════════════════════════════════ */}
      <section className="py-28 bg-manchester-black px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">

          {/* Heading */}
          <div className="text-center mb-16">
            <span className="font-sans text-manchester-gold tracking-[0.3em] text-xs uppercase font-medium">Explorar</span>
            <h2 className="font-serif text-4xl md:text-5xl font-bold mt-3 text-manchester-white">Colecciones</h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              { title: 'Superior',   img: 'https://images.unsplash.com/photo-1516259762381-22954d7d3ad2?q=80&w=2066&auto=format&fit=crop', link: '/superior' },
              { title: 'Inferior',   img: 'https://images.unsplash.com/photo-1483985988355-763728e1935b?q=80&w=2070&auto=format&fit=crop', link: '/inferior' },
              { title: 'Calzado',    img: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?q=80&w=1999&auto=format&fit=crop', link: '/calzado' },
              { title: 'Accesorios', img: 'https://images.unsplash.com/photo-1611082500052-7e77d9c6e3b0?q=80&w=1974&auto=format&fit=crop', link: '/accesorios' }
            ].map((cat, i) => (
              <motion.div
                key={i}
                whileHover={{ scale: 0.99 }}
                transition={{ duration: 0.4 }}
                className="relative h-[540px] rounded-2xl overflow-hidden group cursor-pointer"
              >
                <img
                  src={cat.img}
                  alt={cat.title}
                  className="absolute inset-0 w-full h-full object-cover transition-transform duration-[1200ms] ease-out group-hover:scale-110"
                />
                {/* Overlay gradiente bottom-up */}
                <div className="absolute inset-0 bg-gradient-to-t from-manchester-black/80 via-manchester-black/20 to-transparent transition-all duration-500" />

                <div className="absolute bottom-0 left-0 right-0 p-8 z-10">
                  <h3 className="font-serif text-2xl font-bold text-manchester-white mb-3 tracking-wide">{cat.title}</h3>
                  <Link
                    to={cat.link}
                    className="inline-flex items-center gap-2 text-manchester-gold text-xs font-sans font-semibold tracking-[0.2em] uppercase opacity-0 group-hover:opacity-100 translate-y-2 group-hover:translate-y-0 transition-all duration-300"
                  >
                    Comprar Ahora <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                  {/* Línea decorativa */}
                  <div className="h-[1px] w-0 bg-manchester-gold group-hover:w-full transition-all duration-500 ease-out mt-4" />
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════
          FEATURED PRODUCTS
      ══════════════════════════════════════ */}
      <section className="py-28 bg-manchester-dark px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col md:flex-row justify-between items-end mb-16 gap-6">
            <div>
              <span className="font-sans text-manchester-gold font-medium tracking-[0.3em] text-xs uppercase mb-3 block">Seleccionados para ti</span>
              <h2 className="font-serif text-4xl md:text-5xl font-bold text-manchester-white">Más Vendidos</h2>
            </div>
            <Link
              to="/shop"
              className="font-sans text-white/40 hover:text-manchester-gold transition-colors flex items-center gap-2 text-xs font-medium tracking-[0.2em] uppercase border-b border-white/10 hover:border-manchester-gold/40 pb-2 transition-all"
            >
              Ver Todos <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {loading ? (
              [...Array(4)].map((_, i) => (
                <div key={i} className="animate-pulse bg-white/5 h-[420px] rounded-2xl" />
              ))
            ) : (
              featuredProducts.map(product => (
                <ProductCard key={product.id} product={product} />
              ))
            )}
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════
          WHY MANCHESTER
      ══════════════════════════════════════ */}
      <section className="py-28 bg-manchester-black px-4 sm:px-6 lg:px-8 border-y border-white/5">
        <div className="max-w-7xl mx-auto">

          {/* Eyebrow */}
          <div className="text-center mb-20">
            <span className="font-sans text-manchester-gold tracking-[0.3em] text-xs uppercase font-medium">Nuestra promesa</span>
            <h2 className="font-serif text-3xl md:text-4xl font-bold mt-3 text-manchester-white">Por qué Manchester</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-12 text-center">
            {[
              {
                icon: <ShieldCheck className="w-7 h-7 text-manchester-gold" />,
                title: "Garantía de Calidad",
                text: "Seleccionamos los mejores materiales del mundo para asegurar que cada prenda sea una inversión de por vida."
              },
              {
                icon: <Truck className="w-7 h-7 text-manchester-gold" />,
                title: "Envío Global Premium",
                text: "Logística de clase mundial con seguimiento en tiempo real y empaque sustentable de lujo."
              },
              {
                icon: <Star className="w-7 h-7 text-manchester-gold" />,
                title: "Soporte Exclusivo",
                text: "Asistencia personalizada 24/7 para todos los miembros de la comunidad Manchester."
              }
            ].map((item, i) => (
              <div key={i} className="flex flex-col items-center group">
                <div className="h-16 w-16 bg-white/5 border border-white/5 group-hover:border-manchester-gold/30 rounded-full flex items-center justify-center mb-8 transition-all duration-500 group-hover:bg-manchester-gold/5">
                  {item.icon}
                </div>
                <h4 className="font-serif text-xl font-semibold mb-4 text-manchester-white">{item.title}</h4>
                <p className="font-sans text-white/35 text-sm leading-relaxed max-w-xs">{item.text}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

    </div>
  );
};

export default Home;
