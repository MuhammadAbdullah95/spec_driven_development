/**
 * AI Service for generating expense suggestions
 * This service can be configured to use different AI providers
 */

class AIService {
  constructor() {
    this.apiKey = import.meta.env.VITE_GEMINI_API_KEY;
    this.baseUrl = 'https://generativelanguage.googleapis.com/v1beta';
    this.model = import.meta.env.VITE_GEMINI_MODEL || 'gemini-2.0-flash-exp';
    this.debug = import.meta.env.VITE_AI_DEBUG === 'true';
  }

  /**
   * Generate expense description suggestions based on amount and category
   */
  async generateExpenseSuggestion(amount = '', category = '', context = {}) {
    // Fallback suggestions if no API key is available
    if (!this.apiKey) {
      return this.getFallbackSuggestion(amount, category);
    }

    try {
      const prompt = this.buildPrompt(amount, category, context);
      
      if (this.debug) {
        console.log('AI Service: Generating suggestion with prompt:', prompt);
      }
      
      const response = await fetch(`${this.baseUrl}/models/${this.model}:generateContent?key=${this.apiKey}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          contents: [{
            parts: [{
              text: `You are a helpful assistant that suggests realistic expense descriptions. Keep suggestions concise, specific, and realistic. Respond with just the description, no extra text or quotes.\n\n${prompt}`
            }]
          }],
          generationConfig: {
            maxOutputTokens: 50,
            temperature: 0.7,
            topP: 0.8,
            topK: 10
          }
        })
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Gemini API request failed: ${response.status} - ${errorText}`);
      }

      const data = await response.json();
      let suggestion = data.candidates?.[0]?.content?.parts?.[0]?.text?.trim();
      
      if (this.debug) {
        console.log('AI Service: Raw response:', data);
        console.log('AI Service: Extracted suggestion:', suggestion);
      }
      
      // Clean up the suggestion
      if (suggestion) {
        // Remove quotes if present
        suggestion = suggestion.replace(/^["']|["']$/g, '');
        
        // Remove any prefixes like "Description:", "Expense:", etc.
        suggestion = suggestion.replace(/^(Description|Expense|Suggestion):\s*/i, '');
        
        // Ensure it's not too long (reasonable expense description)
        if (suggestion.length > 100) {
          suggestion = suggestion.substring(0, 100).trim();
          // Try to end at a word boundary
          const lastSpace = suggestion.lastIndexOf(' ');
          if (lastSpace > 50) {
            suggestion = suggestion.substring(0, lastSpace);
          }
        }
        
        // Capitalize first letter
        suggestion = suggestion.charAt(0).toUpperCase() + suggestion.slice(1);
      }
      
      return suggestion || this.getFallbackSuggestion(amount, category);
    } catch (error) {
      console.warn('AI suggestion failed, using fallback:', error.message);
      return this.getFallbackSuggestion(amount, category);
    }
  }

  /**
   * Build a contextual prompt for the AI based on category and amount
   */
  buildPrompt(amount, category, context) {
    const numAmount = parseFloat(amount) || 0;
    const hour = new Date().getHours();
    const dayOfWeek = new Date().getDay(); // 0 = Sunday, 6 = Saturday
    const isWeekend = dayOfWeek === 0 || dayOfWeek === 6;
    
    // Category-specific prompting
    let categoryContext = '';
    switch (category?.toLowerCase()) {
      case 'food':
        if (hour >= 6 && hour < 11) {
          categoryContext = 'breakfast or morning coffee';
        } else if (hour >= 11 && hour < 15) {
          categoryContext = 'lunch or midday meal';
        } else if (hour >= 17 && hour < 22) {
          categoryContext = 'dinner or evening meal';
        } else {
          categoryContext = 'food or dining';
        }
        
        if (numAmount < 10) {
          categoryContext += ' (quick bite or snack)';
        } else if (numAmount > 50) {
          categoryContext += ' (restaurant dining or groceries)';
        }
        break;
        
      case 'transport':
        if (isWeekend) {
          categoryContext = 'weekend travel or leisure transport';
        } else {
          categoryContext = 'commute or work-related transport';
        }
        
        if (numAmount < 20) {
          categoryContext += ' (local transport like bus, metro, or parking)';
        } else if (numAmount > 50) {
          categoryContext += ' (long-distance travel, gas fill-up, or ride-sharing)';
        }
        break;
        
      case 'entertainment':
        if (isWeekend) {
          categoryContext = 'weekend entertainment or leisure activity';
        } else {
          categoryContext = 'entertainment or recreational activity';
        }
        
        if (numAmount < 20) {
          categoryContext += ' (streaming service, book, or small entertainment)';
        } else if (numAmount > 50) {
          categoryContext += ' (event tickets, gaming, or major entertainment)';
        }
        break;
        
      case 'bills':
        categoryContext = 'utility bill, subscription, or recurring payment';
        if (numAmount > 100) {
          categoryContext += ' (major bill like rent, insurance, or monthly service)';
        }
        break;
        
      case 'shopping':
        if (numAmount < 30) {
          categoryContext = 'small personal item or household essential';
        } else if (numAmount > 100) {
          categoryContext = 'major purchase like clothing, electronics, or home goods';
        } else {
          categoryContext = 'general shopping or personal items';
        }
        break;
        
      case 'health':
        if (numAmount < 30) {
          categoryContext = 'pharmacy item, vitamins, or health product';
        } else {
          categoryContext = 'medical appointment, treatment, or health service';
        }
        break;
        
      default:
        categoryContext = 'general expense';
    }

    let prompt = `Suggest a specific, realistic expense description for ${categoryContext}`;
    
    if (amount) {
      prompt += ` costing $${amount}`;
    }

    // Add time context
    const timeContext = hour >= 6 && hour < 12 ? 'morning' : 
                       hour >= 12 && hour < 17 ? 'afternoon' : 
                       hour >= 17 && hour < 22 ? 'evening' : 'late night';
    
    prompt += ` during ${timeContext}`;
    
    if (isWeekend) {
      prompt += ' on weekend';
    }

    // Add recent expenses context to avoid repetition
    if (context.recentExpenses && context.recentExpenses.length > 0) {
      const recentDescriptions = context.recentExpenses
        .slice(0, 3)
        .map(e => e.description)
        .join(', ');
      prompt += `. Avoid these recent expenses: ${recentDescriptions}. Suggest something different but realistic.`;
    }

    prompt += '. Respond with just the expense description, be specific and realistic. No quotes or extra text.';

    return prompt;
  }

  /**
   * Fallback suggestions when AI is not available
   */
  getFallbackSuggestion(amount = '', category = '') {
    const suggestions = {
      'Food': [
        'Lunch at local restaurant',
        'Grocery shopping',
        'Coffee and pastry',
        'Dinner with friends',
        'Weekly meal prep ingredients',
        'Breakfast at cafe',
        'Takeout order'
      ],
      'Transport': [
        'Gas fill-up',
        'Uber ride to downtown',
        'Monthly bus pass',
        'Parking fee',
        'Car maintenance',
        'Taxi to airport',
        'Public transport day pass'
      ],
      'Entertainment': [
        'Movie tickets',
        'Concert tickets',
        'Streaming subscription',
        'Video game purchase',
        'Book purchase',
        'Museum admission',
        'Sports event tickets'
      ],
      'Bills': [
        'Monthly electricity bill',
        'Internet service',
        'Phone bill',
        'Water utility',
        'Insurance payment',
        'Rent payment',
        'Gym membership'
      ],
      'Shopping': [
        'Clothing purchase',
        'Home supplies',
        'Electronics accessory',
        'Personal care items',
        'Gift for friend',
        'Office supplies',
        'Household essentials'
      ],
      'Health': [
        'Doctor visit copay',
        'Prescription medication',
        'Dental cleaning',
        'Vitamins and supplements',
        'Gym membership',
        'Massage therapy',
        'Medical supplies'
      ]
    };

    const categoryKey = Object.keys(suggestions).find(key => 
      key.toLowerCase() === category.toLowerCase()
    );

    const categorySuggestions = suggestions[categoryKey] || [
      'Daily expense',
      'Regular purchase',
      'Monthly payment',
      'Service fee',
      'Product purchase'
    ];

    // Add amount-based context to suggestions
    if (amount) {
      const numAmount = parseFloat(amount);
      if (numAmount < 10) {
        return categorySuggestions.find(s => s.includes('coffee') || s.includes('snack')) || 
               `Small ${category.toLowerCase()} purchase`;
      } else if (numAmount > 100) {
        return categorySuggestions.find(s => s.includes('monthly') || s.includes('bill')) || 
               `Major ${category.toLowerCase()} expense`;
      }
    }

    // Return random suggestion from category
    return categorySuggestions[Math.floor(Math.random() * categorySuggestions.length)];
  }

  /**
   * Generate multiple suggestions
   */
  async generateMultipleSuggestions(amount, category, context, count = 3) {
    const suggestions = [];
    
    for (let i = 0; i < count; i++) {
      try {
        const suggestion = await this.generateExpenseSuggestion(amount, category, context);
        if (suggestion && !suggestions.includes(suggestion)) {
          suggestions.push(suggestion);
        }
      } catch (error) {
        console.warn(`Failed to generate suggestion ${i + 1}:`, error);
      }
    }

    // Fill with fallbacks if needed
    while (suggestions.length < count) {
      const fallback = this.getFallbackSuggestion(amount, category);
      if (!suggestions.includes(fallback)) {
        suggestions.push(fallback);
      } else {
        break;
      }
    }

    return suggestions;
  }

  /**
   * Test the AI service connection
   */
  async testConnection() {
    try {
      const testSuggestion = await this.generateExpenseSuggestion('25', 'Food', {});
      console.log('AI Service Test - Success:', testSuggestion);
      return { success: true, suggestion: testSuggestion };
    } catch (error) {
      console.error('AI Service Test - Failed:', error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Get API status
   */
  getStatus() {
    return {
      hasApiKey: !!this.apiKey,
      model: this.model,
      baseUrl: this.baseUrl,
      debug: this.debug
    };
  }

  /**
   * Generate AI chat response for expense-related queries
   */
  async generateChatResponse(userMessage, expenseData = {}) {
    const { expenses = [], categories = [], settings = {} } = expenseData;
    
    // Fallback responses if no API key
    if (!this.apiKey) {
      return this.getFallbackChatResponse(userMessage, expenseData);
    }

    try {
      const contextPrompt = this.buildChatPrompt(userMessage, expenseData);
      
      if (this.debug) {
        console.log('AI Chat: Generating response for:', userMessage);
        console.log('AI Chat: Context prompt:', contextPrompt);
      }

      const response = await fetch(`${this.baseUrl}/models/${this.model}:generateContent?key=${this.apiKey}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          contents: [{
            parts: [{
              text: contextPrompt
            }]
          }],
          generationConfig: {
            maxOutputTokens: 500,
            temperature: 0.7,
            topP: 0.8,
            topK: 10
          }
        })
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Gemini API request failed: ${response.status} - ${errorText}`);
      }

      const data = await response.json();
      let aiResponse = data.candidates?.[0]?.content?.parts?.[0]?.text?.trim();

      if (this.debug) {
        console.log('AI Chat: Raw response:', data);
        console.log('AI Chat: Processed response:', aiResponse);
      }

      // Clean up the response
      if (aiResponse) {
        // Remove any unwanted prefixes
        aiResponse = aiResponse.replace(/^(Response|Answer|Reply):\s*/i, '');
        
        // Ensure proper formatting
        aiResponse = aiResponse.charAt(0).toUpperCase() + aiResponse.slice(1);
      }

      return aiResponse || this.getFallbackChatResponse(userMessage, expenseData);
    } catch (error) {
      console.warn('AI chat response failed, using fallback:', error.message);
      return this.getFallbackChatResponse(userMessage, expenseData);
    }
  }

  /**
   * Build contextual prompt for chat responses with complete financial details
   */
  buildChatPrompt(userMessage, expenseData) {
    const { expenses = [], categories = [], settings = {} } = expenseData;
    
    // Calculate comprehensive financial metrics
    const totalSpending = expenses.reduce((sum, e) => sum + e.amount, 0);
    const monthlyIncome = settings.monthlyIncome || 0;
    const monthlyBudget = settings.monthlyBudget || 0;
    const savingsGoal = settings.savingsGoal || 0;
    const currency = settings.currency || 'USD';
    
    // Category breakdown
    const categoryBreakdown = expenses.reduce((acc, e) => {
      acc[e.category] = (acc[e.category] || 0) + e.amount;
      return acc;
    }, {});
    
    // Recent spending patterns (last 30 days)
    const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
    const recentExpenses = expenses.filter(e => new Date(e.date) >= thirtyDaysAgo);
    const recentTotal = recentExpenses.reduce((sum, e) => sum + e.amount, 0);
    
    // Weekly spending (last 7 days)
    const weekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
    const weeklyExpenses = expenses.filter(e => new Date(e.date) >= weekAgo);
    const weeklyTotal = weeklyExpenses.reduce((sum, e) => sum + e.amount, 0);
    
    // Build detailed expense history
    const expenseHistory = expenses.slice(-10).map(e => 
      `${e.date}: ${e.category} - $${e.amount.toFixed(2)} (${e.description})`
    ).join('\n');
    
    let prompt = `You are a helpful AI financial assistant for an expense tracking app. Analyze the user's complete financial situation and provide personalized advice.

COMPLETE FINANCIAL PROFILE:
=========================

INCOME & BUDGET:
- Monthly Income: $${monthlyIncome.toFixed(2)} ${currency}
- Monthly Budget: $${monthlyBudget.toFixed(2)} ${currency}
- Savings Goal: $${savingsGoal.toFixed(2)} ${currency}
- Currency: ${currency}

SPENDING SUMMARY:
- Total Expenses: ${expenses.length} transactions
- All-Time Spending: $${totalSpending.toFixed(2)} ${currency}
- Last 30 Days: $${recentTotal.toFixed(2)} ${currency} (${recentExpenses.length} transactions)
- Last 7 Days: $${weeklyTotal.toFixed(2)} ${currency} (${weeklyExpenses.length} transactions)

BUDGET ANALYSIS:
- Budget Utilization: ${monthlyBudget > 0 ? ((recentTotal / monthlyBudget) * 100).toFixed(1) : 'N/A'}%
- Remaining Budget: $${Math.max(monthlyBudget - recentTotal, 0).toFixed(2)} ${currency}
- Savings Rate: ${monthlyIncome > 0 ? (((monthlyIncome - recentTotal) / monthlyIncome) * 100).toFixed(1) : 'N/A'}%

CATEGORY BREAKDOWN:
${Object.entries(categoryBreakdown).map(([cat, amount]) => 
  `- ${cat}: $${amount.toFixed(2)} ${currency} (${((amount/totalSpending)*100).toFixed(1)}%)`
).join('\n') || '- No expenses recorded yet'}

RECENT TRANSACTION HISTORY:
${expenseHistory || '- No recent transactions'}

AVAILABLE CATEGORIES:
${categories.map(c => `- ${c.name}`).join('\n') || '- Food, Transport, Entertainment, Bills, Shopping, Health'}

USER QUESTION: "${userMessage}"

INSTRUCTIONS:
- Provide specific, actionable advice based on their complete financial data
- Use markdown formatting extensively (headers ##, bold **text**, lists •)
- Include real numbers and percentages from their data
- Compare their spending to their budget and income
- Identify spending patterns and trends
- Suggest specific optimizations based on category breakdowns
- Be encouraging but honest about their financial situation
- Reference specific transactions or patterns when relevant
- Provide both short-term and long-term recommendations

RESPONSE:`;

    return prompt;
  }

  /**
   * Fallback chat responses when AI is not available
   */
  getFallbackChatResponse(userMessage, expenseData) {
    const { expenses = [], categories = [], settings = {} } = expenseData;
    const lowerMessage = userMessage.toLowerCase();
    
    // Spending analysis
    if (lowerMessage.includes('spending') || lowerMessage.includes('analysis') || lowerMessage.includes('patterns')) {
      if (expenses.length === 0) {
        return `## 📊 Spending Analysis

I'd love to analyze your spending patterns! However, you don't have any expenses recorded yet.

**To get started:**
• Add your first expense using the "Add Expense" button
• Try different categories like Food, Transport, Entertainment
• After a few entries, I can provide detailed insights

**What I can analyze once you have data:**
• Weekly and monthly spending trends
• Category breakdowns and optimization opportunities  
• Budget adherence and recommendations
• Spending pattern insights`;
      }

      const totalSpending = expenses.reduce((sum, e) => sum + e.amount, 0);
      const avgExpense = totalSpending / expenses.length;
      const categoryBreakdown = expenses.reduce((acc, e) => {
        acc[e.category] = (acc[e.category] || 0) + e.amount;
        return acc;
      }, {});
      
      const topCategory = Object.entries(categoryBreakdown)
        .sort(([,a], [,b]) => b - a)[0];

      return `## 📊 Your Spending Analysis

**Overall Summary:**
• **Total Expenses:** ${expenses.length} transactions
• **Total Spending:** $${totalSpending.toFixed(2)}
• **Average per transaction:** $${avgExpense.toFixed(2)}

**Top Spending Category:**
• **${topCategory[0]}:** $${topCategory[1].toFixed(2)} (${((topCategory[1]/totalSpending)*100).toFixed(1)}%)

**Quick Insights:**
• You've been tracking expenses consistently
• Consider setting category budgets for better control
• ${totalSpending > (settings.monthlyBudget || 1500) ? '⚠️ You may be over your monthly budget' : '✅ Your spending looks reasonable'}`;
    }

    // Budget advice
    if (lowerMessage.includes('budget') || lowerMessage.includes('advice')) {
      const monthlyBudget = settings.monthlyBudget || 1500;
      const totalSpending = expenses.reduce((sum, e) => sum + e.amount, 0);
      
      return `## 💰 Budget Advice

**Current Status:**
• **Monthly Budget:** $${monthlyBudget}
• **Current Spending:** $${totalSpending.toFixed(2)}
• **Remaining:** $${Math.max(monthlyBudget - totalSpending, 0).toFixed(2)}

**Recommendations:**
• **Track daily:** Log expenses as they happen
• **Set category limits:** Allocate budget by category
• **Weekly reviews:** Check progress every week
• **Emergency fund:** Save 10-20% of income

**Budget Tips:**
• Use the 50/30/20 rule: 50% needs, 30% wants, 20% savings
• Automate savings before spending
• Review and adjust monthly`;
    }

    // Category insights
    if (lowerMessage.includes('category') || lowerMessage.includes('reduce')) {
      if (expenses.length === 0) {
        return `## 🏷️ Category Insights

Start tracking expenses to get category-specific insights!

**Available Categories:**
• **Food** - Meals, groceries, dining out
• **Transport** - Gas, public transit, rideshares  
• **Entertainment** - Movies, games, subscriptions
• **Bills** - Utilities, rent, insurance
• **Shopping** - Clothing, electronics, personal items
• **Health** - Medical, pharmacy, fitness

**Tips for Each Category:**
• **Food:** Meal prep to save money
• **Transport:** Consider public transit or carpooling
• **Entertainment:** Look for free activities and events`;
      }

      const categoryTotals = expenses.reduce((acc, e) => {
        acc[e.category] = (acc[e.category] || 0) + e.amount;
        return acc;
      }, {});
      
      const sortedCategories = Object.entries(categoryTotals)
        .sort(([,a], [,b]) => b - a);

      return `## 🏷️ Category Breakdown

**Your Top Spending Categories:**

${sortedCategories.map(([cat, amount], index) => 
        `${index + 1}. **${cat}:** $${amount.toFixed(2)}`
      ).join('\n')}

**Optimization Suggestions:**
• Consider reducing spending in your top category
• Look for alternatives in high-spend areas
• Set specific budgets for each category
• Track trends over time`;
    }

    // Future planning
    if (lowerMessage.includes('future') || lowerMessage.includes('plan') || lowerMessage.includes('next month')) {
      const avgMonthlySpending = expenses.length > 0 
        ? expenses.reduce((sum, e) => sum + e.amount, 0) 
        : 0;

      return `## 🔮 Future Planning

**Next Month Recommendations:**

**Budget Planning:**
• Based on current patterns: ~$${avgMonthlySpending.toFixed(2)}/month
• Consider increasing budget by 10% for unexpected expenses
• Set aside money for irregular expenses

**Goals to Set:**
• **Savings target:** Aim for 20% of income
• **Emergency fund:** Build 3-6 months of expenses
• **Category limits:** Set specific budgets per category

**Action Items:**
• Review and adjust category budgets
• Plan for upcoming large expenses
• Set up automatic savings transfers`;
    }

    // General response
    return `## 💡 How I Can Help

I'm your AI financial assistant! Here's what I can do:

**📊 Analysis & Insights:**
• Analyze your spending patterns and trends
• Provide budget recommendations
• Identify areas for optimization

**💰 Financial Guidance:**
• Help with budget planning
• Suggest ways to save money
• Track progress toward financial goals

**🎯 Personalized Advice:**
• Category-specific recommendations
• Future planning assistance
• Real-time spending insights

**Try asking me:**
• "Analyze my spending patterns"
• "Give me budget advice"
• "Which category should I reduce?"
• "Help me plan next month"

What would you like to know about your finances?`;
  }
}

// Export singleton instance
export const aiService = new AIService();
export default aiService;
