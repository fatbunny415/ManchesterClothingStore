import React, { useEffect, useState } from 'react';
import { Search, Filter, X, ChevronDown, SlidersHorizontal, Loader2 } from 'lucide-react';
import { productService } from '../api/services';
import { Product } from '../types';
import ProductCard from '../components/ProductCard';
import { motion, AnimatePresence } from 'framer-motion';
import { useLocation } from 'react-router-dom';

const Shop = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('');
  const [showFilters, setShowFilters] = useState(false);
  const location = useLocation();

  // Route determining logic (e.g., from "/superior" gets "superior")
  const currentPath = location.pathname.split('/')[1] || 'shop'; // 'shop' will be the fallback for all
  
  const sectionData: Record<string, string[]> = {
    superior: ['Camisetas', 'Chaquetas', 'Buzos', 'Camisas', 'Polos'],
    inferior: ['Pantalones', 'Jeans', 'Shorts', 'Sudaderas', 'Deportiva'],
    calzado: ['Calzado', 'Zapatos', 'Tenis', 'Botas'],
    accesorios: ['Accesorios', 'Relojes', 'Gafas', 'Cinturones', 'Gorras', 'Bufandas']
  };

  const isMainCategory = sectionData[currentPath] !== undefined;

  // Determine dynamic category pills to show
  const categoriesToDisplay = isMainCategory 
    ? ['Todos', ...sectionData[currentPath]] 
    : ['Todos', 'Superior', 'Inferior', 'Calzado', 'Accesorios'];

  // Reset selected category to "Todos" when navigating between routes
  useEffect(() => {
    setSelectedCategory('Todos');
  }, [currentPath]);

  useEffect(() => {
    const fetchProducts = async () => {
      setLoading(true);
      try {
        // If not a main shop page but a section, we can't let the backend filter for "Superior"
        // as the backend doesn't know what "Superior" is. Instead we fetch everything matching search
        // and filter on the frontend.
        const categoryFilter = (selectedCategory === 'Todos' || isMainCategory) ? undefined : selectedCategory;
        const data = await productService.getAll(categoryFilter, searchTerm, true);
        
        let filteredData = data;
        
        // Manual frontend filtering if on a specific sub-route
        if (isMainCategory) {
          const allowedSubcategories = sectionData[currentPath].map(c => c.toLowerCase());
          filteredData = filteredData.filter((p: Product) => 
            p.category && allowedSubcategories.includes(p.category.toLowerCase())
          );

          // If a specific subcategory pill is clicked
          if (selectedCategory && selectedCategory !== 'Todos') {
             filteredData = filteredData.filter((p: Product) => 
               p.category && p.category.toLowerCase() === selectedCategory.toLowerCase()
             );
          }
        } else if (!isMainCategory && selectedCategory && selectedCategory !== 'Todos') {
          // If on main Shop page, simulate filtering based on our macro-groups since standard category might not exist on backend verbatim
          if (sectionData[selectedCategory.toLowerCase()]) {
            const allowedSubcategories = sectionData[selectedCategory.toLowerCase()].map(c => c.toLowerCase());
              filteredData = filteredData.filter((p: Product) => 
                p.category && allowedSubcategories.includes(p.category.toLowerCase())
              );
          }
        }

        setProducts(filteredData);
      } catch (error) {
        console.error("Error fetching products", error);
      } finally {
        setLoading(false);
      }
    };

    const delayDebounceFn = setTimeout(() => {
      fetchProducts();
    }, 500);

    return () => clearTimeout(delayDebounceFn);
  }, [selectedCategory, searchTerm]);

  return (
    <div className="pt-32 pb-24 bg-manchester-black min-h-screen">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Header */}
        <div className="mb-12">
          <h1 className="text-5xl md:text-6xl font-bold tracking-tighter mb-4">COLECCIÓN</h1>
          <p className="text-white/40 text-sm max-w-lg tracking-wide uppercase">Explora nuestra selección curada de piezas exclusivas diseñadas para elevar tu estilo cotidiano.</p>
        </div>

        {/* Filters & Search Bar */}
        <div className="flex flex-col md:flex-row justify-between items-center gap-6 mb-12 border-b border-white/5 pb-8">
          <div className="relative w-full md:w-96 group">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-white/20 group-focus-within:text-manchester-gold transition-colors" />
            <input
              type="text"
              placeholder="Buscar productos..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="input-field w-full pl-12 bg-manchester-dark/50"
            />
          </div>

          <div className="flex items-center space-x-4 w-full md:w-auto">
            <button 
              onClick={() => setShowFilters(!showFilters)}
              className="btn-secondary py-3 px-6 flex items-center text-xs tracking-widest"
            >
              FILTROS <SlidersHorizontal className="ml-2 w-4 h-4" />
            </button>
            <div className="hidden md:flex items-center text-white/40 text-[10px] uppercase tracking-widest font-bold">
              {products.length} PRODUCTOS ENCONTRADOS
            </div>
          </div>
        </div>

        {/* Expanded Filters */}
        <AnimatePresence>
          {showFilters && (
            <motion.div 
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="overflow-hidden mb-12"
            >
              <div className="bg-manchester-dark/30 p-8 rounded-3xl border border-white/5">
                <div className="flex justify-between items-center mb-6">
                  <h3 className="text-xs font-bold tracking-[0.3em] text-manchester-gold uppercase">Categorías</h3>
                  <button onClick={() => { setSelectedCategory(''); setSelectedCategory('Todos'); }} className="text-[10px] text-white/30 hover:text-white transition-colors uppercase tracking-widest font-bold">Limpiar filtros</button>
                </div>
                <div className="flex flex-wrap gap-3">
                  {categoriesToDisplay.map((cat) => (
                    <button
                      key={cat}
                      onClick={() => setSelectedCategory(cat)}
                      className={`px-6 py-2 rounded-full text-[11px] font-bold tracking-widest transition-all ${
                        (selectedCategory === cat || (cat === 'Todos' && (!selectedCategory || selectedCategory === 'Todos')))
                          ? 'bg-manchester-gold text-white shadow-lg shadow-manchester-gold/20'
                          : 'bg-white/5 text-white/40 hover:bg-white/10 hover:text-white'
                      }`}
                    >
                      {cat.toUpperCase()}
                    </button>
                  ))}
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Product Grid */}
        {loading ? (
          <div className="flex flex-col items-center justify-center py-40">
            <Loader2 className="w-10 h-10 text-manchester-gold animate-spin mb-4" />
            <span className="text-white/20 text-xs tracking-widest font-bold uppercase">Cargando catálogo premium...</span>
          </div>
        ) : products.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-x-8 gap-y-12">
            {products.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        ) : (
          <div className="text-center py-40 border border-dashed border-white/10 rounded-3xl">
            <X className="w-12 h-12 text-white/10 mx-auto mb-4" />
            <h3 className="text-xl font-bold mb-2">NO SE ENCONTRARON PRODUCTOS</h3>
            <p className="text-white/40 text-sm">Prueba ajustando tus filtros o términos de búsqueda.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Shop;
