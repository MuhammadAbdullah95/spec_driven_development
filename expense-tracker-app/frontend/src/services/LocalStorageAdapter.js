import { Expense } from '../models/Expense.js';

/**
 * LocalStorage adapter implementing IExpenseRepository
 */
const STORAGE_KEYS = {
  EXPENSES: 'expense-tracker:expenses',
  CATEGORIES: 'expense-tracker:categories',
  META: 'expense-tracker:meta'
};

export class LocalStorageAdapter {
  /**
   * Create a new expense
   */
  async create(expenseData) {
    const expense = new Expense(expenseData);
    Expense.validate(expense);

    const expenses = await this.getAll();
    expenses.push(expense);
    this._save(expenses);

    return expense;
  }

  /**
   * Update an existing expense
   */
  async update(id, updates) {
    const expenses = await this.getAll();
    const index = expenses.findIndex(e => e.id === id);

    if (index === -1) {
      throw new Error(`Expense with ID '${id}' not found`);
    }

    const updated = {
      ...expenses[index],
      ...updates,
      updatedAt: new Date().toISOString()
    };

    Expense.validate(updated);
    expenses[index] = updated;
    this._save(expenses);

    return updated;
  }

  /**
   * Delete an expense
   */
  async delete(id) {
    const expenses = await this.getAll();
    const filtered = expenses.filter(e => e.id !== id);

    if (filtered.length === expenses.length) {
      throw new Error(`Expense with ID '${id}' not found`);
    }

    this._save(filtered);
  }

  /**
   * Get all expenses
   */
  async getAll() {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.EXPENSES);
      const expenses = data ? JSON.parse(data) : [];
      return expenses.sort((a, b) => new Date(b.date) - new Date(a.date));
    } catch (error) {
      console.error('Error loading expenses:', error);
      return [];
    }
  }

  /**
   * Get expense by ID
   */
  async getById(id) {
    const expenses = await this.getAll();
    return expenses.find(e => e.id === id) || null;
  }

  /**
   * Find expenses by date range
   */
  async findByDateRange(startDate, endDate) {
    const expenses = await this.getAll();
    const start = new Date(startDate);
    const end = new Date(endDate);

    return expenses.filter(e => {
      const expenseDate = new Date(e.date);
      return expenseDate >= start && expenseDate <= end;
    });
  }

  /**
   * Find expenses by category
   */
  async findByCategory(categoryId) {
    const expenses = await this.getAll();
    return expenses.filter(e => e.categoryId === categoryId);
  }

  /**
   * Search expenses by description
   */
  async searchByDescription(query) {
    const expenses = await this.getAll();
    const lowerQuery = query.toLowerCase();
    return expenses.filter(e =>
      e.description.toLowerCase().includes(lowerQuery)
    );
  }

  /**
   * Count expenses by category
   */
  async countByCategory(categoryId) {
    const expenses = await this.findByCategory(categoryId);
    return expenses.length;
  }

  /**
   * Bulk update category references
   */
  async bulkUpdateCategory(oldCategoryId, newCategoryId) {
    const expenses = await this.getAll();
    let count = 0;

    const updated = expenses.map(e => {
      if (e.categoryId === oldCategoryId) {
        count++;
        return { ...e, categoryId: newCategoryId, updatedAt: new Date().toISOString() };
      }
      return e;
    });

    if (count > 0) {
      this._save(updated);
    }

    return count;
  }

  /**
   * Save expenses to localStorage
   * @private
   */
  _save(expenses) {
    try {
      localStorage.setItem(STORAGE_KEYS.EXPENSES, JSON.stringify(expenses));
    } catch (error) {
      if (error.name === 'QuotaExceededError') {
        throw new Error('Storage quota exceeded');
      }
      throw new Error('Failed to save data');
    }
  }

  /**
   * Category operations
   */
  async getCategories() {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.CATEGORIES);
      return data ? JSON.parse(data) : [];
    } catch (error) {
      console.error('Error loading categories:', error);
      return [];
    }
  }

  async saveCategories(categories) {
    try {
      localStorage.setItem(STORAGE_KEYS.CATEGORIES, JSON.stringify(categories));
    } catch (error) {
      throw new Error('Failed to save categories');
    }
  }
}
