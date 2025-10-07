import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest';
import { Task } from '../../src/models/Task';
import { Store } from '../../src/services/Store';
import { StorageService } from '../../src/services/StorageService';

// Mock StorageService for testing
const mockStorageService = {
  saveState: vi.fn(),
  loadState: vi.fn(() => ({
    tasks: [],
    filter: 'all',
    theme: 'light'
  }))
} as unknown as StorageService;

describe('Store', () => {
  let store: Store;

  beforeEach(() => {
    vi.clearAllMocks();
    store = new Store(mockStorageService);
  });

  describe('addTask', () => {
    it('should add a new task with correct properties', () => {
      const task = store.addTask('Test task');
      
      expect(task.title).toBe('Test task');
      expect(task.completed).toBe(false);
      expect(task.id).toBeDefined();
      expect(task.createdAt).toBeDefined();
      expect(typeof task.order).toBe('number');
    });

    it('should throw error for empty title', () => {
      expect(() => store.addTask('')).toThrow('Title is required and must be 500 characters or less');
      expect(() => store.addTask('   ')).toThrow('Title is required and must be 500 characters or less');
    });

    it('should throw error for title exceeding 500 characters', () => {
      const longTitle = 'a'.repeat(501);
      expect(() => store.addTask(longTitle)).toThrow('Title is required and must be 500 characters or less');
    });
  });

  describe('editTask', () => {
    it('should update the task title', () => {
      const initialTask = store.addTask('Initial task');
      const updatedTask = store.editTask(initialTask.id, 'Updated task');
      
      expect(updatedTask?.title).toBe('Updated task');
    });

    it('should return null for non-existent task', () => {
      const result = store.editTask('non-existent-id', 'New title');
      
      expect(result).toBeNull();
    });
  });

  describe('toggleComplete', () => {
    it('should toggle task completion status', () => {
      const task = store.addTask('Test task');
      expect(task.completed).toBe(false);
      
      const updatedTask = store.toggleComplete(task.id);
      expect(updatedTask?.completed).toBe(true);
      
      const toggledBackTask = store.toggleComplete(task.id);
      expect(toggledBackTask?.completed).toBe(false);
    });

    it('should return null for non-existent task', () => {
      const result = store.toggleComplete('non-existent-id');
      
      expect(result).toBeNull();
    });
  });

  describe('deleteTask', () => {
    it('should remove task from the store', () => {
      const task = store.addTask('Test task');
      const result = store.deleteTask(task.id);
      
      expect(result).toBe(true);
      expect(store.getState().tasks).toHaveLength(0);
    });

    it('should return false for non-existent task', () => {
      const result = store.deleteTask('non-existent-id');
      
      expect(result).toBe(false);
    });
  });

  describe('reorderTasks', () => {
    it('should reorder tasks', () => {
      const task1 = store.addTask('Task 1');
      const task2 = store.addTask('Task 2');
      const task3 = store.addTask('Task 3');
      
      const stateBefore = store.getState();
      expect(stateBefore.tasks[0].id).toBe(task1.id);
      expect(stateBefore.tasks[1].id).toBe(task2.id);
      expect(stateBefore.tasks[2].id).toBe(task3.id);
      
      // Reorder: move task at index 2 (task3) to index 0
      store.reorderTasks(2, 0);
      
      const stateAfter = store.getState();
      expect(stateAfter.tasks[0].id).toBe(task3.id);
      expect(stateAfter.tasks[1].id).toBe(task1.id);
      expect(stateAfter.tasks[2].id).toBe(task2.id);
    });
  });

  describe('setFilter', () => {
    it('should update the filter in state', () => {
      store.setFilter('active');
      expect(store.getState().filter).toBe('active');
      
      store.setFilter('completed');
      expect(store.getState().filter).toBe('completed');
    });
  });

  describe('setTheme', () => {
    it('should update the theme in state', () => {
      store.setTheme('dark');
      expect(store.getState().theme).toBe('dark');
      
      store.setTheme('light');
      expect(store.getState().theme).toBe('light');
    });
  });
});