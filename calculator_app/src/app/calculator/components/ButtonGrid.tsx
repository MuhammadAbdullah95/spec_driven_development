'use client';

import React, { useState } from 'react';

interface ButtonGridProps {
  onButtonClick: (value: string) => void;
}

const ButtonGrid: React.FC<ButtonGridProps> = ({ onButtonClick }) => {
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

  return (
    <div className="space-y-4" role="group" aria-label="Calculator buttons">
      {/* Scientific functions */}
      <div className="grid grid-cols-4 gap-2">
        {scientificButtons.map((row, rowIndex) => 
          row.map((btn, colIndex) => (
            <button
              key={`sci-${rowIndex}-${colIndex}`}
              onClick={() => handleButtonClick(btn)}
              className={`
                bg-blue-100 text-blue-800 font-medium py-2 text-sm rounded-lg shadow
                transition-all duration-100 ease-in-out
                ${activeButton === btn ? 'scale-95 bg-blue-300' : 'hover:bg-blue-200'}
              `}
              aria-label={getAriaLabel(btn)}
            >
              {btn}
            </button>
          ))
        )}
      </div>

      {/* Basic operations and numbers */}
      <div className="grid grid-cols-4 gap-2">
        {buttons.map((row, rowIndex) => 
          row.map((btn, colIndex) => {
            const isEquals = btn === '=';
            const isZero = btn === '0';
            const isOperator = ['/', '*', '-', '+'].includes(btn);
            const isClear = ['AC', 'C', '±'].includes(btn);
            
            return (
              <button
                key={`btn-${rowIndex}-${colIndex}`}
                onClick={() => handleButtonClick(btn)}
                className={`
                  ${isEquals ? 'col-span-1' : isZero ? 'col-span-2' : 'col-span-1'}
                  ${isOperator 
                    ? 'bg-orange-500 text-white hover:bg-orange-600' 
                    : isClear
                    ? 'bg-gray-300 text-gray-700 hover:bg-gray-400'
                    : 'bg-gray-100 hover:bg-gray-200 text-gray-800'}
                  font-medium py-3 rounded-lg shadow text-lg
                  transition-all duration-100 ease-in-out
                  ${activeButton === btn ? 'scale-95' : ''}
                `}
                aria-label={getAriaLabel(btn)}
              >
                {btn}
              </button>
            );
          })
        )}
      </div>

      {/* Algebraic/Geometric functions */}
      <div className="grid grid-cols-3 gap-2">
        {algebraicButtons.map((row, rowIndex) => 
          row.map((btn, colIndex) => (
            <button
              key={`alg-${rowIndex}-${colIndex}`}
              onClick={() => handleButtonClick(btn)}
              className={`
                bg-purple-100 text-purple-800 font-medium py-2 text-sm rounded-lg shadow
                transition-all duration-100 ease-in-out
                ${activeButton === btn ? 'scale-95 bg-purple-300' : 'hover:bg-purple-200'}
              `}
              aria-label={getAriaLabel(btn)}
            >
              {btn}
            </button>
          ))
        )}
      </div>
    </div>
  );
};

export default ButtonGrid;