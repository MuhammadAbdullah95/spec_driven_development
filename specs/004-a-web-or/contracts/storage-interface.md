# Storage Interface Contract

**Date**: 2025-10-11 (Verified)
**Feature**: Daily Expense Tracker
**Purpose**: Define storage abstraction layer for Phase 1 (localStorage) → Phase 2 (database) migration

## Overview

This contract defines the repository interfaces that abstract storage operations for Expenses and Categories. All implementations (LocalStorageAdapter, future DatabaseAdapter) MUST conform to these interfaces to ensure Phase 1→2 migration without business logic changes (Constitution Principle II).

---

## IExpenseRepository

Interface for Expense entity CRUD operations.

```typescript
interface IExpenseRepository {
  /**
   * Create a new expense
   * @param expense - Expense object (without id, createdAt, updatedAt - auto-generated)
   * @returns Promise<Expense> - Created expense with generated id and timestamps
   * @throws Error if validation fails or storage error occurs
   */
  create(expense: Omit<Expense, 'id' | 'createdAt' | 'updatedAt'>): Promise<Expense>;

  /**
   * Update an existing expense
   * @param id - Expense ID to update
   * @param expense - Partial expense object (only fields to update)
   * @returns Promise<Expense> - Updated expense with new updatedAt timestamp
   * @throws Error if expense not found or validation fails
   */
  update(id: string, expense: Partial<Omit<Expense, 'id' | 'createdAt'>>): Promise<Expense>;

  /**
   * Delete an expense by ID
   * @param id - Expense ID to delete
   * @returns Promise<void>
   * @throws Error if expense not found
   */
  delete(id: string): Promise<void>;

  /**
   * Get all expenses
   * @returns Promise<Expense[]> - Array of all expenses, sorted by date DESC
   */
  getAll(): Promise<Expense[]>;

  /**
   * Get a single expense by ID
   * @param id - Expense ID
   * @returns Promise<Expense | null> - Expense or null if not found
   */
  getById(id: string): Promise<Expense | null>;

  /**
   * Find expenses within a date range (inclusive)
   * @param startDate - ISO 8601 date string (start of range)
   * @param endDate - ISO 8601 date string (end of range)
   * @returns Promise<Expense[]> - Expenses within range, sorted by date DESC
   */
  findByDateRange(startDate: string, endDate: string): Promise<Expense[]>;

  /**
   * Find expenses by category ID
   * @param categoryId - Category ID (or null for uncategorized)
   * @returns Promise<Expense[]> - Expenses with matching categoryId, sorted by date DESC
   */
  findByCategory(categoryId: string | null): Promise<Expense[]>;

  /**
   * Search expenses by description text (case-insensitive)
   * @param query - Search query string
   * @returns Promise<Expense[]> - Expenses with description containing query, sorted by date DESC
   */
  searchByDescription(query: string): Promise<Expense[]>;

  /**
   * Get count of expenses referencing a specific category
   * @param categoryId - Category ID to check
   * @returns Promise<number> - Count of expenses with this categoryId
   */
  countByCategory(categoryId: string): Promise<number>;

  /**
   * Bulk update category references (used for category deletion/reassignment)
   * @param oldCategoryId - Current category ID
   * @param newCategoryId - New category ID (or null for uncategorized)
   * @returns Promise<number> - Number of expenses updated
   */
  bulkUpdateCategory(oldCategoryId: string, newCategoryId: string | null): Promise<number>;
}
```

---

## ICategoryRepository

Interface for Category entity CRUD operations.

