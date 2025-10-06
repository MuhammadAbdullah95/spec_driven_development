export interface Calculation {
  expression: string;
  result: number;
  timestamp: Date;
}

export interface CalculatorState {
  displayValue: string;
  previousValue: number | null;
  operation: string | null;
  waitingForOperand: boolean;
}

export interface HistoryEntry {
  id: string;
  expression: string;
  result: string;
  timestamp: Date;
}

export type Operation = 'add' | 'subtract' | 'multiply' | 'divide' | 'equals' | null;
export type ScientificFunction = 'sin' | 'cos' | 'tan' | 'log' | 'ln' | 'sqrt' | 'pow' | 'factorial';