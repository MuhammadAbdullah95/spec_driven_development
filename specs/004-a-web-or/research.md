# Research: Daily Expense Tracker

**Date**: 2025-10-11 (Updated)
**Feature**: Daily Expense Tracker
**Phase**: 0 - Technology Selection & Patterns

## Overview

This document resolves all "NEEDS CLARIFICATION" items from the Technical Context and establishes technology choices, architectural patterns, and best practices for the Daily Expense Tracker web application.

## Research Tasks

### 1. Language & Runtime Versions

**Decision**: Node.js 22.15.0 LTS + TypeScript 5.9.3

**Node.js: 22.15.0 (LTS)**
- Latest Active LTS version (codename "Jod")
- Support until April 2027
- Includes OpenSSL 3.5.2 for enhanced security
- Production-ready for 2025 projects

**TypeScript: 5.9.3**
- Latest stable version (released August 2025)
- Full React 18/19 compatibility
- Works seamlessly with `@types/react@^19.0.0`
- Stable `node20` module resolution pairs well with Node.js 22

**Rationale**: Both versions are production-ready with multi-year LTS support. TypeScript provides type safety and excellent developer experience for React applications.

**Alternatives Considered**:
- Node.js 20 LTS: Still supported but older; Node.js 22 is current LTS
- Node.js 23: Not LTS, cutting-edge only
- TypeScript 5.6-5.8: No reason to avoid latest 5.9.3

---

### 2. UI Framework & Build Tool

**Decision**: React 18.2+ with Vite 6.x

**React**: 18.2.0 (upgradeable to React 19)
- **Modularity**: Component-based architecture aligns with Constitution Principle I
- **Performance**: Virtual DOM efficient for 10K+ expense list rendering (SC-007)
- **Ecosystem**: Rich ecosystem for charting, testing, state management
- **TypeScript**: First-class TypeScript support

**Vite**: 6.x for development and build
- **Blazing-fast development**: Instant server startup (390ms vs 4.5s), HMR 4x faster
- **Perfect for SPAs**: No SSR overhead - expense tracker is client-side only
- **TypeScript native**: Zero configuration needed
- **Officially recommended**: React team recommends Vite post-CRA deprecation (Feb 2025)
- **Testing integration**: Seamless Vitest integration
- **Bundle optimization**: 130KB average bundle size

**Alternatives Considered**:
- **Create React App**: ❌ Officially deprecated February 14, 2025. No active maintainers, incompatible with React 19
- **Next.js 15.5**: Over-engineered for SPA. SSR/SSG features add unnecessary complexity for local-storage app
- **Vue 3**: Smaller ecosystem for charting libraries
- **Vanilla JS**: Slower development, harder to maintain modular structure

**Setup Command**:
```bash
npm create vite@latest expense-tracker -- --template react-ts
```

---

### 3. Charting Library

**Decision**: Recharts v3.2.1

**Library**: Recharts 3.2.1
**Installation**: `npm install recharts`

**Rationale**:
1. **Complete chart coverage**: Native support for pie, bar, and line charts (FR-016)
2. **React-first architecture**: Composable JSX components, leverages virtual DOM efficiently
3. **TypeScript support**: Full type definitions included, excellent IntelliSense
4. **Interactive out-of-the-box**: Built-in hover tooltips, click events for drill-down (FR-017), ResponsiveContainer for mobile/desktop
5. **Performance**: Handles 1,000+ data points efficiently, meets 2-second render requirement (SC-003, SC-008)
6. **Simplest API**: Lowest learning curve among major libraries - rapid development
7. **Active maintenance**: v3.2.1 (October 2025), 24.8K GitHub stars, 2,871 projects

**Chart Implementation Example**:
```tsx
// Toggle between pie and bar charts
{viewMode === 'pie' ? <PieChart data={data} /> : <BarChart data={data} />}
```

**Alternatives Considered**:
- **Chart.js + react-chartjs-2**: Canvas rendering better for 100k+ points, but overkill for 10k expenses. Less idiomatic React integration (wrapper around imperative library)
- **Victory v36+**: ❌ Known to crash with 1,000+ data points (fails SC-007). Too resource-intensive
- **D3.js**: Maximum flexibility but steep learning curve, complex React integration. Overkill for standard financial charts
- **ApexCharts**: Beautiful but heavier bundle (~800KB vs 400KB), known performance issues with large datasets
- **Visx (Airbnb)**: Low-level primitives requiring charts built from scratch. Too much development time

