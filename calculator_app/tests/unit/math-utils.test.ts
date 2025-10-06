import { formatResult, isValidExpression, roundToPrecision } from '@/lib/math-utils';

describe('Math Utilities', () => {
  test('should format results correctly', () => {
    expect(formatResult(3.14159, 2)).toBe('3.14');
    expect(formatResult(10, 2)).toBe('10');
    expect(formatResult(0.333333, 4)).toBe('0.3333');
  });

  test('should validate expressions correctly', () => {
    expect(isValidExpression('2 + 2')).toBe(true);
    expect(isValidExpression('')).toBe(false);
    expect(isValidExpression(null as any)).toBe(false);
    expect(isValidExpression('2 +')).toBe(false);
  });

  test('should round to specified precision', () => {
    expect(roundToPrecision(3.14159, 2)).toBe(3.14);
    expect(roundToPrecision(10, 2)).toBe(10);
    expect(roundToPrecision(0.333333, 4)).toBe(0.3333);
  });

  test('should handle edge cases', () => {
    expect(formatResult(Infinity, 2)).toBe('Infinity');
    expect(formatResult(-Infinity, 2)).toBe('-Infinity');
    expect(isValidExpression('2 / 0')).toBe(true); // Validation happens during evaluation
  });
});