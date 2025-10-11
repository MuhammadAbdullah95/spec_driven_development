# Quickstart Guide: Daily Expense Tracker

**Date**: 2025-10-11 (Updated)
**Feature**: Daily Expense Tracker
**Purpose**: Setup instructions and implementation roadmap

## Overview

This guide walks through setting up the development environment, project structure, and first implementation steps for the Daily Expense Tracker web application using TypeScript, Vite, React, and modern tooling.

---

## Prerequisites

- **Node.js**: v22.15.0 LTS (required for latest features)
- **npm**: v9.0+ (or yarn/pnpm equivalent)
- **Git**: For version control
- **Modern Browser**: Chrome 90+, Firefox 88+, Safari 14+, or Edge 90+ for testing
- **TypeScript**: Will be installed as dependency

---

## Initial Setup

### 1. Create Project with Vite

```bash
# Create TypeScript React project with Vite
cd G:\spec_driven_development
npm create vite@latest expense-tracker-app -- --template react-ts

# Navigate to project
cd expense-tracker-app
```

This creates the base structure with TypeScript, Vite, and React pre-configured.

### 2. Update Project Structure

```bash
# Create additional directories
mkdir -p src/{models,services,utils,hooks}
mkdir -p tests/{unit,integration,contract,e2e}
```

### 3. Install Dependencies

```bash
# Core dependencies
npm install
npm install recharts@3.2.1
npm install dompurify@3.1.0
npm install @types/dompurify

# Testing dependencies
npm install --save-dev vitest@3.2.4 @vitest/ui@3.2.4
npm install --save-dev jsdom@24.0.0
npm install --save-dev @testing-library/react@16.3.0
npm install --save-dev @testing-library/dom@10.4.0
npm install --save-dev @testing-library/jest-dom@6.5.0
npm install --save-dev @testing-library/user-event@14.5.2
npm install --save-dev @playwright/test@1.56.0

# Linting
npm install --save-dev eslint@latest prettier@latest
```

### 4. Configure Vite for Testing

**Update `vite.config.ts`**:
```typescript
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  server: {
    port: 3000,
    open: true
  },
  build: {
    outDir: 'dist',
    sourcemap: true
  },
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: ['./tests/setup.ts'],
    css: true,
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html'],
      exclude: ['node_modules/', 'tests/', '*.config.ts']
    }
  }
});
```

### 5. Configure Vitest

**Create `tests/setup.ts`**:
```typescript
import { expect, afterEach } from 'vitest';
import { cleanup } from '@testing-library/react';
import * as matchers from '@testing-library/jest-dom/matchers';

// Extend Vitest's expect with jest-dom matchers
expect.extend(matchers);

// Cleanup after each test
afterEach(() => {
  cleanup();
  localStorage.clear();
});

// Mock localStorage
Object.defineProperty(window, 'localStorage', {
  value: {
    getItem: vi.fn(),
    setItem: vi.fn(),
    removeItem: vi.fn(),
    clear: vi.fn(),
  },
  writable: true
});
```

### 6. Configure Playwright

**Create `playwright.config.ts`**:
```typescript
import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  testDir: './tests/e2e',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: 'html',
  use: {
    baseURL: 'http://localhost:3000',
    trace: 'on-first-retry',
  },
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
    {
      name: 'firefox',
      use: { ...devices['Desktop Firefox'] },
    },
    {
      name: 'webkit',
      use: { ...devices['Desktop Safari'] },
    },
  ],
  webServer: {
    command: 'npm run dev',
    url: 'http://localhost:3000',
    reuseExistingServer: !process.env.CI,
  },
});
```

### 7. Update Package.json Scripts

**Update `package.json` scripts section**:
```json
{
  "scripts": {
    "dev": "vite",
    "build": "tsc && vite build",
    "preview": "vite preview",
    "test": "vitest",
    "test:ui": "vitest --ui",
    "test:coverage": "vitest --coverage",
    "test:e2e": "playwright test",
    "test:e2e:ui": "playwright test --ui",
    "lint": "eslint src --ext .ts,.tsx --fix",
    "format": "prettier --write src"
  }
}
```

### 8. Configure ESLint

