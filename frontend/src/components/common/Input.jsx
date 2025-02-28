import React from 'react';

const Input = ({ 
  label,
  error,
  type = 'text',
  id,
  helperText,
  fullWidth = false,
  className = '',
  ...props 
}) => {
  return (
    <div className={`mb-4 ${fullWidth ? 'w-full' : ''}`}>
      {label && (
        <label 
          htmlFor={id} 
          className="block text-gray-700 text-sm font-bold mb-2"
        >
          {label}
        </label>
      )}
      <input
        type={type}
        id={id}
        className={`
          shadow-sm rounded-md w-full px-3 py-2 border
          ${error ? 'border-red-500' : 'border-gray-300'}
          focus:outline-none focus:ring-2 
          ${error ? 'focus:ring-red-500' : 'focus:ring-blue-500'}
          ${error ? 'focus:border-red-500' : 'focus:border-blue-500'}
          ${className}
        `}
        {...props}
      />
      {helperText && !error && (
        <p className="mt-1 text-sm text-gray-500">{helperText}</p>
      )}
      {error && (
        <p className="mt-1 text-sm text-red-500">{error}</p>
      )}
    </div>
  );
};

export default Input;