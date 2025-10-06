export const CALCULATOR_CONSTANTS = {
  DEFAULT_PRECISION: 10,
  MAX_INPUT_LENGTH: 20,
  HISTORY_LIMIT: 50,
  TRIGONOMETRIC_MODE: 'DEGREES' as const, // Can be 'DEGREES' or 'RADIANS'
};

export const SCIENTIFIC_OPERATIONS = [
  'sin', 'cos', 'tan', 
  'asin', 'acos', 'atan',
  'log', 'ln', 'log10',
  'sqrt', 'abs', 'pow',
  'exp', 'factorial'
];

export const CONSTANTS = {
  PI: Math.PI,
  E: Math.E,
};

export const KEY_CODES = {
  DIGITS: ['0', '1', '2', '3', '4', '5', '6', '7', '8', '9'],
  OPERATORS: ['+', '-', '*', '/', '^', '='],
  SPECIAL: ['.', '(', ')', 'C', 'AC', 'DEL'],
  FUNCTIONS: ['sin', 'cos', 'tan', 'log', 'ln', 'sqrt', 'pi', 'e'],
};