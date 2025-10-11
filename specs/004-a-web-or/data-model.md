# Data Model: Daily Expense Tracker

**Date**: 2025-10-11 (Verified)
**Feature**: Daily Expense Tracker
**Phase**: 1 - Entity Design

## Overview

This document defines the core data entities, their schemas, relationships, validation rules, and state transitions for the Daily Expense Tracker application.

## Entity Definitions

### 1. Expense

Represents a single spending transaction.

**Schema**:
```typescript
interface Expense {
  id: string;              // UUID v4, immutable
  amount: number;          // Positive decimal (>0), max 2 decimal places
  categoryId: string | null; // FK to Category.id, null = uncategorized
  date: string;            // ISO 8601 date-time (e.g., "2025-10-10T14:30:00.000Z")
  description: string;     // Optional, max 500 characters
  createdAt: string;       // ISO 8601 timestamp, immutable
  updatedAt: string;       // ISO 8601 timestamp, updated on every edit
}
```

**Field Specifications**:

| Field | Type | Constraints | Default | Notes |
|-------|------|-------------|---------|-------|
| `id` | string | UUID v4, unique, immutable | Auto-generated | Primary key |
| `amount` | number | > 0, ≤ 2 decimals, no upper limit | Required | FR-002: Positive numbers only |
| `categoryId` | string \| null | FK to Category.id or null | null | Nullable per clarification Q5 |
| `date` | string | ISO 8601 datetime, editable | Current time | FR-001: Auto-populated, user editable |
| `description` | string | Max 500 chars, optional | "" (empty) | FR-001: Optional text |
| `createdAt` | string | ISO 8601 datetime, immutable | Auto-generated | Audit trail |
| `updatedAt` | string | ISO 8601 datetime, auto-updated | Auto-generated | Audit trail |

**Validation Rules** (enforced in `ExpenseService`):
1. **amount**: Must be `> 0`, rounded to 2 decimals (`Math.round(amount * 100) / 100`)
2. **categoryId**: If not null, must exist in `categories` collection
3. **date**: Must be valid ISO 8601 string, parseable by `new Date(date)`
4. **description**: Trim whitespace, max 500 characters after trimming
5. **No future dates**: Date cannot be > current date/time (business rule)

**Relationships**:
- **Many-to-One** with Category: `expense.categoryId → category.id` (optional)
- **Nullable relationship**: `categoryId = null` represents uncategorized state (FR-009 clarification)

**State Transitions**:
```
[Creation]
  ↓
[Active] ←→ [Editing] (user can edit all fields except id, createdAt)
  ↓
[Deleted] (soft delete not required; hard delete from storage)
```

**Indexes** (for localStorage/future database):
- Primary: `id`
- Secondary: `date` (for date range queries)
- Secondary: `categoryId` (for category filtering, handle null separately)

---

### 2. Category

Represents an expense classification (predefined or custom).

**Schema**:
```typescript
interface Category {
  id: string;          // UUID v4, immutable
  name: string;        // Unique, 1-50 characters
  type: 'predefined' | 'custom'; // Predefined categories cannot be deleted
  createdAt: string;   // ISO 8601 timestamp, immutable
}
```

**Field Specifications**:

| Field | Type | Constraints | Default | Notes |
|-------|------|-------------|---------|-------|
| `id` | string | UUID v4, unique, immutable | Auto-generated | Primary key |
| `name` | string | Unique, 1-50 chars, case-insensitive | Required | FR-005: Unique names |
| `type` | enum | 'predefined' \| 'custom' | Required | Determines delete rules |
| `createdAt` | string | ISO 8601 datetime, immutable | Auto-generated | Audit trail |

**Predefined Categories** (FR-004, initialized on first app load):
```javascript
const PREDEFINED_CATEGORIES = [
  { id: 'cat-001', name: 'Food', type: 'predefined' },
  { id: 'cat-002', name: 'Transport', type: 'predefined' },
  { id: 'cat-003', name: 'Entertainment', type: 'predefined' },
  { id: 'cat-004', name: 'Bills', type: 'predefined' },
  { id: 'cat-005', name: 'Shopping', type: 'predefined' },
  { id: 'cat-006', name: 'Health', type: 'predefined' }
];
```

**Validation Rules** (enforced in `CategoryService`):
1. **name**: Trim whitespace, 1-50 characters, case-insensitive uniqueness check
2. **Duplicate check**: `categories.find(c => c.name.toLowerCase() === newName.toLowerCase())` must be empty
3. **Reserved names**: Cannot create custom category named "Uncategorized" (reserved for UI display of null)

**Relationships**:
- **One-to-Many** with Expense: `category.id ← expense.categoryId` (many expenses)

**State Transitions**:
```
[Predefined] → Cannot be deleted or renamed
[Custom: Creation]
  ↓
[Custom: Active] ←→ [Editing] (rename only, must remain unique)
  ↓
[Deletion Check]
  ├─ Has expenses? → [Reassignment Dialog] (FR-009)
  │    ├─ User chooses reassign → Update all expenses to new categoryId
  │    └─ User chooses uncategorize → Set all expenses.categoryId = null
  └─ No expenses? → [Deleted] (hard delete)
```

**Business Rules**:
- **Predefined categories**: Cannot be edited or deleted (type === 'predefined')
- **Custom categories**: Can be renamed (unique constraint enforced) or deleted (with reassignment)
- **Deletion with expenses**: Mandatory dialog (FR-009), no default action per clarification Q1

---

### 3. Summary (Derived Entity)

Represents aggregated spending data. **Not stored**; calculated on-demand from Expense entities.

