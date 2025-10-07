---
description: "Task list for A Modern, Minimal To-Do List App"
---

# Tasks: A Modern, Minimal To-Do List App

**Input**: Design documents from `/specs/002-a-modern-minimal/`
**Prerequisites**: plan.md (required), spec.md (required for user stories), research.md, data-model.md, contracts/
**Tests**: The examples below include test tasks. Tests are OPTIONAL - only include them if explicitly requested in the feature specification.

**Organization**: Tasks are grouped by user story to enable independent implementation and testing of each story.

## Format: `[ID] [P?] [Story] Description`
- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (e.g., US1, US2, US3)
- Include exact file paths in descriptions

## Path Conventions
- **Single project**: `src/`, `tests/` at repository root
- **Web app**: `backend/src/`, `frontend/src/`
- **Mobile**: `api/src/`, `ios/src/` or `android/src/`
- Paths shown below assume single project - adjust based on plan.md structure

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Project initialization and basic structure

- [X] T001 [P] Create project structure per implementation plan: src/, tests/, package.json, vite.config.ts
- [X] T002 Initialize Vite + TypeScript project with vanilla template
- [X] T003 [P] Configure ESLint and Prettier with project rules
- [X] T004 [P] Set up basic folder structure: src/models/, src/services/, src/components/, src/utils/, src/styles/

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Core infrastructure that MUST be complete before ANY user story can be implemented

**⚠️ CRITICAL**: No user story work can begin until this phase is complete

Examples of foundational tasks (adjust based on your project):

- [X] T005 Create Task.ts interface in src/models/ with id, title, description, completed, createdAt, order, subtasks attributes per data-model.md
- [X] T006 [P] Create AppState interface in src/models/ with tasks, filter, theme attributes per data-model.md
- [X] T007 Create basic index.html with root container and script entry point
- [X] T008 Create StorageService.ts in src/services/ with saveState() and loadState() methods using localStorage per data-model.md
- [X] T009 Create Store.ts in src/services/ with basic state management methods: addTask, editTask, toggleComplete, deleteTask
- [X] T010 Setup basic unit testing with Vitest in tests/unit/ (created tests/setup.ts)
- [X] T011 Setup basic E2E testing with Playwright in tests/e2e/ (structure created)

**Checkpoint**: Foundation ready - user story implementation can now begin in parallel

---

## Phase 3: User Story 1 - Add and Manage Tasks (Priority: P1) 🎯 MVP

**Goal**: Enable users to add tasks, edit tasks inline, mark complete/incomplete, and delete tasks - core functionality without which the app has no value

**Independent Test**: Can be fully tested by adding, editing, completing, and deleting tasks independently of other features. The app remains a functional to-do list with just this core functionality.

### Tests for User Story 1 (OPTIONAL - only if tests requested) ⚠️

- [X] T012 [P] [US1] Unit test for Store methods: addTask(title: string) in tests/unit/Store.test.ts
- [X] T013 [P] [US1] Unit test for Store methods: editTask(id: string, newTitle: string) in tests/unit/Store.test.ts
- [X] T014 [P] [US1] Unit test for Store methods: toggleComplete(id: string) in tests/unit/Store.test.ts
- [X] T015 [P] [US1] Unit test for Store methods: deleteTask(id: string) in tests/unit/Store.test.ts
- [X] T016 [P] [US1] E2E test for main flow: "User can add, edit, complete, delete, and reload tasks" in tests/e2e/todo-flow.spec.ts

### Implementation for User Story 1

- [X] T017 [P] [US1] Create TaskInput.ts component in src/components/ for adding new tasks with title and optional description
- [X] T018 [P] [US1] Create TaskItem.ts component in src/components/ for displaying individual tasks with inline editing
- [X] T019 [US1] Implement TaskItem functionality: checkbox toggle for completion, delete button with visible styling
- [X] T020 [US1] Add validation for task input: prevent empty titles, enforce character limits (500 chars)
- [X] T021 [US1] Implement Enter key handling to add tasks in TaskInput component
- [X] T022 [US1] Implement Esc key handling to cancel editing in TaskItem component
- [X] T023 [US1] Add visual distinction for completed tasks (dimmed, struck through) per requirements
- [X] T024 [US1] Add deletion confirmation only when user has more than 5 tasks per requirement FR-007

**Checkpoint**: At this point, User Story 1 should be fully functional and testable independently

---

## Phase 4: User Story 2 - Task Organization and Persistence (Priority: P2)

**Goal**: Enable users to reorder tasks by dragging or using the keyboard and have their tasks saved even after refreshing or closing the browser

**Independent Test**: Can be tested by reordering tasks and refreshing the page to verify the order persists independently of other features.

### Tests for User Story 2 (OPTIONAL - only if tests requested) ⚠️

- [X] T025 [P] [US2] Unit test for Store reorderTasks method: reorderTasks(startIndex, endIndex) in tests/unit/Store.test.ts
- [X] T026 [P] [US2] Unit test for StorageService persistence: save and load order correctly in tests/unit/StorageService.test.ts
- [X] T027 [US2] E2E test: "User can reorder tasks via drag and drop and order persists across page reloads" in tests/e2e/todo-flow.spec.ts

