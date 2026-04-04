import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import StatsCard from '../../components/admin/ui/StatsCard';
import StatusBadge from '../../components/admin/ui/StatusBadge';
import { AdminTable } from '../../components/admin/ui/AdminTable';
import { Package, ShoppingCart, DollarSign, AlertTriangle, ExternalLink } from 'lucide-react';
import { adminProductService, adminOrderService } from '../../api/adminServices';
import type { AdminOrder, Product } from '../../types';
import { formatCOP } from '../../utils/formatCurrency';

interface DashboardData {
  totalRevenue: number;
  totalOrders: number;
  totalProducts: number;
  lowStockItems: number;
  recentOrders: AdminOrder[];
}

const AdminDashboard: React.FC = () => {
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        // Descargar datos en paralelo para ser más eficientes
        const [products, orders] = await Promise.all([
          adminProductService.getAll(),
          adminOrderService.getAll()
        ]);

        // ======================
        // Cálculos Matemáticos
        // ======================
        const totalRevenue = orders.reduce((sum, order) => sum + order.totalAmount, 0);
        // Productos que tengan 5 o menos en stock
        const lowStockItems = products.filter(p => p.stock <= 5).length;
        
        // Obtener los pedidos más recientes (ordenados por fecha descendente, máximo 5)
        const recentOrders = [...orders]
          .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
          .slice(0, 5);

        setData({
          totalRevenue,
          totalOrders: orders.length,
          totalProducts: products.length,
          lowStockItems,
          recentOrders
        });
      } catch (err: any) {
        console.error("Error fetching dashboard data:", err);
        setError("No se pudieron cargar las métricas. Revisa tu conexión con el servidor.");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const columns = [
    { header: 'ID Pedido', accessor: 'id' as keyof AdminOrder, className: 'text-xs text-white/50 w-24' },
    { header: 'Cliente', accessor: 'customerName' as keyof AdminOrder },
    { 
      header: 'Fecha', 
      accessor: (item: AdminOrder) => new Date(item.createdAt).toLocaleDateString()
    },
    { 
      header: 'Total', 
      accessor: (item: AdminOrder) => <span className="text-red-500 font-bold">{formatCOP(item.totalAmount)}</span>
    },
    { 
      header: 'Estado', 
      accessor: (item: AdminOrder) => <StatusBadge status={item.status} /> 
    },
  ];

  if (loading) {
    return (
      <div className="admin-page-enter flex flex-col items-center justify-center min-h-[60vh]">
        <div className="w-12 h-12 border-4 border-red-500 border-t-transparent rounded-full animate-spin"></div>
        <p className="mt-6 text-red-500 font-bold tracking-widest text-[10px] uppercase">Calculando métricas en tiempo real...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="admin-page-enter">
        <div className="bg-red-500/10 border border-red-500/20 text-red-300 p-6 rounded-2xl flex items-center gap-4">
          <AlertTriangle className="w-8 h-8 shrink-0 text-red-500" />
          <p className="text-sm leading-relaxed">{error}</p>
        </div>
      </div>
    );
  }

  if (!data) return null;

  return (
    <div className="admin-page-enter space-y-8">
      {/* Título y Botón */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-serif font-bold tracking-tight mb-1">Dashboard</h1>
          <p className="text-sm text-white/40">Resumen general de tu tienda</p>
        </div>
        
        <Link 
          to="/"
          className="btn-gold !bg-[#111] !border-white/10 !text-white hover:!border-white/30 inline-flex items-center gap-2 px-6 py-2.5 text-xs rounded-xl shadow-lg shadow-black/50 hover:-translate-y-0.5 transition-all"
        >
          <ExternalLink className="w-4 h-4" /> Ver Tienda Pública
        </Link>
      </div>

      {/* 4 Métricas Clave */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatsCard 
          label="Ingresos Totales" 
          value={formatCOP(data.totalRevenue)} 
          icon={DollarSign} 
          delay={0.1} 
        />
        <StatsCard 
          label="Pedidos Totales" 
          value={data.totalOrders.toString()} 
          icon={ShoppingCart} 
          delay={0.2} 
        />
        <StatsCard 
          label="Productos Registrados" 
          value={data.totalProducts.toString()} 
          icon={Package} 
          delay={0.3} 
        />
        <StatsCard 
          label="Stock Crítico (<= 5)" 
          value={data.lowStockItems.toString()} 
          icon={AlertTriangle} 
          trend={data.lowStockItems > 0 ? { value: data.lowStockItems, isPositive: false } : undefined}
          delay={0.4} 
        />
      </div>

      {/* Tabla Recientes */}
      <div>
        <h2 className="text-lg font-bold mb-4 text-white">
          Últimos 5 Pedidos
        </h2>
        <AdminTable 
          data={data.recentOrders} 
          columns={columns} 
          keyExtractor={(item) => item.id} 
          emptyMessage="No hay pedidos registrados aún."
        />
      </div>
    </div>
  );
};

export default AdminDashboard;
