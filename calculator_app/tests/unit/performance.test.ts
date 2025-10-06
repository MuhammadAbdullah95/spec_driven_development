import { evaluateExpression } from '@/lib/calculator-engine';

describe('Performance Tests', () => {
  test('calculations should complete within 200ms', () => {
    const start = performance.now();
    evaluateExpression('2 + 3');
    const end = performance.now();
    
    expect(end - start).toBeLessThan(200);
  });

  test('complex calculations should complete within 200ms', () => {
    const start = performance.now();
    evaluateExpression('sin(30) * cos(45) + log(100) / sqrt(16)');
    const end = performance.now();
    
    expect(end - start).toBeLessThan(200);
  });

  test('trigonometric functions should be fast', () => {
    const start = performance.now();
    evaluateExpression('sin(90) + cos(0) + tan(45)');
    const end = performance.now();
    
    expect(end - start).toBeLessThan(200);
  });

  test('large number calculations should be fast', () => {
    const start = performance.now();
    evaluateExpression('999999999 * 999999999');
    const end = performance.now();
    
    expect(end - start).toBeLessThan(200);
  });

  test('series of calculations should perform well', () => {
    const start = performance.now();
    
    for (let i = 0; i < 100; i++) {
      evaluateExpression(`${i} * ${i + 1}`);
    }
    
    const end = performance.now();
    // 100 calculations should complete in reasonable time
    expect(end - start).toBeLessThan(1000); // Less than 1 second for 100 calcs
  });
});