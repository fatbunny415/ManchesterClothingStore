import React, { useState } from 'react';
import { User as UserIcon, Mail, Lock, Eye, EyeOff, ArrowRight, Loader2, CheckCircle2, Circle } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { authService } from '../api/services';
import { motion } from 'framer-motion';

declare const grecaptcha: any;

const Register = () => {
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  // Password strength logic
  const passwordChecks = {
    length: password.length >= 8,
    uppercase: /[A-Z]/.test(password),
    number: /\d/.test(password),
    special: /[\@\$\!\%\*\?\&\#\^\(\)]/.test(password),
  };
  const passedChecks = Object.values(passwordChecks).filter(Boolean).length;
  const strengthLabel = passedChecks <= 1 ? 'Débil' : passedChecks <= 3 ? 'Media' : 'Fuerte';
  const strengthColor = passedChecks <= 1 ? 'bg-red-500' : passedChecks <= 3 ? 'bg-yellow-500' : 'bg-green-500';
  const strengthTextColor = passedChecks <= 1 ? 'text-red-400' : passedChecks <= 3 ? 'text-yellow-400' : 'text-green-400';

  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const cleanFullName = fullName.trim();
    const cleanEmail = email.trim();

    if (!cleanFullName || !cleanEmail || !password || !confirmPassword) {
      return setError('Por favor, rellena todos los campos requeridos.');
    }

    if (cleanEmail.includes(' ')) {
      return setError('No se permiten espacios (" ") en el correo electrónico.');
    }

    if (password.length < 8) {
      return setError('La contraseña debe tener al menos 8 caracteres.');
    }

    if (passedChecks < 4) {
      return setError('La contraseña no cumple con todos los requisitos de seguridad.');
    }

    if (password !== confirmPassword) {
      return setError('Las contraseñas no coinciden. Por favor, verifícalas y vuelve a intentar.');
    }

    setLoading(true);
    setError('');

    grecaptcha.ready(async () => {
      try {
        const siteKey = import.meta.env.VITE_RECAPTCHA_SITE_KEY;
        const token = await grecaptcha.execute(siteKey, {action: 'register'});
        await authService.register(cleanFullName, cleanEmail, password, token);
        setSuccess(true);
        setTimeout(() => navigate('/login'), 2000);
      } catch (err: any) {
        setError(err.response?.data?.message || 'Error al registrarte. Intenta con otro correo electrónico.');
      } finally {
        setLoading(false);
      }
    });
  };

  if (success) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-manchester-black px-4">
        <motion.div 
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="text-center card-premium p-10 max-w-sm"
        >
          <div className="bg-manchester-gold/10 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6">
            <CheckCircle2 className="w-10 h-10 text-manchester-gold" />
          </div>
          <h2 className="text-2xl font-bold mb-4">¡REGISTRO EXITOSO!</h2>
          <p className="text-white/50 text-sm mb-8">Gracias por unirte a Manchester. Te estamos redirigiendo al inicio de sesión.</p>
          <div className="w-full h-1 bg-white/5 rounded-full overflow-hidden">
            <motion.div 
              initial={{ width: 0 }}
              animate={{ width: '100%' }}
              transition={{ duration: 2 }}
              className="h-full bg-manchester-gold"
            />
          </div>
        </motion.div>
      </div>
    );
  }

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
            <h2 className="text-3xl font-bold tracking-tighter mb-2">ÚNETE A NOSOTROS</h2>
            <p className="text-white/40 text-sm italic">"Tu viaje hacia el lujo comienza aquí"</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            {error && (
              <div className="bg-red-500/10 border border-red-500/20 text-red-500 text-xs py-3 px-4 rounded-xl">
                {error}
              </div>
            )}

            <fieldset disabled={loading} className={`space-y-6 ${loading ? "opacity-50 transition-opacity duration-300 pointer-events-none" : ""}`}>
              <div>
                <label className="block text-xs font-bold tracking-widest text-manchester-gold uppercase mb-3 ml-1">Nombre Completo</label>
                <div className="relative group">
                  <UserIcon className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-white/20 group-focus-within:text-manchester-gold transition-colors duration-300" />
                  <input
                    type="text"
                    required
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    className="input-field w-full pl-12"
                    placeholder="John Doe"
                    maxLength={75}
                  />
                </div>
              </div>

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
                    maxLength={110}
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

              {/* Password Strength Meter */}
              {password.length > 0 && (
                <div className="space-y-2 -mt-3">
                  {/* Progress Bar */}
                  <div className="flex items-center gap-3">
                    <div className="flex-1 h-1.5 bg-white/5 rounded-full overflow-hidden">
                      <div 
                        className={`h-full rounded-full transition-all duration-500 ${strengthColor}`}
                        style={{ width: `${(passedChecks / 4) * 100}%` }}
                      />
                    </div>
                    <span className={`text-[10px] font-bold uppercase tracking-widest ${strengthTextColor}`}>
                      {strengthLabel}
                    </span>
                  </div>
                  {/* Requirements Checklist */}
                  <div className="grid grid-cols-2 gap-x-4 gap-y-1">
                    {[
                      { label: '8+ caracteres', met: passwordChecks.length },
                      { label: '1 mayúscula', met: passwordChecks.uppercase },
                      { label: '1 número', met: passwordChecks.number },
                      { label: '1 especial (@$!%)', met: passwordChecks.special },
                    ].map((req) => (
                      <div key={req.label} className="flex items-center gap-1.5">
                        {req.met 
                          ? <CheckCircle2 className="w-3 h-3 text-green-500 shrink-0" /> 
                          : <Circle className="w-3 h-3 text-white/15 shrink-0" />
                        }
                        <span className={`text-[10px] tracking-wide ${req.met ? 'text-white/60' : 'text-white/25'}`}>
                          {req.label}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
              <div>
                <label className="block text-xs font-bold tracking-widest text-manchester-gold uppercase mb-3 ml-1">Confirmar Contraseña</label>
                <div className="relative group">
                  <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-white/20 group-focus-within:text-manchester-gold transition-colors duration-300" />
                  <input
                    type={showConfirmPassword ? 'text' : 'password'}
                    required
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="input-field w-full pl-12 pr-12"
                    placeholder="••••••••"
                    maxLength={75}
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-white/20 hover:text-white transition-colors"
                  >
                    {showConfirmPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
              </div>
            </fieldset>

            <button

              type="submit"
              disabled={loading}
              className="btn-gold w-full py-4 tracking-widest text-sm flex items-center justify-center group disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : (
                <>CREAR CUENTA <ArrowRight className="ml-2 w-4 h-4 group-hover:translate-x-1 transition-transform" /></>
              )}
            </button>
          </form>

          <p className="mt-8 text-center text-sm text-white/40">
            ¿Ya tienes cuenta?{' '}
            <Link to="/login" className="text-manchester-white font-bold hover:text-manchester-gold transition-colors">Inicia sesión</Link>
          </p>
        </div>
      </motion.div>
    </div>
  );
};

export default Register;
