'use client';

import React from 'react';

interface DisplayProps {
  value: string;
  className?: string;
  theme?: 'light' | 'dark' | 'student';
}

export const Display: React.FC<DisplayProps> = ({ value, className = '', theme = 'student' }) => {
  // Determine font size based on the length of the value
  const getFontSize = (val: string) => {
    if (val.length > 20) return 'text-lg';
    if (val.length > 15) return 'text-xl';
    if (val.length > 10) return 'text-2xl';
    return 'text-3xl';
  };

  const getThemeClasses = () => {
    switch (theme) {
      case 'dark':
        return 'bg-gray-800 text-green-400 border-gray-700';
      case 'light':
        return 'bg-gray-100 text-gray-900 border-gray-300';
      case 'student':
        return 'bg-gradient-to-r from-indigo-900 to-purple-900 text-white border-indigo-500';
      default:
        return 'bg-gradient-to-r from-indigo-900 to-purple-900 text-white border-indigo-500';
    }
  };

  return (
    <div className={`relative ${className}`}>
      {/* Main Display */}
      <div 
        className={`${getThemeClasses()} p-6 rounded-xl shadow-lg border-2 min-h-[100px] flex flex-col justify-center`}
        role="status"
        aria-live="polite"
      >
        {/* Expression/Input Display */}
        <div className="text-right mb-2">
          <input
            type="text"
            value={value}
            readOnly
            className={`w-full bg-transparent text-right ${getFontSize(value)} font-mono focus:outline-none ${theme === 'dark' ? 'text-green-400' : theme === 'light' ? 'text-gray-900' : 'text-white'}`}
            aria-label="Calculator display showing current value or calculation result"
            aria-atomic="true"
            placeholder="0"
          />
        </div>
        
        {/* Status Indicators */}
        <div className="flex justify-between items-center text-xs opacity-70">
          <span>DEG</span>
          <span className="flex gap-2">
            <span>📐</span>
            <span>🔢</span>
            <span>📊</span>
          </span>
        </div>
      </div>
      
      {/* Decorative Elements for Student Theme */}
      {theme === 'student' && (
        <div className="absolute -top-2 -right-2 text-2xl animate-pulse">
          ✨
        </div>
      )}
    </div>
  );
};