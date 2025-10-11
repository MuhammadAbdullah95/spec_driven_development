# Tasks: Daily Expense Tracker

**Input**: Design documents from `/specs/004-a-web-or/`
**Prerequisites**: plan.md ✅, spec.md ✅, research.md ✅, data-model.md ✅, contracts/storage-interface.md ✅

**Tests**: ✅ INCLUDED - TDD approach per Constitution Principle IV (NON-NEGOTIABLE)

**Organization**: Tasks grouped by user story to enable independent implementation and testing

**Tech Stack**: TypeScript 5.9.3 + React 18.2 + Vite 6.x + Recharts 3.2.1 + Vitest 3.2.4 + Playwright 1.56.0

## Format: `[ID] [P?] [Story] Description`
- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (US1, US2, US3)
- Include exact file paths in descriptions

## Path Conventions
Based on plan.md, this is a **frontend SPA** project:
- Source code: `src/` (TypeScript + React + Vite)
- Tests: `tests/{unit,integration,contract,e2e}/`

---

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Project initialization with Vite + TypeScript + React

- [ ] T001 Create project with Vite: `npm create vite@latest expense-tracker-app -- --template react-ts` (creates TypeScript React project with Vite pre-configured)
- [ ] T002 Install core dependencies: recharts@3.2.1, dompurify@3.1.0, @types/dompurify
- [ ] T003 [P] Install testing dependencies: vitest@3.2.4, @vitest/ui@3.2.4, jsdom@24.0.0
- [ ] T004 [P] Install React Testing Library: @testing-library/react@16.3.0, @testing-library/dom@10.4.0, @testing-library/jest-dom@6.5.0, @testing-library/user-event@14.5.2
- [ ] T005 [P] Install Playwright: @playwright/test@1.56.0
- [ ] T006 Update vite.config.ts with test configuration (globals: true, environment: 'jsdom', setupFiles, coverage settings)
- [ ] T007 [P] Create tests/setup.ts with Vitest + jest-dom setup (extend expect with matchers, cleanup, mock localStorage)
- [ ] T008 [P] Create playwright.config.ts for E2E tests (testDir: './tests/e2e', Chromium/Firefox/WebKit browsers, webServer config)
- [ ] T009 Update package.json scripts: dev, build (tsc && vite build), test (vitest), test:ui, test:coverage, test:e2e, lint (eslint --ext .ts,.tsx)
- [ ] T010 [P] Configure ESLint for TypeScript + React (update .eslintrc or eslint.config.js)
- [ ] T011 [P] Configure Prettier for code formatting (.prettierrc)

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Core infrastructure that MUST be complete before ANY user story can be implemented

**⚠️ CRITICAL**: No user story work can begin until this phase is complete

- [ ] T012 [P] Create TypeScript interfaces in src/models/Expense.ts (interface Expense with all fields, validation rules as comments)
- [ ] T013 [P] Create TypeScript interfaces in src/models/Category.ts (interface Category with type field 'predefined' | 'custom')
- [ ] T014 [P] Create TypeScript interfaces in src/models/Summary.ts (PeriodSummary, CategoryBreakdown, SpendingSummary)
- [ ] T015 [P] Create utility functions in src/utils/dateUtils.ts (getWeekStart, getWeekEnd, getMonthStart, getMonthEnd per ISO 8601 Monday start)
- [ ] T016 [P] Create validation utilities in src/utils/validators.ts (validateAmount: positive & 2 decimals, validateCategoryName: 1-50 chars, validateDate: ISO 8601 & not future)
- [ ] T017 [P] Create formatter utilities in src/utils/formatters.ts (formatCurrency using Intl.NumberFormat USD, formatDate using Intl.DateTimeFormat)
- [ ] T018 Create storage interface in src/services/IExpenseRepository.ts (interface from contracts/storage-interface.md with all CRUD methods)
- [ ] T019 [P] Create category repository interface in src/services/ICategoryRepository.ts (interface from contracts/storage-interface.md)
- [ ] T020 Create constants file src/constants/predefinedCategories.ts with 6 predefined categories (id 'cat-001' to 'cat-006', names: Food, Transport, Entertainment, Bills, Shopping, Health)
- [ ] T021 [P] Create error classes in src/utils/errors.ts (RepositoryError class with code, message, details properties)

