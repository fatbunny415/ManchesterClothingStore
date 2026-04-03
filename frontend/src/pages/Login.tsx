import React, { useState } from 'react';
import { Mail, Lock, Eye, EyeOff, ArrowRight, Loader2 } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { authService } from '../api/services';
import { useAuthStore } from '../store/useAuthStore';
import { motion, AnimatePresence } from 'framer-motion';

declare const grecaptcha: any;

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Lockout state
  const MAX_TEMP = 3;
  const MAX_PERM = 5;
  const TEMP_LOCK_MS = 60 * 1000;

  const [attempts, setAttempts] = useState(() => parseInt(localStorage.getItem('auth_fails') || '0', 10));
  const [lockUntil, setLockUntil] = useState(() => parseInt(localStorage.getItem('auth_lock_until') || '0', 10));
  const [permLock, setPermLock] = useState(() => localStorage.getItem('auth_perm_lock') === 'true');
  const [timeLeft, setTimeLeft] = useState(0);

  React.useEffect(() => {
    if (lockUntil > Date.now()) {
      const interval = setInterval(() => {
        const remaining = Math.ceil((lockUntil - Date.now()) / 1000);
        if (remaining <= 0) {
          setTimeLeft(0);
          clearInterval(interval);
        } else {
          setTimeLeft(remaining);
        }
      }, 1000);
      return () => clearInterval(interval);
    } else {
      setTimeLeft(0);
    }
  }, [lockUntil]);

  const isTempLocked = timeLeft > 0;

  const navigate = useNavigate();
  const setAuth = useAuthStore((state) => state.setAuth);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (permLock || isTempLocked) return;

    const cleanEmail = email.trim();

    if (!cleanEmail || !password) {
      return setError('Por favor, rellena todos los campos requeridos.');
    }

    if (cleanEmail.includes(' ')) {
      return setError('No se permiten espacios (" ") en el correo electrónico.');
    }

    setLoading(true);
    setError('');

    // Google reCAPTCHA v3 invocation
    grecaptcha.ready(async () => {
      try {
        const siteKey = import.meta.env.VITE_RECAPTCHA_SITE_KEY;
        const token = await grecaptcha.execute(siteKey, {action: 'login'});
        const response: any = await authService.login(cleanEmail, password, token);

        // Éxito: limpiar intentos
        localStorage.removeItem('auth_fails');
        localStorage.removeItem('auth_lock_until');
        setAttempts(0);

        setAuth(
          { 
            id: response.userId || response.id || 'N/A', 
            fullName: response.fullName || response.name || 'Usuario', 
            email: response.email, 
            role: response.role 
          },
          response.token
        );
        navigate('/');
      } catch (err: any) {
        setError(err.response?.data?.message || 'Error al iniciar sesión. Verifica tus credenciales.');
        
        // Registrar intento fallido
        const newFails = attempts + 1;
        setAttempts(newFails);
        localStorage.setItem('auth_fails', newFails.toString());

        if (newFails >= MAX_PERM) {
          setPermLock(true);
          localStorage.setItem('auth_perm_lock', 'true');
        } else if (newFails >= MAX_TEMP) {
          const unlockTime = Date.now() + TEMP_LOCK_MS;
          setLockUntil(unlockTime);
          localStorage.setItem('auth_lock_until', unlockTime.toString());
        }
      } finally {
        setLoading(false);
      }
    });
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
            <div className="min-h-[60px]">
              <AnimatePresence mode="wait">
                {permLock ? (
                  <motion.div 
                    key="permLock"
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    transition={{ duration: 0.2 }}
                    className="bg-red-500/10 border border-red-500/50 text-red-500 font-bold tracking-wide py-4 px-4 rounded-xl text-center shadow-[0_0_15px_rgba(239,68,68,0.2)]"
                  >
                    <Lock className="w-8 h-8 mx-auto mb-2 text-red-500" />
                    ACCESO BLOQUEADO PERMANENTEMENTE
                    <p className="text-xs font-normal text-red-400 mt-2">Has superado el límite de intentos permitidos. Por seguridad de la cuenta, contacta a soporte.</p>
                  </motion.div>
                ) : isTempLocked ? (
                  <motion.div 
                    key="tempLock"
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    transition={{ duration: 0.2 }}
                    className="bg-orange-500/10 border border-orange-500/50 text-orange-400 font-bold italic tracking-wide py-4 px-4 rounded-xl text-center flex flex-col items-center"
                  >
                    <span className="text-sm">Por favor espera {timeLeft} segundos antes de volver a intentar.</span>
                    <span className="text-xs font-normal text-orange-300 mt-1">Demasiados intentos fallidos ({attempts} intentos registrados)</span>
                  </motion.div>
                ) : error ? (
                  <motion.div 
                    key={`error-${attempts}`}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    transition={{ duration: 0.2 }}
                    className="bg-red-500/10 border border-red-500/20 text-red-500 text-xs py-3 px-4 rounded-xl flex flex-col justify-center"
                  >
                    <div className="flex flex-col justify-center items-center w-full text-center">
                      <span className="text-red-400/90 italic font-bold text-sm mb-1">{error}</span>
                      
                      {attempts > 0 && attempts < MAX_TEMP && (
                        <span className="text-red-400/80 italic font-bold">
                          Te quedan {MAX_TEMP - attempts} intento(s) antes del bloqueo temporal. ({attempts}/{MAX_TEMP} intentos)
                        </span>
                      )}
                      
                      {attempts >= MAX_TEMP && attempts < MAX_PERM && (
                        <span className="text-red-400/80 italic font-bold">
                          Te quedan {MAX_PERM - attempts} intentos para el bloqueo permanente.
                        </span>
                      )}
                    </div>
                  </motion.div>
                ) : null}
              </AnimatePresence>
            </div>

            <fieldset disabled={loading || permLock || isTempLocked} className={`space-y-6 ${loading || permLock || isTempLocked ? "opacity-50 transition-opacity duration-300" : ""}`}>
              <div>
                <label className="block text-xs font-bold tracking-widest text-manchester-gold uppercase mb-3 ml-1">Correo Electrónico</label>
                <div className="relative group">
                  <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-white/20 group-focus-within:text-manchester-gold transition-colors duration-300" />
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
                <div className="relative group">
                  <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-white/20 group-focus-within:text-manchester-gold transition-colors duration-300" />
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
            </fieldset>

            <button
              type="submit"
              disabled={loading || permLock || isTempLocked}
              className={`btn-gold w-full py-4 tracking-widest text-sm flex items-center justify-center group ${permLock || isTempLocked ? 'opacity-50 cursor-not-allowed grayscale' : ''}`}
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
