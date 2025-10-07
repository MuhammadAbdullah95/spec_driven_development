<!-- SYNC IMPACT REPORT
Version change: N/A → 1.0.0
Modified principles: None (new constitution)
Added sections: All principles and sections from scratch based on user input
Removed sections: None (new constitution)
Templates requiring updates: ✅ updated - .specify/templates/plan-template.md, .specify/templates/spec-template.md, .specify/templates/tasks-template.md
Follow-up TODOs: None
-->

# Todo List App Constitution

## Core Principles

### Code Quality and Maintainability
Follow a single, project-wide style and formatting setup (ESLint + Prettier or equivalent). Enforce via precommit hooks and CI. Prefer small, single-responsibility modules and clear directory structure. Keep public APIs minimal and documented. Use clear naming and avoid deep nesting in code. Avoid global mutable state; prefer explicit state objects. Every merged PR must include a short description of the change, tests for new logic, and one approving review. Use feature branches, keep PRs focused and under roughly 200 changed lines when practical.

### Testing Standards
Unit tests for all business logic and core UI components. Target: 80% unit coverage on core logic modules. End-to-end tests for main user flows: add task, edit task, complete task, delete task, drag-and-drop reordering, persistence across reload. Maintain a small set of smoke E2E tests that run in CI. Use lightweight tooling that fits the stack (example: Vitest for unit tests, Playwright or similar for E2E). Tests must run headless in CI. Tests must be deterministic and not rely on flaky timing. Use test ids for DOM selectors. Run lint, unit tests, and a build check on every PR; block merge on failing checks.

### User Experience Consistency
Establish design tokens for spacing, typography scale, and primary colors. Reuse tokens everywhere. Interaction patterns must be consistent: single primary action per area, clear affordances, and consistent control placements. Provide clear empty states, loading states, inline validation, and success/failure feedback for user actions. Drag-and-drop must be discoverable and accessible (mouse, touch, keyboard alternatives). Provide visible drop targets and a brief in-app hint. Keyboard support: navigate tasks, toggle complete, start edit, and reorder via keyboard shortcuts. Document shortcuts in the UI.

### Performance Requirements
Keep the runtime bundle minimal. Aim for a small core bundle using Vite or comparable tooling and minimal external libraries. App should be interactive quickly. Target: first meaningful paint under 1s on a mid-tier device with a warm cache; initial TTI as small as practical. Use lazy loading for non-critical assets and defer heavy work. Avoid blocking the main thread. For large lists, implement virtualization or incremental rendering to keep UI responsive. Measure with automated Lighthouse or similar checks in CI for regressions.

### Accessibility and Internationalization
Use semantic HTML and ARIA where necessary. All interactive controls must be reachable by keyboard. Ensure color contrast meets WCAG AA. Add aria-labels and live regions for dynamic updates when appropriate. Keep markup and text separate from code to facilitate future translations.

## Data, Privacy, and Security Requirements

Default to client-side persistence (localStorage or IndexedDB) unless a sync backend is explicitly required. Clearly document data location and persistence guarantees. Sanitize and validate any user input before rendering. Prevent XSS by avoiding innerHTML unless safe. No external analytics or user-tracking by default. If added later, opt-in only and document what is collected.

## Development Workflow and Quality Assurance

CI pipeline must run: lint, unit tests, build, and E2E smoke tests on a PR. A PR may not be merged until CI is green and a reviewer approves. Tag releases and include a short changelog entry for each release. Keep releases small and frequent. README with setup, dev commands, test commands, build and deploy instructions, and architecture summary. Small CONTRIBUTING doc with code style, PR etiquette, and how to run tests locally. Inline README or comments for nontrivial modules (state management, persistence layer, drag-and-drop logic).

## Governance

Provide a small, reliable, fast, and accessible to-do list app built with minimal dependencies. Priorities are code quality, automated testing, consistent user experience, and measurable performance. All PRs/reviews must verify compliance with these principles; Complexity must be justified; Acceptance criteria include lint/format checks pass in CI, unit tests pass and meet coverage targets for core logic, E2E smoke tests pass for the main flows (create, edit, complete, delete, reorder, persistence), drag-and-drop works with both mouse/touch and keyboard alternatives, app persists tasks locally and survives page reload, performance regression checks show no unexpected bundle or TTI increases, and basic accessibility checks pass (keyboard nav, ARIA, color contrast).

**Version**: 1.0.0 | **Ratified**: 2025-10-07 | **Last Amended**: 2025-10-07