```typescript
interface ICategoryRepository {
  /**
   * Create a new category
   * @param category - Category object (without id, createdAt - auto-generated)
   * @returns Promise<Category> - Created category with generated id and timestamp
   * @throws Error if validation fails (duplicate name) or storage error
   */
  create(category: Omit<Category, 'id' | 'createdAt'>): Promise<Category>;

  /**
   * Update a category (rename only)
   * @param id - Category ID to update
   * @param category - Partial category object (typically just name)
   * @returns Promise<Category> - Updated category
   * @throws Error if category not found, is predefined, or name already exists
   */
  update(id: string, category: Partial<Omit<Category, 'id' | 'type' | 'createdAt'>>): Promise<Category>;

  /**
   * Delete a category by ID
   * @param id - Category ID to delete
   * @returns Promise<void>
   * @throws Error if category not found or is predefined
   * @note Caller MUST handle expense reassignment before calling delete
   */
  delete(id: string): Promise<void>;

  /**
   * Get all categories
   * @returns Promise<Category[]> - All categories (predefined + custom), sorted by name ASC
   */
  getAll(): Promise<Category[]>;

  /**
   * Get a single category by ID
   * @param id - Category ID
   * @returns Promise<Category | null> - Category or null if not found
   */
  getById(id: string): Promise<Category | null>;

  /**
   * Check if a category name already exists (case-insensitive)
   * @param name - Category name to check
   * @param excludeId - Optional ID to exclude (for rename operations)
   * @returns Promise<boolean> - true if name exists, false otherwise
   */
  nameExists(name: string, excludeId?: string): Promise<boolean>;

  /**
   * Get predefined categories only
   * @returns Promise<Category[]> - Predefined categories (type === 'predefined')
   */
  getPredefined(): Promise<Category[]>;

  /**
   * Get custom categories only
   * @returns Promise<Category[]> - Custom categories (type === 'custom')
   */
  getCustom(): Promise<Category[]>;

  /**
   * Initialize predefined categories on first app load
   * @returns Promise<void>
   * @note Idempotent - safe to call multiple times, only inserts missing categories
   */
  initializePredefined(): Promise<void>;
}
```

---

## Error Handling Contract

All repository methods MUST throw errors with consistent structure:

```typescript
interface RepositoryError extends Error {
  code: string;         // Machine-readable error code
  message: string;      // Human-readable error message
  details?: any;        // Optional additional context
}
```

**Standard Error Codes**:

| Code | Meaning | Example |
|------|---------|---------|
| `NOT_FOUND` | Entity not found by ID | "Expense with ID 'abc-123' not found" |
| `VALIDATION_ERROR` | Input validation failed | "Amount must be positive" |
| `DUPLICATE_ERROR` | Unique constraint violated | "Category name 'Food' already exists" |
| `STORAGE_ERROR` | Underlying storage failure | "localStorage quota exceeded" |
| `READONLY_ERROR` | Attempt to modify immutable entity | "Cannot delete predefined category" |

**Example Implementation**:
```javascript
class RepositoryError extends Error {
  constructor(code, message, details) {
    super(message);
    this.code = code;
    this.details = details;
    this.name = 'RepositoryError';
  }
}

// Usage
throw new RepositoryError('VALIDATION_ERROR', 'Amount must be positive', { amount: -10 });
```

---

## LocalStorageAdapter Implementation Notes

**Phase 1 Implementation** (`src/services/LocalStorageAdapter.js`):

### Storage Keys
```javascript
const KEYS = {
  EXPENSES: 'expense-tracker:expenses',
  CATEGORIES: 'expense-tracker:categories',
  META: 'expense-tracker:meta'
};
```

### Key Methods

#### `create(expense)`
1. Generate UUID v4 for `id`
2. Add `createdAt`, `updatedAt` timestamps (ISO 8601)
3. Validate expense schema
4. Load existing expenses from localStorage
5. Append new expense to array
6. Save to localStorage with error handling

#### `findByDateRange(startDate, endDate)`
1. Parse start/end dates to Date objects
2. Load all expenses
3. Filter: `expense.date >= startDate && expense.date <= endDate`
4. Sort by date DESC
5. Return filtered array

#### `bulkUpdateCategory(oldCategoryId, newCategoryId)`
1. Load all expenses
2. Map: If `expense.categoryId === oldCategoryId`, set to `newCategoryId`
3. Count updated expenses
4. Save updated array
5. Return count

### Performance Optimizations
- **Caching**: Cache parsed expenses array, invalidate on write
- **Batch writes**: Use `requestIdleCallback` for non-urgent writes
- **Compression**: Future optimization if quota issues arise (JSON.stringify is already efficient)

### Error Handling
```javascript
try {
  localStorage.setItem(key, JSON.stringify(data));
} catch (error) {
  if (error.name === 'QuotaExceededError') {
    throw new RepositoryError('STORAGE_ERROR', 'Storage quota exceeded', { error });
  }
  throw new RepositoryError('STORAGE_ERROR', 'Failed to save data', { error });
}
```

