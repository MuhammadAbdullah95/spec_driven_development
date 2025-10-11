# Data Model: AI-Enhanced Personal Expense Tracker

**Feature**: 005-ai-expense-tracker | **Date**: 2025-10-10
**Phase**: 1 - Design | **Based on**: spec.md, research.md

## Overview

This document defines the core entities, relationships, validation rules, and state transitions for the AI-Enhanced Personal Expense Tracker. All entities are stored in browser localStorage as JSON, optimized for 10K+ expense records.

---

## Entity Relationship Diagram

```
┌─────────────┐         ┌──────────────┐
│   Expense   │ n:1     │   Category   │
│             │────────▶│              │
│ - amount    │         │ - name       │
│ - date      │         │ - icon       │
│ - desc      │         │ - type       │
└─────────────┘         └──────────────┘
      │ 0:1
      │
      ▼
┌─────────────┐
│   Receipt   │
│             │
│ - image     │
│ - ocrData   │
└─────────────┘

┌─────────────┐         ┌──────────────┐
│   Budget    │ n:1     │   Category   │
│             │────────▶│              │
│ - amount    │         │              │
│ - period    │         │              │
└─────────────┘         └──────────────┘

┌──────────────┐
│ ChatMessage  │ (Session-only, not persisted)
│              │
│ - query      │
│ - response   │
│ - timestamp  │
└──────────────┘

┌──────────────┐
│   Settings   │ (Singleton)
│              │
│ - apiKey     │
│ - theme      │
│ - lastSync   │
└──────────────┘
```

---

## Core Entities

### 1. Expense

**Purpose**: Represents a single spending transaction recorded by the user.

**Schema**:
```typescript
interface Expense {
  id: string;              // UUID v4
  amount: number;          // Positive decimal, max 2 decimals
  categoryId: string | null; // Foreign key to Category, null = uncategorized
  date: string;            // ISO 8601 timestamp (YYYY-MM-DDTHH:mm:ssZ)
  description: string;     // Max 500 characters, can be empty
  receiptId: string | null; // Foreign key to Receipt, null = no receipt
  aiParsed: boolean;       // true if created via NLP/OCR, false if manual
  createdAt: string;       // ISO 8601 timestamp (auto-set on creation)
  updatedAt: string;       // ISO 8601 timestamp (auto-update on edit)
}
```

**Validation Rules** (from FR-001, FR-002):
- `amount`: MUST be > 0, MUST have max 2 decimal places, NO upper limit
- `categoryId`: MUST be null OR match existing Category.id
- `date`: MUST NOT be in future (compared to current date/time)
- `description`: OPTIONAL, max 500 characters
- `id`, `createdAt`, `updatedAt`: Auto-generated, immutable

**Indexes** (in-memory for querying):
- By date (descending) - for recent expense list
- By categoryId - for category filtering
- By month (YYYY-MM) - for monthly summaries

**Example**:
```json
{
  "id": "550e8400-e29b-41d4-a716-446655440000",
  "amount": 50.00,
  "categoryId": "cat-001",
  "date": "2025-10-10T14:30:00Z",
  "description": "Pizza dinner with friends",
  "receiptId": null,
  "aiParsed": true,
  "createdAt": "2025-10-10T14:30:00Z",
  "updatedAt": "2025-10-10T14:30:00Z"
}
```

---

### 2. Category

**Purpose**: Classifies expenses into spending types for organization and analytics.

**Schema**:
```typescript
interface Category {
  id: string;              // Predefined IDs (cat-001 to cat-007) or UUID for custom
  name: string;            // Display name, unique, max 50 characters
  icon: string;            // Emoji or icon identifier
  type: 'predefined' | 'custom'; // Predefined categories cannot be deleted
  color: string;           // Hex color for charts (#RRGGBB)
  createdAt: string;       // ISO 8601 timestamp
}
```

