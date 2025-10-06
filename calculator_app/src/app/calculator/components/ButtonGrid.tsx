'use client';

import React, { useState } from 'react';

interface ButtonGridProps {
  onButtonClick: (value: string) => void;
  activeTab?: 'basic' | 'scientific' | 'graphing' | 'converter';
  theme?: 'light' | 'dark' | 'student';
}

const ButtonGrid: React.FC<ButtonGridProps> = ({ onButtonClick, activeTab = 'basic', theme = 'student' }) => {
  const [activeButton, setActiveButton] = useState<string | null>(null);

  const buttons = [
    ['AC', 'C', '±', '/'],
    ['7', '8', '9', '*'],
    ['4', '5', '6', '-'],
    ['1', '2', '3', '+'],
    ['0', '00', '.', '=']
  ];

  const scientificButtons = [
    ['sin', 'cos', 'tan', 'asin'],
    ['log', 'ln', '√', 'acos'],
    ['x²', 'xʸ', 'π', 'atan'],
    ['e', '(', ')', '1/x']
  ];

  const algebraicButtons = [
    ['solve', 'quad', 'area'],
    ['vol', 'dist', 'ang']
  ];

  const getAriaLabel = (value: string): string => {
    switch(value) {
      case 'AC': return 'All Clear';
      case 'C': return 'Clear';
      case '±': return 'Toggle sign';
      case '/': return 'Divide';
      case '*': return 'Multiply';
      case '-': return 'Subtract';
      case '+': return 'Add';
      case '=': return 'Equals';
      case '.': return 'Decimal point';
      case '0': case '1': case '2': case '3': case '4':
      case '5': case '6': case '7': case '8': case '9':
        return `Number ${value}`;
      case '00': return 'Double zero';
      case 'sin': return 'Sine';
      case 'cos': return 'Cosine';
      case 'tan': return 'Tangent';
      case 'asin': return 'Arc sine';
      case 'acos': return 'Arc cosine';
      case 'atan': return 'Arc tangent';
      case 'log': return 'Log base 10';
      case 'ln': return 'Natural log';
      case '√': return 'Square root';
      case 'x²': return 'Square';
      case 'xʸ': return 'Power';
      case '1/x': return 'Reciprocal';
      case 'π': return 'Pi';
      case 'e': return 'Euler\'s number';
      case '(': return 'Open parenthesis';
      case ')': return 'Close parenthesis';
      case 'solve': return 'Solve algebraic equation';
      case 'quad': return 'Quadratic solver';
      case 'area': return 'Calculate area';
      case 'vol': return 'Calculate volume';
      case 'dist': return 'Calculate distance';
      case 'ang': return 'Calculate angle';
      default: return value;
    }
  };

  const handleButtonClick = (value: string) => {
    setActiveButton(value);
    setTimeout(() => setActiveButton(null), 150); // Visual feedback for 150ms
    onButtonClick(value);
  };

  const getButtonTheme = (type: 'number' | 'operator' | 'function' | 'special') => {
    const baseClasses = "font-medium py-3 rounded-xl shadow-lg transition-all duration-200 ease-in-out transform hover:scale-105";
    
    switch (theme) {
      case 'dark':
        switch (type) {
          case 'number': return `${baseClasses} bg-gray-700 text-white hover:bg-gray-600`;
          case 'operator': return `${baseClasses} bg-orange-600 text-white hover:bg-orange-500`;
          case 'function': return `${baseClasses} bg-blue-600 text-white hover:bg-blue-500`;
          case 'special': return `${baseClasses} bg-red-600 text-white hover:bg-red-500`;
        }
        break;
      case 'light':
        switch (type) {
          case 'number': return `${baseClasses} bg-gray-200 text-gray-800 hover:bg-gray-300`;
          case 'operator': return `${baseClasses} bg-orange-500 text-white hover:bg-orange-600`;
          case 'function': return `${baseClasses} bg-blue-500 text-white hover:bg-blue-600`;
          case 'special': return `${baseClasses} bg-red-500 text-white hover:bg-red-600`;
        }
        break;
      case 'student':
        switch (type) {
          case 'number': return `${baseClasses} bg-gradient-to-br from-blue-400 to-blue-600 text-white hover:from-blue-500 hover:to-blue-700`;
          case 'operator': return `${baseClasses} bg-gradient-to-br from-orange-400 to-red-500 text-white hover:from-orange-500 hover:to-red-600`;
          case 'function': return `${baseClasses} bg-gradient-to-br from-purple-400 to-pink-500 text-white hover:from-purple-500 hover:to-pink-600`;
          case 'special': return `${baseClasses} bg-gradient-to-br from-green-400 to-teal-500 text-white hover:from-green-500 hover:to-teal-600`;
        }
        break;
    }
    return baseClasses;
  };

  const renderBasicCalculator = () => (
    <div className="grid grid-cols-4 gap-3">
      {buttons.map((row, rowIndex) => 
        row.map((btn, colIndex) => {
          const isEquals = btn === '=';
          const isZero = btn === '0';
          const isOperator = ['/', '*', '-', '+'].includes(btn);
          const isClear = ['AC', 'C', '±'].includes(btn);
          const isNumber = /^[0-9]$/.test(btn) || btn === '00';
          
          let buttonType: 'number' | 'operator' | 'function' | 'special' = 'number';
          if (isOperator) buttonType = 'operator';
          else if (isClear) buttonType = 'special';
          else if (isEquals) buttonType = 'function';
          
          return (
            <button
              key={`btn-${rowIndex}-${colIndex}`}
              onClick={() => handleButtonClick(btn)}
              className={`
                ${isZero ? 'col-span-2' : 'col-span-1'}
                ${getButtonTheme(buttonType)}
                ${activeButton === btn ? 'scale-95 ring-4 ring-yellow-300' : ''}
                text-xl font-bold
              `}
              aria-label={getAriaLabel(btn)}
            >
              {btn}
            </button>
          );
        })
      )}
    </div>
  );

  const renderScientificCalculator = () => (
    <div className="space-y-4">
      {/* Scientific Functions */}
      <div className="grid grid-cols-4 gap-2">
        {scientificButtons.map((row, rowIndex) => 
          row.map((btn, colIndex) => (
            <button
              key={`sci-${rowIndex}-${colIndex}`}
              onClick={() => handleButtonClick(btn)}
              className={`
                ${getButtonTheme('function')}
                ${activeButton === btn ? 'scale-95 ring-4 ring-yellow-300' : ''}
                text-sm font-bold
              `}
              aria-label={getAriaLabel(btn)}
            >
              {btn}
            </button>
          ))
        )}
      </div>
      
      {/* Basic Calculator */}
      {renderBasicCalculator()}
    </div>
  );

  const renderGraphingCalculator = () => (
    <div className="space-y-4">
      {/* Graphing Functions */}
      <div className="grid grid-cols-3 gap-2">
        {[
          ['f(x)', 'g(x)', 'h(x)'],
          ['plot', 'zoom', 'trace'],
          ['table', 'calc', 'graph']
        ].map((row, rowIndex) => 
          row.map((btn, colIndex) => (
            <button
              key={`graph-${rowIndex}-${colIndex}`}
              onClick={() => handleButtonClick(btn)}
              className={`
                ${getButtonTheme('function')}
                ${activeButton === btn ? 'scale-95 ring-4 ring-yellow-300' : ''}
                text-sm font-bold
              `}
              aria-label={btn}
            >
              {btn}
            </button>
          ))
        )}
      </div>
      
      {/* Scientific Functions */}
      <div className="grid grid-cols-4 gap-2">
        {scientificButtons.slice(0, 2).map((row, rowIndex) => 
          row.map((btn, colIndex) => (
            <button
              key={`sci-${rowIndex}-${colIndex}`}
              onClick={() => handleButtonClick(btn)}
              className={`
                ${getButtonTheme('function')}
                ${activeButton === btn ? 'scale-95 ring-4 ring-yellow-300' : ''}
                text-sm font-bold
              `}
              aria-label={getAriaLabel(btn)}
            >
              {btn}
            </button>
          ))
        )}
      </div>
      
      {/* Basic Calculator */}
      {renderBasicCalculator()}
    </div>
  );

  const renderConverter = () => (
    <div className="space-y-4">
      {/* Unit Conversion */}
      <div className="grid grid-cols-2 gap-2">
        {[
          ['°C→°F', '°F→°C'],
          ['m→ft', 'ft→m'],
          ['kg→lb', 'lb→kg'],
          ['L→gal', 'gal→L']
        ].map((row, rowIndex) => 
          row.map((btn, colIndex) => (
            <button
              key={`conv-${rowIndex}-${colIndex}`}
              onClick={() => handleButtonClick(btn)}
              className={`
                ${getButtonTheme('special')}
                ${activeButton === btn ? 'scale-95 ring-4 ring-yellow-300' : ''}
                text-sm font-bold
              `}
              aria-label={btn}
            >
              {btn}
            </button>
          ))
        )}
      </div>
      
      {/* Basic Calculator */}
      {renderBasicCalculator()}
    </div>
  );

  return (
    <div className="space-y-4" role="group" aria-label="Calculator buttons">
      {activeTab === 'basic' && renderBasicCalculator()}
      {activeTab === 'scientific' && renderScientificCalculator()}
      {activeTab === 'graphing' && renderGraphingCalculator()}
      {activeTab === 'converter' && renderConverter()}
    </div>
  );
};

export default ButtonGrid;