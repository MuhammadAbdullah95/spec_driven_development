import { Store } from '../../src/state/Store';
import { StorageService } from '../../src/storage/StorageService';
import { AppState, Task } from '../../src/state/types';

// Mock StorageService
class MockStorageService implements StorageService {
  private state: AppState | undefined;

  saveState(state: AppState): void {
    this.state = state;
  }

  loadState(): AppState | undefined {
    return this.state;
  }
}

describe('Store', () => {
  let store: Store;
  let mockStorageService: MockStorageService;

  beforeEach(() => {
    mockStorageService = new MockStorageService();
    store = new Store(mockStorageService);
  });

  it('should initialize with an empty task list if no saved state', () => {
    expect(store.getTasks()).toEqual([]);
  });

  it('should load state from StorageService if available', () => {
    const savedState: AppState = {
      tasks: [{ id: '1', title: 'Test', completed: false, createdAt: 0, order: 0 }],
      filter: 'all',
      theme: 'light',
      selectedTaskId: null,
    };
    mockStorageService.saveState(savedState);
    store = new Store(mockStorageService); // Re-initialize to load state
    expect(store.getTasks()).toEqual(savedState.tasks);
  });

  it('should add a task', () => {
    store.addTask('New Task');
    const tasks = store.getTasks();
    expect(tasks.length).toBe(1);
    expect(tasks[0].title).toBe('New Task');
    expect(tasks[0].completed).toBe(false);
  });

  it('should edit a task', () => {
    store.addTask('Task to Edit');
    const taskId = store.getTasks()[0].id;
    store.editTask(taskId, 'Edited Task');
    expect(store.getTasks()[0].title).toBe('Edited Task');
  });

  it('should toggle task completion', () => {
    store.addTask('Task to Toggle');
    const taskId = store.getTasks()[0].id;
    store.toggleComplete(taskId);
    expect(store.getTasks()[0].completed).toBe(true);
    store.toggleComplete(taskId);
    expect(store.getTasks()[0].completed).toBe(false);
  });

  it('should reorder tasks', () => {
    store.addTask('Task 0');
    store.addTask('Task 1');
    store.addTask('Task 2');
    const tasksBefore = store.getTasks().map(t => t.title);
    expect(tasksBefore).toEqual(['Task 0', 'Task 1', 'Task 2']);

    store.reorderTasks(0, 2); // Move Task 0 to end
    const tasksAfter = store.getTasks().map(t => t.title);
    expect(tasksAfter).toEqual(['Task 1', 'Task 2', 'Task 0']);
  });

  it('should set filter', () => {
    store.setFilter('active');
    // Assuming getTasks() is already modified to filter
    // This test primarily checks if the filter state is updated
    // Actual filtering is tested via getTasks()
    expect(store.getTasks()).toEqual([]); // No active tasks yet
  });

  it('should filter active tasks', () => {
    store.addTask('Active Task');
    store.addTask('Completed Task');
    store.toggleComplete(store.getTasks()[1].id); // Complete the second task
    store.setFilter('active');
    expect(store.getTasks().length).toBe(1);
    expect(store.getTasks()[0].title).toBe('Active Task');
  });

  it('should filter completed tasks', () => {
    store.addTask('Active Task');
    store.addTask('Completed Task');
    store.toggleComplete(store.getTasks()[1].id); // Complete the second task
    store.setFilter('completed');
    expect(store.getTasks().length).toBe(1);
    expect(store.getTasks()[0].title).toBe('Completed Task');
  });

  it('should set theme', () => {
    store.setTheme('dark');
    expect(store.getTheme()).toBe('dark');
  });

  it('should get theme', () => {
    expect(store.getTheme()).toBe('light'); // Default
    store.setTheme('dark');
    expect(store.getTheme()).toBe('dark');
  });

  it('should select a task', () => {
    store.addTask('Task 1');
    const taskId = store.getTasks()[0].id;
    store.setSelectedTaskId(taskId);
    expect(store.getSelectedTaskId()).toBe(taskId);
  });

  it('should move selection up', () => {
    store.addTask('Task 0');
    store.addTask('Task 1');
    store.addTask('Task 2');
    store.setSelectedTaskId(store.getTasks()[1].id); // Select Task 1
    store.moveSelection('up');
    expect(store.getSelectedTaskId()).toBe(store.getTasks()[0].id); // Should be Task 0
  });

  it('should move selection down', () => {
    store.addTask('Task 0');
    store.addTask('Task 1');
    store.addTask('Task 2');
    store.setSelectedTaskId(store.getTasks()[1].id); // Select Task 1
    store.moveSelection('down');
    expect(store.getSelectedTaskId()).toBe(store.getTasks()[2].id); // Should be Task 2
  });

  it('should reorder selected task up', () => {
    store.addTask('Task 0');
    store.addTask('Task 1');
    store.addTask('Task 2');
    store.setSelectedTaskId(store.getTasks()[1].id); // Select Task 1
    store.reorderSelectedTask('up');
    expect(store.getTasks()[0].title).toBe('Task 1'); // Task 1 moved up
    expect(store.getSelectedTaskId()).toBe(store.getTasks()[0].id); // Task 1 still selected
  });

  it('should reorder selected task down', () => {
    store.addTask('Task 0');
    store.addTask('Task 1');
    store.addTask('Task 2');
    store.setSelectedTaskId(store.getTasks()[1].id); // Select Task 1
    store.reorderSelectedTask('down');
    expect(store.getTasks()[2].title).toBe('Task 1'); // Task 1 moved down
    expect(store.getSelectedTaskId()).toBe(store.getTasks()[2].id); // Task 1 still selected
  });
});