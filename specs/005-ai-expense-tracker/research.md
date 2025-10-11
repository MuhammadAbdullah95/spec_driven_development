# Research & Technology Decisions: AI-Enhanced Personal Expense Tracker

**Feature**: 005-ai-expense-tracker | **Date**: 2025-10-10
**Phase**: 0 - Research | **Status**: Complete

## Overview

This document captures technology research, decisions, and rationale for implementing the AI-Enhanced Personal Expense Tracker. All "NEEDS CLARIFICATION" items from plan.md have been resolved through research and best practice evaluation.

---

## 1. Gemini API SDK Setup & Authentication

###Decision: Use `@google/generative-ai` npm package with client-side API key storage

**Rationale**:
- Official Google SDK provides TypeScript support and handles request/response formatting
- Client-side integration simplifies architecture (no backend proxy needed for Phase 1)
- API key stored in `.env` for development, browser localStorage for production (encrypted)
- Free tier: 60 requests/minute sufficient for single-user app

**Implementation Pattern**:
```javascript
import { GoogleGenerativeAI } from '@google/generative-ai';

const genAI = new GoogleGenerativeAI(process.env.VITE_GEMINI_API_KEY);
const model = genAI.getGenerativeModel({ model: 'gemini-1.5-pro' });
const visionModel = genAI.getGenerativeModel({ model: 'gemini-1.5-pro-vision' });
```

**Alternatives Considered**:
- Direct REST API calls: More control, but requires manual error handling, streaming logic
- Backend proxy: Better security for API key, but adds complexity for Phase 1 single-user app

**Security Considerations**:
- API key never committed to repository (use `.env.example` template)
- Production: Prompt user to enter API key on first launch, store encrypted in localStorage
- Rate limiting handled by SDK, fallback to manual entry on quota exceeded

---

## 2. Natural Language Parsing Prompt Engineering

### Decision: Structured few-shot prompting with JSON response format

**Rationale**:
- Few-shot examples train model on desired output format
- JSON structured output ensures predictable parsing (amount, category, date, description)
- Confidence scores per field guide user review workflow
- System message defines role and constraints (English expenses, positive amounts, 7 categories)

**Prompt Template**:
```javascript
const EXPENSE_PARSE_PROMPT = `You are an expense tracking assistant. Extract structured expense data from natural language input.

Categories: Food, Transport, Shopping, Bills, Entertainment, Health, Other

Output JSON format:
{
  "amount": number (positive decimal, max 2 decimals),
  "category": string (one of 7 categories or "Other"),
  "date": string (ISO 8601 date),
  "description": string (max 500 chars),
  "confidence": {
    "amount": 0.0-1.0,
    "category": 0.0-1.0,
    "date": 0.0-1.0
  }
}

Examples:
Input: "spent 50 on pizza yesterday"
Output: {"amount": 50.00, "category": "Food", "date": "2025-10-09", "description": "pizza", "confidence": {"amount": 1.0, "category": 0.95, "date": 0.9}}

Input: "paid 120 for electricity bill on Oct 5"
Output: {"amount": 120.00, "category": "Bills", "date": "2025-10-05", "description": "electricity bill", "confidence": {"amount": 1.0, "category": 1.0, "date": 1.0}}

Now parse: "${userInput}"`;
```

**Confidence Thresholds**:
- `>= 0.9`: Auto-accept field (green indicator)
- `0.7 - 0.89`: Show field for review (yellow indicator)
- `< 0.7`: Require user confirmation (red indicator)

**Alternatives Considered**:
- Zero-shot prompting: Less accurate, no format control
- Fine-tuned model: Overkill for 7 categories, requires training data
- Rule-based regex parsing: Brittle, doesn't handle linguistic variations

---

## 3. Receipt OCR Best Practices

### Decision: Image preprocessing + Vision API with structured prompting

**Rationale**:
- gemini-1.5-pro-vision handles OCR natively (no separate OCR service needed)
- Image preprocessing improves accuracy: resize, contrast adjustment, orientation correction
- Structured prompt guides extraction: merchant, amount, date, category suggestion
- English-only validation via language detection in prompt

