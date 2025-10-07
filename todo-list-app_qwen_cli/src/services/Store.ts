import { Task } from '../models/Task';
import { AppState } from '../models/AppState';
import { StorageService } from './StorageService';

type StoreListener = (state: AppState) => void;

/**
 * Store class for centralized state management
 * Based on data-model.md specifications
 */
export class Store {
  private state: AppState;
  private readonly storageService: StorageService;
  private listeners: StoreListener[] = [];

  constructor(storageService: StorageService) {
    this.storageService = storageService;
    this.state = this.storageService.loadState();
  }

  /**
   * Get the current application state
   */
  getState(): AppState {
    return { ...this.state };
  }

  /**
   * Subscribe to state changes
   */
  subscribe(listener: StoreListener): () => void {
    this.listeners.push(listener);

    // Return an unsubscribe function
    return () => {
      const index = this.listeners.indexOf(listener);
      if (index > -1) {
        this.listeners.splice(index, 1);
      }
    };
  }

  /**
   * Notify all listeners about state changes
   */
  private notifyListeners(): void {
    const stateCopy = this.getState();
    this.listeners.forEach(listener => listener(stateCopy));
  }

  /**
   * Add a new task
   */
  addTask(title: string, description?: string): Task {
    // Validate title
    if (!title.trim() || title.trim().length > 500) {
      throw new Error('Title is required and must be 500 characters or less');
    }

    const newTask: Task = {
      id: this.generateId(),
      title: title.trim(),
      description: description?.trim(),
      completed: false,
      createdAt: Date.now(),
      order: this.state.tasks.length,
      subtasks: []
    };

    // Add the new task to the state
    this.state.tasks.push(newTask);

    // Update order for all tasks after adding new one
    this.state.tasks.sort((a, b) => a.order - b.order);

    // Persist the updated state
    this.storageService.saveState(this.state);

    // Notify listeners about the change
    this.notifyListeners();

    return newTask;
  }

  /**
   * Edit an existing task
   */
  editTask(id: string, newTitle: string, newDescription?: string): Task | null {
    const taskIndex = this.state.tasks.findIndex(task => task.id === id);
    
    if (taskIndex === -1) {
      return null;
    }

    // Validate title
    if (!newTitle.trim() || newTitle.trim().length > 500) {
      throw new Error('Title is required and must be 500 characters or less');
    }

    this.state.tasks[taskIndex].title = newTitle.trim();
    this.state.tasks[taskIndex].description = newDescription?.trim();

    // Persist the updated state
    this.storageService.saveState(this.state);

    // Notify listeners about the change
    this.notifyListeners();

    return { ...this.state.tasks[taskIndex] };
  }

  /**
   * Toggle task completion status
   */
  toggleComplete(id: string): Task | null {
    const taskIndex = this.state.tasks.findIndex(task => task.id === id);
    
    if (taskIndex === -1) {
      return null;
    }

    this.state.tasks[taskIndex].completed = !this.state.tasks[taskIndex].completed;

    // Persist the updated state
    this.storageService.saveState(this.state);

    // Notify listeners about the change
    this.notifyListeners();

    return { ...this.state.tasks[taskIndex] };
  }

  /**
   * Delete a task
   */
  deleteTask(id: string): boolean {
    const initialLength = this.state.tasks.length;
    this.state.tasks = this.state.tasks.filter(task => task.id !== id);

    if (this.state.tasks.length === initialLength) {
      // Task was not found
      return false;
    }

    // Update order for remaining tasks to ensure sequential ordering
    this.state.tasks.forEach((task, index) => {
      task.order = index;
    });

    // Persist the updated state
    this.storageService.saveState(this.state);

    // Notify listeners about the change
    this.notifyListeners();

    return true;
  }

  /**
   * Reorder tasks
   */
  reorderTasks(startIndex: number, endIndex: number): void {
    if (startIndex < 0 || endIndex < 0 || 
        startIndex >= this.state.tasks.length || endIndex >= this.state.tasks.length) {
      return;
    }

    // Reorder the tasks array
    const [movedTask] = this.state.tasks.splice(startIndex, 1);
    this.state.tasks.splice(endIndex, 0, movedTask);

    // Update order property for all tasks
    this.state.tasks.forEach((task, index) => {
      task.order = index;
    });

    // Persist the updated state
    this.storageService.saveState(this.state);

    // Notify listeners about the change
    this.notifyListeners();
  }

  /**
   * Set the current filter
   */
  setFilter(filter: 'all' | 'active' | 'completed'): void {
    this.state.filter = filter;

    // Persist the updated state
    this.storageService.saveState(this.state);

    // Notify listeners about the change
    this.notifyListeners();
  }

  /**
   * Set the current theme
   */
  setTheme(theme: 'light' | 'dark'): void {
    this.state.theme = theme;

    // Persist the updated state
    this.storageService.saveState(this.state);

    // Notify listeners about the change
    this.notifyListeners();
  }

  /**
   * Generate a unique ID for tasks
   */
  private generateId(): string {
    return `task-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }
}