import { useState, useEffect } from 'react';
import { HistoryEntry } from '@/types/calculator';

const HISTORY_KEY = 'calculator_history';

export const useHistory = (limit: number = 50) => {
  const [history, setHistory] = useState<HistoryEntry[]>(() => {
    if (typeof window !== 'undefined') {
      try {
        const saved = localStorage.getItem(HISTORY_KEY);
        if (saved) {
          const parsed = JSON.parse(saved);
          // Convert timestamp strings back to Date objects
          return parsed.map((entry: any) => ({
            ...entry,
            timestamp: new Date(entry.timestamp)
          }));
        }
      } catch (error) {
        console.error('Error loading history from localStorage:', error);
      }
    }
    return [];
  });

  useEffect(() => {
    if (typeof window !== 'undefined') {
      localStorage.setItem(HISTORY_KEY, JSON.stringify(history));
    }
  }, [history]);

  const addToHistory = (expression: string, result: string) => {
    const newEntry: HistoryEntry = {
      id: Date.now().toString(),
      expression,
      result,
      timestamp: new Date(),
    };

    setHistory(prev => {
      const newHistory = [newEntry, ...prev];
      // Limit history to the specified number of entries
      return newHistory.slice(0, limit);
    });
  };

  const clearHistory = () => {
    setHistory([]);
  };

  const removeEntry = (id: string) => {
    setHistory(prev => prev.filter(entry => entry.id !== id));
  };

  return {
    history,
    addToHistory,
    clearHistory,
    removeEntry,
  };
};