**Checkpoint**: Foundation ready - user story implementation can now begin in parallel

---

## Phase 3: User Story 1 - Record Daily Expense (Priority: P1) 🎯 MVP

**Goal**: Enable users to create, view, edit, and delete expense entries with localStorage persistence

**Independent Test**: Create expense → verify in list → close/reopen app → verify persists → edit expense → delete expense

### Tests for User Story 1 (TDD - Write FIRST, ensure FAIL)

- [ ] T022 [P] [US1] Unit test for Expense validation in tests/unit/models/Expense.test.ts (positive amount, 2 decimals, description max 500 chars, no future dates)
- [ ] T023 [P] [US1] Unit test for dateUtils in tests/unit/utils/dateUtils.test.ts (ISO 8601 week boundaries Monday-Sunday, month boundaries)
- [ ] T024 [P] [US1] Unit test for validators in tests/unit/utils/validators.test.ts (validateAmount edge cases: 0, negative, 3 decimals; validateDate)
- [ ] T025 [P] [US1] Contract test for LocalStorageAdapter.create() in tests/contract/LocalStorageAdapter.test.ts (generates UUID id, timestamps, persists to localStorage, validates)
- [ ] T026 [P] [US1] Contract test for LocalStorageAdapter.getAll() in tests/contract/LocalStorageAdapter.test.ts (returns all expenses sorted by date DESC, handles empty)
- [ ] T027 [P] [US1] Contract test for LocalStorageAdapter.update() in tests/contract/LocalStorageAdapter.test.ts (updates updatedAt, persists changes, validates)
- [ ] T028 [P] [US1] Contract test for LocalStorageAdapter.delete() in tests/contract/LocalStorageAdapter.test.ts (removes from storage, throws if not found)
- [ ] T029 [P] [US1] Integration test for ExpenseForm component in tests/integration/components/ExpenseForm.test.tsx (renders, validates input, submits, shows errors)
- [ ] T030 [P] [US1] Integration test for ExpenseList component in tests/integration/components/ExpenseList.test.tsx (displays expenses sorted, edit/delete actions work)
- [ ] T031 [US1] E2E test for User Story 1 acceptance in tests/e2e/user-story-1.spec.ts (create expense → list → reload → persist → edit → delete, Playwright)

### Implementation for User Story 1

