import React from 'react';

function Button({ children, onClick, type = 'button', variant = 'primary', disabled = false, fullWidth = false, className = '' }) {
  const baseStyle = "px-4 py-2 rounded-md font-semibold shadow-sm focus:outline-none focus:ring-2 focus:ring-offset-2 transition duration-150 ease-in-out";
  
  const variantStyles = {
    primary: "bg-primary hover:bg-primary-dark text-white focus:ring-primary",
    secondary: "bg-gray-200 hover:bg-gray-300 text-gray-700 focus:ring-gray-400",
    danger: "bg-red-500 hover:bg-red-600 text-white focus:ring-red-500",
    outline: "bg-transparent hover:bg-primary-light border border-primary text-primary focus:ring-primary",
    ghost: "bg-transparent hover:bg-gray-100 text-gray-700 focus:ring-gray-400",
  };

  const widthStyle = fullWidth ? "w-full" : "";
  const disabledStyle = disabled ? "opacity-50 cursor-not-allowed" : "hover:opacity-90";

  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      className={`${baseStyle} ${variantStyles[variant]} ${widthStyle} ${disabledStyle} ${className}`}
    >
      {children}
    </button>
  );
}

export default Button;