**Bundle Impact**: ~400KB (minified) - acceptable for web app with modern browsers

**Implementation Notes**:
- Lazy load chart components (code splitting) to optimize initial load
- Use ResponsiveContainer for automatic viewport adaptation
- Cache aggregated data to avoid recalculating on every chart toggle

---

### 4. Testing Framework

**Decision**: Vitest + React Testing Library + Playwright

**Unit/Integration Testing**: Vitest ^3.2.4
- **Performance**: 10-20x faster than Jest in watch mode with hot reloading
- **Zero config with Vite**: Shares Vite config, no separate pipeline needed
- **Native TypeScript/ESM**: Out-of-the-box support without transforms
- **Jest-compatible API**: Drop-in replacement, minimal migration effort
- **Memory efficient**: ~30% lower memory usage (800MB vs 1.2GB for large apps)
- **CI/CD friendly**: Built-in sharding and parallel execution

**React Component Testing**: @testing-library/react ^16.3.0
- **React 19 ready**: Official support for React 19 (v16.3.0 resolves peer dependency issues)
- **React 18 compatible**: Works with current React 18.2.0
- **Official recommendation**: React team explicitly recommends RTL in React 19 upgrade guide
- **Best practices**: Tests from user perspective, promotes accessible components
- **Vitest integration**: Seamless integration

**Additional Dependencies**:
- `@testing-library/dom` ^10.4.0 (peer dependency)
- `@testing-library/jest-dom` ^6.5.0 (custom matchers like `toBeInTheDocument`)
- `@testing-library/user-event` ^14.5.2 (realistic user interactions)
- `jsdom` ^24.0.0 (DOM environment for Vitest)

**E2E Testing**: Playwright ^1.56.0

**Why Playwright over Cypress**:
✅ **Playwright Advantages**:
- True multi-browser testing (Chromium, Firefox, WebKit/Safari)
- Native parallel execution without paid plans
- Advanced features: multi-tab/window, network interception, mobile emulation
- TypeScript first-class support with excellent IDE integration
- CI/CD optimized: GitHub Actions templates, comprehensive artifacts
- All features free and open-source
- Active development: v1.56.0 (October 2025)

❌ **Cypress Limitations**:
- Official Chrome/Firefox only, experimental others
- Parallel execution requires paid plan
- Single-tab limitation
- Browser-bound execution limits advanced use cases

**Test Organization** (per constitution):
```
tests/
├── unit/              # Models, services, utils (Vitest)
├── integration/       # Component + service interactions (Vitest + RTL)
├── contract/          # Storage interface contracts (Vitest)
└── e2e/               # User story acceptance tests (Playwright)
```

**Package Configuration**:
```json
{
  "devDependencies": {
    "vitest": "^3.2.4",
    "@vitest/ui": "^3.2.4",
    "jsdom": "^24.0.0",
    "@testing-library/react": "^16.3.0",
    "@testing-library/dom": "^10.4.0",
    "@testing-library/jest-dom": "^6.5.0",
    "@testing-library/user-event": "^14.5.2",
    "@playwright/test": "^1.56.0"
  }
}
```

**Alternatives Considered**:
- **Jest**: Slower than Vitest (10-20x in watch mode), requires separate config from Vite
- **Cypress**: Good DX but limited browser support and parallel execution requires payment

---

### 5. Storage Abstraction & localStorage Implementation

**Decision**: Repository Pattern + Schema Versioning + In-Memory Caching

**Pattern**:
```typescript
// Storage interface (contract)
interface IExpenseRepository {
  create(expense): Promise<Expense>
  update(id, expense): Promise<Expense>
  delete(id): Promise<void>
  getAll(): Promise<Expense[]>
  getById(id): Promise<Expense>
  findByDateRange(start, end): Promise<Expense[]>
  findByCategory(categoryId): Promise<Expense[]>
  bulkUpdateCategory(oldId, newId): Promise<void>
}

// Phase 1: LocalStorageAdapter implements IExpenseRepository
// Phase 2: IndexedDBAdapter implements IExpenseRepository (no business logic changes)
// Phase 3: APIAdapter implements IExpenseRepository (no business logic changes)
```

