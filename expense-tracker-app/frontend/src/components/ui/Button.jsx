import React from 'react';

const Button = ({ 
  children, 
  variant = 'primary', 
  size = 'md', 
  className = '', 
  disabled = false,
  loading = false,
  onClick,
  type = 'button',
  ...props 
}) => {
  const baseClasses = 'inline-flex items-center justify-center font-medium rounded-2xl transition-all duration-200 focus:outline-none focus:ring-4 disabled:opacity-50 disabled:cursor-not-allowed';
  
  const variants = {
    primary: 'bg-primary text-white hover:bg-primary-600 hover:scale-105 hover:shadow-lg focus:ring-primary/20 active:scale-95',
    secondary: 'bg-white/70 backdrop-blur-xl border border-white/20 text-slate-800 hover:bg-white/80 hover:scale-105 hover:shadow-lg focus:ring-primary/20 active:scale-95',
    outline: 'border-2 border-primary text-primary bg-transparent hover:bg-primary hover:text-white hover:scale-105 focus:ring-primary/20 active:scale-95',
    ghost: 'text-slate-600 hover:bg-slate-100 hover:text-slate-800 focus:ring-slate-200',
    danger: 'bg-red-500 text-white hover:bg-red-600 hover:scale-105 hover:shadow-lg focus:ring-red-500/20 active:scale-95',
    success: 'bg-success text-white hover:bg-success-600 hover:scale-105 hover:shadow-lg focus:ring-success/20 active:scale-95'
  };

  const sizes = {
    sm: 'px-4 py-2 text-sm min-h-[36px]',
    md: 'px-6 py-3 text-base min-h-[44px]',
    lg: 'px-8 py-4 text-lg min-h-[52px]',
    xl: 'px-10 py-5 text-xl min-h-[60px]'
  };

  const classes = `${baseClasses} ${variants[variant]} ${sizes[size]} ${className}`;

  return (
    <button
      type={type}
      className={classes}
      disabled={disabled || loading}
      onClick={onClick}
      {...props}
    >
      {loading && (
        <svg className="animate-spin -ml-1 mr-3 h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
        </svg>
      )}
      {children}
    </button>
  );
};

export default Button;
