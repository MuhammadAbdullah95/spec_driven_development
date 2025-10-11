/**
 * Expense model representing a single spending transaction
 */
export class Expense {
  constructor(data = {}) {
    this.id = data.id || crypto.randomUUID();
    this.amount = data.amount || 0;
    this.categoryId = data.categoryId || null;
    this.date = data.date || new Date().toISOString();
    this.description = data.description || '';
    this.createdAt = data.createdAt || new Date().toISOString();
    this.updatedAt = data.updatedAt || new Date().toISOString();
  }

  /**
   * Validate expense data
   * @param {Object} data - Expense data to validate
   * @returns {boolean} - True if valid
   * @throws {Error} - If validation fails
   */
  static validate(data) {
    if (!data.amount || data.amount <= 0) {
      throw new Error('Amount must be positive');
    }

    const roundedAmount = Math.round(data.amount * 100) / 100;
    if (data.amount !== roundedAmount) {
      throw new Error('Amount can have max 2 decimal places');
    }

    if (data.description && data.description.length > 500) {
      throw new Error('Description too long (max 500 characters)');
    }

    if (data.date && new Date(data.date) > new Date()) {
      throw new Error('Date cannot be in the future');
    }

    return true;
  }
}
