'use client';

import React from 'react';

interface DisplayProps {
  value: string;
  className?: string;
}

export const Display: React.FC<DisplayProps> = ({ value, className = '' }) => {
  // Determine font size based on the length of the value
  const getFontSize = (val: string) => {
    if (val.length > 15) return 'text-xl';
    if (val.length > 10) return 'text-2xl';
    return 'text-3xl';
  };

  return (
    <div 
      className={`bg-gray-900 text-white p-4 rounded-lg shadow-inner flex items-center justify-end min-h-[80px] ${className}`}
      role="status"
      aria-live="polite"
    >
      <input
        type="text"
        value={value}
        readOnly
        className={`w-full bg-transparent text-right ${getFontSize(value)} font-mono focus:outline-none text-white`}
        aria-label="Calculator display showing current value or calculation result"
        aria-atomic="true"
      />
    </div>
  );
};