# Implementation Plan: A Modern, Minimal To-Do List App

**Branch**: `002-a-modern-minimal` | **Date**: 2025-10-07 | **Spec**: [link to spec](../spec.md)
**Input**: Feature specification from `/specs/002-a-modern-minimal/spec.md`

**Note**: This template is filled in by the `/speckit.plan` command. See `.specify/templates/commands/plan.md` for the execution workflow.

## Summary

Implementing a modern, minimal, and responsive To-Do List App using vanilla TypeScript, HTML, CSS with a clean architecture that supports persistence via LocalStorage. The app will feature task management (add, edit, complete, delete, reorder), filtering, dark/light mode, and keyboard shortcuts. The architecture will be designed for future extensibility with subtasks and sync functionality.

## Technical Context

**Language/Version**: TypeScript 5.x with ES2022 features  
**Primary Dependencies**: Vite 5.x, Vitest for testing, Playwright for E2E testing, ESLint + Prettier for linting/formatting  
**Storage**: LocalStorage initially with an abstracted StorageService for future SQLite or backend integration  
**Testing**: Vitest for unit tests, Playwright for E2E tests  
**Target Platform**: Web browser (Chrome, Firefox, Safari, Edge)  
**Project Type**: Single web application - determines source structure  
**Performance Goals**: First meaningful paint under 1s on mid-tier device, remains responsive with 1000+ tasks  
**Constraints**: <150KB bundle size gzipped, WCAG AA accessibility compliance, offline-capable with persisted data  
**Scale/Scope**: Single user, local data only initially, designed for future multi-user sync

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

**Code Quality Check**: 
- Does the implementation follow project-wide style and formatting setup (ESLint + Prettier or equivalent)? ✓ CONFIRMED - Using ESLint and Prettier as specified
- Are modules small with single responsibility and clear directory structure? ✓ CONFIRMED - Structure separates models, services, components, utils as specified
- Is the public API minimal and documented? ✓ CONFIRMED - Well-defined interfaces in data model
- Does the code use clear naming and avoid deep nesting? ✓ CONFIRMED - TypeScript naming conventions with clear component responsibilities
- Is global mutable state avoided in favor of explicit state objects? ✓ CONFIRMED - Centralized Store with reactive updates, no global variables

**Testing Standards Check**:
- Will unit tests cover all business logic and core UI components? ✓ CONFIRMED - Using Vitest for unit tests as specified
- Do tests target 80% coverage on core logic modules? ✓ CONFIRMED - Testing plan includes coverage targets
- Will end-to-end tests cover main user flows: add task, edit task, complete task, delete task, drag-and-drop reordering, persistence across reload? ✓ CONFIRMED - Playwright tests planned for all main flows
- Are tests deterministic and not reliant on flaky timing? ✓ CONFIRMED - Using debounced persistence to avoid timing issues
- Will tests use test IDs for DOM selectors? ✓ CONFIRMED - Implementation plan includes test IDs

**User Experience Consistency Check**:
- Does the design establish and reuse design tokens for spacing, typography scale, and primary colors? ✓ CONFIRMED - CSS variables planned for theming and consistency
- Are interaction patterns consistent with single primary action per area? ✓ CONFIRMED - UI structure follows consistent patterns
- Does the feature provide clear empty states, loading states, and inline validation? ✓ CONFIRMED - Specification includes empty state messages
- Will drag-and-drop be discoverable and accessible (mouse, touch, keyboard alternatives)? ✓ CONFIRMED - Keyboard alternatives planned alongside drag-and-drop
- Is keyboard support available for navigation, toggling, and reordering? ✓ CONFIRMED - Keyboard navigation explicitly designed in

**Performance Requirements Check**:
- Is the implementation mindful of keeping runtime bundle minimal? ✓ CONFIRMED - Vanilla approach with minimal dependencies
- Does the feature target first meaningful paint under 1s on a mid-tier device with warm cache? ✓ CONFIRMED - Vite build and architecture designed for performance
- Does it avoid blocking the main thread? ✓ CONFIRMED - Debounced persistence and CSS animations

**Accessibility and Internationalization Check**:
- Does the feature use semantic HTML and appropriate ARIA where necessary? ✓ CONFIRMED - Architecture designed with semantic HTML principles
- Are all interactive controls reachable by keyboard? ✓ CONFIRMED - Keyboard navigation is a core requirement
- Does it ensure color contrast meets WCAG AA standards? ✓ CONFIRMED - Theme system includes contrast considerations
- Does it maintain separate markup and text to facilitate future translations? ✓ CONFIRMED - Design allows for i18n separation

*All constitutional requirements have been verified as met by the design.*

## Project Structure

### Documentation (this feature)

```
specs/002-a-modern-minimal/
├── plan.md              # This file (/speckit.plan command output)
├── research.md          # Phase 0 output (/speckit.plan command)
├── data-model.md        # Phase 1 output (/speckit.plan command)
├── quickstart.md        # Phase 1 output (/speckit.plan command)
├── contracts/           # Phase 1 output (/speckit.plan command)
└── tasks.md             # Phase 2 output (/speckit.tasks command - NOT created by /speckit.plan)
```

### Source Code (repository root)

```
src/
├── models/
│   └── Task.ts          # Task interface and related type definitions
├── services/
│   ├── Store.ts         # Centralized state management
│   └── StorageService.ts # LocalStorage abstraction
├── components/
│   ├── App.ts           # Main application component
│   ├── TaskItem.ts      # Individual task display/edit component
│   ├── TaskList.ts      # Task list container component
│   ├── TaskInput.ts     # Task creation input component
│   ├── Filters.ts       # Filter controls component
│   └── ThemeToggle.ts   # Dark/light mode toggle component
├── utils/
│   ├── dom.ts           # DOM manipulation utilities
│   ├── id.ts            # ID generation utilities
│   └── debounce.ts      # Debounce utility for persistence
├── styles/
│   ├── main.css         # Main stylesheet
│   └── themes.css       # Light/dark theme variables
└── index.ts             # Entry point

tests/
├── unit/
│   ├── Task.test.ts     # Task model tests
│   ├── Store.test.ts    # State management tests
│   └── StorageService.test.ts # Persistence tests
├── component/
│   ├── TaskItem.test.ts # TaskItem component tests
│   └── App.test.ts      # App component tests
└── e2e/
    └── todo-flow.spec.ts # End-to-end tests for main flows

contracts/               # API contracts (if any) - currently empty for client-only app
```

**Structure Decision**: Single project structure chosen since this is a client-side only application. The architecture separates concerns with models for data, services for business logic and persistence, components for UI, and utilities for common functions. This maintains separation of concerns while keeping the codebase organized and testable.

## Complexity Tracking

*Fill ONLY if Constitution Check has violations that must be justified*

| Violation | Why Needed | Simpler Alternative Rejected Because |
|-----------|------------|-------------------------------------|
| [e.g., 4th project] | [current need] | [why 3 projects insufficient] |
| [e.g., Repository pattern] | [specific problem] | [why direct DB access insufficient] |