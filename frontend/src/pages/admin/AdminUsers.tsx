import React, { useEffect, useState } from 'react';
import { adminUserService } from '../../api/adminServices';
import { AdminTable } from '../../components/admin/ui/AdminTable';
import AdminModal from '../../components/admin/ui/AdminModal';
import { AdminFormField } from '../../components/admin/ui/AdminFormField';
import ConfirmDialog from '../../components/admin/ui/ConfirmDialog';
import { Shield, ShieldAlert, Edit2, Trash2, Loader2, Users } from 'lucide-react';
import toast from 'react-hot-toast';

const AdminUsers: React.FC = () => {
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  
  // Modals Data
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<any | null>(null);
  const [newRole, setNewRole] = useState<string>('3');

  // Deletion Modal
  const [deleteData, setDeleteData] = useState<{isOpen: boolean, id: string, name: string}>({
    isOpen: false, id: '', name: ''
  });

  const loadUsers = async () => {
    try {
      setLoading(true);
      const data = await adminUserService.getAll();
      setUsers(data);
    } catch (err) {
      console.error("Error loading users:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadUsers();
  }, []);

  // --- ACTIONS ---
  const handleOpenEdit = (user: any) => {
    setSelectedUser(user);
    setNewRole(user.roleId.toString());
    setIsModalOpen(true);
  };

  const handleSaveRole = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedUser) return;
    
    try {
      setSaving(true);
      await adminUserService.updateRole(selectedUser.id, parseInt(newRole));
      setIsModalOpen(false);
      await loadUsers();
    } catch (err: any) {
      const msg = err.response?.data || "Hubo un error al actualizar el rol.";
      toast.error(typeof msg === 'string' ? msg : "Error desconocido");
    } finally {
      setSaving(false);
    }
  };

  const confirmDelete = (user: any) => {
    setDeleteData({ isOpen: true, id: user.id, name: user.fullName });
  };

  const executeDelete = async () => {
    try {
      setSaving(true);
      await adminUserService.delete(deleteData.id);
      setDeleteData({ isOpen: false, id: '', name: '' });
      await loadUsers();
    } catch (err: any) {
      const msg = err.response?.data || "No se pudo eliminar el usuario.";
      toast.error(typeof msg === 'string' ? msg : "La cuenta podría pertenecer al mismo administrador activo u otro Administrador en el sistema, lo cual está bloqueado.");
    } finally {
      setSaving(false);
    }
  };

  // --- COLUMNS ---
  const columns = [
    { 
      header: 'Usuario', 
      accessor: (u: any) => (
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-white/5 border border-white/10 flex items-center justify-center">
            {u.roleId === 1 ? <ShieldAlert className="w-5 h-5 text-red-400" /> : <Users className="w-5 h-5 text-white/40" />}
          </div>
          <div>
            <p className="font-bold text-white text-sm">{u.fullName}</p>
            <p className="text-[10px] text-white/40 tracking-wider font-mono mt-0.5">{u.id.substring(0, 8)}...</p>
          </div>
        </div>
      ) 
    },
    { 
      header: 'Correo', 
      accessor: (u: any) => <span className="text-white/70">{u.email}</span>
    },
    { 
      header: 'Rango Actual', 
      accessor: (u: any) => {
        const isAd = u.roleId === 1;
        const isVen = u.roleId === 2;
        return (
          <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold ${
            isAd ? 'bg-red-500/10 text-red-400 border border-red-500/20' : 
            isVen ? 'bg-manchester-gold/10 text-manchester-gold border border-manchester-gold/20' : 
            'bg-white/5 text-white/50 border border-white/10'
          }`}>
            {isAd && <ShieldAlert className="w-3 h-3" />}
            {isVen && <Shield className="w-3 h-3" />}
            {u.roleLabel.toUpperCase()}
          </span>
        )
      }
    },
    { 
      header: 'Acciones Políticas', 
      className: 'text-right',
      accessor: (u: any) => (
        <div className="flex items-center justify-end gap-2">
          <button 
            type="button"
            onClick={() => handleOpenEdit(u)}
            className="p-2 bg-white/5 hover:bg-manchester-gold/20 text-white/60 hover:text-manchester-gold transition-colors rounded-lg"
            title="Cambiar Rango"
          >
            <Edit2 className="w-4 h-4" />
          </button>
          <button 
            type="button"
            onClick={() => confirmDelete(u)}
            className="p-2 bg-white/5 hover:bg-red-500/20 text-white/60 hover:text-red-400 transition-colors rounded-lg"
            title="Dar de Baja"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      ) 
    },
  ];

  return (
    <div className="admin-page-enter space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-serif font-bold tracking-tight mb-1 text-red-50">Base de Usuarios</h1>
          <p className="text-sm text-white/40">Cambia rangos y restringe accesos de todo el sitio</p>
        </div>
      </div>

      <AdminTable 
        data={users} 
        columns={columns} 
        keyExtractor={(u) => u.id} 
        loading={loading}
        emptyMessage="No hay usuarios en la plataforma."
      />

      {/* EDIT ROLE MODAL */}
      <AdminModal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
        title="Escalar Rango"
      >
        {selectedUser && (
          <form onSubmit={handleSaveRole} className="space-y-4">
            
            <div className="bg-red-500/5 border border-red-500/10 p-4 rounded-xl mb-6 flex flex-col gap-1">
              <span className="text-[10px] uppercase tracking-widest text-red-400 font-bold mb-1">¡Cuidado!</span>
              <span className="text-sm text-white/80 leading-relaxed">
                Estás a punto de modificar los credenciales base de <b>{selectedUser.fullName}</b>.
                Otorgar privilegios de Administrador le dará acceso total a este mismo panel de manera permanente.
              </span>
            </div>

            <AdminFormField 
              label="Asignar Nuevo Nivel" 
              type="select" 
              value={newRole} 
              onChange={e => setNewRole(e.target.value)} 
              options={[
                { value: '1', label: '1 - ADMINISTRADOR ABSOLUTO' },
                { value: '2', label: '2 - Vendedor/Colaborador' },
                { value: '3', label: '3 - Cliente Base' },
              ]}
              required 
            />

            <div className="flex justify-end gap-3 mt-8 pt-6 border-t border-white/10">
              <button 
                type="button"
                disabled={saving}
                className="admin-btn admin-btn--secondary" 
                onClick={() => setIsModalOpen(false)}
              >
                Cancelar
              </button>
              <button 
                type="submit"
                disabled={saving}
                className="btn-gold flex items-center justify-center gap-2 min-w-[120px] px-4 py-2 border border-red-500/20 bg-red-500/10 hover:bg-red-500/20 text-red-100 hover:text-white transition-colors"
                style={{borderColor: 'rgba(239, 68, 68, 0.2)'}}
              >
                {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <><ShieldAlert className="w-4 h-4" /> Modificar Rol</>}
              </button>
            </div>
          </form>
        )}
      </AdminModal>

      {/* CONFIRM DELETE */}
      <ConfirmDialog 
        isOpen={deleteData.isOpen}
        onClose={() => setDeleteData({ isOpen: false, id: '', name: '' })}
        onConfirm={executeDelete}
        loading={saving}
        title="Dar de Baja a Usuario"
        message={`¿Confirma la eliminación permanente de la cuenta "${deleteData.name}"? Toda su información de registro dejará de existir. Un administrador no puede borrar a otro administrador.`}
        confirmText="Confirmar Baja Total"
      />
    </div>
  );
};

export default AdminUsers;
