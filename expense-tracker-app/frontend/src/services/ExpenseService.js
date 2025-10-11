import { LocalStorageAdapter } from './LocalStorageAdapter.js';

/**
 * Business logic layer for expense operations
 */
export class ExpenseService {
  constructor() {
    this.storage = new LocalStorageAdapter();
  }

  /**
   * Create a new expense
   */
  async createExpense(expenseData) {
    return await this.storage.create(expenseData);
  }

  /**
   * Update an existing expense
   */
  async updateExpense(id, updates) {
    return await this.storage.update(id, updates);
  }

  /**
   * Delete an expense
   */
  async deleteExpense(id) {
    await this.storage.delete(id);
  }

  /**
   * Get all expenses
   */
  async getAllExpenses() {
    return await this.storage.getAll();
  }

  /**
   * Get expense by ID
   */
  async getExpenseById(id) {
    return await this.storage.getById(id);
  }

  /**
   * Search expenses by description
   */
  async searchExpenses(query) {
    return await this.storage.searchByDescription(query);
  }

  /**
   * Filter expenses by category
   */
  async getExpensesByCategory(categoryId) {
    return await this.storage.findByCategory(categoryId);
  }

  /**
   * Filter expenses by date range
   */
  async getExpensesByDateRange(startDate, endDate) {
    return await this.storage.findByDateRange(startDate, endDate);
  }

  /**
   * Get expense count by category
   */
  async getExpenseCountByCategory(categoryId) {
    return await this.storage.countByCategory(categoryId);
  }

  /**
   * Calculate total for given expenses
   */
  calculateTotal(expenses) {
    return expenses.reduce((sum, expense) => sum + expense.amount, 0);
  }

  /**
   * Group expenses by category
   */
  groupByCategory(expenses, categories) {
    const grouped = {};

    expenses.forEach(expense => {
      const categoryId = expense.categoryId || 'uncategorized';
      if (!grouped[categoryId]) {
        grouped[categoryId] = {
          categoryId,
          categoryName: expense.categoryId
            ? categories.find(c => c.id === expense.categoryId)?.name || 'Unknown'
            : 'Uncategorized',
          expenses: [],
          total: 0
        };
      }
      grouped[categoryId].expenses.push(expense);
      grouped[categoryId].total += expense.amount;
    });

    return Object.values(grouped);
  }

  /**
   * Group expenses by date
   */
  groupByDate(expenses) {
    const grouped = {};

    expenses.forEach(expense => {
      const date = new Date(expense.date).toISOString().split('T')[0];
      if (!grouped[date]) {
        grouped[date] = {
          date,
          expenses: [],
          total: 0
        };
      }
      grouped[date].expenses.push(expense);
      grouped[date].total += expense.amount;
    });

    return Object.values(grouped).sort((a, b) => new Date(b.date) - new Date(a.date));
  }
}