**Implementation Flow**:
1. User uploads image (JPG/PNG, max 10MB)
2. Client-side preprocessing: resize to 1024px max dimension, JPEG compression
3. Base64 encode image for API request
4. Send to Gemini Vision with extraction prompt
5. Parse JSON response with confidence scores
6. Display extracted fields in editable form

**Vision Prompt Template**:
```javascript
const RECEIPT_OCR_PROMPT = `Extract structured data from this receipt image. Return JSON only.

Required fields:
- merchant: store/restaurant name
- amount: total amount paid (number with 2 decimals)
- date: transaction date (ISO 8601 format)
- categoryHint: suggested category (Food, Transport, Shopping, Bills, Entertainment, Health, Other)
- language: detected receipt language (must be "English" or "Other")

Confidence scoring (0.0-1.0) for each field.

If receipt is not in English, set language="Other" and confidence=0.0 for all fields.

Return: {"merchant": string, "amount": number, "date": string, "categoryHint": string, "language": string, "confidence": {...}}`;
```

**Image Preprocessing Library**: `browser-image-compression` (client-side, 0 dependencies)

**Alternatives Considered**:
- Tesseract.js OCR: Lower accuracy for receipts, no layout understanding
- Cloud Vision API (Google): Requires separate billing, overkill for text extraction
- AWS Textract: More accurate but expensive, requires AWS account

---

## 4. Conversational AI Context Management

### Decision: Session-based chat history with expense data context injection

**Rationale**:
- Maintain conversation within session (not persistent across page reloads)
- Inject relevant expense data into prompt based on query intent
- Use previous messages for context-aware follow-ups
- Clear chat history on page navigation to manage token limits