**Schema**:
```typescript
interface PeriodSummary {
  period: 'today' | 'week' | 'month' | 'custom';
  startDate: string;        // ISO 8601 date
  endDate: string;          // ISO 8601 date
  totalAmount: number;      // Sum of all expense.amount in period
  expenseCount: number;     // Number of expenses in period
}

interface CategoryBreakdown {
  categoryId: string | null; // null = "Uncategorized" in UI
  categoryName: string;      // Category.name or "Uncategorized"
  totalAmount: number;       // Sum of expenses for this category
  percentage: number;        // (totalAmount / grandTotal) * 100
  expenseCount: number;      // Number of expenses in category
}

interface SpendingSummary {
  periodSummary: PeriodSummary;
  categoryBreakdown: CategoryBreakdown[];
  topCategory: CategoryBreakdown | null; // Category with highest spending
}
```

**Calculation Rules** (in `AnalyticsService`):

1. **Period Definitions** (per FR-013, clarification Q4):
   - **today**: `00:00:00` to `23:59:59` of current date (device local time)
   - **week**: Monday 00:00:00 to Sunday 23:59:59 of current ISO 8601 week
   - **month**: First day 00:00:00 to last day 23:59:59 of current month
   - **custom**: User-selected `startDate` to `endDate` (inclusive)

2. **Category Breakdown**:
   - Include all categories with `expenseCount > 0` in selected period
   - Include "Uncategorized" (`categoryId === null`) as separate entry if any null expenses exist
   - Sort by `totalAmount DESC` (highest spending first)
   - Percentage: `(categoryTotal / periodTotal) * 100`, rounded to 2 decimals

3. **Performance** (SC-003, SC-007):
   - Cache: Store last calculated summary with timestamp, invalidate on expense CRUD
   - Filter: Use date index to avoid full scan of 10K expenses
   - Memoization: `useMemo` in React to prevent recalculations on re-renders

**Not Persisted**: Summaries are calculated views, not stored entities. This ensures data consistency and avoids denormalization complexity.

---

## Relationships Diagram

```
┌─────────────────────┐
│   Category          │
│  ─────────────────  │
│  id (PK)            │
│  name (unique)      │
│  type               │
└──────────┬──────────┘
           │
           │ 1
           │
           │ *
           │
┌──────────▼──────────┐
│   Expense           │
│  ─────────────────  │
│  id (PK)            │
│  amount             │
│  categoryId (FK)────┘  ← Nullable (uncategorized)
│  date               │
│  description        │
└─────────────────────┘

Summary (derived, not stored):
  ← Aggregates Expense entities by date/category
```

---

## Storage Schema (localStorage Phase 1)

**Storage Keys**:
```
localStorage['expense-tracker:expenses']   // JSON array of Expense[]
localStorage['expense-tracker:categories'] // JSON array of Category[]
localStorage['expense-tracker:meta']       // { version: '1.0', initialized: true }
```

**Serialization**:
- Store as JSON strings: `JSON.stringify(expenses)`
- Deserialize on load: `JSON.parse(localStorage.getItem('...')) || []`
- Handle `QuotaExceededError`: Warn user at 80% capacity (estimate ~5MB = 50K expenses)

**Data Integrity**:
- **Atomic writes**: Use try-catch to rollback on write failure
- **Foreign key integrity**: Before deleting category, validate no orphaned expenses (handled by CategoryService)
- **Corruption handling**: On parse error, attempt recovery from backup key or reset to defaults

**Migration Strategy** (Phase 1 → Phase 2):
- Repository interface (`IExpenseRepository`) abstracts storage
- LocalStorageAdapter Phase 1 → DatabaseAdapter Phase 2 (no service changes)
- Migration script exports localStorage to JSON, imports to database

---

## Validation Summary

| Entity | Field | Validation Rule | Error Message |
|--------|-------|-----------------|---------------|
| Expense | amount | > 0, ≤ 2 decimals | "Amount must be a positive number" |
| Expense | categoryId | Exists in categories or null | "Invalid category selected" |
| Expense | date | Valid ISO 8601, ≤ now | "Invalid date" / "Date cannot be in the future" |
| Expense | description | ≤ 500 chars | "Description too long (max 500 characters)" |
| Category | name | 1-50 chars, unique (case-insensitive) | "Category name already exists" |
| Category | name | Not "Uncategorized" | "Name 'Uncategorized' is reserved" |
| Category | type | 'predefined' or 'custom' | N/A (internal only) |

---

## Edge Case Handling

1. **Uncategorized expenses** (FR-009 clarification):
   - Stored as `categoryId: null`
   - UI displays as "Uncategorized" in lists, filters, summaries
   - Filtering: Separate filter option for "Uncategorized" (not in categories dropdown)

2. **Duplicate category names**:
   - Case-insensitive check: "Food" vs "food" treated as duplicate (FR-019)
   - Show error: "A category with this name already exists"

3. **Very large amounts**:
   - No upper limit per clarification Q3
   - Display with thousand separators: `Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' })`

4. **Empty states**:
   - No expenses: Show "No expenses recorded yet" (FR-018)
   - No categories: Always show predefined categories (initialization on first load)

5. **Time zone consistency**:
   - All dates in ISO 8601 with device local timezone
   - Week calculation uses ISO 8601 (Monday start) via `Intl` or manual calculation

---

## Next Steps

- **contracts/**: Define `IExpenseRepository` and `ICategoryRepository` interfaces
- **quickstart.md**: Folder structure, initial setup, seed data script
- Proceed to implementation with these schemas as contracts

---

**Data Model Complete**: Ready for contract definition and implementation.
