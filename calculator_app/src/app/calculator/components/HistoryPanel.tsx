'use client';

import React from 'react';
import { HistoryEntry } from '@/types/calculator';

interface HistoryPanelProps {
  entries: HistoryEntry[];
  onClearHistory: () => void;
  onUseEntry?: (expression: string) => void;
  theme?: 'light' | 'dark' | 'student';
}

export const HistoryPanel: React.FC<HistoryPanelProps> = ({ 
  entries, 
  onClearHistory,
  onUseEntry,
  theme = 'student'
}) => {
  const getThemeClasses = () => {
    switch (theme) {
      case 'dark':
        return 'bg-gray-800 text-white border-gray-700';
      case 'light':
        return 'bg-white text-gray-900 border-gray-200';
      case 'student':
        return 'bg-white text-gray-900 border-purple-200';
      default:
        return 'bg-white text-gray-900 border-purple-200';
    }
  };

  return (
    <div className={`${getThemeClasses()} rounded-xl shadow-lg p-4 border-2`}>
      <div className="flex justify-between items-center mb-3">
        <h3 className="font-bold text-lg flex items-center">
          <span className="mr-2">📜</span>
          Calculation History
        </h3>
        <button 
          onClick={onClearHistory}
          className="bg-red-500 hover:bg-red-600 text-white px-3 py-1 rounded-lg text-sm transition-colors"
        >
          Clear History
        </button>
      </div>
      
      {entries.length === 0 ? (
        <div className="text-center py-8 text-gray-500">
          <div className="text-4xl mb-2">📝</div>
          <p>No calculation history yet</p>
          <p className="text-sm mt-1">Your calculations will appear here</p>
        </div>
      ) : (
        <div className="max-h-60 overflow-y-auto space-y-2">
          {entries.map((entry) => (
            <div 
              key={entry.id} 
              className={`p-3 rounded-lg border transition-colors cursor-pointer ${
                theme === 'dark' 
                  ? 'border-gray-600 hover:bg-gray-700' 
                  : 'border-gray-200 hover:bg-gray-50'
              }`}
              onClick={() => onUseEntry && onUseEntry(entry.expression)}
            >
              <div className="flex justify-between items-center">
                <span className="font-mono text-sm">{entry.expression} =</span>
                <span className="font-semibold text-indigo-600">{entry.result}</span>
              </div>
              <div className="text-xs text-gray-500 mt-1">
                {entry.timestamp.toLocaleTimeString()}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};