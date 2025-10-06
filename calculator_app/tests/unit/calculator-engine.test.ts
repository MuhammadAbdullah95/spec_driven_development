import { evaluateExpression } from '@/lib/calculator-engine';

describe('Calculator Engine', () => {
  test('should perform basic arithmetic operations', () => {
    expect(evaluateExpression('2 + 3')).toBe(5);
    expect(evaluateExpression('10 - 4')).toBe(6);
    expect(evaluateExpression('6 * 7')).toBe(42);
    expect(evaluateExpression('15 / 3')).toBe(5);
  });

  test('should handle decimal numbers', () => {
    expect(evaluateExpression('0.1 + 0.2')).toBeCloseTo(0.3);
    expect(evaluateExpression('3.14 * 2')).toBeCloseTo(6.28);
  });

  test('should handle complex expressions', () => {
    expect(evaluateExpression('(2 + 3) * 4')).toBe(20);
    expect(evaluateExpression('2 * (3 + 4) / 2')).toBe(7);
  });

  test('should handle exponentiation', () => {
    expect(evaluateExpression('2 ^ 3')).toBe(8);
    expect(evaluateExpression('sqrt(16)')).toBe(4);
  });

  test('should handle trigonometric functions', () => {
    expect(evaluateExpression('sin(0)')).toBeCloseTo(0);
    expect(evaluateExpression('cos(0)')).toBeCloseTo(1);
    expect(evaluateExpression('tan(45)')).toBeCloseTo(1, 0); // tan(45 degrees)
  });

  test('should handle logarithmic functions', () => {
    expect(evaluateExpression('log10(100)')).toBe(2);
    expect(evaluateExpression('ln(e)')).toBeCloseTo(1);
  });

  test('should handle errors appropriately', () => {
    expect(() => evaluateExpression('1 / 0')).toThrow();
    expect(() => evaluateExpression('sqrt(-1)')).toThrow();
  });
});