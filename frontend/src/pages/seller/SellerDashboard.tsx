import React, { useEffect, useState } from 'react';
import { ShoppingCart, Package, Truck, DollarSign, Loader2, AlertTriangle } from 'lucide-react';
import { adminOrderService } from '../../api/adminServices';
import type { AdminOrder } from '../../types';
import { formatCOP } from '../../utils/formatCurrency';
import { motion } from 'framer-motion';

interface SellerDashboardData {
  nuevosPedidos: number;
  enPreparacion: number;
  enviados: number;
  totalRecaudado: number;
}

const SellerDashboard: React.FC = () => {
  const [data, setData] = useState<SellerDashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const orders = await adminOrderService.getAll();

        const nuevosPedidos = orders.filter(o => o.status === '1' || o.status === '2').length;
        const enPreparacion = orders.filter(o => o.status === '3').length;
        const enviados = orders.filter(o => o.status === '4').length;
        const totalRecaudado = orders
          .filter(o => o.status === '4' || o.status === '5')
          .reduce((sum, order) => sum + order.totalAmount, 0);

        setData({
          nuevosPedidos,
          enPreparacion,
          enviados,
          totalRecaudado
        });
      } catch (err: any) {
        console.error("Error fetching seller dashboard data:", err);
        setError("No se pudieron cargar las métricas. Revisa tu conexión con el servidor.");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh]">
        <Loader2 className="w-12 h-12 text-cyan-400 animate-spin" />
        <p className="mt-6 text-cyan-400 font-bold tracking-widest text-[10px] uppercase">
          Actualizando consola...
        </p>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="bg-red-500/10 border border-red-500/20 text-red-300 p-6 rounded-2xl flex items-center gap-4">
        <AlertTriangle className="w-8 h-8 shrink-0 text-red-500" />
        <p className="text-sm leading-relaxed">{error || "Error desconocido."}</p>
      </div>
    );
  }

  const metrics = [
    { label: 'Nuevos Pedidos', value: data.nuevosPedidos, icon: ShoppingCart },
    { label: 'En Preparación', value: data.enPreparacion, icon: Package },
    { label: 'En tránsito', value: data.enviados, icon: Truck },
    { label: 'Total Recaudado', value: formatCOP(data.totalRecaudado), icon: DollarSign },
  ];

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-serif font-bold text-white tracking-tight mb-2">
          Panel de Control
        </h1>
        <p className="text-white/60 text-sm">
          Monitorea el flujo de pedidos y despachos en tiempo real.
        </p>
      </div>

      {/* Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {metrics.map((metric, idx) => {
          const Icon = metric.icon;
          return (
            <motion.div
              key={metric.label}
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.1, duration: 0.4 }}
              className="bg-manchester-dark border border-white/5 rounded-2xl p-6 flex flex-col justify-between group hover:border-cyan-400/30 transition-colors"
            >
              <div className="flex justify-between items-start mb-6">
                <div className="w-12 h-12 rounded-xl bg-white/[0.03] flex items-center justify-center text-white/30 group-hover:bg-cyan-400/10 group-hover:text-cyan-400 transition-colors">
                  <Icon className="w-6 h-6" />
                </div>
              </div>
              <div>
                <h3 className="text-3xl font-serif font-bold text-cyan-400 tracking-tighter mb-1">
                  {metric.value}
                </h3>
                <p className="text-[10px] uppercase tracking-widest text-white/40 font-bold">
                  {metric.label}
                </p>
              </div>
            </motion.div>
          );
        })}
      </div>

      {/* Optional: Add an illustration or banner placeholder for future features */}
      <div className="bg-gradient-to-br from-cyan-900/20 to-transparent border border-cyan-400/20 rounded-3xl p-8 lg:p-12 mt-8 flex flex-col md:flex-row items-center justify-between gap-8">
        <div className="max-w-lg">
          <span className="inline-block px-3 py-1 bg-cyan-400/10 text-cyan-400 border border-cyan-400/20 rounded-full text-[10px] uppercase tracking-widest font-bold mb-4">
            Gestión Rápida
          </span>
          <h2 className="text-2xl font-serif font-bold text-white mb-2">
            Control de Pedidos Centralizado
          </h2>
          <p className="text-white/60 text-sm leading-relaxed mb-6">
            Mueve las órdenes de manera intuitiva en tu tablero Kanban para actualizar
            automáticamente sus estados y mantener al cliente informado.
          </p>
        </div>
      </div>
    </div>
  );
};

export default SellerDashboard;
