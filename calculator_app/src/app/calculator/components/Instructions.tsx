import React from 'react';

export const Instructions: React.FC = () => {
  return (
    <div className="mt-6 p-4 bg-blue-50 rounded-lg text-sm">
      <h3 className="font-bold text-lg mb-2 text-blue-800">How to Use This Calculator</h3>
      <ul className="list-disc pl-5 space-y-1 text-gray-700">
        <li>Basic operations: Use +, -, ×, ÷ for arithmetic</li>
        <li>Scientific functions: sin, cos, tan for trigonometric calculations</li>
        <li>Logarithms: log for base-10, ln for natural logarithm</li>
        <li>Square root: √ button or sqrt() function</li>
        <li>Constants: π for pi, e for Euler's number</li>
        <li>Powers: Use x² for squares or xʸ for custom powers</li>
        <li>Clear: C to clear current entry, AC to clear all</li>
        <li>History: Previous calculations are saved automatically</li>
      </ul>
      <div className="mt-3 pt-3 border-t border-blue-100">
        <p className="text-gray-600">
          <span className="font-semibold">Tip:</span> This calculator is designed for students working on algebra, 
          geometry, and other scientific calculations. All calculations are stored in your browser's local storage.
        </p>
      </div>
    </div>
  );
};