import React from 'react';
import { motion } from 'framer-motion';
import { BarChart3, UserCircle, Wrench } from 'lucide-react';
import { useLocation } from 'react-router-dom';

const SellerPlaceholder = () => {
  const location = useLocation();
  const isStats = location.pathname.includes('stats');

  return (
    <div className="min-h-full flex items-center justify-center p-8">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-md w-full bg-manchester-dark border border-white/5 rounded-3xl p-12 text-center"
      >
        <div className="w-20 h-20 bg-manchester-black border border-white/10 rounded-full flex items-center justify-center mx-auto mb-6">
          {isStats ? (
            <BarChart3 className="w-8 h-8 text-cyan-400" />
          ) : (
            <UserCircle className="w-8 h-8 text-cyan-400" />
          )}
        </div>
        
        <h2 className="text-2xl font-serif font-bold text-white mb-3 tracking-tight">
          {isStats ? 'Estadísticas' : 'Perfil de Vendedor'}
        </h2>
        
        <p className="text-white/40 text-sm font-sans mb-8 leading-relaxed">
          Esta sección se encuentra en desarrollo. Pronto podrás visualizar y gestionar todos los detalles aquí.
        </p>

        <div className="inline-flex items-center gap-2 text-[10px] uppercase tracking-widest font-bold text-white/20 bg-white/5 py-2 px-4 rounded-full">
          <Wrench className="w-3 h-3" />
          En Construcción
        </div>
      </motion.div>
    </div>
  );
};

export default SellerPlaceholder;
