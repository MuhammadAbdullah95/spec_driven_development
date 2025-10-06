export const formatResult = (value: number, precision: number = 10): string => {
  if (isNaN(value) || !isFinite(value)) {
    return value.toString();
  }
  
  // If the number is an integer, return it as such
  if (Number.isInteger(value)) {
    return value.toString();
  }
  
  // Otherwise, round to the specified precision
  const rounded = roundToPrecision(value, precision);
  return rounded.toString();
};

export const isValidExpression = (expression: string | null | undefined): boolean => {
  if (!expression || typeof expression !== 'string' || expression.trim() === '') {
    return false;
  }

  // Basic validation: check if the expression contains valid characters
  const validPattern = /^[0-9+\-*/().\s\sinxco\tlgep^%]+$/;
  return validPattern.test(expression);
};

export const roundToPrecision = (value: number, precision: number): number => {
  if (!isFinite(value)) {
    return value;
  }
  
  const factor = Math.pow(10, precision);
  return Math.round(value * factor) / factor;
};

export const validateInput = (input: string): boolean => {
  // Check for balanced parentheses
  const stack: string[] = [];
  for (const char of input) {
    if (char === '(') {
      stack.push(char);
    } else if (char === ')') {
      if (stack.length === 0) {
        return false;
      }
      stack.pop();
    }
  }
  
  return stack.length === 0;
};

export const normalizeExpression = (expr: string): string => {
  // Replace common synonyms with standard operators and functions
  return expr
    .replace(/\s*x\s*/g, '*')  // Replace x with *
    .replace(/\s*X\s*/g, '*')  // Replace X with *
    .replace(/\^/g, '**')      // Replace ^ with ** for exponentiation
    .replace(/√\(/g, 'sqrt(')  // Replace √( with sqrt(
    .replace(/π/g, Math.PI.toString())  // Replace π with actual value
    .replace(/\be\b/g, Math.E.toString())  // Replace e with actual value (word boundary to avoid replacing 'exp')
    .replace(/1\/\(/g, '1/(')  // Ensure 1/( is properly formatted
    .replace(/(\d+)(\()/g, '$1*$2')  // Add multiplication between number and parenthesis like 2(3+4)
    .replace(/\)(\d+)/g, ')*$1')     // Add multiplication between parenthesis and number like (3+4)2
    .replace(/\)\(/g, ')*(');        // Add multiplication between parentheses like (3+4)(5+6)
};