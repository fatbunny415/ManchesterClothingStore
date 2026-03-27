import React from 'react';
import { Loader2 } from 'lucide-react';

interface Column<T> {
  header: string;
  accessor: keyof T | ((item: T) => React.ReactNode);
  className?: string;
}

interface AdminTableProps<T> {
  data: T[];
  columns: Column<T>[];
  keyExtractor: (item: T) => string | number;
  loading?: boolean;
  emptyMessage?: string;
}

export function AdminTable<T>({ 
  data, 
  columns, 
  keyExtractor, 
  loading, 
  emptyMessage = 'No hay registros para mostrar.' 
}: AdminTableProps<T>) {
  
  if (loading) {
    return (
      <div className="w-full flex flex-col items-center justify-center py-20 bg-[#111] rounded-2xl border border-white/[0.04]">
        <Loader2 className="w-8 h-8 animate-spin text-manchester-gold mb-3" />
        <p className="text-white/40 text-xs tracking-widest uppercase font-bold">Cargando datos...</p>
      </div>
    );
  }

  if (data.length === 0) {
    return (
      <div className="w-full flex items-center justify-center py-20 bg-[#111] rounded-2xl border border-white/[0.04]">
        <p className="text-white/40 text-sm">{emptyMessage}</p>
      </div>
    );
  }

  return (
    <div className="w-full overflow-x-auto admin-card p-0">
      <table className="admin-table">
        <thead>
          <tr>
            {columns.map((col, idx) => (
              <th key={idx} className={`px-6 pt-6 ${col.className || ''}`}>
                {col.header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {data.map((item) => (
            <tr key={keyExtractor(item)}>
              {columns.map((col, idx) => (
                <td key={idx} className={`px-6 ${col.className || ''}`}>
                  {typeof col.accessor === 'function' 
                    ? col.accessor(item) 
                    : <span className="block">{String(item[col.accessor])}</span>}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
