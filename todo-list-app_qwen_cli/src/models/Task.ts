/**
 * Task interface representing a user's task to be completed.
 * Based on data-model.md specifications
 */
export interface Task {
  id: string;
  title: string;
  description?: string;
  completed: boolean;
  createdAt: number;
  order: number;
  subtasks?: Task[]; // for future implementation
}