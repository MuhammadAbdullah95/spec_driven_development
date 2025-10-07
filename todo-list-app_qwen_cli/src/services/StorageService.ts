import { AppState } from '../models/AppState';

/**
 * StorageService class for handling saveState() and loadState() using localStorage
 * Based on data-model.md specifications
 */
export class StorageService {
  private readonly storageKey = 'todo-app-state';
  private readonly versionKey = 'todo-app-version';
  private readonly currentVersion = '1.0.0';

  /**
   * Save application state to localStorage
   */
  saveState(state: AppState): void {
    try {
      // Save the state data
      localStorage.setItem(this.storageKey, JSON.stringify(state));
      // Save the version for future migrations
      localStorage.setItem(this.versionKey, this.currentVersion);
    } catch (error) {
      console.error('Failed to save state to localStorage:', error);
      // In a real app, you might want to show a user-friendly error message
      throw new Error('Unable to save tasks. Storage may be full or unavailable.');
    }
  }

  /**
   * Load application state from localStorage
   */
  loadState(): AppState {
    try {
      const stateData = localStorage.getItem(this.storageKey);
      const version = localStorage.getItem(this.versionKey);

      if (stateData) {
        const parsedState = JSON.parse(stateData) as AppState;
        
        // Validate the loaded state structure
        if (this.isValidAppState(parsedState)) {
          return parsedState;
        } else {
          console.warn('Loaded state has invalid structure, returning default state');
          return this.getDefaultState();
        }
      }
    } catch (error) {
      console.error('Failed to load state from localStorage:', error);
    }

    // Return default state if loading failed or no data exists
    return this.getDefaultState();
  }

  /**
   * Check if the loaded app state has a valid structure
   */
  private isValidAppState(state: any): state is AppState {
    return (
      state &&
      Array.isArray(state.tasks) &&
      (state.filter === 'all' || state.filter === 'active' || state.filter === 'completed') &&
      (state.theme === 'light' || state.theme === 'dark')
    );
  }

  /**
   * Get default application state
   */
  private getDefaultState(): AppState {
    return {
      tasks: [],
      filter: 'all',
      theme: window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'
    };
  }
}