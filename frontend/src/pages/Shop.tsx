import React, { useEffect, useState, useMemo } from 'react';
import { Search, X, SlidersHorizontal, Loader2, ChevronDown, ChevronUp, Check } from 'lucide-react';
import { productService } from '../api/services';
import { Product } from '../types';
import ProductCard from '../components/ProductCard';
import { motion, AnimatePresence } from 'framer-motion';
import { useLocation } from 'react-router-dom';

const Shop = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  
  // Mobile drawer state
  const [isMobileFiltersOpen, setIsMobileFiltersOpen] = useState(false);

  // Filter states
  const [selectedCategory, setSelectedCategory] = useState<string>('Todos');
  const [selectedSize, setSelectedSize] = useState<string>('');
  const [selectedColor, setSelectedColor] = useState<string>('');
  const [selectedType, setSelectedType] = useState<string>('');
  const [minPrice, setMinPrice] = useState<number>(0);
  const [maxPrice, setMaxPrice] = useState<number>(500000); // alto por defecto para que muestre todo
  const [sortBy, setSortBy] = useState<string>('Relevancia');

  
  // Collapsible sections state
  const [openSections, setOpenSections] = useState({
    categoria: true,
    talla: true,
    precio: true,
    color: true,
    tipo: true
  });

  const location = useLocation();
  const currentPath = location.pathname.split('/')[1] || 'shop';

  const sectionData: Record<string, string[]> = {
    superior: ['Camisetas', 'Chaquetas', 'Buzos', 'Camisas', 'Polos'],
    inferior: ['Pantalones', 'Jeans', 'Shorts', 'Sudaderas', 'Deportiva'],
    accesorios: ['Relojes', 'Gafas', 'Cinturones', 'Gorras', 'Bufandas']
  };

  const isMainCategory = sectionData[currentPath] !== undefined;

  // Filter options
  const categories = ['Todos', 'Superior', 'Inferior', 'Accesorios'];
  const sizes = ['XS', 'S', 'M', 'L', 'XL'];
  const colors = [
    { name: 'Negro', class: 'bg-manchester-black border-white/20' },
    { name: 'Blanco', class: 'bg-manchester-white border-white/20' },
    { name: 'Gris', class: 'bg-gray-500 border-transparent' },
    { name: 'Azul', class: 'bg-manchester-blue border-transparent' },
    { name: 'Beige', class: 'bg-[#D4C3A3] border-transparent' },
    { name: 'Dorado', class: 'bg-manchester-gold border-transparent' }
  ];
  
  // Dynamic garments based on current view
  const garmentTypes = isMainCategory 
    ? sectionData[currentPath] 
    : [...sectionData.superior.slice(0,2), ...sectionData.inferior.slice(0,2)];

  // Initialize view category based on route
  useEffect(() => {
    if (isMainCategory) {
      setSelectedCategory(currentPath.charAt(0).toUpperCase() + currentPath.slice(1));
    } else {
      setSelectedCategory('Todos');
    }
  }, [currentPath, isMainCategory]);

  useEffect(() => {
    const fetchProducts = async () => {
      setLoading(true);
      try {
        const categoryFilter = (selectedCategory === 'Todos') ? undefined : selectedCategory;
        const data = await productService.getAll(categoryFilter, searchTerm, true);
        
        // Advanced frontend filtering simulation
        let filteredData = data;
        
        // 1. Filter by Macro Category (if not natively supported by backend)
        if (selectedCategory && selectedCategory !== 'Todos') {
          const catKey = selectedCategory.toLowerCase();
          if (sectionData[catKey]) {
            const allowedSubcategories = sectionData[catKey].map(c => c.toLowerCase());
            filteredData = filteredData.filter((p: Product) => 
               allowedSubcategories.includes(p.category?.toLowerCase() || '')
            );
          }
        }

        // 2. Filter by Specific Garment Type
        if (selectedType) {
          filteredData = filteredData.filter((p: Product) => 
            p.category?.toLowerCase() === selectedType.toLowerCase()
          );
        }

        // 3. Filter by Price Range
        filteredData = filteredData.filter((p: Product) => 
          p.price >= minPrice && p.price <= maxPrice
        );

        // 4. Filter by Size & Color (using our deterministic mock)
        if (selectedSize) {
          filteredData = filteredData.filter((p: Product) => p.sizes?.includes(selectedSize));
        }
        if (selectedColor) {
          filteredData = filteredData.filter((p: Product) => p.colors?.includes(selectedColor));
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
  }, [selectedCategory, selectedType, searchTerm, minPrice, maxPrice, selectedSize, selectedColor]);

  const toggleSection = (section: keyof typeof openSections) => {
    setOpenSections(prev => ({ ...prev, [section]: !prev[section] }));
  };

  const clearFilters = () => {
    setSearchTerm('');
    if (!isMainCategory) setSelectedCategory('Todos');
    setSelectedSize('');
    setSelectedColor('');
    setSelectedType('');
    setMinPrice(0);
    setMaxPrice(500000);
    setSortBy('Relevancia');
  };

  const SidebarContent = () => (
    <div className="space-y-8 pr-4">
      <div className="flex justify-between items-end border-b border-white/10 pb-4">
        <h2 className="font-serif text-2xl font-bold text-manchester-white">Filtros</h2>
        <button 
          onClick={clearFilters}
          className="text-xs font-sans text-manchester-gold hover:text-white uppercase tracking-widest font-semibold transition-colors"
        >
          Limpiar
        </button>
      </div>

      {/* Category Filter */}
      {!isMainCategory && (
        <div className="border-b border-white/5 pb-6">
          <button 
            onClick={() => toggleSection('categoria')}
            className="flex justify-between items-center w-full text-left font-serif text-lg font-semibold text-manchester-white mb-4"
          >
            Categoría 
            {openSections.categoria ? <ChevronUp className="w-4 h-4 text-white/50" /> : <ChevronDown className="w-4 h-4 text-white/50" />}
          </button>
          <AnimatePresence>
            {openSections.categoria && (
              <motion.div 
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                className="overflow-hidden space-y-2"
              >
                {categories.map(cat => (
                  <label key={cat} className="flex items-center space-x-3 cursor-pointer group">
                    <div className={`w-4 h-4 rounded-sm border flex items-center justify-center transition-all ${
                      selectedCategory === cat ? 'bg-manchester-gold border-manchester-gold' : 'border-white/20 group-hover:border-manchester-gold/50'
                    }`}>
                      {selectedCategory === cat && <Check className="w-3 h-3 text-manchester-black" />}
                    </div>
                    <span className={`text-sm font-sans transition-colors ${selectedCategory === cat ? 'text-white' : 'text-white/50 group-hover:text-white/80'}`}>
                      {cat}
                    </span>
                  </label>
                ))}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      )}

      {/* Tipo de Prenda */}
      <div className="border-b border-white/5 pb-6">
        <button 
          onClick={() => toggleSection('tipo')}
          className="flex justify-between items-center w-full text-left font-serif text-lg font-semibold text-manchester-white mb-4"
        >
          Prenda 
          {openSections.tipo ? <ChevronUp className="w-4 h-4 text-white/50" /> : <ChevronDown className="w-4 h-4 text-white/50" />}
        </button>
        <AnimatePresence>
          {openSections.tipo && (
            <motion.div 
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="overflow-hidden space-y-2"
            >
              {garmentTypes.map(type => (
                <label key={type} className="flex items-center space-x-3 cursor-pointer group">
                  <div className={`w-4 h-4 rounded-sm border flex items-center justify-center transition-all ${
                    selectedType === type ? 'bg-manchester-gold border-manchester-gold' : 'border-white/20 group-hover:border-manchester-gold/50'
                  }`}>
                    {selectedType === type && <Check className="w-3 h-3 text-manchester-black" />}
                  </div>
                  <span className={`text-sm font-sans transition-colors ${selectedType === type ? 'text-white' : 'text-white/50 group-hover:text-white/80'}`}>
                    {type}
                  </span>
                </label>
              ))}
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Talla Filter */}
      <div className="border-b border-white/5 pb-6">
        <button 
          onClick={() => toggleSection('talla')}
          className="flex justify-between items-center w-full text-left font-serif text-lg font-semibold text-manchester-white mb-4"
        >
          Talla 
          {openSections.talla ? <ChevronUp className="w-4 h-4 text-white/50" /> : <ChevronDown className="w-4 h-4 text-white/50" />}
        </button>
        <AnimatePresence>
          {openSections.talla && (
            <motion.div 
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="overflow-hidden flex flex-wrap gap-2"
            >
              {sizes.map(size => (
                <button
                  key={size}
                  onClick={() => setSelectedSize(selectedSize === size ? '' : size)}
                  className={`w-10 h-10 flex items-center justify-center text-xs font-sans border transition-all ${
                    selectedSize === size 
                    ? 'border-manchester-gold bg-manchester-gold/10 text-manchester-gold font-bold' 
                    : 'border-white/10 text-white/50 hover:border-white/30 hover:text-white'
                  }`}
                >
                  {size}
                </button>
              ))}
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Color Filter */}
      <div className="border-b border-white/5 pb-6">
        <button 
          onClick={() => toggleSection('color')}
          className="flex justify-between items-center w-full text-left font-serif text-lg font-semibold text-manchester-white mb-4"
        >
          Color 
          {openSections.color ? <ChevronUp className="w-4 h-4 text-white/50" /> : <ChevronDown className="w-4 h-4 text-white/50" />}
        </button>
        <AnimatePresence>
          {openSections.color && (
            <motion.div 
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="overflow-hidden flex flex-wrap gap-3"
            >
              {colors.map(color => (
                <button
                  key={color.name}
                  onClick={() => setSelectedColor(selectedColor === color.name ? '' : color.name)}
                  title={color.name}
                  className={`relative w-8 h-8 rounded-full border flex items-center justify-center transition-all ${color.class} ${
                    selectedColor === color.name ? 'ring-2 ring-manchester-gold ring-offset-2 ring-offset-manchester-black' : 'hover:scale-110'
                  }`}
                >
                  {selectedColor === color.name && <Check className="w-4 h-4 mix-blend-difference text-white" />}
                </button>
              ))}
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Precio Filter (Mock Slider) */}
      <div className="pb-6">
        <button 
          onClick={() => toggleSection('precio')}
          className="flex justify-between items-center w-full text-left font-serif text-lg font-semibold text-manchester-white mb-4"
        >
          Precio 
          {openSections.precio ? <ChevronUp className="w-4 h-4 text-white/50" /> : <ChevronDown className="w-4 h-4 text-white/50" />}
        </button>
        <AnimatePresence>
          {openSections.precio && (
            <motion.div 
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="overflow-hidden space-y-4 pt-2"
            >
              <div className="flex justify-between items-center gap-4">
                <div className="flex-1">
                  <span className="text-white/30 text-[10px] uppercase tracking-widest mb-1 block">Mínimo ($)</span>
                  <input 
                    type="number" 
                    min="0"
                    value={minPrice}
                    onChange={(e) => setMinPrice(Number(e.target.value) || 0)}
                    className="bg-white/5 border border-white/10 rounded-md px-3 py-2 text-sm font-sans text-white w-full focus:outline-none focus:border-manchester-gold transition-colors"
                  />
                </div>
                <div className="flex-1">
                  <span className="text-white/30 text-[10px] uppercase tracking-widest mb-1 block">Máximo ($)</span>
                  <input 
                    type="number" 
                    min="0"
                    value={maxPrice}
                    onChange={(e) => setMaxPrice(Number(e.target.value) || 0)}
                    className="bg-white/5 border border-white/10 rounded-md px-3 py-2 text-sm font-sans text-white w-full focus:outline-none focus:border-manchester-gold transition-colors"
                  />
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

    </div>
  );

  const sortedProducts = useMemo(() => {
    let sorted = [...products];
    if (sortBy === 'Precio: Menor a Mayor') {
      sorted.sort((a, b) => a.price - b.price);
    } else if (sortBy === 'Precio: Mayor a Menor') {
      sorted.sort((a, b) => b.price - a.price);
    } else if (sortBy === 'Lo más nuevo') {
      sorted.sort((a, b) => new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime());
    }
    return sorted;
  }, [products, sortBy]);

  return (
    <div className="pt-28 pb-24 bg-manchester-black min-h-screen">
      
      {/* Page Header */}
      <div className="bg-manchester-dark border-y border-white/5 py-12 mb-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center md:text-left flex flex-col md:flex-row justify-between items-center gap-6">
          <div>
            <h1 className="text-5xl md:text-6xl font-serif font-bold tracking-tighter mb-4 text-manchester-white">Catálogo</h1>
            <p className="text-white/40 text-sm max-w-lg font-sans tracking-wide">
              {isMainCategory ? `Explora nuestra selección exclusiva de la colección ${selectedCategory}.` : 'Descubre piezas atemporales, diseñadas con los materiales más finos del mundo.'}
            </p>
          </div>

          <div className="relative w-full md:w-80 group">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-white/20 group-focus-within:text-manchester-gold transition-colors" />
            <input
              type="text"
              placeholder="Buscar exclusividad..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-12 pr-4 py-3 bg-white/5 border border-white/10 rounded-full text-sm font-sans text-white focus:outline-none focus:border-manchester-gold/50 transition-colors"
            />
          </div>
        </div>
      </div>

      <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Mobile Filter Toggle */}
        <div className="lg:hidden flex justify-between items-center mb-8 border-b border-white/10 pb-4">
          <span className="font-sans text-xs tracking-widest text-white/50">{products.length} Resultados</span>
          <button 
            onClick={() => setIsMobileFiltersOpen(true)}
            className="flex items-center gap-2 text-manchester-gold font-sans text-xs uppercase tracking-[0.2em] font-bold"
          >
            Filtros <SlidersHorizontal className="w-4 h-4" />
          </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-12">
          
          {/* Desktop Sidebar */}
          <div className="hidden lg:block lg:col-span-1">
            <div className="sticky top-28">
              <SidebarContent />
            </div>
          </div>

          {/* Product Grid Area */}
          <div className="lg:col-span-3">
            <div className="hidden md:flex justify-between items-center mb-8">
              <span className="font-sans text-xs tracking-widest text-white/40 uppercase">{products.length} Resultados Encontrados</span>
              <div className="flex items-center gap-2">
                <span className="font-sans text-xs tracking-widest text-white/40 uppercase">Ordenar por:</span>
                <select 
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="bg-transparent text-sm font-sans text-white border-b border-white/20 focus:outline-none focus:border-manchester-gold pb-1 cursor-pointer"
                >
                  <option className="bg-manchester-black text-white">Relevancia</option>
                  <option className="bg-manchester-black text-white">Precio: Menor a Mayor</option>
                  <option className="bg-manchester-black text-white">Precio: Mayor a Menor</option>
                  <option className="bg-manchester-black text-white">Lo más nuevo</option>
                </select>
              </div>
            </div>

            {loading ? (
              <div className="flex flex-col items-center justify-center py-40">
                <Loader2 className="w-10 h-10 text-manchester-gold animate-spin mb-4" />
                <span className="text-white/30 font-sans text-xs tracking-widest font-bold uppercase">Actualizando Catálogo...</span>
              </div>
            ) : sortedProducts.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-x-6 gap-y-12">
                {sortedProducts.map((product) => (
                  <ProductCard key={product.id} product={product} />
                ))}
              </div>
            ) : (
              <div className="text-center py-32 border border-dashed border-white/10 rounded-2xl">
                <X className="w-12 h-12 text-white/10 mx-auto mb-4" />
                <h3 className="text-xl font-serif font-bold mb-2 text-white">Sin resultados</h3>
                <p className="text-white/40 font-sans text-sm">Prueba ajustando los filtros de búsqueda para encontrar lo que necesitas.</p>
                <button 
                  onClick={clearFilters}
                  className="mt-6 text-manchester-gold border-b border-manchester-gold/30 hover:border-manchester-gold pb-1 text-sm font-sans tracking-widest uppercase transition-colors"
                >
                  Limpiar todos los filtros
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Mobile Filters Drawer */}
      <AnimatePresence>
        {isMobileFiltersOpen && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] lg:hidden"
          >
            {/* Backdrop */}
            <div 
              className="absolute inset-0 bg-black/80 backdrop-blur-sm" 
              onClick={() => setIsMobileFiltersOpen(false)}
            />
            
            {/* Drawer */}
            <motion.div 
              initial={{ x: '-100%' }}
              animate={{ x: 0 }}
              exit={{ x: '-100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="absolute top-0 left-0 bottom-0 w-[85%] max-w-[320px] bg-manchester-dark border-r border-white/10 shadow-2xl overflow-y-auto"
            >
              <div className="flex justify-between items-center p-6 border-b border-white/10 sticky top-0 bg-manchester-dark/95 backdrop-blur z-10">
                <h2 className="font-serif text-xl font-bold text-white">Filtros</h2>
                <button onClick={() => setIsMobileFiltersOpen(false)} className="p-2 -mr-2 text-white/50 hover:text-white">
                  <X className="w-5 h-5" />
                </button>
              </div>
              
              <div className="p-6">
                <SidebarContent />
              </div>

              {/* Sticky bottom CTA */}
              <div className="sticky bottom-0 bg-manchester-dark p-6 border-t border-white/10">
                <button 
                  onClick={() => setIsMobileFiltersOpen(false)}
                  className="w-full btn-primary py-3 text-xs tracking-widest uppercase font-bold"
                >
                  Ver {products.length} resultados
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default Shop;
