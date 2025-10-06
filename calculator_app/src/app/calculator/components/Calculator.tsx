'use client';

import React, { useState, useEffect } from 'react';
import { Display } from './Display';
import ButtonGrid from './ButtonGrid';
import { HistoryPanel } from './HistoryPanel';
import { useCalculator } from '../hooks/useCalculator';
import { useHistory } from '../hooks/useHistory';
import { formatResult } from '@/lib/math-utils';
import { safeEvaluate } from '@/lib/calculator-engine';
import { HistoryEntry } from '@/types/calculator';

const Calculator: React.FC = () => {
  const {
    displayValue,
    inputDigit,
    inputDecimal,
    clearDisplay,
    toggleSign,
    inputPercent,
    performOperation,
    performEquals,
    clearAll,
    calculateScientificFunction,
    calculateAlgebraic,
    calculateGeometry,
    appendToDisplay,
    appendConstant,
    setDisplayFromHistory,
    lastExpression
  } = useCalculator();

  const {
    history,
    addToHistory,
    clearHistory,
    removeEntry
  } = useHistory();

  const [error, setError] = useState<string | null>(null);

  const handleButtonClick = (value: string) => {
    setError(null); // Clear any previous errors
    
    switch (value) {
      case 'C':
        clearDisplay();
        break;
      case 'AC':
        clearAll();
        break;
      case '±':
        toggleSign();
        break;
      case '%':
        inputPercent();
        break;
      case '.':
        inputDecimal();
        break;
      case '=':
      case 'Enter':
        const currentExpression = displayValue;
        performEquals();
        // Add to history after a short delay to ensure the calculation is complete
        setTimeout(() => {
          if (lastExpression && !error) {
            addToHistory(lastExpression, displayValue);
          }
        }, 10);
        break;
      case '+':
      case '-':
      case '*':
      case '/':
        performOperation(value);
        break;
      case 'sin':
      case 'cos':
      case 'tan':
      case 'asin':
      case 'acos':
      case 'atan':
      case 'log':
      case 'ln':
      case '1/x':
        calculateScientificFunction(value);
        break;
      case '√':
        calculateScientificFunction('sqrt');
        break;
      case 'π':
        // Append π to the display
        appendConstant('π');
        break;
      case 'e':
        // Append e to the display
        appendConstant('e');
        break;
      case '(':
      case ')':
        // Append parentheses to the display
        appendToDisplay(value);
        break;
      case 'x²':
        // Square operation - append ^2
        appendToDisplay('^2');
        break;
      case 'xʸ':
        // Power operation - append ^
        appendToDisplay('^');
        break;
      case 'solve':
        // Handle algebraic equation solving
        calculateAlgebraic(displayValue);
        break;
      case 'quad':
        // Quadratic formula: for ax^2 + bx + c = 0
        // This would require a more complex UI for input, for now just show an example
        // For simplicity, assume user has entered values like "1,2,-3" for coefficients
        break;
      case 'area':
        // Calculate area based on shape
        // This would require more specific inputs
        break;
      case 'vol':
        // Calculate volume based on shape
        // This would require more specific inputs
        break;
      case 'dist':
        // Calculate distance between points
        // This would require more specific inputs
        break;
      case 'ang':
        // Calculate angle
        // This would require more specific inputs
        break;
      default:
        if (/^[0-9]$/.test(value)) {
          inputDigit(value);
        } else {
          // For other values, append to display
          // This would require updating the hook to handle scientific functions
          appendToDisplay(value);
        }
        break;
    }
  };

  const handleUseHistoryEntry = (expression: string) => {
    setDisplayFromHistory(expression);
    setError(null);
  };

  // Keyboard support
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Prevent keyboard input if focus is on a text input or similar element
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) {
        return;
      }

      let value: string | null = null;

      if (e.key >= '0' && e.key <= '9') {
        value = e.key;
      } else if (e.key === '.') {
        value = '.';
      } else if (e.key === '+') {
        value = '+';
      } else if (e.key === '-') {
        value = '-';
      } else if (e.key === '*') {
        value = '*';
      } else if (e.key === '/') {
        value = '/';
      } else if (e.key === 'Enter' || e.key === '=') {
        value = 'Enter';
      } else if (e.key === 'Escape') {
        value = 'C';
      } else if (e.key === 'Backspace') {
        // For backspace we might need to update the hook to support deletion
        return;
      } else if (e.key.toLowerCase() === 'c') {
        value = 'C';
      } else if (e.key.toLowerCase() === 's' && e.altKey) {
        // Alt+S for sin
        value = 'sin';
      } else if (e.key.toLowerCase() === 'c' && e.altKey) {
        // Alt+C for cos
        value = 'cos';
      } else if (e.key.toLowerCase() === 't' && e.altKey) {
        // Alt+T for tan
        value = 'tan';
      }

      if (value !== null) {
        e.preventDefault();
        handleButtonClick(value);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, []);

  return (
    <div 
      className="w-full max-w-lg mx-auto p-4" 
      tabIndex={0} 
      onKeyDown={(e) => {
        // Allow component to receive keyboard events
      }}
    >
      <div className="bg-white rounded-xl shadow-lg p-6">
        <h1 className="text-2xl font-bold text-center mb-6 text-indigo-700">Scientific Calculator</h1>
        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4 text-sm">
            {error}
          </div>
        )}
        <Display value={displayValue} className="mb-6" />
        <ButtonGrid onButtonClick={handleButtonClick} />
        <HistoryPanel 
          entries={history} 
          onClearHistory={clearHistory}
          onUseEntry={handleUseHistoryEntry}
        />
      </div>
    </div>
  );
};

export default Calculator;