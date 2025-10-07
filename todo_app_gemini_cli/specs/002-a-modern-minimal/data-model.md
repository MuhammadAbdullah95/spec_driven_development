# Data Model: Modern To-Do List App

This document defines the data structures used in the application.

## `Task` Interface

Represents a single to-do item.

```typescript
export interface Task {
  id: string;
  title: string;
  description?: string;
  completed: boolean;
  createdAt: number;
  order: number;
  subtasks?: Task[]; // Planned for a future phase
}
```

### Fields

-   **`id`**: A unique identifier for the task (e.g., a UUID).
-   **`title`**: The main content of the task.
-   **`description`**: Optional additional details for the task.
-   **`completed`**: A boolean indicating whether the task is complete.
-   **`createdAt`**: A timestamp of when the task was created.
-   **`order`**: A number used for sorting and reordering tasks.
-   **`subtasks`**: An optional array of `Task` objects, for future implementation.

## `AppState` Interface

Represents the entire state of the application.

```typescript
export interface AppState {
  tasks: Task[];
  filter: "all" | "active" | "completed";
  theme: "light" | "dark";
}
```

### Fields

-   **`tasks`**: An array of all `Task` objects.
-   **`filter`**: The currently selected filter view.
-   **`theme`**: The currently selected theme.
