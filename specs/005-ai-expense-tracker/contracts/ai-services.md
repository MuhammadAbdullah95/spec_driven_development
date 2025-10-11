# AI Services Contract

**Feature**: 005-ai-expense-tracker | **Phase**: 1 - Design
**Purpose**: Define interfaces for AI-powered features using Gemini API

## Overview

This contract defines the interface between UI components and AI services (NLP parsing, receipt OCR, conversational insights, budget suggestions). All AI services use Google Gemini API.

---

## INLPParser Interface

**Purpose**: Parse natural language text into structured expense data

```typescript
interface INLPParser {
  /**
   * Parse natural language input into expense fields
   * @param input - User's natural language text (e.g., "spent 50 on pizza yesterday")
   * @returns Parsed expense data with confidence scores
   * @throws AIServiceError if API fails
   */
  parse(input: string): Promise<AIParseResult>;

  /**
   * Get example phrases for user guidance
   * @returns Array of example natural language inputs
   */
  getExamples(): string[];
}

// Return type
interface AIParseResult {
  rawInput: string;
  inputType: 'text';
  extractedFields: {
    amount: number | null;
    category: string | null;  // Category name, not ID
    date: string | null;       // ISO 8601
    description: string | null;
  };
  confidence: {
    amount: number;   // 0.0-1.0
    category: number;
    date: number;
    description: number;
  };
  parseTimestamp: string;
  error: string | null;
}
```

**Example Usage**:
```typescript
const parser = new GeminiNLPParser(apiKey);
const result = await parser.parse("spent 50 on pizza yesterday");

if (result.error) {
  // Show error, fallback to manual form
} else if (result.confidence.amount < 0.7) {
  // Show all fields for review (low confidence)
} else {
  // Show preview with auto-filled fields
}
```

---

## IReceiptOCR Interface

**Purpose**: Extract structured data from receipt images using OCR

```typescript
interface IReceiptOCR {
  /**
   * Extract expense data from receipt image
   * @param imageFile - File object or base64 data URL
   * @returns Parsed receipt data with confidence scores
   * @throws AIServiceError if API fails
   * @throws ImageTooLargeError if file > 10MB
   * @throws UnsupportedLanguageError if receipt not in English
   */
  extractFromImage(imageFile: File | string): Promise<ReceiptOCRResult>;

  /**
   * Preprocess image for better OCR accuracy
   * @param imageFile - Original image file
   * @returns Compressed/optimized image as base64 data URL
   */
  preprocessImage(imageFile: File): Promise<string>;
}

// Return type
interface ReceiptOCRResult {
  rawInput: string;          // Base64 image data URL
  inputType: 'image';
  extractedFields: {
    merchant: string | null;
    amount: number | null;
    date: string | null;     // ISO 8601
    categoryHint: string | null; // Suggested category name
  };
  confidence: {
    merchant: number;        // 0.0-1.0
    amount: number;
    date: number;
    category: number;
  };
  language: 'English' | 'Other';
  parseTimestamp: string;
  error: string | null;
}
```

**Example Usage**:
```typescript
const ocr = new GeminiReceiptOCR(apiKey);

// Preprocess image
const compressed = await ocr.preprocessImage(file);

// Extract data
const result = await ocr.extractFromImage(compressed);

if (result.language === 'Other') {
  throw new Error('Only English receipts supported');
}

// Show extracted fields in form for review
```

---

## IChatService Interface

**Purpose**: Conversational AI for spending insights queries

```typescript
interface IChatService {
  /**
   * Send user query and get AI response with expense context
   * @param query - User's natural language question
   * @param expenseData - Relevant expense data for context
   * @param chatHistory - Previous messages for context
   * @returns AI response with formatted insights
   * @throws AIServiceError if API fails
   */
  query(
    query: string,
    expenseData: ExpenseContext,
    chatHistory: ChatMessage[]
  ): Promise<ChatResponse>;

  /**
   * Clear chat history to manage token limits
   */
  clearHistory(): void;
}

// Input context
interface ExpenseContext {
  expenses: Expense[];       // Filtered by date range from query
  categories: Category[];
  dateRange: { start: string; end: string };
  totalSpending: number;
  categoryBreakdown: { categoryName: string; total: number; count: number }[];
}

// Output response
interface ChatResponse {
  role: 'assistant';
  content: string;           // Formatted response with insights
  relatedData: {
    expenseIds: string[];    // Referenced expenses
    dateRange: { start: string; end: string } | null;
    categoryId: string | null;
  };
  timestamp: string;
  error: string | null;
}
```

