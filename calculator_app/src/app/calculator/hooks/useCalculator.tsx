import { useState, useCallback } from 'react';
import { evaluateExpression, safeEvaluate, calculateGeometry } from '@/lib/calculator-engine';
import { roundToPrecision, formatResult, normalizeExpression } from '@/lib/math-utils';
import { CALCULATOR_CONSTANTS, CONSTANTS } from '@/lib/constants';
import { CalculatorState } from '@/types/calculator';
import { solveLinearEquation, solveQuadraticEquation } from '@/lib/algebra-engine';

export const useCalculator = () => {
  const [displayValue, setDisplayValue] = useState('0');
  const [previousValue, setPreviousValue] = useState<number | null>(null);
  const [operation, setOperation] = useState<string | null>(null);
  const [waitingForOperand, setWaitingForOperand] = useState(false);
  const [lastExpression, setLastExpression] = useState<string>('');

  const clearAll = useCallback(() => {
    setDisplayValue('0');
    setPreviousValue(null);
    setOperation(null);
    setWaitingForOperand(false);
  }, []);

  const inputDigit = useCallback((digit: string) => {
    const { MAX_INPUT_LENGTH } = CALCULATOR_CONSTANTS;
    
    if (waitingForOperand) {
      setDisplayValue(digit);
      setWaitingForOperand(false);
    } else {
      // Allow multiple zeros and other digits
      if (displayValue === '0' && digit !== '0') {
        setDisplayValue(digit);
      } else {
        setDisplayValue(displayValue + digit);
      }
      
      // Limit input length
      if (displayValue.length >= MAX_INPUT_LENGTH) {
        setDisplayValue(displayValue.substring(0, MAX_INPUT_LENGTH));
      }
    }
  }, [displayValue, waitingForOperand]);

  const inputDecimal = useCallback(() => {
    if (waitingForOperand) {
      setDisplayValue('0.');
      setWaitingForOperand(false);
    } else if (!displayValue.includes('.')) {
      setDisplayValue(displayValue + '.');
    }
  }, [displayValue, waitingForOperand]);

  const clearDisplay = useCallback(() => {
    setDisplayValue('0');
  }, []);

  const toggleSign = useCallback(() => {
    const newValue = parseFloat(displayValue) * -1;
    setDisplayValue(String(newValue));
  }, [displayValue]);

  const inputPercent = useCallback(() => {
    const value = parseFloat(displayValue);
    const newValue = value / 100;
    setDisplayValue(String(newValue));
  }, [displayValue]);

  const performOperation = useCallback((nextOperation: string) => {
    const inputValue = parseFloat(displayValue);

    if (previousValue === null) {
      setPreviousValue(inputValue);
    } else if (operation) {
      const currentValue = previousValue;
      let newValue: number;

      switch (operation) {
        case '+':
          newValue = currentValue + inputValue;
          break;
        case '-':
          newValue = currentValue - inputValue;
          break;
        case '*':
          newValue = currentValue * inputValue;
          break;
        case '/':
          if (inputValue === 0) {
            setDisplayValue('Error: Division by zero');
            return;
          }
          newValue = currentValue / inputValue;
          break;
        default:
          newValue = inputValue;
      }

      // Round to precision to handle floating point issues
      newValue = roundToPrecision(newValue, CALCULATOR_CONSTANTS.DEFAULT_PRECISION);

      setPreviousValue(newValue);
      setDisplayValue(formatResult(newValue));
    }

    setWaitingForOperand(true);
    setOperation(nextOperation);
  }, [displayValue, previousValue, operation]);

  const performEquals = useCallback(() => {
    if (operation === null || previousValue === null) {
      // If there's no stored operation, just evaluate the current expression
      const originalExpression = displayValue;
      const evalResult = safeEvaluate(normalizeExpression(displayValue));
      if (evalResult.error) {
        setDisplayValue(`Error: ${evalResult.error}`);
        return;
      }
      if (evalResult.result !== null) {
        const roundedResult = roundToPrecision(evalResult.result, CALCULATOR_CONSTANTS.DEFAULT_PRECISION);
        setLastExpression(originalExpression);
        setDisplayValue(formatResult(roundedResult));
        setWaitingForOperand(true);
      }
      return;
    }

    const inputValue = parseFloat(displayValue);
    const currentValue = previousValue;
    let newValue: number;

    switch (operation) {
      case '+':
        newValue = currentValue + inputValue;
        break;
      case '-':
        newValue = currentValue - inputValue;
        break;
      case '*':
        newValue = currentValue * inputValue;
        break;
      case '/':
        if (inputValue === 0) {
          setDisplayValue('Error: Division by zero');
          return;
        }
        newValue = currentValue / inputValue;
        break;
      default:
        newValue = inputValue;
    }

    const roundedResult = roundToPrecision(newValue, CALCULATOR_CONSTANTS.DEFAULT_PRECISION);
    setLastExpression(`${currentValue} ${operation} ${inputValue}`);
    setDisplayValue(formatResult(roundedResult));
    setOperation(null);
    setPreviousValue(null);
    setWaitingForOperand(true);
  }, [operation, previousValue, displayValue]);

  const calculateScientificFunction = useCallback((funcName: string) => {
    try {
      // Get the current value to apply the function to
      let currentValue = displayValue;
      
      // If we're waiting for operand or display is just a number, apply function directly
      if (waitingForOperand || /^-?\d*\.?\d*$/.test(displayValue)) {
        const value = parseFloat(displayValue);
        if (isNaN(value)) {
          setDisplayValue('Error: Invalid input');
          return;
        }

        let result: number;
        let functionExpression: string;

        switch (funcName) {
          case 'sin':
            result = Math.sin(value * (Math.PI / 180));
            functionExpression = `sin(${value})`;
            break;
          case 'cos':
            result = Math.cos(value * (Math.PI / 180));
            functionExpression = `cos(${value})`;
            break;
          case 'tan':
            result = Math.tan(value * (Math.PI / 180));
            functionExpression = `tan(${value})`;
            break;
          case 'asin':
            if (value < -1 || value > 1) {
              setDisplayValue('Error: Domain error for asin');
              return;
            }
            result = Math.asin(value) * (180 / Math.PI);
            functionExpression = `asin(${value})`;
            break;
          case 'acos':
            if (value < -1 || value > 1) {
              setDisplayValue('Error: Domain error for acos');
              return;
            }
            result = Math.acos(value) * (180 / Math.PI);
            functionExpression = `acos(${value})`;
            break;
          case 'atan':
            result = Math.atan(value) * (180 / Math.PI);
            functionExpression = `atan(${value})`;
            break;
          case 'log':
            if (value <= 0) {
              setDisplayValue('Error: Log of non-positive number');
              return;
            }
            result = Math.log10(value);
            functionExpression = `log(${value})`;
            break;
          case 'ln':
            if (value <= 0) {
              setDisplayValue('Error: Log of non-positive number');
              return;
            }
            result = Math.log(value);
            functionExpression = `ln(${value})`;
            break;
          case 'sqrt':
            if (value < 0) {
              setDisplayValue('Error: Sqrt of negative number');
              return;
            }
            result = Math.sqrt(value);
            functionExpression = `√(${value})`;
            break;
          case '1/x':
            if (value === 0) {
              setDisplayValue('Error: Division by zero');
              return;
            }
            result = 1 / value;
            functionExpression = `1/(${value})`;
            break;
          default:
            throw new Error(`Unknown function: ${funcName}`);
        }

        result = roundToPrecision(result, CALCULATOR_CONSTANTS.DEFAULT_PRECISION);
        setLastExpression(functionExpression);
        setDisplayValue(formatResult(result));
        setWaitingForOperand(true);
      } else {
        // If display contains an expression, wrap it in the function
        const functionExpression = `${funcName}(${displayValue})`;
        setDisplayValue(functionExpression);
      }
    } catch (error) {
      setDisplayValue('Error');
      console.error('Error in scientific calculation:', error);
    }
  }, [displayValue, waitingForOperand]);

  const calculateAlgebraic = useCallback((expression: string) => {
    try {
      // For now, we'll handle simple equations and let the solver handle it
      const result = safeEvaluate(expression);
      if (result.error) {
        setDisplayValue(`Error: ${result.error}`);
        return;
      }
      
      if (result.result !== null) {
        const roundedResult = roundToPrecision(result.result, CALCULATOR_CONSTANTS.DEFAULT_PRECISION);
        setDisplayValue(formatResult(roundedResult));
      }
    } catch (error) {
      setDisplayValue('Error in algebraic calculation');
      console.error('Error in algebraic calculation:', error);
    }
  }, []);

  const calculateGeometryFunction = useCallback((shape: string, ...params: number[]) => {
    try {
      const result = calculateGeometry(shape, params);
      const roundedResult = roundToPrecision(result, CALCULATOR_CONSTANTS.DEFAULT_PRECISION);
      setDisplayValue(formatResult(roundedResult));
    } catch (error) {
      setDisplayValue(`Error in geometry: ${error instanceof Error ? error.message : 'Unknown error'}`);
      console.error('Error in geometry calculation:', error);
    }
  }, []);

  const appendToDisplay = useCallback((value: string) => {
    setDisplayValue(prev => prev === '0' ? value : prev + value);
  }, []);

  const appendConstant = useCallback((constantName: string) => {
    switch(constantName) {
      case 'π':
        if (displayValue === '0') {
          setDisplayValue(CONSTANTS.PI.toString());
        } else {
          appendToDisplay('*' + CONSTANTS.PI.toString());
        }
        break;
      case 'e':
        if (displayValue === '0') {
          setDisplayValue(CONSTANTS.E.toString());
        } else {
          appendToDisplay('*' + CONSTANTS.E.toString());
        }
        break;
      default:
        break;
    }
  }, [appendToDisplay, displayValue]);

  const setDisplayFromHistory = useCallback((value: string) => {
    setDisplayValue(value);
    setWaitingForOperand(false);
  }, []);

  return {
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
    calculateGeometry: calculateGeometryFunction,
    appendToDisplay,
    appendConstant,
    setDisplayFromHistory,
    lastExpression,
  };
};