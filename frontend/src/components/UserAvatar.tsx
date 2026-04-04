import React from 'react';

interface UserAvatarProps {
  name?: string;
  role?: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
}

const getInitials = (name: string) => {
  if (!name) return '?';
  const parts = name.trim().split(/\s+/);
  if (parts.length === 1) return parts[0].substring(0, 2).toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
};

const UserAvatar: React.FC<UserAvatarProps> = ({ name = 'Usuario', role = 'Cliente', size = 'md', className = '' }) => {
  const initials = getInitials(name);

  // Determinar los colores basados en el rol para darle un toque especial de jerarquía
  let colorClass = 'bg-manchester-gold/20 text-manchester-gold border-manchester-gold/30'; // Default Cliente
  
  if (role === 'Admin') {
    colorClass = 'bg-red-500/20 text-red-500 border-red-500/30';
  } else if (role === 'Vendedor') {
    colorClass = 'bg-cyan-400/20 text-cyan-400 border-cyan-400/30';
  }

  // Dimensiones
  const sizeClasses = {
    sm: 'w-8 h-8 text-[10px]',
    md: 'w-10 h-10 text-xs',
    lg: 'w-16 h-16 text-xl',
    xl: 'w-24 h-24 text-3xl'
  };

  return (
    <div 
      className={`relative flex items-center justify-center rounded-full border border-solid ${colorClass} ${sizeClasses[size]} ${className}`}
      title={name}
    >
      <span className="font-bold tracking-wider">{initials}</span>
    </div>
  );
};

export default UserAvatar;
