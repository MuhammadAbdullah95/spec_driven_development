import { LocalStorageAdapter } from './LocalStorageAdapter.js';
import { Category } from '../models/Category.js';

/**
 * Business logic layer for category operations
 */
export class CategoryService {
  constructor() {
    this.storage = new LocalStorageAdapter();
  }

  /**
   * Create a new custom category
   */
  async createCategory(name) {
    const category = new Category({
      name: name.trim(),
      type: 'custom'
    });

    const categories = await this.storage.getCategories();

    // Check for duplicate names (case-insensitive)
    const duplicate = categories.find(
      c => c.name.toLowerCase() === category.name.toLowerCase()
    );

    if (duplicate) {
      throw new Error(`Category "${name}" already exists`);
    }

    categories.push(category);
    await this.storage.saveCategories(categories);

    return category;
  }

  /**
   * Update a category name
   */
  async updateCategory(id, newName) {
    const categories = await this.storage.getCategories();
    const category = categories.find(c => c.id === id);

    if (!category) {
      throw new Error('Category not found');
    }

    // Check for duplicate names (excluding current category)
    const duplicate = categories.find(
      c => c.id !== id && c.name.toLowerCase() === newName.trim().toLowerCase()
    );

    if (duplicate) {
      throw new Error(`Category "${newName}" already exists`);
    }

    category.name = newName.trim();
    await this.storage.saveCategories(categories);

    return category;
  }

  /**
   * Delete a category
   * Returns count of expenses that were affected
   */
  async deleteCategory(id, reassignToCategoryId = null) {
    const categories = await this.storage.getCategories();
    const category = categories.find(c => c.id === id);

    if (!category) {
      throw new Error('Category not found');
    }

    if (category.type === 'predefined') {
      throw new Error('Cannot delete predefined categories');
    }

    // Count expenses using this category
    const expenseCount = await this.storage.countByCategory(id);

    if (expenseCount > 0) {
      // Reassign or set to null (uncategorized)
      await this.storage.bulkUpdateCategory(id, reassignToCategoryId);
    }

    // Remove category from list
    const updated = categories.filter(c => c.id !== id);
    await this.storage.saveCategories(updated);

    return { deleted: true, affectedExpenses: expenseCount };
  }

  /**
   * Get all categories
   */
  async getAllCategories() {
    return await this.storage.getCategories();
  }

  /**
   * Get custom categories only
   */
  async getCustomCategories() {
    const categories = await this.storage.getCategories();
    return categories.filter(c => c.type === 'custom');
  }

  /**
   * Get predefined categories only
   */
  async getPredefinedCategories() {
    const categories = await this.storage.getCategories();
    return categories.filter(c => c.type === 'predefined');
  }
}
