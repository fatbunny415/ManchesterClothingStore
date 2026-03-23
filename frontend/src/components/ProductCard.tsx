import React from 'react';
import { ShoppingCart, Eye } from 'lucide-react';
import { Product } from '../types';
import { Link } from 'react-router-dom';
import { useCartStore } from '../store/useCartStore';
import toast from 'react-hot-toast';

interface ProductCardProps {
  product: Product;
}

const ProductCard: React.FC<ProductCardProps> = ({ product }) => {
  const addItem = useCartStore(state => state.addItem);

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault(); // Prevent navigating if this was inside a link
    e.stopPropagation();
    
    if (product.stock > 0 && product.isActive) {
      addItem(product);
      toast.success(`${product.name} añadido a la cesta`, {
        icon: '🛍️',
        style: {
          background: '#1a1a1a',
          color: '#D4AF37',
          border: '1px solid #D4AF37'
        }
      });
    }
  };

  return (
    <div className="card-premium group">
      {/* Image Container */}
      <div className="relative aspect-[3/4] overflow-hidden bg-manchester-dark">
        <img
          src={product.imageUrl || 'https://images.unsplash.com/photo-1552374196-1ab2a1c593e8?q=80&w=1000&auto=format&fit=crop'}
          alt={product.name}
          loading="lazy"
          className="w-full h-full object-cover transition-transform duration-[1200ms] ease-out group-hover:scale-110"
        />
        
        {/* Overlay Actions */}
        <div className="absolute inset-0 bg-gradient-to-t from-manchester-black/80 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-all duration-500 flex flex-col items-center justify-end pb-8 space-y-3">
          <div className="flex space-x-3 transform translate-y-8 group-hover:translate-y-0 transition-all duration-500 ease-out">
            <button 
              onClick={handleAddToCart}
              disabled={product.stock <= 0 || !product.isActive}
              className={`p-3 rounded-full transition-colors shadow-lg shadow-black/20 ${
                product.stock <= 0 || !product.isActive 
                ? 'bg-white/20 text-white/50 cursor-not-allowed' 
                : 'bg-manchester-white text-manchester-black hover:bg-manchester-gold hover:text-manchester-black'
              }`}
            >
              <ShoppingCart className="w-5 h-5" />
            </button>
            <Link 
              to={`/product/${product.id}`}
              className="p-3 bg-manchester-white text-manchester-black rounded-full hover:bg-manchester-gold hover:text-manchester-black transition-colors shadow-lg shadow-black/20"
            >
              <Eye className="w-5 h-5" />
            </Link>
          </div>
        </div>

        {/* Badge */}
        {product.stock <= 5 && product.stock > 0 && (
          <span className="absolute top-4 left-4 bg-red-500 text-white text-[10px] font-bold px-2 py-1 rounded-full uppercase tracking-widest">
            Últimas unidades
          </span>
        )}
        {!product.isActive && (
          <span className="absolute top-4 left-4 bg-white/20 backdrop-blur-md text-white text-[10px] font-bold px-2 py-1 rounded-full uppercase tracking-widest">
            Agotado
          </span>
        )}
      </div>

      {/* Info */}
      <div className="p-6">
        <div className="flex justify-between items-start mb-2">
          <span className="text-[10px] uppercase tracking-[0.2em] text-manchester-gold font-bold">
            {product.category}
          </span>
        </div>
        <h3 className="text-manchester-white font-medium text-lg mb-1 group-hover:text-manchester-gold transition-colors">
          {product.name}
        </h3>
        <p className="text-white/40 text-xs mb-4 line-clamp-1">
          {product.description}
        </p>
        <div className="flex justify-between items-center">
          <span className="text-manchester-white font-bold text-xl">
            ${product.price.toLocaleString()}
          </span>
          <span className="text-white/20 text-[10px] uppercase tracking-widest">
            Stock: {product.stock}
          </span>
        </div>
      </div>
    </div>
  );
};

export default ProductCard;
