# Tasks: Modern To-Do List App

**Input**: Design documents from `/home/abdullah/spec_driven_development/practice_gemini/specs/002-a-modern-minimal/`
**Prerequisites**: plan.md, spec.md

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Project initialization and basic structure

- [x] T001 Initialize Vite + TypeScript project: `npm create vite@latest todo-app --template vanilla-ts`
- [x] T002 [P] Configure ESLint and Prettier.
- [x] T003 [P] Create basic folder structure: `src/components`, `src/state`, `src/storage`, `src/styles`, `src/utils`, `tests/unit`, `tests/e2e`.
- [x] T004 [P] Create a simple `index.html` with a root container and script entry point.

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Core infrastructure that MUST be complete before ANY user story can be implemented

- [x] T005 Create the `AppState` and `Task` interfaces in `src/state/types.ts`.
- [x] T006 Implement a basic `Store` class in `src/state/Store.ts` that can hold tasks.
- [x] T007 Implement the `StorageService` class in `src/storage/StorageService.ts` with empty `saveState` and `loadState` methods using `localStorage`.
- [x] T008 Create the main `App.ts` file to initialize the store and render a basic layout.

**Checkpoint**: Foundation ready - user story implementation can now begin.

---

## Phase 3: User Story 1 - Quickly Add Tasks (Priority: P1) 🎯 MVP

**Goal**: Allow users to add new tasks to the list.

**Independent Test**: A user can type a task into an input field, press Enter, and see the new task appear in the list below.

### Implementation for User Story 1

- [x] T009 [US1] Implement `addTask` method in the `Store`.
- [x] T010 [US1] Create a `TaskInput` component in `src/components/TaskInput.ts` that renders an input field.
- [x] T011 [US1] Connect the `TaskInput` component to the `addTask` method in the store, calling it on Enter.
- [x] T012 [US1] Create a `TaskList` component in `src/components/TaskList.ts` that renders a list of tasks from the store.

**Checkpoint**: User Story 1 is fully functional and testable.

---

## Phase 4: User Story 2 - Edit Tasks Inline (Priority: P1)

**Goal**: Allow users to edit the title of an existing task.

**Independent Test**: A user can click on a task's title, edit it, and see the change saved.

### Implementation for User Story 2

- [x] T013 [US2] Implement `editTask` method in the `Store`.
- [x] T014 [US2] Create a `TaskItem` component in `src/components/TaskItem.ts`.
- [x] T015 [US2] Add logic to the `TaskItem` component to switch to an inline editing mode when the title is clicked.
- [x] T016 [US2] Call the `editTask` method when the user saves the change (e.g., by pressing Enter or blurring the input).
- [x] T017 [US2] Implement `deleteTask` method in the `Store`.
- [x] T018 [US2] Add a delete button to the `TaskItem` component.
- [x] T019 [US2] Connect the delete button to the `deleteTask` method in the store.

**Checkpoint**: User Story 2 is fully functional and testable.

---

## Phase 5: User Story 3 - Mark Tasks as Completed (Priority: P1)

**Goal**: Allow users to mark tasks as complete.

**Independent Test**: A user can click a checkbox next to a task and see the task's appearance change to indicate it's completed.

### Implementation for User Story 3

- [x] T020 [US3] Implement `toggleComplete` method in the `Store`.
- [x] T021 [US3] Add a checkbox to the `TaskItem` component.
- [x] T022 [US3] Connect the checkbox to the `toggleComplete` method in the store.
- [x] T023 [US3] Add styling to the `TaskItem` to visually distinguish completed tasks (e.g., line-through).

**Checkpoint**: User Story 3 is fully functional and testable.

---

## Phase 6: User Story 4 - Reorder Tasks (Priority: P2)

**Goal**: Allow users to reorder tasks using drag and drop.

**Independent Test**: A user can drag a task to a different position in the list, and the new order is saved.

### Implementation for User Story 4

- [x] T024 [US4] Implement `reorderTasks` method in the `Store`.
- [x] T025 [US4] Add drag-and-drop functionality to the `TaskList` and `TaskItem` components.
- [x] T026 [US4] Call the `reorderTasks` method when a drag-and-drop operation is completed.

**Checkpoint**: User Story 4 is fully functional and testable.

---

## Phase 7: User Story 5 - Persist Tasks (Priority: P1)

**Goal**: Ensure tasks are saved between sessions.

**Independent Test**: A user can add tasks, refresh the page, and see that the tasks are still there.

### Implementation for User Story 5

- [x] T027 [US5] Implement the logic in the `saveState` and `loadState` methods of the `StorageService` to interact with `localStorage`.
- [x] T028 [US5] Call `saveState` from the `Store` whenever the state changes.
- [x] T029 [US5] Call `loadState` when the application initializes.

**Checkpoint**: User Story 5 is fully functional and testable.

---

## Phase 8: Polish & Cross-Cutting Concerns

**Purpose**: Improvements that affect multiple user stories.

- [x] T030 [P] Add filtering logic to the `Store` and UI.
- [x] T031 [P] Implement dark and light mode theme switching.
- [x] T032 [P] Add keyboard shortcuts for core actions.
- [x] T033 [P] Add empty states and user feedback messages.
- [x] T034 [P] Write unit tests for all `Store` methods.
- [x] T035 [P] Write E2E tests for the main user flows.
- [x] T036 [P] Create README.md and CONTRIBUTING.md.

## Dependencies & Execution Order

-   **Phase 1 & 2**: Must be completed before any user stories.
-   **User Stories (Phases 3-7)**: Can be implemented in any order after Phase 2 is complete, but the priority order is recommended.
-   **Phase 8**: Can be worked on in parallel with user stories or after they are complete.