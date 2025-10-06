'use client';

import React, { useState, useEffect } from 'react';
import { Display } from './Display';
import ButtonGrid from './ButtonGrid';
import { HistoryPanel } from './HistoryPanel';
import { StepByStepSolver } from './StepByStepSolver';
import { FormulaHelper } from './FormulaHelper';
import { UnitConverter } from './UnitConverter';
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
        // Quadratic formula helper
        setDisplayFromHistory('Quadratic: ax²+bx+c=0');
        break;
      case 'area':
        // Area calculation helper
        setDisplayFromHistory('Area formulas in Formula Helper →');
        break;
      case 'vol':
        // Volume calculation helper
        setDisplayFromHistory('Volume formulas in Formula Helper →');
        break;
      case 'dist':
        // Distance calculation helper
        setDisplayFromHistory('Distance: √((x₂-x₁)²+(y₂-y₁)²)');
        break;
      case 'ang':
        // Angle calculation helper
        setDisplayFromHistory('Use sin⁻¹, cos⁻¹, tan⁻¹ functions');
        break;
      // Unit conversion buttons
      case '°C→°F':
        const celsius = parseFloat(displayValue);
        if (!isNaN(celsius)) {
          const fahrenheit = celsius * 9/5 + 32;
          setDisplayFromHistory(fahrenheit.toString());
        }
        break;
      case '°F→°C':
        const fahrenheit2 = parseFloat(displayValue);
        if (!isNaN(fahrenheit2)) {
          const celsius2 = (fahrenheit2 - 32) * 5/9;
          setDisplayFromHistory(celsius2.toString());
        }
        break;
      case 'm→ft':
        const meters = parseFloat(displayValue);
        if (!isNaN(meters)) {
          const feet = meters * 3.28084;
          setDisplayFromHistory(feet.toString());
        }
        break;
      case 'ft→m':
        const feet2 = parseFloat(displayValue);
        if (!isNaN(feet2)) {
          const meters2 = feet2 / 3.28084;
          setDisplayFromHistory(meters2.toString());
        }
        break;
      case 'kg→lb':
        const kg = parseFloat(displayValue);
        if (!isNaN(kg)) {
          const lb = kg * 2.20462;
          setDisplayFromHistory(lb.toString());
        }
        break;
      case 'lb→kg':
        const lb2 = parseFloat(displayValue);
        if (!isNaN(lb2)) {
          const kg2 = lb2 / 2.20462;
          setDisplayFromHistory(kg2.toString());
        }
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

  const [activeTab, setActiveTab] = useState<'basic' | 'scientific' | 'graphing' | 'converter'>('basic');
  const [theme, setTheme] = useState<'light' | 'dark' | 'student'>('student');

  return (
    <div 
      className="w-full max-w-6xl mx-auto p-4" 
      tabIndex={0} 
      onKeyDown={(e) => {
        // Allow component to receive keyboard events
      }}
    >
      <div className={`${theme === 'dark' ? 'bg-gray-900 text-white' : theme === 'student' ? 'bg-gradient-to-br from-purple-50 to-blue-50' : 'bg-white'} rounded-2xl shadow-2xl overflow-hidden`}>
        {/* Header with Theme Selector */}
        <div className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white p-6">
          <div className="flex justify-between items-center">
            <h1 className="text-3xl font-bold">🧮 Student Calculator Pro</h1>
            <div className="flex gap-2">
              <button
                onClick={() => setTheme('light')}
                className={`p-2 rounded-lg ${theme === 'light' ? 'bg-white text-indigo-600' : 'bg-indigo-500 hover:bg-indigo-400'}`}
                title="Light Theme"
              >
                ☀️
              </button>
              <button
                onClick={() => setTheme('dark')}
                className={`p-2 rounded-lg ${theme === 'dark' ? 'bg-white text-indigo-600' : 'bg-indigo-500 hover:bg-indigo-400'}`}
                title="Dark Theme"
              >
                🌙
              </button>
              <button
                onClick={() => setTheme('student')}
                className={`p-2 rounded-lg ${theme === 'student' ? 'bg-white text-indigo-600' : 'bg-indigo-500 hover:bg-indigo-400'}`}
                title="Student Theme"
              >
                🎓
              </button>
            </div>
          </div>
          
          {/* Tab Navigation */}
          <div className="flex gap-1 mt-4">
            {[
              { id: 'basic', label: '🔢 Basic', icon: '🔢' },
              { id: 'scientific', label: '🧪 Scientific', icon: '🧪' },
              { id: 'graphing', label: '📊 Graphing', icon: '📊' },
              { id: 'converter', label: '🔄 Converter', icon: '🔄' }
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`px-4 py-2 rounded-lg font-medium transition-all ${
                  activeTab === tab.id
                    ? 'bg-white text-indigo-600 shadow-lg'
                    : 'bg-indigo-500 hover:bg-indigo-400 text-white'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        <div className="p-6">
          {error && (
            <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 mb-6 rounded-r-lg">
              <div className="flex items-center">
                <span className="text-xl mr-2">⚠️</span>
                <span>{error}</span>
              </div>
            </div>
          )}

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Main Calculator Area */}
            <div className="lg:col-span-2">
              <Display value={displayValue} className="mb-6" theme={theme} />
              <ButtonGrid onButtonClick={handleButtonClick} activeTab={activeTab} theme={theme} />
            </div>

            {/* Side Panel */}
            <div className="space-y-6">
              {/* Step-by-Step Solver */}
              {lastExpression && (
                <StepByStepSolver 
                  expression={lastExpression}
                  result={displayValue}
                  theme={theme}
                />
              )}

              <HistoryPanel 
                entries={history} 
                onClearHistory={clearHistory}
                onUseEntry={handleUseHistoryEntry}
                theme={theme}
              />
              
              {/* Educational Features based on active tab */}
              {activeTab === 'converter' && (
                <UnitConverter theme={theme} />
              )}
              
              {(activeTab === 'scientific' || activeTab === 'graphing') && (
                <FormulaHelper theme={theme} />
              )}
              
              {/* Quick Reference for Basic Tab */}
              {activeTab === 'basic' && (
                <div className={`${theme === 'dark' ? 'bg-gray-800' : 'bg-white'} rounded-xl shadow-lg p-4`}>
                  <h3 className="font-bold text-lg mb-3 flex items-center">
                    <span className="mr-2">📚</span>
                    Quick Reference
                  </h3>
                  <div className="text-sm space-y-2">
                    <div><strong>Order of Operations:</strong> PEMDAS</div>
                    <div><strong>P</strong>arentheses → <strong>E</strong>xponents → <strong>M</strong>ultiply/</div>
                    <div><strong>D</strong>ivide → <strong>A</strong>dd/<strong>S</strong>ubtract</div>
                    <div className="mt-3 pt-3 border-t">
                      <div><strong>Tips:</strong></div>
                      <div>• Use parentheses for clarity</div>
                      <div>• Check your work step by step</div>
                      <div>• π ≈ 3.14159, e ≈ 2.71828</div>
                    </div>
                  </div>
                </div>
              )}

              {/* Study Tips */}
              <div className={`${theme === 'dark' ? 'bg-gray-800' : 'bg-gradient-to-br from-yellow-50 to-orange-50'} rounded-xl shadow-lg p-4 border-2 border-yellow-200`}>
                <h3 className="font-bold text-lg mb-3 flex items-center">
                  <span className="mr-2">💡</span>
                  Study Tips
                </h3>
                <div className="text-sm space-y-2">
                  {activeTab === 'basic' && (
                    <>
                      <div>• Practice mental math daily</div>
                      <div>• Learn multiplication tables</div>
                      <div>• Use estimation to check answers</div>
                    </>
                  )}
                  {activeTab === 'scientific' && (
                    <>
                      <div>• Remember: sin(30°) = 0.5</div>
                      <div>• cos(60°) = sin(30°) = 0.5</div>
                      <div>• tan(45°) = 1</div>
                      <div>• Use unit circle for trig</div>
                    </>
                  )}
                  {activeTab === 'graphing' && (
                    <>
                      <div>• Plot key points first</div>
                      <div>• Check domain and range</div>
                      <div>• Look for symmetry</div>
                      <div>• Find intercepts</div>
                    </>
                  )}
                  {activeTab === 'converter' && (
                    <>
                      <div>• Learn common conversions</div>
                      <div>• 1 inch = 2.54 cm</div>
                      <div>• 1 kg = 2.2 pounds</div>
                      <div>• Water freezes at 0°C/32°F</div>
                    </>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Calculator;