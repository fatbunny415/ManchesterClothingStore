import React from 'react';
import { ShoppingCart, Eye } from 'lucide-react';
import { Product } from '../types';
import { Link } from 'react-router-dom';

interface ProductCardProps {
  product: Product;
}

const ProductCard: React.FC<ProductCardProps> = ({ product }) => {
  return (
    <div className="card-premium group">
      {/* Image Container */}
      <div className="relative aspect-[3/4] overflow-hidden bg-manchester-dark">
        <img
          src={product.imageUrl || 'https://images.unsplash.com/photo-1552374196-1ab2a1c593e8?q=80&w=1000&auto=format&fit=crop'}
          alt={product.name}
          className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110 group-hover:blur-[2px]"
        />
        
        {/* Overlay Actions */}
        <div className="absolute inset-0 bg-manchester-black/40 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center space-x-3">
          <button className="p-3 bg-manchester-white text-manchester-black rounded-full hover:bg-manchester-gold hover:text-manchester-white transition-all transform translate-y-4 group-hover:translate-y-0 duration-500">
            <ShoppingCart className="w-5 h-5" />
          </button>
          <Link 
            to={`/product/${product.id}`}
            className="p-3 bg-manchester-white text-manchester-black rounded-full hover:bg-manchester-gold hover:text-manchester-white transition-all transform translate-y-4 group-hover:translate-y-0 duration-500 delay-75"
          >
            <Eye className="w-5 h-5" />
          </Link>
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
