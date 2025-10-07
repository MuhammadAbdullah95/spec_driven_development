import { Store } from '../services/Store';
import { StorageService } from '../services/StorageService';
import { TaskInput } from './TaskInput';
import { TaskList } from './TaskList';
import { Filters } from './Filters';
import { ThemeToggle } from './ThemeToggle';

/**
 * Main App component that orchestrates all other components
 * Initializes the app, loads tasks, and mounts main components
 */
export class App {
  private store: Store;
  private storageService: StorageService;

  constructor() {
    this.storageService = new StorageService();
    this.store = new Store(this.storageService);
    
    this.init();
  }

  private init(): void {
    // Initialize components after DOM is loaded
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', () => {
        this.mountComponents();
      });
    } else {
      this.mountComponents();
    }
  }

  private mountComponents(): void {
    // Mount all components to their respective containers
    new TaskInput({
      store: this.store,
      containerId: 'task-input-container'
    });

    new TaskList({
      store: this.store,
      containerId: 'task-list-container'
    });

    new Filters({
      store: this.store,
      containerId: 'filters-container'
    });

    new ThemeToggle({
      store: this.store,
      containerId: 'theme-toggle-container'
    });

    // Apply initial theme to document
    const state = this.store.getState();
    document.documentElement.setAttribute('data-theme', state.theme);
  }
}