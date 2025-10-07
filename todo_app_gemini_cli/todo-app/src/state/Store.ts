import type { AppState, Task } from './types';
import { StorageService } from '../storage/StorageService';

type Listener = () => void;

export class Store {
  private state: AppState;
  private listeners: Listener[] = [];

  storageService: StorageService;

  constructor(storageService: StorageService) {
    this.storageService = storageService;
    const savedState = this.storageService.loadState();
    if (savedState) {
      this.state = savedState;
    } else {
      this.state = {
        tasks: [],
        filter: 'all',
        theme: 'light',
        selectedTaskId: null,
      };
    }
  }

  getSelectedTaskId(): string | null {
    return this.state.selectedTaskId;
  }

  setSelectedTaskId(id: string | null): void {
    this.state.selectedTaskId = id;
    this.notify();
  }

  moveSelection(direction: 'up' | 'down'): void {
    const tasks = this.getTasks();
    if (tasks.length === 0) return;

    let currentIndex = -1;
    if (this.state.selectedTaskId) {
      currentIndex = tasks.findIndex(task => task.id === this.state.selectedTaskId);
    }

    let newIndex = currentIndex;
    if (direction === 'up') {
      newIndex = currentIndex <= 0 ? tasks.length - 1 : currentIndex - 1;
    } else { // 'down'
      newIndex = currentIndex === tasks.length - 1 ? 0 : currentIndex + 1;
    }

    this.setSelectedTaskId(tasks[newIndex].id);
  }

  reorderSelectedTask(direction: 'up' | 'down'): void {
    const tasks = this.getTasks();
    if (tasks.length === 0 || !this.state.selectedTaskId) return;

    const selectedIndex = tasks.findIndex(task => task.id === this.state.selectedTaskId);
    if (selectedIndex === -1) return;

    let newIndex = selectedIndex;
    if (direction === 'up') {
      newIndex = selectedIndex <= 0 ? tasks.length - 1 : selectedIndex - 1;
    } else { // 'down'
      newIndex = selectedIndex === tasks.length - 1 ? 0 : selectedIndex + 1;
    }

    this.reorderTasks(selectedIndex, newIndex);
    this.setSelectedTaskId(tasks[newIndex].id); // Keep selected task selected after reorder
  }

  addListener(listener: Listener): void {
    this.listeners.push(listener);
  }

  private notify(): void {
    this.listeners.forEach(listener => listener());
    this.storageService.saveState(this.state);
  }

  getTasks(): Task[] {
    switch (this.state.filter) {
      case 'active':
        return this.state.tasks.filter(task => !task.completed);
      case 'completed':
        return this.state.tasks.filter(task => task.completed);
      default:
        return this.state.tasks;
    }
  }

  setFilter(filter: 'all' | 'active' | 'completed'): void {
    this.state.filter = filter;
    this.notify();
  }

  addTask(title: string): void {
    const newTask: Task = {
      id: new Date().toISOString(),
      title,
      completed: false,
      createdAt: Date.now(),
      order: this.state.tasks.length,
    };
    this.state.tasks.push(newTask);
    this.notify();
  }

  editTask(id: string, title: string): void {
    this.state.tasks = this.state.tasks.map(task =>
      task.id === id ? { ...task, title } : task
    );
    this.notify();
  }

  toggleComplete(id: string): void {
    this.state.tasks = this.state.tasks.map(task =>
      task.id === id ? { ...task, completed: !task.completed } : task
    );
    this.notify();
  }

  reorderTasks(startIndex: number, endIndex: number): void {
    const [removed] = this.state.tasks.splice(startIndex, 1);
    this.state.tasks.splice(endIndex, 0, removed);
    this.state.tasks.forEach((task, index) => {
      task.order = index;
    });
    this.notify();
  }

  setTheme(theme: 'light' | 'dark'): void {
    this.state.theme = theme;
    this.notify();
  }

  getTheme(): 'light' | 'dark' {
    return this.state.theme;
  }

  deleteTask(id: string): void {
    this.state.tasks = this.state.tasks.filter(task => task.id !== id);
    this.notify();
  }
}