**Create `.eslintrc.json`**:
```json
{
  "env": {
    "browser": true,
    "es2021": true,
    "jest": true
  },
  "extends": [
    "eslint:recommended",
    "plugin:react/recommended",
    "plugin:react/jsx-runtime"
  ],
  "parserOptions": {
    "ecmaVersion": "latest",
    "sourceType": "module"
  },
  "rules": {
    "no-console": "warn",
    "no-unused-vars": ["error", { "argsIgnorePattern": "^_" }]
  },
  "settings": {
    "react": {
      "version": "detect"
    }
  }
}
```

### 7. Create HTML Entry Point

**Create `public/index.html`**:
```html
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <meta name="description" content="Track your daily expenses with ease">
  <title>Expense Tracker</title>
</head>
<body>
  <div id="root"></div>
  <script type="module" src="/src/app.js"></script>
</body>
</html>
```

---

## Project Structure

```
frontend/
├── src/
│   ├── models/
│   │   ├── Expense.js          # Expense entity schema + validation
│   │   └── Category.js         # Category entity schema + validation
│   ├── services/
│   │   ├── LocalStorageAdapter.js  # IExpenseRepository implementation
│   │   ├── ExpenseService.js       # Business logic for expenses
│   │   ├── CategoryService.js      # Business logic for categories
│   │   └── AnalyticsService.js     # Spending summary calculations
│   ├── utils/
│   │   ├── dateHelpers.js      # getWeekStart, getMonthStart, etc.
│   │   ├── validators.js       # Input validation functions
│   │   └── formatters.js       # Currency, date formatting (Intl)
│   ├── components/
│   │   ├── ExpenseForm.jsx     # Create/edit expense form
│   │   ├── ExpenseList.jsx     # List of expenses with filters
│   │   ├── CategoryManager.jsx # CRUD for categories
│   │   ├── Charts/
│   │   │   ├── PieChart.jsx    # Category distribution pie chart
│   │   │   ├── BarChart.jsx    # Category distribution bar chart
│   │   │   └── LineChart.jsx   # Spending over time
│   │   └── common/
│   │       ├── Button.jsx
│   │       ├── Modal.jsx
│   │       └── Input.jsx
│   ├── pages/
│   │   ├── Dashboard.jsx       # Main expense entry + summary
│   │   ├── ExpenseListPage.jsx # Full expense list with search/filter
│   │   └── SummaryPage.jsx     # Analytics dashboard with charts
│   ├── context/
│   │   └── AppContext.jsx      # React Context for global state
│   └── app.js                  # Entry point, routing, initialization
├── public/
│   └── index.html
├── tests/
│   ├── unit/
│   │   ├── models/
│   │   ├── services/
│   │   └── utils/
│   ├── integration/
│   │   └── components/
│   └── contract/
│       ├── expense-repository.test.js
│       └── category-repository.test.js
├── package.json
├── vite.config.js
├── jest.config.js
└── .eslintrc.json
```

---

## Implementation Roadmap

### Phase 0: Foundation (Days 1-2)

**Goal**: Basic infrastructure and data layer

1. **Setup** ✅ (Complete above steps)

2. **Data Models** (`src/models/`):
   ```javascript
   // Expense.js
   export class Expense {
     constructor(data) {
       this.id = data.id;
       this.amount = data.amount;
       this.categoryId = data.categoryId;
       this.date = data.date;
       this.description = data.description;
       this.createdAt = data.createdAt;
       this.updatedAt = data.updatedAt;
     }

     static validate(data) {
       // Validation logic per data-model.md
     }
   }
   ```

3. **Storage Adapter** (`src/services/LocalStorageAdapter.js`):
   - Implement `IExpenseRepository` interface (see `contracts/storage-interface.md`)
   - Write contract tests (`tests/contract/expense-repository.test.js`)

4. **Utilities** (`src/utils/`):
   - `dateHelpers.js`: getWeekStart, getMonthStart (ISO 8601)
   - `validators.js`: validateAmount, validateCategoryName
   - `formatters.js`: formatCurrency, formatDate (Intl)

**Verification**:
```bash
npm test -- tests/unit/models
npm test -- tests/contract
```

---

### Phase 1: Core CRUD (Days 3-5) - User Story 1 (P1)

**Goal**: Expense creation, editing, deletion with persistence