**Example Usage**:
```typescript
const chatService = new GeminiChatService(apiKey);

// Build context from user's expenses
const context = {
  expenses: getExpensesForDateRange('this week'),
  categories: getAllCategories(),
  dateRange: { start: '2025-10-07', end: '2025-10-13' },
  totalSpending: 350.00,
  categoryBreakdown: [
    { categoryName: 'Food', total: 150.00, count: 5 },
    { categoryName: 'Transport', total: 200.00, count: 3 }
  ]
};

const response = await chatService.query(
  "how much did I spend on food this week?",
  context,
  previousMessages
);

// Display: "You spent $150.00 on food this week across 5 expenses. That's 42.9% of your total spending."
```

---

## IBudgetAdvisor Interface

**Purpose**: Generate AI-powered budget suggestions based on spending patterns

```typescript
interface IBudgetAdvisor {
  /**
   * Analyze spending patterns and generate budget suggestions
   * @param expenses - Historical expenses (min 30 days)
   * @param categories - Available categories
   * @returns Array of budget suggestions with explanations
   * @throws InsufficientDataError if < 30 days of data
   * @throws AIServiceError if API fails
   */
  suggestBudgets(
    expenses: Expense[],
    categories: Category[]
  ): Promise<BudgetSuggestion[]>;

  /**
   * Generate spending reduction tips for over-budget category
   * @param category - Category that exceeded budget
   * @param overspendAmount - Amount over budget
   * @param recentExpenses - Last 10 expenses in category
   * @returns Actionable tips
   */
  generateTips(
    category: Category,
    overspendAmount: number,
    recentExpenses: Expense[]
  ): Promise<string[]>;
}

// Output type
interface BudgetSuggestion {
  categoryId: string;
  categoryName: string;
  suggestedAmount: number;
  period: 'weekly' | 'monthly';
  explanation: string;        // AI rationale (e.g., "Based on 3 months average...")
  confidence: number;         // 0.0-1.0
  data: {
    historicalAverage: number;
    standardDeviation: number;
    monthlyTotals: number[];   // Last 3 months
  };
}
```

**Example Usage**:
```typescript
const advisor = new GeminiBudgetAdvisor(apiKey);

// Must have 30+ days of expenses
if (expenses.length < 30) {
  throw new InsufficientDataError();
}

const suggestions = await advisor.suggestBudgets(expenses, categories);

// Show suggestions to user
suggestions.forEach(suggestion => {
  console.log(`${suggestion.categoryName}: $${suggestion.suggestedAmount}/month`);
  console.log(`Reason: ${suggestion.explanation}`);
});

// User accepts/modifies/dismisses each suggestion
```

---

## Error Types

```typescript
class AIServiceError extends Error {
  constructor(
    message: string,
    public code: 'API_KEY_INVALID' | 'RATE_LIMIT' | 'NETWORK_ERROR' | 'PARSE_ERROR' | 'UNKNOWN',
    public retryable: boolean = false
  ) {
    super(message);
    this.name = 'AIServiceError';
  }
}

class ImageTooLargeError extends AIServiceError {
  constructor(size: number) {
    super(`Image size ${size} bytes exceeds 10MB limit`, 'PARSE_ERROR', false);
    this.name = 'ImageTooLargeError';
  }
}

class UnsupportedLanguageError extends AIServiceError {
  constructor() {
    super('Only English-language receipts supported', 'PARSE_ERROR', false);
    this.name = 'UnsupportedLanguageError';
  }
}

class InsufficientDataError extends AIServiceError {
  constructor() {
    super('Minimum 30 days of expense data required for budget suggestions', 'PARSE_ERROR', false);
    this.name = 'InsufficientDataError';
  }
}
```

