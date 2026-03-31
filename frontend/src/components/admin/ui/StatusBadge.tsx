import React from 'react';
import { getOrderStatusLabel, getOrderStatusColor } from '../../../types';

interface StatusBadgeProps {
  status: string | number;
  overrideText?: string;
}

const StatusBadge: React.FC<StatusBadgeProps> = ({ status, overrideText }) => {
  // Manejar el caso de que el status venga como numero o string
  // En nuestro backend es el número del enum, pero la DB podría retornarlo como string
  // Usaremos un string mapping genérico por seguridad.
  const statusStr = String(status);
  
  const label = overrideText || getOrderStatusLabel(statusStr);
  const color = getOrderStatusColor(statusStr);

  let badgeClass = 'admin-badge--yellow'; // Default pending
  
  switch(color) {
    case 'blue': badgeClass = 'admin-badge--blue'; break;
    case 'green': badgeClass = 'admin-badge--green'; break;
    case 'red': badgeClass = 'admin-badge--red'; break;
  }

  return (
    <span className={`admin-badge ${badgeClass}`}>
      {/* Iconito decorativo basado en color */}
      {color === 'yellow' && <span className="w-1.5 h-1.5 rounded-full bg-yellow-400/50" />}
      {color === 'blue' && <span className="w-1.5 h-1.5 rounded-full bg-blue-400/50" />}
      {color === 'green' && <span className="w-1.5 h-1.5 rounded-full bg-emerald-400/50" />}
      {color === 'red' && <span className="w-1.5 h-1.5 rounded-full bg-red-400/50" />}
      
      {label}
    </span>
  );
};

export default StatusBadge;
