import { describe, it, expect, beforeEach, vi } from 'vitest';
import { StorageService } from '../../src/services/StorageService';

// Mock localStorage
const localStorageMock = {
  getItem: vi.fn(),
  setItem: vi.fn(),
  removeItem: vi.fn(),
  clear: vi.fn(),
};

Object.defineProperty(window, 'localStorage', {
  value: localStorageMock,
});

describe('StorageService', () => {
  let storageService: StorageService;

  beforeEach(() => {
    vi.clearAllMocks();
    storageService = new StorageService();
  });

  describe('saveState', () => {
    it('should save state to localStorage', () => {
      const mockState = {
        tasks: [],
        filter: 'all',
        theme: 'light'
      };
      
      storageService.saveState(mockState);
      
      expect(localStorageMock.setItem).toHaveBeenCalledWith(
        'todo-app-state',
        JSON.stringify(mockState)
      );
      expect(localStorageMock.setItem).toHaveBeenCalledWith(
        'todo-app-version',
        '1.0.0'
      );
    });

    it('should throw error when localStorage is unavailable', () => {
      localStorageMock.setItem.mockImplementation(() => {
        throw new Error('Storage is full');
      });
      
      const mockState = {
        tasks: [],
        filter: 'all',
        theme: 'light'
      };
      
      expect(() => storageService.saveState(mockState)).toThrow('Unable to save tasks. Storage may be full or unavailable.');
    });
  });

  describe('loadState', () => {
    it('should load state from localStorage when data exists', () => {
      const savedState = {
        tasks: [
          {
            id: 'test-id',
            title: 'Test Task',
            completed: false,
            createdAt: Date.now(),
            order: 0
          }
        ],
        filter: 'active',
        theme: 'dark'
      };
      
      localStorageMock.getItem.mockReturnValue(JSON.stringify(savedState));
      
      const result = storageService.loadState();
      
      expect(result).toEqual(savedState);
    });

    it('should return default state when no data exists', () => {
      localStorageMock.getItem.mockReturnValue(null);
      
      const result = storageService.loadState();
      
      expect(result).toEqual({
        tasks: [],
        filter: 'all',
        theme: expect.any(String) // 'light' or 'dark' depending on system preference
      });
    });

    it('should return default state when data is invalid', () => {
      localStorageMock.getItem.mockReturnValue('invalid json');
      
      const result = storageService.loadState();
      
      expect(result).toEqual({
        tasks: [],
        filter: 'all',
        theme: expect.any(String) // 'light' or 'dark' depending on system preference
      });
    });

    it('should validate state structure correctly', () => {
      // Valid state
      localStorageMock.getItem.mockReturnValue(JSON.stringify({
        tasks: [],
        filter: 'all',
        theme: 'light'
      }));
      
      const validResult = storageService.loadState();
      expect(validResult).toEqual({
        tasks: [],
        filter: 'all',
        theme: 'light'
      });
    });
  });
});