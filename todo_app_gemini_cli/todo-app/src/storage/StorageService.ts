import type { AppState } from '../state/types';

export class StorageService {
  saveState(state: AppState): void {
    localStorage.setItem('todo-app-state', JSON.stringify(state));
  }

  loadState(): AppState | undefined {
    const state = localStorage.getItem('todo-app-state');
    if (state) {
      return JSON.parse(state);
    }
    return undefined;
  }
}