import React, { useState } from 'react';
import { User as UserIcon, Mail, Lock, Eye, EyeOff, ArrowRight, Loader2, CheckCircle2, Circle, X } from 'lucide-react';
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
  const [acceptedTerms, setAcceptedTerms] = useState(false);
  const [showTermsModal, setShowTermsModal] = useState(false);

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

    if (!acceptedTerms) {
      return setError('Debes leer y aceptar los Términos y Condiciones para crear tu cuenta.');
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

            <div className="flex items-start gap-3">
              <div className="flex items-center h-5 mt-0.5">
                <input
                  id="terms"
                  type="checkbox"
                  checked={acceptedTerms}
                  onChange={(e) => setAcceptedTerms(e.target.checked)}
                  className="w-4 h-4 cursor-pointer"
                  style={{ accentColor: '#D4AF37' }}
                />
              </div>
              <div className="text-sm">
                <label htmlFor="terms" className="text-white/60 cursor-pointer">
                  He leído y acepto los{' '}
                </label>
                <button
                  type="button"
                  onClick={() => setShowTermsModal(true)}
                  className="text-manchester-gold hover:text-white transition-colors underline underline-offset-4 decoration-manchester-gold/30 hover:decoration-white font-medium"
                >
                  Términos y Condiciones
                </button>
              </div>
            </div>

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

      {/* Terms and Conditions Modal */}
      {showTermsModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="w-full max-w-2xl max-h-[80vh] flex flex-col card-premium overflow-hidden border border-white/10"
          >
            <div className="p-6 border-b border-white/10 flex items-center justify-between bg-white/5">
              <h3 className="text-xl font-bold tracking-widest text-manchester-gold uppercase">Términos y Condiciones</h3>
              <button 
                onClick={() => setShowTermsModal(false)}
                className="text-white/50 hover:text-white transition-colors p-1"
                type="button"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <div className="p-6 overflow-y-auto custom-scrollbar text-white/70 space-y-4 text-sm bg-black/20">
  {/* === INICIO DE ÁREA PARA TÉRMINOS Y CONDICIONES === */}
  
  <div>
    <p><strong>TÉRMINOS Y CONDICIONES DE USO</strong></p>
    <p><strong>Manchester Clothing Store</strong></p>
  </div>

  <div>
    <p><strong>1. Identificación del responsable</strong></p>
    <p>
      La aplicación <strong>Manchester Clothing Store</strong> es un proyecto desarrollado por 
      <strong>[Tu nombre completo o nombre de la organización]</strong>, quien actúa como responsable del tratamiento de los datos personales y de la operación de la plataforma.
    </p>
  </div>

  <div>
    <p><strong>2. Aceptación de los términos</strong></p>
    <p>
      Al acceder y utilizar la aplicación, el usuario declara haber leído, entendido y aceptado los presentes Términos y Condiciones en su totalidad. 
      En caso de no estar de acuerdo, deberá abstenerse de utilizar la plataforma.
    </p>
  </div>

  <div>
    <p><strong>3. Descripción del servicio</strong></p>
    <p>
      Manchester Clothing Store es una aplicación web orientada a la gestión y comercialización de productos de ropa. 
      Permite a los usuarios: consultar productos, registrar información, administrar inventario (según permisos) e interactuar con funcionalidades propias del sistema.
    </p>
  </div>

  <div>
    <p><strong>4. Registro de usuarios</strong></p>
    <p>
      Para acceder a ciertas funcionalidades, el usuario deberá registrarse proporcionando información veraz, completa y actualizada. 
      El usuario se compromete a mantener la confidencialidad de sus credenciales, notificar cualquier uso no autorizado de su cuenta y ser responsable de toda actividad realizada desde su cuenta.
    </p>
  </div>

  <div>
    <p><strong>5. Uso adecuado del servicio</strong></p>
    <p>
      El usuario se compromete a hacer un uso adecuado de la plataforma y a no utilizarla con fines ilegales o fraudulentos, intentar acceder sin autorización a sistemas o datos, introducir virus, malware o código malicioso, alterar el funcionamiento normal de la aplicación, ni suplantar la identidad de otros usuarios.
    </p>
  </div>

  <div>
    <p><strong>6. Propiedad intelectual</strong></p>
    <p>
      Todos los derechos sobre el contenido de la aplicación, incluyendo código fuente, diseño, estructura, base de datos y funcionalidades, pertenecen al desarrollador o cuentan con licencia para su uso. 
      Queda prohibida su reproducción, distribución o modificación sin autorización previa.
    </p>
  </div>

  <div>
    <p><strong>7. Protección de datos personales</strong></p>
    <p>
      Los datos personales proporcionados por los usuarios serán tratados conforme a la normativa vigente en Colombia, en especial la Ley 1581 de 2012. 
      El usuario tiene derecho a conocer, actualizar y rectificar sus datos, solicitar la eliminación de su información y revocar la autorización del tratamiento de datos. 
      La información será almacenada de forma segura y no será compartida con terceros sin consentimiento, salvo obligación legal.
    </p>
  </div>

  <div>
    <p><strong>8. Condiciones comerciales</strong></p>
    <p>
      Los productos ofrecidos en la plataforma están sujetos a disponibilidad, pueden cambiar de precio sin previo aviso y pueden ser modificados o retirados en cualquier momento. 
      Manchester Clothing Store no garantiza la disponibilidad permanente de todos los productos publicados.
    </p>
  </div>

  <div>
    <p><strong>9. Limitación de responsabilidad</strong></p>
    <p>
      El uso de la plataforma se realiza bajo responsabilidad del usuario. 
      El desarrollador no será responsable por fallos técnicos, pérdida de datos, daños directos o indirectos derivados del uso de la plataforma, ni accesos no autorizados por terceros.
    </p>
  </div>

  <div>
    <p><strong>10. Modificaciones</strong></p>
    <p>
      El desarrollador se reserva el derecho de modificar estos términos en cualquier momento. 
      Las modificaciones serán publicadas en la plataforma y entrarán en vigor desde su publicación.
    </p>
  </div>

  <div>
    <p><strong>11. Suspensión o terminación del servicio</strong></p>
    <p>Se podrá suspender o cancelar el acceso a cualquier usuario que incumpla estos términos, sin previo aviso.</p>
  </div>

  <div>
    <p><strong>12. Legislación aplicable</strong></p>
    <p>
      Estos términos se rigen por las leyes de la República de Colombia. 
      Cualquier controversia será resuelta ante las autoridades competentes del país.
    </p>
  </div>

  <div>
    <p><strong>13. Contacto</strong></p>
    <p>
      Para dudas, solicitudes o ejercicio de derechos sobre datos personales, el usuario puede comunicarse a: 
      <strong><a href="mailto:tuemail@ejemplo.com">tuemail@ejemplo.com</a></strong>
    </p>
  </div>

  {/* === FIN DE ÁREA PARA TÉRMINOS Y CONDICIONES === */}
</div>

            <div className="p-6 border-t border-white/10 flex justify-end bg-white/5">
              <button
                type="button"
                onClick={() => {
                  setAcceptedTerms(true);
                  setShowTermsModal(false);
                }}
                className="btn-gold py-3 px-8 text-xs tracking-widest flex items-center gap-2 group"
              >
                ACEPTAR Y CERRAR
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
};

export default Register;
