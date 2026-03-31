import React from 'react';
import { motion } from 'framer-motion';

interface StatsCardProps {
  label: string;
  value: string | number;
  icon: React.ElementType;
  trend?: {
    value: number; // percentage
    isPositive: boolean;
  };
  delay?: number;
}

const StatsCard: React.FC<StatsCardProps> = ({ label, value, icon: Icon, trend, delay = 0 }) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay, duration: 0.3 }}
      className="admin-card flex items-start justify-between group"
    >
      <div>
        <h3 className="text-[10px] font-bold tracking-[0.15em] uppercase text-white/40 mb-2">
          {label}
        </h3>
        <p className="text-3xl font-serif font-bold text-manchester-gold tracking-tighter">
          {value}
        </p>

        {trend && (
          <p className="mt-3 text-xs flex items-center gap-1 font-medium">
            <span className={trend.isPositive ? 'text-emerald-400' : 'text-red-400'}>
              {trend.isPositive ? '+' : '-'}{Math.abs(trend.value)}%
            </span>
            <span className="text-white/30">vs mes anterior</span>
          </p>
        )}
      </div>

      <div className="w-10 h-10 rounded-xl bg-white/[0.03] flex items-center justify-center text-white/30 transition-colors group-hover:bg-manchester-gold/10 group-hover:text-manchester-gold">
        <Icon className="w-5 h-5" />
      </div>
    </motion.div>
  );
};

export default StatsCard;