### Implementation for User Story 2

- [X] T028 [P] [US2] Enhance Store.ts to support reorderTasks functionality with proper order field updates
- [X] T029 [P] [US2] Enhance StorageService.ts to persist task order between page reloads
- [X] T030 [US2] Create/reuse drag-and-drop functionality for TaskList component in src/components/
- [X] T031 [US2] Implement keyboard-based reordering: Ctrl + Shift + ↑/↓ per requirements
- [X] T032 [US2] Ensure new order persists automatically in localStorage per requirements
- [X] T033 [US2] Test persistence across page reloads with organized tasks

**Checkpoint**: At this point, User Stories 1 AND 2 should both work independently

---

## Phase 5: User Story 3 - Filtering and Theme Management (Priority: P3)

**Goal**: Enable users to filter by completed or active tasks to focus on specific work and have the interface match their system's dark or light mode preference

**Independent Test**: Can be tested by applying filters and changing theme settings independently of core task management features.

### Tests for User Story 3 (OPTIONAL - only if tests requested) ⚠️

- [X] T034 [P] [US3] Unit test for Store filter methods: setFilter(value: FilterType) in tests/unit/Store.test.ts
- [X] T035 [P] [US3] Unit test for theme persistence in StorageService in tests/unit/StorageService.test.ts
- [X] T036 [US3] E2E test: "User can filter tasks by All/Active/Completed and theme persists across sessions" in tests/e2e/todo-flow.spec.ts

### Implementation for User Story 3

- [X] T037 [P] [US3] Create Filters.ts component in src/components/ with "All/Active/Completed" filter buttons
- [X] T038 [P] [US3] Create ThemeToggle.ts component in src/components/ with theme detection and manual override
- [X] T039 [US3] Enhance Store to manage filter state (all/active/completed) and update accordingly
- [X] T040 [US3] Enhance Store to manage theme preference (light/dark) and persist in localStorage
- [X] T041 [US3] Implement filter functionality: update task list instantly when filters applied per requirement FR-011
- [X] T042 [US3] Implement theme system with auto-detection of system preference per requirement FR-013
- [X] T043 [US3] Add CSS variables for theming in src/styles/themes.css per research decisions

**Checkpoint**: All user stories should now be independently functional

---

[Add more user story phases as needed, following the same pattern]

---

## Phase N: Polish & Cross-Cutting Concerns

**Purpose**: Improvements that affect multiple user stories and ensure constitution compliance

- [X] T044 [P] Documentation updates in README.md with setup, dev commands, test commands, and architecture summary
- [X] T045 Code cleanup and refactoring (following code quality principles: clear naming, avoid deep nesting, avoid global mutable state)
- [X] T046 Add empty state feedback: "No tasks yet—add one above!" per requirement FR-017
- [X] T047 [P] Add toast or inline messages for important actions (add, delete) per requirement FR-018
- [X] T048 [P] Add performance optimization (target first meaningful paint under 1s per success criteria SC-001)
- [X] T049 [P] Add accessibility improvements (keyboard navigation, ARIA labels, WCAG AA contrast per constitution)
- [X] T050 Add internationalization preparation (keep markup and text separate from code per constitution)
- [X] T051 Run quickstart.md validation
- [X] T052 CI quality gates verification (lint, unit tests, build checks pass per constitution)
- [X] T053 [P] Create CONTRIBUTING.md with code style, PR etiquette, and how to run tests locally
- [X] T054 Create inline documentation for nontrivial modules (state management, persistence layer, drag-and-drop logic)
- [X] T055 Add CSS transitions for subtle animations (fade-in/fade-out) per UI guidelines
- [X] T056 Add debounce utility in src/utils/debounce.ts for persistence optimization per research
- [X] T057 Add ID generator utility in src/utils/id.ts for task ID creation
- [X] T058 Add DOM utilities in src/utils/dom.ts for DOM manipulation per research
- [X] T059 Create TaskList.ts component to manage list of tasks and support filtering
- [X] T060 Create App.ts main application component to coordinate all other components
- [X] T061 Create main.css in src/styles/ with base layout, typography, and spacing
- [X] T062 [P] Run accessibility audit with axe-core or Playwright plugin per testing plan
- [X] T063 [P] Run final Lighthouse performance check per testing plan

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies - can start immediately
- **Foundational (Phase 2)**: Depends on Setup completion - BLOCKS all user stories
- **User Stories (Phase 3+)**: All depend on Foundational phase completion
  - User stories can then proceed in parallel (if staffed)
  - Or sequentially in priority order (P1 → P2 → P3)
- **Polish (Final Phase)**: Depends on all desired user stories being complete

### User Story Dependencies

- **User Story 1 (P1)**: Can start after Foundational (Phase 2) - No dependencies on other stories
- **User Story 2 (P2)**: Can start after Foundational (Phase 2) - May integrate with US1 but should be independently testable
- **User Story 3 (P3)**: Can start after Foundational (Phase 2) - May integrate with US1/US2 but should be independently testable

### Within Each User Story

- Tests (if included) MUST be written and FAIL before implementation
- Models before services
- Services before endpoints
- Core implementation before integration
- Story complete before moving to next priority