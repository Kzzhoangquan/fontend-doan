import React from 'react';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  required?: boolean;
  error?: string;
  helperText?: string;
  icon?: React.ReactNode;
}

export default function Input({
  label,
  required = false,
  error,
  helperText,
  icon,
  className = '',
  ...props
}: InputProps) {
  return (
    <div className="w-full">
      {/* Label */}
      {label && (
        <label className="block text-sm font-medium text-gray-700 mb-2">
          {label}
          {required && <span className="ml-1 text-red-500">*</span>}
        </label>
      )}

      {/* Input wrapper */}
      <div className="relative">
        {icon && (
          <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
            {icon}
          </div>
        )}

        <input
          className={`
            w-full
            ${icon ? 'pl-10' : 'pl-4'} pr-4 py-2.5
            rounded-lg border
            ${
              error
                ? 'border-red-300 focus:ring-red-500 focus:border-red-500'
                : 'border-gray-300 focus:ring-blue-500 focus:border-blue-500'
            }
            focus:ring-2 outline-none transition-all
            disabled:bg-gray-100 disabled:cursor-not-allowed
            placeholder:text-gray-400
            ${className}
          `}
          aria-invalid={!!error}
          {...props}
        />
      </div>

      {/* Error text */}
      {error && (
        <p className="mt-1.5 text-sm text-red-600">{error}</p>
      )}

      {/* Helper text */}
      {helperText && !error && (
        <p className="mt-1.5 text-sm text-gray-500">{helperText}</p>
      )}
    </div>
  );
}
