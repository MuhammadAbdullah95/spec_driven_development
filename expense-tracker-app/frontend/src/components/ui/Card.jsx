import React from 'react';

const Card = ({ 
  children, 
  className = '', 
  variant = 'default',
  hover = true,
  glass = true,
  ...props 
}) => {
  const baseClasses = 'relative overflow-hidden rounded-3xl transition-all duration-300';
  
  const variants = {
    default: glass 
      ? 'bg-white/70 backdrop-blur-xl border border-white/20 shadow-2xl' 
      : 'bg-white border border-slate-200 shadow-lg',
    dark: glass
      ? 'bg-slate-900/70 backdrop-blur-xl border border-slate-700/20 shadow-2xl'
      : 'bg-slate-900 border border-slate-700 shadow-lg',
    gradient: 'bg-gradient-to-br from-primary/10 via-secondary/10 to-accent/10 backdrop-blur-xl border border-white/20 shadow-2xl',
    solid: 'bg-white border border-slate-200 shadow-lg'
  };

  const hoverClasses = hover 
    ? 'hover:scale-105 hover:shadow-[0_20px_60px_rgba(14,165,233,0.15)] hover:-translate-y-1' 
    : '';

  const classes = `${baseClasses} ${variants[variant]} ${hoverClasses} ${className}`;

  return (
    <div className={classes} {...props}>
      {/* Subtle gradient overlay for depth */}
      {glass && (
        <div className="absolute inset-0 bg-gradient-to-br from-white/10 via-transparent to-transparent pointer-events-none" />
      )}
      <div className="relative z-10">
        {children}
      </div>
    </div>
  );
};

const CardHeader = ({ children, className = '' }) => (
  <div className={`p-6 pb-4 ${className}`}>
    {children}
  </div>
);

const CardContent = ({ children, className = '' }) => (
  <div className={`p-6 pt-0 ${className}`}>
    {children}
  </div>
);

const CardFooter = ({ children, className = '' }) => (
  <div className={`p-6 pt-4 border-t border-white/10 ${className}`}>
    {children}
  </div>
);

Card.Header = CardHeader;
Card.Content = CardContent;
Card.Footer = CardFooter;

export default Card;
