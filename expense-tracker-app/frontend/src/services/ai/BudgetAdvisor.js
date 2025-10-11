import { GeminiClient, AIServiceError, withRetry } from './GeminiClient.js';

/**
 * AI Budget Advisor service
 * Generates budget suggestions and spending reduction tips based on historical data
 */
class BudgetAdvisor {
  constructor(apiKey) {
    this.client = new GeminiClient(apiKey);
    this.minimumDataDays = 30; // Minimum days of data required
  }

  /**
   * Analyze spending patterns and generate budget suggestions
   */
  async suggestBudgets(expenses, categories) {
    try {
      // Validate data sufficiency
      this.validateDataSufficiency(expenses);
      
      // Analyze spending patterns
      const analysis = this.analyzeSpendingPatterns(expenses, categories);
      
      // Generate AI-powered budget suggestions
      const prompt = this.buildBudgetPrompt(analysis);
      const response = await withRetry(() => 
        this.client.generateText(prompt, { 
          temperature: 0.2,
          maxOutputTokens: 1024 
        })
      );
      
      return this.parseBudgetSuggestions(response, analysis);
    } catch (error) {
      if (error instanceof InsufficientDataError) {
        throw error;
      }
      console.error('Budget suggestion error:', error);
      throw new AIServiceError('Failed to generate budget suggestions', 'UNKNOWN', false);
    }
  }

  /**
   * Validate that we have sufficient data for budget suggestions
   */
  validateDataSufficiency(expenses) {
    if (!expenses || expenses.length === 0) {
      throw new InsufficientDataError('No expense data available');
    }

    // Check date range
    const sortedExpenses = expenses.sort((a, b) => new Date(a.date) - new Date(b.date));
    const oldestDate = new Date(sortedExpenses[0].date);
    const newestDate = new Date(sortedExpenses[sortedExpenses.length - 1].date);
    const daysDiff = (newestDate - oldestDate) / (1000 * 60 * 60 * 24);

    if (daysDiff < this.minimumDataDays) {
      throw new InsufficientDataError(
        `Minimum ${this.minimumDataDays} days of expense data required. You have ${Math.round(daysDiff)} days.`
      );
    }
  }

  /**
   * Analyze spending patterns for budget generation
   */
  analyzeSpendingPatterns(expenses, categories) {
    const analysis = {
      totalExpenses: expenses.length,
      dateRange: this.getDateRange(expenses),
      categoryAnalysis: {},
      monthlyTotals: this.getMonthlyTotals(expenses),
      weeklyAverages: this.getWeeklyAverages(expenses)
    };

    // Analyze each category
    categories.forEach(category => {
      const categoryExpenses = expenses.filter(e => e.category === category.name);
      
      if (categoryExpenses.length > 0) {
        const amounts = categoryExpenses.map(e => e.amount);
        const total = amounts.reduce((sum, amount) => sum + amount, 0);
        
        analysis.categoryAnalysis[category.name] = {
          expenseCount: categoryExpenses.length,
          totalAmount: total,
          averageAmount: total / categoryExpenses.length,
          monthlyAverage: this.getMonthlyAverage(categoryExpenses),
          weeklyAverage: this.getWeeklyAverage(categoryExpenses),
          standardDeviation: this.calculateStandardDeviation(amounts),
          trend: this.calculateTrend(categoryExpenses)
        };
      }
    });

    return analysis;
  }

  /**
   * Get date range of expenses
   */
  getDateRange(expenses) {
    const dates = expenses.map(e => new Date(e.date)).sort((a, b) => a - b);
    return {
      start: dates[0].toISOString().split('T')[0],
      end: dates[dates.length - 1].toISOString().split('T')[0],
      days: Math.ceil((dates[dates.length - 1] - dates[0]) / (1000 * 60 * 60 * 24))
    };
  }

  /**
   * Calculate monthly totals
   */
  getMonthlyTotals(expenses) {
    const monthlyTotals = {};
    
    expenses.forEach(expense => {
      const monthKey = expense.date.substring(0, 7); // YYYY-MM
      monthlyTotals[monthKey] = (monthlyTotals[monthKey] || 0) + expense.amount;
    });
    
    return monthlyTotals;
  }

