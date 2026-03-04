import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import Home from './pages/Home';
import Shop from './pages/Shop';
import Login from './pages/Login';
import Register from './pages/Register';
import ProductDetail from './pages/ProductDetail';
import Orders from './pages/Orders';
import { useEffect } from 'react';
import { useCartStore } from './store/useCartStore';
import { useAuthStore } from './store/useAuthStore';

function App() {
  const fetchCart = useCartStore(state => state.fetchCart);
  const isAuthenticated = useAuthStore(state => state.isAuthenticated);

  useEffect(() => {
    fetchCart();
  }, [isAuthenticated, fetchCart]);

  // Sync scroll to top on route change (optional but good for UX)
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  return (
    <Router>
      <div className="flex flex-col min-h-screen bg-manchester-black text-manchester-white">
        <Navbar />
        <main className="flex-grow">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/shop" element={<Shop />} />
            <Route path="/hombre" element={<Shop />} /> 
            <Route path="/mujer" element={<Shop />} />
            <Route path="/accesorios" element={<Shop />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/product/:id" element={<ProductDetail />} />
            <Route path="/orders" element={<Orders />} />
          </Routes>
        </main>
        <Footer />
      </div>
    </Router>
  );
}

export default App;
