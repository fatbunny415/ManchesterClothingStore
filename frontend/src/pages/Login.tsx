import React, { useState, useEffect } from 'react';
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

  // =========================
  // Bloqueo temporal
  // =========================
  const MAX_TEMP = 3;              // intentos antes de bloqueo temporal
  const TEMP_LOCK_MS = 2 * 60 * 1000; // 2 minutos

  const [attempts, setAttempts] = useState(() =>
    parseInt(localStorage.getItem('auth_fails') || '0', 10)
  );
  const [lockUntil, setLockUntil] = useState(() =>
    parseInt(localStorage.getItem('auth_lock_until') || '0', 10)
  );
  const [timeLeft, setTimeLeft] = useState(0);

  // Cuenta regresiva del bloqueo temporal
  useEffect(() => {
    if (lockUntil > Date.now()) {
      const interval = setInterval(() => {
        const remaining = Math.ceil((lockUntil - Date.now()) / 1000);
        if (remaining <= 0) {
          setTimeLeft(0);
          setAttempts(0);
          localStorage.removeItem('auth_lock_until');
          localStorage.removeItem('auth_fails');
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

  // Registrar intento fallido
  const registerFailedAttempt = () => {
    const newAttempts = attempts + 1;
    setAttempts(newAttempts);
    localStorage.setItem('auth_fails', newAttempts.toString());

    if (newAttempts >= MAX_TEMP) {
      const newLockUntil = Date.now() + TEMP_LOCK_MS;
      setLockUntil(newLockUntil);
      localStorage.setItem('auth_lock_until', newLockUntil.toString());
    }
  };

  // =========================
  // Login handler
  // =========================
  const navigate = useNavigate();
  const setAuth = useAuthStore((state) => state.setAuth);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (isTempLocked) return;

    const cleanEmail = email.trim();

    if (!cleanEmail || !password) {
      return setError('Por favor, rellena todos los campos requeridos.');
    }

    if (cleanEmail.includes(' ')) {
      return setError('No se permiten espacios (" ") en el correo electrónico.');
    }

    setLoading(true);
    setError('');

    try {
      // Google reCAPTCHA v3
      await grecaptcha.ready(async () => {
        const siteKey = import.meta.env.VITE_RECAPTCHA_SITE_KEY;
        const token = await grecaptcha.execute(siteKey, { action: 'login' });

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
            role: response.role,
          },
          response.token
        );

        navigate('/');
      });
    } catch (err: any) {
      setError(err.response?.data?.message || 'Error al iniciar sesión. Verifica tus credenciales.');
      registerFailedAttempt();
    } finally {
      setLoading(false);
    }
  };

  // =========================
  // Render
  // =========================
  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-32 bg-manchester-black relative overflow-hidden">
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
                {isTempLocked && (
                  <motion.div
                    key="tempLock"
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    transition={{ duration: 0.2 }}
                    className="bg-orange-500/10 border border-orange-500/50 text-orange-400 font-bold italic tracking-wide py-4 px-4 rounded-xl text-center flex flex-col items-center"
                  >
                    <span className="text-sm">
                      Por favor espera {timeLeft} segundos antes de volver a intentar.
                    </span>
                    <span className="text-xs font-normal text-orange-300 mt-1">
                      Demasiados intentos fallidos ({attempts} intentos registrados)
                    </span>
                  </motion.div>
                )}
                {error && !isTempLocked && (
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
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            <fieldset
              disabled={loading || isTempLocked}
              className={`space-y-6 ${loading || isTempLocked ? 'opacity-50 transition-opacity duration-300' : ''}`}
            >
              {/* Email */}
              <div>
                <label className="block text-xs font-bold tracking-widest text-manchester-gold uppercase mb-3 ml-1">
                  Correo Electrónico
                </label>
                <div className="relative group">
                  <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-white/20 group-focus-within:text-manchester-gold transition-colors duration-300" />
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="input-field w-full pl-12"
                    placeholder="ejemplo@manchester.store"
                    maxLength={110}
                  />
                </div>
              </div>

              {/* Password */}
              <div>
                <label className="block text-xs font-bold tracking-widest text-manchester-gold uppercase mb-3 ml-1">
                  Contraseña
                </label>
                <div className="relative group">
                  <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-white/20 group-focus-within:text-manchester-gold transition-colors duration-300" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="input-field w-full pl-12 pr-12"
                    placeholder="••••••••"
                    maxLength={75}
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
                <Link to="/forgot" className="text-xs text-white/40 hover:text-manchester-gold transition-colors">
                  ¿Olvidaste tu contraseña?
                </Link>
              </div>
            </fieldset>

            <button
              type="submit"
              disabled={loading || isTempLocked}
              className={`btn-gold w-full py-4 tracking-widest text-sm flex items-center justify-center group ${
                isTempLocked ? 'opacity-50 cursor-not-allowed grayscale' : ''
              }`}
            >
              {loading ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : (
                <>
                  INICIAR SESIÓN <ArrowRight className="ml-2 w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </>
              )}
            </button>
          </form>

          <p className="mt-8 text-center text-sm text-white/40">
            ¿No tienes cuenta?{' '}
            <Link to="/register" className="text-manchester-white font-bold hover:text-manchester-gold transition-colors">
              Registrate ahora
            </Link>
          </p>
        </div>
      </motion.div>
    </div>
  );
};

export default Login;