1. **Services** (`src/services/`):
   - `ExpenseService.js`: create, update, delete, getAll
   - `CategoryService.js`: getAll, initializePredefined

2. **Components** (`src/components/`):
   - `ExpenseForm.jsx`: Form with amount, category dropdown, date picker, description
   - `ExpenseList.jsx`: Display expenses sorted by date, edit/delete buttons

3. **Pages** (`src/pages/`):
   - `Dashboard.jsx`: ExpenseForm + recent expenses

4. **Context** (`src/context/AppContext.jsx`):
   - State: expenses, categories, loading, error
   - Actions: addExpense, updateExpense, deleteExpense, loadExpenses

5. **Tests**:
   - Unit: ExpenseService, CategoryService
   - Integration: ExpenseForm + ExpenseService, ExpenseList rendering

**Acceptance Criteria** (from spec.md User Story 1):
- ✅ Create expense with amount, category, date, description
- ✅ Expense appears in list with current date/time
- ✅ Expenses persist across app restarts (localStorage)
- ✅ Edit and delete expenses

**Verification**:
```bash
npm test
npm run dev # Manual testing in browser
```

---

### Phase 2: Categories (Days 6-7) - User Story 2 (P2)

**Goal**: Custom categories, deletion with reassignment

1. **Components**:
   - `CategoryManager.jsx`: List categories, add/edit/delete buttons
   - `CategoryDeleteDialog.jsx`: Modal with reassignment options (FR-009)

2. **Services**:
   - `CategoryService`: create, update, delete (with reassignment check)

3. **Update ExpenseForm**:
   - Category dropdown includes custom categories

4. **Tests**:
   - Unit: CategoryService delete with reassignment logic
   - Integration: CategoryManager + CategoryService

**Acceptance Criteria** (User Story 2):
- ✅ Select from predefined categories (Food, Transport, etc.)
- ✅ Create custom categories
- ✅ Edit/delete custom categories
- ✅ Deletion shows dialog with reassign/uncategorize options
- ✅ Filter expenses by category

**Verification**:
```bash
npm test -- tests/unit/services/CategoryService
npm run dev # Test category CRUD + deletion flow
```

---

### Phase 3: Analytics (Days 8-10) - User Story 3 (P3)

**Goal**: Spending summaries with charts

1. **Services**:
   - `AnalyticsService.js`: getTotalsByPeriod, getCategoryBreakdown

2. **Components** (`src/components/Charts/`):
   - `PieChart.jsx`: Category distribution (Chart.js pie)
   - `BarChart.jsx`: Category distribution (Chart.js bar)
   - `LineChart.jsx`: Spending over time (Chart.js line)
   - `ChartToggle.jsx`: Switch between pie/bar views

3. **Pages**:
   - `SummaryPage.jsx`: Period selector (today/week/month/custom), charts, drill-down

4. **Update Dashboard**:
   - Add summary cards (today, week, month totals)

5. **Tests**:
   - Unit: AnalyticsService calculations
   - Integration: SummaryPage + AnalyticsService

**Acceptance Criteria** (User Story 3):
- ✅ View totals for today, week, month
- ✅ Category breakdown with percentages
- ✅ Toggle between pie and bar charts (FR-016 clarification)
- ✅ Spending over time as line/bar chart
- ✅ Drill down to expenses from summary

**Verification**:
```bash
npm test -- tests/integration/pages/SummaryPage
npm run dev # Test all chart types, drill-down
```

---

### Phase 4: Polish (Days 11-12)

**Goal**: Responsive design, accessibility, edge cases

1. **Responsive CSS** (`src/styles/`):
   - Mobile-first breakpoints
   - CSS Modules for component scoping

2. **Accessibility**:
   - ARIA labels on form inputs
   - Keyboard navigation (Tab, Enter, Escape)
   - Screen reader announcements for actions

3. **Edge Cases**:
   - Empty states ("No expenses yet")
   - Error handling (localStorage quota exceeded)
   - Large datasets (10K expenses - verify performance)

4. **Documentation**:
   - JSDoc comments for all public functions
   - Update README.md with usage instructions

**Verification**:
```bash
npm run lint
npm test -- --coverage # Verify 80%+ coverage
npm run build # Ensure production build succeeds
```