---

## Rate Limiting Strategy

### Gemini API Limits (Free Tier)
- 60 requests per minute
- 1500 requests per day

### Implementation

```typescript
class RateLimiter {
  private requestCount = 0;
  private resetTime = Date.now() + 60000; // 1 minute window

  async checkLimit(): Promise<void> {
    const now = Date.now();

    // Reset counter if window expired
    if (now >= this.resetTime) {
      this.requestCount = 0;
      this.resetTime = now + 60000;
    }

    // Check if limit exceeded
    if (this.requestCount >= 60) {
      const waitTime = this.resetTime - now;
      throw new AIServiceError(
        `Rate limit exceeded. Retry in ${Math.ceil(waitTime / 1000)}s`,
        'RATE_LIMIT',
        true // retryable
      );
    }

    this.requestCount++;
  }
}
```

---

## Retry Logic

```typescript
async function withRetry<T>(
  fn: () => Promise<T>,
  maxRetries = 3,
  backoffMs = 1000
): Promise<T> {
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      return await fn();
    } catch (error) {
      if (error instanceof AIServiceError && error.retryable && attempt < maxRetries) {
        // Exponential backoff
        await new Promise(resolve => setTimeout(resolve, backoffMs * Math.pow(2, attempt - 1)));
        continue;
      }
      throw error;
    }
  }
  throw new Error('Max retries exceeded');
}

// Usage
const result = await withRetry(() => parser.parse(userInput));
```

---

## Testing AI Services

### Mock Implementations

```typescript
class MockNLPParser implements INLPParser {
  async parse(input: string): Promise<AIParseResult> {
    // Simulate parsing with regex/rules
    const amountMatch = input.match(/(\d+(?:\.\d{2})?)/);
    const categoryHints = {
      'pizza|food|restaurant|dinner': 'Food',
      'uber|taxi|bus|transport': 'Transport',
      'movie|cinema|entertainment': 'Entertainment'
    };

    return {
      rawInput: input,
      inputType: 'text',
      extractedFields: {
        amount: amountMatch ? parseFloat(amountMatch[1]) : null,
        category: Object.entries(categoryHints).find(([pattern]) =>
          new RegExp(pattern, 'i').test(input)
        )?.[1] || null,
        date: input.includes('yesterday') ? subDays(new Date(), 1).toISOString() : new Date().toISOString(),
        description: input.replace(/spent|paid|on|yesterday|today/gi, '').trim()
      },
      confidence: { amount: 0.9, category: 0.7, date: 0.8, description: 0.6 },
      parseTimestamp: new Date().toISOString(),
      error: null
    };
  }

  getExamples(): string[] {
    return [
      'spent 50 on pizza yesterday',
      'paid 120 for electricity bill',
      '25 for uber ride'
    ];
  }
}
```

### Integration Tests (Real API)

```typescript
describe('Gemini NLP Parser Integration', () => {
  let parser: INLPParser;

  beforeAll(() => {
    parser = new GeminiNLPParser(process.env.GEMINI_API_KEY);
  });

  it('should extract amount with high confidence', async () => {
    const result = await parser.parse('spent 50 on pizza');
    expect(result.extractedFields.amount).toBe(50.00);
    expect(result.confidence.amount).toBeGreaterThanOrEqual(0.95);
  });

  it('should categorize food expenses correctly', async () => {
    const result = await parser.parse('paid 25 for lunch at restaurant');
    expect(result.extractedFields.category).toBe('Food');
    expect(result.confidence.category).toBeGreaterThanOrEqual(0.8);
  });

  it('should handle ambiguous dates', async () => {
    const result = await parser.parse('spent 100 last week');
    expect(result.confidence.date).toBeLessThan(0.9); // Ambiguous
    expect(result.extractedFields.date).toBeDefined(); // But still extracted
  });
});
```

---

**Contract Status**: ✅ Complete
**Implementations**: Gemini-based (Phase 1), Mock for testing