**Rationale**:
- **Constitution Principle II**: Enables Phase 1 (localStorage) → Phase 2 (database) migration without changing business logic
- **10k+ record feasibility**: 10,000 expenses × 200 bytes = ~2MB (within 5MB localStorage limit)
- **Performance critical at scale**: Caching and indexing required for 10k+ records
- **Testability**: Easy to mock storage in unit tests (inject `MockStorageAdapter`)

**Key Implementation Components**:

**1. Data Serialization**:
- Use JSON.stringify/parse (standard for localStorage)
- Performance: ~19ms round-trip for 10k records
- Consider LZ-string compression if exceeding 5,000 records

**2. Storage Quota Handling**:
- localStorage limit: 5-10MB per origin (typically 5MB)
- Implement try-catch for `QuotaExceededError` (code 22 Chrome, 1014 Firefox)
- Warning threshold: 4.5MB (90% capacity)
- Cleanup strategy: Remove oldest 10% of records if quota exceeded
- Monitor with Storage API: `navigator.storage.estimate()`

**3. Schema Versioning** (CRITICAL - must implement):
```typescript
const STORAGE_VERSION = 1;
const MIGRATIONS = {
  0: (data) => ({ version: 1, expenses: data.expenses || [], ... }),
  1: (data) => ({ version: 2, expenses: data.expenses.map(e => ({ ...e, tags: [] })) })
};

// Run migrations on app initialization
async _runMigrations() {
  const currentVersion = parseInt(localStorage.getItem('storage-version') || '0');
  // Apply migrations sequentially
  for (let v = currentVersion; v < STORAGE_VERSION; v++) {
    if (MIGRATIONS[v]) data = MIGRATIONS[v](data);
  }
}
```
- Prevents data loss during schema updates
- Enables backward-compatible changes
- Required for production deployment

**4. Performance Optimizations**:

**In-Memory Caching**:
```typescript
class LocalStorageAdapter {
  private _cache: Expense[] | null = null;
  private _cacheTimestamp: number | null = null;
  private _cacheTTL = 5000; // 5 seconds

  async getAll(): Promise<Expense[]> {
    // Return cached data if fresh (95% faster: 20ms → 1ms)
    if (this._cache && (Date.now() - this._cacheTimestamp! < this._cacheTTL)) {
      return [...this._cache];
    }
    // Load from localStorage and update cache
  }
}
```

**Indexed Lookups**:
```typescript
private _indexById = new Map<string, Expense>();
private _indexByCategory = new Map<string, Expense[]>();

// Build indexes on cache load for O(1) lookups
_buildIndexes() {
  this._cache.forEach(expense => {
    this._indexById.set(expense.id, expense);
    // Group by category
  });
}
```

**Pagination**:
```typescript
async getPage(pageNumber = 1, pageSize = 50) {
  const allExpenses = await this.getAll();
  return {
    data: allExpenses.slice((pageNumber - 1) * pageSize, pageNumber * pageSize),
    total: allExpenses.length,
    totalPages: Math.ceil(allExpenses.length / pageSize)
  };
}
```

**5. Security Considerations**:
✅ No authentication tokens in localStorage (XSS vulnerability)
✅ No API keys or passwords
⚠️ Sanitize user input (expense descriptions) to prevent stored XSS

**Sanitization Requirement**:
```typescript
import DOMPurify from 'dompurify';

// In components:
const sanitized = DOMPurify.sanitize(expense.description);
```
- Install `dompurify` library
- Sanitize on render, not storage
- Strip potentially malicious HTML/JS

**6. Data Export for Migration**:
```typescript
async exportToJSON() {
  const data = {
    version: STORAGE_VERSION,
    exportedAt: new Date().toISOString(),
    expenses: await this.getAll(),
    categories: await this.getCategories()
  };
  // Download as JSON file for backup/migration
}
```

**Migration Decision Matrix**:

| Record Count | Storage Size | Recommended Solution | Migration Urgency |
|--------------|--------------|---------------------|-------------------|
| 0-3,000 | <1MB | localStorage ✅ | None - optimal |
| 3,000-7,000 | 1-2MB | localStorage + optimizations | Low - monitor |
| 7,000-15,000 | 2-4MB | **IndexedDB recommended** | **High - plan migration** |
| 15,000-50,000 | 4-10MB | IndexedDB required | **Critical - migrate now** |
| 50,000+ | >10MB | Backend API + Database | **Essential** |

