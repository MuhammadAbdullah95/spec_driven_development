import Link from 'next/link';

export default function HomePage() {
  return (
    <div className="flex flex-col items-center justify-center w-full max-w-md">
      <h1 className="text-3xl font-bold text-center mb-6 text-indigo-700">Scientific Calculator</h1>
      <p className="text-center mb-8 text-gray-600">
        A powerful calculator for solving complex math problems in algebra, geometry, 
        and other scientific operations.
      </p>
      
      <Link 
        href="/calculator" 
        className="bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-3 px-6 rounded-lg shadow-lg transition-colors"
      >
        Open Calculator
      </Link>
      
      <div className="mt-10 text-sm text-gray-500 text-center">
        <p>Features:</p>
        <ul className="list-disc list-inside mt-2 text-left max-w-xs">
          <li>Basic arithmetic operations</li>
          <li>Trigonometric functions</li>
          <li>Logarithms and exponents</li>
          <li>Calculation history</li>
          <li>Student-friendly UI</li>
        </ul>
      </div>
    </div>
  );
}