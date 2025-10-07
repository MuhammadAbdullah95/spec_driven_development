/**
 * ID generator utility function
 * Creates unique IDs for tasks
 */
export function generateId(): string {
  return `task-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
}