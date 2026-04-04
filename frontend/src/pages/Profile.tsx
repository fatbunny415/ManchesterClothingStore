import React, { useState, useEffect } from 'react';
import { useAuthStore } from '../store/useAuthStore';
import { userService } from '../api/services';
import UserAvatar from '../components/UserAvatar';
import { Save, Loader2, Phone, MapPin, Building, Mail, Shield } from 'lucide-react';
import toast from 'react-hot-toast';

const Profile = () => {
  const { user, updateUser } = useAuthStore();
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    fullName: '',
    phoneNumber: '',
    address: '',
    city: ''
  });

  useEffect(() => {
    if (user) {
      setFormData({
        fullName: user.fullName || '',
        phoneNumber: user.phoneNumber || '',
        address: user.address || '',
        city: user.city || ''
      });
    }
    // Opcional: Re-hacer fetch de /users/me para tener los datos más recientes al montar,
    // pero el login y el store ya deberían tener la data si se modificó Recien.
  }, [user]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      const resp = await userService.updateProfile(formData);
      // Mapear "user" del response (resp.user) al store
      updateUser(resp.user);
      toast.success('PERFIL ACTUALIZADO CON ÉXITO', {
        icon: '✅',
        style: {
          background: '#D4AF37',
          color: '#000',
          fontWeight: 'bold',
          letterSpacing: '0.1em'
        }
      });
    } catch (error) {
      console.error(error);
      toast.error('Error al actualizar el perfil.');
    } finally {
      setIsLoading(false);
    }
  };

  if (!user) return null;

  return (
    <div className="min-h-screen bg-manchester-black pt-24 pb-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto space-y-8">
        
        {/* Header - Portada Premium */}
        <div className="relative rounded-2xl bg-gradient-to-br from-white/5 to-white/0 border border-white/10 overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-32 bg-gradient-to-r from-manchester-gold/20 via-transparent to-transparent opacity-30"></div>
          
          <div className="relative px-8 py-10 flex flex-col sm:flex-row items-center gap-8">
            <UserAvatar name={formData.fullName || user.fullName} role={user.role} size="xl" className="shadow-2xl shadow-manchester-gold/10" />
            <div className="text-center sm:text-left">
              <h1 className="text-3xl font-serif font-bold tracking-wider">{user.fullName}</h1>
              <div className="flex flex-col sm:flex-row items-center gap-3 mt-3 text-white/50 text-sm tracking-widest font-semibold uppercase">
                <span className="flex items-center gap-2">
                  <Mail className="w-4 h-4 text-manchester-gold" /> {user.email}
                </span>
                <span className="hidden sm:inline">•</span>
                <span className="flex items-center gap-2">
                  <Shield className="w-4 h-4 text-manchester-gold" /> Rol: {user.role}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Formulario de Datos Particulares */}
        <div className="bg-manchester-dark/50 p-8 rounded-2xl border border-white/5 shadow-xl">
          <h2 className="text-xl font-bold tracking-widest mb-6 uppercase border-b border-white/10 pb-4">
            Información Personal
          </h2>
          
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              
              <div className="space-y-2">
                <label className="text-xs uppercase tracking-widest text-white/40 font-bold block">Nombre Completo</label>
                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-white/20">
                    <UserAvatar name="N" size="sm" className="opacity-0 hidden" /> 
                    {/* Placeholder Icono */}
                  </span>
                  <input
                    type="text"
                    name="fullName"
                    value={formData.fullName}
                    onChange={handleChange}
                    className="w-full bg-black/50 border border-white/10 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-manchester-gold focus:ring-1 focus:ring-manchester-gold transition-all"
                    placeholder="Tu nombre y apellido"
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-xs uppercase tracking-widest text-white/40 font-bold block">Teléfono de Contacto</label>
                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-white/20">
                    <Phone className="w-4 h-4" />
                  </span>
                  <input
                    type="tel"
                    name="phoneNumber"
                    value={formData.phoneNumber}
                    onChange={handleChange}
                    className="w-full bg-black/50 border border-white/10 rounded-xl pl-12 pr-4 py-3 text-sm focus:outline-none focus:border-manchester-gold focus:ring-1 focus:ring-manchester-gold transition-all"
                    placeholder="+57 300 000 0000"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-xs uppercase tracking-widest text-white/40 font-bold block">Dirección de Envío</label>
                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-white/20">
                    <MapPin className="w-4 h-4" />
                  </span>
                  <input
                    type="text"
                    name="address"
                    value={formData.address}
                    onChange={handleChange}
                    className="w-full bg-black/50 border border-white/10 rounded-xl pl-12 pr-4 py-3 text-sm focus:outline-none focus:border-manchester-gold focus:ring-1 focus:ring-manchester-gold transition-all"
                    placeholder="Cra 12 # 34-56 Apto 101"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-xs uppercase tracking-widest text-white/40 font-bold block">Ciudad</label>
                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-white/20">
                    <Building className="w-4 h-4" />
                  </span>
                  <input
                    type="text"
                    name="city"
                    value={formData.city}
                    onChange={handleChange}
                    className="w-full bg-black/50 border border-white/10 rounded-xl pl-12 pr-4 py-3 text-sm focus:outline-none focus:border-manchester-gold focus:ring-1 focus:ring-manchester-gold transition-all"
                    placeholder="Bogotá D.C."
                  />
                </div>
              </div>
            </div>

            <div className="pt-6 border-t border-white/5 flex justify-end">
              <button
                type="submit"
                disabled={isLoading}
                className="btn-gold py-3 px-8 text-xs tracking-[0.2em] flex items-center gap-2 group disabled:opacity-50"
              >
                {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4 group-hover:scale-110 transition-transform" />}
                GUARDAR CAMBIOS
              </button>
            </div>
          </form>
        </div>

      </div>
    </div>
  );
};

export default Profile;