---

## Contract Tests

**Purpose**: Verify both LocalStorageAdapter (Phase 1) and future DatabaseAdapter (Phase 2) conform to interface.

**Test File**: `tests/contract/expense-repository.test.js`

**Key Test Cases**:

```javascript
describe('IExpenseRepository Contract', () => {
  let repository; // Injected adapter (LocalStorageAdapter or DatabaseAdapter)

  beforeEach(() => {
    repository = new LocalStorageAdapter(); // Swap for DatabaseAdapter in Phase 2
  });

  describe('create', () => {
    it('should generate id, createdAt, updatedAt', async () => {
      const expense = await repository.create({ amount: 10.50, categoryId: 'cat-001', date: '2025-10-10T12:00:00Z', description: 'Lunch' });
      expect(expense.id).toBeDefined();
      expect(expense.createdAt).toBeDefined();
      expect(expense.updatedAt).toBeDefined();
    });

    it('should reject negative amounts', async () => {
      await expect(repository.create({ amount: -10, categoryId: null, date: '2025-10-10T12:00:00Z', description: '' }))
        .rejects.toThrow('Amount must be positive');
    });
  });

  describe('findByDateRange', () => {
    it('should return expenses within range', async () => {
      await repository.create({ amount: 10, categoryId: null, date: '2025-10-10T12:00:00Z', description: 'A' });
      await repository.create({ amount: 20, categoryId: null, date: '2025-10-11T12:00:00Z', description: 'B' });
      await repository.create({ amount: 30, categoryId: null, date: '2025-10-12T12:00:00Z', description: 'C' });

      const results = await repository.findByDateRange('2025-10-10T00:00:00Z', '2025-10-11T23:59:59Z');
      expect(results).toHaveLength(2);
      expect(results[0].description).toBe('B'); // DESC order
    });
  });

  describe('bulkUpdateCategory', () => {
    it('should update multiple expenses', async () => {
      await repository.create({ amount: 10, categoryId: 'cat-001', date: '2025-10-10T12:00:00Z', description: 'A' });
      await repository.create({ amount: 20, categoryId: 'cat-001', date: '2025-10-11T12:00:00Z', description: 'B' });

      const count = await repository.bulkUpdateCategory('cat-001', null);
      expect(count).toBe(2);

      const expenses = await repository.findByCategory(null);
      expect(expenses).toHaveLength(2);
    });
  });
});
```

**Run Contract Tests**:
```bash
npm test -- tests/contract
```

**Phase 2 Verification**: Run same tests with `DatabaseAdapter` injection to ensure interface compatibility.

---

## Migration Path (Phase 1 → Phase 2)

### Step 1: Export localStorage Data
```javascript
// scripts/export-data.js
const expenses = JSON.parse(localStorage.getItem('expense-tracker:expenses'));
const categories = JSON.parse(localStorage.getItem('expense-tracker:categories'));

const exportData = { expenses, categories, version: '1.0' };
fs.writeFileSync('export.json', JSON.stringify(exportData, null, 2));
```

### Step 2: Implement DatabaseAdapter
```javascript
// src/services/DatabaseAdapter.js
class DatabaseAdapter implements IExpenseRepository {
  constructor(apiClient) {
    this.api = apiClient; // HTTP client for backend API
  }

  async create(expense) {
    const response = await this.api.post('/api/expenses', expense);
    return response.data;
  }

  async getAll() {
    const response = await this.api.get('/api/expenses');
    return response.data;
  }

  // ... implement all interface methods
}
```

### Step 3: Swap Adapters (No Business Logic Changes)
```javascript
// src/app.js - Before (Phase 1)
const expenseRepository = new LocalStorageAdapter();

// src/app.js - After (Phase 2)
const expenseRepository = new DatabaseAdapter(apiClient);

// All services (ExpenseService, CategoryService) remain unchanged
```

### Step 4: Run Contract Tests
```bash
npm test -- tests/contract # Verify DatabaseAdapter passes all tests
```

---

## Next Steps

- **quickstart.md**: Implementation setup instructions
- **Implementation**: Build `LocalStorageAdapter` conforming to this contract
- **Contract Tests**: Write tests to verify adapter compliance

---

**Contract Definition Complete**: Ready for implementation and testing.
