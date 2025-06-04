import React from 'react';

function Button({ 
  children, 
  onClick, 
  type = 'button', 
  variant = 'primary', 
  disabled = false, 
  fullWidth = false, 
  className = '',
  size = 'md' // Added size prop: 'sm', 'md', 'lg'
}) {
  
  const baseStyle = "inline-flex items-center justify-center rounded-md font-semibold shadow-sm focus:outline-none focus:ring-2 focus:ring-offset-2 transition-colors duration-150 ease-in-out";
  
  const sizeStyles = {
    sm: "px-3 py-1.5 text-xs",
    md: "px-4 py-2 text-sm",
    lg: "px-6 py-2.5 text-base",
  };

  // Ensure these variants use colors defined in your tailwind.config.js theme
  const variantStyles = {
    primary: "bg-primary hover:bg-primary-dark text-white focus:ring-primary", // primary should be like #547792
    secondary: "bg-palette-light-blue hover:bg-opacity-80 text-textDark focus:ring-palette-medium-blue", // Using palette-light-blue and textDark
    danger: "bg-red-600 hover:bg-red-700 text-white focus:ring-red-500",
    outline: "bg-transparent border border-primary text-primary hover:bg-primary hover:text-white focus:ring-primary", // Ensure primary is visible
    ghost: "bg-transparent hover:bg-palette-cream text-textDark focus:ring-primary", // Uses palette-cream for hover bg
  };

  const widthStyle = fullWidth ? "w-full" : "";
  // Ensure disabled buttons are visibly different but not invisible
  const disabledStyle = disabled ? "opacity-60 cursor-not-allowed" : "hover:opacity-90";

  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      className={`${baseStyle} ${sizeStyles[size]} ${variantStyles[variant]} ${widthStyle} ${disabledStyle} ${className}`}
    >
      {children}
    </button>
  );
}

export default Button;
