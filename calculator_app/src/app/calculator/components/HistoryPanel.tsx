'use client';

import React from 'react';
import { HistoryEntry } from '@/types/calculator';

interface HistoryPanelProps {
  entries: HistoryEntry[];
  onClearHistory: () => void;
  onUseEntry?: (expression: string) => void;
}

export const HistoryPanel: React.FC<HistoryPanelProps> = ({ 
  entries, 
  onClearHistory,
  onUseEntry
}) => {
  if (entries.length === 0) {
    return (
      <div className="bg-gray-50 p-4 rounded-lg shadow mt-4">
        <h3 className="font-bold text-lg mb-2">Calculation History</h3>
        <p className="text-gray-500 italic">No calculation history yet</p>
        <button 
          onClick={onClearHistory}
          className="mt-2 bg-red-500 hover:bg-red-600 text-white px-3 py-1 rounded text-sm"
        >
          Clear History
        </button>
      </div>
    );
  }

  return (
    <div className="bg-gray-50 p-4 rounded-lg shadow mt-4">
      <div className="flex justify-between items-center mb-2">
        <h3 className="font-bold text-lg">Calculation History</h3>
        <button 
          onClick={onClearHistory}
          className="bg-red-500 hover:bg-red-600 text-white px-3 py-1 rounded text-sm"
        >
          Clear History
        </button>
      </div>
      
      <div className="max-h-60 overflow-y-auto">
        {entries.map((entry) => (
          <div 
            key={entry.id} 
            className="py-2 border-b border-gray-200 hover:bg-gray-100 cursor-pointer"
            onClick={() => onUseEntry && onUseEntry(entry.expression)}
          >
            <div className="flex justify-between">
              <span className="font-mono text-sm">{entry.expression} =</span>
              <span className="font-semibold">{entry.result}</span>
            </div>
            <div className="text-xs text-gray-500">
              {entry.timestamp.toLocaleTimeString()}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};