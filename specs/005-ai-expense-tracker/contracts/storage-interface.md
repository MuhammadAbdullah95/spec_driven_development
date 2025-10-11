# Storage Interface Contract

**Feature**: 005-ai-expense-tracker | **Phase**: 1 - Design
**Purpose**: Define storage layer abstraction for expense data persistence

## Overview

This contract defines the interface between the business logic layer (services) and the storage layer. It enables seamless migration from localStorage (Phase 1) to IndexedDB/database (Phase 2) without changing business logic.

---

## IStorageAdapter Interface

### Expense Operations

```typescript
interface IStorageAdapter {
  // Create
  createExpense(expense: Omit<Expense, 'id' | 'createdAt' | 'updatedAt'>): Promise<Expense>;

  // Read
  getExpense(id: string): Promise<Expense | null>;
  getAllExpenses(): Promise<Expense[]>;
  getExpensesByDateRange(startDate: string, endDate: string): Promise<Expense[]>;
  getExpensesByCategory(categoryId: string | null): Promise<Expense[]>;
  searchExpenses(query: string): Promise<Expense[]>;

  // Update
  updateExpense(id: string, updates: Partial<Expense>): Promise<Expense>;

  // Delete
  deleteExpense(id: string): Promise<void>;

  // Category Operations
  createCategory(category: Omit<Category, 'id' | 'createdAt'>): Promise<Category>;
  getAllCategories(): Promise<Category[]>;
  updateCategory(id: string, updates: Partial<Category>): Promise<Category>;
  deleteCategory(id: string): Promise<void>;

  // Budget Operations
  createBudget(budget: Omit<Budget, 'id' | 'createdAt'>): Promise<Budget>;
  getAllBudgets(): Promise<Budget[]>;
  updateBudget(id: string, updates: Partial<Budget>): Promise<Budget>;
  deleteBudget(id: string): Promise<void>;

  // Receipt Operations
  createReceipt(receipt: Omit<Receipt, 'id' | 'uploadedAt'>): Promise<Receipt>;
  getReceipt(id: string): Promise<Receipt | null>;
  deleteReceipt(id: string): Promise<void>;

  // Settings Operations
  getSettings(): Promise<Settings>;
  updateSettings(updates: Partial<Settings>): Promise<Settings>;

  // Utility Operations
  clearAllData(): Promise<void>;
  exportData(): Promise<string>; // JSON string
  importData(jsonData: string): Promise<void>;
}
```

---

## Contract Guarantees

### Atomicity
- Each operation completes fully or fails entirely
- No partial state changes (all-or-nothing)

### Validation
- All data validated before persistence
- Invalid data throws `ValidationError` with details
- Referential integrity enforced (FK checks)

### Error Handling
- `NotFoundError`: Entity with given ID doesn't exist
- `ValidationError`: Data fails validation rules
- `StorageQuotaError`: localStorage/IndexedDB quota exceeded
- `DuplicateError`: Unique constraint violation (category names)

### Data Consistency
- Auto-generated fields (id, timestamps) never null
- Foreign key relationships maintained on delete (cascade or nullify)
- Sorted results: expenses by date DESC, categories by name ASC

---

## Implementation Examples

### localStorage Implementation (Phase 1)

```typescript
class LocalStorageAdapter implements IStorageAdapter {
  private readonly STORAGE_KEYS = {
    EXPENSES: 'expense-tracker:expenses',
    CATEGORIES: 'expense-tracker:categories',
    BUDGETS: 'expense-tracker:budgets',
    RECEIPTS: 'expense-tracker:receipts',
    SETTINGS: 'expense-tracker:settings'
  };

  async createExpense(data: Omit<Expense, 'id' | 'createdAt' | 'updatedAt'>): Promise<Expense> {
    // Validate input
    validateExpense(data);

    // Generate new expense
    const expense: Expense = {
      ...data,
      id: crypto.randomUUID(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    // Persist
    const expenses = await this.getAllExpenses();
    expenses.push(expense);
    this._saveExpenses(expenses);

    return expense;
  }

  async getAllExpenses(): Promise<Expense[]> {
    try {
      const json = localStorage.getItem(this.STORAGE_KEYS.EXPENSES);
      const expenses: Expense[] = json ? JSON.parse(json) : [];
      return expenses.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
    } catch (error) {
      throw new StorageError('Failed to load expenses', error);
    }
  }

  private _saveExpenses(expenses: Expense[]): void {
    try {
      localStorage.setItem(this.STORAGE_KEYS.EXPENSES, JSON.stringify(expenses));
    } catch (error) {
      if (error instanceof DOMException && error.name === 'QuotaExceededError') {
        throw new StorageQuotaError('Storage quota exceeded');
      }
      throw new StorageError('Failed to save expenses', error);
    }
  }

  // ... other methods
}
```

### IndexedDB Implementation (Phase 2)

