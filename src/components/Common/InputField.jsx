import React from 'react';

function InputField({ id, label, type = 'text', value, onChange, placeholder, required = false, disabled = false, error = null, className = '', labelClassName = '', inputClassName = '', ...props }) {
  const errorStyle = error ? "border-red-500 focus:border-red-500 focus:ring-red-500" : "border-gray-300 focus:border-primary focus:ring-primary";
  
  return (
    <div className={`mb-4 ${className}`}>
      {label && (
        <label 
          htmlFor={id} 
          className={`block text-sm font-medium mb-1 ${labelClassName || 'text-gray-700'}`} // Apply labelClassName or default
        >
          {label} {required && <span className="text-red-500">*</span>}
        </label>
      )}
      <input
        type={type}
        id={id}
        name={id}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        required={required}
        disabled={disabled}
        className={`w-full px-3 py-2 border rounded-md shadow-sm focus:ring-1 sm:text-sm ${errorStyle} ${disabled ? 'bg-gray-100 cursor-not-allowed' : 'bg-white'} ${inputClassName}`}
        {...props}
      />
      {error && <p className="mt-1 text-xs text-red-500">{error}</p>}
    </div>
  );
}

export default InputField;
