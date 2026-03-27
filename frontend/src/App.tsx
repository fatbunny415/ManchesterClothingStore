import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import Home from './pages/Home';
import Shop from './pages/Shop';
import Login from './pages/Login';
import Register from './pages/Register';
import ProductDetail from './pages/ProductDetail';
import Orders from './pages/Orders';
import NotFound from './pages/NotFound';
import { useEffect } from 'react';
import { useCartStore } from './store/useCartStore';
import { useAuthStore } from './store/useAuthStore';
import { Toaster } from 'react-hot-toast';
import ProtectedRoute from './components/ProtectedRoute';

// Admin imports
import AdminRoute from './components/admin/AdminRoute';
import AdminLayout from './components/admin/AdminLayout';
import AdminDashboard from './pages/admin/AdminDashboard';
import AdminProducts from './pages/admin/AdminProducts';
import AdminOrders from './pages/admin/AdminOrders';
import AdminUsers from './pages/admin/AdminUsers';
import AdminProfile from './pages/admin/AdminProfile';

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
        <Toaster position="bottom-right" toastOptions={{
          style: {
            background: '#1a1a1a',
            color: '#fff',
            border: '1px solid #D4AF37'
          }
        }} />
        <Routes>
          {/* ========================= */}
          {/* Admin Routes (no Navbar/Footer) */}
          {/* ========================= */}
          <Route element={<AdminRoute />}>
            <Route element={<AdminLayout />}>
              <Route path="/admin" element={<AdminDashboard />} />
              <Route path="/admin/products" element={<AdminProducts />} />
              <Route path="/admin/orders" element={<AdminOrders />} />
              <Route path="/admin/users" element={<AdminUsers />} /> {/* Added AdminUsers route */}
              <Route path="/admin/profile" element={<AdminProfile />} />
            </Route>
          </Route>

          {/* ========================= */}
          {/* Public Routes (with Navbar/Footer) */}
          {/* ========================= */}
          <Route
            path="*"
            element={
              <>
                <Navbar />
                <main className="flex-grow">
                  <Routes>
                    <Route path="/" element={<Home />} />
                    <Route path="/shop" element={<Shop />} />
                    <Route path="/superior" element={<Shop />} />
                    <Route path="/inferior" element={<Shop />} />
                    <Route path="/calzado" element={<Shop />} />
                    <Route path="/accesorios" element={<Shop />} />
                    <Route path="/login" element={<Login />} />
                    <Route path="/register" element={<Register />} />
                    <Route path="/product/:id" element={<ProductDetail />} />
                    <Route
                      path="/orders"
                      element={
                        <ProtectedRoute>
                          <Orders />
                        </ProtectedRoute>
                      }
                    />
                    {/* 404 Not Found Catch-All Route */}
                    <Route path="*" element={<NotFound />} />
                  </Routes>
                </main>
                <Footer />
              </>
            }
          />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
