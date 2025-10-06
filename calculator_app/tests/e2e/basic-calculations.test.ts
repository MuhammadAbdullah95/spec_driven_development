describe('Basic Calculations E2E', () => {
  beforeAll(async () => {
    // Setup: Launch browser, navigate to calculator app
    await page.goto('http://localhost:3000/calculator');
  });

  test('should perform basic arithmetic operations', async () => {
    // Clear any existing input
    await page.click('#clear-btn');
    
    // Perform 2 + 3 = 5
    await page.click('#btn-2');
    await page.click('#btn-plus');
    await page.click('#btn-3');
    await page.click('#btn-equals');
    
    // Check result
    const result = await page.$eval('#display', el => el.textContent);
    expect(result).toBe('5');
  });

  test('should handle decimal calculations', async () => {
    await page.click('#clear-btn');
    
    // Perform 0.1 + 0.2 (approximately 0.3)
    await page.click('#btn-0');
    await page.click('#btn-decimal');
    await page.click('#btn-1');
    await page.click('#btn-plus');
    await page.click('#btn-0');
    await page.click('#btn-decimal');
    await page.click('#btn-2');
    await page.click('#btn-equals');
    
    // Check result is approximately 0.3
    const result = await page.$eval('#display', el => parseFloat(el.textContent || ''));
    expect(result).toBeCloseTo(0.3);
  });

  test('should clear calculations', async () => {
    await page.click('#btn-5');
    await page.click('#clear-btn');
    
    const display = await page.$eval('#display', el => el.textContent);
    expect(display).toBe('');
  });
});