# 🧮 Student Calculator Pro

A comprehensive, educational scientific calculator built with Next.js, designed specifically for students to learn mathematics, science, and problem-solving skills while performing calculations.

![Student Calculator Pro](https://img.shields.io/badge/Next.js-15.5.4-black?style=for-the-badge&logo=next.js)
![TypeScript](https://img.shields.io/badge/TypeScript-5.0-blue?style=for-the-badge&logo=typescript)
![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-3.0-38B2AC?style=for-the-badge&logo=tailwind-css)

## ✨ Features

### 🎯 **Four Calculator Modes**

#### 🔢 **Basic Calculator**
- Standard arithmetic operations (+, -, ×, ÷)
- Colorful gradient buttons for visual appeal
- Order of operations (PEMDAS) support
- Clear (C) and All Clear (AC) functions

#### 🧪 **Scientific Calculator**
- **Trigonometric Functions**: sin, cos, tan, asin, acos, atan
- **Logarithmic Functions**: log (base 10), ln (natural log)
- **Power Functions**: x², xʸ, √, 1/x
- **Constants**: π (pi), e (Euler's number)
- **Parentheses**: Support for complex expressions
- Degree-based trigonometric calculations

#### 📊 **Graphing Calculator**
- Function plotting capabilities
- Advanced scientific functions
- Graphing utilities (plot, zoom, trace)
- Function variables (f(x), g(x), h(x))

#### 🔄 **Unit Converter**
- **Length**: mm, cm, m, km, in, ft, yd, mi
- **Weight**: mg, g, kg, oz, lb, tons
- **Temperature**: °C, °F, K
- **Volume**: ml, L, m³, fl oz, cups, pt, qt, gal
- **Area**: mm², cm², m², km², in², ft², acres
- Real-time conversion with examples

### 📚 **Educational Features**

#### 🧠 **Step-by-Step Solver**
- Detailed solution breakdown for calculations
- Explains order of operations (PEMDAS)
- Educational explanations for each step
- Helps students understand the "why" behind calculations

#### 📐 **Formula Helper**
- **5 Categories**: Geometry, Algebra, Trigonometry, Physics, Area
- Interactive formula browser with examples
- Variable explanations and real-world applications
- Common formulas: Circle area, Pythagorean theorem, Quadratic formula, etc.

#### 💡 **Smart Study Tips**
- Context-aware tips for each calculator mode
- Memory aids for common values and conversions
- Educational content that helps students learn while calculating

#### 📜 **Calculation History**
- Persistent history with localStorage
- Click to reuse previous calculations
- Timestamp tracking for review sessions

### 🎨 **Themes & Design**

#### **Three Beautiful Themes:**
- ☀️ **Light Theme**: Clean, professional appearance
- 🌙 **Dark Theme**: Easy on the eyes for extended use
- 🎓 **Student Theme**: Colorful gradients and engaging design

#### **Modern UI Features:**
- Responsive design for all screen sizes
- Smooth animations and hover effects
- Emoji icons for approachable interface
- Visual feedback with button highlighting

## 🚀 Getting Started

### Prerequisites
- Node.js 18+ 
- npm, yarn, pnpm, or bun

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd calculator_app
   ```

2. **Install dependencies**
   ```bash
   npm install
   # or
   yarn install
   # or
   pnpm install
   ```

3. **Run the development server**
   ```bash
   npm run dev
   # or
   yarn dev
   # or
   pnpm dev
   ```

4. **Open your browser**
   Navigate to [http://localhost:3000](http://localhost:3000)

## 📖 How to Use

### **Basic Calculations**
1. Select the **🔢 Basic** tab
2. Click numbers and operators to build expressions
3. Press **=** to calculate results
4. Use **AC** to clear everything, **C** to clear current entry

### **Scientific Functions**
1. Switch to **🧪 Scientific** tab
2. Enter a number (e.g., `30`)
3. Click a function (e.g., `sin`)
4. Press **=** to see the result
5. View step-by-step solution in the side panel

### **Unit Conversion**
1. Go to **🔄 Converter** tab
2. Select conversion category (Length, Weight, etc.)
3. Enter value in the "From" field
4. Choose units from dropdowns
5. See real-time conversion results

### **Formula Reference**
1. Use **🧪 Scientific** or **📊 Graphing** modes
2. Check the **📐 Formula Helper** in the side panel
3. Browse categories and click formulas for details
4. See examples and variable explanations

## 🛠️ Technical Details

### **Built With**
- **Framework**: Next.js 15.5.4 with App Router
- **Language**: TypeScript for type safety
- **Styling**: Tailwind CSS for responsive design
- **Math Engine**: Custom calculator engine with mathjs integration
- **State Management**: React hooks and context

### **Key Components**
- `Calculator.tsx` - Main calculator interface with tab navigation
- `ButtonGrid.tsx` - Dynamic button layouts for different modes
- `Display.tsx` - Enhanced display with theme support
- `StepByStepSolver.tsx` - Educational solution breakdown
- `FormulaHelper.tsx` - Interactive formula reference
- `UnitConverter.tsx` - Comprehensive unit conversion tool
- `HistoryPanel.tsx` - Calculation history management

### **Architecture**
```
src/
├── app/
│   ├── calculator/
│   │   ├── components/     # React components
│   │   ├── hooks/          # Custom React hooks
│   │   └── page.tsx        # Main calculator page
├── lib/                    # Utility functions
│   ├── calculator-engine.ts
│   ├── math-utils.ts
│   └── geometry-utils.ts
└── types/                  # TypeScript definitions
```

## 🎓 Educational Benefits

### **For Students**
- **Visual Learning**: Color-coded buttons and clear displays
- **Step-by-Step Understanding**: See how problems are solved
- **Formula Reference**: Quick access to important formulas
- **Unit Practice**: Learn conversions through hands-on use
- **Error Learning**: Clear, educational error messages

### **For Teachers**
- **Classroom Tool**: Project for whole-class demonstrations
- **Homework Helper**: Students can check their work
- **Concept Reinforcement**: Built-in formulas and explanations
- **Multi-Subject Support**: Math, Physics, Chemistry applications

## 🔧 Customization

### **Adding New Functions**
1. Update `ButtonGrid.tsx` with new button
2. Add function logic in `useCalculator.tsx`
3. Update `Calculator.tsx` button handler
4. Add to formula helper if educational

### **Theme Customization**
Modify theme classes in component files:
- `getThemeClasses()` functions in each component
- Tailwind CSS classes for colors and styles
- Add new themes in the theme selector

## 🐛 Troubleshooting

### **Common Issues**
- **Hydration Errors**: Ensure localStorage access is client-side only
- **Calculation Errors**: Check expression formatting and parentheses
- **Theme Issues**: Clear browser cache and localStorage
- **Performance**: Limit history entries and optimize re-renders

## 📱 Browser Support

- ✅ Chrome 90+
- ✅ Firefox 88+
- ✅ Safari 14+
- ✅ Edge 90+
- ✅ Mobile browsers (iOS Safari, Chrome Mobile)

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- Built with [Next.js](https://nextjs.org/) and [React](https://reactjs.org/)
- Styled with [Tailwind CSS](https://tailwindcss.com/)
- Math calculations powered by [mathjs](https://mathjs.org/)
- Icons and emojis for enhanced user experience

## 📞 Support

If you encounter any issues or have questions:
1. Check the troubleshooting section above
2. Search existing issues in the repository
3. Create a new issue with detailed description
4. Include browser version and steps to reproduce

---

**Made with ❤️ for students and educators worldwide**

*Transform the way students learn mathematics with an interactive, educational calculator experience!*