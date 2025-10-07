import { test, expect } from '@playwright/test';

test.beforeEach(async ({ page }) => {
  await page.goto('http://localhost:5173');
});

test('should allow me to add todo items', async ({ page }) => {
  await page.locator('.new-todo').fill('buy some cheese');
  await page.locator('.new-todo').press('Enter');

  await expect(page.locator('.todo-list li')).toHaveText(['buy some cheese']);

  await page.locator('.new-todo').fill('feed the cat');
  await page.locator('.new-todo').press('Enter');

  await expect(page.locator('.todo-list li')).toHaveText(['buy some cheese', 'feed the cat']);
});

test('should allow me to complete a todo item', async ({ page }) => {
  await page.locator('.new-todo').fill('buy some cheese');
  await page.locator('.new-todo').press('Enter');

  await page.locator('.todo-list li .toggle').check();

  await expect(page.locator('.todo-list li')).toHaveClass('completed');
});

test('should allow me to edit a todo item', async ({ page }) => {
  await page.locator('.new-todo').fill('buy some cheese');
  await page.locator('.new-todo').press('Enter');

  await page.locator('.todo-list li label').dblclick();
  await page.locator('.todo-list li .edit').fill('buy some milk');
  await page.locator('.todo-list li .edit').press('Enter');

  await expect(page.locator('.todo-list li')).toHaveText('buy some milk');
});

test('should allow me to delete a todo item', async ({ page }) => {
  await page.locator('.new-todo').fill('buy some cheese');
  await page.locator('.new-todo').press('Enter');

  await page.locator('.todo-list li .destroy').click();

  await expect(page.locator('.todo-list li')).toHaveCount(0);
});