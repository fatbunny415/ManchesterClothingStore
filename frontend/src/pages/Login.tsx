import React, { useState } from 'react';
import { Mail, Lock, Eye, EyeOff, ArrowRight, Loader2 } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { authService } from '../api/services';
import { useAuthStore } from '../store/useAuthStore';
import { motion } from 'framer-motion';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const navigate = useNavigate();
  const setAuth = useAuthStore((state) => state.setAuth);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const response = await authService.login(email, password);
      setAuth(
        { id: response.userId, fullName: response.fullName, email: response.email, role: response.role },
        response.token
      );
      navigate('/');
    } catch (err: any) {
      setError(err.response?.data?.message || 'Error al iniciar sesión. Verifica tus credenciales.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-32 bg-manchester-black relative overflow-hidden">
      {/* Background Glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-manchester-gold/5 blur-[120px] rounded-full pointer-events-none"></div>

      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-md w-full"
      >
        <div className="card-premium p-8 md:p-10">
          <div className="text-center mb-10">
            <h2 className="text-3xl font-bold tracking-tighter mb-2">BIENVENIDO</h2>
            <p className="text-white/40 text-sm italic">"Donde la distinción se encuentra con el confort"</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            {error && (
              <div className="bg-red-500/10 border border-red-500/20 text-red-500 text-xs py-3 px-4 rounded-xl animate-shake">
                {error}
              </div>
            )}

            <div>
              <label className="block text-xs font-bold tracking-widest text-manchester-gold uppercase mb-3 ml-1">Correo Electrónico</label>
              <div className="relative">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-white/20" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="input-field w-full pl-12"
                  placeholder="ejemplo@manchester.store"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold tracking-widest text-manchester-gold uppercase mb-3 ml-1">Contraseña</label>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-white/20" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="input-field w-full pl-12 pr-12"
                  placeholder="••••••••"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-white/20 hover:text-white transition-colors"
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
            </div>

            <div className="flex items-center justify-end">
              <Link to="/forgot" className="text-xs text-white/40 hover:text-manchester-gold transition-colors">¿Olvidaste tu contraseña?</Link>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="btn-gold w-full py-4 tracking-widest text-sm flex items-center justify-center group"
            >
              {loading ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : (
                <>INICIAR SESIÓN <ArrowRight className="ml-2 w-4 h-4 group-hover:translate-x-1 transition-transform" /></>
              )}
            </button>
          </form>

          <p className="mt-8 text-center text-sm text-white/40">
            ¿No tienes cuenta?{' '}
            <Link to="/register" className="text-manchester-white font-bold hover:text-manchester-gold transition-colors">Registrate ahora</Link>
          </p>
        </div>
      </motion.div>
    </div>
  );
};

export default Login;