- [ ] T032 [US1] Implement Expense model class in src/models/Expense.ts with validation methods (validate(), constructor with defaults for id via crypto.randomUUID(), createdAt, updatedAt)
- [ ] T033 [US1] Implement LocalStorageAdapter in src/services/LocalStorageAdapter.ts implementing IExpenseRepository (create, getAll, getById, update, delete with schema versioning, 5s TTL caching, QuotaExceededError handling per research.md)
- [ ] T034 [US1] Implement ExpenseService in src/services/ExpenseService.ts (business logic: createExpense, updateExpense, deleteExpense, getExpenses using LocalStorageAdapter)
- [ ] T035 [P] [US1] Create ExpenseForm component in src/components/expense/ExpenseForm.tsx (amount input type=number, category dropdown, date input type=datetime-local, description textarea, validation display, submit/cancel buttons)
- [ ] T036 [P] [US1] Create ExpenseListItem component in src/components/expense/ExpenseListItem.tsx (display single expense with format: amount currency, category name, date formatted, description truncated, edit/delete icon buttons)
- [ ] T037 [US1] Create ExpenseList component in src/components/expense/ExpenseList.tsx (renders list of ExpenseListItem sorted by date DESC, handles edit/delete callbacks, passes data from props)
- [ ] T038 [US1] Create Dashboard page in src/pages/Dashboard.tsx (ExpenseForm at top + ExpenseList below, manages local state, connects to ExpenseService, handles create/update/delete)
- [ ] T039 [P] [US1] Create common Button component in src/components/common/Button.tsx (reusable with variants: primary, secondary, danger; disabled state; onClick handler; TypeScript props)
- [ ] T040 [P] [US1] Create common Input component in src/components/common/Input.tsx (text/number/date types, label, error display, validation styling, TypeScript props)
- [ ] T041 [P] [US1] Create common Modal component in src/components/common/Modal.tsx (dialog overlay, close on Escape/click outside, children render, TypeScript props)
- [ ] T042 [US1] Update src/main.tsx to render Dashboard page (replace default App component)
- [ ] T043 [US1] Add CSS modules for ExpenseForm (src/components/expense/ExpenseForm.module.css) - responsive grid layout, mobile-first breakpoints
- [ ] T044 [US1] Add CSS modules for ExpenseList (src/components/expense/ExpenseList.module.css) - card layout for list items, responsive
- [ ] T045 [US1] Implement empty state for ExpenseList (show "No expenses recorded yet" with add button when expenses.length === 0 per FR-018)
- [ ] T046 [US1] Implement delete confirmation modal using common Modal component (show before delete, "Are you sure?" text per FR-007)
- [ ] T047 [US1] Add error boundaries in src/components/common/ErrorBoundary.tsx to catch and display React errors gracefully

**Checkpoint**: At this point, User Story 1 should be fully functional and testable independently. Users can create, view, edit, delete expenses with persistence.

---

## Phase 4: User Story 2 - Categorize Expenses (Priority: P2)

**Goal**: Enable users to create custom categories, manage category lifecycle, and filter expenses by category

**Independent Test**: Create custom category → assign to expense → filter by category → rename category → delete category with reassignment dialog

### Tests for User Story 2 (TDD - Write These FIRST) ⚠️

- [ ] T038 [P] [US2] Contract test for LocalStorageAdapter category methods in frontend/tests/contract/category-repository.test.js: verify create, update, delete, getAll, nameExists, initializePredefined
- [ ] T039 [P] [US2] Unit test for CategoryService.createCategory in frontend/tests/unit/services/CategoryService.test.js: verify unique name validation (case-insensitive), reserved name check ("Uncategorized")
- [ ] T040 [P] [US2] Unit test for CategoryService.deleteCategory in frontend/tests/unit/services/CategoryService.test.js: verify prevents deleting predefined categories, checks expense count, triggers reassignment if needed
- [ ] T041 [P] [US2] Integration test for CategoryManager component in frontend/tests/integration/components/CategoryManager.test.jsx: verify add/edit/delete flows, reassignment dialog on delete with expenses

### Implementation for User Story 2

- [ ] T042 Create CategoryService in frontend/src/services/CategoryService.js: methods createCategory (validate unique name), updateCategory (rename with unique check), deleteCategory (check predefined type, check expense count), getAll, nameExists, initializePredefined (idempotent)
- [ ] T043 Create CategoryManager component in frontend/src/components/CategoryManager.jsx: lists all categories (predefined + custom), add button, edit/delete buttons (disabled for predefined), integrates with AppContext
- [ ] T044 Create CategoryForm component in frontend/src/components/CategoryForm.jsx: input for category name, validation for uniqueness and reserved names, submit handler calling CategoryService.createCategory or updateCategory
- [ ] T045 Create CategoryDeleteDialog component in frontend/src/components/CategoryDeleteDialog.jsx: modal with two radio options (reassign to category dropdown, mark as uncategorized), no default selection, submit calls ExpenseService.bulkUpdateCategory then CategoryService.deleteCategory (FR-009)
- [ ] T046 [US2] Update ExpenseForm category dropdown in frontend/src/components/ExpenseForm.jsx: include custom categories from context state, add "Uncategorized" option (null value), sorted alphabetically
- [ ] T047 [US2] Add category filter to ExpenseList in frontend/src/components/ExpenseList.jsx: dropdown to filter by category (including "Uncategorized" option for null categoryId), updates displayed expenses (FR-011)
- [ ] T048 [US2] Update ExpenseList to display category name in frontend/src/components/ExpenseListItem.jsx: show category.name or "Uncategorized" for null categoryId, handle case where category was deleted
- [ ] T049 [US2] Add duplicate category name error handling in CategoryForm (FR-019): show "A category with this name already exists" when nameExists returns true (case-insensitive)

