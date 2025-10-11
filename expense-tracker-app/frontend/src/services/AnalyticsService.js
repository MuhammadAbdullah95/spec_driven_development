import { getWeekStart, getWeekEnd, getMonthStart, getMonthEnd } from '../utils/dateHelpers.js';

/**
 * Business logic for analytics and summaries
 */
export class AnalyticsService {
  /**
   * Calculate total expenses for a list
   */
  calculateTotal(expenses) {
    return expenses.reduce((sum, expense) => sum + expense.amount, 0);
  }

  /**
   * Group expenses by category with totals
   */
  groupByCategory(expenses, categories) {
    const grouped = {};

    expenses.forEach(expense => {
      const categoryId = expense.categoryId || 'uncategorized';
      if (!grouped[categoryId]) {
        const category = categories.find(c => c.id === expense.categoryId);
        grouped[categoryId] = {
          categoryId,
          categoryName: category ? category.name : 'Uncategorized',
          total: 0,
          count: 0,
          expenses: []
        };
      }
      grouped[categoryId].total += expense.amount;
      grouped[categoryId].count++;
      grouped[categoryId].expenses.push(expense);
    });

    return Object.values(grouped).sort((a, b) => b.total - a.total);
  }

  /**
   * Get expenses for current week
   */
  getWeekExpenses(expenses) {
    const start = getWeekStart();
    const end = getWeekEnd();

    return expenses.filter(e => {
      const expenseDate = new Date(e.date);
      return expenseDate >= start && expenseDate <= end;
    });
  }

  /**
   * Get expenses for current month
   */
  getMonthExpenses(expenses) {
    const start = getMonthStart();
    const end = getMonthEnd();

    return expenses.filter(e => {
      const expenseDate = new Date(e.date);
      return expenseDate >= start && expenseDate <= end;
    });
  }

  /**
   * Get daily totals for the current month
   */
  getDailyTotals(expenses) {
    const monthExpenses = this.getMonthExpenses(expenses);
    const dailyMap = {};

    monthExpenses.forEach(expense => {
      const date = new Date(expense.date).toISOString().split('T')[0];
      if (!dailyMap[date]) {
        dailyMap[date] = 0;
      }
      dailyMap[date] += expense.amount;
    });

    return Object.entries(dailyMap)
      .map(([date, total]) => ({ date, total }))
      .sort((a, b) => new Date(a.date) - new Date(b.date));
  }

  /**
   * Get summary statistics
   */
  getSummary(expenses) {
    const total = this.calculateTotal(expenses);
    const weekExpenses = this.getWeekExpenses(expenses);
    const monthExpenses = this.getMonthExpenses(expenses);

    return {
      allTime: {
        total,
        count: expenses.length,
        average: expenses.length > 0 ? total / expenses.length : 0
      },
      thisWeek: {
        total: this.calculateTotal(weekExpenses),
        count: weekExpenses.length,
        average: weekExpenses.length > 0 ? this.calculateTotal(weekExpenses) / weekExpenses.length : 0
      },
      thisMonth: {
        total: this.calculateTotal(monthExpenses),
        count: monthExpenses.length,
        average: monthExpenses.length > 0 ? this.calculateTotal(monthExpenses) / monthExpenses.length : 0
      }
    };
  }

  /**
   * Get top categories by spending
   */
  getTopCategories(expenses, categories, limit = 5) {
    const grouped = this.groupByCategory(expenses, categories);
    return grouped.slice(0, limit);
  }
}
