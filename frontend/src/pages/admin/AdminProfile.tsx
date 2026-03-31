import React, { useEffect, useState } from 'react';
import { adminUserService } from '../../api/adminServices';
import { AdminFormField } from '../../components/admin/ui/AdminFormField';
import { User, Shield, KeyRound, Loader2, CheckCircle2 } from 'lucide-react';
import type { User as UserType } from '../../types';

const AdminProfile: React.FC = () => {
  const [user, setUser] = useState<UserType | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  
  const [passwords, setPasswords] = useState({
    current: '',
    new: '',
    confirm: ''
  });

  useEffect(() => {
    const fetchMe = async () => {
      try {
        const data = await adminUserService.getMe();
        setUser(data);
      } catch (err) {
        console.error("Error loading profile:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchMe();
  }, []);

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setSuccessMsg('');
    setErrorMsg('');

    if (passwords.new !== passwords.confirm) {
      return setErrorMsg('Las contraseñas nuevas no coinciden');
    }
    if (passwords.new.length < 8) {
      return setErrorMsg('La nueva contraseña debe tener al menos 8 caracteres');
    }

    try {
      setSaving(true);
      await adminUserService.changePassword(passwords.current, passwords.new);
      setSuccessMsg('Contraseña actualizada correctamente.');
      setPasswords({ current: '', new: '', confirm: '' });
    } catch (err: any) {
      setErrorMsg(err.response?.data?.message || 'Hubo un error al cambiar la contraseña.');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="admin-page-enter flex flex-col items-center justify-center min-h-[60vh]">
        <div className="w-12 h-12 border-4 border-manchester-gold border-t-transparent rounded-full animate-spin"></div>
        <p className="mt-4 text-manchester-gold text-xs font-bold tracking-widest uppercase">Cargando perfil...</p>
      </div>
    );
  }

  return (
    <div className="admin-page-enter max-w-4xl mx-auto space-y-8">
      <div>
        <h1 className="text-3xl font-serif font-bold tracking-tight mb-1">Mi Perfil</h1>
        <p className="text-sm text-white/40">Gestiona tu información de Administrador</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        
        {/* INFO CARD */}
        <div className="md:col-span-1 border border-white/[0.04] bg-[#111] rounded-2xl p-8 flex flex-col items-center text-center">
          <div className="w-24 h-24 bg-manchester-gold/10 border border-manchester-gold/30 rounded-full flex items-center justify-center mb-6">
            <User className="w-10 h-10 text-manchester-gold" />
          </div>
          <h2 className="text-xl font-bold text-white mb-1">{user?.fullName}</h2>
          <p className="text-sm text-white/50 mb-6">{user?.email}</p>
          
          <div className="inline-flex items-center gap-2 bg-manchester-gold/10 px-4 py-2 rounded-full border border-manchester-gold/20">
            <Shield className="w-4 h-4 text-manchester-gold" />
            <span className="text-xs font-bold text-manchester-gold tracking-widest uppercase">{user?.role}</span>
          </div>
        </div>

        {/* SECURE ZONE */}
        <div className="md:col-span-2 border border-white/[0.04] bg-[#111] rounded-2xl p-8">
          <div className="flex items-center gap-3 mb-6 pb-4 border-b border-white/5">
            <KeyRound className="w-5 h-5 text-white/50" />
            <h2 className="text-lg font-bold text-white">Cambiar Contraseña</h2>
          </div>

          {successMsg && (
            <div className="mb-6 p-4 rounded-xl bg-green-500/10 border border-green-500/20 text-green-400 text-sm flex items-center gap-3">
              <CheckCircle2 className="w-5 h-5 shrink-0" />
              <p>{successMsg}</p>
            </div>
          )}

          {errorMsg && (
            <div className="mb-6 p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-sm">
              <p>{errorMsg}</p>
            </div>
          )}

          <form onSubmit={handleChangePassword} className="space-y-4">
            <AdminFormField 
              label="Contraseña Actual" 
              type="password" 
              value={passwords.current}
              onChange={e => setPasswords({...passwords, current: e.target.value})}
              required 
            />
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <AdminFormField 
                label="Nueva Contraseña" 
                type="password" 
                value={passwords.new}
                onChange={e => setPasswords({...passwords, new: e.target.value})}
                required 
              />
              <AdminFormField 
                label="Confirmar Nueva" 
                type="password" 
                value={passwords.confirm}
                onChange={e => setPasswords({...passwords, confirm: e.target.value})}
                required 
              />
            </div>
            
            <div className="pt-4 flex justify-end">
              <button 
                type="submit" 
                disabled={saving}
                className="btn-gold min-w-[180px] flex justify-center py-2.5"
              >
                {saving ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Actualizar Contraseña'}
              </button>
            </div>
          </form>

        </div>
      </div>
    </div>
  );
};

export default AdminProfile;
