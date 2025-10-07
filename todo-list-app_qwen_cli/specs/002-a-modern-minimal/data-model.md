# Data Model: A Modern, Minimal To-Do List App

**Feature**: A Modern, Minimal To-Do List App  
**Date**: 2025-10-07  
**Branch**: `002-a-modern-minimal`

## Entity Definitions

### Task Entity
Represents a user's task to be completed.

- **id**: string (required) - A unique identifier for the task
- **title**: string (required) - The main title of the task (validated to prevent empty strings)
- **description**: string (optional) - Additional details about the task
- **completed**: boolean (required) - Whether the task is marked complete (default: false)
- **createdAt**: number (required) - Unix timestamp when the task was created
- **order**: number (required) - Position in the list for ordering (default: next available position)
- **subtasks**: Task[] (optional) - Array of nested subtasks (for future implementation)

**Validation Rules**:
- title must not be empty or consist only of whitespace
- title must be no more than 500 characters
- createdAt must be a valid timestamp
- order must be a non-negative integer

**State Transitions**:
- When created: { completed: false, createdAt: current_timestamp, order: next_position }
- When completed: { completed: true }
- When uncompleted: { completed: false }
- When reordered: { order: new_position }
- When edited: { title: new_title, description: new_description }
- When deleted: Entity removed from state

### AppState Entity
Represents the current state of the application that needs to persist.

- **tasks**: Task[] (required) - The collection of all tasks in the system
- **filter**: "all" | "active" | "completed" (required) - Current filter selection (default: "all")
- **theme**: "light" | "dark" (required) - Current theme preference (default: system preference)

**Validation Rules**:
- tasks array must be a valid array of Task objects
- filter must be one of the allowed values
- theme must be one of the allowed values

**State Transitions**:
- On initialization: { tasks: [], filter: "all", theme: system_preference }
- On filter change: { filter: new_filter }
- On theme change: { theme: new_theme }
- On task operations: { tasks: updated_tasks_array }

## Relationships

- AppState "contains" multiple Task entities
- Task entities have no dependencies on other Task entities in the current implementation
- Future: Task may "contain" multiple Task entities as subtasks (planned feature)

## Storage Schema (LocalStorage)

Data will be serialized as JSON and stored under the key `"todo-app-state"`.

Example structure:
```json
{
  "tasks": [
    {
      "id": "task-123",
      "title": "Complete project",
      "description": "Finish the implementation",
      "completed": false,
      "createdAt": 1733606400000,
      "order": 0,
      "subtasks": []
    }
  ],
  "filter": "all",
  "theme": "light"
}
```

## API Contracts

### Task Operations
- GET /tasks - Retrieve all tasks, with filtering applied
- POST /tasks - Create a new task
- PUT /tasks/:id - Update an existing task
- DELETE /tasks/:id - Delete a task
- PATCH /tasks/:id/complete - Mark task as complete/incomplete
- PATCH /tasks/reorder - Update task ordering

### App State Operations
- GET /app-state - Retrieve current application state
- PUT /app-state - Update application state (filter, theme)

*Note: These are conceptual API contracts for documentation. In the current implementation, all operations happen via the StorageService abstraction without actual HTTP requests.*

## Validation Requirements

- Input validation for task creation/editing performed client-side before persistence
- Data integrity maintained through TypeScript typing and runtime checks
- Persistence failures gracefully handled with user feedback