**Predefined Categories** (7 total, from FR-003):
```javascript
const PREDEFINED_CATEGORIES = [
  { id: 'cat-001', name: 'Food', icon: '🍔', type: 'predefined', color: '#3b82f6' },
  { id: 'cat-002', name: 'Transport', icon: '🚗', type: 'predefined', color: '#10b981' },
  { id: 'cat-003', name: 'Shopping', icon: '🛍️', type: 'predefined', color: '#f59e0b' },
  { id: 'cat-004', name: 'Bills', icon: '📄', type: 'predefined', color: '#ef4444' },
  { id: 'cat-005', name: 'Entertainment', icon: '🎬', type: 'predefined', color: '#8b5cf6' },
  { id: 'cat-006', name: 'Health', icon: '🏥', type: 'predefined', color: '#ec4899' },
  { id: 'cat-007', name: 'Other', icon: '📦', type: 'predefined', color: '#6b7280' }
];
```

**Validation Rules**:
- `name`: MUST be unique (case-insensitive), MUST NOT be empty, max 50 characters
- `type === 'predefined'`: CANNOT be deleted (validation error)
- Custom categories: CAN be deleted (triggers expense reassignment flow)

**Relationships**:
- One Category → Many Expenses
- One Category → Many Budgets

---

### 3. Receipt

**Purpose**: Stores receipt images and OCR extraction metadata linked to expenses.

**Schema**:
```typescript
interface Receipt {
  id: string;              // UUID v4
  expenseId: string;       // Foreign key to Expense
  imageBase64: string;     // Data URL (data:image/jpeg;base64,...)
  imageSize: number;       // Bytes, for storage quota management
  ocrData: {
    merchant: string | null;
    extractedAmount: number | null;
    extractedDate: string | null;
    categoryHint: string | null;
    language: 'English' | 'Other';
    confidence: {
      merchant: number;    // 0.0-1.0
      amount: number;
      date: number;
      category: number;
    };
  };
  uploadedAt: string;      // ISO 8601 timestamp
}
```

**Validation Rules** (from FR-017, FR-023):
- `imageBase64`: MUST be valid JPEG or PNG data URL
- `imageSize`: MUST be <= 10MB (10,485,760 bytes)
- `ocrData.language`: If 'Other', confidence scores MUST be 0.0
- `expenseId`: MUST match existing Expense.id

**Storage Optimization**:
- Receipts stored in separate localStorage key to avoid loading on every expense query
- Lazy-loaded only when user views expense details
- If total storage exceeds 5MB, suggest migration to IndexedDB

---

### 4. Budget

**Purpose**: User-defined or AI-suggested spending limits per category.

**Schema**:
```typescript
interface Budget {
  id: string;              // UUID v4
  categoryId: string;      // Foreign key to Category
  amount: number;          // Positive decimal, spending limit
  period: 'weekly' | 'monthly'; // Reset frequency
  source: 'user' | 'ai';   // How budget was created
  aiExplanation: string | null; // AI rationale (if source='ai')
  status: 'active' | 'paused' | 'dismissed'; // User control
  createdAt: string;       // ISO 8601 timestamp
  lastResetAt: string;     // ISO 8601 timestamp (for period tracking)
}
```

**Validation Rules** (from FR-032, FR-035):
- `amount`: MUST be > 0
- `categoryId`: MUST match existing Category.id
- `source === 'ai'`: REQUIRES aiExplanation (non-null)
- `source === 'user'`: aiExplanation MUST be null

**State Transitions**:
```
Created → Active (auto when created)
Active → Paused (user action, stops alerts)
Active → Dismissed (user action, removes from view)
Paused → Active (user action, re-enables alerts)
```

**Alert Thresholds** (from FR-036):
- 80% of amount: Warning (yellow)
- 100% of amount: Exceeded (red)

---

### 5. AIParseResult (Transient)

**Purpose**: Intermediate structure for AI parsing results before expense creation.

**Schema**:
```typescript
interface AIParseResult {
  rawInput: string;        // User's original text or receipt image
  inputType: 'text' | 'image';
  extractedFields: {
    amount: number | null;
    category: string | null;
    date: string | null;
    description: string | null;
  };
  confidence: {
    amount: number;        // 0.0-1.0
    category: number;
    date: number;
    description: number;
  };
  parseTimestamp: string;  // ISO 8601 timestamp
  error: string | null;    // Parse failure reason
}
```

**Not Persisted**: Exists only during review workflow, discarded after expense created or cancelled.

