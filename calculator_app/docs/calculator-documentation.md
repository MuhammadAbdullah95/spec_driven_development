# Scientific Calculator Documentation

## Overview

This is a Next.js-based scientific calculator application designed for students to solve complex math problems including algebra, geometry, and other scientific operations. The app features a responsive UI, calculation history, and comprehensive mathematical functions.

## Features

- **Basic Operations**: Addition, subtraction, multiplication, division
- **Scientific Functions**: Trigonometric, logarithmic, exponential functions
- **Constants**: π (pi) and e (Euler's number)
- **History**: Calculation history with localStorage persistence
- **Error Handling**: Proper handling of mathematical errors
- **Accessibility**: ARIA labels and keyboard navigation support
- **Responsive Design**: Works on mobile, tablet, and desktop

## Technical Architecture

### File Structure
```
src/
├── app/                 # Next.js 15 App Router
│   ├── layout.tsx      # Root layout with theme support
│   ├── page.tsx        # Home page
│   └── calculator/     # Calculator feature
│       ├── page.tsx    # Calculator page
│       ├── components/ # UI components
│       └── hooks/      # Calculator logic hooks
├── components/         # Reusable UI components
├── contexts/           # React context providers
├── lib/               # Business logic and utilities
├── types/             # TypeScript type definitions
└── tests/             # Test files
```

### Core Components
- `Calculator.tsx`: Main calculator component
- `Display.tsx`: Visual display for input/output
- `ButtonGrid.tsx`: Grid of calculator buttons
- `HistoryPanel.tsx`: Shows calculation history

### Hooks
- `useCalculator.tsx`: Core calculator logic
- `useHistory.tsx`: Manages calculation history

### Utilities
- `calculator-engine.ts`: Core calculation engine using Math.js
- `math-utils.ts`: Math-related helper functions
- `constants.ts`: Application constants

## API

### Calculator Engine
The calculator engine provides:
- `evaluateExpression(string)`: Evaluates a mathematical expression
- `safeEvaluate(string)`: Safely evaluates with error handling

### History Service
The history service provides:
- `addEntry(expression, result)`: Adds a new entry to history
- `getEntries()`: Retrieves all history entries
- `clearEntries()`: Clears all history

## Error Handling

The calculator properly handles:
- Division by zero
- Invalid operations (e.g., square root of negative numbers)
- Overflow and underflow conditions
- Syntax errors in expressions

## Accessibility

- All buttons have proper ARIA labels
- Keyboard navigation support
- Screen reader compatibility
- High contrast mode support

## Testing

The application includes:
- Unit tests for calculation logic
- Integration tests for UI components
- Contract tests for services
- Performance tests for calculation speed
- E2E tests for user workflows