```typescript
class IndexedDBAdapter implements IStorageAdapter {
  private db!: IDBDatabase;

  async createExpense(data: Omit<Expense, 'id' | 'createdAt' | 'updatedAt'>): Promise<Expense> {
    validateExpense(data);

    const expense: Expense = {
      ...data,
      id: crypto.randomUUID(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    return new Promise((resolve, reject) => {
      const tx = this.db.transaction(['expenses'], 'readwrite');
      const store = tx.objectStore('expenses');
      const request = store.add(expense);

      request.onsuccess = () => resolve(expense);
      request.onerror = () => reject(new StorageError('Failed to create expense'));
    });
  }

  async getAllExpenses(): Promise<Expense[]> {
    return new Promise((resolve, reject) => {
      const tx = this.db.transaction(['expenses'], 'readonly');
      const store = tx.objectStore('expenses');
      const index = store.index('date');
      const request = index.openCursor(null, 'prev'); // DESC order

      const expenses: Expense[] = [];
      request.onsuccess = (event) => {
        const cursor = (event.target as IDBRequest).result;
        if (cursor) {
          expenses.push(cursor.value);
          cursor.continue();
        } else {
          resolve(expenses);
        }
      };
      request.onerror = () => reject(new StorageError('Failed to load expenses'));
    });
  }

  // ... other methods
}
```

---

## Error Types

```typescript
class StorageError extends Error {
  constructor(message: string, public cause?: any) {
    super(message);
    this.name = 'StorageError';
  }
}

class ValidationError extends StorageError {
  constructor(public errors: string[]) {
    super(`Validation failed: ${errors.join(', ')}`);
    this.name = 'ValidationError';
  }
}

class NotFoundError extends StorageError {
  constructor(entityType: string, id: string) {
    super(`${entityType} with ID '${id}' not found`);
    this.name = 'NotFoundError';
  }
}

class StorageQuotaError extends StorageError {
  constructor(message = 'Storage quota exceeded') {
    super(message);
    this.name = 'StorageQuotaError';
  }
}

class DuplicateError extends StorageError {
  constructor(field: string, value: string) {
    super(`${field} '${value}' already exists`);
    this.name = 'DuplicateError';
  }
}
```

---

## Testing Contract

### Unit Tests (Required for All Implementations)

```typescript
describe('IStorageAdapter Contract', () => {
  let adapter: IStorageAdapter;

  beforeEach(() => {
    adapter = new LocalStorageAdapter(); // Or IndexedDBAdapter
  });

  describe('Expense Operations', () => {
    it('should create expense with auto-generated fields', async () => {
      const data = {
        amount: 50.00,
        categoryId: 'cat-001',
        date: '2025-10-10T14:30:00Z',
        description: 'Test expense',
        receiptId: null,
        aiParsed: false
      };

      const expense = await adapter.createExpense(data);

      expect(expense.id).toBeDefined();
      expect(expense.createdAt).toBeDefined();
      expect(expense.updatedAt).toBeDefined();
      expect(expense.amount).toBe(50.00);
    });

    it('should throw ValidationError for invalid amount', async () => {
      const data = {
        amount: -10.00, // Invalid: negative
        categoryId: 'cat-001',
        date: '2025-10-10T14:30:00Z',
        description: '',
        receiptId: null,
        aiParsed: false
      };

      await expect(adapter.createExpense(data)).rejects.toThrow(ValidationError);
    });

    it('should get all expenses sorted by date DESC', async () => {
      await adapter.createExpense({ amount: 10, date: '2025-10-01T00:00:00Z', ... });
      await adapter.createExpense({ amount: 20, date: '2025-10-02T00:00:00Z', ... });

      const expenses = await adapter.getAllExpenses();

      expect(expenses[0].date).toBe('2025-10-02T00:00:00Z'); // Most recent first
      expect(expenses[1].date).toBe('2025-10-01T00:00:00Z');
    });

    it('should update expense and change updatedAt', async () => {
      const expense = await adapter.createExpense({ amount: 50, ... });
      const originalUpdatedAt = expense.updatedAt;

      await new Promise(resolve => setTimeout(resolve, 10)); // Ensure time passes

      const updated = await adapter.updateExpense(expense.id, { amount: 60 });

      expect(updated.amount).toBe(60);
      expect(updated.updatedAt).not.toBe(originalUpdatedAt);
    });

    it('should throw NotFoundError when deleting non-existent expense', async () => {
      await expect(adapter.deleteExpense('non-existent-id')).rejects.toThrow(NotFoundError);
    });
  });

  describe('Category Operations', () => {
    it('should throw DuplicateError for duplicate category names', async () => {
      await adapter.createCategory({ name: 'Coffee', type: 'custom', icon: '☕', color: '#000' });

      await expect(
        adapter.createCategory({ name: 'coffee', type: 'custom', ... }) // Case-insensitive
      ).rejects.toThrow(DuplicateError);
    });
  });

  describe('Referential Integrity', () => {
    it('should nullify categoryId when category deleted', async () => {
      const category = await adapter.createCategory({ name: 'Test', ... });
      const expense = await adapter.createExpense({ amount: 50, categoryId: category.id, ... });

      await adapter.deleteCategory(category.id);

      const updated = await adapter.getExpense(expense.id);
      expect(updated.categoryId).toBeNull();
    });

    it('should cascade delete receipts when expense deleted', async () => {
      const expense = await adapter.createExpense({ amount: 50, ... });
      const receipt = await adapter.createReceipt({ expenseId: expense.id, ... });

      await adapter.deleteExpense(expense.id);

      const deletedReceipt = await adapter.getReceipt(receipt.id);
      expect(deletedReceipt).toBeNull();
    });
  });
});
```

---

**Contract Status**: ✅ Complete
**Implementations**: localStorage (Phase 1), IndexedDB (Phase 2 planned)