**Checkpoint**: At this point, User Stories 1 AND 2 should both work independently. Users can manage custom categories and filter expenses.

---

## Phase 5: User Story 3 - View Spending Summaries (Priority: P3)

**Goal**: Enable users to view aggregated spending analytics with visual charts (pie/bar/line) and drill-down capability

**Independent Test**: Create expenses across dates/categories → view summary dashboard → see today/week/month totals → toggle pie/bar chart → drill down to expense list

### Tests for User Story 3 (TDD - Write These FIRST) ⚠️

- [ ] T050 [P] [US3] Unit test for AnalyticsService.getTotalsByPeriod in frontend/tests/unit/services/AnalyticsService.test.js: verify today/week/month calculations with ISO 8601 Monday-start weeks, custom date range support
- [ ] T051 [P] [US3] Unit test for AnalyticsService.getCategoryBreakdown in frontend/tests/unit/services/AnalyticsService.test.js: verify calculates totals per category, includes "Uncategorized" for null categoryId, calculates percentages, sorts by amount DESC
- [ ] T052 [P] [US3] Unit test for date range filtering in frontend/tests/unit/services/AnalyticsService.test.js: verify findByDateRange returns expenses within inclusive range
- [ ] T053 [P] [US3] Integration test for SummaryPage in frontend/tests/integration/pages/SummaryPage.test.jsx: verify period selector updates charts, chart toggle switches views, drill-down navigation

### Implementation for User Story 3

- [ ] T054 Create AnalyticsService in frontend/src/services/AnalyticsService.js: methods getTotalsByPeriod (today/week/month/custom using dateHelpers), getCategoryBreakdown (aggregates by categoryId, calculates percentages, handles null as "Uncategorized"), getSpendingTrends (group expenses by date for line chart)
- [ ] T055 [P] [US3] Create PieChart component in frontend/src/components/Charts/PieChart.jsx: uses Chart.js pie chart, displays category breakdown data, click handler for drill-down
- [ ] T056 [P] [US3] Create BarChart component in frontend/src/components/Charts/BarChart.jsx: uses Chart.js bar chart (horizontal or vertical), displays category breakdown data, click handler for drill-down
- [ ] T057 [P] [US3] Create LineChart component in frontend/src/components/Charts/LineChart.jsx: uses Chart.js line chart, displays spending over time, click handler for drill-down to date range
- [ ] T058 Create ChartToggle component in frontend/src/components/Charts/ChartToggle.jsx: buttons to toggle between pie and bar chart views (FR-016), manages local state for active chart type
- [ ] T059 Create SummaryPage page in frontend/src/pages/SummaryPage.jsx: period selector (today/week/month/custom date range), displays totals, renders ChartToggle + active chart component, renders LineChart for spending over time
- [ ] T060 [US3] Add drill-down functionality in SummaryPage: onClick handlers in charts navigate to ExpenseList with pre-applied filters (category or date range) using React Router or state
- [ ] T061 [US3] Add custom date range picker in SummaryPage (FR-015): two date inputs (start/end), submit button to filter summary, validates start ≤ end
- [ ] T062 [US3] Update Dashboard to show summary cards in frontend/src/pages/Dashboard.jsx: display today/week/month total amounts using AnalyticsService.getTotalsByPeriod (FR-013)
- [ ] T063 [US3] Add chart lazy loading in app.js: use React.lazy and Suspense to code-split chart components (PieChart, BarChart, LineChart) for faster initial load

