'use client';

import React, { useState } from 'react';

interface StepByStepSolverProps {
  expression: string;
  result: string;
  theme?: 'light' | 'dark' | 'student';
}

interface SolutionStep {
  step: number;
  description: string;
  expression: string;
  explanation: string;
}

export const StepByStepSolver: React.FC<StepByStepSolverProps> = ({ 
  expression, 
  result, 
  theme = 'student' 
}) => {
  const [showSteps, setShowSteps] = useState(false);

  const generateSteps = (expr: string): SolutionStep[] => {
    const steps: SolutionStep[] = [];
    
    // Simple step generation for basic operations
    if (expr.includes('+') || expr.includes('-') || expr.includes('*') || expr.includes('/')) {
      steps.push({
        step: 1,
        description: "Original Expression",
        expression: expr,
        explanation: "This is the expression we need to solve."
      });

      // Check for scientific functions
      if (expr.includes('sin') || expr.includes('cos') || expr.includes('tan')) {
        steps.push({
          step: 2,
          description: "Evaluate Trigonometric Functions",
          expression: expr,
          explanation: "Calculate the trigonometric functions first (remember: angles are in degrees)."
        });
      }

      // Check for parentheses
      if (expr.includes('(') && expr.includes(')')) {
        steps.push({
          step: steps.length + 1,
          description: "Solve Parentheses First",
          expression: expr,
          explanation: "Following order of operations (PEMDAS), solve expressions in parentheses first."
        });
      }

      // Check for multiplication/division
      if (expr.includes('*') || expr.includes('/')) {
        steps.push({
          step: steps.length + 1,
          description: "Multiplication and Division",
          expression: expr,
          explanation: "Perform multiplication and division from left to right."
        });
      }

      // Check for addition/subtraction
      if (expr.includes('+') || expr.includes('-')) {
        steps.push({
          step: steps.length + 1,
          description: "Addition and Subtraction",
          expression: expr,
          explanation: "Finally, perform addition and subtraction from left to right."
        });
      }

      steps.push({
        step: steps.length + 1,
        description: "Final Answer",
        expression: result,
        explanation: "This is our final result!"
      });
    }

    return steps;
  };

  const steps = generateSteps(expression);

  const getThemeClasses = () => {
    switch (theme) {
      case 'dark':
        return 'bg-gray-800 text-white border-gray-700';
      case 'light':
        return 'bg-white text-gray-900 border-gray-200';
      case 'student':
        return 'bg-gradient-to-br from-blue-50 to-purple-50 text-gray-900 border-purple-200';
      default:
        return 'bg-gradient-to-br from-blue-50 to-purple-50 text-gray-900 border-purple-200';
    }
  };

  if (!expression || expression === '0' || steps.length <= 1) {
    return null;
  }

  return (
    <div className={`${getThemeClasses()} rounded-xl shadow-lg p-4 border-2`}>
      <div className="flex items-center justify-between mb-3">
        <h3 className="font-bold text-lg flex items-center">
          <span className="mr-2">🧠</span>
          Step-by-Step Solution
        </h3>
        <button
          onClick={() => setShowSteps(!showSteps)}
          className="bg-indigo-500 hover:bg-indigo-600 text-white px-3 py-1 rounded-lg text-sm transition-colors"
        >
          {showSteps ? 'Hide Steps' : 'Show Steps'}
        </button>
      </div>

      {showSteps && (
        <div className="space-y-3">
          {steps.map((step, index) => (
            <div key={index} className="border-l-4 border-indigo-400 pl-4 py-2">
              <div className="flex items-center mb-1">
                <span className="bg-indigo-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-sm font-bold mr-2">
                  {step.step}
                </span>
                <span className="font-semibold text-indigo-700">{step.description}</span>
              </div>
              <div className="bg-gray-100 rounded-lg p-2 font-mono text-lg mb-1">
                {step.expression}
              </div>
              <p className="text-sm text-gray-600 italic">
                💡 {step.explanation}
              </p>
            </div>
          ))}
        </div>
      )}

      {!showSteps && (
        <div className="text-center py-4">
          <div className="text-2xl mb-2">🎯</div>
          <p className="text-gray-600">Click "Show Steps" to see how this problem was solved!</p>
        </div>
      )}
    </div>
  );
};