**Confidence Indicators** (from FR-015):
- `>= 0.9`: High confidence (green, auto-accept)
- `0.7 - 0.89`: Medium confidence (yellow, review suggested)
- `< 0.7`: Low confidence (red, manual confirmation required)

---

### 6. ChatMessage (Session-only)

**Purpose**: Conversational AI message history for context-aware follow-ups.

**Schema**:
```typescript
interface ChatMessage {
  id: string;              // UUID v4
  role: 'user' | 'assistant';
  content: string;         // Message text
  timestamp: string;       // ISO 8601 timestamp
  relatedData: {           // Context for AI response
    expenseIds: string[];  // Referenced expenses
    dateRange: { start: string; end: string } | null;
    categoryId: string | null;
  };
}
```

**Storage**: In-memory only (not persisted to localStorage)
**Lifecycle**: Cleared on page navigation or manual clear action
**Token Management**: Last 10 messages max (~2000 tokens)

---

### 7. Settings (Singleton)

**Purpose**: App-wide configuration and user preferences.

**Schema**:
```typescript
interface Settings {
  apiKey: string | null;         // Gemini API key (encrypted)
  theme: 'light' | 'dark' | 'system'; // UI theme preference
  currency: string;              // Currency code (default: 'USD')
  dateFormat: string;            // Date display format (default: 'en-US')
  lastSyncAt: string | null;     // ISO 8601 timestamp (for future sync feature)
  onboardingComplete: boolean;   // First-time setup flag
  version: string;               // Settings schema version (for migrations)
}
```

**Validation Rules**:
- `apiKey`: If provided, MUST be valid format (alphanumeric, min 32 chars)
- `theme`: MUST be one of 3 allowed values
- `currency`: MUST be valid ISO 4217 code

**Security**:
- `apiKey` encrypted before localStorage storage (use Web Crypto API)
- Never logged or exposed in error messages

---

## Data Relationships

### Foreign Key Constraints

1. **Expense.categoryId → Category.id**
   - Nullable (uncategorized expenses allowed)
   - Deletion handling: When category deleted, set to null for affected expenses

2. **Expense.receiptId → Receipt.id**
   - Nullable (not all expenses have receipts)
   - Deletion handling: Cascade delete receipt when expense deleted

3. **Receipt.expenseId → Expense.id**
   - Required (receipt cannot exist without expense)
   - Deletion handling: Cascade delete with parent expense

4. **Budget.categoryId → Category.id**
   - Required (budget must have category)
   - Deletion handling: Cascade delete budgets when category deleted

### Referential Integrity

Enforced at service layer (no database constraints in localStorage):

```typescript
// Before deleting Category
const relatedExpenses = expenses.filter(e => e.categoryId === categoryId);
if (relatedExpenses.length > 0) {
  // Prompt user: reassign or set to null
}

const relatedBudgets = budgets.filter(b => b.categoryId === categoryId);
// Auto-delete budgets (cascade)
```

---

## Storage Schema (localStorage)

### Keys

```typescript
const STORAGE_KEYS = {
  EXPENSES: 'expense-tracker:expenses',      // Expense[]
  CATEGORIES: 'expense-tracker:categories',  // Category[]
  BUDGETS: 'expense-tracker:budgets',        // Budget[]
  RECEIPTS: 'expense-tracker:receipts',      // Receipt[]
  SETTINGS: 'expense-tracker:settings',      // Settings
};
```

### Size Estimates

| Entity | Avg Size | Count | Total |
|--------|----------|-------|-------|
| Expense | 200 bytes | 10,000 | 2.0 MB |
| Category | 150 bytes | 20 | 3 KB |
| Budget | 200 bytes | 10 | 2 KB |
| Receipt | 50 KB | 100 | 5.0 MB |
| Settings | 500 bytes | 1 | 0.5 KB |
| **Total** | | | **~7 MB** |

**Note**: Receipt images dominate storage. If approaching 5MB limit, prompt user to delete old receipts or migrate to IndexedDB.

---

## Validation Functions

### Expense Validation

