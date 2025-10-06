import { create, all } from 'mathjs';
import { solveAlgebraicExpression } from './algebra-engine';
import {
  circleArea, circleCircumference, rectangleArea, triangleArea,
  sphereVolume, rectangularPrismVolume, cylinderVolume, ellipseArea,
  triangleAreaHeron, sphereSurfaceArea, distance2D, rightTriangleAngle
} from './geometry-utils';

const config = {
  number: 'BigNumber',
  precision: 64
};

const math = create(all, config);

export const evaluateExpression = (expression: string): number => {
  try {
    // Check if this is an algebraic expression (contains variable or equation)
    if (expression.toLowerCase().includes('x') || expression.includes('=')) {
      const result = solveAlgebraicExpression(expression);
      // If the result is an array (multiple solutions), return the first one
      return Array.isArray(result) ? result[0] : result;
    }
    
    // Sanitize the expression to prevent security issues
    // Only allow safe mathematical characters and functions
    const sanitizedExpression = expression.replace(/[^0-9+\-*/().xX\s\^sincoateglqrvudfmp]/g, (match) => {
      // Allow specific mathematical functions
      if (match.match(/^(sin|cos|tan|asin|acos|atan|log|ln|log10|sqrt|abs|pi|e|pow|exp|factorial|area|volume|circumference)$/)) {
        return match;
      }
      throw new Error(`Invalid character in expression: ${match}`);
    });

    // Replace 'x' with '*' for multiplication if needed
    const formattedExpression = sanitizedExpression
      .replace(/\s*x\s*/g, '*')
      .replace(/\^/g, '**'); // Replace ^ with ** for exponentiation
    
    const result = math.evaluate(formattedExpression);
    return typeof result === 'number' ? result : Number(result);
  } catch (error) {
    console.error('Error evaluating expression:', error);
    throw error;
  }
};

export class CalculatorService {
  evaluate(expression: string): number {
    return evaluateExpression(expression);
  }
}

// Geometry calculation functions
export const calculateGeometry = (shape: string, params: number[]): number => {
  switch (shape.toLowerCase()) {
    case 'circle':
      if (params.length < 1) throw new Error('Circle requires radius');
      return circleArea(params[0]);
    case 'rectangle':
      if (params.length < 2) throw new Error('Rectangle requires length and width');
      return rectangleArea(params[0], params[1]);
    case 'triangle':
      if (params.length < 2) throw new Error('Triangle requires base and height');
      return triangleArea(params[0], params[1]);
    case 'sphere':
      if (params.length < 1) throw new Error('Sphere requires radius');
      return sphereVolume(params[0]);
    case 'cylinder':
      if (params.length < 2) throw new Error('Cylinder requires radius and height');
      return cylinderVolume(params[0], params[1]);
    default:
      throw new Error(`Unknown shape: ${shape}`);
  }
};

// Specific error handling wrapper functions
export const safeEvaluate = (expression: string): { result: number | null; error?: string } => {
  try {
    const result = evaluateExpression(expression);
    return { result };
  } catch (error) {
    return { 
      result: null, 
      error: error instanceof Error ? error.message : 'Unknown error during calculation' 
    };
  }
};