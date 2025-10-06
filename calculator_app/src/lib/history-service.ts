export interface HistoryEntry {
  id: string;
  expression: string;
  result: number;
  timestamp: Date;
}

const HISTORY_KEY = 'calculator_history';
const HISTORY_LIMIT = 50;

export class HistoryService {
  private entries: HistoryEntry[] = [];

  constructor() {
    this.loadFromStorage();
  }

  private loadFromStorage(): void {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem(HISTORY_KEY);
      if (saved) {
        try {
          const parsed = JSON.parse(saved);
          this.entries = parsed.map((entry: any) => ({
            ...entry,
            timestamp: new Date(entry.timestamp)
          }));
        } catch (error) {
          console.error('Error loading history from storage:', error);
          this.entries = [];
        }
      }
    }
  }

  private saveToStorage(): void {
    if (typeof window !== 'undefined') {
      try {
        localStorage.setItem(HISTORY_KEY, JSON.stringify(this.entries));
      } catch (error) {
        console.error('Error saving history to storage:', error);
      }
    }
  }

  addEntry(expression: string, result: number): void {
    const newEntry: HistoryEntry = {
      id: Date.now().toString(),
      expression,
      result,
      timestamp: new Date(),
    };

    this.entries.unshift(newEntry);

    // Limit history to the specified number of entries
    if (this.entries.length > HISTORY_LIMIT) {
      this.entries = this.entries.slice(0, HISTORY_LIMIT);
    }

    this.saveToStorage();
  }

  getEntries(): HistoryEntry[] {
    return [...this.entries];
  }

  clearEntries(): void {
    this.entries = [];
    this.saveToStorage();
  }

  removeEntry(id: string): void {
    this.entries = this.entries.filter(entry => entry.id !== id);
    this.saveToStorage();
  }
}