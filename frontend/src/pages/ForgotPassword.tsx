import React, { useState } from 'react';
import { Mail, ArrowRight, ArrowLeft, Loader2, CheckCircle2, Lock, Eye, EyeOff, MessageSquare } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { authService } from '../api/services';
import { motion, AnimatePresence } from 'framer-motion';

const ForgotPassword = () => {
  const navigate = useNavigate();

  // Workflow states: 1: Request Email, 2: Verify OTP, 3: Reset Password, 4: Success
  const [step, setStep] = useState<1 | 2 | 3 | 4>(1);

  // Form states
  const [email, setEmail] = useState('');
  const [token, setToken] = useState(''); // OTP code
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  
  // UI states
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // ------------------------------------
  // STEP 1: SOLICITAR CÓDIGO
  // ------------------------------------
  const handleRequestCode = async (e: React.FormEvent) => {
    e.preventDefault();
    const cleanEmail = email.trim();

    if (!cleanEmail) {
      return setError('Por favor, ingresa tu correo electrónico.');
    }

    setLoading(true);
    setError('');

    try {
      await authService.forgotPassword(cleanEmail);
      setStep(2);
    } catch (err: any) {
      if (err.response?.status === 404) {
        // Obfuscate whether email exists for security (OWASP)
        setStep(2);
      } else {
        setError(err.response?.data?.message || 'Hubo un error al procesar la solicitud.');
      }
    } finally {
      setLoading(false);
    }
  };

  // ------------------------------------
  // REENVIAR CÓDIGO
  // ------------------------------------
  const handleResendCode = async () => {
    setLoading(true);
    setError('');
    try {
      await authService.forgotPassword(email.trim());
      setError('Se ha enviado un nuevo código a tu correo.'); // Reusing error box for info temporarily
    } catch (err: any) {
       // OWASP obfuscation
       setError('Se ha enviado un nuevo código a tu correo.');
    } finally {
      setLoading(false);
    }
  }

  // ------------------------------------
  // STEP 2: VERIFICAR CÓDIGO
  // ------------------------------------
  const handleVerifyCode = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token || token.length < 6) {
      return setError('Por favor, ingresa el código de 6 dígitos.');
    }

    setLoading(true);
    setError('');

    try {
      await authService.verifyResetCode(email, token);
      setStep(3); // Code is valid! Proceed to reset
    } catch (err: any) {
      setError(err.response?.data?.message || 'El código es inválido o ha expirado.');
    } finally {
      setLoading(false);
    }
  };

  // ------------------------------------
  // STEP 3: RESTABLECER CONTRASEÑA
  // ------------------------------------
  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (password.length < 8) {
      return setError('La contraseña debe tener al menos 8 caracteres.');
    }
    if (password !== confirmPassword) {
      return setError('Las contraseñas no coinciden.');
    }

    setLoading(true);
    setError('');

    try {
      await authService.resetPassword(email, token, password);
      setStep(4);
      
      // Auto redirect to login after 3 seconds
      setTimeout(() => {
        navigate('/login');
      }, 3000);

    } catch (err: any) {
      setError(err.response?.data?.message || 'Error al restablecer la contraseña. Puedes haber excedido el tiempo.');
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
        className="max-w-md w-full relative z-10"
      >
        <div className="text-left mb-6 flex justify-between items-center">
          <Link to="/login" className="inline-flex items-center text-sm font-bold tracking-widest text-white/40 hover:text-white uppercase transition-colors">
            <ArrowLeft className="w-4 h-4 mr-2" /> Volver al Login
          </Link>
          {step > 1 && step < 4 && (
            <span className="text-[10px] text-white/30 uppercase tracking-widest font-bold">
              Paso {step} de 3
            </span>
          )}
        </div>

        <div className="card-premium p-8 md:p-10 relative overflow-hidden">
          
          {/* Progress bar visual */}
          {step < 4 && (
             <div className="absolute top-0 left-0 h-1 bg-white/5 w-full">
               <motion.div 
                 initial={{ width: '33%' }}
                 animate={{ width: `${(step / 3) * 100}%` }}
                 className="h-full bg-manchester-gold"
               />
             </div>
          )}

          <AnimatePresence mode="wait">
            {/* ======================================================== */}
            {/* STEP 1: PIDE EMAIL */}
            {/* ======================================================== */}
            {step === 1 && (
              <motion.div key="step1" initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 20 }} className="space-y-6">
                <div className="text-center mb-8">
                  <h2 className="text-2xl font-bold tracking-tighter mb-2">RECUPERAR CONTRASEÑA</h2>
                  <p className="text-white/40 text-sm leading-relaxed">Te enviaremos un código de seguridad de 6 dígitos a tu correo registrado.</p>
                </div>
                <form onSubmit={handleRequestCode} className="space-y-6">
                  {error && <div className="bg-red-500/10 border border-red-500/20 text-red-500 text-xs py-3 px-4 rounded-xl text-center">{error}</div>}
                  <fieldset disabled={loading} className={loading ? "opacity-50" : ""}>
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
                  </fieldset>
                  <button type="submit" disabled={loading} className="btn-gold w-full py-4 tracking-widest text-sm flex items-center justify-center group">
                    {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <>ENVIAR CÓDIGO <ArrowRight className="ml-2 w-4 h-4 group-hover:translate-x-1 transition-transform" /></>}
                  </button>
                </form>
              </motion.div>
            )}

            {/* ======================================================== */}
            {/* STEP 2:  PIDE CÓDIGO OTP */}
            {/* ======================================================== */}
            {step === 2 && (
              <motion.div key="step2" initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 20 }} className="space-y-6">
                <div className="text-center mb-6">
                  <h2 className="text-2xl font-bold tracking-tighter mb-2">CÓDIGO DE SEGURIDAD</h2>
                  <p className="text-white/40 text-sm leading-relaxed">
                    Hemos enviado un código a <strong className="text-white font-medium">{email}</strong>. Ingresa el código válido por 15 minutos.
                  </p>
                </div>
                <form onSubmit={handleVerifyCode} className="space-y-6">
                  {error && <div className={`border text-xs py-3 px-4 rounded-xl text-center ${error.includes('enviado') ? 'bg-blue-500/10 border-blue-500/20 text-blue-400' : 'bg-red-500/10 border-red-500/20 text-red-500'}`}>{error}</div>}
                  <fieldset disabled={loading} className={loading ? "opacity-50" : ""}>
                    <div>
                      <label className="block text-xs font-bold tracking-widest text-manchester-gold uppercase mb-3 ml-1 text-center">Código de 6 Dígitos</label>
                      <div className="relative group max-w-[200px] mx-auto">
                        <MessageSquare className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-white/20 group-focus-within:text-manchester-gold transition-colors duration-300" />
                        <input
                          type="text"
                          required
                          maxLength={6}
                          value={token}
                          onChange={(e) => setToken(e.target.value.replace(/\D/g, ''))} // only digits
                          className="input-field w-full pl-12 text-center text-xl tracking-[0.5em] font-mono font-bold"
                          placeholder="000000"
                        />
                      </div>
                    </div>
                  </fieldset>

                  <div className="space-y-3 pt-2">
                    <button type="submit" disabled={loading || token.length < 6} className="btn-gold w-full py-4 tracking-widest text-sm flex items-center justify-center group disabled:opacity-50">
                      {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <>VERIFICAR <ArrowRight className="ml-2 w-4 h-4 group-hover:translate-x-1 transition-transform" /></>}
                    </button>
                    <button type="button" onClick={handleResendCode} disabled={loading} className="w-full py-4 tracking-widest text-xs font-bold text-white/40 hover:text-white uppercase transition-colors">
                      Reenviar Código
                    </button>
                  </div>
                </form>
              </motion.div>
            )}

            {/* ======================================================== */}
            {/* STEP 3: NUEVA CONTRASEÑA */}
            {/* ======================================================== */}
            {step === 3 && (
              <motion.div key="step3" initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 20 }} className="space-y-6">
                 <div className="text-center mb-8">
                  <h2 className="text-2xl font-bold tracking-tighter mb-2">NUEVA CONTRASEÑA</h2>
                  <p className="text-white/40 text-sm leading-relaxed">El código ha sido verificado. Crea una nueva contraseña para tu cuenta.</p>
                </div>
                <form onSubmit={handleResetPassword} className="space-y-6">
                  {error && <div className="bg-red-500/10 border border-red-500/20 text-red-500 text-xs py-3 px-4 rounded-xl text-center">{error}</div>}
                  <fieldset disabled={loading} className={`space-y-6 ${loading ? "opacity-50" : ""}`}>
                    <div>
                      <label className="block text-xs font-bold tracking-widest text-manchester-gold uppercase mb-3 ml-1">Nueva Contraseña</label>
                      <div className="relative group">
                        <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-white/20 group-focus-within:text-manchester-gold transition-colors duration-300" />
                        <input
                          type={showPassword ? 'text' : 'password'}
                          required
                          value={password}
                          onChange={(e) => setPassword(e.target.value)}
                          className="input-field w-full pl-12 pr-12"
                          placeholder="Mínimo 8 caracteres"
                        />
                        <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-4 top-1/2 -translate-y-1/2 text-white/20 hover:text-white">
                          {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                        </button>
                      </div>
                    </div>

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
                        />
                        <button type="button" onClick={() => setShowConfirmPassword(!showConfirmPassword)} className="absolute right-4 top-1/2 -translate-y-1/2 text-white/20 hover:text-white">
                          {showConfirmPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                        </button>
                      </div>
                    </div>
                  </fieldset>

                  <button type="submit" disabled={loading} className="btn-gold w-full py-4 tracking-widest text-sm flex items-center justify-center group disabled:opacity-50">
                    {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <>ACTUALIZAR CONTRASEÑA <ArrowRight className="ml-2 w-4 h-4 group-hover:translate-x-1 transition-transform" /></>}
                  </button>
                </form>
              </motion.div>
            )}

            {/* ======================================================== */}
            {/* STEP 4: SUCCESS */}
            {/* ======================================================== */}
            {step === 4 && (
              <motion.div key="step4" initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="text-center space-y-6 py-4">
                <div className="w-16 h-16 bg-green-500/10 rounded-full flex items-center justify-center mx-auto border border-green-500/20">
                  <CheckCircle2 className="w-8 h-8 text-green-500" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-white mb-2">¡Contraseña Cambiada!</h3>
                  <p className="text-sm text-white/60 leading-relaxed">
                    Tu contraseña se ha actualizado correctamente. Serás redirigido al inicio de sesión en unos segundos...
                  </p>
                </div>
                <Link to="/login" className="btn-gold w-full block mt-8 py-3 text-sm tracking-widest text-center">
                  IR AL LOGIN AHORA
                </Link>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </motion.div>
    </div>
  );
};

export default ForgotPassword;
