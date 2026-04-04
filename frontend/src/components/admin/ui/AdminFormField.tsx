import React from 'react';

interface AdminFormFieldProps extends React.InputHTMLAttributes<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement> {
  label: string;
  error?: string;
  type?: 'text' | 'number' | 'email' | 'password' | 'textarea' | 'select' | 'file';
  options?: { value: string | number; label: string }[];
}

export const AdminFormField: React.FC<AdminFormFieldProps> = ({
  label,
  error,
  type = 'text',
  options,
  className = '',
  ...props
}) => {
  return (
    <div className={`flex flex-col mb-4 ${className}`}>
      <label className="admin-label">
        {label}
        {props.required && <span className="text-red-500 ml-1">*</span>}
      </label>
      
      {type === 'textarea' ? (
        <textarea
          className="admin-textarea min-h-[100px]"
          {...(props as React.TextareaHTMLAttributes<HTMLTextAreaElement>)}
        />
      ) : type === 'select' ? (
        <div className="relative">
          <select 
            className="admin-select"
            {...(props as React.SelectHTMLAttributes<HTMLSelectElement>)}
          >
            <option value="" disabled hidden>Seleccionar opción...</option>
            {options?.map(opt => (
              <option key={opt.value} value={opt.value} className="bg-[#111] text-white">
                {opt.label}
              </option>
            ))}
          </select>
          <div className="absolute inset-y-0 right-0 flex items-center pr-4 pointer-events-none text-white/40">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path></svg>
          </div>
        </div>
      ) : (
        <input
          type={type}
          className="admin-input"
          {...(props as React.InputHTMLAttributes<HTMLInputElement>)}
        />
      )}
      
      {error && <p className="mt-1.5 text-[11px] font-medium text-red-400">{error}</p>}
    </div>
  );
};
