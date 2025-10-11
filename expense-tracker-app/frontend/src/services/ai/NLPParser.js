import { GeminiClient, AIServiceError, withRetry } from './GeminiClient.js';

/**
 * Natural Language Parser for expense entry
 * Converts user text like "spent $50 on pizza yesterday" into structured expense data
 */
class NLPParser {
  constructor(apiKey) {
    this.client = new GeminiClient(apiKey);
    this.examples = [
      'spent 50 on pizza yesterday',
      'paid 120 for electricity bill',
      '25 for uber ride',
      'bought groceries for 85 dollars',
      'coffee 4.50 this morning',
      'gas station 45 on Tuesday',
      'movie tickets 28 last night',
      'lunch at restaurant 22',
      'pharmacy 15.75 for medicine'
    ];
  }

  /**
   * Parse natural language input into structured expense data
   */
  async parse(input) {
    if (!input || typeof input !== 'string' || input.trim().length === 0) {
      return this.createErrorResult(input, 'Input cannot be empty');
    }

    const prompt = this.buildParsingPrompt(input);
    
    try {
      const response = await withRetry(() => 
        this.client.generateText(prompt, { temperature: 0.1 })
      );
      
      return this.parseResponse(input, response);
    } catch (error) {
      console.error('NLP parsing error:', error);
      return this.createErrorResult(input, error.message);
    }
  }

  /**
   * Build the prompt for Gemini to parse expense data
   */
  buildParsingPrompt(input) {
    return `You are an AI assistant that extracts expense information from natural language text. 

Parse the following expense description and return ONLY a valid JSON object with these exact fields:

{
  "amount": number or null,
  "category": string or null,
  "date": string or null (ISO 8601 format),
  "description": string or null,
  "confidence": {
    "amount": number between 0.0 and 1.0,
    "category": number between 0.0 and 1.0,
    "date": number between 0.0 and 1.0,
    "description": number between 0.0 and 1.0
  }
}

Categories must be one of: Food, Transport, Shopping, Bills, Entertainment, Health, Other

Rules:
- Extract positive numbers for amount (no currency symbols in the number)
- For dates: "yesterday" = previous day, "today" = current day, specific days like "Tuesday" = most recent Tuesday
- If date is ambiguous or missing, use current date but lower confidence
- Description should be clean (remove "spent", "paid", "for", etc.)
- Set confidence based on how certain you are about each field (1.0 = very certain, 0.0 = pure guess)

Input: "${input}"

Return only the JSON object, no other text:`;
  }

  /**
   * Parse Gemini's response into structured result
   */
  parseResponse(input, response) {
    try {
      // Clean the response to extract JSON
      const jsonMatch = response.match(/\{[\s\S]*\}/);
      if (!jsonMatch) {
        throw new Error('No JSON found in response');
      }

      const parsed = JSON.parse(jsonMatch[0]);
      
      // Validate the structure
      if (!this.isValidParsedData(parsed)) {
        throw new Error('Invalid response structure');
      }

      // Process and clean the data
      return {
        rawInput: input,
        inputType: 'text',
        extractedFields: {
          amount: this.processAmount(parsed.amount),
          category: this.processCategory(parsed.category),
          date: this.processDate(parsed.date),
          description: this.processDescription(parsed.description)
        },
        confidence: {
          amount: Math.max(0, Math.min(1, parsed.confidence?.amount || 0)),
          category: Math.max(0, Math.min(1, parsed.confidence?.category || 0)),
          date: Math.max(0, Math.min(1, parsed.confidence?.date || 0)),
          description: Math.max(0, Math.min(1, parsed.confidence?.description || 0))
        },
        parseTimestamp: new Date().toISOString(),
        error: null
      };
    } catch (error) {
      console.error('Response parsing error:', error);
      return this.createErrorResult(input, 'Failed to parse AI response');
    }
  }

  /**
   * Validate parsed data structure
   */
  isValidParsedData(data) {
    return data && 
           typeof data === 'object' &&
           data.hasOwnProperty('amount') &&
           data.hasOwnProperty('category') &&
           data.hasOwnProperty('date') &&
           data.hasOwnProperty('description') &&
           data.confidence &&
           typeof data.confidence === 'object';
  }

  /**
   * Process and validate amount
   */
  processAmount(amount) {
    if (amount === null || amount === undefined) return null;
    
    const num = parseFloat(amount);
    if (isNaN(num) || num <= 0) return null;
    
    // Round to 2 decimal places
    return Math.round(num * 100) / 100;
  }

  /**
   * Process and validate category
   */
  processCategory(category) {
    if (!category || typeof category !== 'string') return null;
    
    const validCategories = ['Food', 'Transport', 'Shopping', 'Bills', 'Entertainment', 'Health', 'Other'];
    const normalized = category.trim();
    
    // Find exact match (case insensitive)
    const match = validCategories.find(cat => 
      cat.toLowerCase() === normalized.toLowerCase()
    );
    
    return match || null;
  }

  /**
   * Process and validate date
   */
  processDate(date) {
    if (!date) return new Date().toISOString();
    
    try {
      // Handle relative dates
      if (typeof date === 'string') {
        const now = new Date();
        const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
        
        if (date.toLowerCase().includes('yesterday')) {
          const yesterday = new Date(today);
          yesterday.setDate(yesterday.getDate() - 1);
          return yesterday.toISOString();
        }
        
        if (date.toLowerCase().includes('today')) {
          return today.toISOString();
        }
      }
      
      // Try to parse as ISO date
      const parsed = new Date(date);
      if (!isNaN(parsed.getTime())) {
        // Don't allow future dates
        if (parsed > new Date()) {
          return new Date().toISOString();
        }
        return parsed.toISOString();
      }
    } catch (error) {
      console.warn('Date parsing error:', error);
    }
    
    // Default to today
    return new Date().toISOString();
  }

  /**
   * Process and clean description
   */
  processDescription(description) {
    if (!description || typeof description !== 'string') return null;
    
    // Clean common expense words
    const cleaned = description
      .replace(/\b(spent|paid|for|on|bought|purchase|cost)\b/gi, '')
      .replace(/\$\d+(\.\d{2})?/g, '') // Remove dollar amounts
      .replace(/\s+/g, ' ')
      .trim();
    
    return cleaned.length > 0 ? cleaned : null;
  }

  /**
   * Create error result structure
   */
  createErrorResult(input, errorMessage) {
    return {
      rawInput: input || '',
      inputType: 'text',
      extractedFields: {
        amount: null,
        category: null,
        date: null,
        description: null
      },
      confidence: {
        amount: 0,
        category: 0,
        date: 0,
        description: 0
      },
      parseTimestamp: new Date().toISOString(),
      error: errorMessage
    };
  }

  /**
   * Get example phrases for user guidance
   */
  getExamples() {
    return [...this.examples];
  }

  /**
   * Get a random example for placeholder text
   */
  getRandomExample() {
    return this.examples[Math.floor(Math.random() * this.examples.length)];
  }
}

export default NLPParser;
