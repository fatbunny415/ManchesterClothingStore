import React from 'react';
import { motion } from 'framer-motion';
import { ArrowLeft } from 'lucide-react';
import { Link, useLocation } from 'react-router-dom';

const PlaceholderPage = () => {
  const location = useLocation();
  const path = location.pathname.substring(1); // Remove leading slash
  
  // Format the title based on the path
  const title = path === 'envios' ? 'Envíos y Devoluciones' : 
                path === 'tallas' ? 'Guía de Tallas' : 
                path === 'soporte' ? 'Soporte Técnico' : 
                path === 'contacto' ? 'Contacto' : 
                path.charAt(0).toUpperCase() + path.slice(1);

  return (
    <div className="pt-32 pb-24 min-h-[70vh] flex items-center justify-center container mx-auto px-4">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-2xl text-center space-y-8"
      >
        <span className="text-manchester-gold font-bold tracking-[0.3em] uppercase text-xs">
          Construyendo...
        </span>
        <h1 className="text-5xl md:text-6xl font-serif font-bold tracking-tighter">
          {title}
        </h1>
        <p className="text-white/50 text-lg md:text-xl font-sans max-w-lg mx-auto leading-relaxed">
          Estamos preparando los detalles de esta sección para ofrecerte la mejor experiencia MÁNCHESTER. Vuelve pronto.
        </p>
        
        <div className="pt-8 flex justify-center">
          <Link 
            to="/"
            className="flex items-center gap-3 text-sm font-bold uppercase tracking-widest text-white hover:text-manchester-gold transition-colors"
          >
            <ArrowLeft className="w-4 h-4" /> Volver al Inicio
          </Link>
        </div>
      </motion.div>
    </div>
  );
};

export default PlaceholderPage;
