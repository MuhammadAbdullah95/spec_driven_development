describe('Advanced Functions E2E', () => {
  beforeAll(async () => {
    // Setup: Launch browser, navigate to calculator app
    await page.goto('http://localhost:3000/calculator');
  });

  test('should calculate trigonometric functions', async () => {
    // Calculate sin(30) = 0.5
    await page.click('#btn-3');
    await page.click('#btn-0');
    await page.click('#sin-btn');
    
    const result = await page.$eval('#display', el => parseFloat(el.textContent || ''));
    expect(result).toBeCloseTo(0.5);
  });

  test('should calculate logarithmic functions', async () => {
    // Calculate log10(100) = 2
    await page.click('#btn-1');
    await page.click('#btn-0');
    await page.click('#btn-0');
    await page.click('#log-btn');
    
    const result = await page.$eval('#display', el => parseFloat(el.textContent || ''));
    expect(result).toBe(2);
  });

  test('should calculate exponential functions', async () => {
    // Calculate 2^3 = 8
    await page.click('#btn-2');
    await page.click('#power-btn');
    await page.click('#btn-3');
    await page.click('#btn-equals');
    
    const result = await page.$eval('#display', el => parseFloat(el.textContent || ''));
    expect(result).toBe(8);
  });

  test('should calculate square root', async () => {
    // Calculate sqrt(16) = 4
    await page.click('#sqrt-btn');
    await page.click('#btn-1');
    await page.click('#btn-6');
    await page.click('#btn-equals');
    
    const result = await page.$eval('#display', el => parseFloat(el.textContent || ''));
    expect(result).toBe(4);
  });
});