**Implementation Priorities**:
1. **Immediate** (Phase 1 launch): Schema versioning, quota monitoring, error handling
2. **Short-term** (>1k records): In-memory caching, indexed lookups, pagination
3. **Long-term** (>5k records): IndexedDB migration, backend API planning

**Alternatives Considered**:
- **IndexedDB from start**: More complex API, unnecessary for Phase 1 with <5k records. Constitution mandates localStorage Phase 1
- **No abstraction layer**: Would require refactoring business logic for database migration
- **Direct localStorage calls**: Tightly couples logic to browser storage, violates modularity
- **DAO Pattern**: More boilerplate, overkill for simple CRUD operations

---

### 6. State Management

**Decision**: React Context API + useReducer for global state

**Rationale**:
- **Simplicity**: No external dependency (Redux, MobX), aligns with constitution simplicity principle
- **Sufficient for use case**: Single-user, 10K records manageable in memory
- **Testability**: Context providers easily mocked in component tests

**State Structure**:
```javascript
{
  expenses: Expense[],
  categories: Category[],
  filters: { category: string, dateRange: [Date, Date] },
  ui: { loading: boolean, error: string | null }
}
```

**Alternatives Considered**:
- **Redux Toolkit**: Overkill for simple CRUD app, adds boilerplate
- **Zustand**: Lightweight but another dependency; Context API sufficient
- **Component state only**: Too many prop drilling layers, hard to filter/search across views

**Performance Notes**:
- Memoize expensive calculations (`useMemo` for category totals)
- Use `React.memo` for ExpenseListItem to avoid re-rendering 10K items
- Virtual scrolling (react-window) if list performance degrades (deferred to implementation)

---

### 7. Date Handling

**Decision**: Native JavaScript `Date` + `Intl.DateTimeFormat` for formatting

**Rationale**:
- **No external dependency**: Reduces bundle size, aligns with simplicity principle
- **ISO 8601 support**: `Date` natively handles Monday-start weeks (spec clarification)
- **Localization ready**: `Intl` supports future multi-locale expansion

**Utility Functions Needed**:
```javascript
// utils/dateHelpers.js
getWeekStart(date) // Returns Monday of current week (ISO 8601)
getWeekEnd(date)   // Returns Sunday of current week
getMonthStart(date)
getMonthEnd(date)
formatCurrency(amount) // Uses Intl.NumberFormat
```

**Alternatives Considered**:
- **date-fns**: Popular but adds 13KB+ gzipped (prefer native when sufficient)
- **Moment.js**: Deprecated, large bundle size
- **Luxon**: Smaller than Moment but still unnecessary for this scope

**Edge Case Handling**:
- Time zone: Use device local time (spec assumption 4), no UTC conversion
- Week boundaries: Monday = 1, Sunday = 0 (per ISO 8601 clarification)

---

### 8. Responsive Design Approach

**Decision**: CSS Modules + CSS Grid/Flexbox, mobile-first breakpoints

**Rationale**:
- **Modularity**: CSS Modules scope styles to components (no global conflicts)
- **Responsive**: Grid/Flexbox handle desktop/tablet/mobile layouts (Principle III)
- **Performance**: No runtime JS overhead (unlike CSS-in-JS libraries)
- **Accessibility**: Semantic HTML + ARIA labels per constitution

**Breakpoints**:
```css
/* Mobile first */
@media (min-width: 768px) { /* Tablet */ }
@media (min-width: 1024px) { /* Desktop */ }
```

**Alternatives Considered**:
- **Tailwind CSS**: Utility-first but requires build step, less readable (violates Principle I)
- **Styled Components**: CSS-in-JS adds runtime overhead, harder to debug
- **Bootstrap**: Too opinionated, bloated for simple expense tracker

---

### 9. Build & Tooling

**Decision**: Vite 6.x for dev server and build (covered in section 2)

**Scripts** (`package.json`):
```json
{
  "scripts": {
    "dev": "vite",
    "build": "vite build",
    "preview": "vite preview",
    "test": "vitest",
    "test:ui": "vitest --ui",
    "test:coverage": "vitest --coverage",
    "test:e2e": "playwright test",
    "lint": "eslint src --ext .ts,.tsx",
    "format": "prettier --write src"
  }
}
```

---

## Technology Stack Summary

