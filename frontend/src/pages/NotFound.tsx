import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';

const NotFound = () => {
  return (
    <div className="min-h-screen bg-manchester-black flex flex-col items-center justify-center px-4 relative overflow-hidden">
      {/* Decorative large text background */}
      <h1 className="absolute text-[20vw] font-serif font-black text-white/[0.02] select-none whitespace-nowrap pointer-events-none">
        404
      </h1>

      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
        className="text-center z-10 max-w-lg"
      >
        <span className="text-manchester-gold font-sans text-xs uppercase tracking-[0.3em] font-bold mb-6 block">
          Error 404
        </span>
        <h2 className="text-4xl md:text-5xl font-serif text-manchester-white mb-6">
          Página No Encontrada
        </h2>
        <p className="text-white/50 font-sans text-sm md:text-base leading-relaxed mb-10">
          Lo sentimos, la página que buscas no existe o ha sido movida. Explora nuestras colecciones exclusivas para encontrar lo que necesitas.
        </p>
        
        <Link 
          to="/"
          className="inline-block btn-primary px-8 py-3 text-sm font-sans uppercase tracking-widest font-bold"
        >
          Volver al Inicio
        </Link>
      </motion.div>
    </div>
  );
};

export default NotFound;
