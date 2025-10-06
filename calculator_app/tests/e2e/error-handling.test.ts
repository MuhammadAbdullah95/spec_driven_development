describe('Error Handling E2E', () => {
  beforeAll(async () => {
    // Setup: Launch browser, navigate to calculator app
    await page.goto('http://localhost:3000/calculator');
  });

  test('should handle division by zero', async () => {
    // Perform 5 / 0
    await page.click('#btn-5');
    await page.click('#btn-divide');
    await page.click('#btn-0');
    await page.click('#btn-equals');
    
    // Check for error message
    const display = await page.$eval('#display', el => el.textContent);
    expect(display).toContain('Error');
  });

  test('should handle invalid operations', async () => {
    // Attempt to calculate square root of negative number
    await page.click('#sqrt-btn');
    await page.click('#btn-0');
    await page.click('#btn-minus');
    await page.click('#btn-4');
    await page.click('#btn-equals');
    
    const display = await page.$eval('#display', el => el.textContent);
    expect(display).toContain('Error');
  });

  test('should allow continuation after error', async () => {
    // Cause an error first
    await page.click('#btn-5');
    await page.click('#btn-divide');
    await page.click('#btn-0');
    await page.click('#btn-equals');
    
    // Clear and perform valid calculation
    await page.click('#clear-btn');
    await page.click('#btn-2');
    await page.click('#btn-plus');
    await page.click('#btn-3');
    await page.click('#btn-equals');
    
    const result = await page.$eval('#display', el => el.textContent);
    expect(result).toBe('5');
  });
});