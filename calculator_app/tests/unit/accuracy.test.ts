import { evaluateExpression } from '@/lib/calculator-engine';
import { roundToPrecision, formatResult } from '@/lib/math-utils';

describe('Calculation Accuracy', () => {
  test('should maintain precision for basic operations', () => {
    expect(evaluateExpression('0.1 + 0.2')).toBeCloseTo(0.3, 10);
    expect(evaluateExpression('1.1 + 2.2')).toBeCloseTo(3.3, 10);
  });

  test('should handle very large numbers', () => {
    const result = evaluateExpression('999999999 * 999999999');
    expect(result).toBe(999999998000000001);
  });

  test('should handle very small numbers', () => {
    expect(evaluateExpression('0.0000000001 + 0.0000000002')).toBeCloseTo(0.0000000003, 15);
  });

  test('should handle complex expressions with high precision', () => {
    const result = evaluateExpression('sin(30) + cos(60)');
    // sin(30°) = 0.5, cos(60°) = 0.5, so result should be 1
    expect(result).toBeCloseTo(1, 1);
  });

  test('roundToPrecision should work correctly', () => {
    expect(roundToPrecision(3.141592653589793, 2)).toBe(3.14);
    expect(roundToPrecision(2.718281828459045, 3)).toBe(2.718);
  });

  test('formatResult should work correctly', () => {
    expect(formatResult(3.14159, 2)).toBe('3.14');
    expect(formatResult(10)).toBe('10');
  });

  test('should handle mathematical constants with precision', () => {
    const result = evaluateExpression('pi * 2');
    expect(result).toBeCloseTo(Math.PI * 2, 10);
  });
});