---

## Development Workflow

### 1. Start Dev Server
```bash
npm run dev
# Opens http://localhost:3000 in browser
```

### 2. Run Tests (Watch Mode)
```bash
npm run test:watch
# Watches file changes, re-runs affected tests
```

### 3. Check Coverage
```bash
npm test
# Generates coverage report in coverage/
# Open coverage/lcov-report/index.html
```

### 4. Lint Code
```bash
npm run lint
# Fixes auto-fixable issues, reports violations
```

### 5. Build for Production
```bash
npm run build
# Outputs to frontend/dist/
npm run preview # Preview production build locally
```

---

## Key Files to Implement First

### 1. `src/models/Expense.js`
```javascript
export class Expense {
  constructor(data) {
    this.id = data.id || crypto.randomUUID();
    this.amount = data.amount;
    this.categoryId = data.categoryId || null;
    this.date = data.date || new Date().toISOString();
    this.description = data.description || '';
    this.createdAt = data.createdAt || new Date().toISOString();
    this.updatedAt = data.updatedAt || new Date().toISOString();
  }

  static validate(data) {
    if (!data.amount || data.amount <= 0) {
      throw new Error('Amount must be positive');
    }
    if (data.amount !== parseFloat(data.amount.toFixed(2))) {
      throw new Error('Amount can have max 2 decimal places');
    }
    if (data.description && data.description.length > 500) {
      throw new Error('Description too long (max 500 characters)');
    }
    return true;
  }
}
```

### 2. `src/services/LocalStorageAdapter.js`
```javascript
const STORAGE_KEY = 'expense-tracker:expenses';

export class LocalStorageAdapter {
  async create(expense) {
    const newExpense = new Expense(expense);
    Expense.validate(newExpense);

    const expenses = await this.getAll();
    expenses.push(newExpense);
    this._save(expenses);

    return newExpense;
  }

  async getAll() {
    const data = localStorage.getItem(STORAGE_KEY);
    return data ? JSON.parse(data) : [];
  }

  _save(expenses) {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(expenses));
    } catch (error) {
      if (error.name === 'QuotaExceededError') {
        throw new Error('Storage quota exceeded');
      }
      throw error;
    }
  }

  // ... implement remaining IExpenseRepository methods
}
```

### 3. `src/app.js`
```javascript
import React from 'react';
import { createRoot } from 'react-dom/client';
import { AppProvider } from './context/AppContext';
import Dashboard from './pages/Dashboard';

const root = createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <AppProvider>
      <Dashboard />
    </AppProvider>
  </React.StrictMode>
);
```

---

## Testing Strategy (Per Constitution Principle IV)

### Unit Tests
- **Target**: Models, services, utils
- **Coverage**: 90%+ for critical paths (CRUD, calculations)
- **Example**: `tests/unit/services/ExpenseService.test.js`

### Integration Tests
- **Target**: Components + services interaction
- **Coverage**: All user stories acceptance scenarios
- **Example**: `tests/integration/components/ExpenseForm.test.jsx`

### Contract Tests
- **Target**: Storage adapter interface compliance
- **Coverage**: All IExpenseRepository methods
- **Example**: `tests/contract/expense-repository.test.js`

**TDD Workflow**:
1. Write failing test
2. Implement minimum code to pass
3. Refactor for readability
4. Repeat

---

## Next Steps

1. **Complete Phase 0** (Foundation): Implement models, storage adapter, utils
2. **Run Contract Tests**: Verify LocalStorageAdapter conforms to interface
3. **Start Phase 1** (P1 User Story): Build ExpenseForm and ExpenseList
4. **Iterate**: Follow roadmap phases, marking todos complete with `/speckit.tasks`

**Ready to Start**: All planning artifacts complete. Proceed to implementation!

---

## Support Resources

- **Spec**: [spec.md](./spec.md)
- **Data Model**: [data-model.md](./data-model.md)
- **Contracts**: [contracts/storage-interface.md](./contracts/storage-interface.md)
- **Research**: [research.md](./research.md)
- **Constitution**: [../../.specify/memory/constitution.md](../../.specify/memory/constitution.md)

---

**Quickstart Complete**: Development environment ready for implementation.