  /**
   * Calculate weekly averages
   */
  getWeeklyAverages(expenses) {
    const weeklyTotals = {};
    
    expenses.forEach(expense => {
      const date = new Date(expense.date);
      const weekStart = new Date(date);
      weekStart.setDate(date.getDate() - date.getDay()); // Start of week
      const weekKey = weekStart.toISOString().split('T')[0];
      
      weeklyTotals[weekKey] = (weeklyTotals[weekKey] || 0) + expense.amount;
    });
    
    const totals = Object.values(weeklyTotals);
    return totals.length > 0 ? totals.reduce((sum, total) => sum + total, 0) / totals.length : 0;
  }

  /**
   * Calculate monthly average for a category
   */
  getMonthlyAverage(categoryExpenses) {
    const monthlyTotals = {};
    
    categoryExpenses.forEach(expense => {
      const monthKey = expense.date.substring(0, 7);
      monthlyTotals[monthKey] = (monthlyTotals[monthKey] || 0) + expense.amount;
    });
    
    const totals = Object.values(monthlyTotals);
    return totals.length > 0 ? totals.reduce((sum, total) => sum + total, 0) / totals.length : 0;
  }

  /**
   * Calculate weekly average for a category
   */
  getWeeklyAverage(categoryExpenses) {
    if (categoryExpenses.length === 0) return 0;
    
    const total = categoryExpenses.reduce((sum, expense) => sum + expense.amount, 0);
    const dateRange = this.getDateRange(categoryExpenses);
    const weeks = Math.max(1, dateRange.days / 7);
    
    return total / weeks;
  }

  /**
   * Calculate standard deviation
   */
  calculateStandardDeviation(amounts) {
    if (amounts.length === 0) return 0;
    
    const mean = amounts.reduce((sum, amount) => sum + amount, 0) / amounts.length;
    const squaredDiffs = amounts.map(amount => Math.pow(amount - mean, 2));
    const avgSquaredDiff = squaredDiffs.reduce((sum, diff) => sum + diff, 0) / amounts.length;
    
    return Math.sqrt(avgSquaredDiff);
  }

  /**
   * Calculate spending trend (increasing/decreasing/stable)
   */
  calculateTrend(categoryExpenses) {
    if (categoryExpenses.length < 4) return 'stable';
    
    // Compare first half vs second half
    const sorted = categoryExpenses.sort((a, b) => new Date(a.date) - new Date(b.date));
    const midpoint = Math.floor(sorted.length / 2);
    
    const firstHalf = sorted.slice(0, midpoint);
    const secondHalf = sorted.slice(midpoint);
    
    const firstHalfAvg = firstHalf.reduce((sum, e) => sum + e.amount, 0) / firstHalf.length;
    const secondHalfAvg = secondHalf.reduce((sum, e) => sum + e.amount, 0) / secondHalf.length;
    
    const changePercent = ((secondHalfAvg - firstHalfAvg) / firstHalfAvg) * 100;
    
    if (changePercent > 15) return 'increasing';
    if (changePercent < -15) return 'decreasing';
    return 'stable';
  }

  /**
   * Build prompt for budget suggestions
   */
  buildBudgetPrompt(analysis) {
    return `You are a financial advisor AI. Analyze this spending data and suggest realistic monthly budgets for each category.

SPENDING ANALYSIS:
${JSON.stringify(analysis, null, 2)}

Generate budget suggestions following these guidelines:
- Base budgets on historical averages with reasonable buffer (10-20%)
- Consider spending trends (increasing/decreasing/stable)
- Account for standard deviation (higher deviation = higher buffer)
- Provide practical, achievable budgets
- Include clear explanations for each suggestion

Return ONLY a valid JSON array with this structure:
[
  {
    "categoryName": "Food",
    "suggestedAmount": 400.00,
    "period": "monthly",
    "explanation": "Based on your 3-month average of $350/month, with 15% buffer for variability",
    "confidence": 0.85,
    "data": {
      "historicalAverage": 350.00,
      "standardDeviation": 45.20,
      "monthlyTotals": [320, 380, 350]
    }
  }
]

Only include categories that have expense data. Set confidence based on data quality and consistency.`;
  }