```typescript
function validateExpense(expense: Partial<Expense>): ValidationResult {
  const errors: string[] = [];

  // Amount validation (FR-002)
  if (!expense.amount || expense.amount <= 0) {
    errors.push('Amount must be positive');
  }
  const rounded = Math.round(expense.amount * 100) / 100;
  if (expense.amount !== rounded) {
    errors.push('Amount can have max 2 decimal places');
  }

  // Date validation (FR-001)
  if (expense.date && new Date(expense.date) > new Date()) {
    errors.push('Date cannot be in the future');
  }

  // Description validation (FR-001)
  if (expense.description && expense.description.length > 500) {
    errors.push('Description too long (max 500 characters)');
  }

  // Category validation
  if (expense.categoryId) {
    const categoryExists = categories.some(c => c.id === expense.categoryId);
    if (!categoryExists) {
      errors.push('Invalid category');
    }
  }

  return { valid: errors.length === 0, errors };
}
```

### Category Validation

```typescript
function validateCategory(category: Partial<Category>): ValidationResult {
  const errors: string[] = [];

  // Name validation
  if (!category.name || category.name.trim().length === 0) {
    errors.push('Category name is required');
  }
  if (category.name && category.name.length > 50) {
    errors.push('Category name too long (max 50 characters)');
  }

  // Uniqueness check (case-insensitive)
  const duplicate = categories.find(
    c => c.id !== category.id &&
         c.name.toLowerCase() === category.name.toLowerCase()
  );
  if (duplicate) {
    errors.push(`Category "${category.name}" already exists`);
  }

  return { valid: errors.length === 0, errors };
}
```

---

## State Machine Diagrams

### Expense Lifecycle

```
[New] ──create──▶ [Active] ──edit──▶ [Active]
                     │
                     │ delete (with confirmation)
                     ▼
                  [Deleted]
                  (removed from storage)
```

### Budget Lifecycle

```
[Created] ──auto──▶ [Active] ◀──unpause── [Paused]
             │         │
             │         ├──pause──▶ [Paused]
             │         │
             │         └──dismiss──▶ [Dismissed]
             │                         (hidden from UI)
             │
             └──monthly reset──▶ [Active]
                (lastResetAt updated)
```

### AI Parse Workflow

```
[User Input] ──send to AI──▶ [Parsing]
                                │
                ┌───────────────┴─────────────┐
                │                             │
              Success                       Failure
                │                             │
                ▼                             ▼
         [Show Preview]                 [Show Error]
     (editable fields)              (fallback to manual)
                │                             │
       ┌────────┴────────┐                   │
       │                 │                   │
    Confirm           Cancel                 │
       │                 │                   │
       ▼                 ▼                   ▼
  [Create Expense]   [Discard]        [Manual Form]
```

---

## Index Strategies

### In-Memory Indexes (Built on App Load)

```typescript
// For fast date-based queries
const expensesByMonth = new Map<string, Expense[]>();
expenses.forEach(e => {
  const month = e.date.substring(0, 7); // YYYY-MM
  if (!expensesByMonth.has(month)) {
    expensesByMonth.set(month, []);
  }
  expensesByMonth.get(month).push(e);
});

// For fast category lookups
const categoryMap = new Map<string, Category>();
categories.forEach(c => categoryMap.set(c.id, c));

// For fast expense filtering
const expensesByCategory = new Map<string, Expense[]>();
expenses.forEach(e => {
  const key = e.categoryId || 'uncategorized';
  if (!expensesByCategory.has(key)) {
    expensesByCategory.set(key, []);
  }
  expensesByCategory.get(key).push(e);
});
```

---

## Migration Strategy (Future: localStorage → IndexedDB)

**Trigger**: Total storage exceeds 5MB (primarily from receipt images)

**Process**:
1. Export all data to JSON
2. Create IndexedDB schema with object stores:
   - `expenses` (keyPath: 'id', index: 'date', 'categoryId')
   - `categories` (keyPath: 'id')
   - `budgets` (keyPath: 'id', index: 'categoryId')
   - `receipts` (keyPath: 'id', index: 'expenseId')
   - `settings` (keyPath: 'version')
3. Import JSON data into IndexedDB
4. Update StorageService to use IndexedDB API
5. Clear localStorage keys after successful migration
6. Set migration flag to prevent re-import

**Schema remains identical** - drop-in replacement at storage layer.

---

**Data Model Status**: ✅ Complete
**Next Phase**: API Contracts, Quickstart Guide
