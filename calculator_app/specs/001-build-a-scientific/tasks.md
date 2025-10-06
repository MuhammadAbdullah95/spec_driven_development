# Tasks: Scientific Calculator App

**Input**: Design documents from `G:\spec_driven_development\calculator_app\specs\001-build-a-scientific\`
**Prerequisites**: plan.md (required), research.md, data-model.md, contracts/

## Execution Flow (main)
```
1. Load plan.md from feature directory
   → If not found: ERROR "No implementation plan found"
   → Extract: tech stack, libraries, structure
2. Load optional design documents:
   → data-model.md: Extract entities → model tasks
   → contracts/: Each file → contract test task
   → research.md: Extract decisions → setup tasks
3. Generate tasks by category:
   → Setup: project init, dependencies, linting
   → Tests: contract tests, integration tests
   → Core: models, services, CLI commands
   → Integration: DB, middleware, logging
   → Polish: unit tests, performance, docs
4. Apply task rules:
   → Different files = mark [P] for parallel
   → Same file = sequential (no [P])
   → Tests before implementation (TDD)
5. Number tasks sequentially (T001, T002...)
6. Generate dependency graph
7. Create parallel execution examples
8. Validate task completeness:
   → All contracts have tests?
   → All entities have models?
   → All endpoints implemented?
9. Return: SUCCESS (tasks ready for execution)
```

## Format: `[ID] [P?] Description`
- **[P]**: Can run in parallel (different files, no dependencies)
- Include exact file paths in descriptions

## Path Conventions
- **Single project**: `src/`, `tests/` at repository root
- **Web app**: `backend/src/`, `frontend/src/`
- **Mobile**: `api/src/`, `ios/src/` or `android/src/`
- Paths shown below assume single project - adjust based on plan.md structure

## Phase 3.1: Setup
- [X] T001 Create project structure per implementation plan in src/
- [X] T002 Initialize Next.js v15 project with React, Math.js, Tailwind CSS dependencies
- [X] T003 [P] Configure linting and formatting tools (ESLint, Prettier)
- [X] T004 [P] Set up TypeScript configuration (tsconfig.json)
- [X] T005 [P] Configure Next.js settings (next.config.js)
- [X] T006 [P] Set up Tailwind CSS configuration (tailwind.config.js)
- [X] T007 [P] Create initial project files: package.json, README.md

## Phase 3.2: Tests First (TDD) ⚠️ MUST COMPLETE BEFORE 3.3
**CRITICAL: These tests MUST be written and MUST FAIL before ANY implementation**
- [X] T008 [P] Unit test calculator engine in tests/unit/calculator-engine.test.ts
- [X] T009 [P] Unit test math utilities in tests/unit/math-utils.test.ts
- [X] T010 [P] Contract test calculator service interface in tests/contract/test_calculator_service.ts
- [X] T011 [P] Contract test history service interface in tests/contract/test_history_service.ts
- [X] T012 [P] Integration test calculator component in tests/integration/calculator-component.test.tsx
- [X] T013 [P] Integration test history panel functionality in tests/integration/history-panel.test.tsx
- [X] T014 [P] E2E test basic calculation flow in tests/e2e/basic-calculations.test.ts
- [X] T015 [P] E2E test advanced functions in tests/e2e/advanced-functions.test.ts
- [X] T016 [P] E2E test error handling in tests/e2e/error-handling.test.ts

## Phase 3.3: Core Implementation (ONLY after tests are failing)
- [X] T017 [P] Create calculator data types in src/types/calculator.ts
- [X] T018 [P] Implement calculator engine in src/lib/calculator-engine.ts
- [X] T019 [P] Implement math utilities in src/lib/math-utils.ts
- [X] T020 [P] Create constants module in src/lib/constants.ts
- [X] T021 [P] Create calculator hook in src/app/calculator/hooks/useCalculator.tsx
- [X] T022 [P] Create history hook in src/app/calculator/hooks/useHistory.tsx
- [X] T023 [P] Create Display component in src/app/calculator/components/Display.tsx
- [X] T024 [P] Create ButtonGrid component in src/app/calculator/components/ButtonGrid.tsx
- [X] T025 [P] Create HistoryPanel component in src/app/calculator/components/HistoryPanel.tsx
- [X] T026 [P] Create Calculator component in src/app/calculator/components/Calculator.tsx
- [X] T027 [P] Create unique UI layout in src/app/layout.tsx
- [X] T028 [P] Create calculator page in src/app/calculator/page.tsx
- [X] T029 [P] Create home page in src/app/page.tsx
- [X] T030 [P] Implement error handling for undefined operations
- [X] T031 [P] Implement calculation history storage in localStorage
- [X] T032 [P] Implement UI theme customization options
- [X] T033 [P] Implement algebraic equation solving in src/lib/algebra-engine.ts
- [X] T034 [P] Implement geometric calculations in src/lib/geometry-utils.ts
- [X] T035 [P] Add algebraic functions to calculator engine
- [X] T036 [P] Add geometric functions to calculator engine

## Phase 3.4: Integration
- [X] T037 Connect Calculator component to calculator engine
- [X] T038 Integrate history functionality with UI
- [X] T039 Connect math utilities to calculator engine
- [X] T040 Implement storage for user preferences
- [X] T041 Add accessibility features for student users
- [X] T042 Implement responsive design for different screen sizes

## Phase 3.5: Polish
- [X] T043 [P] Add unit tests for calculation accuracy in tests/unit/accuracy.test.ts
- [X] T044 [P] Add performance tests for calculation speed in tests/unit/performance.test.ts
- [X] T045 [P] Update documentation files
- [X] T046 [P] Add user instructions in src/app/calculator/components/Instructions.tsx
- [X] T047 [P] Add visual feedback for user actions
- [X] T048 [P] Add keyboard support for calculator operations
- [X] T049 Run final manual testing following quickstart.md
- [X] T050 Verify all constitutional requirements met (code quality, testing, UX, performance)

## Dependencies
- Setup (T001-T007) before everything else
- Tests (T008-T016) before implementation (T017-T036)
- T017 (types) blocks T018, T021, T022
- T018 (calculator engine) blocks T026, T037, T039
- T021 (calculator hook) blocks T026, T037, T039
- T022 (history hook) blocks T025, T038
- T023, T024 (UI components) blocks T026
- T026 (Calculator component) blocks T037
- T033 (algebra engine) blocks T035, T037
- T034 (geometry utils) blocks T036, T037
- T035 (algebra in engine) blocks T037
- T036 (geometry in engine) blocks T037
- Implementation before polish (T043-T050)

## Parallel Example
```
# Launch T008-T016 together (tests):
Task: "Unit test calculator engine in tests/unit/calculator-engine.test.ts"
Task: "Unit test math utilities in tests/unit/math-utils.test.ts"
Task: "Contract test calculator service interface in tests/contract/test_calculator_service.ts"
Task: "Contract test history service interface in tests/contract/test_history_service.ts"
Task: "Integration test calculator component in tests/integration/calculator-component.test.tsx"
Task: "Integration test history panel functionality in tests/integration/history-panel.test.tsx"
Task: "E2E test basic calculation flow in tests/e2e/basic-calculations.test.ts"
Task: "E2E test advanced functions in tests/e2e/advanced-functions.test.ts"
Task: "E2E test error handling in tests/e2e/error-handling.test.ts"

