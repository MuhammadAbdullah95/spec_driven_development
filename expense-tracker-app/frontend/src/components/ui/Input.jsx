import React, { useState, useRef, useEffect, forwardRef } from 'react';

const Input = forwardRef(({ 
  label,
  type = 'text',
  placeholder,
  value,
  onChange,
  onBlur,
  onFocus,
  error,
  className = '',
  disabled = false,
  required = false,
  icon: Icon,
  suffix,
  ...props 
}, ref) => {
  const [focused, setFocused] = useState(false);
  const [hasValue, setHasValue] = useState(false);
  const inputRef = useRef(null);

  useEffect(() => {
    setHasValue(value && value.toString().length > 0);
  }, [value]);

  const handleFocus = (e) => {
    setFocused(true);
    onFocus?.(e);
  };

  const handleBlur = (e) => {
    setFocused(false);
    onBlur?.(e);
  };

  const handleLabelClick = () => {
    inputRef.current?.focus();
  };

  const inputClasses = `
    w-full px-4 py-4 bg-white/95 backdrop-blur-xl border border-slate-200 rounded-2xl
    focus:outline-none focus:ring-4 focus:ring-primary/20 focus:border-primary/50
    transition-all duration-200 placeholder-transparent
    text-slate-800 font-medium placeholder:text-slate-400
    ${Icon ? 'pl-12' : ''}
    ${suffix ? 'pr-12' : ''}
    ${error ? 'border-red-300 focus:border-red-400 focus:ring-red-100' : ''}
    ${disabled ? 'opacity-50 cursor-not-allowed' : ''}
    ${className}
  `;

  const labelClasses = `
    absolute transition-all duration-200 pointer-events-none z-10
    ${Icon ? 'left-12' : 'left-4'}
    ${focused || hasValue 
      ? 'top-1 text-xs text-primary font-medium bg-white px-1 rounded' 
      : 'top-1/2 -translate-y-1/2 text-base text-slate-500'
    }
    ${error ? 'text-red-500' : ''}
  `;

  return (
    <div className="relative">
      <div className="relative">
        {Icon && (
          <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 z-10">
            <Icon size={20} />
          </div>
        )}
        
        <input
          ref={ref || inputRef}
          type={type}
          value={value}
          onChange={onChange}
          onFocus={handleFocus}
          onBlur={handleBlur}
          disabled={disabled}
          required={required}
          placeholder={placeholder}
          className={inputClasses}
          {...props}
        />
        
        {label && (
          <label 
            className={labelClasses}
            onClick={handleLabelClick}
          >
            {label}
            {required && <span className="text-red-500 ml-1">*</span>}
          </label>
        )}
        
        {suffix && (
          <div className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400">
            {suffix}
          </div>
        )}
      </div>
      
      {error && (
        <p className="mt-2 text-sm text-red-500 animate-fadeIn">
          {error}
        </p>
      )}
    </div>
  );
});

Input.displayName = 'Input';

export default Input;
