import { CalculatorService } from '@/lib/calculator-engine';

describe('Calculator Service Contract', () => {
  let calculatorService: CalculatorService;

  beforeEach(() => {
    calculatorService = new CalculatorService();
  });

  test('should have evaluate method', () => {
    expect(calculatorService).toHaveMethod('evaluate');
  });

  test('evaluate method should accept and return correct types', () => {
    const result = calculatorService.evaluate('2 + 3');
    expect(typeof result).toBe('number');
    expect(result).toBe(5);
  });

  test('evaluate method should handle different expression types', () => {
    expect(calculatorService.evaluate('sin(0)')).toBeCloseTo(0);
    expect(calculatorService.evaluate('cos(0)')).toBeCloseTo(1);
    expect(calculatorService.evaluate('log10(100)')).toBe(2);
  });

  test('should handle errors appropriately', () => {
    expect(() => calculatorService.evaluate('2 / 0')).toThrow();
    expect(() => calculatorService.evaluate('sqrt(-1)')).toThrow();
  });
});