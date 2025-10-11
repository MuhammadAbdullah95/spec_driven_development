import { GeminiClient, AIServiceError, withRetry } from './GeminiClient.js';

/**
 * Conversational AI service for spending insights
 * Handles natural language queries about expense data
 */
class ChatService {
  constructor(apiKey) {
    this.client = new GeminiClient(apiKey);
    this.chatHistory = [];
    this.maxHistoryLength = 10; // Keep last 10 messages for context
  }

  /**
   * Send user query and get AI response with expense context
   */
  async query(userQuery, expenseContext, chatHistory = []) {
    try {
      if (!userQuery || typeof userQuery !== 'string' || userQuery.trim().length === 0) {
        throw new AIServiceError('Query cannot be empty', 'PARSE_ERROR', false);
      }

      // Build comprehensive prompt with context
      const prompt = this.buildChatPrompt(userQuery, expenseContext, chatHistory);
      
      const response = await withRetry(() => 
        this.client.generateText(prompt, { 
          temperature: 0.2,
          maxOutputTokens: 1024 
        })
      );
      
      const chatResponse = this.parseChatResponse(response, expenseContext);
      
      // Update chat history
      this.updateChatHistory(userQuery, chatResponse);
      
      return chatResponse;
    } catch (error) {
      console.error('Chat service error:', error);
      return this.createErrorResponse(error.message);
    }
  }

  /**
   * Build comprehensive prompt for chat interaction
   */
  buildChatPrompt(userQuery, expenseContext, chatHistory) {
    const { expenses, categories, dateRange, totalSpending, categoryBreakdown } = expenseContext;
    
    // Format expense data for context
    const expensesSummary = expenses.slice(0, 50).map(expense => ({
      amount: expense.amount,
      category: expense.category,
      date: expense.date.split('T')[0], // Just the date part
      description: expense.description || 'No description'
    }));

    const contextData = {
      dateRange: dateRange,
      totalSpending: totalSpending,
      expenseCount: expenses.length,
      categoryBreakdown: categoryBreakdown,
      recentExpenses: expensesSummary
    };

    // Build chat history context
    const historyContext = chatHistory.slice(-5).map(msg => 
      `${msg.role}: ${msg.content}`
    ).join('\n');

    return `You are a helpful AI assistant that analyzes personal expense data and provides insights.

EXPENSE DATA CONTEXT:
${JSON.stringify(contextData, null, 2)}

AVAILABLE CATEGORIES: ${categories.map(c => c.name).join(', ')}

CHAT HISTORY:
${historyContext}

USER QUERY: "${userQuery}"

Instructions:
- Analyze the expense data to answer the user's question accurately
- Provide specific numbers, percentages, and insights
- Be conversational and helpful
- If asking about trends, compare with available data
- If data is insufficient, explain what's missing
- Format monetary amounts with $ symbol
- Keep responses concise but informative
- If the query is unclear, ask for clarification

Respond naturally as a financial assistant would:`;
  }

  /**
   * Parse chat response and extract relevant data references
   */
  parseChatResponse(response, expenseContext) {
    // Extract any expense IDs or date ranges mentioned in the response
    const relatedData = this.extractRelatedData(response, expenseContext);
    
    return {
      role: 'assistant',
      content: response.trim(),
      relatedData: relatedData,
      timestamp: new Date().toISOString(),
      error: null
    };
  }

  /**
   * Extract related data references from AI response
   */
  extractRelatedData(response, expenseContext) {
    const relatedData = {
      expenseIds: [],
      dateRange: expenseContext.dateRange || null,
      categoryId: null
    };

    // Try to identify if response mentions specific categories
    const categoryMentions = expenseContext.categories.filter(category =>
      response.toLowerCase().includes(category.name.toLowerCase())
    );
    
    if (categoryMentions.length === 1) {
      relatedData.categoryId = categoryMentions[0].id;
    }

    // For now, relate to all expenses in the context
    // In a more sophisticated implementation, we could parse the response
    // to identify which specific expenses were referenced
    relatedData.expenseIds = expenseContext.expenses.slice(0, 10).map(e => e.id);

    return relatedData;
  }

  /**
   * Update chat history with new messages
   */
  updateChatHistory(userQuery, assistantResponse) {
    // Add user message
    this.chatHistory.push({
      role: 'user',
      content: userQuery,
      timestamp: new Date().toISOString()
    });

    // Add assistant response
    this.chatHistory.push(assistantResponse);

    // Trim history to max length
    if (this.chatHistory.length > this.maxHistoryLength * 2) {
      this.chatHistory = this.chatHistory.slice(-this.maxHistoryLength * 2);
    }
  }

  /**
   * Get current chat history
   */
  getChatHistory() {
    return [...this.chatHistory];
  }

  /**
   * Clear chat history
   */
  clearHistory() {
    this.chatHistory = [];
  }

  /**
   * Create error response
   */
  createErrorResponse(errorMessage) {
    return {
      role: 'assistant',
      content: `I'm sorry, I encountered an error while analyzing your expenses: ${errorMessage}. Please try again or rephrase your question.`,
      relatedData: {
        expenseIds: [],
        dateRange: null,
        categoryId: null
      },
      timestamp: new Date().toISOString(),
      error: errorMessage
    };
  }

  /**
   * Generate suggested questions based on expense data
   */
  generateSuggestedQuestions(expenseContext) {
    const suggestions = [
      "How much did I spend this week?",
      "What's my biggest expense category?",
      "Show me my spending trend this month",
      "How much do I spend on food on average?",
      "What was my most expensive purchase recently?"
    ];

    // Add category-specific suggestions if user has expenses in those categories
    const userCategories = expenseContext.categoryBreakdown
      .filter(cat => cat.total > 0)
      .map(cat => cat.categoryName);

    if (userCategories.includes('Food')) {
      suggestions.push("How much do I spend on food per week?");
    }
    
    if (userCategories.includes('Transport')) {
      suggestions.push("What's my monthly transport spending?");
    }

    if (userCategories.includes('Entertainment')) {
      suggestions.push("How much do I spend on entertainment?");
    }

    return suggestions.slice(0, 6); // Return max 6 suggestions
  }

  /**
   * Analyze spending patterns for proactive insights
   */
  async generateInsights(expenseContext) {
    try {
      const prompt = this.buildInsightsPrompt(expenseContext);
      
      const response = await withRetry(() => 
        this.client.generateText(prompt, { 
          temperature: 0.3,
          maxOutputTokens: 512 
        })
      );
      
      return {
        insights: response.trim(),
        timestamp: new Date().toISOString(),
        error: null
      };
    } catch (error) {
      console.error('Insights generation error:', error);
      return {
        insights: "Unable to generate insights at this time.",
        timestamp: new Date().toISOString(),
        error: error.message
      };
    }
  }

  /**
   * Build prompt for generating spending insights
   */
  buildInsightsPrompt(expenseContext) {
    const { totalSpending, categoryBreakdown, expenses } = expenseContext;
    
    return `Analyze this expense data and provide 2-3 key insights about spending patterns:

Total Spending: $${totalSpending}
Category Breakdown: ${JSON.stringify(categoryBreakdown, null, 2)}
Number of Expenses: ${expenses.length}

Provide insights about:
- Spending patterns or trends
- Category distribution
- Notable observations
- Potential areas for optimization

Keep insights concise and actionable. Format as bullet points.`;
  }
}

export default ChatService;