# Launch T017-T022 together (core logic):
Task: "Create calculator data types in src/types/calculator.ts"
Task: "Implement calculator engine in src/lib/calculator-engine.ts"
Task: "Implement math utilities in src/lib/math-utils.ts"
Task: "Create constants module in src/lib/constants.ts"
Task: "Create calculator hook in src/app/calculator/hooks/useCalculator.tsx"
Task: "Create history hook in src/app/calculator/hooks/useHistory.tsx"
```

## Notes
- [P] tasks = different files, no dependencies
- Verify tests fail before implementing
- Commit after each task
- Avoid: vague tasks, same file conflicts

## Task Generation Rules
*Applied during main() execution*

1. **From Contracts**:
   - Each service interface → contract test task [P]
   - Each functionality → implementation task
   
2. **From Data Model**:
   - Each entity → type/model creation task [P]
   - Relationships → service layer tasks
   
3. **From User Stories**:
   - Each story → integration test [P]
   - Quickstart scenarios → validation tasks

4. **Constitution Alignment**:
   - Code Quality: Ensure each task includes code review and style guide compliance
   - Testing: Each implementation task must have corresponding test tasks
   - UX Consistency: Include UX validation tasks for user-facing features
   - Performance: Add performance testing tasks for features with performance requirements

5. **Ordering**:
   - Setup → Tests → Models → Services → Endpoints → Polish
   - Dependencies block parallel execution

## Validation Checklist
*GATE: Checked by main() before returning*

- [ ] All contracts have corresponding tests
- [ ] All entities have model tasks
- [ ] All tests come before implementation
- [ ] Parallel tasks truly independent
- [ ] Each task specifies exact file path
- [ ] No task modifies same file as another [P] task