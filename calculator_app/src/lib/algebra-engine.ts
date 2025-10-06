import { create, all } from 'mathjs';

const math = create(all);

/**
 * Solves linear equations of the form ax + b = c
 * @param a Coefficient of x
 * @param b Constant term
 * @param c Right-hand side
 * @returns Solution for x
 */
export const solveLinearEquation = (a: number, b: number, c: number): number => {
  if (a === 0) {
    throw new Error('Coefficient of x cannot be zero in a linear equation');
  }
  return (c - b) / a;
};

/**
 * Solves quadratic equations of the form ax^2 + bx + c = 0
 * @param a Coefficient of x^2
 * @param b Coefficient of x
 * @param c Constant term
 * @returns Array of solutions (0, 1, or 2 solutions)
 */
export const solveQuadraticEquation = (a: number, b: number, c: number): number[] => {
  if (a === 0) {
    // If a is 0, it's a linear equation
    if (b === 0) {
      // If both a and b are 0, there's no variable to solve for
      return [];
    }
    return [(-c) / b];
  }

  const discriminant = b * b - 4 * a * c;

  if (discriminant < 0) {
    // No real solutions
    return [];
  } else if (discriminant === 0) {
    // One solution
    return [-b / (2 * a)];
  } else {
    // Two solutions
    const sqrtDiscriminant = Math.sqrt(discriminant);
    return [
      (-b + sqrtDiscriminant) / (2 * a),
      (-b - sqrtDiscriminant) / (2 * a)
    ];
  }
};

/**
 * Evaluates a polynomial expression with given coefficients at a value
 * @param coefficients Array of coefficients [a_n, a_n-1, ..., a_1, a_0] for a_n*x^n + ... + a_1*x + a_0
 * @param x Value at which to evaluate
 * @returns Result of the polynomial evaluation
 */
export const evaluatePolynomial = (coefficients: number[], x: number): number => {
  if (coefficients.length === 0) return 0;

  let result = 0;
  const n = coefficients.length - 1; // degree of polynomial

  for (let i = 0; i <= n; i++) {
    result += coefficients[i] * Math.pow(x, n - i);
  }

  return result;
};

/**
 * Solves algebraic expressions using math.js
 * @param expression Algebraic expression to solve (e.g., "2*x + 3 = 7")
 * @returns Solution for x or evaluated result
 */
export const solveAlgebraicExpression = (expression: string): number | number[] => {
  try {
    // For now, we'll handle simple linear equations of form "ax + b = c"
    if (expression.includes('=')) {
      const [left, right] = expression.split('=');
      const rightValue = math.evaluate(right.trim());
      
      // Simple solver for linear equations of form ax + b = c
      const leftTrimmed = left.trim();
      const xMatch = leftTrimmed.match(/(-?\d*\.?\d*)\s*\*\s*x|(-?\d*\.?\d*)\s*x/i);
      
      if (xMatch) {
        const a = parseFloat(xMatch[1] || xMatch[2] || '1');
        const withoutX = leftTrimmed.replace(/(-?\d*\.?\d*)\s*\*\s*x|(-?\d*\.?\d*)\s*x/i, '');
        const b = math.evaluate(withoutX.trim() || '0');
        
        return solveLinearEquation(a, b, rightValue);
      }
    }
    
    // If it's not an equation, just evaluate the expression
    return math.evaluate(expression);
  } catch (error) {
    throw new Error(`Error solving algebraic expression: ${error}`);
  }
};