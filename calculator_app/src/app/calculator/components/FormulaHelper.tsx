'use client';

import React, { useState } from 'react';

interface FormulaHelperProps {
  theme?: 'light' | 'dark' | 'student';
}

interface Formula {
  category: string;
  name: string;
  formula: string;
  description: string;
  example: string;
  variables: { [key: string]: string };
}

export const FormulaHelper: React.FC<FormulaHelperProps> = ({ theme = 'student' }) => {
  const [selectedCategory, setSelectedCategory] = useState<string>('geometry');
  const [selectedFormula, setSelectedFormula] = useState<Formula | null>(null);

  const formulas: Formula[] = [
    // Geometry
    {
      category: 'geometry',
      name: 'Circle Area',
      formula: 'A = πr²',
      description: 'Area of a circle',
      example: 'For r = 5: A = π × 5² = 78.54',
      variables: { 'A': 'Area', 'r': 'Radius', 'π': 'Pi (≈3.14159)' }
    },
    {
      category: 'geometry',
      name: 'Circle Circumference',
      formula: 'C = 2πr',
      description: 'Circumference of a circle',
      example: 'For r = 3: C = 2 × π × 3 = 18.85',
      variables: { 'C': 'Circumference', 'r': 'Radius', 'π': 'Pi (≈3.14159)' }
    },
    {
      category: 'geometry',
      name: 'Rectangle Area',
      formula: 'A = l × w',
      description: 'Area of a rectangle',
      example: 'For l = 8, w = 5: A = 8 × 5 = 40',
      variables: { 'A': 'Area', 'l': 'Length', 'w': 'Width' }
    },
    {
      category: 'geometry',
      name: 'Triangle Area',
      formula: 'A = ½bh',
      description: 'Area of a triangle',
      example: 'For b = 6, h = 4: A = ½ × 6 × 4 = 12',
      variables: { 'A': 'Area', 'b': 'Base', 'h': 'Height' }
    },
    
    // Algebra
    {
      category: 'algebra',
      name: 'Quadratic Formula',
      formula: 'x = (-b ± √(b² - 4ac)) / 2a',
      description: 'Solve quadratic equations ax² + bx + c = 0',
      example: 'For x² - 5x + 6 = 0: x = (5 ± √(25-24))/2 = 3 or 2',
      variables: { 'x': 'Solution', 'a': 'Coefficient of x²', 'b': 'Coefficient of x', 'c': 'Constant term' }
    },
    {
      category: 'algebra',
      name: 'Distance Formula',
      formula: 'd = √((x₂-x₁)² + (y₂-y₁)²)',
      description: 'Distance between two points',
      example: 'For (1,2) and (4,6): d = √((4-1)² + (6-2)²) = 5',
      variables: { 'd': 'Distance', 'x₁,y₁': 'First point', 'x₂,y₂': 'Second point' }
    },
    
    // Trigonometry
    {
      category: 'trigonometry',
      name: 'Pythagorean Theorem',
      formula: 'c² = a² + b²',
      description: 'Relationship in right triangles',
      example: 'For a = 3, b = 4: c = √(9 + 16) = 5',
      variables: { 'c': 'Hypotenuse', 'a': 'Side 1', 'b': 'Side 2' }
    },
    {
      category: 'trigonometry',
      name: 'Sine Rule',
      formula: 'a/sin(A) = b/sin(B) = c/sin(C)',
      description: 'Relationship between sides and angles',
      example: 'For triangle with a=5, A=30°, B=60°',
      variables: { 'a,b,c': 'Sides', 'A,B,C': 'Opposite angles' }
    },
    
    // Physics
    {
      category: 'physics',
      name: 'Velocity',
      formula: 'v = d/t',
      description: 'Velocity equals distance over time',
      example: 'For d = 100m, t = 10s: v = 100/10 = 10 m/s',
      variables: { 'v': 'Velocity', 'd': 'Distance', 't': 'Time' }
    },
    {
      category: 'physics',
      name: 'Force',
      formula: 'F = ma',
      description: 'Force equals mass times acceleration',
      example: 'For m = 5kg, a = 2m/s²: F = 5 × 2 = 10N',
      variables: { 'F': 'Force (Newtons)', 'm': 'Mass (kg)', 'a': 'Acceleration (m/s²)' }
    }
  ];

  const categories = Array.from(new Set(formulas.map(f => f.category)));
  const categoryFormulas = formulas.filter(f => f.category === selectedCategory);

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
      <h3 className="font-bold text-lg mb-4 flex items-center">
        <span className="mr-2">📐</span>
        Formula Helper
      </h3>

      {/* Category Selection */}
      <div className="flex flex-wrap gap-2 mb-4">
        {categories.map(category => (
          <button
            key={category}
            onClick={() => {
              setSelectedCategory(category);
              setSelectedFormula(null);
            }}
            className={`px-3 py-1 rounded-lg text-sm font-medium transition-colors capitalize ${
              selectedCategory === category
                ? 'bg-indigo-500 text-white'
                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
            }`}
          >
            {category}
          </button>
        ))}
      </div>

      {/* Formula List */}
      <div className="space-y-2 mb-4">
        {categoryFormulas.map((formula, index) => (
          <button
            key={index}
            onClick={() => setSelectedFormula(formula)}
            className={`w-full text-left p-3 rounded-lg border transition-colors ${
              selectedFormula?.name === formula.name
                ? 'border-indigo-500 bg-indigo-50'
                : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
            }`}
          >
            <div className="font-semibold">{formula.name}</div>
            <div className="text-sm text-gray-600 font-mono">{formula.formula}</div>
          </button>
        ))}
      </div>

      {/* Formula Details */}
      {selectedFormula && (
        <div className="border-t pt-4">
          <h4 className="font-bold text-lg mb-2">{selectedFormula.name}</h4>
          <div className="bg-gray-100 rounded-lg p-3 mb-3">
            <div className="text-2xl font-mono text-center text-indigo-600">
              {selectedFormula.formula}
            </div>
          </div>
          
          <p className="text-gray-700 mb-3">{selectedFormula.description}</p>
          
          <div className="mb-3">
            <h5 className="font-semibold mb-2">Variables:</h5>
            <div className="space-y-1">
              {Object.entries(selectedFormula.variables).map(([variable, meaning]) => (
                <div key={variable} className="flex">
                  <span className="font-mono bg-gray-200 px-2 py-1 rounded mr-2 text-sm">
                    {variable}
                  </span>
                  <span className="text-sm text-gray-600">{meaning}</span>
                </div>
              ))}
            </div>
          </div>
          
          <div className="bg-green-50 border border-green-200 rounded-lg p-3">
            <h5 className="font-semibold text-green-800 mb-1">Example:</h5>
            <p className="text-green-700 text-sm">{selectedFormula.example}</p>
          </div>
        </div>
      )}

      {!selectedFormula && (
        <div className="text-center py-8 text-gray-500">
          <div className="text-4xl mb-2">📚</div>
          <p>Select a formula to see details and examples</p>
        </div>
      )}
    </div>
  );
};
