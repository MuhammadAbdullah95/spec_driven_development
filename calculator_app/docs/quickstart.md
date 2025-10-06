# Quickstart Guide: Scientific Calculator App

## Getting Started

1. **Installation**: 
   ```bash
   npm install
   ```

2. **Development Server**:
   ```bash
   npm run dev
   ```
   Visit [http://localhost:3000](http://localhost:3000) to see the calculator.

3. **Building for Production**:
   ```bash
   npm run build
   npm start
   ```

## Basic Usage

### Performing Calculations
1. Click on number buttons (0-9) to input numbers
2. Use operation buttons (+, -, ×, ÷) to perform basic arithmetic
3. Press "=" or Enter to see the result
4. Use "C" to clear current entry or "AC" to clear all

### Scientific Functions
- **Trigonometry**: sin, cos, tan (uses degrees by default)
- **Logarithms**: log (base 10), ln (natural log)
- **Powers & Roots**: x² (square), xʸ (power), √ (square root)
- **Constants**: π (pi), e (Euler's number)

### Example Calculations
- Basic: `2 + 3 =` → 5
- Scientific: `sin(30) =` → 0.5
- Complex: `(2 + 3) * 4 =` → 20
- Logarithm: `log(100) =` → 2

## Testing the Application

### Unit Tests
```bash
npm run test:unit
```

### Integration Tests
```bash
npm run test:integration
```

### End-to-End Tests
```bash
npm run test:e2e
```

## Features Overview

1. **Responsive Design**: Works on mobile, tablet, and desktop
2. **Calculation History**: Previous calculations saved in localStorage
3. **Error Handling**: Displays appropriate error messages for invalid operations
4. **Accessibility**: Full keyboard navigation and screen reader support
5. **Performance**: Calculations complete within 200ms
6. **User Preferences**: Theme selection and precision settings

## Troubleshooting

### Common Issues
- **Division by Zero**: The calculator shows an error when dividing by zero
- **Invalid Operations**: Mathematical errors (like square root of negative numbers) are handled with error messages
- **Precision**: Results are displayed with high precision using BigNumber calculations

### Keyboard Shortcuts
- Numbers: 0-9
- Operations: +, -, *, /
- Equals: Enter or =
- Clear: Escape or C
- Scientific functions: Alt+S for sin, Alt+C for cos, Alt+T for tan

## Next Steps

1. Explore the scientific functions to solve complex math problems
2. Try algebraic expressions using parentheses
3. Use the history feature to review previous calculations
4. Customize the UI using theme options