**Checkpoint**: All user stories should now be independently functional. Users can track expenses, manage categories, and view analytics.

---

## Phase 6: Polish & Cross-Cutting Concerns

**Purpose**: Improvements that affect multiple user stories, responsive design, accessibility

- [ ] T064 [P] Create CSS Modules for components in frontend/src/styles/: ExpenseForm.module.css, ExpenseList.module.css, CategoryManager.module.css, SummaryPage.module.css with mobile-first responsive breakpoints (@media min-width: 768px, 1024px)
- [ ] T065 [P] Add ARIA labels and roles to all form inputs in ExpenseForm, CategoryForm: use aria-label, aria-required, aria-invalid for accessibility (Principle III)
- [ ] T066 [P] Add keyboard navigation support: Tab order, Enter to submit forms, Escape to close modals (CategoryDeleteDialog)
- [ ] T067 [P] Create reusable Button component in frontend/src/components/common/Button.jsx: primary/secondary variants, disabled state, onClick handler
- [ ] T068 [P] Create reusable Modal component in frontend/src/components/common/Modal.jsx: backdrop, close button, keyboard Escape handler, used by CategoryDeleteDialog and confirmation dialogs
- [ ] T069 [P] Create reusable Input component in frontend/src/components/common/Input.jsx: text/number/date types, validation state (error/success), help text
- [ ] T070 Add date range filter to ExpenseList (FR-012): two date inputs (start/end), filter button, integrates with LocalStorageAdapter.findByDateRange
- [ ] T071 Add search by description to ExpenseList (FR-020): text input, search button, integrates with LocalStorageAdapter.searchByDescription
- [ ] T072 [P] Add localStorage quota warning: check storage usage, show warning at 80% capacity (estimate 5MB), use StorageManager API or estimate from JSON.stringify length
- [ ] T073 [P] Add error handling for localStorage QuotaExceededError in LocalStorageAdapter: try-catch on setItem, throw RepositoryError with user-friendly message
- [ ] T074 [P] Add error handling for data corruption in LocalStorageAdapter: try-catch on JSON.parse, fallback to empty array or reset to defaults with user notification
- [ ] T075 Add loading states to Dashboard and SummaryPage: show spinner while data loading, use context state ui.loading
- [ ] T076 [P] Add performance optimization with React.memo: memoize ExpenseListItem, ChartToggle, summary cards to prevent unnecessary re-renders
- [ ] T077 [P] Add performance optimization with useMemo: memoize expensive calculations in AnalyticsService calls (getTotalsByPeriod, getCategoryBreakdown) in SummaryPage
- [ ] T078 [P] Add JSDoc documentation to all public functions in models, services, utils: function purpose, @param types, @returns types
- [ ] T079 Run quickstart.md validation: verify all setup steps work, npm scripts execute correctly, tests pass, build succeeds

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies - can start immediately
- **Foundational (Phase 2)**: Depends on Setup completion - BLOCKS all user stories
- **User Stories (Phase 3-5)**: All depend on Foundational phase completion
  - User Story 1 (Phase 3): Can start after Foundational - No dependencies on other stories
  - User Story 2 (Phase 4): Can start after Foundational - No dependencies on other stories (independent)
  - User Story 3 (Phase 5): Can start after Foundational - No dependencies on other stories (independent)
- **Polish (Phase 6)**: Depends on all desired user stories being complete

### User Story Dependencies

- **User Story 1 (P1)**: Can start after Foundational (Phase 2) - No dependencies on other stories
- **User Story 2 (P2)**: Can start after Foundational (Phase 2) - Independent (categories pre-exist from Foundation)
- **User Story 3 (P3)**: Can start after Foundational (Phase 2) - Independent (uses existing expense/category data)

**Key Insight**: All three user stories are independent and can be worked on in parallel by different team members once Foundation completes!

### Within Each User Story

- Tests (TDD) MUST be written and FAIL before implementation
- Models before services (Foundation handles this)
- Services before components
- Components before pages
- Core implementation before integration/polish

### Parallel Opportunities

