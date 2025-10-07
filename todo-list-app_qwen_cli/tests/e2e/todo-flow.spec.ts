import { test, expect } from '@playwright/test';

test.describe('To-Do List App', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
  });

  test('should allow user to add, edit, complete, delete, and reload tasks', async ({ page }) => {
    // Add a task
    await page.locator('#new-task-title').fill('Test task');
    await page.locator('#add-task-btn').click();
    
    // Verify task was added
    await expect(page.locator('[data-testid="task-title"]')).toContainText('Test task');
    
    // Edit the task
    await page.locator('[data-testid="edit-task-btn"]').click();
    await page.locator('[data-testid="task-edit-input"]').fill('Updated test task');
    await page.locator('[data-testid="save-task-btn"]').click();
    
    // Verify task was updated
    await expect(page.locator('[data-testid="task-title"]')).toContainText('Updated test task');
    
    // Complete the task
    await page.locator('[data-testid="task-checkbox"]').click();
    
    // Verify task is marked as completed
    const completedTask = page.locator('.task-item.completed');
    await expect(completedTask).toBeVisible();
    
    // Delete the task
    await page.locator('[data-testid="delete-task-btn"]').click();
    
    // Verify task is removed
    await expect(page.locator('[data-testid="task-title"]')).not.toBeVisible();
  });

  test('should persist tasks across page reloads', async ({ page }) => {
    // Add a task
    await page.locator('#new-task-title').fill('Persistent task');
    await page.locator('#add-task-btn').click();
    
    // Reload the page
    await page.reload();
    
    // Verify the task still exists
    await expect(page.locator('[data-testid="task-title"]')).toContainText('Persistent task');
  });

  test('should filter tasks correctly', async ({ page }) => {
    // Add multiple tasks
    await page.locator('#new-task-title').fill('Active task 1');
    await page.locator('#add-task-btn').click();
    
    await page.locator('#new-task-title').fill('Active task 2');
    await page.locator('#add-task-btn').click();
    
    // Complete one task
    await page.locator('[data-testid="task-checkbox"]').first().click();
    
    // Test "Active" filter
    await page.locator('[data-testid="filter-active"]').click();
    const activeTasks = page.locator('[data-testid="task-title"]');
    await expect(activeTasks).toHaveCount(1);
    await expect(activeTasks).not.toContainText('Completed task');
    
    // Test "Completed" filter
    await page.locator('[data-testid="filter-completed"]').click();
    const completedTasks = page.locator('[data-testid="task-title"]');
    await expect(completedTasks).toHaveCount(1);
    await expect(completedTasks).not.toContainText('Active task');
    
    // Test "All" filter
    await page.locator('[data-testid="filter-all"]').click();
    const allTasks = page.locator('[data-testid="task-title"]');
    await expect(allTasks).toHaveCount(2);
  });
});