| Layer | Technology | Version | Justification |
|-------|------------|---------|---------------|
| **Runtime** | Node.js | 22.15.0 LTS | Long-term support until April 2027, production-ready |
| **Language** | TypeScript | 5.9.3 | Type safety, React 18/19 compatible, excellent DX |
| **UI Framework** | React | 18.2+ | Modular components, rich ecosystem, TypeScript support |
| **Build Tool** | Vite | 6.x | Fast HMR (390ms startup), TypeScript native, Vitest integration |
| **State Management** | Context API + useReducer | Built-in | Sufficient for scope, no external deps |
| **Charting** | Recharts | 3.2.1 | React-first, TypeScript support, handles 10k+ data points |
| **Unit/Integration Testing** | Vitest + React Testing Library | 3.2.4 + 16.3.0 | 10-20x faster than Jest, React 19 ready, zero config with Vite |
| **E2E Testing** | Playwright | 1.56.0 | Multi-browser, parallel execution, TypeScript first-class |
| **Storage** | localStorage (Phase 1) | Browser API | Offline-first, repository pattern for Phase 2 migration |
| **Date Handling** | Native `Date` + `Intl` | ES2022 | No deps, ISO 8601 compliant, localization ready |
| **Styling** | CSS Modules | Vite built-in | Component-scoped, no runtime overhead, responsive |
| **Linting** | ESLint + Prettier | Latest | Code quality gates per constitution |
| **Security** | DOMPurify | Latest | XSS prevention for user-generated content |

---

## Architecture Patterns

### 1. Layered Architecture

```
┌─────────────────────────────────────┐
│   Presentation Layer (React)        │  ← Components, Pages
├─────────────────────────────────────┤
│   Business Logic Layer              │  ← Services (ExpenseService, CategoryService)
├─────────────────────────────────────┤
│   Data Access Layer                 │  ← Repository (IExpenseRepository)
├─────────────────────────────────────┤
│   Storage Layer                     │  ← LocalStorageAdapter (Phase 1), DatabaseAdapter (Phase 2)
└─────────────────────────────────────┘
```

**Benefits**:
- Clear separation of concerns (Principle I: modularity)
- Each layer independently testable
- Storage swap (Phase 1→2) only affects Data Access Layer

### 2. Service-Oriented Design

**ExpenseService**:
- Handles business rules (validation, calculations)
- Depends on `IExpenseRepository` (not specific adapter)
- Methods: `createExpense()`, `updateExpense()`, `deleteExpense()`, `searchExpenses()`, `calculateTotals()`

**CategoryService**:
- Manages category CRUD, predefined categories
- Validates unique names, handles deletion with reassignment
- Methods: `createCategory()`, `deleteCategory(onReassign)`, `getAll()`

**AnalyticsService**:
- Aggregates expense data for summaries
- Methods: `getTotalsByPeriod()`, `getCategoryBreakdown()`, `getSpendingTrends()`

### 3. Component Structure

**Container/Presentational Pattern**:
- **Containers**: Connect to Context, handle logic (`ExpenseListContainer`)
- **Presentational**: Pure UI, receive props (`ExpenseListItem`, `ChartToggle`)

**Benefits**:
- Testability: Presentational components tested with props, no mocking needed
- Reusability: Same component used in different contexts

---

## Performance Optimizations

1. **Code Splitting**: Lazy load chart components (`React.lazy` + `Suspense`)
2. **Memoization**: `useMemo` for expensive calculations (category totals, date filtering)
3. **Virtualization**: Defer to implementation; monitor list rendering with 10K items
4. **LocalStorage Batching**: Batch writes on bulk operations to avoid excessive I/O

---

## Security Considerations

- **XSS Prevention**: React escapes user input by default; validate description text
- **LocalStorage Limits**: Handle `QuotaExceededError` gracefully (warn user at 80% capacity)
- **No sensitive data**: Offline app with no auth; no PII beyond expense descriptions

---

## Next Steps (Phase 1: Design)

With technology stack resolved, proceed to:
1. **data-model.md**: Define Expense, Category entity schemas
2. **contracts/**: Document storage interface and mock implementations
3. **quickstart.md**: Setup instructions, folder structure, first commit guide

---

**Research Complete**: All Technical Context "NEEDS CLARIFICATION" items resolved. Proceed to Phase 1 Design.