  /**
   * Parse budget suggestions from AI response
   */
  parseBudgetSuggestions(response, analysis) {
    try {
      // Extract JSON from response
      const jsonMatch = response.match(/\[[\s\S]*\]/);
      if (!jsonMatch) {
        throw new Error('No JSON array found in budget response');
      }

      const suggestions = JSON.parse(jsonMatch[0]);
      
      if (!Array.isArray(suggestions)) {
        throw new Error('Budget response is not an array');
      }

      // Validate and process each suggestion
      return suggestions
        .filter(suggestion => this.isValidBudgetSuggestion(suggestion))
        .map(suggestion => ({
          categoryId: this.getCategoryId(suggestion.categoryName),
          categoryName: suggestion.categoryName,
          suggestedAmount: Math.round(suggestion.suggestedAmount * 100) / 100,
          period: suggestion.period || 'monthly',
          explanation: suggestion.explanation || 'Budget suggestion based on spending history',
          confidence: Math.max(0, Math.min(1, suggestion.confidence || 0.5)),
          data: {
            historicalAverage: suggestion.data?.historicalAverage || 0,
            standardDeviation: suggestion.data?.standardDeviation || 0,
            monthlyTotals: suggestion.data?.monthlyTotals || []
          }
        }));
    } catch (error) {
      console.error('Budget suggestion parsing error:', error);
      throw new AIServiceError('Failed to parse budget suggestions', 'PARSE_ERROR', false);
    }
  }

  /**
   * Validate budget suggestion structure
   */
  isValidBudgetSuggestion(suggestion) {
    return suggestion &&
           typeof suggestion === 'object' &&
           suggestion.categoryName &&
           typeof suggestion.suggestedAmount === 'number' &&
           suggestion.suggestedAmount > 0;
  }

  /**
   * Get category ID from name (simplified - in real app would lookup from categories)
   */
  getCategoryId(categoryName) {
    return categoryName.toLowerCase().replace(/\s+/g, '-');
  }

  /**
   * Generate spending reduction tips for over-budget category
   */
  async generateTips(category, overspendAmount, recentExpenses) {
    try {
      const prompt = this.buildTipsPrompt(category, overspendAmount, recentExpenses);
      
      const response = await withRetry(() => 
        this.client.generateText(prompt, { 
          temperature: 0.3,
          maxOutputTokens: 512 
        })
      );
      
      return this.parseTips(response);
    } catch (error) {
      console.error('Tips generation error:', error);
      return [
        `You've overspent in ${category.name} by $${overspendAmount.toFixed(2)}`,
        'Consider tracking your expenses more closely',
        'Look for areas where you can reduce spending'
      ];
    }
  }

  /**
   * Build prompt for spending reduction tips
   */
  buildTipsPrompt(category, overspendAmount, recentExpenses) {
    const expensesSummary = recentExpenses.slice(0, 10).map(expense => ({
      amount: expense.amount,
      description: expense.description || 'No description',
      date: expense.date.split('T')[0]
    }));

    return `You are a financial advisor. A user has overspent in the ${category.name} category by $${overspendAmount.toFixed(2)}.

Recent expenses in this category:
${JSON.stringify(expensesSummary, null, 2)}

Provide 3-4 specific, actionable tips to reduce spending in this category. Make tips practical and relevant to the expense patterns shown.

Return tips as a simple JSON array of strings:
["tip 1", "tip 2", "tip 3"]`;
  }

  /**
   * Parse spending reduction tips
   */
  parseTips(response) {
    try {
      const jsonMatch = response.match(/\[[\s\S]*\]/);
      if (!jsonMatch) {
        // Fallback: split by lines if no JSON
        return response.split('\n')
          .filter(line => line.trim().length > 0)
          .slice(0, 4);
      }

      const tips = JSON.parse(jsonMatch[0]);
      return Array.isArray(tips) ? tips.slice(0, 4) : [response];
    } catch (error) {
      console.warn('Tips parsing error:', error);
      return [response];
    }
  }
}

/**
 * Custom error for insufficient data
 */
class InsufficientDataError extends AIServiceError {
  constructor(message = 'Insufficient expense data for budget analysis') {
    super(message, 'PARSE_ERROR', false);
    this.name = 'InsufficientDataError';
  }
}

export default BudgetAdvisor;
export { InsufficientDataError };
