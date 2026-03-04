import { Facebook, Instagram, Twitter, Youtube, Mail, MapPin, Phone } from 'lucide-react';
import { Link } from 'react-router-dom';

const Footer = () => {
  return (
    <footer className="bg-manchester-dark border-t border-white/5 pt-16 pb-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-16">
          {/* Brand */}
          <div className="space-y-6">
            <Link to="/" className="text-2xl font-bold tracking-tighter text-manchester-white">
              MANCHESTER
            </Link>
            <p className="text-white/50 text-sm leading-relaxed max-w-xs">
              Redefiniendo el lujo contemporáneo con una estética minimalista y materiales de la más alta calidad.
            </p>
            <div className="flex space-x-4">
              <Instagram className="w-5 h-5 text-white/40 hover:text-manchester-gold cursor-pointer transition-colors" />
              <Facebook className="w-5 h-5 text-white/40 hover:text-manchester-gold cursor-pointer transition-colors" />
              <Twitter className="w-5 h-5 text-white/40 hover:text-manchester-gold cursor-pointer transition-colors" />
              <Youtube className="w-5 h-5 text-white/40 hover:text-manchester-gold cursor-pointer transition-colors" />
            </div>
          </div>

          {/* Enlaces */}
          <div>
            <h4 className="text-sm font-bold tracking-widest text-manchester-gold mb-6">COMPRAR</h4>
            <ul className="space-y-4">
              <li><Link to="/hombre" className="text-white/50 hover:text-white transition-colors text-sm">Hombre</Link></li>
              <li><Link to="/mujer" className="text-white/50 hover:text-white transition-colors text-sm">Mujer</Link></li>
              <li><Link to="/accesorios" className="text-white/50 hover:text-white transition-colors text-sm">Accesorios</Link></li>
              <li><Link to="/nuevos" className="text-white/50 hover:text-white transition-colors text-sm">Nuevos Ingresos</Link></li>
            </ul>
          </div>

          {/* Ayuda */}
          <div>
            <h4 className="text-sm font-bold tracking-widest text-manchester-gold mb-6">AYUDA</h4>
            <ul className="space-y-4">
              <li><Link to="/soporte" className="text-white/50 hover:text-white transition-colors text-sm">Soporte</Link></li>
              <li><Link to="/envios" className="text-white/50 hover:text-white transition-colors text-sm">Envíos y Devoluciones</Link></li>
              <li><Link to="/tallas" className="text-white/50 hover:text-white transition-colors text-sm">Guía de Tallas</Link></li>
              <li><Link to="/contacto" className="text-white/50 hover:text-white transition-colors text-sm">Contacto</Link></li>
            </ul>
          </div>

          {/* Contacto */}
          <div>
            <h4 className="text-sm font-bold tracking-widest text-manchester-gold mb-6">CONTACTO</h4>
            <ul className="space-y-4">
              <li className="flex items-start space-x-3">
                <MapPin className="w-5 h-5 text-manchester-gold shrink-0" />
                <span className="text-white/50 text-sm">Calle de Lujo 123, Central District, Manchester</span>
              </li>
              <li className="flex items-center space-x-3">
                <Phone className="w-5 h-5 text-manchester-gold shrink-0" />
                <span className="text-white/50 text-sm">+44 123 456 7890</span>
              </li>
              <li className="flex items-center space-x-3">
                <Mail className="w-5 h-5 text-manchester-gold shrink-0" />
                <span className="text-white/50 text-sm">support@manchester.store</span>
              </li>
            </ul>
          </div>
        </div>

        <div className="pt-8 border-t border-white/5 text-center">
          <p className="text-white/30 text-xs tracking-widest uppercase">
            &copy; 2026 MANCHESTER CLOTHING STORE. TODOS LOS DERECHOS RESERVADOS.
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
