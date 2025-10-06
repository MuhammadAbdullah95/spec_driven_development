import { HistoryService } from '@/lib/history-service';

describe('History Service Contract', () => {
  let historyService: HistoryService;

  beforeEach(() => {
    historyService = new HistoryService();
  });

  test('should have addEntry method', () => {
    expect(historyService).toHaveMethod('addEntry');
  });

  test('should have getEntries method', () => {
    expect(historyService).toHaveMethod('getEntries');
  });

  test('should have clearEntries method', () => {
    expect(historyService).toHaveMethod('clearEntries');
  });

  test('addEntry method should accept correct parameters', () => {
    const result = historyService.addEntry('2 + 3', 5);
    expect(result).toBeDefined();
  });

  test('getEntries method should return an array', () => {
    const entries = historyService.getEntries();
    expect(Array.isArray(entries)).toBe(true);
  });

  test('clearEntries method should clear all entries', () => {
    historyService.addEntry('2 + 3', 5);
    historyService.clearEntries();
    expect(historyService.getEntries().length).toBe(0);
  });

  test('should maintain entries in correct format', () => {
    historyService.addEntry('2 + 3', 5);
    const entries = historyService.getEntries();
    expect(entries.length).toBe(1);
    expect(entries[0]).toHaveProperty('expression', '2 + 3');
    expect(entries[0]).toHaveProperty('result', 5);
    expect(entries[0]).toHaveProperty('timestamp');
  });
});