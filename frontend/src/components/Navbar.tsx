import React from 'react';
import { ShoppingBag, User, LogOut, Menu, X, Package } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuthStore } from '../store/useAuthStore';
import { useCartStore } from '../store/useCartStore';
import Cart from './Cart';

const Navbar = () => {
  const [isOpen, setIsOpen] = React.useState(false);
  const [isCartOpen, setIsCartOpen] = React.useState(false);
  const { user, isAuthenticated, logout } = useAuthStore();
  const totalItems = useCartStore(state => state.totalItems());
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <>
      <nav className="fixed w-full z-50 bg-manchester-black/80 backdrop-blur-md border-b border-white/5">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-20">
            {/* Logo */}
            <Link to="/" className="flex items-center space-x-2 group">
              <span className="text-2xl font-bold tracking-tighter text-manchester-white group-hover:text-manchester-gold transition-colors">
                MANCHESTER
              </span>
              <div className="h-2 w-2 bg-manchester-gold rounded-full transform group-hover:scale-150 transition-transform"></div>
            </Link>

            {/* Desktop Menu */}
            <div className="hidden md:flex items-center space-x-8">
              <Link to="/superior" className="text-sm font-medium hover:text-manchester-gold transition-colors tracking-widest uppercase">Superior</Link>
              <Link to="/inferior" className="text-sm font-medium hover:text-manchester-gold transition-colors tracking-widest uppercase">Inferior</Link>
              <Link to="/calzado" className="text-sm font-medium hover:text-manchester-gold transition-colors tracking-widest uppercase">Calzado</Link>
              <Link to="/accesorios" className="text-sm font-medium hover:text-manchester-gold transition-colors tracking-widest uppercase">Accesorios</Link>
            </div>

            {/* Icons */}
            <div className="hidden md:flex items-center space-x-5">
              <button 
                onClick={() => setIsCartOpen(true)}
                className="relative p-2 hover:bg-white/5 rounded-full transition-colors group"
              >
                <ShoppingBag className="w-5 h-5 group-hover:text-manchester-gold" />
                {totalItems > 0 && (
                  <span className="absolute top-0 right-0 h-4 w-4 bg-manchester-blue text-white text-[10px] font-bold rounded-full flex items-center justify-center">
                    {totalItems}
                  </span>
                )}
              </button>

              {isAuthenticated ? (
                <div className="flex items-center space-x-4 border-l border-white/10 pl-5">
                  <Link to="/orders" className="p-2 hover:bg-white/5 rounded-full group transition-colors">
                    <Package className="w-5 h-5 group-hover:text-manchester-gold" />
                  </Link>
                  <span className="text-xs uppercase font-semibold text-white/50 tracking-widest">{user?.fullName.split(' ')[0]}</span>
                  <button onClick={handleLogout} className="p-2 hover:bg-red-500/10 rounded-full group transition-colors">
                    <LogOut className="w-5 h-5 group-hover:text-red-500" />
                  </button>
                </div>
              ) : (
                <Link to="/login" className="btn-primary py-1.5 px-5 text-sm uppercase tracking-widest font-bold">
                  Iniciar Sesión
                </Link>
              )}
            </div>

            {/* Mobile Menu Button */}
            <div className="md:hidden flex items-center">
              <button 
                onClick={() => setIsCartOpen(true)}
                className="relative p-2 mr-2"
              >
                <ShoppingBag className="w-6 h-6" />
                {totalItems > 0 && (
                  <span className="absolute top-0 right-0 h-4 w-4 bg-manchester-blue text-white text-[10px] font-bold rounded-full flex items-center justify-center">
                    {totalItems}
                  </span>
                )}
              </button>
              <button onClick={() => setIsOpen(!isOpen)} className="p-2">
                {isOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Menu Content */}
        {isOpen && (
          <div className="md:hidden bg-manchester-dark border-b border-white/5 py-4 animate-fade-in">
            <div className="px-4 space-y-4">
              <Link to="/superior" className="block text-lg font-medium tracking-widest uppercase" onClick={() => setIsOpen(false)}>Superior</Link>
              <Link to="/inferior" className="block text-lg font-medium tracking-widest uppercase" onClick={() => setIsOpen(false)}>Inferior</Link>
              <Link to="/calzado" className="block text-lg font-medium tracking-widest uppercase" onClick={() => setIsOpen(false)}>Calzado</Link>
              <Link to="/accesorios" className="block text-lg font-medium tracking-widest uppercase" onClick={() => setIsOpen(false)}>Accesorios</Link>
              <hr className="border-white/5" />
              {isAuthenticated ? (
                <button onClick={() => { handleLogout(); setIsOpen(false); }} className="text-red-500 font-bold uppercase tracking-widest text-sm">Cerrar Sesión</button>
              ) : (
                <Link to="/login" className="block text-manchester-gold font-bold uppercase tracking-widest text-sm" onClick={() => setIsOpen(false)}>Iniciar Sesión</Link>
              )}
            </div>
          </div>
        )}
      </nav>

      <Cart isOpen={isCartOpen} onClose={() => setIsCartOpen(false)} />
    </>
  );
};

export default Navbar;
