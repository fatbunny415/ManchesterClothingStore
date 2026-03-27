import React from 'react';
import AdminModal from './AdminModal';
import { AlertCircle, Loader2 } from 'lucide-react';

interface ConfirmDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  isDestructive?: boolean;
  loading?: boolean;
}

const ConfirmDialog: React.FC<ConfirmDialogProps> = ({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
  confirmText = 'Confirmar',
  cancelText = 'Cancelar',
  isDestructive = true,
  loading = false
}) => {
  return (
    <AdminModal isOpen={isOpen} onClose={onClose} title={title} maxWidth="sm">
      <div className="flex flex-col items-center text-center pb-2">
        <div className={`w-16 h-16 rounded-full flex items-center justify-center mb-4 ${isDestructive ? 'bg-red-500/10 text-red-400' : 'bg-manchester-gold/10 text-manchester-gold'}`}>
          <AlertCircle className="w-8 h-8" />
        </div>
        
        <p className="text-white/60 text-sm mb-8 leading-relaxed">
          {message}
        </p>

        <div className="flex w-full gap-3">
          <button
            type="button"
            onClick={onClose}
            disabled={loading}
            className="flex-1 admin-btn admin-btn--secondary justify-center"
          >
            {cancelText}
          </button>
          
          <button
            type="button"
            onClick={onConfirm}
            disabled={loading}
            className={`flex-1 admin-btn justify-center ${isDestructive ? 'admin-btn--danger' : 'admin-btn--primary'}`}
          >
            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : confirmText}
          </button>
        </div>
      </div>
    </AdminModal>
  );
};

export default ConfirmDialog;
