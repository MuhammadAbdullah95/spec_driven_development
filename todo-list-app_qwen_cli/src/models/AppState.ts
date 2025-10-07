import { Task } from './Task';

/**
 * AppState interface representing the current state of the application that needs to persist.
 * Based on data-model.md specifications
 */
export interface AppState {
  tasks: Task[];
  filter: 'all' | 'active' | 'completed';
  theme: 'light' | 'dark';
}