- **Setup (Phase 1)**: All T003-T014 marked [P] can run in parallel (different config files)
- **Foundational (Phase 2)**: T015-T019 marked [P] can run in parallel (different utility files)
- **User Story 1 Tests**: T023-T028 marked [P] can run in parallel (different test files)
- **User Story 2 Tests**: T038-T041 marked [P] can run in parallel (different test files)
- **User Story 3 Tests**: T050-T053 marked [P] can run in parallel (different test files)
- **User Story 3 Charts**: T055-T057 marked [P] can run in parallel (three independent chart components)
- **Polish Phase**: Many tasks marked [P] can run in parallel (CSS, accessibility, documentation)

---

## Parallel Example: User Story 1 Tests

```bash
# Launch all tests for User Story 1 together (TDD):
Task: "Contract test for LocalStorageAdapter.create in frontend/tests/contract/expense-repository.test.js"
Task: "Contract test for LocalStorageAdapter.getAll in frontend/tests/contract/expense-repository.test.js"
Task: "Contract test for LocalStorageAdapter.update in frontend/tests/contract/expense-repository.test.js"
Task: "Contract test for LocalStorageAdapter.delete in frontend/tests/contract/expense-repository.test.js"
Task: "Unit test for ExpenseService.createExpense in frontend/tests/unit/services/ExpenseService.test.js"
Task: "Integration test for ExpenseForm component in frontend/tests/integration/components/ExpenseForm.test.jsx"

# After tests fail, launch implementation tasks sequentially (T029-T037)
```

---

## Implementation Strategy

### MVP First (User Story 1 Only)

1. Complete Phase 1: Setup (T001-T014)
2. Complete Phase 2: Foundational (T015-T022) - CRITICAL blocking phase
3. Complete Phase 3: User Story 1 (T023-T037)
4. **STOP and VALIDATE**: Test User Story 1 independently
   - Create expenses → verify persistence → edit/delete → confirm works
   - Run `npm test` to verify all US1 tests pass
   - Run `npm run dev` for manual browser testing
5. Deploy/demo MVP if ready

### Incremental Delivery (All User Stories)

1. Complete Setup + Foundational → Foundation ready
2. Add User Story 1 (T023-T037) → Test independently → Deploy/Demo (MVP! ✅)
3. Add User Story 2 (T038-T049) → Test independently → Deploy/Demo
4. Add User Story 3 (T050-T063) → Test independently → Deploy/Demo
5. Add Polish (T064-T079) → Final release
6. Each story adds value without breaking previous stories

### Parallel Team Strategy

With multiple developers once Foundational completes:

**Team Member A**: User Story 1 (T023-T037) - Core CRUD
**Team Member B**: User Story 2 (T038-T049) - Categories
**Team Member C**: User Story 3 (T050-T063) - Analytics

Stories complete and integrate independently without conflicts!

---

## Notes

- **[P] tasks**: Different files, no dependencies, safe to parallelize
- **[Story] labels**: Map tasks to user stories for traceability
- **TDD Workflow**: Tests (T023-T028, T038-T041, T050-T053) MUST be written first and fail before implementation
- **Foundation is critical**: Phase 2 must complete before any user story work begins
- **Independent stories**: Each user story can be implemented, tested, and deployed independently
- **Checkpoint validation**: Stop after each user story phase to test independently before proceeding
- **Constitution compliance**: Testing is mandatory (Principle IV), modular structure (Principle I), extensible design (Principle V)
- Commit after each task or logical group
- Avoid: vague tasks, same file conflicts, cross-story dependencies that break independence

---

**Total Tasks**: 79
**User Story 1 (P1)**: 15 tasks (T023-T037) - MVP
**User Story 2 (P2)**: 12 tasks (T038-T049)
**User Story 3 (P3)**: 14 tasks (T050-T063)
**Setup**: 14 tasks (T001-T014)
**Foundation**: 8 tasks (T015-T022)
**Polish**: 16 tasks (T064-T079)