**Context Injection Strategy**:
```javascript
const buildChatContext = (userQuery, expenses, previousMessages) => {
  // Extract date range from query ("this week", "last month")
  const dateRange = parseDateRange(userQuery);
  const relevantExpenses = filterExpenses(expenses, dateRange);

  // Build context with aggregated data (not full expense list)
  const context = {
    totalSpending: calculateTotal(relevantExpenses),
    categoryBreakdown: groupByCategory(relevantExpenses),
    dateRange: dateRange,
    expenseCount: relevantExpenses.length
  };

  // System message with context
  return `You are a personal finance assistant. Answer questions about spending patterns.

  Context (user's expense data for ${dateRange}):
  - Total spending: $${context.totalSpending}
  - Category breakdown: ${JSON.stringify(context.categoryBreakdown)}
  - Number of expenses: ${context.expenseCount}

  Previous conversation:
  ${previousMessages.map(m => `${m.role}: ${m.content}`).join('\n')}

  User question: ${userQuery}
  `;
};
```

**Token Management**:
- Limit chat history to last 10 messages (~2000 tokens)
- Summarize expense data (not full raw records)
- Clear history button for long conversations

**Alternatives Considered**:
- Persistent chat history (localStorage): Complicates stale data issues
- Full expense dump in prompt: Exceeds token limits for large datasets
- Vector embeddings for semantic search: Overkill for structured numeric data

---

## 5. Tailwind CSS + Recharts Integration

### Decision: Tailwind utility classes for layout, Recharts theming via CSS variables

**Rationale**:
- Tailwind provides responsive utilities, dark mode classes (`dark:` prefix)
- Recharts respects CSS custom properties for colors, fonts
- Chart components wrapped in Tailwind containers for responsive sizing
- Dark mode transitions handled by Tailwind's class toggle

**Dark Mode Implementation**:
```javascript
// tailwind.config.js
module.exports = {
  darkMode: 'class', // Toggle via .dark class on <html>
  theme: {
    extend: {
      colors: {
        primary: {...},
        // Chart colors as CSS variables
        chart: {
          1: 'var(--chart-color-1)',
          2: 'var(--chart-color-2)',
          ...
        }
      }
    }
  }
}

// CSS variables for light/dark themes
:root {
  --chart-color-1: #3b82f6; /* blue-500 */
  --chart-color-2: #10b981; /* green-500 */
}

.dark {
  --chart-color-1: #60a5fa; /* blue-400 */
  --chart-color-2: #34d399; /* green-400 */
}
```

**Recharts Responsive Pattern**:
```jsx
<ResponsiveContainer width="100%" height={300}>
  <BarChart data={data}>
    <Bar dataKey="amount" fill="var(--chart-color-1)" />
  </BarChart>
</ResponsiveContainer>
```

**Alternatives Considered**:
- CSS Modules: Less flexible for utility-first approach
- Styled Components: Runtime CSS-in-JS overhead
- Chart.js (as in 004 spec): React-chartjs-2 wrapper less idiomatic than Recharts for React

---

## 6. localStorage Schema Design for 10K+ Expenses

### Decision: Normalized JSON with indexed access patterns

**Rationale**:
- Single `expenses` array with indexed access by id, date, category
- Separate `categories` array (7 predefined + custom)
- `budgets` array for AI suggestions
- `settings` object for API key, theme, last sync
- Total storage: ~10K expenses × 200 bytes = 2MB (well under 5-10MB localStorage limit)

**Schema**:
```javascript
// localStorage keys
const STORAGE_KEYS = {
  EXPENSES: 'expense-tracker:expenses',
  CATEGORIES: 'expense-tracker:categories',
  BUDGETS: 'expense-tracker:budgets',
  SETTINGS: 'expense-tracker:settings',
  RECEIPTS: 'expense-tracker:receipts', // Base64 images
};

// Expense record
{
  "id": "uuid-v4",
  "amount": 50.00,
  "categoryId": "cat-001" | null,
  "date": "2025-10-10T14:30:00Z",
  "description": "Pizza dinner",
  "receiptId": "receipt-uuid" | null,
  "aiParsed": true | false,
  "createdAt": "2025-10-10T14:30:00Z",
  "updatedAt": "2025-10-10T14:30:00Z"
}

// Category record
{
  "id": "cat-001",
  "name": "Food",
  "icon": "🍔",
  "type": "predefined" | "custom",
  "createdAt": "2025-10-10T00:00:00Z"
}

// Budget record
{
  "id": "budget-uuid",
  "categoryId": "cat-001",
  "amount": 500.00,
  "period": "monthly",
  "source": "ai" | "user",
  "aiExplanation": "Based on 3 months average...",
  "createdAt": "2025-10-10T14:30:00Z"
}

// Receipt record (stored separately due to size)
{
  "id": "receipt-uuid",
  "expenseId": "expense-uuid",
  "imageBase64": "data:image/jpeg;base64,...",
  "ocrData": {...},
  "uploadedAt": "2025-10-10T14:30:00Z"
}
```

**Performance Optimizations**:
- Lazy load receipts (only load when viewing expense details)
- Index expenses by month for faster date range queries
- Cache category lookup map in memory
- Debounce save operations (500ms) to batch writes

**Migration to IndexedDB (Future Phase 2)**:
- Exceeds 5MB with receipt images → IndexedDB supports 50MB+
- Async API prevents UI blocking on large reads/writes
- Schema remains identical (drop-in replacement)

**Alternatives Considered**:
- IndexedDB Phase 1: Overkill for <5MB data, more complex API
- Separate localStorage keys per expense: Slower queries, key limit issues
- Compressed JSON: Minimal size savings, adds decode overhead

---

## 7. Dark Mode Implementation with Tailwind

### Decision: Class-based dark mode with localStorage persistence

**Rationale**:
- Tailwind's `dark:` modifier provides automatic variant generation
- Add/remove `.dark` class on `<html>` element for instant theme switch
- Persist preference in localStorage as `theme: 'light' | 'dark' | 'system'`
- Respect system preference on first load via `prefers-color-scheme` media query

**Implementation**:
```javascript
// hooks/useTheme.js
export const useTheme = () => {
  const [theme, setTheme] = useState(() => {
    const stored = localStorage.getItem('theme');
    if (stored) return stored;
    return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
  });

  useEffect(() => {
    const root = document.documentElement;
    if (theme === 'dark') {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }
    localStorage.setItem('theme', theme);
  }, [theme]);

  return [theme, setTheme];
};
```

**Transition Animation**:
```css
/* Smooth color transitions except on page load */
@media (prefers-reduced-motion: no-preference) {
  * {
    transition: background-color 200ms ease-in-out,
                color 200ms ease-in-out,
                border-color 200ms ease-in-out;
  }
}
```

**Alternatives Considered**:
- CSS-only (no JS): Can't persist preference, no user control
- Data attributes (`data-theme`): Less idiomatic with Tailwind ecosystem
- Separate stylesheets: Causes FOUC (flash of unstyled content)

---

## 8. CSV Export/Import Format Specification

### Decision: RFC 4180 compliant CSV with UTF-8 encoding

**Rationale**:
- Standard CSV format compatible with Excel, Google Sheets, financial software
- UTF-8 encoding supports international characters in descriptions
- Header row for column identification
- ISO 8601 dates for unambiguous parsing
- Comma delimiter with quoted fields (handles descriptions with commas)

**Export Format**:
```csv
date,amount,category,description,ai_parsed
2025-10-10T14:30:00Z,50.00,Food,"Pizza dinner, extra cheese",true
2025-10-09T19:15:00Z,25.50,Transport,"Uber ride to office",false
2025-10-09T12:00:00Z,12.75,Food,"Coffee and pastry",true
```

**Column Specifications**:
- `date`: ISO 8601 timestamp (YYYY-MM-DDTHH:mm:ssZ)
- `amount`: Decimal number (2 decimal places, no currency symbol)
- `category`: Category name string (matches app categories, or empty for uncategorized)
- `description`: Free text (quoted if contains comma/newline, max 500 chars)
- `ai_parsed`: Boolean (true/false) - indicates if expense was created via AI

**Import Validation**:
- Required fields: date, amount
- Optional fields: category, description, ai_parsed
- Validation errors show preview with line numbers
- Duplicate detection: Warn if expense with same date/amount/description exists

**Library**: `papaparse` for robust CSV parsing (handles edge cases, streaming)

**Alternatives Considered**:
- JSON export: Not compatible with spreadsheet software
- Excel XLSX: Requires library, larger file size, not human-readable
- Custom delimiter (TSV): Less standard, same edge cases

---

## 9. Error Handling Patterns for AI Service Failures

### Decision: Tiered fallback strategy with user-friendly messaging

**Rationale**:
- AI failures shouldn't block core functionality (expense CRUD works offline)
- Clear error messages guide user to manual alternatives
- Retry logic for transient errors (network, rate limits)
- Fallback to cached responses for repeated queries (chat history)

**Error Handling Tiers**:

**Tier 1: Transient Errors (Auto-Retry)**
- Network timeouts → Retry 3x with exponential backoff
- Rate limit (429) → Wait + retry with user notification
- Server errors (500-503) → Retry 2x, then fallback

**Tier 2: Permanent Errors (Fallback + Notify)**
- Invalid API key → Show setup guide, disable AI features
- Quota exceeded → Notify user, disable AI until quota resets
- Unsupported content (non-English receipt) → Show error, suggest manual entry

**Tier 3: Partial Failures (Degrade Gracefully)**
- Low confidence parsing → Show all fields for review (yellow indicators)
- Partial receipt extraction → Pre-fill known fields, mark others for manual entry
- Chat timeout → Show "Taking longer than expected" with manual query option

**Error Message Examples**:
```javascript
const ERROR_MESSAGES = {
  API_KEY_INVALID: {
    title: 'API Key Error',
    message: 'Your Gemini API key is invalid or expired. Please check your settings.',
    action: 'Update API Key',
    fallback: 'You can still add expenses manually.'
  },
  RATE_LIMIT: {
    title: 'API Limit Reached',
    message: 'You\'ve reached the API rate limit. Retrying in 60 seconds.',
    action: 'Use Manual Entry',
    fallback: 'AI features will resume automatically when the limit resets.'
  },
  NETWORK_ERROR: {
    title: 'Connection Error',
    message: 'Unable to reach AI services. Check your internet connection.',
    action: 'Try Again',
    fallback: 'You can add expenses manually while offline.'
  }
};
```

**Alternatives Considered**:
- Silent failures: Poor UX, users don't understand why features don't work
- Aggressive retries: Wastes quota, delays user feedback
- No fallbacks: Blocks expense entry when AI unavailable (violates FR-053)

---

## 10. Testing Strategy for AI Features

### Decision: Mock-based unit tests + real API integration tests (opt-in)

**Rationale**:
- Mock Gemini API responses for fast, deterministic unit tests
- Separate integration test suite with real API calls (runs on demand, not CI)
- Fixture-based approach with known input/output pairs
- Measure AI accuracy with test dataset (100 samples per feature)

**Test Structure**:
```
tests/
  unit/
    services/ai/
      NLPParser.test.js       # Mocked Gemini responses
      ReceiptOCR.test.js      # Mocked Vision API
      ChatService.test.js     # Mocked chat completions

  integration/
    ai-accuracy/
      nl-parsing.spec.js      # Real API, 100 test phrases
      receipt-ocr.spec.js     # Real API, 50 test receipts
      chat-insights.spec.js   # Real API, 30 test queries

  fixtures/
    nl-parsing-samples.json   # Input phrases + expected outputs
    receipt-images/           # Sample receipts (clear, blurry, non-English)
    api-responses/            # Saved Gemini responses for mocking
```

**Mocking Strategy**:
```javascript
// tests/mocks/gemini.mock.js
export const mockGeminiClient = {
  generateContent: vi.fn((prompt) => {
    // Parse prompt to determine test scenario
    if (prompt.includes('spent 50 on pizza')) {
      return {
        response: {
          text: () => JSON.stringify({
            amount: 50.00,
            category: 'Food',
            date: '2025-10-10',
            description: 'pizza',
            confidence: { amount: 1.0, category: 0.95, date: 0.9 }
          })
        }
      };
    }
    // Default response for unknown inputs
    return { response: { text: () => JSON.stringify({ error: 'Parse failed' }) } };
  })
};
```

**Accuracy Benchmarking**:
- Run integration tests monthly to track model drift
- Target metrics: 95% amount, 80% category (from SC-002)
- Log failures for prompt engineering improvements

**Alternatives Considered**:
- Only mocked tests: Doesn't validate real API integration
- Only real API tests: Slow, flaky, costs quota on every test run
- Recorded HTTP interactions (VCR): Brittle, expires with API changes

---

## Technology Stack Summary

| Component | Technology | Version | Rationale |
|-----------|-----------|---------|-----------|
| **Framework** | React | 18.2+ | Component-based UI, rich ecosystem |
| **Styling** | Tailwind CSS | 3.x | Utility-first, dark mode support |
| **Charts** | Recharts | 2.x | React-native, composable, responsive |
| **AI SDK** | @google/generative-ai | Latest | Official Gemini SDK, TypeScript support |
| **Build Tool** | Vite | 5.x | Fast HMR, modern ESM, optimized builds |
| **Testing** | Vitest + RTL | Latest | Fast, Jest-compatible, React integration |
| **Routing** | React Router | 6.x | Declarative routing, code splitting |
| **Storage** | localStorage | Browser | Simple, synchronous, sufficient for 10K records |
| **CSV** | papaparse | 5.x | Robust parsing, streaming, RFC 4180 compliant |
| **Image** | browser-image-compression | 2.x | Client-side preprocessing, 0 dependencies |
| **State** | React Context | Built-in | Sufficient for single-user, no external deps |

---

## Open Questions for Phase 1 Design

None - all technical decisions resolved. Ready to proceed to data modeling and contract definition.

---

**Research Status**: ✅ Complete
**Next Phase**: Phase 1 - Data Model, Contracts, Quickstart Guide
